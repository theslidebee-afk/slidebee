// Cloudflare Pages Function: /api/trial-guard
// Server-side verification to prevent free trial abuse, disposable emails, and Sybil farming using Cloudflare D1.

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

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    const body: any = await request.json();
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

    let claimsMap: Record<string, any> = {};
    if (env?.DB) {
      const row: any = await env.DB.prepare("SELECT value FROM site_config WHERE key = 'trial_claims_ledger'").first();
      if (row?.value) {
        try {
          claimsMap = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
        } catch {
          claimsMap = {};
        }
      }
    }

    const fingerprintClaimed = fingerprint && claimsMap[`fp:${fingerprint}`];
    const emailClaimed = claimsMap[`email:${canonicalEmailBase}`];

    if (fingerprintClaimed || emailClaimed) {
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

      if (env?.DB) {
        await env.DB.prepare(`
          INSERT INTO site_config (key, value, updated_at) VALUES ('trial_claims_ledger', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `).bind(JSON.stringify(claimsMap), new Date().toISOString()).run();

        try {
          await env.DB.prepare(`
            INSERT INTO auth_logs (id, user_email, event, metadata, created_at) VALUES (?, ?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            cleanEmail,
            "SIGNUP",
            JSON.stringify({
              trial_status: "TRIAL_CLAIM_GRANTED",
              starter_credits: 5,
              canonicalEmail: canonicalEmailBase,
              deviceFingerprint: fingerprint,
              timestamp: new Date().toISOString()
            }),
            new Date().toISOString()
          ).run();
        } catch (logErr) {
          console.warn("Failed to write to auth_logs:", logErr);
        }
      }

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
