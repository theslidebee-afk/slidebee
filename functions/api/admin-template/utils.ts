// Shared utilities for /api/admin-template handlers

export interface Env {
  DB?: any;
  R2_BUCKET?: any;
  SLIDEBEE_ADMIN_SECRET?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_R2_BUCKET?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

export const DEFAULT_CF_ACCOUNT_ID = "9821e608622e999a9c0f06f52a168d97";
export const DEFAULT_CF_BUCKET = "slidebee";
export const PUBLIC_CDN_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

function isOriginAllowed(origin: string): boolean {
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
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-admin-key",
    "Vary": "Origin",
  };
}

export async function isAuthorizedAdmin(request: Request, env: Env): Promise<boolean> {
  const adminSecret = env?.SLIDEBEE_ADMIN_SECRET;
  const authHeader = request.headers.get("Authorization");
  const adminKeyHeader = request.headers.get("x-slidebee-admin-key");

  if (adminSecret) {
    if (adminKeyHeader && adminKeyHeader === adminSecret) return true;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token === adminSecret) return true;
    }
  }

  // Authorize via active Cloudflare D1 admin session
  if (env?.DB) {
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (adminKeyHeader) {
      token = adminKeyHeader.trim();
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

export function extractR2Key(urlStr: any): string | null {
  if (!urlStr || typeof urlStr !== "string") return null;
  const cdnPrefix = `${PUBLIC_CDN_BASE}/`;
  let key: string | null = null;
  if (urlStr.startsWith(cdnPrefix)) {
    key = urlStr.slice(cdnPrefix.length);
  } else if (urlStr.startsWith("templates/") || urlStr.startsWith("uploads/")) {
    key = urlStr;
  }
  if (!key) return null;
  key = key.split("?")[0].replace(/^\/+/, "");
  if (
    key.startsWith("logos/") ||
    key.startsWith("portfolio/") ||
    key === "" ||
    key === "test.png" ||
    key.startsWith("brand/")
  ) {
    return null;
  }
  return key;
}

export function parseTemplateJsonCols(template: any) {
  if (!template) return template;
  for (const col of ["formats", "slides", "features"]) {
    if (typeof template[col] === "string") {
      try { template[col] = JSON.parse(template[col]); } catch {}
    }
  }
  return template;
}
