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

        const pptxUrl = template.download_url || template.image_url;
        setDeliverableUrl(pptxUrl);

        // Auto-trigger browser download for client immediately upon successful payment
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

        try {
          // Record order in public.orders
          await supabase.from("orders").insert([
            {
              order_reference: `TPL-${template.code}-${Date.now().toString().slice(-4)}`,
              service_type: `Master Presentation Deck: ${template.title}`,
              slide_count: `${template.slides_count || 30}`,
              timeline: "Instant Deliverable via Email & Direct Download",
              formats: ["Master PowerPoint (.pptx)"],
              project_brief: `Payment ID: ${payment.razorpay_payment_id}. Deliverable dispatched to: ${clientEmail}`,
              full_name: clientName,
              email: clientEmail,
              status: "completed"
            }
          ]);

          // Update client profile ledger if registered
          const { data: prof } = await supabase
            .from("profiles")
            .select("purchased_items, usage_history, credits_used, credits_balance")
            .eq("email", clientEmail)
            .maybeSingle();

          const newItem = {
            id: template.id,
            slug: template.code,
            code: template.code,
            title: template.title,
            category: template.category,
            slides_count: template.slides_count,
            formats: ["Master PowerPoint (.pptx)"],
            amount: priceNum,
            currency,
            download_url: pptxUrl,
            purchased_at: new Date().toISOString()
          };

          const newUsage = {
            item_title: template.title,
            credits_used: 1,
            action: "Master PowerPoint (.pptx) Commercial License",
            date: new Date().toISOString()
          };

          if (prof) {
            const currentItems = Array.isArray(prof.purchased_items) ? prof.purchased_items : [];
            const currentUsage = Array.isArray(prof.usage_history) ? prof.usage_history : [];
            await supabase
              .from("profiles")
              .update({
                purchased_items: [newItem, ...currentItems],
                usage_history: [newUsage, ...currentUsage]
              })
              .eq("email", clientEmail);
          }
        } catch (e) {
          console.warn("Order record update notice:", e);
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
