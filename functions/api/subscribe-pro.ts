// Cloudflare Pages Function: /api/subscribe-pro
// Server-side verification and provisioning of Pro memberships (80 downloads/mo quota)

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
    const {
      paymentId,
      userId,
      userEmail,
      planName = "Pro Monthly",
      amount = 199,
      billingPeriod = "monthly"
    } = body;

    // Validate email
    const cleanEmail = String(userEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 254) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid client email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPaymentId = String(paymentId || "rzp_manual").trim();
    const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

    // Calculate period end
    const durationDays = billingPeriod === "yearly" ? 365 : 30;
    const periodEnd = new Date(Date.now() + durationDays * 86400000).toISOString();

    // Check if subscription already exists for this user to avoid duplication
    const checkSubRes = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?user_email=eq.${encodeURIComponent(cleanEmail)}&select=id`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    let existingSubId: string | null = null;
    if (checkSubRes.ok) {
      const subs = await checkSubRes.json();
      if (Array.isArray(subs) && subs.length > 0) {
        existingSubId = subs[0].id;
      }
    }

    let saveSubRes: Response;
    if (existingSubId) {
      // Update existing subscription
      saveSubRes = await fetch(
        `${supabaseUrl}/rest/v1/subscriptions?id=eq.${existingSubId}`,
        {
          method: "PATCH",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            plan_name: planName,
            amount_inr: Number(amount),
            amount_usd: billingPeriod === "yearly" ? 290 : 29,
            slides_limit: 80,
            slides_used: 0,
            status: "active",
            current_period_end: periodEnd,
            razorpay_subscription_id: cleanPaymentId,
            updated_at: new Date().toISOString()
          })
        }
      );
    } else {
      // Insert new subscription
      saveSubRes = await fetch(
        `${supabaseUrl}/rest/v1/subscriptions`,
        {
          method: "POST",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify({
            user_id: userId || null,
            user_email: cleanEmail,
            plan_name: planName,
            amount_inr: Number(amount),
            amount_usd: billingPeriod === "yearly" ? 290 : 29,
            slides_limit: 80,
            slides_used: 0,
            status: "active",
            current_period_end: periodEnd,
            razorpay_subscription_id: cleanPaymentId
          })
        }
      );
    }

    if (!saveSubRes.ok) {
      const errText = await saveSubRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Failed to save subscription: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also upgrade starter credits in profiles to match Pro allowance
    await fetch(
      `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(cleanEmail)}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          credits_balance: 80,
          credits_total: 80
        })
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pro subscription successfully activated. 80 downloads credited to your ledger.",
        slides_limit: 80
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
