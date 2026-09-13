// Cloudflare Pages Function: /api/redeem-pro-template
// Server-side verification and fulfillment of Pro template downloads using the 80 template quota

const DEFAULT_SUPABASE_URL = "https://whwyfqtvuubkfypmgosi.supabase.co";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3lmcXR2dXVia2Z5cG1nb3NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM2NzIzNCwiZXhwIjoyMTAzOTQzMjM0fQ.xZmFmQRq7V5ExKUzh0CpDVjqHfgprRgi64Jd8qqBsfk";

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-app-token",
    "Vary": "Origin",
  };
}

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json();
    const { clientEmail, templateId } = body;

    const cleanEmail = String(clientEmail || "").trim().toLowerCase();
    const cleanTemplateId = String(templateId || "").trim();

    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 254) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid client email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!cleanTemplateId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing template identifier." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    // 1. Fetch Subscription to verify active Pro status and expiration
    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?user_email=eq.${encodeURIComponent(cleanEmail)}&select=*&order=created_at.desc&limit=1`,
      { headers }
    );

    if (!subRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify membership status." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subscriptions = await subRes.json();
    const sub = Array.isArray(subscriptions) && subscriptions.length > 0 ? subscriptions[0] : null;

    if (!sub || sub.status !== "active") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "An active Pro membership is required to unlock this template. Please subscribe or renew your membership.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration: current_period_end
    if (sub.current_period_end) {
      const expiry = new Date(sub.current_period_end);
      const now = new Date();
      if (expiry <= now) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Your SlideBee Pro membership expired on ${expiry.toLocaleDateString()}. Please renew your membership to continue downloading templates.`,
            isExpired: true,
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2. Check remaining quota
    const quotaLimit = Number(sub.slides_limit || 80);
    const quotaUsed = Number(sub.slides_used || 0);
    const quotaRemaining = quotaLimit - quotaUsed;

    if (quotaRemaining <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `You have consumed all ${quotaLimit} template downloads for your current billing period. Quota resets on renewal.`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch Template Details from templates table
    const tplRes = await fetch(
      `${supabaseUrl}/rest/v1/templates?or=(id.eq.${encodeURIComponent(cleanTemplateId)},code.eq.${encodeURIComponent(cleanTemplateId)},slug.eq.${encodeURIComponent(cleanTemplateId)})&select=*&limit=1`,
      { headers }
    );

    if (!tplRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: "Template lookup failed." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templates = await tplRes.json();
    const template = Array.isArray(templates) && templates.length > 0 ? templates[0] : null;

    if (!template) {
      return new Response(
        JSON.stringify({ success: false, error: "Requested presentation template not found in catalog." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pptxDownloadUrl = template.download_url || template.image_url;
    const fileName = template.file_name || `${template.code || "SLD"}_Master.pptx`;

    // 4. Fetch Client Profile
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(cleanEmail)}&select=*&limit=1`,
      { headers }
    );

    let profile: any = null;
    if (profileRes.ok) {
      const profiles = await profileRes.json();
      if (Array.isArray(profiles) && profiles.length > 0) {
        profile = profiles[0];
      }
    }

    const purchasedItems = Array.isArray(profile?.purchased_items) ? [...profile.purchased_items] : [];
    const alreadyOwns = purchasedItems.some(
      (item: any) =>
        String(item.id) === String(template.id) ||
        (item.code && String(item.code).toLowerCase() === String(template.code).toLowerCase())
    );

    // If client already downloaded this template, deliver directly without docking extra quota
    if (alreadyOwns) {
      return new Response(
        JSON.stringify({
          success: true,
          downloadUrl: pptxDownloadUrl,
          fileName,
          alreadyPurchased: true,
          quotaRemaining,
          message: "Template is already in your client library. Master PPTX deliverable ready for instant download.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Append new item to purchased_items and usage_history
    const newItem = {
      id: template.id,
      code: template.code || `SLD-${template.id.slice(0, 4).toUpperCase()}`,
      title: template.title,
      category: template.category || "Business",
      slides_count: Number(template.slides_count || 30),
      download_url: pptxDownloadUrl,
      purchased_at: new Date().toISOString(),
      is_pro_quota: true,
      amount: 0,
      currency: "INR",
    };

    const newUsage = {
      item_title: template.title,
      credits_used: 1,
      action: `Pro Template Quota Download (${quotaUsed + 1} of ${quotaLimit})`,
      date: new Date().toISOString(),
    };

    const updatedPurchasedItems = [newItem, ...purchasedItems];
    const existingHistory = Array.isArray(profile?.usage_history) ? profile.usage_history : [];
    const updatedUsageHistory = [newUsage, ...existingHistory];

    const currentBalance = Number(profile?.credits_balance ?? quotaRemaining);
    const updatedBalance = Math.max(0, currentBalance - 1);
    const updatedUsed = Number(profile?.credits_used || 0) + 1;

    // Update Profile
    if (profile?.id) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${profile.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          credits_balance: updatedBalance,
          credits_used: updatedUsed,
          purchased_items: updatedPurchasedItems,
          usage_history: updatedUsageHistory,
          updated_at: new Date().toISOString(),
        }),
      });
    }

    // Update Subscription slides_used
    await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${sub.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        slides_used: quotaUsed + 1,
        updated_at: new Date().toISOString(),
      }),
    });

    // Record order in orders ledger for full audit tracking
    const orderRef = `PRO-TPL-${template.code || "SLD"}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        order_reference: orderRef,
        email: cleanEmail,
        full_name: profile?.full_name || cleanEmail.split("@")[0],
        service_tier: "Pro Template Quota",
        project_brief: `Pro Membership 80-Quota Download: ${template.title} (${template.code || "SLD"})`,
        amount: 0,
        currency: "INR",
        status: "delivered",
        deliverable_link: pptxDownloadUrl,
        milestone_index: 4,
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: pptxDownloadUrl,
        fileName,
        quotaRemaining: quotaRemaining - 1,
        quotaUsed: quotaUsed + 1,
        quotaLimit,
        message: `Template successfully unlocked using your Pro membership quota (${quotaRemaining - 1} of ${quotaLimit} downloads remaining).`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
