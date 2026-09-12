// Cloudflare Pages Function: /api/admin-template
// Provides authorized administrative actions for template management in SlideBee
// Deletes template record from Supabase and automatically purges associated presentation decks (.pptx) and slide images from Cloudflare R2

const DEFAULT_SUPABASE_URL = "https://whwyfqtvuubkfypmgosi.supabase.co";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3lmcXR2dXVia2Z5cG1nb3NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM2NzIzNCwiZXhwIjoyMTAzOTQzMjM0fQ.xZmFmQRq7V5ExKUzh0CpDVjqHfgprRgi64Jd8qqBsfk";

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

function isAuthorizedAdmin(request: Request, env: any): boolean {
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

  // Never delete shared system logos, portfolio case studies, or empty keys
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
export async function onRequestDelete(context: any) {
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
        const body = await request.json();
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

    const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

    // Call Supabase PostgREST with service_role key to delete template
    const endpoint = `${supabaseUrl}/rest/v1/templates?id=eq.${encodeURIComponent(templateId)}`;
    const sbRes = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    if (!sbRes.ok) {
      const errText = await sbRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Database delete failed: ${errText}` }),
        { status: sbRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deleted = await sbRes.json();
    const deletedTemplate = Array.isArray(deleted) && deleted.length > 0 ? deleted[0] : null;

    const cleanedR2Keys: string[] = [];
    const failedR2Keys: string[] = [];

    // Purge associated presentation decks and preview images from Cloudflare R2 bucket
    if (deletedTemplate) {
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
      if (Array.isArray(deletedTemplate.slides)) {
        for (const s of deletedTemplate.slides) {
          addKey(s);
        }
      }

      for (const key of keysToClean) {
        try {
          // Safety Check: Verify no other remaining template in Supabase references this exact file
          const checkEndpoint = `${supabaseUrl}/rest/v1/templates?select=id&or=(download_url.ilike.*${encodeURIComponent(key)}*,image_url.ilike.*${encodeURIComponent(key)}*,thumbnail_url.ilike.*${encodeURIComponent(key)}*)&limit=1`;
          const checkRes = await fetch(checkEndpoint, {
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
          });

          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (Array.isArray(checkData) && checkData.length > 0) {
              // Another template still references this asset, keep in R2
              continue;
            }
          }

          // Delete from Cloudflare R2
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
        } catch (r2Err) {
          console.warn(`Error deleting R2 object ${key}:`, r2Err);
          failedR2Keys.push(key);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Template and associated R2 assets deleted successfully.",
        deletedCount: Array.isArray(deleted) ? deleted.length : 1,
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
