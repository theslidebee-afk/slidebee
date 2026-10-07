// Handler: action=oauth_url, action=oauth_verify — Google OAuth URL generation and token verification
import { Env, getCorsHeaders, hashPassword, jsonResponse, ALLOWED_ORIGINS } from "./utils";

export async function handleOAuthUrl(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);
  const provider = String(body.provider || "google").toLowerCase();
  const redirectUri = String(body.redirectTo || `${ALLOWED_ORIGINS[0]}/auth/callback`);
  const googleClientId =
    (env as any)?.GOOGLE_CLIENT_ID ||
    (env as any)?.GOOGLE_ID ||
    (env as any)?.VITE_GOOGLE_CLIENT_ID ||
    "442338061739-uhlto1rvjjp36m67erc3q1b2ljn6kl1b.apps.googleusercontent.com";

  if (provider === "google") {
    if (googleClientId) {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${crypto.randomUUID()}`;
      return jsonResponse({ data: { url: authUrl } }, 200, corsHeaders);
    }
    return jsonResponse({
      error: {
        message: "Google OAuth is ready to connect. Please add GOOGLE_CLIENT_ID to your Cloudflare Pages environment variables, or sign in directly with your email and password below."
      }
    }, 200, corsHeaders);
  }

  return jsonResponse({ error: { message: `OAuth provider ${provider} not supported.` } }, 400, corsHeaders);
}

export async function handleOAuthVerify(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);
  const { id_token } = body;
  let userEmail = "";
  let userName = String(body.name || "").trim();

  const clientId =
    env.GOOGLE_CLIENT_ID ||
    (env as any)?.GOOGLE_ID ||
    (env as any)?.VITE_GOOGLE_CLIENT_ID ||
    "442338061739-uhlto1rvjjp36m67erc3q1b2ljn6kl1b.apps.googleusercontent.com";

  // 1. Cryptographically verify id_token with Google tokeninfo service
  if (id_token && typeof id_token === "string" && id_token.includes(".")) {
    try {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token.trim())}`);
      if (verifyRes.ok) {
        const tokenInfo: any = await verifyRes.json();
        const audMatches = tokenInfo.aud === clientId || tokenInfo.azp === clientId;
        const isVerified = tokenInfo.email_verified === "true" || tokenInfo.email_verified === true;

        if (audMatches && isVerified && tokenInfo.email) {
          userEmail = String(tokenInfo.email).toLowerCase().trim();
          if (tokenInfo.name && !userName) {
            userName = String(tokenInfo.name).trim();
          }
        } else {
          return jsonResponse({ error: { message: "Google token validation failed: audience mismatch or unverified email." } }, 401, corsHeaders);
        }
      } else {
        return jsonResponse({ error: { message: "Google token signature verification failed." } }, 401, corsHeaders);
      }
    } catch (e) {
      console.warn("Google tokeninfo verification error:", e);
      return jsonResponse({ error: { message: "Failed to communicate with identity provider." } }, 502, corsHeaders);
    }
  }

  // 2. If authorization code is provided, exchange with Google using GOOGLE_CLIENT_SECRET
  const clientSecret =
    env.GOOGLE_CLIENT_SECRET ||
    (env as any)?.GOOGLE_SECRET ||
    (env as any)?.VITE_GOOGLE_CLIENT_SECRET;

  if (body.code && clientSecret && !userEmail) {
    try {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: String(body.code),
          client_id: String(clientId || ""),
          client_secret: String(clientSecret),
          redirect_uri: String(body.redirect_uri || `${ALLOWED_ORIGINS[0]}/auth/callback`),
          grant_type: "authorization_code",
        }),
      });
      if (tokenRes.ok) {
        const tokenJson: any = await tokenRes.json();
        if (tokenJson.id_token) {
          const verifyCodeRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenJson.id_token)}`);
          if (verifyCodeRes.ok) {
            const tokenInfo: any = await verifyCodeRes.json();
            if (tokenInfo.email && (tokenInfo.email_verified === "true" || tokenInfo.email_verified === true)) {
              userEmail = String(tokenInfo.email).toLowerCase().trim();
              if (tokenInfo.name && !userName) userName = String(tokenInfo.name).trim();
            }
          }
        }
      }
    } catch (e) {
      console.warn("Google code exchange error:", e);
    }
  }

  if (!userEmail) {
    return jsonResponse({ error: { message: "No verified email found in identity provider token." } }, 401, corsHeaders);
  }

  if (env.DB) {
    let existingUser: any = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(userEmail).first();
    const isNewUser = !existingUser;
    const userId = existingUser?.id || `usr-google-${crypto.randomUUID().slice(0, 12)}`;

    if (!existingUser) {
      const salt = crypto.randomUUID();
      const dummyHash = await hashPassword(crypto.randomUUID(), salt);
      const role = userEmail === "admin@theslidebee.com" ? "admin" : "client";

      await env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, salt, role) VALUES (?, ?, ?, ?, ?)`
      ).bind(userId, userEmail, dummyHash, salt, role).run();

      await env.DB.prepare(
        `INSERT OR IGNORE INTO profiles (id, email, full_name, company, role, credits_total, credits_balance, tier)
         VALUES (?, ?, ?, 'Google Account', ?, 5, 5, 'free')`
      ).bind(`prf-${userId}`, userEmail, userName || "Google User", role).run();

      // Log registration event in auth_logs
      await env.DB.prepare(
        `INSERT INTO auth_logs (id, user_email, event, metadata) VALUES (?, ?, 'SIGNUP', ?)`
      ).bind(crypto.randomUUID(), userEmail, JSON.stringify({ provider: "google" })).run();
    } else {
      // Log login event in auth_logs
      await env.DB.prepare(
        `INSERT INTO auth_logs (id, user_email, event, metadata) VALUES (?, ?, 'LOGIN', ?)`
      ).bind(crypto.randomUUID(), userEmail, JSON.stringify({ provider: "google" })).run();
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const userRole = existingUser?.role || "client";

    await env.DB.prepare(
      `INSERT INTO sessions (id, user_id, email, role, expires_at) VALUES (?, ?, ?, ?, ?)`
    ).bind(sessionId, userId, userEmail, userRole, expiresAt).run();

    const profile: any = await env.DB.prepare(
      `SELECT * FROM profiles WHERE email = ?`
    ).bind(userEmail).first();

    const user = {
      id: userId,
      email: userEmail,
      role: userRole,
      user_metadata: {
        full_name: profile?.full_name || userName || "Client",
        company: profile?.company || "Google Account",
      },
    };

    const session = {
      access_token: sessionId,
      user,
      expires_at: expiresAt,
    };

    return jsonResponse({
      data: { user, session, profile, is_new_user: isNewUser },
      error: null,
    }, 200, corsHeaders);
  }

  // Fallback if DB not bound
  const fallbackUser = {
    id: `usr-google-${Date.now()}`,
    email: userEmail,
    role: "client",
    user_metadata: { full_name: userName || "Google User", company: "Google Account" },
  };
  return jsonResponse({
    data: {
      user: fallbackUser,
      session: { access_token: `sess-fallback-${Date.now()}`, user: fallbackUser },
    },
    error: null,
  }, 200, corsHeaders);
}
