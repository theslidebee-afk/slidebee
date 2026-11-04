// Handlers: action=logout, action=update_user, action=reset_password, action=reset_password_confirm
import { Env, getCorsHeaders, hashPassword, jsonResponse, isOriginAllowed, ALLOWED_ORIGINS } from "./utils";

export async function handleLogout(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);
  const { sessionId } = body;
  const token = sessionId || request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (env.DB && token) {
    await env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(token).run();
  }
  return jsonResponse({ error: null }, 200, corsHeaders);
}

export async function handleUpdateUser(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);
  const { email, password, full_name, sessionId } = body;
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!env.DB) {
    return jsonResponse({ error: { message: "Database unavailable." } }, 500, corsHeaders);
  }

  if (!cleanEmail) {
    return jsonResponse({ error: { message: "Email is required." } }, 400, corsHeaders);
  }

  // Authorize caller session
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
  const adminKey = request.headers.get("x-slidebee-admin-key")?.trim();
  const token = (sessionId || bearerToken || adminKey)?.trim();

  let isAuthorized = false;
  if (env.SLIDEBEE_ADMIN_SECRET && (token === env.SLIDEBEE_ADMIN_SECRET || adminKey === env.SLIDEBEE_ADMIN_SECRET)) {
    isAuthorized = true;
  } else if (token) {
    const session: any = await env.DB.prepare(
      `SELECT email, role FROM sessions WHERE id = ? AND expires_at > datetime('now')`
    ).bind(token).first();

    if (session) {
      const sessionEmail = String(session.email || "").toLowerCase().trim();
      const isAdmin = session.role === "admin" || session.role === "super_admin" || sessionEmail === "admin@theslidebee.com";
      if (isAdmin || sessionEmail === cleanEmail) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return jsonResponse({ error: { message: "Unauthorized: Active session required to update account details." } }, 401, corsHeaders);
  }

  if (password) {
    if (password.length < 8) {
      return jsonResponse({ error: { message: "Password must be at least 8 characters in length." } }, 400, corsHeaders);
    }
    const salt = crypto.randomUUID();
    const pwdHash = await hashPassword(password, salt);
    await env.DB.prepare(`UPDATE users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE email = ?`).bind(pwdHash, salt, cleanEmail).run();
  }
  if (full_name) {
    await env.DB.prepare(`UPDATE profiles SET full_name = ? WHERE email = ?`).bind(full_name, cleanEmail).run();
  }
  return jsonResponse({ data: { message: "User updated successfully." }, error: null }, 200, corsHeaders);
}

export async function handleResetPassword(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);
  const { email } = body;
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!env.DB) {
    return jsonResponse({ error: { message: "Database unavailable." } }, 500, corsHeaders);
  }
  if (!cleanEmail) {
    return jsonResponse({ error: { message: "Email is required." } }, 400, corsHeaders);
  }

  const existingUser: any = await env.DB.prepare(
    "SELECT id, email, role FROM users WHERE email = ?"
  ).bind(cleanEmail).first();

  if (existingUser) {
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour validity

    // Clean up prior recovery sessions for this user
    await env.DB.prepare(
      "DELETE FROM sessions WHERE user_id = ? AND role = 'recovery'"
    ).bind(existingUser.id).run();

    // Create new recovery session in D1
    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, email, role, device_info, expires_at) VALUES (?, ?, ?, 'recovery', 'Password Reset Token', ?)"
    ).bind(resetToken, existingUser.id, cleanEmail, expiresAt).run();

    // Log security audit trail
    await env.DB.prepare(
      "INSERT INTO auth_logs (id, user_email, event, metadata) VALUES (?, ?, 'PASSWORD_RESET_REQUESTED', ?)"
    ).bind(crypto.randomUUID(), cleanEmail, JSON.stringify({ ip: request.headers.get("CF-Connecting-IP") || "Unknown" })).run();

    // Resolve application URL for reset link
    const reqOrigin = request.headers.get("Origin") || "";
    const baseOrigin = isOriginAllowed(reqOrigin) ? reqOrigin : "https://theslidebee.com";
    const resetLink = `${baseOrigin}/#/login?action=reset&token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Send email via Resend if RESEND_API_KEY is configured
    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      const resetEmailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF9E8; padding: 32px; border-radius: 16px; color: #111111;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #936610; font-size: 24px; font-weight: 800; margin: 0;">SlideBee</h1>
            <p style="color: #726F6D; font-size: 13px; margin-top: 4px;">Executive Presentation Design Studio</p>
          </div>

          <div style="background-color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid rgba(17,17,17,0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
            <h2 style="font-size: 18px; font-weight: 800; margin-top: 0; color: #111111;">Password Reset Request</h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              We received a request to reset the password for your SlideBee account (<strong>${cleanEmail}</strong>).
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
              Click the button below to choose a secure new password. This recovery link is valid for <strong>60 minutes</strong>.
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="background-color: #FCBF14; color: #111111; font-weight: 800; border-radius: 9999px; text-decoration: none; padding: 14px 28px; display: inline-block; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(252,191,20,0.3);">
                Reset Password
              </a>
            </div>

            <div style="background-color: #FFF9E8; padding: 14px; border-radius: 8px; border: 1px solid rgba(252,191,20,0.4); font-size: 12px; color: #936610; line-height: 1.5;">
              <strong>Security Note:</strong> If you did not request this password reset, no action is needed. Your current password remains secure and this link will expire automatically.
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #726F6D; line-height: 1.6;">
            SlideBee &bull; Curated Master PowerPoint Presentation Catalog<br/>
            Need assistance? Reply directly to this email or reach us at <a href="mailto:hello@theslidebee.com" style="color: #936610; text-decoration: underline;">hello@theslidebee.com</a>.
          </div>
        </div>
      `;

      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SlideBee Security <hello@theslidebee.com>",
            to: [cleanEmail],
            subject: "Reset Your SlideBee Password",
            html: resetEmailHtml,
          }),
        });

        if (!resendRes.ok) {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "SlideBee Security <onboarding@resend.dev>",
              to: [cleanEmail],
              subject: "Reset Your SlideBee Password",
              html: resetEmailHtml,
            }),
          });
        }
      } catch (mailErr) {
        console.warn("Failed to dispatch password reset email via Resend:", mailErr);
      }
    }
  }

  // Always return uniform message to prevent email enumeration
  return jsonResponse({
    data: { message: "If an account exists with this email, a secure password recovery link has been dispatched." },
    error: null,
  }, 200, corsHeaders);
}

