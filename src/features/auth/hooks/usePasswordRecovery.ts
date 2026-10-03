import { useState, useEffect, type FormEvent } from "react";
import { d1 } from "../../../lib/d1";

interface UsePasswordRecoveryProps {
  completePasswordReset: (password: string, token?: string, email?: string) => Promise<{ success: boolean; message?: string }>;
}

export function usePasswordRecovery({ completePasswordReset }: UsePasswordRecoveryProps) {
  const [isResetMode, setIsResetMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const url = window.location.href;
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const hashParams = new URLSearchParams(hash.split("?")[1] || "");
    const searchParams = new URLSearchParams(search);
    const token = hashParams.get("token") || searchParams.get("token");
    const emailParam = hashParams.get("email") || searchParams.get("email");
    if (token) sessionStorage.setItem("slidebee_recovery_token", token);
    if (emailParam) sessionStorage.setItem("slidebee_recovery_email", emailParam);

    if (
      url.includes("id_token") ||
      url.includes("access_token") ||
      url.includes("auth/callback") ||
      url.includes("code=")
    ) {
      sessionStorage.removeItem("slidebee_password_recovery");
      return false;
    }

    return (
      url.includes("action=reset") ||
      url.includes("type=recovery") ||
      Boolean(token) ||
      sessionStorage.getItem("slidebee_password_recovery") === "true"
    );
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetCompleted, setResetCompleted] = useState(false);

  useEffect(() => {
    const checkRecovery = () => {
      if (typeof window === "undefined") return;
      const url = window.location.href;
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const hashParams = new URLSearchParams(hash.split("?")[1] || "");
      const searchParams = new URLSearchParams(search);
      const token = hashParams.get("token") || searchParams.get("token");
      const emailParam = hashParams.get("email") || searchParams.get("email");
      if (token) sessionStorage.setItem("slidebee_recovery_token", token);
      if (emailParam) sessionStorage.setItem("slidebee_recovery_email", emailParam);

      if (
        url.includes("id_token") ||
        url.includes("access_token") ||
        url.includes("auth/callback") ||
        url.includes("code=")
      ) {
        sessionStorage.removeItem("slidebee_password_recovery");
        setIsResetMode(false);
        return;
      }

      if (
        url.includes("action=reset") ||
        url.includes("type=recovery") ||
        Boolean(token) ||
        sessionStorage.getItem("slidebee_password_recovery") === "true"
      ) {
        setIsResetMode(true);
      }
    };
    checkRecovery();

    const { data: authListener } = d1.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResetMode(true);
        sessionStorage.setItem("slidebee_password_recovery", "true");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!newPassword || newPassword.length < 8) {
      setResetError("Password must be at least 8 characters in length.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match. Please verify and re-enter.");
      return;
    }

    setResetSubmitting(true);
    try {
      const hash = typeof window !== "undefined" ? window.location.hash || "" : "";
      const search = typeof window !== "undefined" ? window.location.search || "" : "";
      const hashParams = new URLSearchParams(hash.split("?")[1] || "");
      const searchParams = new URLSearchParams(search);
      const token =
        hashParams.get("token") ||
        searchParams.get("token") ||
        sessionStorage.getItem("slidebee_recovery_token") ||
        "";
      const emailParam =
        hashParams.get("email") ||
        searchParams.get("email") ||
        sessionStorage.getItem("slidebee_recovery_email") ||
        "";

      const res = await completePasswordReset(newPassword, token, emailParam);
      if (!res.success) {
        setResetError(res.message || "Failed to update password. Link may have expired.");
        setResetSubmitting(false);
        return;
      }

      setResetCompleted(true);
      sessionStorage.removeItem("slidebee_password_recovery");
      sessionStorage.removeItem("slidebee_recovery_token");
      sessionStorage.removeItem("slidebee_recovery_email");

      const {
        data: { session },
      } = await d1.auth.getSession();
      const userEmail = session?.user?.email?.toLowerCase().trim() || "";
      const isSuperOrAdmin =
        userEmail === "admin@theslidebee.com" ||
        session?.user?.user_metadata?.role === "admin" ||
        session?.user?.user_metadata?.role === "super_admin";

      setTimeout(() => {
        if (isSuperOrAdmin) {
          localStorage.setItem("slidebee_admin_session", "true");
          localStorage.setItem("slidebee_admin_email", userEmail || "admin@theslidebee.com");
          window.location.href = "/admin";
        } else {
          setIsResetMode(false);
          setResetCompleted(false);
          window.location.href = "/login";
        }
      }, 1500);
    } catch (err: any) {
      setResetError(err.message || "Password update failed. Please try again.");
    } finally {
      setResetSubmitting(false);
    }
  };

  return {
    isResetMode,
    setIsResetMode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    resetSubmitting,
    resetError,
    resetCompleted,
    handleUpdatePassword,
  };
}
