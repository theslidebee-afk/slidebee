// Cloudflare Pages Function: /api/trial-guard
// Server-side verification to prevent free trial abuse, disposable emails, and Sybil farming.

const DEFAULT_SUPABASE_URL = "https://whwyfqtvuubkfypmgosi.supabase.co";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3lmcXR2dXVia2Z5cG1nb3NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM2NzIzNCwiZXhwIjoyMTAzOTQzMjM0fQ.xZmFmQRq7V5ExKUzh0CpDVjqHfgprRgi64Jd8qqBsfk";

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
  "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de", "guerrillamail.net",
  "guerrillamail.org", "yopmail.com", "yopmail.fr", "yopmail.net", "sharklasers.com",
  "throwawaymail.com", "trashmail.com", "trashmail.net", "trashmail.org", "getairmail.com",
  "dispostable.com", "fakemailgenerator.com", "temp-mail.org", "temp-mail.io", "generator.email",
  "tempail.com", "inboxkitten.com", "mohmal.com", "burnermail.io", "crazymailing.com",
  "dropmail.me", "fakeinbox.com", "maildrop.cc", "mytemp.email", "nada.ltd", "nowmymail.com",
  "spambog.com", "tempinbox.com", "tempr.email", "tmpmail.net", "zillamail.com", "armyspy.com",
  "cuvox.de", "dayrep.com", "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com",
  "superrito.com", "teleworm.us", "tinemail.com", "harakirimail.com", "tmail.ws", "getnada.com",
  "emailondeck.com", "clipmail.eu", "mailnull.com", "spam4.me", "boun.cr", "discard.email",
  "discardmail.com", "spamevader.com", "trashymail.com", "tempmailo.com"
]);

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

function normalizeEmailBase(email: string): string {
  if (!email || !email.includes("@")) return "";
  const cleaned = email.toLowerCase().trim();
  const [localPart, domainPart] = cleaned.split("@");
  if (!localPart || !domainPart) return cleaned;

  let baseLocal = localPart.split("+")[0];
  if (domainPart === "gmail.com" || domainPart === "googlemail.com") {
    baseLocal = baseLocal.replace(/\./g, "");
  }
  return `${baseLocal}@${domainPart}`;
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json();
    const { action = "CHECK_AND_CLAIM", email, deviceFingerprint, userId } = body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid email address is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domain = cleanEmail.split("@")[1];
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Disposable or temporary email addresses are not permitted. Please use a valid personal or corporate email."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const canonicalEmailBase = normalizeEmailBase(cleanEmail);
    const fingerprint = String(deviceFingerprint || "").trim();

    const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

    // Fetch existing trial claims ledger from site_config
    const ledgerRes = await fetch(`${supabaseUrl}/rest/v1/site_config?key=eq.trial_claims_ledger&select=value`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      }
    });

    let claimsMap: Record<string, any> = {};
    if (ledgerRes.ok) {
      const records = await ledgerRes.json();
      if (records && records[0] && records[0].value) {
        claimsMap = records[0].value;
      }
    }

    const fingerprintClaimed = fingerprint && claimsMap[`fp:${fingerprint}`];
    const emailClaimed = claimsMap[`email:${canonicalEmailBase}`];

    if (fingerprintClaimed || emailClaimed) {
      // Trial already consumed on this device or canonical email
      return new Response(
        JSON.stringify({
          success: true,
          eligible: false,
          starterCredits: 0,
          trialStatus: "ALREADY_CLAIMED",
          message: "Free starter credits have already been claimed on this device."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If action is CHECK_AND_CLAIM or RECORD_CLAIM, register the claim into the ledger
    if (action === "CHECK_AND_CLAIM" || action === "RECORD_CLAIM") {
      const claimRecord = {
        claimedAt: new Date().toISOString(),
        email: cleanEmail,
        canonicalEmail: canonicalEmailBase,
        fingerprint,
        userId: userId || null
      };

      if (fingerprint) {
        claimsMap[`fp:${fingerprint}`] = claimRecord;
      }
      claimsMap[`email:${canonicalEmailBase}`] = claimRecord;

      // Upsert into site_config
      await fetch(`${supabaseUrl}/rest/v1/site_config`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          key: "trial_claims_ledger",
          value: claimsMap,
          updated_at: new Date().toISOString()
        })
      });

      // Record in auth_logs
      await fetch(`${supabaseUrl}/rest/v1/auth_logs`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_email: cleanEmail,
          event: "SIGNUP",
          metadata: {
            trial_status: "TRIAL_CLAIM_GRANTED",
            starter_credits: 5,
            canonicalEmail: canonicalEmailBase,
            deviceFingerprint: fingerprint,
            timestamp: new Date().toISOString()
          }
        })
      });

      return new Response(
        JSON.stringify({
          success: true,
          eligible: true,
          starterCredits: 5,
          trialStatus: "GRANTED",
          message: "Welcome! Your 5 free starter credits are active."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, eligible: true, starterCredits: 5 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Trial guard API error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
