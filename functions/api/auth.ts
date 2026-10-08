// Cloudflare Pages Function: /api/auth
// Serverless edge authentication engine backed by Cloudflare D1 with zero inactivity pause.
// Entry router — delegates each action to a focused handler module.

import { getCorsHeaders, jsonResponse, Env } from "./auth/utils";
import { handleSession } from "./auth/session";
import { handleLogin } from "./auth/login";
import { handleOAuthUrl, handleOAuthVerify } from "./auth/oauth";
import { handleSignup } from "./auth/signup";
import { handleLogout, handleUpdateUser, handleResetPassword, handleResetPasswordConfirm } from "./auth/account";

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
    const { action = "session" } = body;

    // Diagnostic check for OAuth environment configuration
    if (action === "diag_env") {
      const allKeys = Object.keys(env || {});
      const hasClientId = Boolean((env as any)?.GOOGLE_CLIENT_ID || (env as any)?.GOOGLE_ID || (env as any)?.VITE_GOOGLE_CLIENT_ID);
      const hasClientSecret = Boolean((env as any)?.GOOGLE_CLIENT_SECRET || (env as any)?.GOOGLE_SECRET || (env as any)?.VITE_GOOGLE_CLIENT_SECRET);
      return jsonResponse({
        hasClientId,
        hasClientSecret,
        configuredKeys: allKeys.map(k => k.includes("SECRET") || k.includes("KEY") || k.includes("PASSWORD") ? `${k}(secured)` : k),
      }, 200, corsHeaders);
    }

    if (action === "session")               return await handleSession(request, env, body);
    if (action === "login")                 return await handleLogin(request, env, body);
    if (action === "oauth_url")             return await handleOAuthUrl(request, env, body);
    if (action === "oauth_verify")          return await handleOAuthVerify(request, env, body);
    if (action === "signup")                return await handleSignup(request, env, body);
    if (action === "logout")                return await handleLogout(request, env, body);
    if (action === "update_user")           return await handleUpdateUser(request, env, body);
    if (action === "reset_password")        return await handleResetPassword(request, env, body);
    if (action === "reset_password_confirm") return await handleResetPasswordConfirm(request, env, body);

    return jsonResponse({ error: { message: "Invalid action or database unavailable." } }, 400, corsHeaders);
  } catch (err: any) {
    return jsonResponse({ error: { message: err?.message || "Internal server error." } }, 500, corsHeaders);
  }
}
