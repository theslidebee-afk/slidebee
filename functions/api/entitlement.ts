// Cloudflare Pages Function: /api/entitlement
// Edge Entitlement & Download Engine enforcing Free (3/day), Monthly/Yearly (30/mo), and Lifetime (45/mo anti-bot) limits.

interface Env {
  DB?: any;
  RESEND_API_KEY?: string;
  SLIDEBEE_ADMIN_SECRET?: string;
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
    const { templateId, userEmail } = body;
    const cleanEmail = String(userEmail || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return new Response(JSON.stringify({
        success: false,
        errorCode: "LOGIN_REQUIRED",
        message: "Please sign in or create a free account to download templates.",
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!templateId) {
      return new Response(JSON.stringify({
        success: false,
        errorCode: "INVALID_TEMPLATE",
        message: "Template ID is required.",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        errorCode: "DATABASE_UNAVAILABLE",
        message: "D1 database connection unavailable.",
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch user profile
    const profile = await env.DB.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
    if (!profile) {
      return new Response(JSON.stringify({
        success: false,
        errorCode: "USER_NOT_FOUND",
        message: "User account profile not found.",
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tier = profile.tier || "free";
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentMonth = today.substring(0, 7); // YYYY-MM

    let downloadsToday = profile.downloads_today || 0;
    if (profile.last_download_date !== today) {
      downloadsToday = 0;
    }

    let downloadsThisMonth = profile.downloads_this_month || 0;
    if (profile.month_cycle_start !== currentMonth) {
      downloadsThisMonth = 0;
    }

    // 2. Fetch template
    const template = await env.DB.prepare(
      `SELECT * FROM templates WHERE id = ? OR slug = ? OR code = ?`
    ).bind(templateId, templateId, templateId).first();

    if (!template) {
      return new Response(JSON.stringify({
        success: false,
        errorCode: "TEMPLATE_NOT_FOUND",
        message: "The requested presentation template was not found.",
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isPremium = template.is_premium !== 0;

    // 3. Entitlement Rules
    if (!isPremium) {
      // FREE TEMPLATE: Available to all tiers, free tier has 3 downloads/day cap
      if (tier === "free" && downloadsToday >= 3) {
        return new Response(JSON.stringify({
          success: false,
          errorCode: "DAILY_LIMIT_REACHED",
          message: "You have reached your daily limit of 3 free downloads. Upgrade to Monthly ($5) or Lifetime ($75) for unlimited downloads.",
          requiresUpgrade: true,
          limit: 3,
          used: downloadsToday,
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // PREMIUM TEMPLATE: Requires Monthly ($5), Yearly ($45), or Lifetime ($75)
      if (tier === "free") {
        return new Response(JSON.stringify({
          success: false,
          errorCode: "UPGRADE_REQUIRED",
          message: "This is a Premium Template. Upgrade to Monthly ($5), Yearly ($45), or Lifetime ($75) to unlock this template and our entire library.",
          requiresUpgrade: true,
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (tier === "monthly" || tier === "yearly") {
        if (downloadsThisMonth >= 30) {
          return new Response(JSON.stringify({
            success: false,
            errorCode: "MONTHLY_LIMIT_REACHED",
            message: "You have reached your monthly allowance of 30 premium template downloads. Your limit will reset on the 1st of next month.",
            limit: 30,
            used: downloadsThisMonth,
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (tier === "lifetime") {
        if (downloadsThisMonth >= 45) {
          // Trigger Anti-Bot security rate limit
          await env.DB.prepare(`UPDATE profiles SET is_bot_flagged = 1 WHERE id = ?`).bind(profile.id).run();

          // Dispatch automated security email via Resend if API key available
          if (env.RESEND_API_KEY) {
            try {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${env.RESEND_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "SlideBee Security <security@theslidebee.com>",
                  to: cleanEmail,
                  subject: "Notice: Fair-Use Anti-Bot Threshold Reached on SlideBee",
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
                      <h2 style="color: #111111;">Security & Anti-Bot Fair Use Notice</h2>
                      <p>Hello ${profile.full_name || "Valued Member"},</p>
                      <p>Your SlideBee Lifetime account has reached our automated fair-use safety limit of <strong>45 presentation downloads this month</strong>.</p>
                      <p>We keep this safeguard in place to prevent automated web crawlers and bot scraping. If you are actively presenting or designing for client projects and need this limit increased, simply reply to this email or contact support at <a href="mailto:admin@theslidebee.com">admin@theslidebee.com</a> and our team will verify your account immediately.</p>
                      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">The SlideBee Security Team</p>
                    </div>
                  `,
                }),
              });
            } catch (emailErr) {
              console.warn("Anti-bot notification email failed:", emailErr);
            }
          }

          return new Response(JSON.stringify({
            success: false,
            errorCode: "BOT_SAFETY_LIMIT",
            message: "Fair-Use Security Threshold Reached (45 downloads/month). To protect against automated scraping, we have sent a quick verification email to your inbox to unlock additional downloads.",
            limit: 45,
            used: downloadsThisMonth,
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // 4. Grant Entitlement & Update Counters
    const newDownloadsToday = downloadsToday + 1;
    const newDownloadsThisMonth = isPremium ? downloadsThisMonth + 1 : downloadsThisMonth;

    let purchasedItems = [];
    try { purchasedItems = JSON.parse(profile.purchased_items || "[]"); } catch {}

    const deliverable = template.download_url || template.image_url || "/portfolio/case_study_a_1.png";
    const alreadyPresent = purchasedItems.some((item: any) => item.id === template.id || item.slug === template.slug);

    if (!alreadyPresent) {
      purchasedItems.unshift({
        id: template.id,
        slug: template.slug,
        code: template.code || "SLD-MASTER",
        title: template.title,
        category: template.category,
        slides_count: template.slides_count || 30,
        formats: ["Master PowerPoint (.pptx)"],
        download_url: deliverable,
        is_premium: isPremium,
        downloaded_at: now.toISOString(),
      });
    }

    await env.DB.prepare(
      `UPDATE profiles 
       SET downloads_today = ?, 
           last_download_date = ?, 
           downloads_this_month = ?, 
           month_cycle_start = ?,
           purchased_items = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      newDownloadsToday,
      today,
      newDownloadsThisMonth,
      currentMonth,
      JSON.stringify(purchasedItems),
      profile.id
    ).run();

    // Log download event
    await env.DB.prepare(
      `INSERT INTO download_logs (id, user_email, template_id, template_title, tier, is_premium, download_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      cleanEmail,
      template.id,
      template.title,
      tier,
      isPremium ? 1 : 0,
      deliverable
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: "Template download unlocked successfully.",
      downloadUrl: deliverable,
      fileName: template.file_name || `${template.title.replace(/[^a-zA-Z0-9]/g, "_")}.pptx`,
      tier,
      isPremium,
      downloadsToday: newDownloadsToday,
      downloadsThisMonth: newDownloadsThisMonth,
      remainingDailyFree: tier === "free" ? Math.max(0, 3 - newDownloadsToday) : null,
      remainingMonthlyPremium: (tier === "monthly" || tier === "yearly") ? Math.max(0, 30 - newDownloadsThisMonth) : (tier === "lifetime" ? Math.max(0, 45 - newDownloadsThisMonth) : null),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      errorCode: "SERVER_ERROR",
      message: err?.message || "Internal server error processing entitlement.",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
