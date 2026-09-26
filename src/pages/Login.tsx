import { useState, useEffect } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  X,
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useClientLedger } from "../modules/ClientLedgerAuth";
import SlideBeeLogo from "../components/SlideBeeLogo";
import UserModernDashboard from "../components/UserModernDashboard";
import { usePageSEO } from "../hooks/usePageSEO";
import { WHATSAPP_CONFIG } from "../config/whatsapp";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);


  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState("");

  // Session Displacement Security State
  const [sessionDisplacedInfo, setSessionDisplacedInfo] = useState<{ displaced: boolean; newDevice: string }>(() => {
    if (typeof window === "undefined") return { displaced: false, newDevice: "" };
    const url = window.location.href;
    const isDisplacedUrl = url.includes("reason=session_displaced");
    const isDisplacedStorage = sessionStorage.getItem("slidebee_session_displaced") === "true";
    if (isDisplacedUrl || isDisplacedStorage) {
      const device = sessionStorage.getItem("slidebee_displaced_by") || "another device";
      return { displaced: true, newDevice: device };
    }
    return { displaced: false, newDevice: "" };
  });

  useEffect(() => {
    const handleCheckDisplaced = () => {
      if (typeof window === "undefined") return;
      const url = window.location.href;
      if (url.includes("reason=session_displaced") || sessionStorage.getItem("slidebee_session_displaced") === "true") {
        const device = sessionStorage.getItem("slidebee_displaced_by") || "another device";
        setSessionDisplacedInfo({ displaced: true, newDevice: device });
      }
    };
    handleCheckDisplaced();
    window.addEventListener("hashchange", handleCheckDisplaced);
    return () => window.removeEventListener("hashchange", handleCheckDisplaced);
  }, []);

  // Self-service Account Deletion State
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [clientDeleteReason, setClientDeleteReason] = useState("My presentation project is complete");
  const [clientDeleteCustomReason, setClientDeleteCustomReason] = useState("");
  const [clientDeleteComments, setClientDeleteComments] = useState("");
  const [clientDeleteConfirmation, setClientDeleteConfirmation] = useState("");
  const [isDeletingClientAccount, setIsDeletingClientAccount] = useState(false);
  const [accountDeletedNotice, setAccountDeletedNotice] = useState("");

  // Deep Module: ClientLedgerAuth
  const {
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
    signIn,
    signUp,
    logout,
    requestPasswordReset,
    completePasswordReset
  } = useClientLedger();

  // Password Recovery Mode State
  const [isResetMode, setIsResetMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const url = window.location.href;
    return (
      url.includes("action=reset") ||
      url.includes("type=recovery") ||
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
      if (
        url.includes("action=reset") ||
        url.includes("type=recovery") ||
        sessionStorage.getItem("slidebee_password_recovery") === "true"
      ) {
        setIsResetMode(true);
      }
    };
    checkRecovery();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsResetMode(true);
        sessionStorage.setItem("slidebee_password_recovery", "true");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Brute-force throttling state (Prompt 08)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = sessionStorage.getItem("slidebee_auth_failed_attempts");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(() => {
    const lockUntil = sessionStorage.getItem("slidebee_auth_lock_until");
    if (lockUntil) {
      const remaining = Math.max(0, Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000));
      return remaining;
    }
    return 0;
  });

  // Forgot password modal state (Prompt 11 & 12)
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

  usePageSEO({
    title: currentUser ? "Client Portal & Ledger | SlideBee" : "Client & Admin Login | SlideBee",
    description: "Access your purchased PowerPoint decks, track custom presentation milestones, manage presentation downloads, or sign in as administrator.",
  });

  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.email) {
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_email", currentUser.email)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setUserSubscription(data);
        });
    }
  }, [currentUser?.email]);

  const [studioWhatsapp, setStudioWhatsapp] = useState<string>(WHATSAPP_CONFIG.phoneNumber || "919876543210");

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "contact_cms")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value?.whatsapp) setStudioWhatsapp(data.value.whatsapp);
      });
  }, []);

  const isProExpired = Boolean(
    userSubscription &&
    userSubscription.current_period_end &&
    new Date(userSubscription.current_period_end) <= new Date()
  );

  const isProUser = Boolean(
    (userSubscription &&
    (userSubscription.status === "active" || userSubscription.status === "trialing") &&
    (!userSubscription.current_period_end || new Date(userSubscription.current_period_end) > new Date()) &&
    (userSubscription.plan_name?.toLowerCase().includes("pro") ||
     userSubscription.plan_tier?.toLowerCase().includes("pro") ||
     userSubscription.plan_name?.toLowerCase().includes("membership"))) ||
    userTier === "monthly" ||
    userTier === "yearly" ||
    userTier === "lifetime"
  );

  const proDaysRemaining = userSubscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(userSubscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;


  // Handle Sign In / Sign Up via Deep Module
  const handleSubmitAuth = async (e: React.FormEvent) => {
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
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Authentication failed. Please check details.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
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
      const res = await completePasswordReset(newPassword);
      if (!res.success) {
        setResetError(res.message || "Failed to update password. Link may have expired.");
        setResetSubmitting(false);
        return;
      }

      setResetCompleted(true);
      sessionStorage.removeItem("slidebee_password_recovery");

      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email?.toLowerCase().trim() || "";
      const isSuperOrAdmin =
        userEmail === "superadmin@theslidebee.com" ||
        userEmail === "admin@theslidebee.com" ||
        userEmail.startsWith("admin@") ||
        userEmail.startsWith("superadmin@") ||
        session?.user?.user_metadata?.role === "admin" ||
        session?.user?.user_metadata?.role === "super_admin";

      setTimeout(() => {
        if (isSuperOrAdmin) {
          localStorage.setItem("slidebee_admin_session", "true");
          localStorage.setItem("slidebee_admin_email", userEmail || "superadmin@theslidebee.com");
          window.location.hash = "#/admin";
        } else {
          setIsResetMode(false);
          setResetCompleted(false);
          window.location.hash = "#/login";
        }
      }, 1500);
    } catch (err: any) {
      setResetError(err.message || "Password update failed. Please try again.");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteMyAccount = async () => {
    if (clientDeleteConfirmation.trim().toUpperCase() !== "DELETE") {
      alert("Please type DELETE to confirm account closure.");
      return;
    }

    if (!currentUser?.email) return;

    setIsDeletingClientAccount(true);
    try {
      const finalReason = clientDeleteCustomReason.trim() || clientDeleteReason;

      await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-slidebee-app-token": "slidebee_internal_app_2026",
        },
        body: JSON.stringify({
          targetEmail: currentUser.email,
          targetUserId: currentUser.id,
          reason: finalReason,
          customNotes: clientDeleteComments,
          sendNotice: true,
          clientName: userProfile?.full_name || currentUser.email.split("@")[0],
        }),
      });

      // Sign out and clear session
      await logout();
      setIsDeleteAccountOpen(false);
      setAccountDeletedNotice(
        "Your SlideBee client account has been permanently deleted and personal data purged. A confirmation notice with your deletion details has been sent to your email."
      );
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      alert(`Account deletion failed: ${err?.message || err}`);
    } finally {
      setIsDeletingClientAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center text-[#111111]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#726F6D]">
            Loading SlideBee Account...
          </p>
        </div>
      </div>
    );
  }

  // --- 1. AUTHENTICATED CLIENT DASHBOARD ---
  if (currentUser && !isResetMode) {
    return (
      <div className="min-h-screen bg-[#FFF9E8]">
        <UserModernDashboard
          currentUser={currentUser}
          userProfile={userProfile}
          userSubscription={userSubscription}
          userTier={userTier}
          userOrders={userOrders}
          purchasedItems={purchasedItems}
          usageHistory={usageHistory}
          downloadsToday={downloadsToday}
          downloadsThisMonth={downloadsThisMonth}
          remainingFreeToday={remainingFreeToday}
          remainingPremiumThisMonth={remainingPremiumThisMonth}
          proDaysRemaining={proDaysRemaining}
          isProUser={isProUser}
          isProExpired={isProExpired}
          handleLogout={handleLogout}
          studioWhatsapp={studioWhatsapp}
          onDeleteAccount={() => setIsDeleteAccountOpen(true)}
        />

        {/* CLIENT SELF-SERVICE DELETE ACCOUNT MODAL */}
        <AnimatePresence>
          {isDeleteAccountOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="hex-card-lg bg-white border border-red-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-red-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-sm text-red-700">
                        Delete SlideBee Account
                      </h3>
                      <p className="text-[11px] text-[#726F6D]">
                        Permanent removal of account and download entitlements
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteAccountOpen(false)}
                    className="p-1 text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 leading-relaxed">
                  <strong>Warning:</strong> Deleting your account will immediately forfeit your account tier benefits, template download quotas, and revoke portal access. An official confirmation will be dispatched to <strong>{currentUser.email}</strong>.
                </div>

                {/* Reason for Deletion */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Why are you deleting your account? *
                    </label>
                    <select
                      value={clientDeleteReason}
                      onChange={(e) => setClientDeleteReason(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl px-3 py-2 text-xs text-[#111111] font-bold focus:border-primary outline-none"
                    >
                      <option value="My presentation project is complete">My presentation project is complete</option>
                      <option value="Switching to alternative design workflow">Switching to alternative design workflow</option>
                      <option value="Need to change or update primary email">Need to change or update primary email</option>
                      <option value="Privacy / GDPR data erasure request">Privacy / GDPR data erasure request</option>
                      <option value="Other reason">Other reason</option>
                    </select>
                  </div>

                  {clientDeleteReason === "Other reason" && (
                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1">
                        Specify Reason:
                      </label>
                      <input
                        type="text"
                        value={clientDeleteCustomReason}
                        onChange={(e) => setClientDeleteCustomReason(e.target.value)}
                        placeholder="Briefly describe..."
                        className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl px-3 py-2 text-xs text-[#111111] font-medium focus:border-primary outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#111111] mb-1">
                      Optional Feedback / Notes for our Team:
                    </label>
                    <textarea
                      rows={2}
                      value={clientDeleteComments}
                      onChange={(e) => setClientDeleteComments(e.target.value)}
                      placeholder="Any suggestions or feedback on your experience?"
                      className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl p-2.5 text-xs text-[#111111] font-medium focus:border-primary outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">
                      Type <strong>DELETE</strong> to confirm:
                    </label>
                    <input
                      type="text"
                      value={clientDeleteConfirmation}
                      onChange={(e) => setClientDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-red-900 focus:border-red-600 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsDeleteAccountOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-[#726F6D] hover:text-[#111111] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingClientAccount || clientDeleteConfirmation.trim().toUpperCase() !== "DELETE"}
                    onClick={handleDeleteMyAccount}
                    className="hex-pill bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {isDeletingClientAccount ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Purging Account...
                      </>
                    ) : (
                      <>
                        <Trash2 size={13} /> Confirm Permanent Deletion
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- 2. UNAUTHENTICATED SIGN IN / SIGN UP VIEW ---
  return (
    <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center p-4 relative overflow-hidden large-hex-grid pt-28 pb-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="hex-card-lg bg-white border-2 border-primary/40 p-8 sm:p-10 shadow-2xl max-w-md w-full relative z-10">
        
        {accountDeletedNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>{accountDeletedNotice}</span>
          </div>
        )}

        {isResetMode ? (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <SlideBeeLogo variant="light" size="lg" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-primary/40 rounded-full text-[11px] font-bold text-amber-900 mb-2">
                <ShieldCheck size={13} className="text-primary-amber" />
                Verified Password Reset Session
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-[#111111]">
                Create New Password
              </h2>
              <p className="text-xs text-[#726F6D] font-medium mt-1">
                Choose a strong new password for your account to restore portal access.
              </p>
            </div>

            {resetCompleted ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-medium space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  Password Updated Successfully!
                </div>
                <p className="leading-relaxed">
                  Your credentials have been securely refreshed. Redirecting you to your account...
                </p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {resetError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-11 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] p-1"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#726F6D] font-medium mt-1 pl-2">
                    Minimum 8 characters with letters and numbers.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-11 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 disabled:opacity-50 mt-2"
                >
                  {resetSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={15} />
                      Set New Password & Continue
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      sessionStorage.removeItem("slidebee_password_recovery");
                      window.location.hash = "#/login";
                    }}
                    className="text-xs font-bold text-[#726F6D] hover:text-[#111111] transition-colors"
                  >
                    Cancel and Return to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <SlideBeeLogo variant="light" size="lg" />
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-[#111111]">
                {isSignUp ? "Create Client Account" : "Sign In to Client Portal"}
              </h2>
              <p className="text-xs text-[#726F6D] font-medium mt-1">
                {isSignUp 
                  ? "Access deck briefs, retainer quotas, and deliverables" 
                  : "Manage your active presentation projects & templates"}
              </p>
            </div>

            {/* Session Displacement Security Notice */}
            {sessionDisplacedInfo.displaced && (
              <div className="mb-6 bg-[#111111] border-2 border-[#FCBF14] text-white p-4 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert size={18} className="text-[#FCBF14]" />
                  </div>
                  <div className="flex-1 pr-6">
                    <h4 className="text-xs font-heading font-black text-[#FCBF14] uppercase tracking-wider mb-1">
                      Security Alert: Active Session Displaced
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      Your account was logged in on another device ({sessionDisplacedInfo.newDevice}). To enforce strict single-session security, this device was safely logged out. Sign in below if you wish to reactivate this device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem("slidebee_session_displaced");
                      sessionStorage.removeItem("slidebee_displaced_by");
                      setSessionDisplacedInfo({ displaced: false, newDevice: "" });
                    }}
                    className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white transition-colors"
                    title="Dismiss alert"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Tab Selector */}
            <div className="flex bg-[#FFF9E8] border border-primary/30 p-1 hex-pill mb-6">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setFormError(""); setSignUpSuccessMessage(""); }}
                className={`w-1/2 py-2 hex-pill text-xs font-black transition-all ${
                  !isSignUp ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setFormError(""); setSignUpSuccessMessage(""); }}
                className={`w-1/2 py-2 hex-pill text-xs font-black transition-all ${
                  isSignUp ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D]"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmitAuth} className="space-y-4">
              
              {isSignUp && (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Sarah Jenkins"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                      />
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                      Company / Organization
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="HyperGrowth Capital"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                      />
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                  Work Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="sarah@hypergrowth.vc"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block">
                    Password *
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setResetFeedback("");
                        setShowForgotModal(true);
                      }}
                      className="text-[11px] font-bold text-primary-amber hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-11 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-[10px] text-[#726F6D] font-medium mt-1 pl-2">
                    Minimum 8 characters with at least 1 uppercase letter and 1 digit.
                  </p>
                )}
              </div>

              {signUpSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 shadow-sm">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div className="leading-relaxed">{signUpSuccessMessage}</div>
                </div>
              )}

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading || (!isSignUp && cooldownRemaining > 0)}
                className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 disabled:opacity-50 mt-2"
              >
                <ArrowRight size={15} />
                {formLoading
                  ? "Processing..."
                  : !isSignUp && cooldownRemaining > 0
                  ? `Cooldown Active (${cooldownRemaining}s)`
                  : isSignUp
                  ? "Create Client Account"
                  : "Sign In to Portal"}
              </button>
            </form>
          </>
        )}

        {/* Forgot Password Modal (Prompts 11 & 12) */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-2 border-primary/40 p-6 sm:p-8 rounded-2xl max-w-sm w-full shadow-2xl relative">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetFeedback("");
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#111111] p-1"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-1">
                Password Recovery
              </h3>
              <p className="text-xs text-[#726F6D] mb-4">
                Enter your registered work email (clients or superadmin@theslidebee.com). If an account exists, a secure password reset link will be sent to your inbox.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="sarah@hypergrowth.vc or superadmin@theslidebee.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {resetFeedback && (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs font-medium flex items-start gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                    <div className="leading-relaxed">{resetFeedback}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-2.5 text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <ArrowRight size={14} />
                  {resetLoading ? "Sending Recovery Link..." : "Send Reset Instructions"}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-primary/20 text-center space-y-2">
          <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed">
            By signing in or creating an account, you agree to SlideBee's{" "}
            <span className="text-[#111111] font-bold underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-[#111111] font-bold underline cursor-pointer">Privacy Policy</span>.
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-[#726F6D] font-semibold">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary-amber" />
              256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Lock size={11} className="text-primary-amber" />
              Strict NDA Protection
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
