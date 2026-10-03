// Bucket telemetry: listing and size accounting via native R2 binding or REST API fallback
import { DEFAULT_ACCOUNT_ID, DEFAULT_BUCKET, PUBLIC_CDN_BASE, getR2BucketBinding } from "./utils";

export async function getBucketTelemetryFromBinding(r2Bucket: any) {
  let allObjects: any[] = [];
  let cursor: string | undefined = undefined;
  let truncated = true;

  while (truncated && allObjects.length < 5000) {
    const listResult: any = await r2Bucket.list({ limit: 1000, cursor });
    allObjects = allObjects.concat(listResult.objects || []);
    truncated = Boolean(listResult.truncated);
    cursor = listResult.cursor;
    if (!truncated) break;
  }

  return computeTelemetry(allObjects, (obj: any) => ({
    key: obj.key,
    size: Number(obj.size) || 0,
    uploaded: obj.uploaded ? new Date(obj.uploaded).toISOString() : new Date().toISOString(),
  }));
}

export async function getBucketTelemetry(accountId: string, bucket: string, token: string) {
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

  return computeTelemetry(allObjects, (obj: any) => ({
    key: obj.key,
    size: Number(obj.size) || 0,
    uploaded: obj.uploaded,
  }));
}

function computeTelemetry(raw: any[], extractor: (obj: any) => { key: string; size: number; uploaded: any }) {
  let totalBytes = 0;
  let pptxBytes = 0;
  let pptxCount = 0;
  let imagesBytes = 0;
  let imagesCount = 0;

  const objects = raw.map((obj) => {
    const { key, size, uploaded } = extractor(obj);
    totalBytes += size;

    const isPptx = key.endsWith(".pptx") || key.endsWith(".ppt");
    const isImg = Boolean(key.match(/\.(jpg|jpeg|png|webp|svg)$/i));

    if (isPptx) { pptxBytes += size; pptxCount++; }
    else if (isImg) { imagesBytes += size; imagesCount++; }

    return { key, size, sizeMB: (size / (1024 * 1024)).toFixed(2), uploaded, publicUrl: `${PUBLIC_CDN_BASE}/${key}`, isPptx, isImage: isImg };
  });

  return { totalBytes, pptxBytes, pptxCount, imagesBytes, imagesCount, objects };
}

/**
 * Unified telemetry provider: prefers native R2 binding, falls back to API token.
 */
export async function getStorageTelemetry(env: any) {
  const r2Bucket = getR2BucketBinding(env);
  if (r2Bucket) return getBucketTelemetryFromBinding(r2Bucket);

  const token = env?.CLOUDFLARE_API_TOKEN;
  if (token) {
    const accountId = env?.CLOUDFLARE_ACCOUNT_ID || DEFAULT_ACCOUNT_ID;
    const bucket = env?.CLOUDFLARE_R2_BUCKET || DEFAULT_BUCKET;
    return getBucketTelemetry(accountId, bucket, token);
  }

  throw new Error(
    "Cloudflare R2 storage is not configured. Please bind your R2 bucket in Cloudflare Pages settings (Settings > Functions > R2 bucket bindings) or provide CLOUDFLARE_API_TOKEN in environment variables."
  );
}
