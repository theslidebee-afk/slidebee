// Cloudflare Pages Function: /api/send-email
// Handles email dispatch via Resend & notifies hello@theslidebee.com

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function onRequestPost(context: any) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { request, env } = context;
    const body = await request.json();
    const { to, subject, html, text, replyTo, fromEmail, fromName } = body;

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = env?.RESEND_API_KEY || "";
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY environment variable not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Configurable Zoho sender (e.g. design@theslidebee.com or hello@theslidebee.com)
    const configuredEmail = fromEmail || "hello@theslidebee.com";
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
        to: Array.isArray(to) ? to : [to],
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
          to: Array.isArray(to) ? to : [to],
          reply_to: replyTo || "hello@theslidebee.com",
          subject,
          html: html || `<p>${text || ""}</p>`,
        }),
      });
      resendData = await resendRes.json();
    }

    return new Response(
      JSON.stringify({ success: resendRes.ok, data: resendData }),
      { status: resendRes.ok ? 200 : 400, headers: corsHeaders }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to dispatch email" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
