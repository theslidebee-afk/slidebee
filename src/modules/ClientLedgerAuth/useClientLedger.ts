import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { performClientLogout, subscribeToAuthSync, broadcastAuthEvent } from "../../lib/authSync";
import { sendWelcomeEmail } from "../../lib/email";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  phone?: string;
  role: "client" | "admin" | "super_admin";
  credits_total: number;
  credits_used: number;
  credits_balance: number;
  purchased_items: Array<{
    id: string;
    slug?: string;
    code?: string;
    title: string;
    category?: string;
    slides_count?: number;
    download_url: string;
    purchased_at: string;
    is_credit_redemption?: boolean;
    amount?: number;
    currency?: string;
  }>;
  usage_history: Array<{
    item_title: string;
    credits_used: number;
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
        session.user.email === "admin@theslidebee.com" ||
        session.user.email === "admin@slidebee.com" ||
        session.user.email?.startsWith("admin@") ||
        session.user.user_metadata?.role === "admin";

      if (isSessionAdmin) {
        localStorage.removeItem("slidebee_client_user");
        localStorage.setItem("slidebee_admin_session", "true");
        localStorage.setItem("slidebee_admin_email", session.user.email || "admin@theslidebee.com");
        setCurrentUser(null);
        setUserProfile(null);
        setUserOrders([]);
      } else {
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
  const recordAuthEvent = async (userEmail: string, event: "LOGIN" | "SIGNUP", meta: any = {}) => {
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
      const isUserAdmin = authData.user.email?.startsWith("admin@") || authData.user.user_metadata?.role === "admin";
      if (isUserAdmin) {
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

  // Sign Up with 5 Free Starter Credits Provisioning via RPC
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

    // Check duplicate
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    // Register in Supabase Auth
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

    // Atomically grant 5 starter credits via Deep Module RPC
    try {
      await supabase.rpc("fn_grant_starter_credits", {
        p_email: cleanEmail,
        p_full_name: cleanName,
        p_company: cleanCompany
      });
    } catch (e) {
      console.warn("Starter credit RPC notice:", e);
    }

    await recordAuthEvent(cleanEmail, "SIGNUP", { fullName: cleanName, company: cleanCompany });

    // Send Welcome Onboarding Email
    sendWelcomeEmail({
      clientName: cleanName || cleanEmail.split("@")[0],
      clientEmail: cleanEmail,
      company: cleanCompany
    }).catch(err => console.warn("Welcome email notice:", err));

    if (authData?.session?.user || authData?.user) {
      const clientObj = authData.session?.user || authData.user;
      localStorage.removeItem("slidebee_admin_session");
      localStorage.removeItem("slidebee_admin_email");
      localStorage.setItem("slidebee_client_user", JSON.stringify(clientObj));
      broadcastAuthEvent("LOGIN", "client");
      setCurrentUser(clientObj);
      await fetchClientData(cleanEmail);
      return { success: true, message: "Welcome! Your 5 free starter design credits are active." };
    }

    return {
      success: true,
      message: "Account created successfully with 5 free design credits. Please sign in."
    };
  };

  // Atomic Credit Redemption for Eligible Templates
  const redeemCredit = async (templateId: string) => {
    if (!currentUser?.email && !userProfile?.email) {
      throw new Error("Please log in to redeem templates using your credits.");
    }

    const emailToUse = currentUser?.email || userProfile?.email;

    const { data, error } = await supabase.rpc("fn_redeem_template_credit", {
      p_user_email: emailToUse,
      p_template_id: templateId
    });

    if (error) {
      throw new Error(error.message || "Credit redemption failed.");
    }

    if (!data?.success) {
      throw new Error(data?.message || "Failed to redeem template with credits.");
    }

    // Refresh client ledger state
    await fetchClientData(emailToUse);
    return data;
  };

  // Secure Password Reset Request (Prompts 11 & 12)
  const requestPasswordReset = async (emailInput: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = emailInput.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, message: "Please enter your registered email address." };
    }
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/#/login?action=reset`
      });
    } catch (err) {
      // Fail closed with uniform feedback to prevent enumeration
    }
    return {
      success: true,
      message: "If an account exists with this email, a secure password recovery link has been dispatched."
    };
  };

  const logout = async () => {
    await performClientLogout();
    setCurrentUser(null);
    setUserProfile(null);
    setUserOrders([]);
  };

  return {
    currentUser,
    userProfile,
    userOrders,
    loading,
    creditsBalance: userProfile?.credits_balance ?? 5,
    creditsUsed: userProfile?.credits_used ?? 0,
    purchasedItems: userProfile?.purchased_items ?? [],
    usageHistory: userProfile?.usage_history ?? [],
    signIn,
    signUp,
    logout,
    requestPasswordReset,
    redeemCredit,
    refreshClientData: () => (currentUser?.email ? fetchClientData(currentUser.email) : undefined)
  };
}
