import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { performClientLogout, subscribeToAuthSync, broadcastAuthEvent } from "../../lib/authSync";
import { sendWelcomeEmail } from "../../lib/email";
import { isDisposableEmail, getDeviceFingerprint } from "../../lib/deviceFingerprint";
import { registerActiveSession, verifyActiveSession, triggerSessionDisplacement } from "../../lib/sessionGuard";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  phone?: string;
  role: "client" | "admin" | "super_admin";
  tier?: "free" | "monthly" | "yearly" | "lifetime";
  tier_expires_at?: string;
  downloads_today?: number;
  last_download_date?: string;
  downloads_this_month?: number;
  month_cycle_start?: string;
  is_bot_flagged?: number;
  credits_total?: number;
  credits_used?: number;
  credits_balance?: number;
  purchased_items: Array<{
    id: string;
    slug?: string;
    code?: string;
    title: string;
    category?: string;
    slides_count?: number;
    download_url: string;
    purchased_at?: string;
    is_premium?: boolean;
    is_credit_redemption?: boolean;
    amount?: number;
    currency?: string;
  }>;
  usage_history: Array<{
    item_title: string;
    credits_used?: number;
    action: string;
    date: string;
  }>;
  last_sign_in_at?: string;
}

export interface ClientAuthResult {
  success: boolean;
  message?: string;
  unregisteredPrompt?: string;
  isUnregistered?: boolean;
}

/**
 * Deep Module: ClientLedgerAuth
 * 
 * Public Interface:
 * - currentUser: Supabase or localStorage user object
 * - userProfile: Normalized client profile and credits ledger
 * - userOrders: Client quote and template purchase orders
 * - loading: Boolean initialization state
 * - signIn(email, password): Signs in client or redirects admin
 * - signUp(email, password, fullName, company): Registers client & grants 5 starter credits
 * - logout(): Global cross-tab logout
 * - redeemCredit(templateId): Atomically redeems 1 free eligible template using starter credits
 * - refreshClientData(): Re-syncs profile and order ledger
 */
