// Handler: action=session — validates an existing session token against D1
import { Env, getCorsHeaders, jsonResponse } from "./utils";

export async function handleSession(request: Request, env: Env, body: any) {
  const corsHeaders = getCorsHeaders(request);
  const { sessionId } = body;
  const token = sessionId || request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return jsonResponse({ user: null, session: null }, 200, corsHeaders);
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
      return jsonResponse({ user: null, session: null }, 200, corsHeaders);
    }

    const user = {
      id: session.user_id,
      email: session.email,
      role: session.role,
      user_metadata: { full_name: session.full_name, company: session.company },
    };

    return jsonResponse({ user, session: { access_token: session.id, user } }, 200, corsHeaders);
  }

  return jsonResponse({ user: null, session: null }, 200, corsHeaders);
}
