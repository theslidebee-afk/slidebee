// Cloudflare Pages Function: /api/redeem-pro-template
// Server-side verification and fulfillment of Pro template downloads using Cloudflare D1
// 100% Edge native with zero Supabase dependency

interface Env {
  DB?: any;
}

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

export async function onRequestOptions(context: { request: Request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json().catch(() => ({}));
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

    if (!env.DB) {
      return new Response(
        JSON.stringify({ success: false, error: "Cloudflare D1 database unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch Subscription and Profile from D1
    const sub = await env.DB.prepare(
      `SELECT * FROM subscriptions WHERE user_email = ? ORDER BY created_at DESC LIMIT 1`
    ).bind(cleanEmail).first();

    const profile = await env.DB.prepare(
      `SELECT * FROM profiles WHERE email = ?`
    ).bind(cleanEmail).first();

    const isProTier = profile && ["monthly", "yearly", "lifetime"].includes(profile.tier);
    const isSubActive = sub && sub.status === "active";

    if (!isProTier && !isSubActive) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "An active Pro membership is required to unlock this template. Please subscribe or renew your membership.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration if present
    const expiryDate = sub?.current_period_end || profile?.tier_expires_at;
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
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
    const quotaLimit = Number(sub?.slides_limit || (profile?.tier === "lifetime" ? 45 : 30));
    const quotaUsed = Number(profile?.downloads_this_month || sub?.slides_used || 0);
    const quotaRemaining = Math.max(0, quotaLimit - quotaUsed);

    // 3. Fetch Template Details from templates table
    const template = await env.DB.prepare(
      `SELECT * FROM templates WHERE id = ? OR code = ? OR slug = ? LIMIT 1`
    ).bind(cleanTemplateId, cleanTemplateId, cleanTemplateId).first();

    if (!template) {
      return new Response(
        JSON.stringify({ success: false, error: "Requested presentation template not found in catalog." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pptxDownloadUrl = template.download_url || template.image_url || "/portfolio/case_study_a_1.png";
    const fileName = template.file_name || `${template.code || "SLD"}_Master.pptx`;

    // 4. Check if client already downloaded this template
    let purchasedItems: any[] = [];
    try {
      purchasedItems = JSON.parse(profile?.purchased_items || "[]");
    } catch {}

    const alreadyOwns = purchasedItems.some(
      (item: any) =>
        String(item.id) === String(template.id) ||
        (item.code && String(item.code).toLowerCase() === String(template.code).toLowerCase())
    );

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

    if (quotaRemaining <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `You have consumed all ${quotaLimit} template downloads for your current billing cycle. Quota resets on renewal.`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Dock quota and update D1 records
    const newUsed = quotaUsed + 1;
    const newRemaining = Math.max(0, quotaLimit - newUsed);

    if (sub?.id) {
      await env.DB.prepare(
        `UPDATE subscriptions SET slides_used = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(newUsed, sub.id).run();
    }

    const newItem = {
      id: template.id,
      slug: template.slug,
      code: template.code || "SLD-MASTER",
      title: template.title,
      category: template.category,
      slides_count: template.slides_count || 30,
      formats: ["Master PowerPoint (.pptx)"],
      download_url: pptxDownloadUrl,
      is_pro_quota_redemption: true,
      purchased_at: new Date().toISOString(),
    };

    purchasedItems.unshift(newItem);

    if (profile?.id) {
      await env.DB.prepare(
        `UPDATE profiles SET downloads_this_month = ?, purchased_items = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(newUsed, JSON.stringify(purchasedItems), profile.id).run();
    }

    // 6. Record download log in D1
    await env.DB.prepare(
      `INSERT INTO download_logs (id, user_email, template_id, template_title, is_premium, downloaded_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      crypto.randomUUID(),
      cleanEmail,
      template.id,
      template.title,
      template.is_premium ? 1 : 0
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: pptxDownloadUrl,
        fileName,
        quotaRemaining: newRemaining,
        template_title: template.title,
        message: `Template unlocked successfully. ${newRemaining} downloads remaining in your billing cycle.`,
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
