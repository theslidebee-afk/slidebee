import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { verifyActiveSession, triggerSessionDisplacement } from "../lib/sessionGuard";

/**
 * Global Session Enforcer Hook
 * Continuously validates single active session across devices.
 * Checks on route transitions, window focus, and background heartbeat.
 */
export function useSessionEnforcer() {
  const location = useLocation();
  const isCheckingRef = useRef(false);

  const checkSession = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      // 1. Identify current authenticated email
      const adminEmail = localStorage.getItem("slidebee_admin_email");
      const clientUserStr = localStorage.getItem("slidebee_client_user");
      let activeEmail = adminEmail || "";

      if (!activeEmail && clientUserStr) {
        try {
          const clientUser = JSON.parse(clientUserStr);
          activeEmail = clientUser?.email || "";
        } catch {}
      }

      if (!activeEmail) {
        const { data: { session } } = await supabase.auth.getSession();
        activeEmail = session?.user?.email || "";
      }

      if (!activeEmail) {
        isCheckingRef.current = false;
        return;
      }

      // 2. Verify active session against server ledger
      const verification = await verifyActiveSession(activeEmail);
      if (!verification.valid) {
        console.warn("Session displaced by another device:", verification.newDevice);
        await triggerSessionDisplacement(verification.newDevice);
      }
    } catch (err) {
      console.warn("Session verification check notice:", err);
    } finally {
      isCheckingRef.current = false;
    }
  };

  // Check on route transition
  useEffect(() => {
    checkSession();
  }, [location.pathname, location.search]);

  // Check on window focus / tab activation
  useEffect(() => {
    const handleFocus = () => checkSession();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkSession();
    });

    // 20-second heartbeat verification
    const interval = setInterval(checkSession, 20000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);
}
