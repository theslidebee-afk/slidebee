// Handler: action=signup — new user registration with D1 storage and session creation
import { Env, getCorsHeaders, hashPassword, jsonResponse } from "./utils";

export async function handleSignup(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);
  const { email, password, full_name, company, deviceInfo } = body;
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail || !password) {
    return jsonResponse({ error: { message: "Email and password are required." } }, 400, corsHeaders);
  }

  if (password.length < 8) {
    return jsonResponse({ error: { message: "Password must be at least 8 characters in length." } }, 400, corsHeaders);
  }

  if (env.DB) {
    const existing = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(cleanEmail).first();
    if (existing) {
      return jsonResponse({ error: { message: "An account with this email already exists." } }, 400, corsHeaders);
    }

    const userId = crypto.randomUUID();
    const salt = crypto.randomUUID();
    const pwdHash = await hashPassword(password, salt);
    const role = cleanEmail === "admin@theslidebee.com" ? "admin" : "client";

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

    return jsonResponse({
      data: {
        user: userObj,
        session: { access_token: newSessionId, expires_at: expiresAt, user: userObj },
      },
      error: null,
    }, 200, corsHeaders);
  }

  return jsonResponse({ error: { message: "Cloudflare D1 database unavailable." } }, 500, corsHeaders);
}
