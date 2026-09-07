// Cloudflare Pages Function: /api/r2-storage
// Manages Cloudflare R2 Object Storage for presentations (.pptx) and slide images
// Enforces strict Zero-Cost Billing Guardrails: 10 GB hard storage ceiling, file size limits, immutable edge caching

const DEFAULT_ACCOUNT_ID = "9821e608622e999a9c0f06f52a168d97";
const DEFAULT_BUCKET = "slidebee";
const PUBLIC_CDN_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

// Zero-Cost Hard Billing Caps
const HARD_STORAGE_CAP_BYTES = 9.90 * 1024 * 1024 * 1024; // 9.90 GB (100 MB buffer before 10.00 GB)
const MAX_PPTX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per PPTX presentation
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per slide image
const MAX_GENERIC_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// Helper to fetch all bucket objects with pagination and calculate live metrics
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
      throw new Error(cfJson.errors ? JSON.stringify(cfJson.errors) : "Failed to query R2 objects");
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

// GET: Fetch live R2 telemetry and object inventory
export async function onRequestGet(context: any) {
  try {
    const { env } = context;
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;
    const token = env?.CLOUDFLARE_API_TOKEN || "";

    const { totalBytes, pptxBytes, pptxCount, imagesBytes, imagesCount, objects } =
      await getBucketTelemetry(accountId, bucket, token);

    const totalUsedMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
    const pptxMB = Number((pptxBytes / (1024 * 1024)).toFixed(2));
    const imagesMB = Number((imagesBytes / (1024 * 1024)).toFixed(2));
    const remainingGB = Number(Math.max(0, 10 - totalUsedMB / 1024).toFixed(2));
    const percentUsed = Number(((totalUsedMB / 10240) * 100).toFixed(2));

    return new Response(
      JSON.stringify({
        success: true,
        provider: "Cloudflare R2 Object Storage",
        bucket,
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
          ...CORS_HEADERS,
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=10",
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || err }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}

// POST: Upload file to Cloudflare R2 bucket with Zero-Cost Billing verification
export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;
    const token = env?.CLOUDFLARE_API_TOKEN || "";

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
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      fileBuffer = await file.arrayBuffer();
      mimeType = file.type || mimeType;

      if (customKey) {
        fileKey = customKey;
      } else {
        const ext = file.name.split(".").pop() || "bin";
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .toLowerCase();
        fileKey = `${folder}/${cleanName}_${Date.now()}.${ext}`;
      }
    } else {
      const url = new URL(request.url);
      fileKey = url.searchParams.get("key") || `uploads/file_${Date.now()}`;
      mimeType = request.headers.get("x-mime-type") || contentType || mimeType;
      fileBuffer = await request.arrayBuffer();
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
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 2. Enforce 10.00 GB hard bucket ceiling
    const { totalBytes } = await getBucketTelemetry(accountId, bucket, token);
    if (totalBytes + fileSize > HARD_STORAGE_CAP_BYTES) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Zero-Cost Safety Cap: R2 storage limit of 10.00 GB reached (current usage: ${(totalBytes / (1024 * 1024 * 1024)).toFixed(3)} GB). Upload blocked to guarantee zero-cost billing.`,
        }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 3. Upload with immutable edge caching header (eliminates Class B read costs via Cloudflare CDN)
    const uploadRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${fileKey}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
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
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const publicUrl = `${PUBLIC_CDN_BASE}/${fileKey}`;

    return new Response(
      JSON.stringify({
        success: true,
        key: fileKey,
        publicUrl,
        size: uploadJson.result?.size,
        uploaded: uploadJson.result?.uploaded,
      }),
      {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || err }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}

// DELETE: Delete an object from Cloudflare R2
export async function onRequestDelete(context: any) {
  try {
    const { request, env } = context;
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;
    const token = env?.CLOUDFLARE_API_TOKEN || "";

    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(JSON.stringify({ success: false, error: "Missing key parameter" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const delRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${key}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const delJson: any = await delRes.json();
    return new Response(JSON.stringify({ success: delJson.success, result: delJson.result }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || err }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}
