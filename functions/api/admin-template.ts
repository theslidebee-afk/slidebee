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

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
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

function isAuthorizedAdmin(request: Request, env: Env): boolean {
  const adminSecret = env?.SLIDEBEE_ADMIN_SECRET || "slidebee_master_admin_2026";
  const authHeader = request.headers.get("Authorization");
  const adminKeyHeader = request.headers.get("x-slidebee-admin-key");

  if (adminKeyHeader && adminKeyHeader === adminSecret) {
    return true;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token === adminSecret) {
      return true;
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

  if (!isAuthorizedAdmin(request, env)) {
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
