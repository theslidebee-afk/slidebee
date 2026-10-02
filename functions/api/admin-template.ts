// Cloudflare Pages Function: /api/admin-template
// Provides authorized administrative actions for template management in SlideBee
// Deletes template record from Cloudflare D1 and automatically purges associated presentation decks (.pptx) and slide images from Cloudflare R2

interface Env {
  DB?: any;
  SLIDEBEE_ADMIN_SECRET?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_R2_BUCKET?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

const DEFAULT_CF_ACCOUNT_ID = "9821e608622e999a9c0f06f52a168d97";
const DEFAULT_CF_BUCKET = "slidebee";
const PUBLIC_CDN_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

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
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-admin-key",
    "Vary": "Origin",
  };
}

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

async function isAuthorizedAdmin(request: Request, env: Env): Promise<boolean> {
  const adminSecret = env?.SLIDEBEE_ADMIN_SECRET;
  const authHeader = request.headers.get("Authorization");
  const adminKeyHeader = request.headers.get("x-slidebee-admin-key");

  if (adminSecret) {
    if (adminKeyHeader && adminKeyHeader === adminSecret) {
      return true;
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token === adminSecret) {
        return true;
      }
    }
  }

  // Authorize via active Cloudflare D1 admin session
  if (env?.DB) {
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (adminKeyHeader) {
      token = adminKeyHeader.trim();
    }

    if (token) {
      try {
        const activeSession = await env.DB.prepare(
          `SELECT email, role FROM sessions WHERE id = ? AND expires_at > datetime('now')`
        ).bind(token).first();

        if (activeSession) {
          const sessionEmail = String(activeSession.email || "").toLowerCase().trim();
          if (
            activeSession.role === "admin" ||
            activeSession.role === "super_admin" ||
            sessionEmail === "admin@theslidebee.com"
          ) {
            return true;
          }
        }
      } catch (e) {
        console.warn("D1 admin session check notice:", e);
      }
    }
  }

  return false;
}

function extractR2Key(urlStr: any): string | null {
  if (!urlStr || typeof urlStr !== "string") return null;
  const cdnPrefix = `${PUBLIC_CDN_BASE}/`;
  let key: string | null = null;
  if (urlStr.startsWith(cdnPrefix)) {
    key = urlStr.slice(cdnPrefix.length);
  } else if (urlStr.startsWith("templates/") || urlStr.startsWith("uploads/")) {
    key = urlStr;
  }
  if (!key) return null;

  key = key.split("?")[0].replace(/^\/+/, "");

  if (
    key.startsWith("logos/") ||
    key.startsWith("portfolio/") ||
    key === "" ||
    key === "test.png" ||
    key.startsWith("brand/")
  ) {
    return null;
  }

  return key;
}

