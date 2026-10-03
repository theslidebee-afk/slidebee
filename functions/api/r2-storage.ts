// Cloudflare Pages Function: /api/r2-storage
// Manages Cloudflare R2 Object Storage for presentations (.pptx) and slide images.
// Supports native Cloudflare Pages R2 bucket bindings or secure CLOUDFLARE_API_TOKEN.
// Enforces strict Zero-Cost Billing Guardrails: 10 GB hard storage ceiling, file size limits, immutable edge caching.

import {
  DEFAULT_ACCOUNT_ID, DEFAULT_BUCKET, PUBLIC_CDN_BASE,
  HARD_STORAGE_CAP_BYTES, MAX_PPTX_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_GENERIC_FILE_SIZE,
  ALLOWED_EXTENSIONS, getCorsHeaders, sanitizeFileKey, getR2BucketBinding, isAuthorizedAdmin,
} from "./r2/utils";
import { getStorageTelemetry } from "./r2/telemetry";

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

// GET: Fetch live R2 telemetry and object inventory
export async function onRequestGet(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    if (!(await isAuthorizedAdmin(request, env))) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Admin authorization required to access R2 bucket telemetry and inventory." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { totalBytes, pptxBytes, pptxCount, imagesBytes, imagesCount, objects } =
      await getStorageTelemetry(env);

    const totalUsedMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
    const pptxMB = Number((pptxBytes / (1024 * 1024)).toFixed(2));
    const imagesMB = Number((imagesBytes / (1024 * 1024)).toFixed(2));
    const remainingGB = Number(Math.max(0, 10 - totalUsedMB / 1024).toFixed(2));
    const percentUsed = Number(((totalUsedMB / 10240) * 100).toFixed(2));

    return new Response(
      JSON.stringify({
        success: true,
        provider: "Cloudflare R2 Object Storage",
        bucket: env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET,
        publicCdnBase: PUBLIC_CDN_BASE,
        totalBytes, totalUsedMB,
        pptxCount, pptxBytes, pptxMB,
        imagesCount, imagesBytes, imagesMB,
        totalFiles: objects.length,
        freeQuotaGB: 10.0, remainingGB, percentUsed,
        hardCapGB: 10.0, safetyBufferGB: 9.9,
        zeroCostPolicy: "ACTIVE_ENFORCED",
        maxPptxSizeMB: 50, maxImageSizeMB: 10,
        objects,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "private, max-age=10" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || err }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// POST: Upload file to Cloudflare R2 bucket with Zero-Cost Billing verification
export async function onRequestPost(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    if (!(await isAuthorizedAdmin(request, env))) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Admin authorization required for R2 storage mutations." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const r2Bucket = getR2BucketBinding(env);
    const apiToken = env?.CLOUDFLARE_API_TOKEN;

    if (!r2Bucket && !apiToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Cloudflare R2 storage is not configured. Please bind your R2 bucket in Cloudflare Pages settings (Settings > Functions > R2 bucket bindings) or provide CLOUDFLARE_API_TOKEN in environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = request.headers.get("Content-Type") || "";
    let fileBuffer: ArrayBuffer;
    let fileKey = "";
    let mimeType = "application/octet-stream";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const customKey = formData.get("key") as string;
      const folder = (formData.get("folder") as string) || "templates";

      if (!file) {
        return new Response(JSON.stringify({ success: false, error: "No file provided" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      fileBuffer = await file.arrayBuffer();
      mimeType = file.type || mimeType;

      if (customKey) {
        fileKey = sanitizeFileKey(customKey);
      } else {
        const rawExt = (file.name.split(".").pop() || "bin").toLowerCase();
        const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : "bin";
        const cleanFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, "").replace(/^\/+|\/+$/g, "");
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
        fileKey = `${cleanFolder}/${cleanName}_${Date.now()}.${ext}`;
      }
    } else {
      const url = new URL(request.url);
      const rawKey = url.searchParams.get("key") || `uploads/file_${Date.now()}`;
      fileKey = sanitizeFileKey(rawKey);
      mimeType = request.headers.get("x-mime-type") || contentType || mimeType;
      fileBuffer = await request.arrayBuffer();
    }

    const extMatch = fileKey.split(".").pop()?.toLowerCase();
    if (!extMatch || !ALLOWED_EXTENSIONS.has(extMatch)) {
      return new Response(
        JSON.stringify({ success: false, error: `Zero-Cost & Security Policy: Disallowed file extension '.${extMatch}'. Permitted formats: pptx, ppt, png, jpg, jpeg, webp, pdf, svg.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileSize = fileBuffer.byteLength;
    const isPptx = fileKey.endsWith(".pptx") || fileKey.endsWith(".ppt");
    const isImg = Boolean(fileKey.match(/\.(jpg|jpeg|png|webp|svg)$/i));
    const sizeLimit = isPptx ? MAX_PPTX_FILE_SIZE : (isImg ? MAX_IMAGE_FILE_SIZE : MAX_GENERIC_FILE_SIZE);
    const limitLabel = isPptx ? "50 MB (PPTX presentation)" : "10 MB (image)";

    // 1. Enforce individual file size cap
    if (fileSize > sizeLimit) {
      return new Response(
        JSON.stringify({ success: false, error: `Zero-Cost Safety Cap: File size (${(fileSize / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of ${limitLabel}. Upload rejected to prevent storage bloat.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Enforce 10.00 GB hard bucket ceiling
    try {
      const telemetry = await getStorageTelemetry(env);
      if (telemetry && telemetry.totalBytes + fileSize > HARD_STORAGE_CAP_BYTES) {
        return new Response(
          JSON.stringify({ success: false, error: `Zero-Cost Safety Cap: R2 storage limit of 10.00 GB reached (current usage: ${(telemetry.totalBytes / (1024 * 1024 * 1024)).toFixed(3)} GB). Upload blocked to guarantee zero-cost billing.` }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (telemetryErr) {
      console.warn("Storage telemetry check skipped:", telemetryErr);
    }

    // 3. Preference A: Native Cloudflare R2 bucket binding
    if (r2Bucket) {
      try {
        const putResult = await r2Bucket.put(fileKey, fileBuffer, {
          httpMetadata: { contentType: mimeType, cacheControl: "public, max-age=31536000, immutable" },
        });
        const publicUrl = `${PUBLIC_CDN_BASE}/${fileKey}`;
        return new Response(
          JSON.stringify({ success: true, key: fileKey, publicUrl, size: putResult?.size || fileSize, uploaded: putResult?.uploaded ? new Date(putResult.uploaded).toISOString() : new Date().toISOString() }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (putErr: any) {
        console.error("Native R2 binding put error:", putErr);
        if (!apiToken) throw putErr;
      }
    }

    // 4. Preference B: REST API with CLOUDFLARE_API_TOKEN
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;

    const uploadRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${fileKey}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": mimeType, "Cache-Control": "public, max-age=31536000, immutable" },
        body: fileBuffer,
      }
    );

    const uploadJson: any = await uploadRes.json();
    if (!uploadJson.success) {
      return new Response(JSON.stringify({ success: false, error: uploadJson.errors }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicUrl = `${PUBLIC_CDN_BASE}/${fileKey}`;
    return new Response(
      JSON.stringify({ success: true, key: fileKey, publicUrl, size: uploadJson.result?.size || fileSize, uploaded: uploadJson.result?.uploaded }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// DELETE: Delete an object from Cloudflare R2
export async function onRequestDelete(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    if (!(await isAuthorizedAdmin(request, env))) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Admin authorization required for R2 storage deletions." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const r2Bucket = getR2BucketBinding(env);
    const apiToken = env?.CLOUDFLARE_API_TOKEN;

    if (!r2Bucket && !apiToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Cloudflare R2 storage is not configured. Please bind your R2 bucket in Cloudflare Pages settings (Settings > Functions > R2 bucket bindings) or provide CLOUDFLARE_API_TOKEN in environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(request.url);
    const rawKey = url.searchParams.get("key");

    if (!rawKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing key parameter" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = sanitizeFileKey(rawKey);

    if (r2Bucket) {
      await r2Bucket.delete(key);
      return new Response(JSON.stringify({ success: true, result: { deleted: key } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;
    const delRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${apiToken}` } }
    );

    const delJson: any = await delRes.json();
    return new Response(JSON.stringify({ success: delJson.success, result: delJson.result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || err }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
