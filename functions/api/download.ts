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

  if (fileName && (fileName.endsWith(".pptx") || fileName.endsWith(".potx") || fileName.endsWith(".ppt"))) {
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
    let authenticatedUserEmail = "";
    let isSingleUsePurchase = false;

    if (!isFreeTier) {
      const authHeader = request.headers.get("Authorization");
      const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
      const queryToken = url.searchParams.get("token") || url.searchParams.get("sessionId");
      const adminKey = request.headers.get("x-slidebee-admin-key")?.trim();
      const token = (bearerToken || queryToken || adminKey)?.trim();

      let isEntitled = false;

      // Check cryptographic single-use download token first (for one-time browser checkout download)
      if (token && token.startsWith("sdt_")) {
        const tokenRecord: any = await env.DB.prepare(
          `SELECT * FROM single_use_download_tokens WHERE token = ?`
        ).bind(token).first();

        if (tokenRecord) {
          const isExpired = new Date(tokenRecord.expires_at) < new Date();
          if (tokenRecord.is_consumed === 1 || isExpired) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "This single-use download session has already been completed or has expired. In accordance with SlideBee digital asset security policies, presentation decks can only be downloaded once within the browser upon checkout.",
              }),
              { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const tokenMatchesTemplate =
            tokenRecord.template_id === template.id ||
            tokenRecord.template_id === template.code ||
            tokenRecord.template_id === template.slug;

          if (!tokenMatchesTemplate) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Download token is not valid for this presentation deck.",
              }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Atomic consumption to prevent concurrent replays
          const updateRes = await env.DB.prepare(
            `UPDATE single_use_download_tokens SET is_consumed = 1, consumed_at = datetime('now') WHERE token = ? AND is_consumed = 0`
          ).bind(token).run();

          if (!updateRes.success && updateRes.changes === 0) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "This single-use download session has already been completed.",
              }),
              { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          isEntitled = true;
          isSingleUsePurchase = true;
          authenticatedUserEmail = tokenRecord.client_email;
        }
      }

      // Check admin privilege
      if (!isEntitled && (env as any)?.SLIDEBEE_ADMIN_SECRET && (token === (env as any).SLIDEBEE_ADMIN_SECRET || adminKey === (env as any).SLIDEBEE_ADMIN_SECRET)) {
        isEntitled = true;
        authenticatedUserEmail = "admin@theslidebee.com";
      } else if (!isEntitled && token) {
        const session: any = await env.DB.prepare(
          `SELECT email, role FROM sessions WHERE id = ? AND expires_at > datetime('now')`
        ).bind(token).first();

        if (session) {
          const sessionEmail = String(session.email || "").toLowerCase().trim();
          authenticatedUserEmail = sessionEmail;

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
              : "Authentication and active license required to download this master presentation. Please sign in with an account that holds an active Pro subscription or complete checkout.",
          }),
          { status: token ? 403 : 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Log download event in D1
    try {
      const clientIp = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
      const userAgent = request.headers.get("User-Agent") || "Unknown";
      await env.DB.prepare(
        `INSERT INTO download_logs (id, user_email, template_id, template_title, tier, is_premium, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(),
        authenticatedUserEmail || "guest",
        template.id,
        template.title,
        isSingleUsePurchase ? "standalone_purchase" : "license",
        template.is_premium ? 1 : 0,
        clientIp,
        userAgent
      ).run();
    } catch (logErr) {
      console.warn("Download log notice:", logErr);
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
          const safeFileName = (template.file_name || `${template.code || "SlideBee"}_Master.pptx`).replace(/[^a-zA-Z0-9_\-\. ]/g, "_");
          const isPotx = safeFileName.toLowerCase().endsWith(".potx");
          const streamHeaders = new Headers();
          streamHeaders.set(
            "Content-Type",
            isPotx
              ? "application/vnd.openxmlformats-officedocument.presentationml.template"
              : "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          );
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
    const isPotx = safeFileName.toLowerCase().endsWith(".potx");
    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      isPotx
        ? "application/vnd.openxmlformats-officedocument.presentationml.template"
        : "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
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
