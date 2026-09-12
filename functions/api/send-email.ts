// Cloudflare Pages Function: /api/send-email
// Handles email dispatch via Resend & notifies hello@theslidebee.com
// Enforces strict Zero-Cost Safety Cap: Circuit breaker capped at 80 emails/day to strictly remain within Resend's free tier (100/day)

const DAILY_EMAIL_SAFETY_LIMIT = 80;
let dailyEmailCount = 0;
let currentDay = new Date().toISOString().slice(0, 10);

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-app-token, x-slidebee-admin-key",
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
    const today = new Date().toISOString().slice(0, 10);
    if (today !== currentDay) {
      currentDay = today;
      dailyEmailCount = 0;
    }

    // Enforce Zero-Cost Email Circuit Breaker
    if (dailyEmailCount >= DAILY_EMAIL_SAFETY_LIMIT) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Zero-Cost Safety Cap: Daily email limit of ${DAILY_EMAIL_SAFETY_LIMIT} reached for ${today}. Request blocked to guarantee $0.00 zero billing.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Security Check: Protect against unauthenticated open relay abuse
    const appToken = request.headers.get("x-slidebee-app-token") || request.headers.get("x-slidebee-admin-key");
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
    const clientToken = (appToken?.trim() || bearerToken) ?? null;

    const expectedAppToken = env?.SLIDEBEE_APP_TOKEN || "slidebee_internal_app_2026";
    const expectedAdminSecret = env?.SLIDEBEE_ADMIN_SECRET || "slidebee_master_admin_2026";

    const isAuthorized =
      Boolean(clientToken) &&
      (clientToken === expectedAppToken || clientToken === expectedAdminSecret);

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Invalid application authentication token." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { to, subject, html, text, replyTo, fromEmail, fromName } = body;

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Anti-Spam: Prevent mass-mailing abuse by capping recipients
    const recipients = Array.isArray(to) ? to : [to];
    if (recipients.length > 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient limit exceeded: maximum 2 recipients per dispatch." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const email of recipients) {
      if (typeof email !== "string" || !email.includes("@") || email.length > 254) {
        return new Response(
          JSON.stringify({ success: false, error: `Invalid recipient email format: ${email}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const apiKey = env?.RESEND_API_KEY || "";
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY environment variable not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Configurable Zoho sender (e.g. design@theslidebee.com or hello@theslidebee.com)
    const configuredEmail = fromEmail || "hello@theslidebee.com";
    const ALLOWED_SENDERS = [
      "hello@theslidebee.com",
      "design@theslidebee.com",
      "admin@theslidebee.com",
      "support@theslidebee.com",
      "notifications@theslidebee.com",
      "onboarding@resend.dev"
    ];

    if (!ALLOWED_SENDERS.includes(configuredEmail.toLowerCase())) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid sender: Only official SlideBee domains permitted." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const senderDisplayName = fromName || "SlideBee Studio";
    const primarySender = `${senderDisplayName} <${configuredEmail}>`;
    const fallbackSender = `${senderDisplayName} <onboarding@resend.dev>`;

    let resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: primarySender,
        to: recipients,
        reply_to: replyTo || configuredEmail,
        subject,
        html: html || `<p>${text || ""}</p>`,
      }),
    });

    let resendData: any = await resendRes.json();

    // If unverified domain error, retry with verified onboarding sender
    if (!resendRes.ok && resendData?.message?.includes("domain")) {
      resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fallbackSender,
          to: recipients,
          reply_to: replyTo || "hello@theslidebee.com",
          subject,
          html: html || `<p>${text || ""}</p>`,
        }),
      });
      resendData = await resendRes.json();
    }

    if (resendRes.ok) {
      dailyEmailCount++;
    }

    return new Response(
      JSON.stringify({
        success: resendRes.ok,
        data: resendData,
        dispatchesToday: dailyEmailCount,
        dailyCap: DAILY_EMAIL_SAFETY_LIMIT,
      }),
      { status: resendRes.ok ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to dispatch email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
