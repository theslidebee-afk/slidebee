// Shared utilities for /api/r2-storage handlers

export const DEFAULT_ACCOUNT_ID = "9821e608622e999a9c0f06f52a168d97";
export const DEFAULT_BUCKET = "slidebee";
export const PUBLIC_CDN_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

// Zero-Cost Hard Billing Caps
export const HARD_STORAGE_CAP_BYTES = 9.90 * 1024 * 1024 * 1024; // 9.90 GB
export const MAX_PPTX_FILE_SIZE = 50 * 1024 * 1024;              // 50 MB per PPTX
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;             // 10 MB per image
export const MAX_GENERIC_FILE_SIZE = 10 * 1024 * 1024;           // 10 MB

export const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

export const ALLOWED_EXTENSIONS = new Set(["pptx", "ppt", "png", "jpg", "jpeg", "webp", "pdf", "svg"]);

export function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".pages.dev")) return true;
  if (origin.endsWith(".theslidebee.com")) return true;
  return false;
}

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-slidebee-admin-key",
    "Vary": "Origin",
  };
}

export function sanitizeFileKey(rawKey: string): string {
  let cleaned = rawKey.replace(/\\/g, "/");
  while (cleaned.includes("..")) {
    cleaned = cleaned.replace(/\.\./g, "");
  }
  return cleaned
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9_\-\.\/]/g, "_");
}

/**
 * Discovers any Cloudflare R2 bucket binding attached to this Pages project.
 */
export function getR2BucketBinding(env: any): any {
  if (!env || typeof env !== "object") return null;
  const candidates = [
    env.R2_BUCKET,
    env["R2 bucket"],
    env["R2_bucket"],
    env.SLIDEBEE_BUCKET,
    env.BUCKET,
    env.R2,
  ];
  for (const b of candidates) {
    if (b && typeof b === "object" && typeof b.put === "function" && typeof b.list === "function" && typeof b.get === "function") {
      return b;
    }
  }
  return null;
}

export async function isAuthorizedAdmin(request: Request, env?: any): Promise<boolean> {
  const adminKey = request.headers.get("x-slidebee-admin-key");
  const authHeader = request.headers.get("Authorization");
  const expectedSecret = env?.SLIDEBEE_ADMIN_SECRET;

  if (expectedSecret) {
    if (adminKey && adminKey === expectedSecret) return true;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token === expectedSecret) return true;
    }
  }

  // Authorize via active Cloudflare D1 admin session
  if (env?.DB) {
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (adminKey) {
      token = adminKey.trim();
    }
    if (token) {
      try {
        const activeSession = await env.DB.prepare(
          `SELECT email, role FROM sessions WHERE id = ? AND expires_at > datetime('now')`
        ).bind(token).first();
        if (activeSession) {
          const sessionEmail = String(activeSession.email || "").toLowerCase().trim();
          if (
            activeSession.role === "admin" ||
            activeSession.role === "super_admin" ||
            sessionEmail === "admin@theslidebee.com"
          ) {
            return true;
          }
        }
      } catch (e) {
        console.warn("D1 admin session check notice:", e);
      }
    }
  }

  return false;
}
