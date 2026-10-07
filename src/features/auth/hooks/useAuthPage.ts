import { useState, useEffect, useMemo, type FormEvent } from "react";
import { d1 } from "../../../lib/d1";
import { useClientLedger } from "../../../modules/ClientLedgerAuth";
import { WHATSAPP_CONFIG } from "../../../config/whatsapp";
import { useAccountDeletion } from "./useAccountDeletion";
import { usePasswordRecovery } from "./usePasswordRecovery";

export function useAuthPage() {
  const incomingParams = useMemo(() => {
    if (typeof window === "undefined") return { orderRef: "", email: "", name: "", action: "" };
    const search = window.location.search || "";
    const hash = window.location.hash || "";
    const searchParams = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : "");
    return {
      orderRef:
        searchParams.get("orderRef") ||
        searchParams.get("ref") ||
        hashParams.get("orderRef") ||
        hashParams.get("ref") ||
        "",
      email: searchParams.get("email") || hashParams.get("email") || "",
      name: searchParams.get("name") || hashParams.get("name") || "",
      action: searchParams.get("action") || hashParams.get("action") || "",
      redirect: searchParams.get("redirect") || hashParams.get("redirect") || "",
    };
  }, []);

  const [isSignUp, setIsSignUp] = useState<boolean>(() => Boolean(incomingParams.orderRef));
  const [email, setEmail] = useState<string>(() => incomingParams.email || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState<string>(() => incomingParams.name || "");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState("");

  const [sessionDisplacedInfo, setSessionDisplacedInfo] = useState<{ displaced: boolean; newDevice: string }>(
    () => {
      if (typeof window === "undefined") return { displaced: false, newDevice: "" };
      const url = window.location.href;
      const isDisplacedUrl = url.includes("reason=session_displaced");
      const isDisplacedStorage = sessionStorage.getItem("slidebee_session_displaced") === "true";
      if (isDisplacedUrl || isDisplacedStorage) {
        const device = sessionStorage.getItem("slidebee_displaced_by") || "another device";
        return { displaced: true, newDevice: device };
      }
      return { displaced: false, newDevice: "" };
    }
  );

  useEffect(() => {
    const handleCheckDisplaced = () => {
      if (typeof window === "undefined") return;
      const url = window.location.href;
      if (
        url.includes("reason=session_displaced") ||
        sessionStorage.getItem("slidebee_session_displaced") === "true"
      ) {
        const device = sessionStorage.getItem("slidebee_displaced_by") || "another device";
        setSessionDisplacedInfo({ displaced: true, newDevice: device });
      }
    };
    handleCheckDisplaced();
    window.addEventListener("hashchange", handleCheckDisplaced);
    return () => window.removeEventListener("hashchange", handleCheckDisplaced);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("slidebee_admin_session") === "true") {
      window.location.href = "/admin";
    }
  }, []);

  const {
    currentUser,
    userProfile,
    userOrders,
    userSubscription: ledgerSubscription,
    isPro,
    isProExpired: ledgerProExpired,
    daysRemaining,
    loading,
    purchasedItems,
    usageHistory,
    userTier,
    downloadsToday,
    downloadsThisMonth,
    remainingFreeToday,
    remainingPremiumThisMonth,
    signIn,
    signInWithGoogle,
    signUp,
    logout,
    requestPasswordReset,
    completePasswordReset,
  } = useClientLedger();

  const {
    isDeleteAccountOpen,
    setIsDeleteAccountOpen,
    clientDeleteReason,
    setClientDeleteReason,
    clientDeleteCustomReason,
    setClientDeleteCustomReason,
    clientDeleteComments,
    setClientDeleteComments,
    clientDeleteConfirmation,
    setClientDeleteConfirmation,
    isDeletingClientAccount,
    accountDeletedNotice,
    handleDeleteMyAccount,
  } = useAccountDeletion({ currentUser, userProfile, logout });

  const {
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
  } = usePasswordRecovery({ completePasswordReset });

  const [googleLoading, setGoogleLoading] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = sessionStorage.getItem("slidebee_auth_failed_attempts");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => {
    const lockUntil = sessionStorage.getItem("slidebee_auth_lock_until");
    if (lockUntil) {
      return Math.max(0, Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000));
    }
    return 0;
  });

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState("");

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem("slidebee_auth_lock_until");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const [directSubscription, setDirectSubscription] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.email) {
      d1.from("subscriptions")
        .select("*")
        .ilike("user_email", currentUser.email.trim())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setDirectSubscription(data);
        });
    }
  }, [currentUser?.email]);

  const userSubscription = directSubscription || ledgerSubscription;

  const [studioWhatsapp, setStudioWhatsapp] = useState<string>(
    WHATSAPP_CONFIG.phoneNumber || "919876543210"
  );

  useEffect(() => {
    d1.from("site_config")
      .select("value")
      .eq("key", "contact_cms")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value?.whatsapp) setStudioWhatsapp(data.value.whatsapp);
      });
  }, []);

  const isProExpired = Boolean(
    ledgerProExpired ||
      (userSubscription &&
        userSubscription.current_period_end &&
        new Date(userSubscription.current_period_end) <= new Date()) ||
      (userProfile?.tier_expires_at &&
        userProfile?.tier !== "free" &&
        new Date(userProfile.tier_expires_at) <= new Date())
  );

  const isProUser = Boolean(
    isPro ||
      ["monthly", "yearly", "lifetime"].includes(userTier) ||
      ["monthly", "yearly", "lifetime"].includes(userProfile?.tier || "") ||
      (userSubscription &&
        (userSubscription.status === "active" || userSubscription.status === "trialing") &&
        (!userSubscription.current_period_end || new Date(userSubscription.current_period_end) > new Date()))
  );

  const proDaysRemaining =
    daysRemaining ??
    (userSubscription?.current_period_end
      ? Math.max(
          0,
          Math.ceil((new Date(userSubscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        )
      : userProfile?.tier_expires_at
      ? Math.max(
          0,
          Math.ceil((new Date(userProfile.tier_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        )
      : null);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setFormError("");
      await signInWithGoogle();
    } catch (err: any) {
      console.warn("Google sign in notice:", err);
      setFormError(err.message || "Failed to initiate Google Sign-In. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleSubmitAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSignUp && cooldownRemaining > 0) {
      setFormError(`Rate limit reached. Please wait ${cooldownRemaining} seconds before trying again.`);
      return;
    }

    setFormLoading(true);
    setFormError("");
    setSignUpSuccessMessage("");
    sessionStorage.removeItem("slidebee_session_displaced");
    sessionStorage.removeItem("slidebee_displaced_by");
    setSessionDisplacedInfo({ displaced: false, newDevice: "" });

    try {
      if (isSignUp) {
        const res = await signUp(email, password, fullName, company);
        if (res.message) {
          setSignUpSuccessMessage(res.message);
        }
      } else {
        const res = await signIn(email, password);
        if (!res.success) {
          if (res.isUnregistered || res.message?.includes("No registered account found")) {
            setIsSignUp(true);
            setFormError(`No registered account found for ${email.trim()}`);
            return;
          }
          const nextFailed = failedAttempts + 1;
          setFailedAttempts(nextFailed);
          sessionStorage.setItem("slidebee_auth_failed_attempts", String(nextFailed));

          if (nextFailed >= 5) {
            const lockTime = Date.now() + 30000;
            sessionStorage.setItem("slidebee_auth_lock_until", String(lockTime));
            setCooldownRemaining(30);
            setFormError("Too many failed attempts. Security cooldown activated. Please wait 30 seconds.");
          } else {
            setFormError(res.message || "Invalid email or password. Please verify your credentials.");
          }
        } else {
          setFailedAttempts(0);
          sessionStorage.removeItem("slidebee_auth_failed_attempts");
          sessionStorage.removeItem("slidebee_auth_lock_until");

          const cleanEmail = email.toLowerCase().trim();
          const isAdmin = cleanEmail === "admin@theslidebee.com" || res.isAdmin;

          if (isAdmin) {
            window.location.href = "/admin";
            return;
          }

          if (incomingParams.redirect) {
            const dest = decodeURIComponent(incomingParams.redirect).trim();
            // Anti-Open-Redirect: ensure destination is strictly relative and does not use protocol-relative '//'
            const safeDest = dest.startsWith("/") && !dest.startsWith("//") ? dest : `/${dest.replace(/^[\/\\]+/, "")}`;
            window.location.href = safeDest;
            return;
          }
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Authentication failed. Please check details.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetFeedback("");
    try {
      const res = await requestPasswordReset(resetEmail.trim());
      setResetFeedback(res.message);
    } catch (err: any) {
      setResetFeedback("If an account exists with this email, a recovery link has been dispatched.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return {
    incomingParams,
    isSignUp,
    setIsSignUp,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    company,
    setCompany,
    showPassword,
    setShowPassword,
    formLoading,
    formError,
    setFormError,
    signUpSuccessMessage,
    setSignUpSuccessMessage,
    sessionDisplacedInfo,
    setSessionDisplacedInfo,
    isDeleteAccountOpen,
    setIsDeleteAccountOpen,
    clientDeleteReason,
    setClientDeleteReason,
    clientDeleteCustomReason,
    setClientDeleteCustomReason,
    clientDeleteComments,
    setClientDeleteComments,
    clientDeleteConfirmation,
    setClientDeleteConfirmation,
    isDeletingClientAccount,
    accountDeletedNotice,
    currentUser,
    userProfile,
    userOrders,
    loading,
    purchasedItems,
    usageHistory,
    userTier,
    downloadsToday,
    downloadsThisMonth,
    remainingFreeToday,
    remainingPremiumThisMonth,
    userSubscription,
    studioWhatsapp,
    isProExpired,
    isProUser,
    proDaysRemaining,
    googleLoading,
    handleGoogleSignIn,
    handleSubmitAuth,
    failedAttempts,
    cooldownRemaining,
    showForgotModal,
    setShowForgotModal,
    resetEmail,
    setResetEmail,
    resetLoading,
    resetFeedback,
    setResetFeedback,
    handleForgotPassword,
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
    handleLogout,
    handleDeleteMyAccount,
  };
}
