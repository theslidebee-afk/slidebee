import { useState } from "react";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { sendTemplatePurchaseReceiptEmail } from "../../lib/email";
import { supabase } from "../../lib/supabase";
import { type StoreTemplate } from "./useStudioStore";

export interface CheckoutResult {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  isCreditRedemption?: boolean;
}

/**
 * Deep Module: useTemplateCheckout
 * 
 * Public Interface:
 * - isProcessing: Boolean state during checkout or redemption
 * - isPurchased: Boolean status indicating completed purchase
 * - purchasedClientEmail: Client email associated with completed transaction
 * - deliverableUrl: Direct Master PowerPoint (.pptx) download link
 * - error: Any failure message
 * - executeCreditRedemption(template, clientEmail): Atomically claims template with starter credits
 * - executeRazorpayCheckout(template, currency, clientEmail, clientName): Initiates Razorpay payment
 */
export function useTemplateCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasedClientEmail, setPurchasedClientEmail] = useState("");
  const [deliverableUrl, setDeliverableUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Starter Credit Redemption (Atomic Postgres RPC)
  const executeCreditRedemption = async (
    template: StoreTemplate,
    clientEmail: string
  ): Promise<CheckoutResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!clientEmail) {
        throw new Error("Please log in to use your starter design credits.");
      }

      if (!template.is_credit_eligible) {
        throw new Error("This template is not eligible for free starter credits. Starter credits apply strictly to tagged free templates.");
      }

      const { data, error: rpcErr } = await supabase.rpc("fn_redeem_template_credit", {
        p_user_email: clientEmail,
        p_template_id: template.id
      });

      if (rpcErr) throw rpcErr;

      if (!data?.success) {
        throw new Error(data?.message || "Credit redemption failed.");
      }

      const pptxUrl = data.download_url || template.download_url || template.image_url;
      setIsPurchased(true);
      setPurchasedClientEmail(clientEmail);
      setDeliverableUrl(pptxUrl);

      // Auto-trigger browser download for client
      if (typeof window !== "undefined" && pptxUrl) {
        try {
          const dlLink = document.createElement("a");
          dlLink.href = pptxUrl;
          dlLink.download = template.file_name || `${template.code}_Master.pptx`;
          dlLink.target = "_blank";
          document.body.appendChild(dlLink);
          dlLink.click();
          document.body.removeChild(dlLink);
        } catch (dlErr) {
          console.warn("Auto-download notice:", dlErr);
        }
      }

      // Trigger deliverable email asynchronously in background (non-blocking)
      sendTemplatePurchaseReceiptEmail({
        clientEmail,
        clientName: clientEmail.split("@")[0],
        templateTitle: template.title,
        templateCode: template.code,
        downloadUrl: pptxUrl.startsWith("http") ? pptxUrl : `https://theslidebee.com${pptxUrl}`,
        amountPaid: 0,
        currency: "INR"
      }).catch(err => console.warn("Receipt email dispatch notice:", err));

      return {
        success: true,
        message: data.message,
        downloadUrl: pptxUrl,
        isCreditRedemption: true
      };
    } catch (err: any) {
      setError(err.message || "Failed to redeem credits.");
      return { success: false, message: err.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Razorpay Checkout Flow (Payment Gateway Integration)
  const executeRazorpayCheckout = async (
    template: StoreTemplate,
    currency: "USD" | "INR",
    clientEmail: string,
    clientName: string
  ): Promise<void> => {
    setIsProcessing(true);
    setError(null);

    const priceNum = currency === "USD" ? template.price_usd : template.price_inr;

    await openRazorpayCheckout({
      amount: priceNum,
      currency,
      title: template.title,
      description: `Master PowerPoint Presentation (.pptx) — ${template.code}`,
      prefill: {
        email: clientEmail,
        name: clientName
      },
      onSuccess: async (payment) => {
        setIsProcessing(false);
        setIsPurchased(true);
        setPurchasedClientEmail(clientEmail);

        const orderRef = `TPL-${template.code}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        let pptxUrl = template.image_url;
        let fileName = template.file_name || `${template.code}_Master.pptx`;

        try {
          let fulfilled = false;

          // 1. Fulfill order via serverless backend endpoint
          try {
            const apiRes = await fetch("/api/fulfill-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderRef,
                paymentId: payment.razorpay_payment_id,
                templateId: template.id,
                clientEmail,
                clientName,
                currency,
                amount: priceNum,
              }),
            });

            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData?.success && apiData.download_url) {
                pptxUrl = apiData.download_url;
                if (apiData.file_name) fileName = apiData.file_name;
                fulfilled = true;
              }
            }
          } catch (apiErr) {
            console.warn("Backend order fulfillment notice, falling back to direct RPC:", apiErr);
          }

          // 2. Direct Supabase RPC fallback
          if (!fulfilled) {
            const { data: fulfillData, error: fulfillErr } = await supabase.rpc("fn_fulfill_template_order", {
              p_order_ref: orderRef,
              p_payment_id: payment.razorpay_payment_id,
              p_template_id: template.id,
              p_client_email: clientEmail,
              p_client_name: clientName,
              p_currency: currency,
              p_amount: priceNum
            });

            if (fulfillData?.success && fulfillData.download_url) {
              pptxUrl = fulfillData.download_url;
              if (fulfillData.file_name) fileName = fulfillData.file_name;
            } else if (fulfillErr) {
              console.warn("Fulfillment RPC notice:", fulfillErr);
            }
          }
        } catch (e) {
          console.warn("Order fulfillment exception:", e);
        }

        setDeliverableUrl(pptxUrl);

        // Auto-trigger browser download for client immediately upon successful payment
        if (typeof window !== "undefined" && pptxUrl) {
          try {
            const dlLink = document.createElement("a");
            dlLink.href = pptxUrl;
            dlLink.download = fileName;
            dlLink.target = "_blank";
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
          } catch (dlErr) {
            console.warn("Auto-download notice:", dlErr);
          }
        }

        // Send confirmation receipt & master files asynchronously in background
        sendTemplatePurchaseReceiptEmail({
          clientEmail,
          clientName,
          templateTitle: template.title,
          templateCode: template.code,
          downloadUrl: pptxUrl.startsWith("http") ? pptxUrl : `https://theslidebee.com${pptxUrl}`,
          amountPaid: priceNum,
          currency
        }).catch(err => console.warn("Receipt email notice:", err));
      },
      onFailure: (err) => {
        setIsProcessing(false);
        setError(err.message || "Payment cancelled or failed.");
      },
      onDismiss: () => {
        setIsProcessing(false);
      }
    });
  };

  return {
    isProcessing,
    isPurchased,
    purchasedClientEmail,
    deliverableUrl,
    error,
    executeCreditRedemption,
    executeRazorpayCheckout
  };
}
