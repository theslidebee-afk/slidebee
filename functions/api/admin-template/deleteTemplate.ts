// DELETE /api/admin-template?id=<template_id>
// Deletes template record from D1 and purges associated R2 assets
import { Env, getCorsHeaders, isAuthorizedAdmin, extractR2Key, DEFAULT_CF_ACCOUNT_ID, DEFAULT_CF_BUCKET } from "./utils";

export async function handleDeleteTemplate(request: Request, env: Env) {
  const corsHeaders = getCorsHeaders(request);

  if (!(await isAuthorizedAdmin(request, env))) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Admin authorization required to delete templates." }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(request.url);
    let templateId = url.searchParams.get("id");

    if (!templateId) {
      try { const body: any = await request.json(); templateId = body?.id; } catch {}
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

    const cfAccountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_CF_ACCOUNT_ID;
    const cfBucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_CF_BUCKET;
    const cfToken = env?.CLOUDFLARE_API_TOKEN || "";

    const keysToClean = new Set<string>();
    const addKey = (val: any) => { const k = extractR2Key(val); if (k) keysToClean.add(k); };

    addKey(deletedTemplate.download_url);
    addKey(deletedTemplate.image_url);
    addKey(deletedTemplate.thumbnail_url);

    let slidesArray = deletedTemplate.slides;
    if (typeof slidesArray === "string") {
      try { slidesArray = JSON.parse(slidesArray); } catch { slidesArray = []; }
    }
    if (Array.isArray(slidesArray)) {
      for (const s of slidesArray) addKey(s);
    }

    for (const key of keysToClean) {
      try {
        // Safety Check: Verify no other remaining template references this file
        const check = await env.DB.prepare(
          "SELECT id FROM templates WHERE (download_url LIKE ? OR image_url LIKE ? OR thumbnail_url LIKE ?) LIMIT 1"
        ).bind(`%${key}%`, `%${key}%`, `%${key}%`).first();

        if (check) continue;

        if (cfToken) {
          const r2Url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${cfBucket}/objects/${encodeURIComponent(key)}`;
          const r2Res = await fetch(r2Url, { method: "DELETE", headers: { Authorization: `Bearer ${cfToken}` } });
          if (r2Res.ok) {
            const r2Json: any = await r2Res.json();
            if (r2Json.success) cleanedR2Keys.push(key); else failedR2Keys.push(key);
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
