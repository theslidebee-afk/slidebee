/**
 * Device Fingerprinting & Disposable Email Detection Module
 * Prevents Sybil attacks, multi-accounting, and free trial abuse.
 */

// Common disposable/temporary email domains
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "sharklasers.com",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.org",
  "getairmail.com",
  "dispostable.com",
  "fakemailgenerator.com",
  "temp-mail.org",
  "temp-mail.io",
  "generator.email",
  "tempail.com",
  "inboxkitten.com",
  "mohmal.com",
  "burnermail.io",
  "crazymailing.com",
  "dropmail.me",
  "fakeinbox.com",
  "maildrop.cc",
  "mytemp.email",
  "nada.ltd",
  "nowmymail.com",
  "spambog.com",
  "tempinbox.com",
  "tempr.email",
  "tmpmail.net",
  "zillamail.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "tinemail.com",
  "harakirimail.com",
  "tmail.ws",
  "getnada.com",
  "emailondeck.com",
  "clipmail.eu",
  "mailnull.com",
  "spam4.me",
  "boun.cr",
  "discard.email",
  "discardmail.com",
  "spamevader.com",
  "trashymail.com",
  "tempmailo.com"
]);

/**
 * Normalizes an email address to its canonical base:
 * 1. Lowercases and trims whitespace.
 * 2. Strips sub-addressing / plus tags (e.g., "user+trial1@domain.com" -> "user@domain.com").
 * 3. Removes dots for Gmail/Googlemail domains (e.g., "u.s.e.r@gmail.com" -> "user@gmail.com").
 */
export function normalizeEmailBase(email: string): string {
  if (!email || !email.includes("@")) return "";
  const cleaned = email.toLowerCase().trim();
  const [localPart, domainPart] = cleaned.split("@");

  if (!localPart || !domainPart) return cleaned;

  // Strip plus-addressing
  let baseLocal = localPart.split("+")[0];

  // Remove dots for Google mail services
  if (domainPart === "gmail.com" || domainPart === "googlemail.com") {
    baseLocal = baseLocal.replace(/\./g, "");
  }

  return `${baseLocal}@${domainPart}`;
}

/**
 * Checks whether an email belongs to a known temporary/disposable domain.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.toLowerCase().trim().split("@")[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Generates a fast, deterministic 32-bit FNV-1a hash of a string.
 */
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Computes a hardware canvas fingerprint signature.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no_canvas";

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = "#FCBF14";
    ctx.fillRect(10, 10, 62, 20);

    ctx.fillStyle = "#111111";
    ctx.fillText("SlideBeeSecurityCanvas_2026", 12, 12);

    ctx.fillStyle = "rgba(252, 191, 20, 0.7)";
    ctx.arc(80, 20, 10, 0, Math.PI * 2);
    ctx.fill();

    return fnv1a(canvas.toDataURL());
  } catch {
    return "canvas_blocked";
  }
}

/**
 * Computes a WebGL hardware renderer signature.
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return "no_webgl";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "webgl_no_debug";

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "";
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
    return fnv1a(`${vendor}~${renderer}`);
  } catch {
    return "webgl_blocked";
  }
}

const STORAGE_DEVICE_TOKEN_KEY = "slidebee_device_trial_token";
const COOKIE_DEVICE_TOKEN_KEY = "sb_dtt";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Computes a persistent, multi-factor hardware & environment device fingerprint.
 * Combines canvas geometry, WebGL renderer, screen geometry, platform architecture,
 * and persisted tokens across storage layers.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server_environment";

  // Check persistent storage layers
  let cachedToken = localStorage.getItem(STORAGE_DEVICE_TOKEN_KEY);
  if (!cachedToken) {
    cachedToken = getCookie(COOKIE_DEVICE_TOKEN_KEY);
  }

  // Gather environment factors
  const screenData = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const canvasHash = getCanvasFingerprint();
  const webglHash = getWebGLFingerprint();
  const platform = navigator.platform || "unknown";

  const rawHardwareSignature = [
    screenData,
    hardwareConcurrency,
    timeZone,
    canvasHash,
    webglHash,
    platform
  ].join("::");

  const hardwareHash = `fp_${fnv1a(rawHardwareSignature)}`;

  // Final persistent composite token
  const finalFingerprint = cachedToken || hardwareHash;

  // Re-persist to all available layers for multi-layer redundancy
  try {
    localStorage.setItem(STORAGE_DEVICE_TOKEN_KEY, finalFingerprint);
    setCookie(COOKIE_DEVICE_TOKEN_KEY, finalFingerprint, 365);
  } catch (err) {
    console.warn("Device token persistence notice:", err);
  }

  return finalFingerprint;
}
