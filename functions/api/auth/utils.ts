// Shared utilities for /api/auth handlers

export interface Env {
  DB?: any;
  RESEND_API_KEY?: string;
  SLIDEBEE_ADMIN_SECRET?: string;
  SLIDEBEE_APP_TOKEN?: string;
  SLIDEBEE_ADMIN_PASSWORD?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

export const ALLOWED_ORIGINS = [
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

export const PBKDF2_ROUNDS = 5000;

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: PBKDF2_ROUNDS,
      hash: "SHA-256",
    },
    passwordKey,
    256
  );
  const hex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `pbkdf2:${PBKDF2_ROUNDS}:${hex}`;
}

export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  // Check if hash is PBKDF2 format
  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    const rounds = Math.min(parseInt(parts[1], 10) || PBKDF2_ROUNDS, 5000);
    const enc = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: rounds,
        hash: "SHA-256",
      },
      passwordKey,
      256
    );
    const calculatedHex = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `pbkdf2:${rounds}:${calculatedHex}` === storedHash;
  }

  // Legacy fallback: single-round SHA-256
  const enc = new TextEncoder();
  const data = enc.encode(password + ":" + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const legacyHex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return legacyHex === storedHash;
}

export function jsonResponse(data: any, status = 200, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
