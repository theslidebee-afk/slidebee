// Cloudflare Pages Function: /api/fulfill-order
// Server-side verification and fulfillment of template purchases via Cloudflare D1
// 100% Edge native with zero Supabase dependency

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
      orderRef,
      paymentId,
      templateId,
      clientEmail,
      clientName,
      currency = "INR",
      amount = 0,
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

    if (!env.DB) {
      return new Response(
        JSON.stringify({ success: false, error: "Cloudflare D1 database unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for replay attacks: ensure payment_id has not already been fulfilled
    const existingOrder = await env.DB.prepare(
      `SELECT id, order_reference FROM orders WHERE project_brief LIKE ?`
    ).bind(`%${cleanPaymentId}%`).first();

    if (existingOrder) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment already processed. Deliverable has already been dispatched.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Template from D1
    const cleanTemplateId = String(templateId).trim();
    const template = await env.DB.prepare(
      `SELECT * FROM templates WHERE id = ? OR slug = ? OR code = ?`
    ).bind(cleanTemplateId, cleanTemplateId, cleanTemplateId).first();

    if (!template) {
      return new Response(
        JSON.stringify({ success: false, error: "Template not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deliverable = template.download_url || template.image_url || "/portfolio/case_study_a_1.png";
    const resolvedClientName = String(clientName || cleanEmail.split("@")[0]).trim();

    // Fetch or create profile
    let profile = await env.DB.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
    let purchasedItems: any[] = [];

    if (profile) {
      try {
        purchasedItems = JSON.parse(profile.purchased_items || "[]");
      } catch {}
    } else {
      const profileId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance)
         VALUES (?, ?, ?, 'Client Enterprise', 'client', 5, 5)`
      ).bind(profileId, cleanEmail, resolvedClientName).run();
    }

    // Append newly purchased template to purchased items
    const newItem = {
      id: template.id,
      slug: template.slug,
      code: template.code || "SLD-MASTER",
      title: template.title,
      category: template.category,
      slides_count: template.slides_count || 30,
      formats: ["Master PowerPoint (.pptx)"],
      amount: Number(amount) || 0,
      currency: String(currency || "INR").toUpperCase(),
      download_url: deliverable,
      purchased_at: new Date().toISOString(),
      payment_id: cleanPaymentId,
    };

    purchasedItems.unshift(newItem);

    await env.DB.prepare(
      `UPDATE profiles SET purchased_items = ?, updated_at = datetime('now') WHERE email = ?`
    ).bind(JSON.stringify(purchasedItems), cleanEmail).run();

    // Insert completed Order
    const orderId = crypto.randomUUID();
    const cleanOrderRef = String(orderRef).trim();
    await env.DB.prepare(
      `INSERT INTO orders (id, order_reference, service_type, slide_count, timeline, formats, project_brief, full_name, email, status)
       VALUES (?, ?, ?, ?, 'Instant Fulfillment', '["Master PowerPoint (.pptx)"]', ?, ?, ?, 'completed')`
    ).bind(
      orderId,
      cleanOrderRef,
      `Template Purchase: ${template.title}`,
      String(template.slides_count || 30),
      `Razorpay Payment: ${cleanPaymentId}`,
      resolvedClientName,
      cleanEmail
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        order_reference: cleanOrderRef,
        template_title: template.title,
        deliverable_url: deliverable,
        message: "Order fulfilled successfully via Cloudflare D1.",
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
