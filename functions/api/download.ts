// Cloudflare Pages Function: /api/download
// Enterprise Secure Serverless Streaming Endpoint for Presentation Deliverables (.pptx)
// 1. Verifies template and entitlement in Cloudflare D1
// 2. Streams binary directly from Cloudflare R2 using native internal binding
// 3. ZERO R2 CDN exposure: The public R2 URL is never returned to the client browser

interface Env {
  DB?: any;
  R2_BUCKET?: any;
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
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".pages.dev")
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

function extractR2Key(downloadUrl: string, fileName?: string): string {
  if (downloadUrl) {
    if (downloadUrl.includes("r2.dev/")) {
      return downloadUrl.split("r2.dev/")[1];
    }
    if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
      try {
        const u = new URL(downloadUrl);
        return u.pathname.replace(/^\/+/, "");
      } catch {}
    }
    if (downloadUrl.startsWith("templates/")) {
      return downloadUrl;
    }
  }

  if (fileName && fileName.endsWith(".pptx")) {
    return `templates/decks/${fileName}`;
  }

  return "";
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);
  const url = new URL(request.url);

  const templateId = url.searchParams.get("id") || url.searchParams.get("templateId") || url.searchParams.get("code");

  if (!templateId) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing template identifier parameter." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({ success: false, error: "Database service unavailable." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. Fetch Template Metadata from D1
    const template: any = await env.DB.prepare(
      `SELECT id, code, title, download_url, file_name, is_premium FROM templates WHERE id = ? OR code = ? OR slug = ? LIMIT 1`
    ).bind(templateId, templateId, templateId).first();

    if (!template) {
      return new Response(
        JSON.stringify({ success: false, error: "Requested presentation template not found." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Entitlement verification for premium templates
    const isFreeTier = template.is_premium === 0 || template.is_premium === false;

    if (!isFreeTier) {
      const authHeader = request.headers.get("Authorization");
      const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
      const queryToken = url.searchParams.get("token") || url.searchParams.get("sessionId");
      const adminKey = request.headers.get("x-slidebee-admin-key")?.trim();
      const token = (bearerToken || queryToken || adminKey)?.trim();

      let isEntitled = false;

      // Check admin privilege
      if (
        (env as any)?.SLIDEBEE_ADMIN_SECRET &&
        (token === (env as any).SLIDEBEE_ADMIN_SECRET || adminKey === (env as any).SLIDEBEE_ADMIN_SECRET)
      ) {
        isEntitled = true;
      } else if (token) {
        const session: any = await env.DB.prepare(
          `SELECT email, role FROM sessions WHERE id = ? AND expires_at > datetime('now')`
        ).bind(token).first();

        if (session) {
          const sessionEmail = String(session.email || "").toLowerCase().trim();
          if (
            session.role === "admin" ||
            session.role === "super_admin" ||
            sessionEmail === "admin@theslidebee.com"
          ) {
            isEntitled = true;
          } else {
            // Check user profile and subscriptions
            const profile: any = await env.DB.prepare(
              `SELECT tier, tier_expires_at, purchased_items FROM profiles WHERE email = ?`
            ).bind(sessionEmail).first();

            if (profile) {
              // 1. Pro / VIP subscription check
              const isProActive =
                ["monthly", "yearly", "lifetime"].includes(profile.tier) &&
                (!profile.tier_expires_at || new Date(profile.tier_expires_at) > new Date());

              if (isProActive) {
                isEntitled = true;
              } else {
                // 2. Purchased item check
                try {
                  const purchased = JSON.parse(profile.purchased_items || "[]");
                  const hasPurchased = purchased.some(
                    (p: any) =>
                      p.id === template.id ||
                      p.code === template.code ||
                      p.slug === template.slug
                  );
                  if (hasPurchased) {
                    isEntitled = true;
                  }
                } catch {}

                // 3. Orders table fallback check
                if (!isEntitled) {
                  const completedOrder: any = await env.DB.prepare(
                    `SELECT id FROM orders WHERE email = ? AND (project_brief LIKE ? OR service_type LIKE ?) AND status = 'completed'`
                  ).bind(sessionEmail, `%${template.code || template.id}%`, `%${template.title}%`).first();

                  if (completedOrder) {
                    isEntitled = true;
                  }
                }
              }
            }
          }
        }
      }

      if (!isEntitled) {
        return new Response(
          JSON.stringify({
            success: false,
            error: token
              ? "Access denied. Active Pro subscription or individual purchase required to download this master presentation."
              : "Authentication and active license required to download this master presentation. Please sign in with an account that has acquired this template or holds an active Pro subscription.",
          }),
          { status: token ? 403 : 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const r2Key = extractR2Key(template.download_url, template.file_name);
    if (!r2Key) {
      return new Response(
        JSON.stringify({ success: false, error: "Master presentation deck is being updated by the studio. Please contact support." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch Object directly from internal R2 Bucket binding
    let r2Object: any = null;
    if (env.R2_BUCKET && typeof env.R2_BUCKET.get === "function") {
      r2Object = await env.R2_BUCKET.get(r2Key);
      
      // Fallback try without prefix if nested prefix was stored differently
      if (!r2Object && r2Key.startsWith("templates/decks/")) {
        const rawFileName = r2Key.replace("templates/decks/", "");
        r2Object = await env.R2_BUCKET.get(rawFileName);
      }
    }

    // If R2 binding is not available or local dev simulation
    if (!r2Object) {
      if (template.download_url && template.download_url.startsWith("http")) {
        try {
          const parsedUrl = new URL(template.download_url);
          // Anti-SSRF: restrict outbound fetches strictly to trusted CDN endpoints
          if (!parsedUrl.hostname.endsWith(".r2.dev") && !parsedUrl.hostname.endsWith(".theslidebee.com")) {
            return new Response(
              JSON.stringify({ success: false, error: "Invalid storage host origin." }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid storage URL format." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const proxyRes = await fetch(template.download_url);
        if (proxyRes.ok) {
          const streamHeaders = new Headers();
          streamHeaders.set("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
          const safeFileName = (template.file_name || `${template.code || "SlideBee"}_Master.pptx`).replace(/[^a-zA-Z0-9_\-\. ]/g, "_");
          streamHeaders.set("Content-Disposition", `attachment; filename="${safeFileName}"`);
          streamHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

          return new Response(proxyRes.body, {
            status: 200,
            headers: streamHeaders,
          });
        }
      }

      return new Response(
        JSON.stringify({ success: false, error: "Master presentation file could not be retrieved from secure storage." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Stream binary directly to client with attachment headers
    const safeFileName = (template.file_name || `${template.code || "SlideBee"}_Master.pptx`).replace(/[^a-zA-Z0-9_\-\. ]/g, "_");
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    responseHeaders.set("Content-Disposition", `attachment; filename="${safeFileName}"`);
    responseHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    if (r2Object.size) {
      responseHeaders.set("Content-Length", String(r2Object.size));
    }

    return new Response(r2Object.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Failed to stream download." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
