// Cloudflare Pages Function: /api/admin-template
// Provides authorized administrative actions for template management in SlideBee

const DEFAULT_SUPABASE_URL = "https://whwyfqtvuubkfypmgosi.supabase.co";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3lmcXR2dXVia2Z5cG1nb3NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM2NzIzNCwiZXhwIjoyMTAzOTQzMjM0fQ.xZmFmQRq7V5ExKUzh0CpDVjqHfgprRgi64Jd8qqBsfk";

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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Template deleted successfully.",
        deletedCount: Array.isArray(deleted) ? deleted.length : 1,
        deletedId: templateId,
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
