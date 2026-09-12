// Cloudflare Pages Function: /api/fulfill-order
// Server-side verification and fulfillment of template purchases

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
      orderRef,
      paymentId,
      templateId,
      clientEmail,
      clientName,
      currency,
      amount,
    } = body;

    // Validate required fields
    if (!orderRef || !paymentId || !templateId || !clientEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required order fulfillment parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const cleanEmail = String(clientEmail).trim().toLowerCase();
    if (!cleanEmail.includes("@") || cleanEmail.length > 254) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid client email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate payment ID format (prevent arbitrary injection)
    const cleanPaymentId = String(paymentId).trim();
    if (!/^[a-zA-Z0-9_-]{8,64}$/.test(cleanPaymentId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payment identifier format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

    // Check for replay attacks: ensure payment_id has not already been fulfilled
    const checkPaymentRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?select=id,order_reference&project_brief=like.*${encodeURIComponent(cleanPaymentId)}*`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (checkPaymentRes.ok) {
      const existingOrders = await checkPaymentRes.json();
      if (Array.isArray(existingOrders) && existingOrders.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Payment already processed. Deliverable has already been dispatched.",
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Execute privileged RPC fn_fulfill_template_order via service_role
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/fn_fulfill_template_order`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_order_ref: String(orderRef).trim(),
        p_payment_id: cleanPaymentId,
        p_template_id: String(templateId).trim(),
        p_client_email: cleanEmail,
        p_client_name: String(clientName || cleanEmail.split("@")[0]).trim(),
        p_currency: String(currency || "INR").trim(),
        p_amount: Number(amount) || 0,
      }),
    });

    if (!rpcRes.ok) {
      const errText = await rpcRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Order fulfillment failed: ${errText}` }),
        { status: rpcRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await rpcRes.json();

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
