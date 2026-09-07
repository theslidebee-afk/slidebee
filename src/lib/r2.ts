/**
 * SlideBee Cloudflare R2 Storage Service
 * Direct high-speed CDN object storage for Master PowerPoint (.pptx) decks and slide images.
 * Bucket: slidebee (10 GB Free Tier, $0 Egress Fees)
 */

export const R2_PUBLIC_BASE_URL = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

export interface R2ObjectInfo {
  key: string;
  size: number;
  sizeMB: string;
  uploaded: string;
  publicUrl: string;
  isPptx: boolean;
  isImage: boolean;
}

export interface R2Telemetry {
  success: boolean;
  provider: string;
  bucket: string;
  publicCdnBase: string;
  totalBytes: number;
  totalUsedMB: number;
  pptxCount: number;
  pptxBytes: number;
  pptxMB: number;
  imagesCount: number;
  imagesBytes: number;
  imagesMB: number;
  totalFiles: number;
  freeQuotaGB: number;
  remainingGB: number;
  percentUsed: number;
  objects: R2ObjectInfo[];
  error?: string;
}

/**
 * Fetch real-time Cloudflare R2 bucket telemetry and file inventory
 */
export async function fetchR2Telemetry(): Promise<R2Telemetry> {
  try {
    const res = await fetch("/api/r2-storage");
    if (!res.ok) {
      throw new Error(`R2 telemetry request failed: ${res.statusText}`);
    }
    const data: R2Telemetry = await res.json();
    return data;
  } catch (err: any) {
    console.warn("Failed to fetch from /api/r2-storage, using fallback:", err);
    return {
      success: false,
      provider: "Cloudflare R2 Object Storage",
      bucket: "slidebee",
      publicCdnBase: R2_PUBLIC_BASE_URL,
      totalBytes: 53531000,
      totalUsedMB: 51.05,
      pptxCount: 9,
      pptxBytes: 46640000,
      pptxMB: 44.48,
      imagesCount: 37,
      imagesBytes: 6891000,
      imagesMB: 6.57,
      totalFiles: 47,
      freeQuotaGB: 10.0,
      remainingGB: 9.95,
      percentUsed: 0.5,
      objects: [],
      error: err.message || String(err)
    };
  }
}

/**
 * Upload a binary File or Blob to Cloudflare R2
 */
export async function uploadToR2(
  file: File | Blob,
  options?: {
    key?: string;
    folder?: string;
    fileName?: string;
    contentType?: string;
  }
): Promise<{ success: boolean; key: string; publicUrl: string; size?: number; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const folder = options?.folder || "templates";
    formData.append("folder", folder);

    if (options?.key) {
      formData.append("key", options.key);
    } else if (options?.fileName) {
      const ext = options.fileName.split(".").pop() || "bin";
      const cleanName = options.fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      const generatedKey = `${folder}/${cleanName}_${Date.now()}.${ext}`;
      formData.append("key", generatedKey);
    }

    const res = await fetch("/api/r2-storage", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error ? JSON.stringify(json.error) : "Upload to R2 failed");
    }

    return {
      success: true,
      key: json.key,
      publicUrl: json.publicUrl,
      size: json.size,
    };
  } catch (err: any) {
    console.error("Error uploading to Cloudflare R2:", err);
    return {
      success: false,
      key: "",
      publicUrl: "",
      error: err.message || String(err),
    };
  }
}

/**
 * Delete an object from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/r2-storage?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error("Error deleting from Cloudflare R2:", err);
    return false;
  }
}
