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
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  X
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useClientLedger } from "../modules/ClientLedgerAuth";
import SlideBeeLogo from "../components/SlideBeeLogo";
import { ORDER_MILESTONES, getMilestoneIndex } from "./Admin";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
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

  // Deep Module: ClientLedgerAuth
  const {
    currentUser,
    userProfile,
    userOrders,
    loading,
    creditsBalance,
    creditsUsed,
    purchasedItems,
    usageHistory,
    signIn,
    signUp,
    logout,
    requestPasswordReset
  } = useClientLedger();

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
    description: "Access your purchased PowerPoint decks, track custom presentation milestones, manage slide download credits, or sign in as administrator.",
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

  const handleLogout = async () => {
    await logout();
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
    
    // Purchases & usage data
    const directPurchases: any[] = Array.isArray(purchasedItems) ? purchasedItems : [];
    const orderTemplatePurchases = userOrders.filter(o => o.service_type?.toLowerCase().includes("template"));
    const allPurchasedCount = directPurchases.length > 0 ? directPurchases.length : orderTemplatePurchases.length;

    const usageEvents: any[] = Array.isArray(usageHistory) ? usageHistory : [];
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
                  <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-2.5 py-0.5 border border-primary/30 flex items-center gap-1">
                    {userSubscription?.status ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {userSubscription.status}
                      </>
                    ) : (
                      "Active Client"
                    )}
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

                {/* Template Marketplace Upgrade CTA */}
                {userSubscription?.plan_name?.toLowerCase().includes("pro") ? (
                  <div className="hex-pill w-full text-center text-[#111111] font-black py-2.5 text-xs bg-primary/20 border border-primary/40 flex items-center justify-center gap-1.5">
                    <Check size={13} className="text-primary-amber" /> Pro Plan Active — 80 Downloads / Month
                  </div>
                ) : (
                  <Link
                    to="/pricing#marketplace"
                    className="hex-cut-btn w-full block text-center text-[#111111] font-black py-2.5 text-xs shadow-md hover:scale-[1.02] transition-transform"
                  >
                    <Sparkles size={13} className="inline mr-1.5 text-primary-amber" />
                    Go Pro — Unlock 80 Downloads / Month <ArrowRight size={13} className="inline ml-1" />
                  </Link>
                )}
              </div>

              {/* Custom Design Services CTA */}
              <div className="hex-card bg-[#111111] border-2 border-primary p-5 shadow-md">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} /> Custom Design Service
                </h4>
                <p className="text-xs text-gray-300 font-medium leading-relaxed mb-4">
                  Need a bespoke pitch deck, board presentation, or executive keynote designed from scratch? Our senior art directors deliver in 24h–48h.
                </p>
                <div className="space-y-2">
                  <Link
                    to="/ordernow"
                    className="hex-pill w-full block text-center bg-primary hover:bg-primary-dark text-[#111111] font-black py-2.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                  >
                    Get a Quote <ArrowRight size={13} />
                  </Link>
                  <Link
                    to="/pricing#services"
                    className="hex-pill w-full block text-center bg-white/10 hover:bg-white/20 text-white font-bold py-2 text-xs transition-all flex items-center justify-center gap-1.5 border border-white/20"
                  >
                    View Service Pricing
                  </Link>
                </div>
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
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <Check size={10} /> Commercial License
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
                            <span className="hex-pill-sm bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 shrink-0 self-start sm:self-auto inline-flex items-center gap-1">
                              <Check size={9} /> Deducted
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
                      <div className="space-y-5">
                        {customBriefs.map((ord: any) => {
                          const currentIdx = getMilestoneIndex(ord.status);
                          const activeMilestone = ORDER_MILESTONES[currentIdx] || ORDER_MILESTONES[0];
                          const isCompleted = currentIdx === 3;

                          return (
                            <div
                              key={ord.id}
                              className="bg-[#FFF9E8] p-5 sm:p-6 rounded-2xl border-2 border-primary/40 hover:border-primary transition-all shadow-sm space-y-4"
                            >
                              {/* Project Header Bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-primary/20">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="hex-pill-sm bg-[#111111] text-primary text-[10px] font-black px-2.5 py-0.5 shadow-sm">
                                      Ref: {ord.order_reference || ord.id?.slice(0, 8)}
                                    </span>
                                    <h4 className="font-heading font-extrabold text-base text-[#111111]">
                                      {ord.service_type || "Presentation Project"}
                                    </h4>
                                    {ord.timeline && (
                                      <span className="hex-pill-sm bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 inline-flex items-center gap-1 border border-red-200">
                                        <Zap size={9} /> {ord.timeline}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#726F6D] font-medium">
                                    {ord.slide_count} slides • Submitted on {new Date(ord.created_at).toLocaleDateString()}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {ord.drive_url && (
                                    <a
                                      href={ord.drive_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hex-pill bg-white text-[#111111] border border-primary/40 px-3 py-1.5 text-xs font-bold hover:bg-black/5 flex items-center gap-1.5 shadow-xs"
                                    >
                                      Shared Cloud Assets <ExternalLink size={12} />
                                    </a>
                                  )}
                                  <span className={`hex-pill-sm text-[10px] font-black px-3 py-1 uppercase shadow-xs ${
                                    isCompleted
                                      ? "bg-emerald-600 text-white"
                                      : "bg-primary text-[#111111]"
                                  }`}>
                                    Stage {currentIdx + 1} of 4: {activeMilestone.label}
                                  </span>
                                </div>
                              </div>

                              {/* Current Stage Status Box */}
                              <div className="bg-white/90 border border-primary/25 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary-amber flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                  <Sparkles size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-0.5">
                                    <span className="text-xs font-heading font-black text-[#111111]">
                                      Current Phase: {activeMilestone.fullLabel}
                                    </span>
                                    {isCompleted && (
                                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                        <Check size={10} strokeWidth={3} /> Final Delivery Ready
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#726F6D] leading-relaxed font-medium">
                                    {activeMilestone.clientDesc || activeMilestone.desc}
                                  </p>
                                </div>
                              </div>

                              {/* Responsive 4-Step Milestone Stepper */}
                              <div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {ORDER_MILESTONES.map((m, idx) => {
                                    const isPassed = idx < currentIdx;
                                    const isCurrent = idx === currentIdx;

                                    return (
                                      <div
                                        key={m.key}
                                        className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                                          isCurrent
                                            ? "bg-[#111111] text-white border-[#111111] shadow-md ring-2 ring-primary/40"
                                            : isPassed
                                            ? "bg-amber-100/90 text-amber-950 border-amber-300"
                                            : "bg-white/90 text-gray-400 border-gray-200"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                            isCurrent
                                              ? "bg-primary text-[#111111]"
                                              : isPassed
                                              ? "bg-amber-600 text-white"
                                              : "bg-gray-100 text-gray-500"
                                          }`}>
                                            {isPassed ? "Completed" : isCurrent ? "In Progress" : `Step ${m.step}`}
                                          </span>
                                          <div className="flex items-center justify-center">
                                            {isPassed ? (
                                              <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-black">
                                                <Check size={10} strokeWidth={3} />
                                              </div>
                                            ) : isCurrent ? (
                                              <div className="w-4 h-4 rounded-full bg-primary text-[#111111] flex items-center justify-center text-[9px] font-black animate-pulse">
                                                {m.step}
                                              </div>
                                            ) : (
                                              <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[9px] font-bold border border-gray-300">
                                                {m.step}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <div className={`font-heading font-extrabold text-xs mb-0.5 ${
                                            isCurrent ? "text-primary" : isPassed ? "text-[#111111]" : "text-gray-500"
                                          }`}>
                                            {m.label}
                                          </div>
                                          <p className={`text-[10px] leading-tight line-clamp-2 ${
                                            isCurrent ? "text-white/70" : isPassed ? "text-[#726F6D]" : "text-gray-400"
                                          }`}>
                                            {m.desc}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Delivery Download CTA if Delivered */}
                              {isCompleted && ord.drive_url && (
                                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span className="text-xs font-extrabold text-emerald-900">
                                      Your presentation master deck has been finalized and delivered.
                                    </span>
                                  </div>
                                  <a
                                    href={ord.drive_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm shrink-0 justify-center"
                                  >
                                    <Download size={13} /> Access Final Deliverables (.pptx)
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                Enter your registered work email. If an account exists, a secure password reset link will be sent to your inbox.
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
                      placeholder="sarah@hypergrowth.vc"
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
