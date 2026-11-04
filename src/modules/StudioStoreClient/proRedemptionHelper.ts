import { type StoreTemplate } from "./useStudioStore";
import { d1 } from "../../lib/d1";
import { sendTemplatePurchaseReceiptEmail } from "../../lib/email";
import { getTemplateDeliverableUrl, triggerPptxDownload, isValidPptxUrl } from "../../lib/templates";
import type { CheckoutResult } from "./useTemplateCheckout";

export async function redeemProTemplateDownload(
  template: StoreTemplate,
  clientEmail: string
): Promise<CheckoutResult> {
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

    const pptxUrl = getTemplateDeliverableUrl(template) || "";
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

  const pptxUrl = (data.downloadUrl && isValidPptxUrl(data.downloadUrl)) ? data.downloadUrl : (getTemplateDeliverableUrl(template) || "");
  const fileName = data.fileName || template.file_name || `${template.code}_Master.pptx`;

  // Auto-trigger browser download for verified deliverable
  if (typeof window !== "undefined" && pptxUrl) {
    try {
      triggerPptxDownload(`/api/download?id=${encodeURIComponent(template.id || template.code)}`, fileName);
    } catch (dlErr) {
      console.warn("Auto-download notice:", dlErr);
    }
  }

  // Background receipt email
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
}
