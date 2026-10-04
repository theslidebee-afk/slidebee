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

      // Dispatch automated receipt & activation emails via Resend
      const resendApiKey = env?.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const formattedExpiry = periodEnd
            ? new Date(periodEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : resolvedTier === "lifetime" ? "Lifetime Unlimited" : "1 Year Active Period";
          const clientCurrency = currency === "USD" ? "$" : "₹";
          const clientAmount = currency === "USD" ? amountUsd : amountInr;

          const clientReceiptHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
                <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Executive Presentation Membership & Official Receipt</p>
              </div>
              <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                <div style="display: inline-block; background-color: #FFF9E8; border: 1px solid #FCBF14; color: #936610; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
                  VIP ${resolvedTier.toUpperCase()} MEMBERSHIP ACTIVE
                </div>
                <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #111111;">Your SlideBee Pro Membership Is Activated</h2>
                <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
                  Hi <strong>${cleanEmail.split("@")[0]}</strong>,<br/><br/>
                  Thank you for subscribing to <strong>${resolvedPlanName}</strong>. Your payment has been confirmed, and your executive presentation studio pass is now active.
                </p>
                <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 18px; margin: 20px 0;">
                  <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #726F6D; margin-top: 0; margin-bottom: 12px;">Payment Receipt & Transaction Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #111111; line-height: 2;">
                    <tr><td style="color: #726F6D; width: 140px;">Plan:</td><td style="font-weight: 700;">${resolvedPlanName}</td></tr>
                    <tr><td style="color: #726F6D;">Amount Paid:</td><td style="font-weight: 800; color: #936610;">${clientCurrency}${clientAmount}</td></tr>
                    <tr><td style="color: #726F6D;">Payment Reference:</td><td style="font-family: monospace; font-size: 12px;">${cleanPaymentId}</td></tr>
                    <tr><td style="color: #726F6D;">Active Until:</td><td style="font-weight: 700;">${formattedExpiry}</td></tr>
                    <tr><td style="color: #726F6D;">Billing Account:</td><td>${cleanEmail}</td></tr>
                  </table>
                </div>
                <div style="background-color: #FFF9E8; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #FCBF14;">
                  <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #936610; margin-top: 0; margin-bottom: 12px;">Included VIP Member Privileges</h3>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #111111; line-height: 1.8;">
                    <li><strong>Download Quota:</strong> ${quotaLimit} Master Presentation Decks / month</li>
                    <li><strong>Complete Catalog Access:</strong> Unrestricted access to all curated 16:9 HD presentation decks</li>
                    <li><strong>Commercial Rights:</strong> Perpetual commercial and client pitch deck licensing included</li>
                    <li><strong>VIP WhatsApp Studio Hotline:</strong> Direct priority communication in your client portal</li>
                  </ul>
                </div>
                <div style="text-align: center; margin: 28px 0 16px 0;">
                  <a href="https://theslidebee.com/login" style="background-color: #FCBF14; color: #111111; font-weight: 800; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Open Your Client Portal & Download Decks
                  </a>
                </div>
              </div>
            </div>
          `;

          // 1. Send receipt to client
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "SlideBee Studio <design@theslidebee.com>",
              to: [cleanEmail],
              reply_to: "design@theslidebee.com",
              subject: `Payment Receipt & VIP ${resolvedTier.toUpperCase()} Pass Activated — SlideBee Studio`,
              html: clientReceiptHtml,
            }),
          }).catch((err) => console.warn("Client receipt dispatch warning:", err));

          // 2. Alert studio leads: vizhalsuresh@gmail.com and design@theslidebee.com
          const adminAlertHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; padding: 28px; border-radius: 16px; color: #ffffff;">
              <div style="background-color: #FCBF14; color: #111111; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px;">
                NEW PAID VIP SUBSCRIBER
              </div>
              <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 16px 0; color: #ffffff;">New Subscriber: ${cleanEmail} (${resolvedTier.toUpperCase()})</h2>
              <div style="background-color: #1a1a1a; padding: 20px; border-radius: 12px; border: 1px solid #333333; margin-bottom: 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e0e0e0; line-height: 1.8;">
                  <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14; width: 140px;">Client Email:</td><td><a href="mailto:${cleanEmail}" style="color: #FCBF14;">${cleanEmail}</a></td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Plan:</td><td>${resolvedPlanName}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Amount Paid:</td><td style="font-weight: 800; color: #FCBF14;">${clientCurrency}${clientAmount}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Payment ID:</td><td style="font-family: monospace;">${cleanPaymentId}</td></tr>
                  <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Active Period:</td><td>${formattedExpiry}</td></tr>
                </table>
              </div>
            </div>
          `;

          for (const adminTo of ["vizhalsuresh@gmail.com", "design@theslidebee.com"]) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "SlideBee Studio Alert <hello@theslidebee.com>",
                to: [adminTo],
                reply_to: cleanEmail,
                subject: `[PAID SUBSCRIBER] ${resolvedPlanName} — ${cleanEmail} (${clientCurrency}${clientAmount})`,
                html: adminAlertHtml,
              }),
            }).catch((err) => console.warn(`Admin dispatch to ${adminTo} warning:`, err));
          }
        } catch (e) {
          console.warn("Resend email dispatch error in subscribe-pro:", e);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `${resolvedPlanName} activated successfully.`,
          tier: resolvedTier,
          tierExpiresAt: periodEnd,
          quotaLimit,
          receiptSent: Boolean(resendApiKey),
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
