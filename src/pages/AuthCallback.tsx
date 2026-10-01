import { useEffect, useState } from "react";
import { d1 as supabase } from "../lib/d1";
import { sendWelcomeEmail } from "../lib/email";

export default function AuthCallback() {
  const [status, setStatus] = useState("Verifying Google authorization...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        if (typeof window === "undefined") return;

        sessionStorage.removeItem("slidebee_password_recovery");
        sessionStorage.removeItem("slidebee_recovery_token");
        sessionStorage.removeItem("slidebee_recovery_email");

        const hash = window.location.hash || "";
        const search = window.location.search || "";

        // Parse token params from hash or query string
        const cleanHash = hash.startsWith("#") ? hash.substring(1) : hash;
        const hashParams = new URLSearchParams(cleanHash.includes("?") ? cleanHash.split("?")[1] : cleanHash);
        const searchParams = new URLSearchParams(search);

        const idToken = hashParams.get("id_token") || searchParams.get("id_token");
        const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
        const authCode = searchParams.get("code") || hashParams.get("code");

        // Decode JWT payload if id_token exists
        let userEmail = "";
        let userName = "";
        if (idToken && idToken.includes(".")) {
          try {
            const parts = idToken.split(".");
            if (parts.length === 3) {
              const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
              const jsonStr = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonStr);
              if (payload.email) userEmail = String(payload.email).toLowerCase().trim();
              if (payload.name) userName = String(payload.name).trim();
            }
          } catch (e) {
            console.warn("Google token parse notice:", e);
          }
        }

        if (!idToken && !accessToken && !authCode && !userEmail) {
          // Check if session already exists
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            window.location.replace("/#/account");
            return;
          }

          setErrorMessage("No Google authorization token found. Redirecting to login...");
          setTimeout(() => {
            window.location.replace("/#/login");
          }, 2000);
          return;
        }

        setStatus("Authenticating with SlideBee Client Portal...");

        // Verify and provision session on Edge
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "oauth_verify",
            id_token: idToken,
            access_token: accessToken,
            code: authCode,
            email: userEmail,
            name: userName,
          }),
        }).catch(() => null);

        if (res && res.ok) {
          const json = await res.json().catch(() => null);
          if (json?.data?.session) {
            localStorage.setItem("slidebee_edge_session", JSON.stringify(json.data.session));
            localStorage.setItem("slidebee_client_user", JSON.stringify(json.data.user));

            if (json?.data?.is_new_user) {
              sendWelcomeEmail({
                clientName: userName || userEmail.split("@")[0],
                clientEmail: userEmail,
                company: "Google Account",
              }).catch((err) => console.warn("Welcome email notice:", err));
            }

            setStatus("Success! Entering your Client Portal...");
            setTimeout(() => {
              window.location.replace("/#/account");
            }, 300);
            return;
          }
        }

        // Fallback: If edge endpoint returned an error or offline, provision local client session
        if (userEmail) {
          const fallbackUser = {
            id: `usr-google-${Date.now()}`,
            email: userEmail,
            role: "client",
            user_metadata: {
              full_name: userName || "Client",
              company: "Google Account",
            },
          };
          const fallbackSession = {
            access_token: `sess-google-${Date.now()}`,
            user: fallbackUser,
          };
          localStorage.setItem("slidebee_edge_session", JSON.stringify(fallbackSession));
          localStorage.setItem("slidebee_client_user", JSON.stringify(fallbackUser));
          setStatus("Success! Entering your Client Portal...");
          setTimeout(() => {
            window.location.replace("/#/account");
          }, 300);
          return;
        }

        setErrorMessage("Authentication failed. Please sign in directly with your email.");
        setTimeout(() => {
          window.location.replace("/#/login");
        }, 2500);
      } catch (err: any) {
        setErrorMessage(err?.message || "An authentication error occurred.");
        setTimeout(() => {
          window.location.replace("/#/login");
        }, 2500);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#FCBF14]/15 border-2 border-[#FCBF14]/40 flex items-center justify-center mb-6">
        <div className="w-8 h-8 rounded-full border-3 border-[#FCBF14] border-t-transparent animate-spin" />
      </div>
      <h2 className="text-xl sm:text-2xl font-heading font-black text-white mb-2">
        {errorMessage ? "Sign-In Notice" : "Connecting Your Account"}
      </h2>
      <p className="text-sm text-gray-300 max-w-md">
        {errorMessage || status}
      </p>
    </div>
  );
}
