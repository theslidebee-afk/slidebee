import { useState } from "react";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { type StoreTemplate } from "./useStudioStore";
import { redeemProTemplateDownload } from "./proRedemptionHelper";
import { getTemplateDeliverableUrl, triggerPptxDownload, isValidPptxUrl } from "../../lib/templates";

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

      const pptxUrl = (data.downloadUrl && isValidPptxUrl(data.downloadUrl)) ? data.downloadUrl : getTemplateDeliverableUrl(template);
      setIsPurchased(true);
      setPurchasedClientEmail(clientEmail);
      setDeliverableUrl(pptxUrl || undefined);

      // Auto-trigger browser download for client if verified deliverable is available
      if (typeof window !== "undefined" && pptxUrl) {
        try {
          triggerPptxDownload(`/api/download?id=${encodeURIComponent(template.id || template.code)}`, data.fileName || template.file_name || `${template.code}_Master.pptx`);
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
    clientName: string,
    promotionCode?: string
  ): Promise<void> => {
    setIsProcessing(true);
    setError(null);

    const rawPrice = currency === "USD" ? template.price_usd : template.price_inr;
    let priceNum = rawPrice;
    let serverOrderId: string | undefined;
    let serverKeyId: string | undefined;

    // Create server-authoritative order with locked pricing and promotion validation
    try {
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "template",
          targetId: String(template.id || template.code),
          currency,
          promotionCode: promotionCode ? promotionCode.trim().toUpperCase() : undefined,
          userEmail: clientEmail,
        }),
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.success && orderData.orderId) {
          serverOrderId = orderData.orderId;
          priceNum = orderData.amount;
          if (orderData.keyId) serverKeyId = orderData.keyId;
        }
      }
    } catch (orderErr) {
      console.warn("Server order generation notice, falling back:", orderErr);
    }

    await openRazorpayCheckout({
      amount: priceNum,
      orderId: serverOrderId,
      keyId: serverKeyId,
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
        let downloadToken = "";
        let fileName = template.file_name || `${template.code}_Master.pptx`;

        try {
          const apiRes = await fetch("/api/fulfill-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderRef,
              paymentId: payment.razorpay_payment_id,
              orderId: payment.razorpay_order_id || serverOrderId,
              signature: payment.razorpay_signature,
              promotionCode: promotionCode ? promotionCode.trim().toUpperCase() : undefined,
              templateId: template.id,
              clientEmail,
              clientName,
              currency,
              amount: priceNum,
            }),
          });

          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData?.success && apiData.download_token) {
              downloadToken = apiData.download_token;
              if (apiData.file_name) fileName = apiData.file_name;
            }
          }
        } catch (apiErr) {
          console.warn("Backend order fulfillment notice:", apiErr);
        }

        // Secure download endpoint using single-use token (zero storage URL exposure)
        const downloadEndpoint = downloadToken
          ? `/api/download?id=${encodeURIComponent(template.id || template.code)}&token=${encodeURIComponent(downloadToken)}`
          : null;

        setDeliverableUrl(downloadEndpoint);

        // Auto-trigger browser download once using the single-use token
        if (typeof window !== "undefined" && downloadEndpoint) {
          try {
            const dlLink = document.createElement("a");
            dlLink.href = downloadEndpoint;
            dlLink.download = fileName;
            document.body.appendChild(dlLink);
            dlLink.click();
            document.body.removeChild(dlLink);
          } catch (dlErr) {
            console.warn("Auto-download notice:", dlErr);
          }
        }
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