export function useClientLedger() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientData = useCallback(async (userEmail: string) => {
    if (!userEmail) return;

    // 1. Fetch Profile ledger
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", userEmail)
      .maybeSingle();

    if (profile) {
      setUserProfile(profile as UserProfile);
    }

    // 2. Fetch Orders
    const { data: ords } = await supabase
      .from("orders")
      .select("*")
      .eq("email", userEmail)
      .order("created_at", { ascending: false });

    if (ords) {
      setUserOrders(ords);
    }

    // 3. Fetch Subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setUserSubscription(sub || null);
  }, []);

  const checkUserSession = useCallback(async () => {
    const localAdmin = localStorage.getItem("slidebee_admin_session");
    if (localAdmin === "true") {
      // Admin session is active: client session cannot coexist under strict mutual exclusivity
      setCurrentUser(null);
      setUserProfile(null);
      setUserOrders([]);
      setLoading(false);
      return;
    }

    // Strict GoTrue Server-Side Session Verification (Prompts 18 & 25)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const isSessionAdmin =
        session.user.email === "superadmin@theslidebee.com" ||
        session.user.email === "admin@theslidebee.com" ||
        session.user.email === "admin@slidebee.com" ||
        session.user.email?.startsWith("admin@") ||
        session.user.email?.startsWith("superadmin@") ||
        session.user.user_metadata?.role === "admin" ||
        session.user.user_metadata?.role === "super_admin";

      if (isSessionAdmin) {
        localStorage.removeItem("slidebee_client_user");
        localStorage.setItem("slidebee_admin_session", "true");
        localStorage.setItem("slidebee_admin_email", session.user.email || "superadmin@theslidebee.com");
        setCurrentUser(null);
        setUserProfile(null);
        setUserOrders([]);
      } else {
        if (session.user.email) {
          const sessionVerification = await verifyActiveSession(session.user.email);
          if (!sessionVerification.valid) {
            await triggerSessionDisplacement(sessionVerification.newDevice);
            setLoading(false);
            return;
          }
        }
        localStorage.removeItem("slidebee_admin_session");
        localStorage.removeItem("slidebee_admin_email");
        setCurrentUser(session.user);
        await fetchClientData(session.user.email || "");
      }
    } else {
      localStorage.removeItem("slidebee_client_user");
      setCurrentUser(null);
      setUserProfile(null);
      setUserOrders([]);
    }
    setLoading(false);
  }, [fetchClientData]);

  useEffect(() => {
    checkUserSession();

    const unsubscribe = subscribeToAuthSync(
      (role) => {
        if (!role || role === "client") {
          setCurrentUser(null);
          setUserProfile(null);
          setUserOrders([]);
        }
      },
      (role) => {
        if (role === "admin") {
          // Admin signed in on another tab; terminate client view in this tab
          setCurrentUser(null);
          setUserProfile(null);
          setUserOrders([]);
        } else {
          checkUserSession();
        }
      }
    );

    return () => unsubscribe();
  }, [checkUserSession]);

  // Log authentication events to auth_logs
  const recordAuthEvent = async (userEmail: string, event: "LOGIN" | "SIGNUP" | "LOGOUT" | "PASSWORD_RESET", meta: any = {}) => {
    try {
      await supabase.from("profiles").update({ last_sign_in_at: new Date().toISOString() }).eq("email", userEmail);
      await supabase.from("auth_logs").insert([
        {
          user_email: userEmail,
          event,
          metadata: {
            ...meta,
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "browser"
          }
        }
      ]);
    } catch (e) {
      console.warn("Auth event logging error:", e);
    }
  };

  // Sign In with Unregistered Intercept
  const signIn = async (emailInput: string, passwordInput: string): Promise<ClientAuthResult> => {
    const cleanEmail = emailInput.toLowerCase().trim();
    const cleanPassword = passwordInput.trim();

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    });

    if (authData?.user) {
      const isUserAdmin =
        authData.user.email === "superadmin@theslidebee.com" ||
        authData.user.email === "admin@theslidebee.com" ||
        authData.user.email?.startsWith("admin@") ||
        authData.user.email?.startsWith("superadmin@") ||
        authData.user.user_metadata?.role === "admin" ||
        authData.user.user_metadata?.role === "super_admin";
      if (isUserAdmin) {
        await registerActiveSession(cleanEmail);
        await recordAuthEvent(cleanEmail, "LOGIN", { role: "admin" });
        localStorage.removeItem("slidebee_client_user");
        localStorage.setItem("slidebee_admin_session", "true");
        localStorage.setItem("slidebee_admin_email", authData.user.email || cleanEmail);
        setCurrentUser(null);
        setUserProfile(null);
        setUserOrders([]);
        broadcastAuthEvent("LOGIN", "admin");
        window.location.hash = "#/admin";
        return { success: true };
      }

      await registerActiveSession(cleanEmail);
      await recordAuthEvent(cleanEmail, "LOGIN", { provider: "supabase_auth" });
      localStorage.removeItem("slidebee_admin_session");
      localStorage.removeItem("slidebee_admin_email");
      setCurrentUser(authData.user);
      localStorage.setItem("slidebee_client_user", JSON.stringify(authData.user));
      broadcastAuthEvent("LOGIN", "client");
      await fetchClientData(cleanEmail);
      return { success: true };
    }

    if (authErr) {
      return {
        success: false,
        message: "Invalid email or password. Please verify your credentials and try again."
      };
    }

    return { success: false, message: "Authentication failed. Please verify your credentials." };
  };

  // Sign Up with 5 Free Starter Credits Provisioning via RPC & Anti-Abuse Protection
  const signUp = async (
    emailInput: string,
    passwordInput: string,
    fullNameInput: string,
    companyInput: string
  ): Promise<ClientAuthResult> => {
    const cleanEmail = emailInput.toLowerCase().trim();
    const cleanPassword = passwordInput.trim();
    const cleanName = fullNameInput.trim();
    const cleanCompany = companyInput.trim() || "Client Enterprise";

    if (!cleanName) throw new Error("Please enter your full name.");
    if (cleanPassword.length < 8 || !/[A-Z]/.test(cleanPassword) || !/[0-9]/.test(cleanPassword)) {
      throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
    }

    // 1. Block disposable and burner temporary email domains
    if (isDisposableEmail(cleanEmail)) {
      throw new Error("Disposable or temporary email addresses are not permitted. Please use a valid personal or corporate email.");
    }

    // 2. Hardware and device fingerprinting for trial anti-abuse check
    const fingerprint = await getDeviceFingerprint();
    let trialEligible = true;

    try {
      const trialCheckRes = await fetch("/api/trial-guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHECK_AND_CLAIM",
          email: cleanEmail,
          deviceFingerprint: fingerprint
        })
      });

      if (trialCheckRes.ok) {
        const trialData = await trialCheckRes.json();
        if (trialData && trialData.eligible === false) {
          trialEligible = false;
        }
      }
    } catch (trialGuardErr) {
      console.warn("Trial guard pre-check notice:", trialGuardErr);
    }

    // 3. Check duplicate account
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    // 4. Register in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          full_name: cleanName,
          company: cleanCompany
        }
      }
    });

    if (authErr) {
      throw new Error(authErr.message || "Failed to register account.");
    }

    // 5. Enforce trial provisioning or zero credits if already claimed
    if (trialEligible) {
      try {
        await supabase.rpc("fn_grant_starter_credits", {
          p_email: cleanEmail,
          p_full_name: cleanName,
          p_company: cleanCompany
        });
      } catch (e) {
        console.warn("Starter credit RPC notice:", e);
      }
    } else {
      // Free trial already claimed on this device/canonical email: initialize with 0 credits
      try {
        await supabase.from("profiles").upsert({
          email: cleanEmail,
          full_name: cleanName,
          company: cleanCompany,
          role: "client",
          credits_total: 0,
          credits_used: 0,
          credits_balance: 0,
          updated_at: new Date().toISOString()
        }, { onConflict: "email" });
      } catch (profileErr) {
        console.warn("Profile zero-credit initialization notice:", profileErr);
      }
    }

    // 6. Register this device as the active session
    await registerActiveSession(cleanEmail);

    await recordAuthEvent(cleanEmail, "SIGNUP", {
      fullName: cleanName,
      company: cleanCompany,
      trialEligible,
      deviceFingerprint: fingerprint
    });

    // Send Welcome Onboarding Email
    sendWelcomeEmail({
      clientName: cleanName || cleanEmail.split("@")[0],
      clientEmail: cleanEmail,
      company: cleanCompany
    }).catch(err => console.warn("Welcome email notice:", err));

    const welcomeNotice = trialEligible
      ? "Welcome! Your 5 free starter design credits are active."
      : "Welcome to SlideBee! Notice: Free starter credits were previously claimed on this device. Your account has been initialized with 0 credits.";

    if (authData?.session?.user || authData?.user) {
      const clientObj = authData.session?.user || authData.user;
      localStorage.removeItem("slidebee_admin_session");
      localStorage.removeItem("slidebee_admin_email");
      localStorage.setItem("slidebee_client_user", JSON.stringify(clientObj));
      broadcastAuthEvent("LOGIN", "client");
      setCurrentUser(clientObj);
      await fetchClientData(cleanEmail);
      return { success: true, message: welcomeNotice };
    }

    return {
      success: true,
      message: trialEligible
        ? "Account created successfully with 5 free design credits. Please sign in."
        : "Account created successfully. Free starter trial was already claimed on this device. Please sign in."
    };
  };

  // Entitlement-backed Template Download Engine (3/day Free, 30/mo Pro, 45/mo Lifetime Anti-bot)
  const downloadTemplate = async (templateId: string) => {
    if (!currentUser?.email && !userProfile?.email) {
      throw new Error("Please log in to download presentation templates.");
    }

    const emailToUse = currentUser?.email || userProfile?.email;

    try {
      const res = await fetch("/api/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          userEmail: emailToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to download template.");
      }

      await fetchClientData(emailToUse);
      return data;
    } catch (err: any) {
      // Fallback to legacy RPC
      const { data, error } = await supabase.rpc("fn_redeem_template_credit", {
        p_user_email: emailToUse,
        p_template_id: templateId
      });

      if (error) {
        throw new Error(error.message || err.message || "Download failed.");
      }

      await fetchClientData(emailToUse);
      return data;
    }
  };

  const redeemCredit = downloadTemplate;

  // Secure Password Reset Request (Dispatches tokenized recovery link to inbox)
  const requestPasswordReset = async (emailInput: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = emailInput.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, message: "Please enter your registered email address." };
    }
    try {
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "https://dev.slidebee.pages.dev";
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${redirectOrigin}/#/login?action=reset`
      });
    } catch (err) {
      // Fail closed with uniform feedback to prevent enumeration
    }
    return {
      success: true,
      message: "If an account exists with this email, a secure password recovery link has been dispatched."
    };
  };

  // Secure Password Reset Completion via GoTrue Auth
  const completePasswordReset = async (newPasswordInput: string): Promise<{ success: boolean; message: string }> => {
    const cleanPass = newPasswordInput.trim();
    if (!cleanPass || cleanPass.length < 8) {
      return { success: false, message: "Password must be at least 8 characters in length." };
    }
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: cleanPass
      });
      if (error) {
        return { success: false, message: error.message || "Failed to update password. Recovery link may have expired." };
      }
      if (data?.user) {
        await recordAuthEvent(data.user.email || "unknown", "PASSWORD_RESET", { provider: "supabase_auth" });
        return { success: true, message: "Password has been successfully updated." };
      }
      return { success: true, message: "Password has been updated." };
    } catch (err: any) {
      return { success: false, message: err.message || "Password update failed. Please try again." };
    }
  };

  const logout = async () => {
    await performClientLogout();
    setCurrentUser(null);
    setUserProfile(null);
    setUserOrders([]);
    setUserSubscription(null);
  };

  const isPro = Boolean(
    (userProfile?.tier && userProfile.tier !== "free") ||
    (userSubscription &&
      userSubscription.status === "active" &&
      (!userSubscription.current_period_end || new Date(userSubscription.current_period_end) > new Date()))
  );

  const isProExpired = Boolean(
    userSubscription &&
    userSubscription.current_period_end &&
    new Date(userSubscription.current_period_end) <= new Date()
  );

  const daysRemaining = userSubscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(userSubscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const userTier: "free" | "monthly" | "yearly" | "lifetime" =
    userProfile?.tier || (isPro ? (userSubscription?.plan_name?.toLowerCase()?.includes("year") ? "yearly" : "monthly") : "free");

  const downloadsToday = userProfile?.downloads_today || 0;
  const downloadsThisMonth = userProfile?.downloads_this_month || 0;
  const remainingFreeToday = Math.max(0, 3 - downloadsToday);
  const remainingPremiumThisMonth =
    userTier === "monthly" || userTier === "yearly"
      ? Math.max(0, 30 - downloadsThisMonth)
      : userTier === "lifetime"
      ? Math.max(0, 45 - downloadsThisMonth)
      : 0;

  const templateQuotaTotal = userTier === "lifetime" ? 45 : (userTier === "free" ? 3 : 30);
  const templateQuotaUsed = userTier === "free" ? downloadsToday : downloadsThisMonth;
  const templateQuotaRemaining = userTier === "free" ? remainingFreeToday : remainingPremiumThisMonth;

  return {
    currentUser,
    userProfile,
    userOrders,
    userSubscription,
    isPro,
    isProExpired,
    userTier,
    downloadsToday,
    downloadsThisMonth,
    remainingFreeToday,
    remainingPremiumThisMonth,
    daysRemaining,
    templateQuotaTotal,
    templateQuotaUsed,
    templateQuotaRemaining,
    loading,
    creditsBalance: templateQuotaRemaining,
    creditsUsed: templateQuotaUsed,
    creditsTotal: templateQuotaTotal,
    purchasedItems: userProfile?.purchased_items ?? [],
    usageHistory: userProfile?.usage_history ?? [],
    signIn,
    signUp,
    logout,
    requestPasswordReset,
    completePasswordReset,
    downloadTemplate,
    redeemCredit,
    refreshClientData: () => (currentUser?.email ? fetchClientData(currentUser.email) : undefined)
  };
}
