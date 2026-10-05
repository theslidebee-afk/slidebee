// POST /api/admin-template — creates a new template record in Cloudflare D1
import { Env, getCorsHeaders, isAuthorizedAdmin, parseTemplateJsonCols } from "./utils";

export async function handleCreateTemplate(request: Request, env: Env) {
  const corsHeaders = getCorsHeaders(request);

  if (!(await isAuthorizedAdmin(request, env))) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Admin authorization required to create templates." }),
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

    const rawPriceInr = Number(body?.price_inr) || 0;
    const rawPriceUsd = Number(body?.price_usd) || 0;
    const isPremium = body?.is_premium !== undefined
      ? (body.is_premium ? 1 : 0)
      : (rawPriceInr > 0 ? 1 : 0);

    const priceInr = isPremium === 0 ? 0 : rawPriceInr;
    const priceUsd = isPremium === 0 ? 0 : rawPriceUsd;

    if (body?.download_url && env.R2_BUCKET && typeof env.R2_BUCKET.head === "function") {
      let r2Key = body.download_url;
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
                error: `Storage Verification Error: Deliverable file '${r2Key}' was not found in Cloudflare R2 bucket. Please upload the PPTX file first before creating this template.`
              }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (checkErr) {
        console.warn("R2 head check notice on create:", checkErr);
      }
    }

    const row = {
      id: templateId,
      slug,
      code,
      title,
      category: body?.category || "Business",
      price_inr: priceInr,
      price_usd: priceUsd,
      original_price_inr: isPremium === 0 ? 0 : (Number(body?.original_price_inr) || (priceInr * 2)),
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
      is_credit_eligible: isPremium === 0 ? 0 : (body?.is_credit_eligible !== undefined ? (body.is_credit_eligible ? 1 : 0) : 1),
      is_featured: body?.is_featured ? 1 : 0,
      is_published: body?.is_published !== false ? 1 : 0,
      is_premium: isPremium,
    };

    const keys = Object.keys(row);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO templates (${keys.join(", ")}) VALUES (${placeholders})`;
    const params = keys.map((k) => (row as any)[k]);

    await env.DB.prepare(sql).bind(...params).run();

    const createdTemplate: any = await env.DB.prepare("SELECT * FROM templates WHERE id = ?").bind(templateId).first();

    return new Response(
      JSON.stringify({ success: true, message: "Template created successfully.", template: parseTemplateJsonCols(createdTemplate) }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
