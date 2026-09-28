// Cloudflare Pages Function: /api/auth
// Serverless edge authentication engine backed by Cloudflare D1 with zero inactivity pause.

interface Env {
  DB?: any;
  RESEND_API_KEY?: string;
  SLIDEBEE_ADMIN_SECRET?: string;
  SLIDEBEE_APP_TOKEN?: string;
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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-app-token",
    "Vary": "Origin",
  };
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + ":" + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
    const { action = "session", email, password, full_name, company, sessionId, deviceInfo } = body;
    const cleanEmail = String(email || "").trim().toLowerCase();

    // 1. Session Validation Action
    if (action === "session") {
      const token = sessionId || request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
      if (!token) {
        return new Response(JSON.stringify({ user: null, session: null }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (env.DB) {
        const session = await env.DB.prepare(
          `SELECT s.id, s.user_id, s.email, s.role, s.expires_at, 
                  p.full_name, p.company, p.credits_balance, p.credits_total
           FROM sessions s
           LEFT JOIN profiles p ON s.email = p.email
           WHERE s.id = ? AND s.expires_at > datetime('now')`
        ).bind(token).first();

        if (!session) {
          return new Response(JSON.stringify({ user: null, session: null }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const user = {
          id: session.user_id,
          email: session.email,
          role: session.role,
          user_metadata: { full_name: session.full_name, company: session.company },
        };

        return new Response(JSON.stringify({ user, session: { access_token: session.id, user } }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 2. User Login Action
    if (action === "login") {
      if (!cleanEmail || !password) {
        return new Response(JSON.stringify({ error: { message: "Email and password are required." } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (env.DB) {
        const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(cleanEmail).first();

        if (!user) {
          return new Response(JSON.stringify({ error: { message: "Invalid email or password." } }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const calculatedHash = await hashPassword(password, user.salt);
        const isPasswordValid = calculatedHash === user.password_hash;

        if (!isPasswordValid) {
          return new Response(JSON.stringify({ error: { message: "Invalid email or password." } }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Strict single session enforcement: delete prior sessions for this user
        await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(user.id).run();

        // Create new session valid for 7 days
        const newSessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare(
          `INSERT INTO sessions (id, user_id, email, role, device_info, expires_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(newSessionId, user.id, user.email, user.role, deviceInfo || "Browser", expiresAt).run();

        // Ensure profile exists and record last sign in
        let profile = await env.DB.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
        if (!profile) {
          const profileId = crypto.randomUUID();
          await env.DB.prepare(
            `INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance)
             VALUES (?, ?, ?, ?, ?, 5, 5)`
          ).bind(profileId, cleanEmail, full_name || cleanEmail.split("@")[0], company || "Enterprise", user.role).run();
          profile = await env.DB.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
        } else {
          await env.DB.prepare(`UPDATE profiles SET last_sign_in_at = datetime('now') WHERE email = ?`).bind(cleanEmail).run();
        }

        // Parse JSON fields on profile
        if (profile) {
          try { profile.purchased_items = JSON.parse(profile.purchased_items || "[]"); } catch {}
          try { profile.usage_history = JSON.parse(profile.usage_history || "[]"); } catch {}
        }

        // Log login event
        await env.DB.prepare(
          `INSERT INTO auth_logs (id, user_email, event, metadata) VALUES (?, ?, 'LOGIN', ?)`
        ).bind(crypto.randomUUID(), cleanEmail, JSON.stringify({ deviceInfo })).run();

        const userObj = {
          id: user.id,
          email: user.email,
          role: user.role,
          user_metadata: { full_name: profile?.full_name, company: profile?.company },
        };

        return new Response(JSON.stringify({
          data: {
            user: userObj,
            session: { access_token: newSessionId, expires_at: expiresAt, user: userObj },
            profile,
          },
          error: null,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!env.DB) {
        return new Response(JSON.stringify({ error: { message: "Cloudflare D1 database unavailable." } }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3. User Signup Action
    if (action === "signup") {
      if (!cleanEmail || !password) {
        return new Response(JSON.stringify({ error: { message: "Email and password are required." } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (env.DB) {
        const existing = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(cleanEmail).first();
        if (existing) {
          return new Response(JSON.stringify({ error: { message: "An account with this email already exists." } }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userId = crypto.randomUUID();
        const salt = crypto.randomUUID();
        const pwdHash = await hashPassword(password, salt);
        const role = ["admin@theslidebee.com", "admin@slidebee.com"].includes(cleanEmail) ? "admin" : "client";

        await env.DB.prepare(
          `INSERT INTO users (id, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?)`
        ).bind(userId, cleanEmail, pwdHash, salt, role).run();

        // Create initial profile with 5 starter credits
        const profileId = crypto.randomUUID();
        const resolvedName = full_name || cleanEmail.split("@")[0];
        const resolvedCompany = company || "Client Enterprise";
        await env.DB.prepare(
          `INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance)
           VALUES (?, ?, ?, ?, ?, 5, 5)`
        ).bind(profileId, cleanEmail, resolvedName, resolvedCompany, role).run();

        // Create active session
        const newSessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare(
          `INSERT INTO sessions (id, user_id, email, role, device_info, expires_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(newSessionId, userId, cleanEmail, role, deviceInfo || "Browser", expiresAt).run();

        // Log signup event
        await env.DB.prepare(
          `INSERT INTO auth_logs (id, user_email, event, metadata) VALUES (?, ?, 'SIGNUP', ?)`
        ).bind(crypto.randomUUID(), cleanEmail, JSON.stringify({ source: "web_register" })).run();

        const userObj = {
          id: userId,
          email: cleanEmail,
          role,
          user_metadata: { full_name: resolvedName, company: resolvedCompany },
        };

        return new Response(JSON.stringify({
          data: {
            user: userObj,
            session: { access_token: newSessionId, expires_at: expiresAt, user: userObj },
          },
          error: null,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 4. Logout Action
    if (action === "logout") {
      const token = sessionId || request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
      if (env.DB && token) {
        await env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(token).run();
      }
      return new Response(JSON.stringify({ error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Update User Action
    if (action === "update_user") {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: { message: "Database unavailable." } }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (cleanEmail && password) {
        const salt = crypto.randomUUID();
        const pwdHash = await hashPassword(password, salt);
        await env.DB.prepare(`UPDATE users SET password_hash = ?, salt = ? WHERE email = ?`).bind(pwdHash, salt, cleanEmail).run();
      }
      if (cleanEmail && full_name) {
        await env.DB.prepare(`UPDATE profiles SET full_name = ? WHERE email = ?`).bind(full_name, cleanEmail).run();
      }
      return new Response(JSON.stringify({ data: { message: "User updated successfully." }, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Reset Password Request Action (Generates secure token & dispatches email via Resend)
    if (action === "reset_password") {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: { message: "Database unavailable." } }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!cleanEmail) {
        return new Response(JSON.stringify({ error: { message: "Email is required." } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
      return new Response(JSON.stringify({
        data: { message: "If an account exists with this email, a secure password recovery link has been dispatched." },
        error: null,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Reset Password Confirm Action (Completes reset with token)
    if (action === "reset_password_confirm") {
      if (!env.DB) {
        return new Response(JSON.stringify({ error: { message: "Database unavailable." } }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resetToken = String(body?.token || "").trim();
      const newPassword = String(body?.password || "").trim();

      if (!resetToken || !newPassword) {
        return new Response(JSON.stringify({ error: { message: "Recovery token and new password are required." } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (newPassword.length < 8) {
        return new Response(JSON.stringify({ error: { message: "Password must be at least 8 characters in length." } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify token in sessions table
      const sessionRow: any = await env.DB.prepare(
        "SELECT id, user_id, email FROM sessions WHERE id = ? AND role = 'recovery' AND expires_at > datetime('now')"
      ).bind(resetToken).first();

      if (!sessionRow) {
        return new Response(JSON.stringify({ error: { message: "Password reset link is invalid or has expired. Please request a new recovery link." } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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

      return new Response(JSON.stringify({
        data: {
          message: "Password has been successfully updated.",
          user: userObj,
          session: { access_token: newSessionId, expires_at: expiresAt, user: userObj },
          profile,
        },
        error: null,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default fallback
    return new Response(JSON.stringify({ error: { message: "Invalid action or database unavailable." } }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: { message: err?.message || "Internal server error." } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
