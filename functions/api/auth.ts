// Cloudflare Pages Function: /api/auth
// Serverless edge authentication engine backed by Cloudflare D1 with zero inactivity pause.

interface Env {
  DB?: any;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
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
        if (calculatedHash !== user.password_hash) {
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
