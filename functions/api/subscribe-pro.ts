// Cloudflare Pages Function: /api/subscribe-pro
// Server-side verification and provisioning of Monthly, Yearly, and Lifetime tier subscriptions

interface Env {
  DB?: any;
  RESEND_API_KEY?: string;
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
    const {
      paymentId,
      userId,
      userEmail,
      planName,
      amount = 5,
      currency = "USD",
      billingPeriod = "monthly",
      tier: inputTier,
    } = body;

    // Validate email
    const cleanEmail = String(userEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 254) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid client email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve subscription tier: monthly | yearly | lifetime
    let resolvedTier: "monthly" | "yearly" | "lifetime" = "monthly";
    const periodLower = String(billingPeriod || inputTier || "").toLowerCase();
    if (periodLower.includes("life")) {
      resolvedTier = "lifetime";
    } else if (periodLower.includes("year") || periodLower.includes("annual")) {
      resolvedTier = "yearly";
    } else {
      resolvedTier = "monthly";
    }

    const cleanPaymentId = String(paymentId || "rzp_manual").trim();
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM

    // Calculate period end
    let periodEnd: string | null = null;
    let quotaLimit = 30;
    if (resolvedTier === "lifetime") {
      periodEnd = new Date(Date.now() + 100 * 365 * 86400000).toISOString();
      quotaLimit = 45; // Safety anti-bot limit
    } else if (resolvedTier === "yearly") {
      periodEnd = new Date(Date.now() + 365 * 86400000).toISOString();
      quotaLimit = 30;
    } else {
      periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
      quotaLimit = 30;
    }

    const resolvedPlanName = planName || (
      resolvedTier === "lifetime" ? "Lifetime VIP" :
      resolvedTier === "yearly" ? "Yearly Pro" : "Monthly Pro"
    );

    const amountNum = Number(amount) || (
      resolvedTier === "lifetime" ? 75 :
      resolvedTier === "yearly" ? 45 : 5
    );
    const amountUsd = currency === "INR" ? (resolvedTier === "lifetime" ? 75 : resolvedTier === "yearly" ? 45 : 5) : amountNum;
    const amountInr = currency === "INR" ? amountNum : (resolvedTier === "lifetime" ? 5999 : resolvedTier === "yearly" ? 3499 : 399);

    // 1. Cloudflare D1 Execution (Primary)
    if (env.DB) {
      // Check existing profile
      const profile = await env.DB.prepare(`SELECT id FROM profiles WHERE email = ?`).bind(cleanEmail).first();

      if (profile) {
        await env.DB.prepare(`
          UPDATE profiles 
          SET tier = ?, tier_expires_at = ?, downloads_this_month = 0, month_cycle_start = ?, updated_at = CURRENT_TIMESTAMP
          WHERE email = ?
        `).bind(resolvedTier, periodEnd, currentMonth, cleanEmail).run();
      } else {
        const newProfId = "prf-" + Math.random().toString(36).substring(2, 10);
        const namePart = cleanEmail.split("@")[0];
        await env.DB.prepare(`
          INSERT INTO profiles (id, email, full_name, role, tier, tier_expires_at, downloads_today, downloads_this_month, month_cycle_start)
          VALUES (?, ?, ?, 'client', ?, ?, 0, 0, ?)
        `).bind(newProfId, cleanEmail, namePart, resolvedTier, periodEnd, currentMonth).run();
      }

      // Record subscription
      const subId = "sub-" + Math.random().toString(36).substring(2, 10);
      await env.DB.prepare(`
        INSERT INTO subscriptions (id, user_email, plan_name, amount_usd, amount_inr, slides_limit, slides_used, status, current_period_end, razorpay_subscription_id)
        VALUES (?, ?, ?, ?, ?, ?, 0, 'active', ?, ?)
      `).bind(subId, cleanEmail, resolvedPlanName, amountUsd, amountInr, quotaLimit, periodEnd, cleanPaymentId).run();

      return new Response(
        JSON.stringify({
          success: true,
          message: `${resolvedPlanName} activated successfully.`,
          tier: resolvedTier,
          tierExpiresAt: periodEnd,
          quotaLimit,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Cloudflare D1 database unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
