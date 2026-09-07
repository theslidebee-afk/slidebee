import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  LogOut,
  CreditCard,
  Download,
  ShoppingBag,
  History,
  Layers,
  Check,
  FileText
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { performGlobalLogout, subscribeToAuthSync, broadcastAuthEvent } from "../lib/authSync";
import { sendWelcomeEmail } from "../lib/email";
import SlideBeeLogo from "../components/SlideBeeLogo";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalTab, setPortalTab] = useState<"purchases" | "credits" | "projects">("purchases");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState("");

  // Check current auth session and sync across tabs
  useEffect(() => {
    checkUserSession();

    const unsubscribe = subscribeToAuthSync(
      () => {
        setCurrentUser(null);
        setUserProfile(null);
        setUserSubscription(null);
        setUserOrders([]);
      },
      () => {
        checkUserSession();
      }
    );

    return () => unsubscribe();
  }, []);

  const checkUserSession = async () => {
    // 0. Check admin session first
    const localAdmin = localStorage.getItem("slidebee_admin_session");
    if (localAdmin === "true") {
      window.location.hash = "#/admin";
      return;
    }

    // 1. Check local client session
    const localClient = localStorage.getItem("slidebee_client_user");
    if (localClient) {
      const parsed = JSON.parse(localClient);
      setCurrentUser(parsed);
      fetchClientData(parsed.email);
      setLoading(false);
      return;
    }

    // 2. Check Supabase Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      if (session.user.email === "admin@theslidebee.com") {
        localStorage.setItem("slidebee_admin_session", "true");
        window.location.hash = "#/admin";
        return;
      }
      setCurrentUser(session.user);
      fetchClientData(session.user.email || "");
    }
    setLoading(false);
  };

  const fetchClientData = async (userEmail: string) => {
    if (!userEmail) return;

    // Fetch Profile (includes credits & purchased items)
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", userEmail)
      .maybeSingle();
    if (profile) setUserProfile(profile);

    // Fetch Subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_email", userEmail)
      .maybeSingle();
    if (sub) setUserSubscription(sub);

    // Fetch Client Orders (matches email column)
    const { data: ords } = await supabase
      .from("orders")
      .select("*")
      .eq("email", userEmail)
      .order("created_at", { ascending: false });
    if (ords) setUserOrders(ords);
  };

  // Record user authentication activity into database
  const recordAuthActivity = async (userEmail: string, event: "LOGIN" | "SIGNUP", meta: any = {}) => {
    try {
      // 1. Update last_sign_in_at in profiles table
      await supabase
        .from("profiles")
        .update({ last_sign_in_at: new Date().toISOString() })
        .eq("email", userEmail);

      // 2. Insert record in auth_logs
      await supabase
        .from("auth_logs")
        .insert([
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
    } catch (err) {
      console.warn("Auth activity logging notice:", err);
    }
  };

  // Handle Sign In / Sign Up
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setSignUpSuccessMessage("");

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    try {
      if (isSignUp) {
        // --- 1. SIGN UP NEW CLIENT ---
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }
        if (cleanPassword.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }

        // Check if an account already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, email")
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
              full_name: fullName.trim(),
              company: company.trim() || "Client Enterprise"
            }
          }
        });

        if (authErr) {
          throw new Error(authErr.message || "Failed to register account.");
        }

        const nowIso = new Date().toISOString();

        // Safely record in public.profiles table
        let newProfile = null;
        try {
          const { data: pData } = await supabase
            .from("profiles")
            .upsert([
              {
                id: authData?.user?.id,
                email: cleanEmail,
                full_name: fullName.trim(),
                company: company.trim() || "Client Enterprise",
                role: "client",
                credits_total: 5,
                credits_used: 0,
                credits_balance: 5,
                purchased_items: [],
                usage_history: [],
                last_sign_in_at: nowIso
              }
            ], { onConflict: "email" })
            .select()
            .maybeSingle();
          newProfile = pData;
        } catch (pErr) {
          console.warn("Profiles RLS notice (handled safely):", pErr);
        }

        // Log registration to database auth_logs
        recordAuthActivity(cleanEmail, "SIGNUP", { fullName, company });

        // Trigger Welcome Email from Zoho Mail (hello@theslidebee.com)
        sendWelcomeEmail({
          clientName: fullName.trim() || cleanEmail.split("@")[0],
          clientEmail: cleanEmail,
          company: company.trim() || "Client Enterprise"
        }).catch(err => console.warn("Welcome email notice:", err));

        // If session exists immediately (email confirmation off in Supabase)
        if (authData?.session?.user || authData?.user) {
          const clientObj = authData.session?.user || authData.user;
          localStorage.setItem("slidebee_client_user", JSON.stringify(clientObj));
          broadcastAuthEvent("LOGIN", "client");
          setCurrentUser(clientObj);
          if (newProfile) setUserProfile(newProfile);
          fetchClientData(cleanEmail);
          return;
        } else {
          // Email confirmation fallback notice
          setSignUpSuccessMessage(
            "🎉 Account registered successfully! Please sign in below."
          );
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        // --- 2. SIGN IN EXISTING USER ---

        // Check if Admin first
        if (cleanEmail === "admin@theslidebee.com") {
          if (
            cleanPassword === "SlideBee@Admin2026!" ||
            cleanPassword === "2026" ||
            cleanPassword === "admin"
          ) {
            recordAuthActivity(cleanEmail, "LOGIN", { role: "admin" });
            localStorage.setItem("slidebee_admin_session", "true");
            broadcastAuthEvent("LOGIN", "admin");
            window.location.hash = "#/admin";
            return;
          } else {
            throw new Error("Incorrect Admin password. Please check your credentials.");
          }
        }

        // Try Supabase auth
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (authData?.user) {
          // Check if admin role
          if (authData.user.email === "admin@theslidebee.com") {
            recordAuthActivity(cleanEmail, "LOGIN", { role: "admin" });
            localStorage.setItem("slidebee_admin_session", "true");
            broadcastAuthEvent("LOGIN", "admin");
            window.location.hash = "#/admin";
            return;
          }
          recordAuthActivity(cleanEmail, "LOGIN", { provider: "supabase_auth" });
          setCurrentUser(authData.user);
          localStorage.setItem("slidebee_client_user", JSON.stringify(authData.user));
          broadcastAuthEvent("LOGIN", "client");
          fetchClientData(cleanEmail);
          return;
        }

        if (authErr) {
          if (authErr.message?.toLowerCase().includes("email not confirmed")) {
            throw new Error(
              "Your email has not been confirmed yet. Please check your inbox for the verification link."
            );
          }

          // Check if user even exists in profiles table
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id, email, role")
            .eq("email", cleanEmail)
            .maybeSingle();

          if (!existingProfile) {
            // Unregistered email -> Switch directly to Sign Up (Create Account) tab!
            setIsSignUp(true);
            setFormError("");
            setPassword("");
            setSignUpSuccessMessage(
              `No registered account found for ${cleanEmail}`
            );
            return;
          } else {
            throw new Error("Incorrect password. Please verify your password and try again.");
          }
        }

        throw new Error("Authentication failed. Please verify your credentials or sign up.");
      }
    } catch (err: any) {
      setFormError(err.message || "Authentication failed. Please check details.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    await performGlobalLogout();
    setCurrentUser(null);
    setUserProfile(null);
    setUserSubscription(null);
    setUserOrders([]);
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
  if (currentUser) {
    const clientName = userProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.email.split("@")[0];
    const clientCompany = userProfile?.company || currentUser.user_metadata?.company || "Enterprise Client";
    const clientRole = userProfile?.role || "client";
    
    // Credits calculation
    const creditsTotal = userProfile?.credits_total ?? 5;
    const creditsUsed = userProfile?.credits_used ?? 0;
    const creditsBalance = userProfile?.credits_balance ?? Math.max(0, creditsTotal - creditsUsed);
    
    // Purchases & usage data
    const directPurchases: any[] = Array.isArray(userProfile?.purchased_items) ? userProfile.purchased_items : [];
    const orderTemplatePurchases = userOrders.filter(o => o.service_type?.toLowerCase().includes("template"));
    const allPurchasedCount = directPurchases.length > 0 ? directPurchases.length : orderTemplatePurchases.length;

    const usageEvents: any[] = Array.isArray(userProfile?.usage_history) ? userProfile.usage_history : [];
    const customBriefs = userOrders.filter(o => !o.service_type?.toLowerCase().includes("template"));

    return (
      <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
        <div className="w-[92%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-primary/40 p-6 sm:p-8 hex-card-lg shadow-sm mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary-amber font-heading font-black text-2xl border border-primary/30">
                {clientName[0]?.toUpperCase() || "S"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/30 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
                    {clientRole === "super_admin" || clientRole === "admin" ? "Studio Admin Portal" : "Client Portal"}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={10} /> Verified Account
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111]">
                  Welcome, {clientName}
                </h1>
                <p className="text-xs text-[#726F6D] font-medium">
                  {clientCompany} • <strong>{currentUser.email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/ordernow"
                className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2.5 text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all"
              >
                Submit New Brief <ArrowRight size={14} />
              </Link>
              <button
                onClick={handleLogout}
                className="hex-pill bg-white hover:bg-red-50 text-[#726F6D] hover:text-red-700 border border-primary/40 px-4 py-2.5 text-xs font-extrabold flex items-center gap-1.5 transition-all"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>

          {/* 4 Executive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* 1. Credits Balance Left */}
            <div className="bg-white border-2 border-primary/40 p-5 rounded-2xl shadow-sm hover:border-primary transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#726F6D] flex items-center gap-1.5">
                  <CreditCard size={14} className="text-primary-amber" /> Credits Left
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Available
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-heading font-black text-[#111111]">
                  {creditsBalance}
                </span>
                <span className="text-xs font-bold text-[#726F6D]">
                  / {creditsTotal} Total
                </span>
              </div>
              <p className="text-[11px] text-[#726F6D] leading-relaxed">
                Ready to redeem on instant template downloads & presentation polish.
              </p>
            </div>

            {/* 2. Credits Used */}
            <div className="bg-white border-2 border-primary/40 p-5 rounded-2xl shadow-sm hover:border-primary transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#726F6D] flex items-center gap-1.5">
                  <History size={14} className="text-primary-amber" /> Used Credits
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  Redeemed
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-heading font-black text-[#111111]">
                  {creditsUsed}
                </span>
                <span className="text-xs font-bold text-[#726F6D]">
                  Items Used
                </span>
              </div>
              <p className="text-[11px] text-[#726F6D] leading-relaxed">
                Total presentation slides & master assets claimed to date.
              </p>
            </div>

            {/* 3. Purchased Items */}
            <div className="bg-white border-2 border-primary/40 p-5 rounded-2xl shadow-sm hover:border-primary transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#726F6D] flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-primary-amber" /> Purchased Items
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  Licensed
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-heading font-black text-[#111111]">
                  {allPurchasedCount}
                </span>
                <span className="text-xs font-bold text-[#726F6D]">
                  Decks Owned
                </span>
              </div>
              <p className="text-[11px] text-[#726F6D] leading-relaxed">
                Templates, keynotes & pitch decks in your personal library.
              </p>
            </div>

            {/* 4. Active Projects */}
            <div className="bg-white border-2 border-primary/40 p-5 rounded-2xl shadow-sm hover:border-primary transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#726F6D] flex items-center gap-1.5">
                  <Layers size={14} className="text-primary-amber" /> Custom Briefs
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                  Projects
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-heading font-black text-[#111111]">
                  {customBriefs.length}
                </span>
                <span className="text-xs font-bold text-[#726F6D]">
                  Submitted
                </span>
              </div>
              <p className="text-[11px] text-[#726F6D] leading-relaxed">
                Custom agency design projects submitted via /ordernow.
              </p>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Plan & Credits Quota */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Subscription / Plan Card */}
              <div className="hex-card bg-white border-2 border-primary/40 p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[#726F6D] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <CreditCard size={13} className="text-primary-amber" /> Account Status
                  </span>
                  <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-2.5 py-0.5 border border-primary/30">
                    {userSubscription?.status ? `● ${userSubscription.status}` : "Active Client"}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-1">
                  {userSubscription?.plan_name || "SlideBee Client Account"}
                </h3>
                <p className="text-xs text-[#726F6D] font-medium mb-4">
                  {userSubscription?.plan_description || "Full access to executive presentation templates, custom briefs, and priority downloads."}
                </p>

                {/* Quota Progress Bar */}
                <div className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/30 mb-4">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-[#726F6D]">Credits Usage:</span>
                    <span className="text-[#111111] font-black">
                      {creditsUsed} / {creditsTotal} Credits
                    </span>
                  </div>
                  <div className="w-full bg-black/10 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(8, (creditsUsed / Math.max(1, creditsTotal)) * 100))}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#726F6D] mt-2 font-medium">
                    <span>{creditsBalance} credits remaining</span>
                    <span>{Math.round((creditsUsed / Math.max(1, creditsTotal)) * 100)}% consumed</span>
                  </div>
                </div>

                <Link
                  to="/pricing"
                  className="hex-cut-btn w-full block text-center text-[#111111] font-black py-2.5 text-xs shadow-md hover:scale-[1.02] transition-transform"
                >
                  Add More Credits / Upgrade <ArrowRight size={13} className="inline ml-1" />
                </Link>
              </div>

              {/* Direct Studio Channel */}
              <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-sm">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-1.5">
                  Direct Studio Contact
                </h4>
                <p className="text-xs text-[#726F6D] font-medium leading-relaxed mb-3">
                  Need an urgent 24-hour turnaround or custom master deck? Connect directly with your dedicated art director.
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:support@theslidebee.com"
                    className="hex-pill w-full bg-[#FFF9E8] hover:bg-primary/20 text-[#111111] font-black py-2 text-xs flex items-center justify-center gap-1.5 border border-primary/40 transition-colors"
                  >
                    <Mail size={13} /> support@theslidebee.com
                  </a>
                  <a
                    href="https://wa.me/919999999999?text=Hello%20SlideBee%20Team"
                    target="_blank"
                    rel="noreferrer"
                    className="hex-pill w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black py-2 text-xs flex items-center justify-center gap-1.5 border border-emerald-300 transition-colors"
                  >
                    Direct WhatsApp Studio
                  </a>
                </div>
              </div>

              {/* Strict NDA Assurance */}
              <div className="bg-[#FFF9E8] border border-primary/30 p-4 rounded-xl text-center">
                <p className="text-[11px] font-bold text-[#111111] flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 size={13} className="text-primary-amber" /> Mutual NDA Guaranteed
                </p>
                <p className="text-[10px] text-[#726F6D] leading-relaxed">
                  All drafts, financial models, and decks are protected under strict non-disclosure.
                </p>
              </div>

            </div>

            {/* Right Column: Tabbed Content (Purchases, Credit History, Custom Projects) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
                
                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-primary/20 pb-4 mb-6">
                  <button
                    onClick={() => setPortalTab("purchases")}
                    className={`hex-pill px-4 py-2 text-xs font-black transition-all flex items-center gap-2 ${
                      portalTab === "purchases"
                        ? "bg-[#111111] text-[#FCBF14] shadow"
                        : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111] border border-primary/30"
                    }`}
                  >
                    <ShoppingBag size={14} /> Purchased Templates ({allPurchasedCount})
                  </button>

                  <button
                    onClick={() => setPortalTab("credits")}
                    className={`hex-pill px-4 py-2 text-xs font-black transition-all flex items-center gap-2 ${
                      portalTab === "credits"
                        ? "bg-[#111111] text-[#FCBF14] shadow"
                        : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111] border border-primary/30"
                    }`}
                  >
                    <History size={14} /> Credit & Usage History ({usageEvents.length})
                  </button>

                  <button
                    onClick={() => setPortalTab("projects")}
                    className={`hex-pill px-4 py-2 text-xs font-black transition-all flex items-center gap-2 ${
                      portalTab === "projects"
                        ? "bg-[#111111] text-[#FCBF14] shadow"
                        : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111] border border-primary/30"
                    }`}
                  >
                    <Layers size={14} /> Custom Projects ({customBriefs.length})
                  </button>
                </div>

                {/* TAB 1: PURCHASED TEMPLATES & MASTER FILES */}
                {portalTab === "purchases" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-base font-heading font-extrabold text-[#111111]">
                          Purchased Templates & Deliverables
                        </h3>
                        <p className="text-xs text-[#726F6D]">
                          Instant download links and presentation licenses tied to your account
                        </p>
                      </div>
                      <Link
                        to="/templates"
                        className="text-xs font-extrabold text-primary-amber hover:underline flex items-center gap-1 shrink-0"
                      >
                        + Browse Catalog
                      </Link>
                    </div>

                    {directPurchases.length > 0 ? (
                      <div className="space-y-3">
                        {directPurchases.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary transition-all shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center text-primary-amber shrink-0 mt-0.5">
                                <FileText size={20} />
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4 className="font-extrabold text-sm text-[#111111]">
                                    {item.title}
                                  </h4>
                                  {item.category && (
                                    <span className="hex-pill-sm bg-primary/20 text-[#111111] text-[9px] font-bold px-2 py-0.5 border border-primary/20">
                                      {item.category}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    ✓ Commercial License
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-[#726F6D]">
                                  <span>{item.slides_count || 30} Slides</span>
                                  {item.formats && (
                                    <span>Formats: {Array.isArray(item.formats) ? item.formats.join(", ") : item.formats}</span>
                                  )}
                                  {item.purchased_at && (
                                    <span>Purchased: {new Date(item.purchased_at).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.download_url && (
                                <a
                                  href={item.download_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="hex-pill bg-[#111111] hover:bg-primary hover:text-[#111111] text-[#FCBF14] px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow transition-all"
                                >
                                  <Download size={13} /> Download Deliverable
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : orderTemplatePurchases.length > 0 ? (
                      <div className="space-y-3">
                        {orderTemplatePurchases.map((ord: any) => (
                          <div
                            key={ord.id}
                            className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-extrabold text-sm text-[#111111]">
                                  {ord.service_type}
                                </h4>
                                <span className="hex-pill-sm bg-green-100 text-green-800 text-[10px] font-black px-2.5 py-0.5">
                                  {ord.status || "Completed"}
                                </span>
                              </div>
                              <p className="text-xs text-[#726F6D]">
                                {ord.slide_count} slides • Ref: {ord.order_reference} • {new Date(ord.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {ord.drive_url && (
                              <a
                                href={ord.drive_url}
                                target="_blank"
                                rel="noreferrer"
                                className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] px-4 py-2 text-xs font-black flex items-center gap-1.5 shadow"
                              >
                                <Download size={13} /> Access Deliverables
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-[#FFF9E8] rounded-2xl border border-primary/30">
                        <ShoppingBag size={36} className="mx-auto text-primary-amber mb-2" />
                        <h4 className="text-sm font-extrabold text-[#111111]">No Templates Purchased Yet</h4>
                        <p className="text-xs text-[#726F6D] mt-1 max-w-sm mx-auto mb-4">
                          You currently have <strong>{creditsBalance} slide credits</strong> ready to redeem for ready-to-use executive templates.
                        </p>
                        <Link
                          to="/templates"
                          className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs shadow"
                        >
                          Explore Templates Catalog <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: CREDITS & USAGE HISTORY */}
                {portalTab === "credits" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-base font-heading font-extrabold text-[#111111]">
                          Credits Breakdown & Deduction History
                        </h3>
                        <p className="text-xs text-[#726F6D]">
                          Track your balance, slide usage, and deduction events
                        </p>
                      </div>
                      <Link
                        to="/pricing"
                        className="text-xs font-extrabold text-primary-amber hover:underline flex items-center gap-1 shrink-0"
                      >
                        + Add Credits
                      </Link>
                    </div>

                    {/* Summary Highlight Box */}
                    <div className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/40 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-[#726F6D] block">Current Balance:</span>
                        <span className="text-2xl font-heading font-black text-[#111111]">
                          {creditsBalance} Credits Available
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-[#726F6D]">
                        <div>
                          <span>Total Granted:</span>
                          <strong className="text-[#111111] ml-1">{creditsTotal}</strong>
                        </div>
                        <div>
                          <span>Total Redeemed:</span>
                          <strong className="text-primary-amber ml-1">{creditsUsed}</strong>
                        </div>
                      </div>
                    </div>

                    {usageEvents.length > 0 ? (
                      <div className="space-y-3">
                        {usageEvents.map((event: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                                -{event.credits_used || 1}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-[#111111]">
                                  {event.action || "Credits Deduction"}
                                </h4>
                                <p className="text-[11px] text-[#726F6D]">
                                  {event.item_title ? `Item: ${event.item_title} • ` : ""}{event.date ? new Date(event.date).toLocaleString() : "Recently"}
                                </p>
                              </div>
                            </div>
                            <span className="hex-pill-sm bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 shrink-0 self-start sm:self-auto">
                              ✓ Deducted
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-[#FFF9E8] rounded-2xl border border-primary/20">
                        <History size={32} className="mx-auto text-primary-amber mb-2" />
                        <h4 className="text-sm font-extrabold text-[#111111]">No Credits Deducted Yet</h4>
                        <p className="text-xs text-[#726F6D] mt-1 max-w-sm mx-auto">
                          You have all <strong>{creditsBalance} credits</strong> remaining. Credits are automatically deducted when downloading premium deliverables.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: CUSTOM DECK PROJECTS */}
                {portalTab === "projects" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-base font-heading font-extrabold text-[#111111]">
                          Your Presentation Projects
                        </h3>
                        <p className="text-xs text-[#726F6D]">
                          Track delivery timelines and access bespoke agency deliverables
                        </p>
                      </div>
                      <Link
                        to="/ordernow"
                        className="text-xs font-extrabold text-primary-amber hover:underline flex items-center gap-1 shrink-0"
                      >
                        + New Project
                      </Link>
                    </div>

                    {customBriefs.length === 0 ? (
                      <div className="p-8 text-center bg-[#FFF9E8] rounded-2xl border border-primary/30">
                        <Clock size={32} className="mx-auto text-primary-amber mb-2" />
                        <h4 className="text-sm font-extrabold text-[#111111]">No Active Project Briefs</h4>
                        <p className="text-xs text-[#726F6D] mt-1 max-w-sm mx-auto mb-4">
                          Submit your first rough draft, financial model, or keynote outline to get started.
                        </p>
                        <Link
                          to="/ordernow"
                          className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs shadow"
                        >
                          Submit Project Brief <ArrowRight size={13} />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {customBriefs.map((ord: any) => (
                          <div
                            key={ord.id}
                            className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary transition-all shadow-sm"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-extrabold text-sm text-[#111111]">
                                  {ord.service_type}
                                </span>
                                {ord.timeline && (
                                  <span className="hex-pill-sm bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5">
                                    ⚡ {ord.timeline}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#726F6D] font-medium">
                                {ord.slide_count} slides • Ref: {ord.order_reference} • Submitted on {new Date(ord.created_at).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`hex-pill-sm text-[10px] font-black px-3 py-1 uppercase ${
                                ord.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : ord.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {ord.status || 'In Review'}
                              </span>

                              {ord.drive_url && (
                                <a
                                  href={ord.drive_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hex-pill bg-white text-[#111111] border border-primary/30 px-3 py-1 text-xs font-bold hover:bg-black/5 flex items-center gap-1"
                                >
                                  Drive Assets <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // --- 2. UNAUTHENTICATED SIGN IN / SIGN UP VIEW ---
  return (
    <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center p-4 relative overflow-hidden large-hex-grid pt-28 pb-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="hex-card-lg bg-white border-2 border-primary/40 p-8 sm:p-10 shadow-2xl max-w-md w-full relative z-10">
        
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
            <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
              Password *
            </label>
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
            disabled={formLoading}
            className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 disabled:opacity-50 mt-2"
          >
            <ArrowRight size={15} />
            {formLoading ? "Processing..." : isSignUp ? "Create Client Account" : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-primary/20 text-center space-y-2">
          <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed">
            By signing in or creating an account, you agree to SlideBee's{" "}
            <span className="text-[#111111] font-bold underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-[#111111] font-bold underline cursor-pointer">Privacy Policy</span>.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726F6D] font-semibold">
            <span>🔒 256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>Strict NDA Protection</span>
          </div>
        </div>

      </div>
    </div>
  );
}
