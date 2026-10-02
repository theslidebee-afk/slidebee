import { useState } from "react";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { sendTemplatePurchaseReceiptEmail } from "../../lib/email";
import { d1 } from "../../lib/d1";
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
 * - executeCreditRedemption(template, clientEmail): Atomically claims eligible template via account entitlement quota
 * - executeRazorpayCheckout(template, currency, clientEmail, clientName): Initiates Razorpay payment
 */
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

  // 2. Pro Membership Template Download (30 Monthly Quota - Applies to ANY template)
  const executeProTemplateDownload = async (
    template: StoreTemplate,
    clientEmail: string
  ): Promise<CheckoutResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!clientEmail) {
        throw new Error("Please log in to your Pro account to download templates.");
      }

      let data: any = null;
      let usedEdgeApi = false;

      try {
        const res = await fetch("/api/redeem-pro-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientEmail,
            templateId: template.id
          })
        });

        if (res.ok) {
          const resJson = await res.json();
          if (resJson && resJson.success) {
            data = resJson;
            usedEdgeApi = true;
          } else if (resJson && resJson.error) {
            throw new Error(resJson.error);
          }
        } else if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Pro download quota exhausted.");
        }
      } catch (edgeErr: any) {
        if (edgeErr.message?.includes("quota") || edgeErr.message?.includes("consumed") || edgeErr.message?.includes("expired")) {
          throw edgeErr;
        }
        console.warn("Redeem API notice, attempting direct database fallback:", edgeErr);
      }

      if (!usedEdgeApi) {
        // Fallback directly via D1 client for dev or direct environments
        const cleanEmail = clientEmail.trim().toLowerCase();
        const { data: sub } = await d1
          .from("subscriptions")
          .select("*")
          .eq("user_email", cleanEmail)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: profile } = await d1
          .from("profiles")
          .select("*")
          .eq("email", cleanEmail)
          .maybeSingle();

        const isPro = Boolean(sub || (profile?.tier && ["monthly", "yearly", "lifetime"].includes(profile.tier)));
        if (!isPro) {
          throw new Error("An active Pro membership is required to unlock this template.");
        }

        const isMonthly = sub?.plan_name?.toLowerCase().includes("monthly") || profile?.tier === "monthly";
        const subLimit = Number(sub?.slides_limit || 0);
        const quotaLimit = Number(
          subLimit > 0
            ? (isMonthly && subLimit < 30 ? 30 : subLimit)
            : (profile?.tier === "yearly" ? 360 : profile?.tier === "lifetime" ? 45 : 30)
        );
        const quotaUsed = Number(sub?.slides_used !== undefined ? sub.slides_used : (profile?.downloads_this_month || 0));
        const quotaRemaining = Math.max(0, quotaLimit - quotaUsed);

        if (quotaRemaining <= 0) {
          throw new Error(`You have consumed all ${quotaLimit} template downloads for your current billing cycle. You can purchase this template directly.`);
        }

        // Increment quota used
        if (sub?.id) {
          await d1
            .from("subscriptions")
            .update({
              slides_used: quotaUsed + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sub.id);
        }

        let existingPurchases: any[] = [];
        if (Array.isArray(profile?.purchased_items)) {
          existingPurchases = profile.purchased_items;
        }

        const pptxUrl = template.download_url || template.image_url;
        const fileName = template.file_name || `${template.code}_Master.pptx`;

        const newPurchase = {
          id: template.id,
          code: template.code || "SLD-MASTER",
          title: template.title,
          category: template.category,
          download_url: pptxUrl,
          purchased_at: new Date().toISOString(),
          is_pro_quota_redemption: true,
        };

        const updatedPurchases = [
          ...existingPurchases.filter((p: any) => String(p.id) !== String(template.id)),
          newPurchase
        ];

        if (profile?.id) {
          await d1
            .from("profiles")
            .update({
              downloads_this_month: quotaUsed + 1,
              purchased_items: updatedPurchases,
            })
            .eq("id", profile.id);
        }

        data = {
          success: true,
          downloadUrl: pptxUrl,
          fileName,
          message: `Template unlocked successfully. ${quotaRemaining - 1} downloads remaining in your billing cycle.`
        };
      }

      const pptxUrl = data.downloadUrl || template.download_url || template.image_url;
      const fileName = data.fileName || template.file_name || `${template.code}_Master.pptx`;

      setIsPurchased(true);
      setPurchasedClientEmail(clientEmail);
      setDeliverableUrl(pptxUrl);

      // Auto-trigger browser download for client
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

      // Trigger deliverable email asynchronously in background
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
        message: data.message || "Template successfully downloaded using Pro quota.",
        downloadUrl: pptxUrl,
        isCreditRedemption: true
      };
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

          // 2. Direct D1 RPC fallback
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
    executeProTemplateDownload,
    executeRazorpayCheckout
  };
}
