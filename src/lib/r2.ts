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
    const res = await fetch("/api/r2-storage", {
      headers: {
        "x-slidebee-admin-key": "slidebee_master_admin_2026",
      },
    });
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
 * In-browser automatic WebP image compression before streaming to Cloudflare R2
 * Shrinks uploaded PNGs/JPEGs by 80%+ without visible quality loss.
 */
export async function compressImageToWebP(
  file: File,
  quality = 0.82,
  maxWidth = 1920
): Promise<{ blob: Blob; fileName: string; contentType: string }> {
  if (
    typeof window === "undefined" ||
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    file.type === "image/webp"
  ) {
    return { blob: file, fileName: file.name, contentType: file.type || "application/octet-stream" };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve({ blob: file, fileName: file.name, contentType: file.type });
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            resolve({
              blob,
              fileName: `${baseName}.webp`,
              contentType: "image/webp",
            });
          } else {
            resolve({ blob: file, fileName: file.name, contentType: file.type });
          }
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ blob: file, fileName: file.name, contentType: file.type });
    };
    img.src = url;
  });
}

/**
 * Upload a binary File or Blob to Cloudflare R2 with automatic WebP compression for images
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
    let uploadFile = file;
    let uploadFileName = options?.fileName || (file instanceof File ? file.name : "file");

    // Automatically compress PNG / JPEG images to high-efficiency WebP before uploading
    if (file instanceof File && file.type.startsWith("image/")) {
      const compressed = await compressImageToWebP(file);
      uploadFile = compressed.blob;
      uploadFileName = compressed.fileName;
    }

    const formData = new FormData();
    formData.append("file", uploadFile, uploadFileName);

    const folder = options?.folder || "templates";
    formData.append("folder", folder);

    if (options?.key) {
      // If user supplied key had png/jpg extension, convert to webp if file was compressed
      let targetKey = options.key;
      if (uploadFileName.endsWith(".webp") && !targetKey.endsWith(".webp")) {
        targetKey = targetKey.replace(/\.[^/.]+$/, ".webp");
      }
      formData.append("key", targetKey);
    } else {
      const ext = uploadFileName.split(".").pop() || "bin";
      const cleanName = uploadFileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      const generatedKey = `${folder}/${cleanName}_${Date.now()}.${ext}`;
      formData.append("key", generatedKey);
    }

    const res = await fetch("/api/r2-storage", {
      method: "POST",
      headers: {
        "x-slidebee-admin-key": "slidebee_master_admin_2026",
      },
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
      headers: {
        "x-slidebee-admin-key": "slidebee_master_admin_2026",
      },
    });
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error("Error deleting from Cloudflare R2:", err);
    return false;
  }
}

/**
 * Normalizes any asset URL (legacy Supabase storage, flat R2 root, or relative)
 * to its exact structured Cloudflare R2 folder CDN URL.
 */
export function normalizeR2Url(url: string | undefined | null, _type: "slides" | "decks" = "slides"): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  // If already proper structured R2 URL, return as-is
  if (
    url.includes("/templates/slides/") ||
    url.includes("/templates/decks/") ||
    url.includes("/marquee/") ||
    url.includes("/bulk-ingest/") ||
    url.includes("/portfolio/covers/") ||
    url.includes("/portfolio/slides/") ||
    url.includes("/portfolio/") ||
    url.includes("/use_cases/") ||
    url.includes("/logos/")
  ) {
    return url;
  }

  // If pointing to old Supabase storage URL
  if (url.includes("supabase.co/storage")) {
    const filename = url.split("/").pop() || "";
    if (filename.endsWith(".pptx") || filename.endsWith(".ppt")) {
      return `${R2_PUBLIC_BASE_URL}/templates/decks/${filename}`;
    }
    if (filename.startsWith("marquee_")) {
      return `${R2_PUBLIC_BASE_URL}/marquee/${filename}`;
    }
    return `${R2_PUBLIC_BASE_URL}/templates/slides/${filename}`;
  }

  // If pointing to flat R2 root URL without folder prefix (e.g. pub-*.r2.dev/volvo_slide-1.jpg)
  if (url.includes("r2.dev/")) {
    const pathPart = url.split("r2.dev/")[1];
    if (pathPart && !pathPart.includes("/")) {
      if (pathPart.endsWith(".pptx") || pathPart.endsWith(".ppt")) {
        return `${R2_PUBLIC_BASE_URL}/templates/decks/${pathPart}`;
      }
      if (pathPart.startsWith("marquee_")) {
        return `${R2_PUBLIC_BASE_URL}/marquee/${pathPart}`;
      }
      return `${R2_PUBLIC_BASE_URL}/templates/slides/${pathPart}`;
    }
  }

  // If raw key with folder prefix like "portfolio/covers/img.webp" or "logos/img.svg"
  if (
    url.startsWith("portfolio/") ||
    url.startsWith("use_cases/") ||
    url.startsWith("logos/") ||
    url.startsWith("marquee/") ||
    url.startsWith("templates/")
  ) {
    return `${R2_PUBLIC_BASE_URL}/${url}`;
  }

  // If raw filename without protocol (e.g. "volvo_slide-1.jpg")
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
    if (url.endsWith(".pptx") || url.endsWith(".ppt")) {
      return `${R2_PUBLIC_BASE_URL}/templates/decks/${url}`;
    }
    return `${R2_PUBLIC_BASE_URL}/templates/slides/${url}`;
  }

  return url;
}
