import { useState, useEffect, useCallback } from "react";
import { d1 } from "../../lib/d1";
import { performClientLogout, subscribeToAuthSync, broadcastAuthEvent } from "../../lib/authSync";
import { registerActiveSession, verifyActiveSession, triggerSessionDisplacement } from "../../lib/sessionGuard";
import type { UserProfile, ClientAuthResult } from "./types";
import { fetchClientProfileAndOrders, recordAuthEvent } from "./clientLedgerStorage";
import {
  performSignUp,
  performCompletePasswordReset,
  performTemplateDownload,
} from "./clientAuthActions";

export type { UserProfile, ClientAuthResult } from "./types";

export function useClientLedger() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientData = useCallback(async (userEmail: string) => {
    if (!userEmail) return;
    const cleanEmail = userEmail.trim();
    const result = await fetchClientProfileAndOrders(cleanEmail);
    if (result.profile) {
      setUserProfile(result.profile);
    }
    setUserOrders(result.orders);
    setUserSubscription(result.subscription);
  }, []);

  const checkUserSession = useCallback(async () => {
    const localAdmin = localStorage.getItem("slidebee_admin_session");
    if (localAdmin === "true") {
      setCurrentUser(null);
      setUserProfile(null);
      setUserOrders([]);
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await d1.auth.getSession();
    if (session?.user) {
      const isSessionAdmin =
        session.user.email === "admin@theslidebee.com" ||
        session.user.user_metadata?.role === "admin" ||
        session.user.user_metadata?.role === "super_admin";

      if (isSessionAdmin) {
        localStorage.removeItem("slidebee_client_user");
        localStorage.setItem("slidebee_admin_session", "true");
        localStorage.setItem("slidebee_admin_email", session.user.email || "admin@theslidebee.com");
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

  const signIn = async (emailInput: string, passwordInput: string): Promise<ClientAuthResult> => {
    const cleanEmail = emailInput.toLowerCase().trim();
    const cleanPassword = passwordInput.trim();

    const { data: authData, error: authErr } = await d1.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (authData?.user) {
      const isUserAdmin =
        authData.user.email === "admin@theslidebee.com" ||
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
        window.location.href = "/admin";
        return { success: true, isAdmin: true };
      }

      await registerActiveSession(cleanEmail);
      await recordAuthEvent(cleanEmail, "LOGIN", { provider: "d1_auth" });
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
        message: authErr.message || "Invalid email or password. Please verify your credentials and try again.",
        isUnregistered: Boolean(
          (authErr as any)?.isUnregistered || authErr.message?.includes("No registered account found")
        ),
      };
    }

    return { success: false, message: "Authentication failed. Please verify your credentials." };
  };

  const signInWithGoogle = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://theslidebee.com";
    const redirectTo = `${origin}/auth/callback`;
    const { data, error } = await d1.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      throw error;
    }
    return data;
  };

  const signUp = async (
    emailInput: string,
    passwordInput: string,
    fullNameInput: string,
    companyInput: string
  ): Promise<ClientAuthResult> => {
    const { authData, cleanEmail, trialEligible } = await performSignUp(
      emailInput,
      passwordInput,
      fullNameInput,
      companyInput
    );

    const welcomeNotice =
      "Welcome to SlideBee! Your Free Tier account is active with 3 daily community presentation downloads.";

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
        : "Account created successfully. Free starter trial was already claimed on this device. Please sign in.",
    };
  };

  const downloadTemplate = async (templateId: string) => {
    if (!currentUser?.email && !userProfile?.email) {
      throw new Error("Please log in to download presentation templates.");
    }
    const emailToUse = currentUser?.email || userProfile?.email;
    const data = await performTemplateDownload(emailToUse, templateId);
    await fetchClientData(emailToUse);
    return data;
  };

  const redeemCredit = downloadTemplate;

  const requestPasswordReset = async (emailInput: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = emailInput.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, message: "Please enter your registered email address." };
    }
    try {
      const redirectOrigin =
        typeof window !== "undefined" ? window.location.origin : "https://dev.slidebee.pages.dev";
      await d1.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${redirectOrigin}/login?action=reset`,
      });
    } catch (err) {
      // Fail closed
    }
    return {
      success: true,
      message: "If an account exists with this email, a secure password recovery link has been dispatched.",
    };
  };

  const completePasswordReset = async (
    newPasswordInput: string,
    token?: string,
    email?: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await performCompletePasswordReset(newPasswordInput, token, email);
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res;
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
    ? Math.max(
        0,
        Math.ceil((new Date(userSubscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;

  const userTier: "free" | "monthly" | "yearly" | "lifetime" =
    userProfile?.tier ||
    (isPro
      ? userSubscription?.plan_name?.toLowerCase()?.includes("year")
        ? "yearly"
        : "monthly"
      : "free");

  const downloadsToday = userProfile?.downloads_today || 0;
  const downloadsThisMonth = userProfile?.downloads_this_month || 0;
  const remainingFreeToday = Math.max(0, 3 - downloadsToday);
  const remainingPremiumThisMonth =
    userTier === "monthly" || userTier === "yearly"
      ? Math.max(0, 30 - downloadsThisMonth)
      : userTier === "lifetime"
      ? Math.max(0, 45 - downloadsThisMonth)
      : 0;

  const templateQuotaTotal = userTier === "lifetime" ? 45 : userTier === "free" ? 3 : 30;
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
    signInWithGoogle,
    signUp,
    logout,
    requestPasswordReset,
    completePasswordReset,
    downloadTemplate,
    redeemCredit,
    refreshClientData: () => (currentUser?.email ? fetchClientData(currentUser.email) : undefined),
  };
}
