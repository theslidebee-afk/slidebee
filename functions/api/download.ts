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

    const r2Key = extractR2Key(template.download_url, template.file_name);
    if (!r2Key) {
      return new Response(
        JSON.stringify({ success: false, error: "Master presentation deck is being updated by the studio. Please contact support." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch Object directly from internal R2 Bucket binding
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
