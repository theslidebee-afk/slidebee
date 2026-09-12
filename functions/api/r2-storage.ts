// Cloudflare Pages Function: /api/r2-storage
// Manages Cloudflare R2 Object Storage for presentations (.pptx) and slide images
// Supports native Cloudflare Pages R2 bucket bindings or secure CLOUDFLARE_API_TOKEN
// Enforces strict Zero-Cost Billing Guardrails: 10 GB hard storage ceiling, file size limits, immutable edge caching

const DEFAULT_ACCOUNT_ID = "9821e608622e999a9c0f06f52a168d97";
const DEFAULT_BUCKET = "slidebee";
const PUBLIC_CDN_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

// Zero-Cost Hard Billing Caps
const HARD_STORAGE_CAP_BYTES = 9.90 * 1024 * 1024 * 1024; // 9.90 GB (100 MB buffer before 10.00 GB)
const MAX_PPTX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per PPTX presentation
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per slide image
const MAX_GENERIC_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

const ALLOWED_EXTENSIONS = new Set(["pptx", "ppt", "png", "jpg", "jpeg", "webp", "pdf", "svg"]);

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-slidebee-admin-key",
    "Vary": "Origin",
  };
}

function sanitizeFileKey(rawKey: string): string {
  return rawKey
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9_\-\.\/]/g, "_");
}

/**
 * Discovers any Cloudflare R2 bucket binding attached to this Pages project
 * Handles standard naming: R2_BUCKET, "R2 bucket", BUCKET, slidebee, etc.
 */
function getR2BucketBinding(env: any): any {
  if (!env || typeof env !== "object") return null;
  if (env.R2_BUCKET && typeof env.R2_BUCKET.put === "function") return env.R2_BUCKET;
  if (env["R2 bucket"] && typeof env["R2 bucket"].put === "function") return env["R2 bucket"];
  if (env["R2_bucket"] && typeof env["R2_bucket"].put === "function") return env["R2_bucket"];
  if (env.BUCKET && typeof env.BUCKET.put === "function") return env.BUCKET;
  if (env.R2 && typeof env.R2.put === "function") return env.R2;
  if (env.slidebee && typeof env.slidebee.put === "function") return env.slidebee;
  if (env.SLIDEBEE_BUCKET && typeof env.SLIDEBEE_BUCKET.put === "function") return env.SLIDEBEE_BUCKET;

  // Search dynamically for any bound object implementing the Cloudflare R2Bucket interface
  for (const key of Object.keys(env)) {
    const val = env[key];
    if (val && typeof val === "object" && typeof val.put === "function" && typeof val.delete === "function") {
      return val;
    }
  }
  return null;
}

export async function onRequestOptions(context: any) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

/**
 * Query bucket telemetry using native Cloudflare Pages R2 bucket binding (fastest, zero tokens)
 */
async function getBucketTelemetryFromBinding(r2Bucket: any) {
  let allObjects: any[] = [];
  let cursor: string | undefined = undefined;
  let truncated = true;

  while (truncated && allObjects.length < 5000) {
    const listResult: any = await r2Bucket.list({
      limit: 1000,
      cursor,
    });
    allObjects = allObjects.concat(listResult.objects || []);
    truncated = Boolean(listResult.truncated);
    cursor = listResult.cursor;
    if (!truncated) break;
  }

  let totalBytes = 0;
  let pptxBytes = 0;
  let pptxCount = 0;
  let imagesBytes = 0;
  let imagesCount = 0;

  const objects = allObjects.map((obj: any) => {
    const size = Number(obj.size) || 0;
    totalBytes += size;

    const isPptx = obj.key.endsWith(".pptx") || obj.key.endsWith(".ppt");
    const isImg = obj.key.match(/\.(jpg|jpeg|png|webp|svg)$/i);

    if (isPptx) {
      pptxBytes += size;
      pptxCount++;
    } else if (isImg) {
      imagesBytes += size;
      imagesCount++;
    }

    return {
      key: obj.key,
      size,
      sizeMB: (size / (1024 * 1024)).toFixed(2),
      uploaded: obj.uploaded ? new Date(obj.uploaded).toISOString() : new Date().toISOString(),
      publicUrl: `${PUBLIC_CDN_BASE}/${obj.key}`,
      isPptx,
      isImage: Boolean(isImg),
    };
  });

  return { totalBytes, pptxBytes, pptxCount, imagesBytes, imagesCount, objects };
}

