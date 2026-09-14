import { supabase } from "./supabase";
import { performGlobalLogout } from "./authSync";

const SESSION_STORAGE_ID_KEY = "slidebee_session_id";
export const DISPLACED_FLAG_KEY = "slidebee_session_displaced";
export const DISPLACED_DEVICE_KEY = "slidebee_displaced_by";

/**
 * Derives a clean, human-readable device label from user agent.
 */
export function generateDeviceLabel(): string {
  if (typeof navigator === "undefined") return "Desktop Device";
  const ua = navigator.userAgent;

  let os = "Desktop";
  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS Device";
  else if (/Android/.test(ua)) os = "Android Device";
  else if (/Macintosh|Mac OS X/.test(ua)) os = "Mac";
  else if (/Windows/.test(ua)) os = "Windows PC";
  else if (/Linux/.test(ua)) os = "Linux PC";

  let browser = "Browser";
  if (/Chrome|CriOS/.test(ua) && !/Edg/.test(ua)) browser = "Chrome";
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  else if (/Firefox|FxiOS/.test(ua)) browser = "Firefox";
  else if (/Edg/.test(ua)) browser = "Edge";

  return `${browser} on ${os}`;
}

/**
 * Retrieves or initializes the local device session ID.
 */
export function getLocalSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_STORAGE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_ID_KEY, id);
  }
  return id;
}

/**
 * Registers this device as the sole active session for the account.
 * Displaces all previous sessions on other devices.
 */
export async function registerActiveSession(email: string): Promise<string> {
  const newSessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_ID_KEY, newSessionId);
  const deviceLabel = generateDeviceLabel();

  // 1. Invalidate other refresh tokens at Supabase server level
  try {
    // @ts-ignore - scope is supported in modern Supabase GoTrue
    await supabase.auth.signOut({ scope: "others" }).catch(() => {});
  } catch (err) {
    console.warn("Server-side token revocation notice:", err);
  }

  // 2. Update user_metadata as native fallback
  try {
    await supabase.auth.updateUser({
      data: {
        active_session_id: newSessionId,
        active_device_info: deviceLabel,
        active_session_at: Date.now()
      }
    }).catch(() => {});
  } catch (err) {
    console.warn("User metadata session sync notice:", err);
  }

  // 3. Register with backend Cloudflare session guard
  try {
    await fetch("/api/session-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "REGISTER",
        email: email.toLowerCase().trim(),
        sessionId: newSessionId,
        deviceInfo: deviceLabel
      })
    }).catch(() => {});
  } catch (err) {
    console.warn("Backend session guard registration notice:", err);
  }

  return newSessionId;
}

/**
 * Verifies whether the local session is still the active session.
 */
export async function verifyActiveSession(email: string): Promise<{ valid: boolean; newDevice?: string }> {
  const localId = localStorage.getItem(SESSION_STORAGE_ID_KEY) || "";
  if (!email) return { valid: true };

  // 1. Primary check via backend Cloudflare session guard
  try {
    const res = await fetch("/api/session-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "VERIFY",
        email: email.toLowerCase().trim(),
        sessionId: localId
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.valid === false) {
        return { valid: false, newDevice: data.newDevice || "another device" };
      }
    }
  } catch (err) {
    // Fallback to user metadata check below
  }

  // 2. Fallback check via GoTrue user metadata
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata?.active_session_id) {
      if (user.user_metadata.active_session_id !== localId) {
        return {
          valid: false,
          newDevice: user.user_metadata.active_device_info || "another device"
        };
      }
    }
  } catch (err) {
    // preserve session on offline/transient errors
  }

  return { valid: true };
}

/**
 * Handles session displacement:
 * Records displacement context, performs global logout, and redirects to login.
 */
export async function triggerSessionDisplacement(newDevice: string = "another device") {
  sessionStorage.setItem(DISPLACED_FLAG_KEY, "true");
  sessionStorage.setItem(DISPLACED_DEVICE_KEY, newDevice);
  localStorage.removeItem(SESSION_STORAGE_ID_KEY);

  await performGlobalLogout();

  // Force redirect to login with displacement notification
  window.location.hash = "#/login?reason=session_displaced";
}
