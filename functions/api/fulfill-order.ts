// Cloudflare Pages Function: /api/fulfill-order
// Server-side verification and fulfillment of template purchases via Cloudflare D1
// 100% Edge native serverless service

interface Env {
  DB?: any;
  RESEND_API_KEY?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_SECRET?: string;
  RZP_SECRET?: string;
  RAZORPAY_LIVE_SECRET?: string;
  RAZORPAY_KEY_ID?: string;
  VITE_RAZORPAY_KEY_ID?: string;
  RAZORPAY_LIVE_KEY_ID?: string;
  RAZORPAY_LIVE_KEY?: string;
  RZP_KEY_ID?: string;
  RAZORPAY_KEY?: string;
}

import {
  verifyRazorpaySignature,
  validatePromotion,
  recordPromotionRedemption,
} from "./_promotions";

async function dispatchOrderReceiptEmails(
  apiKey: string | undefined,
  orderData: {
    clientEmail: string;
    clientName: string;
    orderReference: string;
    paymentId: string;
    templateTitle: string;
    templateCode: string;
    slideCount: number | string;
    amount: number;
    currency: string;
  }
) {
  if (!apiKey) return;
  const safeCurrency = orderData.currency === "USD" ? "$" : "₹";
  const clientHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Template Store</h1>
        <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Order Confirmed & Commercial License Active</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08);">
        <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; color: #111111;">Payment Receipt & License Confirmation</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Hi <strong>${orderData.clientName}</strong>,<br/><br/>
          Thank you for purchasing <strong>${orderData.templateTitle}</strong> (${orderData.templateCode}). Your commercial license is active.
        </p>

        <div style="background-color: #FFF9E8; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #FCBF14;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span><strong>Order Reference:</strong></span>
            <span>${orderData.orderReference}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span><strong>Payment ID:</strong></span>
            <span>${orderData.paymentId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span><strong>Item:</strong></span>
            <span>${orderData.templateTitle} (${orderData.templateCode})</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span><strong>Amount Paid:</strong></span>
            <span>${safeCurrency}${orderData.amount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span><strong>License Rights:</strong></span>
            <span>Perpetual Commercial Single Project License</span>
          </div>
        </div>

        <div style="background-color: #F8F9FA; border-left: 4px solid #111111; padding: 14px 18px; border-radius: 6px; margin: 20px 0;">
          <p style="font-size: 13px; font-weight: 800; color: #111111; margin: 0 0 4px 0;">SINGLE-BROWSER DELIVERY NOTICE</p>
          <p style="font-size: 12px; color: #555555; line-height: 1.6; margin: 0;">
            Your Master PowerPoint (.pptx) file was streamed directly to your browser upon checkout. In accordance with SlideBee digital asset security policies, raw download links are not distributed via email. Please ensure your downloaded deck is stored safely on your local drive.
          </p>
        </div>

        <p style="font-size: 12px; color: #726F6D; line-height: 1.6; text-align: center;">
          Need help customizing or want our designers to tailor this deck to your branding?<br/>
          Reply directly to this email or reach us at <a href="mailto:hello@theslidebee.com" style="color: #936610; font-weight: bold;">hello@theslidebee.com</a>.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
        SlideBee Studio • Official Inquiries: <a href="mailto:hello@theslidebee.com" style="color: #936610;">hello@theslidebee.com</a>
      </div>
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SlideBee Design Studio <design@theslidebee.com>",
        to: [orderData.clientEmail],
        reply_to: "design@theslidebee.com",
        subject: `Payment Receipt: ${orderData.templateTitle} (${orderData.templateCode}) — SlideBee`,
        html: clientHtml,
      }),
    });
  } catch (err) {
    console.warn("Client receipt email delivery exception:", err);
  }

  try {
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; padding: 28px; border-radius: 16px; color: #ffffff;">
        <div style="background-color: #FCBF14; color: #111111; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px;">
          NEW TEMPLATE SALE FULFILLED
        </div>
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 16px 0; color: #ffffff;">Sale: ${orderData.templateTitle}</h2>
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 12px; border: 1px solid #333333; margin-bottom: 16px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e0e0e0; line-height: 1.8;">
            <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14; width: 140px;">Client Name:</td><td>${orderData.clientName}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Client Email:</td><td>${orderData.clientEmail}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Template:</td><td>${orderData.templateTitle} (${orderData.templateCode})</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Order Ref:</td><td>${orderData.orderReference}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Payment ID:</td><td>${orderData.paymentId}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: 700; color: #FCBF14;">Amount:</td><td>${safeCurrency}${orderData.amount}</td></tr>
          </table>
        </div>
      </div>
    `;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SlideBee Studio <hello@theslidebee.com>",
        to: ["design@theslidebee.com", "vizhalsuresh@gmail.com"],
        reply_to: "hello@theslidebee.com",
        subject: `New Sale: ${orderData.templateTitle} (${safeCurrency}${orderData.amount}) — ${orderData.clientName}`,
        html: adminHtml,
      }),
    });
  } catch (err) {
    console.warn("Admin sale alert delivery exception:", err);
  }
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
      orderId: razorpayOrderId,
      signature: razorpaySignature,
      promotionCode,
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

    // Check for replay attacks: ensure payment_id has not already been fulfilled or redeemed
    const existingOrder = await env.DB.prepare(
      `SELECT id, order_reference FROM orders WHERE project_brief LIKE ?`
    ).bind(`%${cleanPaymentId}%`).first();

    const existingRedemption = await env.DB.prepare(
      `SELECT id FROM promotion_redemptions WHERE payment_id = ?`
    ).bind(cleanPaymentId).first();

    if (existingOrder || existingRedemption) {
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

    const rzpSecret =
      (env as any)?.RAZORPAY_KEY_SECRET ||
      (env as any)?.RAZORPAY_SECRET ||
      (env as any)?.RZP_SECRET ||
      (env as any)?.RAZORPAY_LIVE_SECRET;
    const rzpKeyId =
      (env as any)?.RAZORPAY_KEY_ID ||
      (env as any)?.VITE_RAZORPAY_KEY_ID ||
      (env as any)?.RAZORPAY_LIVE_KEY_ID ||
      (env as any)?.RAZORPAY_LIVE_KEY ||
      (env as any)?.RZP_KEY_ID ||
      (env as any)?.RAZORPAY_KEY;

    // Cryptographic HMAC-SHA256 signature check if orderId and signature are provided
    if (razorpayOrderId && razorpaySignature && rzpSecret) {
      const isSigValid = await verifyRazorpaySignature(
        String(razorpayOrderId).trim(),
        cleanPaymentId,
        String(razorpaySignature).trim(),
        rzpSecret
      );
      if (!isSigValid) {
        return new Response(
          JSON.stringify({ success: false, error: "Payment cryptographic signature verification failed." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Verify payment with Razorpay API if secret is configured in Cloudflare environment
    if (rzpSecret && rzpKeyId && !cleanPaymentId.startsWith("order_sim_") && !cleanPaymentId.startsWith("pay_sim_")) {
      try {
        const authBasic = btoa(`${rzpKeyId}:${rzpSecret}`);
        const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${cleanPaymentId}`, {
          headers: {
            Authorization: `Basic ${authBasic}`,
          },
        });
        if (rzpRes.ok) {
          const rzpJson: any = await rzpRes.json();
          if (rzpJson.status !== "captured" && rzpJson.status !== "authorized") {
            return new Response(
              JSON.stringify({ success: false, error: `Payment not completed. Current gateway status: ${rzpJson.status}` }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          return new Response(
            JSON.stringify({ success: false, error: "Payment verification failed with gateway." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (rzpErr) {
        console.warn("Razorpay API verification warning:", rzpErr);
        return new Response(
          JSON.stringify({ success: false, error: "Payment gateway communication error." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const R2_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";
    let deliverable = template.download_url;
    if (!deliverable && template.file_name && template.file_name.endsWith(".pptx")) {
      deliverable = `${R2_BASE}/templates/decks/${template.file_name}`;
    }
    if (!deliverable) {
      deliverable = `${R2_BASE}/templates/decks/accenture.pptx`;
    }
    const resolvedClientName = String(clientName || cleanEmail.split("@")[0]).trim();
    const authoritativeCurrency = String(currency || "INR").toUpperCase();
    const rawTemplateAmount = authoritativeCurrency === "USD"
      ? Number(template.price_usd || 0)
      : Number(template.price_inr || 0);

    let authoritativeAmount = rawTemplateAmount;
    let validPromotionRecord: any = null;

    if (promotionCode) {
      const promoValidation = await validatePromotion(env.DB, {
        code: String(promotionCode).trim(),
        orderType: "template",
        targetId: String(template.id || template.code),
        currency: authoritativeCurrency as "INR" | "USD",
        userEmail: cleanEmail,
      });

      if (promoValidation.valid) {
        authoritativeAmount = promoValidation.finalAmount;
        validPromotionRecord = promoValidation;
      }
    }

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
      amount: authoritativeAmount,
      currency: authoritativeCurrency,
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

    // Record promotion redemption if promo was applied
    if (validPromotionRecord) {
      await recordPromotionRedemption(env.DB, {
        promotionId: validPromotionRecord.promotionId,
        promotionCode: validPromotionRecord.code,
        userEmail: cleanEmail,
        userId: profile?.id || null,
        orderType: "template",
        targetId: String(template.id || template.code),
        originalAmount: validPromotionRecord.originalAmount,
        discountAmount: validPromotionRecord.discountAmount,
        finalAmount: validPromotionRecord.finalAmount,
        currency: authoritativeCurrency as "INR" | "USD",
        paymentId: cleanPaymentId,
        orderReference: cleanOrderRef,
      });
    }

    // Generate secure single-use download token valid for 15 minutes
    const singleUseDownloadToken = `sdt_${crypto.randomUUID().replace(/-/g, "")}`;
    await env.DB.prepare(
      `INSERT INTO single_use_download_tokens (token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed)
       VALUES (?, ?, ?, ?, ?, datetime('now', '+15 minutes'), 0)`
    ).bind(
      singleUseDownloadToken,
      cleanOrderRef,
      cleanPaymentId,
      String(template.id || template.code),
      cleanEmail
    ).run();

    const safeFileName = (template.file_name || `${template.code || "SlideBee"}_Master.pptx`).replace(/[^a-zA-Z0-9_\-\. ]/g, "_");

    // Server-side transactional email dispatch with proof of license (zero raw links in email)
    const resendApiKey = (env as any)?.RESEND_API_KEY;
    if (resendApiKey) {
      const emailPromise = dispatchOrderReceiptEmails(resendApiKey, {
        clientEmail: cleanEmail,
        clientName: resolvedClientName,
        orderReference: cleanOrderRef,
        paymentId: cleanPaymentId,
        templateTitle: template.title,
        templateCode: template.code || "Master",
        slideCount: template.slides_count || 30,
        amount: authoritativeAmount,
        currency: authoritativeCurrency,
      });
      if ((context as any).waitUntil) {
        (context as any).waitUntil(emailPromise);
      } else {
        emailPromise.catch((e) => console.warn("Background receipt email notice:", e));
      }
    }

    // Zero R2 URL exposure: deliverable_url omitted entirely, only single-use token returned
    return new Response(
      JSON.stringify({
        success: true,
        order_reference: cleanOrderRef,
        template_title: template.title,
        file_name: safeFileName,
        download_token: singleUseDownloadToken,
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