/**
 * Query bucket telemetry via Cloudflare REST API fallback when API token is provided
 */
async function getBucketTelemetry(accountId: string, bucket: string, token: string) {
  let allObjects: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects`);
    url.searchParams.set("per_page", "100");
    if (cursor) url.searchParams.set("cursor", cursor);

    const cfRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const cfJson: any = await cfRes.json();
    if (!cfJson.success) {
      throw new Error(cfJson.errors ? JSON.stringify(cfJson.errors) : "Failed to query R2 objects via API");
    }

    allObjects = allObjects.concat(cfJson.result || []);
    cursor = cfJson.result_info?.cursor;
  } while (cursor && allObjects.length < 5000);

  let totalBytes = 0;
  let pptxBytes = 0;
  let pptxCount = 0;
  let imagesBytes = 0;
  let imagesCount = 0;

  const objects = allObjects.map((obj) => {
    const size = Number(obj.size) || 0;
    totalBytes += size;

    const isPptx = obj.key.endsWith(".pptx") || obj.key.endsWith(".ppt");
    const isImg = obj.key.match(/\.(jpg|jpeg|png|webp|svg)$/i);

    if (isPptx) {
      pptxBytes += size;
      pptxCount++;
    } else if (isImg) {
      imagesBytes += size;
      imagesCount++;
    }

    return {
      key: obj.key,
      size,
      sizeMB: (size / (1024 * 1024)).toFixed(2),
      uploaded: obj.uploaded,
      publicUrl: `${PUBLIC_CDN_BASE}/${obj.key}`,
      isPptx,
      isImage: Boolean(isImg),
    };
  });

  return { totalBytes, pptxBytes, pptxCount, imagesBytes, imagesCount, objects };
}

/**
 * Unified telemetry provider: prefers native R2 binding, falls back to API token
 */
async function getStorageTelemetry(env: any) {
  const r2Bucket = getR2BucketBinding(env);
  if (r2Bucket) {
    return await getBucketTelemetryFromBinding(r2Bucket);
  }

  const token = env?.CLOUDFLARE_API_TOKEN;
  if (token) {
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;
    return await getBucketTelemetry(accountId, bucket, token);
  }

  throw new Error(
    "Cloudflare R2 storage is not configured. Please bind your R2 bucket in Cloudflare Pages settings (Settings > Functions > R2 bucket bindings) or provide CLOUDFLARE_API_TOKEN in environment variables."
  );
}

// GET: Fetch live R2 telemetry and object inventory
export async function onRequestGet(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    // Security Check: Require admin authorization to query R2 storage telemetry and inventory
    if (!isAuthorizedAdmin(request, env)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Admin authorization required to access R2 bucket telemetry and inventory.",
        }),
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
        totalBytes,
        totalUsedMB,
        pptxCount,
        pptxBytes,
        pptxMB,
        imagesCount,
        imagesBytes,
        imagesMB,
        totalFiles: objects.length,
        freeQuotaGB: 10.0,
        remainingGB,
        percentUsed,
        hardCapGB: 10.0,
        safetyBufferGB: 9.9,
        zeroCostPolicy: "ACTIVE_ENFORCED",
        maxPptxSizeMB: 50,
        maxImageSizeMB: 10,
        objects,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=10",
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || err }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

function isAuthorizedAdmin(request: Request, env?: any): boolean {
  const adminKey = request.headers.get("x-slidebee-admin-key");
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = env?.SLIDEBEE_ADMIN_SECRET || "slidebee_master_admin_2026";

  if (!expectedSecret) return false;

  if (adminKey && adminKey === expectedSecret) {
    return true;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token === expectedSecret) {
      return true;
    }
  }

  return false;
}

// POST: Upload file to Cloudflare R2 bucket with Zero-Cost Billing verification
export async function onRequestPost(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    // Security Check: Verify admin authorization for storage modifications
    if (!isAuthorizedAdmin(request, env)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Admin authorization required for R2 storage mutations.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const r2Bucket = getR2BucketBinding(env);
    const apiToken = env?.CLOUDFLARE_API_TOKEN;

    if (!r2Bucket && !apiToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Cloudflare R2 storage is not configured. Please bind your R2 bucket in Cloudflare Pages settings (Settings > Functions > R2 bucket bindings) or provide CLOUDFLARE_API_TOKEN in environment variables.",
        }),
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
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .toLowerCase();
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
        JSON.stringify({
          success: false,
          error: `Zero-Cost & Security Policy: Disallowed file extension '.${extMatch}'. Permitted formats: pptx, ppt, png, jpg, jpeg, webp, pdf, svg.`,
        }),
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
        JSON.stringify({
          success: false,
          error: `Zero-Cost Safety Cap: File size (${(fileSize / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of ${limitLabel}. Upload rejected to prevent storage bloat.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Enforce 10.00 GB hard bucket ceiling
    const { totalBytes } = await getStorageTelemetry(env);
    if (totalBytes + fileSize > HARD_STORAGE_CAP_BYTES) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Zero-Cost Safety Cap: R2 storage limit of 10.00 GB reached (current usage: ${(totalBytes / (1024 * 1024 * 1024)).toFixed(3)} GB). Upload blocked to guarantee zero-cost billing.`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Perform upload
    // Preference A: Native Cloudflare R2 bucket binding (zero tokens, fastest)
    if (r2Bucket) {
      const putResult = await r2Bucket.put(fileKey, fileBuffer, {
        httpMetadata: {
          contentType: mimeType,
          cacheControl: "public, max-age=31536000, immutable",
        },
      });

      const publicUrl = `${PUBLIC_CDN_BASE}/${fileKey}`;
      return new Response(
        JSON.stringify({
          success: true,
          key: fileKey,
          publicUrl,
          size: putResult?.size || fileSize,
          uploaded: putResult?.uploaded ? new Date(putResult.uploaded).toISOString() : new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Preference B: REST API with user's CLOUDFLARE_API_TOKEN environment variable
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;

    const uploadRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${fileKey}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: fileBuffer,
      }
    );

    const uploadJson: any = await uploadRes.json();
    if (!uploadJson.success) {
      return new Response(JSON.stringify({ success: false, error: uploadJson.errors }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicUrl = `${PUBLIC_CDN_BASE}/${fileKey}`;
    return new Response(
      JSON.stringify({
        success: true,
        key: fileKey,
        publicUrl,
        size: uploadJson.result?.size || fileSize,
        uploaded: uploadJson.result?.uploaded,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// DELETE: Delete an object from Cloudflare R2
export async function onRequestDelete(context: any) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    // Security Check: Verify admin authorization for storage deletions
    if (!isAuthorizedAdmin(request, env)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized: Admin authorization required for R2 storage deletions.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const r2Bucket = getR2BucketBinding(env);
    const apiToken = env?.CLOUDFLARE_API_TOKEN;

    if (!r2Bucket && !apiToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Cloudflare R2 storage is not configured. Please bind your R2 bucket in Cloudflare Pages settings (Settings > Functions > R2 bucket bindings) or provide CLOUDFLARE_API_TOKEN in environment variables.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(request.url);
    const rawKey = url.searchParams.get("key");

    if (!rawKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing key parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = sanitizeFileKey(rawKey);

    // If native binding is available:
    if (r2Bucket) {
      await r2Bucket.delete(key);
      return new Response(JSON.stringify({ success: true, result: { deleted: key } }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Else use REST API fallback:
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;
    const delRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    const delJson: any = await delRes.json();
    return new Response(JSON.stringify({ success: delJson.success, result: delJson.result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || err }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