export async function handleResetPasswordConfirm(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);

  if (!env.DB) {
    return jsonResponse({ error: { message: "Database unavailable." } }, 500, corsHeaders);
  }

  const resetToken = String(body?.token || "").trim();
  const newPassword = String(body?.password || "").trim();

  if (!resetToken || !newPassword) {
    return jsonResponse({ error: { message: "Recovery token and new password are required." } }, 400, corsHeaders);
  }
  if (newPassword.length < 8) {
    return jsonResponse({ error: { message: "Password must be at least 8 characters in length." } }, 400, corsHeaders);
  }

  // Verify token in sessions table
  const sessionRow: any = await env.DB.prepare(
    "SELECT id, user_id, email FROM sessions WHERE id = ? AND role = 'recovery' AND expires_at > datetime('now')"
  ).bind(resetToken).first();

  if (!sessionRow) {
    return jsonResponse({ error: { message: "Password reset link is invalid or has expired. Please request a new recovery link." } }, 400, corsHeaders);
  }

  // Update password hash in users table
  const newSalt = crypto.randomUUID();
  const newHash = await hashPassword(newPassword, newSalt);

  await env.DB.prepare(
    "UPDATE users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(newHash, newSalt, sessionRow.user_id).run();

  // Invalidate recovery token
  await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(resetToken).run();

  // Invalidate all prior sessions for this user
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(sessionRow.user_id).run();

  // Retrieve user and profile to issue a fresh active session
  const user: any = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(sessionRow.user_id).first();
  let profile: any = await env.DB.prepare("SELECT * FROM profiles WHERE id = ? OR email = ?").bind(sessionRow.user_id, sessionRow.email).first();

  const newSessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, email, role, device_info, expires_at) VALUES (?, ?, ?, ?, 'Browser', ?)"
  ).bind(newSessionId, user.id, user.email, user.role, expiresAt).run();

  // Log auth completion
  await env.DB.prepare(
    "INSERT INTO auth_logs (id, user_email, event, metadata) VALUES (?, ?, 'PASSWORD_RESET_COMPLETED', ?)"
  ).bind(crypto.randomUUID(), sessionRow.email, JSON.stringify({ ip: request.headers.get("CF-Connecting-IP") || "Unknown" })).run();

  const userObj = {
    id: user.id,
    email: user.email,
    role: user.role,
    user_metadata: { full_name: profile?.full_name, company: profile?.company },
  };

  return jsonResponse({
    data: {
      message: "Password has been successfully updated.",
      user: userObj,
      session: { access_token: newSessionId, expires_at: expiresAt, user: userObj },
      profile,
    },
    error: null,
  }, 200, corsHeaders);
}
