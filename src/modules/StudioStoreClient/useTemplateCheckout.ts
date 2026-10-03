import { useState } from "react";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { sendTemplatePurchaseReceiptEmail } from "../../lib/email";
import { d1 } from "../../lib/d1";
import { type StoreTemplate } from "./useStudioStore";
import { redeemProTemplateDownload } from "./proRedemptionHelper";

export interface CheckoutResult {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  isCreditRedemption?: boolean;
}

export function useTemplateCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasedClientEmail, setPurchasedClientEmail] = useState("");
  const [deliverableUrl, setDeliverableUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Template Entitlement Download (Free 3/day, Pro 30/mo, Lifetime 45/mo)
  const executeCreditRedemption = async (
    template: StoreTemplate,
    clientEmail: string
  ): Promise<CheckoutResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!clientEmail) {
        throw new Error("Please log in to download this presentation template.");
      }

      const res = await fetch("/api/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          userEmail: clientEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Download entitlement check failed.");
      }

      const pptxUrl = data.downloadUrl || template.download_url || template.image_url;
      setIsPurchased(true);
      setPurchasedClientEmail(clientEmail);
      setDeliverableUrl(pptxUrl);

      // Auto-trigger browser download for client
      if (typeof window !== "undefined" && pptxUrl) {
        try {
          const dlLink = document.createElement("a");
          dlLink.href = pptxUrl;
          dlLink.download = data.fileName || template.file_name || `${template.code}_Master.pptx`;
          dlLink.target = "_blank";
          document.body.appendChild(dlLink);
          dlLink.click();
          document.body.removeChild(dlLink);
        } catch (dlErr) {
          console.warn("Auto-download notice:", dlErr);
        }
      }

      return {
        success: true,
        message: data.message || "Template download unlocked successfully.",
        downloadUrl: pptxUrl,
        isCreditRedemption: true
      };
    } catch (err: any) {
      setError(err.message || "Failed to download template.");
      return { success: false, message: err.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Pro Membership Template Download
  const executeProTemplateDownload = async (
    template: StoreTemplate,
    clientEmail: string
  ): Promise<CheckoutResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await redeemProTemplateDownload(template, clientEmail);
      if (result.success && result.downloadUrl) {
        setIsPurchased(true);
        setPurchasedClientEmail(clientEmail);
        setDeliverableUrl(result.downloadUrl);
      }
      return result;
    } catch (err: any) {
      setError(err.message || "Pro download failed.");
      return { success: false, message: err.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Razorpay Checkout Flow (Payment Gateway Integration)
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

          if (!fulfilled) {
            const { data: fulfillData, error: fulfillErr } = await d1.rpc("fn_fulfill_template_order", {
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
    executeProTemplateDownload,
    executeRazorpayCheckout
  };
}
