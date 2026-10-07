// Shared schema constants, helpers, and types for /api/data handlers

export interface Env {
  DB?: any;
  SLIDEBEE_ADMIN_SECRET?: string;
  SLIDEBEE_APP_TOKEN?: string;
}

export const ALLOWED_TABLES = [
  "templates",
  "v_storefront_catalog",
  "v_free_credit_library",
  "orders",
  "profiles",
  "waitlist",
  "site_config",
  "subscriptions",
  "assets",
];

export function isValidIdentifier(name: string): boolean {
  return typeof name === "string" && /^[a-zA-Z0-9_]{1,64}$/.test(name);
}

export const JSON_COLUMNS: Record<string, string[]> = {
  templates: ["formats", "slides", "features"],
  v_storefront_catalog: ["formats", "slides", "features"],
  v_free_credit_library: ["formats", "slides", "features"],
  profiles: ["purchased_items", "usage_history"],
  orders: ["formats"],
  site_config: ["value"],
  auth_logs: ["metadata"],
  assets: ["metadata"],
};

export const VALID_TABLE_COLUMNS: Record<string, string[]> = {
  templates: [
    "id", "slug", "code", "title", "category", "price_inr", "price_usd", "original_price_inr",
    "image_url", "thumbnail_url", "slides_count", "rating", "downloads", "formats", "slides",
    "description", "features", "download_url", "file_name", "file_size", "is_credit_eligible",
    "is_featured", "is_published", "created_at", "is_premium"
  ],
  profiles: [
    "id", "email", "full_name", "company", "phone", "role", "credits_total", "credits_used",
    "credits_balance", "purchased_items", "usage_history", "last_sign_in_at", "created_at",
    "updated_at", "tier", "tier_expires_at", "downloads_today", "last_download_date",
    "downloads_this_month", "month_cycle_start", "is_bot_flagged"
  ],
  orders: [
    "id", "created_at", "order_reference", "service_type", "slide_count", "timeline",
    "formats", "style_preference", "drive_url", "project_brief", "full_name", "email",
    "company", "phone", "payment_id", "status", "deliverable_url", "deliverable_name"
  ],
  subscriptions: [
    "id", "created_at", "updated_at", "user_id", "user_email", "plan_name", "amount_usd",
    "amount_inr", "slides_used", "slides_limit", "current_period_end", "status",
    "razorpay_subscription_id"
  ],
  site_config: ["id", "key", "value", "updated_at"],
  waitlist: ["id", "created_at", "email", "source"],
  auth_logs: ["id", "created_at", "user_email", "event", "metadata"],
  assets: ["id", "key", "title", "category", "url", "alt_text", "metadata", "created_at"],
  download_logs: [
    "id", "user_email", "template_id", "template_title", "tier", "is_premium",
    "download_url", "ip_address", "user_agent", "downloaded_at"
  ],
  users: ["id", "email", "password_hash", "salt", "role", "created_at", "updated_at"],
  sessions: ["id", "user_id", "email", "role", "device_info", "ip_address", "created_at", "expires_at"]
};

export function sanitizeRow(table: string, row: any): any {
  if (!row || typeof row !== "object") return row;
  const validCols = VALID_TABLE_COLUMNS[table];
  const cleaned: Record<string, any> = {};

  // Normalize known field aliases
  if (table === "templates") {
    if (row.slide_count !== undefined && row.slides_count === undefined) {
      row.slides_count = row.slide_count;
    }
  }

  for (const [key, val] of Object.entries(row)) {
    if (!validCols || validCols.includes(key)) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

export function parseRow(table: string, row: any) {
  if (!row) return row;
  const cols = JSON_COLUMNS[table] || [];
  const parsed = { ...row };
  for (const col of cols) {
    if (typeof parsed[col] === "string") {
      try { parsed[col] = JSON.parse(parsed[col]); } catch {}
    }
  }
  return parsed;
}

export function stringifyValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return JSON.stringify(val);
  if (typeof val === "boolean") return val ? 1 : 0;
  return val;
}

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-app-token",
    "Vary": "Origin",
  };
}
