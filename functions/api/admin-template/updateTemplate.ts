// PUT /api/admin-template — updates an existing template record in Cloudflare D1
import { Env, getCorsHeaders, isAuthorizedAdmin, parseTemplateJsonCols } from "./utils";

export async function handleUpdateTemplate(request: Request, env: Env) {
  const corsHeaders = getCorsHeaders(request);

  if (!(await isAuthorizedAdmin(request, env))) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Admin authorization required to update templates." }),
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
          if (typeof val === "object") val = JSON.stringify(val);
        } else if (["is_published", "is_credit_eligible", "is_premium", "is_featured"].includes(key)) {
          val = val ? 1 : 0;
        } else if (["price_inr", "price_usd", "original_price_inr"].includes(key)) {
          val = Number(val) || 0;
        } else if (key === "slides_count") {
          val = Number(val) || 1;
        }
        updates[key] = val;
      }
    }

    if (updates.is_premium === 0) {
      updates.price_inr = 0;
      updates.price_usd = 0;
      updates.original_price_inr = 0;
      updates.is_credit_eligible = 0;
    }

    if (body.slide_count !== undefined && updates.slides_count === undefined) {
      updates.slides_count = Number(body.slide_count) || 1;
    }

    if (updates.download_url && env.R2_BUCKET && typeof env.R2_BUCKET.head === "function") {
      let r2Key = updates.download_url;
      if (r2Key.includes("r2.dev/")) {
        r2Key = r2Key.split("r2.dev/")[1];
      }
      try {
        const check = await env.R2_BUCKET.head(r2Key);
        if (!check) {
          const altKey = r2Key.replace("templates/decks/", "");
          const altCheck = await env.R2_BUCKET.head(altKey);
          if (!altCheck) {
            return new Response(
              JSON.stringify({
                success: false,
                error: `Storage Verification Error: Deliverable file '${r2Key}' was not found in Cloudflare R2 bucket. Please re-upload the PPTX file before updating this template.`
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (checkErr) {
        console.warn("R2 head check notice on update:", checkErr);
      }
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

    return new Response(
      JSON.stringify({ success: true, message: "Template updated successfully.", template: parseTemplateJsonCols(updatedTemplate) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
