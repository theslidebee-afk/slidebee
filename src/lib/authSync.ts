import { supabase } from "./supabase";

export type AuthEventType = "LOGOUT" | "LOGIN";

export interface AuthSyncMessage {
  type: AuthEventType;
  role?: "admin" | "client";
  timestamp: number;
}

const AUTH_CHANNEL_NAME = "slidebee_auth_sync_channel";
const STORAGE_SYNC_KEY = "slidebee_auth_sync_ping";

/**
 * Broadcast an authentication event to all other open tabs/windows
 */
export const broadcastAuthEvent = (type: AuthEventType, role?: "admin" | "client") => {
  const payload: AuthSyncMessage = {
    type,
    role,
    timestamp: Date.now()
  };

  // 1. BroadcastChannel API for modern browsers
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel(AUTH_CHANNEL_NAME);
      bc.postMessage(payload);
      bc.close();
    }
  } catch (err) {
    console.warn("BroadcastChannel postMessage notice:", err);
  }

  // 2. Storage event ping (guaranteed trigger across tabs)
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(payload));
    }
  } catch (err) {
    console.warn("Storage sync trigger notice:", err);
  }
};

/**
 * Perform a full, clean global logout and synchronize across all tabs immediately
 */
export const performGlobalLogout = async () => {
  try {
    localStorage.removeItem("slidebee_admin_session");
    localStorage.removeItem("slidebee_admin_email");
    localStorage.removeItem("slidebee_client_user");
    await supabase.auth.signOut().catch(() => {});
  } catch (err) {
    console.warn("Global logout notice:", err);
  } finally {
    broadcastAuthEvent("LOGOUT");
  }
};

/**
 * Terminate Admin session specifically without affecting client tokens if any
 */
export const performAdminLogout = () => {
  try {
    localStorage.removeItem("slidebee_admin_session");
    localStorage.removeItem("slidebee_admin_email");
  } catch (err) {
    console.warn("Admin logout notice:", err);
  } finally {
    broadcastAuthEvent("LOGOUT", "admin");
  }
};

/**
 * Terminate Client session specifically and sign out from Supabase Auth
 */
export const performClientLogout = async () => {
  try {
    localStorage.removeItem("slidebee_client_user");
    await supabase.auth.signOut().catch(() => {});
  } catch (err) {
    console.warn("Client logout notice:", err);
  } finally {
    broadcastAuthEvent("LOGOUT", "client");
  }
};

/**
 * Subscribe to cross-tab auth state changes.
 * Calls onLogout when another tab logs out, and onLogin when another tab logs in.
 */
export const subscribeToAuthSync = (
  onLogout: (role?: string) => void,
  onLogin?: (role?: string) => void
): (() => void) => {
  if (typeof window === "undefined") return () => {};

  let bc: BroadcastChannel | null = null;

  // 1. BroadcastChannel Listener
  try {
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel(AUTH_CHANNEL_NAME);
      bc.onmessage = (event: MessageEvent<AuthSyncMessage>) => {
        if (!event.data) return;
        if (event.data.type === "LOGOUT") {
          onLogout(event.data.role);
        } else if (event.data.type === "LOGIN" && onLogin) {
          onLogin(event.data.role);
        }
      };
    }
  } catch (err) {
    console.warn("BroadcastChannel subscribe notice:", err);
  }

  // 2. Storage Event Listener (fires in other tabs when localStorage changes)
  const handleStorage = (event: StorageEvent) => {
    // A) Explicit auth sync ping
    if (event.key === STORAGE_SYNC_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue) as AuthSyncMessage;
        if (data.type === "LOGOUT") {
          onLogout(data.role);
          return;
        } else if (data.type === "LOGIN" && onLogin) {
          onLogin(data.role);
          return;
        }
      } catch {}
    }

    // B) Direct inspection of keys being removed
    if (
      event.key === "slidebee_admin_session" ||
      event.key === "slidebee_client_user" ||
      event.key === null // storage.clear()
    ) {
      const adminStillActive = localStorage.getItem("slidebee_admin_session") === "true";
      const clientStillActive = !!localStorage.getItem("slidebee_client_user");

      if (!adminStillActive && !clientStillActive) {
        onLogout();
      } else if (onLogin) {
        onLogin(adminStillActive ? "admin" : "client");
      }
    }
  };

  window.addEventListener("storage", handleStorage);

  // Return cleanup function
  return () => {
    if (bc) {
      try {
        bc.close();
      } catch {}
    }
    window.removeEventListener("storage", handleStorage);
  };
};
