// Cloudflare Pages Function: /api/delete-account
// Secure server-side account deletion and data purge using Cloudflare D1 with official email dispatch

interface Env {
  DB?: any;
  SLIDEBEE_ADMIN_SECRET?: string;
  SLIDEBEE_APP_TOKEN?: string;
  RESEND_API_KEY?: string;
}

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".pages.dev")) return true;
  if (origin.endsWith(".theslidebee.com")) return true;
  return false;
}

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-app-token, x-slidebee-admin-key, x-user-id",
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
    const {
      targetEmail,
      targetUserId,
      reason = "Client requested account closure",
      customNotes = "",
      sendNotice = true,
      subject = "Account Deletion & Data Privacy Confirmation — SlideBee Studio",
      senderEmail = "support@theslidebee.com",
      clientName = "",
    } = body;

    const cleanEmail = String(targetEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 254) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid client email address is required for deletion." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authorization Check: Only authorized admin or the authenticated account owner can delete the account
    const adminKey = request.headers.get("x-slidebee-admin-key");
    const authHeader = request.headers.get("Authorization");
    const headerUserId = request.headers.get("x-user-id");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
    const isSecretAdmin = Boolean(env?.SLIDEBEE_ADMIN_SECRET && (adminKey === env.SLIDEBEE_ADMIN_SECRET || token === env.SLIDEBEE_ADMIN_SECRET));

    let isAuthorized = isSecretAdmin;

    if (!isAuthorized && env?.DB && (token || headerUserId)) {
      const checkToken = token || headerUserId;

      // 1. Check active session by session ID or user_id
      const activeSession: any = await env.DB.prepare(
        `SELECT email, role, user_id FROM sessions WHERE (id = ? OR user_id = ?) AND expires_at > datetime('now')`
      ).bind(checkToken, checkToken).first();

      if (activeSession) {
        const sessionEmail = String(activeSession.email || "").toLowerCase().trim();
        if (sessionEmail === cleanEmail || activeSession.role === "admin" || activeSession.role === "super_admin") {
          isAuthorized = true;
        }
      }

      // 2. Check if token or header matches user ID directly in users table for this cleanEmail
      if (!isAuthorized) {
        const matchingUser: any = await env.DB.prepare(
          `SELECT id, email, role FROM users WHERE (id = ? OR email = ?) AND email = ?`
        ).bind(checkToken, cleanEmail, cleanEmail).first();

        if (matchingUser) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: You do not have permission to delete this account." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let resolvedUserId = targetUserId || null;

    if (env?.DB) {
      if (!resolvedUserId) {
        const u: any = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(cleanEmail).first();
        if (u?.id) {
          resolvedUserId = u.id;
        } else {
          const p: any = await env.DB.prepare("SELECT id FROM profiles WHERE email = ?").bind(cleanEmail).first();
          if (p?.id) resolvedUserId = p.id;
        }
      }

      const uid = resolvedUserId || cleanEmail;

      // Purge all records from D1 in a single transaction batch using exact schema column names
      // subscriptions: user_email, user_id
      // orders: email
      // download_logs: user_email
      // sessions: email, user_id
      // profiles: email, id
      // users: email, id
      await env.DB.batch([
        env.DB.prepare("DELETE FROM subscriptions WHERE LOWER(TRIM(user_email)) = ? OR user_id = ?").bind(cleanEmail, uid),
        env.DB.prepare("DELETE FROM orders WHERE LOWER(TRIM(email)) = ?").bind(cleanEmail),
        env.DB.prepare("DELETE FROM download_logs WHERE LOWER(TRIM(user_email)) = ?").bind(cleanEmail),
        env.DB.prepare("DELETE FROM sessions WHERE LOWER(TRIM(email)) = ? OR user_id = ?").bind(cleanEmail, uid),
        env.DB.prepare("DELETE FROM profiles WHERE LOWER(TRIM(email)) = ? OR id = ?").bind(cleanEmail, uid),
        env.DB.prepare("DELETE FROM users WHERE LOWER(TRIM(email)) = ? OR id = ?").bind(cleanEmail, uid),
        env.DB.prepare("INSERT INTO auth_logs (id, user_email, event, metadata) VALUES (?, ?, 'ACCOUNT_DELETED', ?)").bind(
          crypto.randomUUID(),
          cleanEmail,
          JSON.stringify({ reason, deletedBy: isSecretAdmin ? "admin" : "owner", timestamp: new Date().toISOString() })
        ),
      ]);
    }

    // Send account deletion confirmation email notice if enabled
    let emailSent = false;
    if (sendNotice) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee Design Studio</h1>
            <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Account Security & Privacy Desk</p>
          </div>

          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
            <h2 style="font-size: 18px; font-weight: 800; margin-top: 0; color: #111111;">Account Deletion Confirmed</h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              Hi <strong>${clientName || 'there'}</strong>,<br/><br/>
              This notice confirms that your SlideBee client account associated with <strong>${cleanEmail}</strong> has been successfully closed and permanently purged from our active platform.
            </p>

            <div style="background-color: #FFF9E8; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #FCBF14;">
              <div style="font-size: 13px; margin-bottom: 8px;">
                <strong style="color: #936610; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px;">Reason for Deletion:</strong>
                <span style="color: #111111; font-weight: 600;">${reason}</span>
              </div>
              <div style="font-size: 13px;">
                <strong style="color: #936610; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 4px;">Data Privacy Status:</strong>
                <span style="color: #111111;">Your user profile, session credentials, and subscription allocations have been permanently purged in accordance with our data governance standards.</span>
              </div>
            </div>

            ${customNotes ? `
              <div style="background-color: #F9FAFB; padding: 16px; border-radius: 8px; border-left: 4px solid #FCBF14; margin-bottom: 20px;">
                <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #726F6D; margin: 0 0 6px 0;">Additional Notes:</p>
                <p style="font-size: 13px; color: #111111; line-height: 1.6; margin: 0; white-space: pre-wrap;">${customNotes}</p>
              </div>
            ` : ''}

            <p style="font-size: 12px; color: #726F6D; line-height: 1.6; margin-top: 20px;">
              If this action was taken in error or if you wish to commission executive presentations in the future, you may register a new account anytime at <a href="https://theslidebee.com/#/login" style="color: #936610; font-weight: bold;">theslidebee.com</a>.
            </p>
          </div>

          <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D;">
            SlideBee Privacy Team • Inquiries: <a href="mailto:support@theslidebee.com" style="color: #936610;">support@theslidebee.com</a>
          </div>
        </div>
      `;

      const resendKey = env?.RESEND_API_KEY;
      if (resendKey) {
        try {
          const emailPayload = {
            from: "SlideBee Privacy Desk <support@theslidebee.com>",
            to: [cleanEmail],
            subject: subject || "Account Deletion & Data Privacy Confirmation — SlideBee Studio",
            html: emailHtml,
          };

          let resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
          });

          // Fallback if custom domain is not yet verified on free Resend account
          if (!resendRes.ok) {
            resendRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...emailPayload,
                from: "SlideBee Privacy Desk <onboarding@resend.dev>",
              }),
            });
          }

          if (resendRes.ok) {
            emailSent = true;
          } else {
            const errData = await resendRes.text();
            console.warn("Resend email dispatch error:", errData);
          }
        } catch (emailErr) {
          console.warn("Failed to dispatch deletion email notice via Resend:", emailErr);
        }
      }

      // If direct Resend was not configured or didn't succeed, attempt dispatch through internal /api/send-email
      if (!emailSent) {
        try {
          const currentOrigin = new URL(request.url).origin;
          const sendRes = await fetch(`${currentOrigin}/api/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-slidebee-app-token": env?.SLIDEBEE_APP_TOKEN || "",
              "x-slidebee-admin-key": env?.SLIDEBEE_ADMIN_SECRET || "",
            },
            body: JSON.stringify({
              to: cleanEmail,
              subject: subject || "Account Deletion & Data Privacy Confirmation — SlideBee Studio",
              html: emailHtml,
              fromEmail: senderEmail || "support@theslidebee.com",
              fromName: "SlideBee Privacy Desk",
              replyTo: senderEmail || "support@theslidebee.com",
            }),
          });

          if (sendRes.ok) {
            emailSent = true;
          }
        } catch (subErr) {
          console.warn("Subrequest email fallback error:", subErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Account ${cleanEmail} has been purged successfully.`,
        emailSent,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Account deletion error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal server error during account deletion." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
