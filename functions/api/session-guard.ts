// Cloudflare Pages Function: /api/session-guard
// Server-side strict single active session tracking and verification using Cloudflare D1.

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

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    const body: any = await request.json();
    const { action = "VERIFY", email, sessionId, deviceInfo = "Unknown Device" } = body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid email is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentSessionId = String(sessionId || "").trim();

    let sessionsMap: Record<string, any> = {};
    if (env?.DB) {
      const row: any = await env.DB.prepare("SELECT value FROM site_config WHERE key = 'active_sessions_ledger'").first();
      if (row?.value) {
        try {
          sessionsMap = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
        } catch {
          sessionsMap = {};
        }
      }
    }

    if (action === "REGISTER") {
      const sessionData = {
        sessionId: currentSessionId,
        deviceInfo,
        registeredAt: new Date().toISOString(),
      };

      sessionsMap[cleanEmail] = sessionData;

      if (env?.DB) {
        await env.DB.prepare(`
          INSERT INTO site_config (key, value, updated_at) VALUES ('active_sessions_ledger', ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        `).bind(JSON.stringify(sessionsMap), new Date().toISOString()).run();

        try {
          await env.DB.prepare(`
            INSERT INTO auth_logs (id, user_email, event, metadata, created_at) VALUES (?, ?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            cleanEmail,
            "LOGIN",
            JSON.stringify({ session_id: currentSessionId, device_info: deviceInfo, timestamp: new Date().toISOString() }),
            new Date().toISOString()
          ).run();
        } catch (logErr) {
          console.warn("Failed to write to auth_logs:", logErr);
        }
      }

      return new Response(
        JSON.stringify({ success: true, activeSession: sessionData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "VERIFY") {
      const activeRecord = sessionsMap[cleanEmail];
      if (!activeRecord || !activeRecord.sessionId) {
        return new Response(
          JSON.stringify({ success: true, valid: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (activeRecord.sessionId !== currentSessionId) {
        return new Response(
          JSON.stringify({
            success: true,
            valid: false,
            reason: "DISPLACED",
            newDevice: activeRecord.deviceInfo || "another device",
            displacedAt: activeRecord.registeredAt,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, valid: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Session guard API error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