// DELETE /api/admin-template?id=<template_id>
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  if (!(await isAuthorizedAdmin(request, env))) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized: Admin authorization required to delete templates.",
      }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(request.url);
    let templateId = url.searchParams.get("id");

    if (!templateId) {
      try {
        const body: any = await request.json();
        templateId = body?.id;
      } catch {
        // No JSON body
      }
    }

    if (!templateId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameter: id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!env?.DB) {
      return new Response(
        JSON.stringify({ success: false, error: "Database not available" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Retrieve template from D1 before deletion
    const deletedTemplate: any = await env.DB.prepare("SELECT * FROM templates WHERE id = ?").bind(templateId).first();

    if (!deletedTemplate) {
      return new Response(
        JSON.stringify({ success: false, error: "Template not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete record from Cloudflare D1
    await env.DB.prepare("DELETE FROM templates WHERE id = ?").bind(templateId).run();

    const cleanedR2Keys: string[] = [];
    const failedR2Keys: string[] = [];

    // Purge associated presentation decks and preview images from Cloudflare R2 bucket
    const cfAccountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_CF_ACCOUNT_ID;
    const cfBucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_CF_BUCKET;
    const cfToken = env?.CLOUDFLARE_API_TOKEN || "";

    const keysToClean = new Set<string>();

    const addKey = (val: any) => {
      const k = extractR2Key(val);
      if (k) keysToClean.add(k);
    };

    addKey(deletedTemplate.download_url);
    addKey(deletedTemplate.image_url);
    addKey(deletedTemplate.thumbnail_url);

    let slidesArray = deletedTemplate.slides;
    if (typeof slidesArray === "string") {
      try {
        slidesArray = JSON.parse(slidesArray);
      } catch {
        slidesArray = [];
      }
    }

    if (Array.isArray(slidesArray)) {
      for (const s of slidesArray) {
        addKey(s);
      }
    }

    for (const key of keysToClean) {
      try {
        // Safety Check: Verify no other remaining template in D1 references this exact file
        const check = await env.DB.prepare(
          "SELECT id FROM templates WHERE (download_url LIKE ? OR image_url LIKE ? OR thumbnail_url LIKE ?) LIMIT 1"
        ).bind(`%${key}%`, `%${key}%`, `%${key}%`).first();

        if (check) {
          continue;
        }

        // Delete from Cloudflare R2
        if (cfToken) {
          const r2Url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${cfBucket}/objects/${encodeURIComponent(key)}`;
          const r2Res = await fetch(r2Url, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${cfToken}`,
            },
          });

          if (r2Res.ok) {
            const r2Json: any = await r2Res.json();
            if (r2Json.success) {
              cleanedR2Keys.push(key);
            } else {
              failedR2Keys.push(key);
            }
          } else {
            failedR2Keys.push(key);
          }
        }
      } catch (r2Err) {
        console.warn(`Error deleting R2 object ${key}:`, r2Err);
        failedR2Keys.push(key);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Template and associated R2 assets deleted successfully.",
        deletedCount: 1,
        deletedId: templateId,
        deletedR2Assets: cleanedR2Keys,
        failedR2Assets: failedR2Keys.length > 0 ? failedR2Keys : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// PUT /api/admin-template: Update existing template record in Cloudflare D1
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  if (!(await isAuthorizedAdmin(request, env))) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized: Admin authorization required to update templates.",
      }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!env?.DB) {
    return new Response(
      JSON.stringify({ success: false, error: "Database not available" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: any = await request.json();
    const templateId = body?.id;

    if (!templateId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameter: id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existing: any = await env.DB.prepare("SELECT * FROM templates WHERE id = ?").bind(templateId).first();
    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, error: "Template not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedFields = [
      "title", "slug", "code", "category", "price_inr", "price_usd", "original_price_inr",
      "image_url", "thumbnail_url", "slides_count", "rating", "downloads", "formats", "slides",
      "description", "features", "download_url", "file_name", "file_size", "is_credit_eligible",
      "is_featured", "is_published", "is_premium"
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        let val = body[key];
        if (key === "formats" || key === "slides" || key === "features") {
          if (typeof val === "object") {
            val = JSON.stringify(val);
          }
        } else if (key === "is_published" || key === "is_credit_eligible" || key === "is_premium" || key === "is_featured") {
          val = val ? 1 : 0;
        } else if (key === "price_inr" || key === "price_usd" || key === "original_price_inr") {
          val = Number(val) || 0;
        } else if (key === "slides_count") {
          val = Number(val) || 1;
        }
        updates[key] = val;
      }
    }

    if (body.slide_count !== undefined && updates.slides_count === undefined) {
      updates.slides_count = Number(body.slide_count) || 1;
    }

    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No fields provided to update" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const setClauses = updateKeys.map((k) => `${k} = ?`).join(", ");
    const params = updateKeys.map((k) => updates[k]);
    params.push(templateId);

    await env.DB.prepare(`UPDATE templates SET ${setClauses} WHERE id = ?`).bind(...params).run();

    const updatedTemplate: any = await env.DB.prepare("SELECT * FROM templates WHERE id = ?").bind(templateId).first();

    if (updatedTemplate) {
      for (const col of ["formats", "slides", "features"]) {
        if (typeof updatedTemplate[col] === "string") {
          try {
            updatedTemplate[col] = JSON.parse(updatedTemplate[col]);
          } catch {}
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Template updated successfully.",
        template: updatedTemplate,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// POST /api/admin-template: Create a new template record in Cloudflare D1
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  if (!(await isAuthorizedAdmin(request, env))) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized: Admin authorization required to create templates.",
      }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!env?.DB) {
    return new Response(
      JSON.stringify({ success: false, error: "Database not available" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body: any = await request.json();
    const title = String(body?.title || "").trim();

    if (!title) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameter: title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templateId = body?.id || crypto.randomUUID();
    const slug = body?.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const code = body?.code || `SLD-${Math.floor(100 + Math.random() * 900)}`;

    const effectiveSlides = Array.isArray(body?.slides) && body.slides.length > 0
      ? body.slides
      : (body?.thumbnail_url ? [body.thumbnail_url] : []);
    const effectiveSlidesCount = Number(body?.slides_count || body?.slide_count) || (effectiveSlides.length > 0 ? effectiveSlides.length : 25);

    const priceInr = Number(body?.price_inr) || 0;
    const priceUsd = Number(body?.price_usd) || 0;

    const row = {
      id: templateId,
      slug,
      code,
      title,
      category: body?.category || "Business",
      price_inr: priceInr,
      price_usd: priceUsd,
      original_price_inr: Number(body?.original_price_inr) || (priceInr * 2),
      image_url: body?.thumbnail_url || body?.image_url || effectiveSlides[0] || "",
      thumbnail_url: body?.thumbnail_url || body?.image_url || effectiveSlides[0] || "",
      slides_count: effectiveSlidesCount,
      rating: Number(body?.rating) || 4.9,
      downloads: Number(body?.downloads) || 0,
      formats: JSON.stringify(body?.formats || ["Master PowerPoint (.pptx)"]),
      slides: JSON.stringify(effectiveSlides),
      description: body?.description || "Executive presentation deck layout.",
      features: JSON.stringify(body?.features || [
        `${effectiveSlidesCount}+ High-Impact Slides`,
        "16:9 Widescreen Layout",
        "Master PowerPoint (.pptx)"
      ]),
      download_url: body?.download_url || "",
      file_name: body?.file_name || "Master_Deck.pptx",
      file_size: body?.file_size || "4.5 MB",
      is_credit_eligible: body?.is_credit_eligible ? 1 : 0,
      is_featured: body?.is_featured ? 1 : 0,
      is_published: body?.is_published !== false ? 1 : 0,
      is_premium: priceInr > 0 ? 1 : 0,
    };

    const keys = Object.keys(row);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO templates (${keys.join(", ")}) VALUES (${placeholders})`;
    const params = keys.map((k) => (row as any)[k]);

    await env.DB.prepare(sql).bind(...params).run();

    const createdTemplate: any = await env.DB.prepare("SELECT * FROM templates WHERE id = ?").bind(templateId).first();
    if (createdTemplate) {
      for (const col of ["formats", "slides", "features"]) {
        if (typeof createdTemplate[col] === "string") {
          try {
            createdTemplate[col] = JSON.parse(createdTemplate[col]);
          } catch {}
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Template created successfully.",
        template: createdTemplate,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

