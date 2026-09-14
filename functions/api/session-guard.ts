// Cloudflare Pages Function: /api/session-guard
// Server-side strict single active session tracking and verification.

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
    const { action = "VERIFY", email, sessionId, deviceInfo = "Unknown Device" } = body;

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid email is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentSessionId = String(sessionId || "").trim();
    const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

    // Fetch active session ledger from site_config
    const ledgerRes = await fetch(`${supabaseUrl}/rest/v1/site_config?key=eq.active_sessions_ledger&select=value`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      }
    });

    let sessionsMap: Record<string, any> = {};
    if (ledgerRes.ok) {
      const records = await ledgerRes.json();
      if (records && records[0] && records[0].value) {
        sessionsMap = records[0].value;
      }
    }

    if (action === "REGISTER") {
      const sessionData = {
        sessionId: currentSessionId,
        deviceInfo,
        registeredAt: new Date().toISOString()
      };

      sessionsMap[cleanEmail] = sessionData;

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
          key: "active_sessions_ledger",
          value: sessionsMap,
          updated_at: new Date().toISOString()
        })
      });

      // Also log login event
      await fetch(`${supabaseUrl}/rest/v1/auth_logs`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_email: cleanEmail,
          event: "LOGIN",
          metadata: {
            session_id: currentSessionId,
            device_info: deviceInfo,
            timestamp: new Date().toISOString()
          }
        })
      });

      return new Response(
        JSON.stringify({ success: true, activeSession: sessionData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "VERIFY") {
      const activeRecord = sessionsMap[cleanEmail];
      if (!activeRecord || !activeRecord.sessionId) {
        // No session registered yet, or session is fresh
        return new Response(
          JSON.stringify({ success: true, valid: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (activeRecord.sessionId !== currentSessionId) {
        // Session ID does not match -> displaced by another device!
        return new Response(
          JSON.stringify({
            success: true,
            valid: false,
            reason: "DISPLACED",
            newDevice: activeRecord.deviceInfo || "another device",
            displacedAt: activeRecord.registeredAt
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
