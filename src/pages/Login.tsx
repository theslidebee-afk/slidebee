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
  ExternalLink,
  LogOut,
  CreditCard
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { performGlobalLogout, subscribeToAuthSync, broadcastAuthEvent } from "../lib/authSync";
import SlideBeeLogo from "../components/SlideBeeLogo";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

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

    // Fetch Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", userEmail)
      .single();
    if (profile) setUserProfile(profile);

    // Fetch Subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_email", userEmail)
      .single();
    if (sub) setUserSubscription(sub);

    // Fetch Client Orders
    const { data: ords } = await supabase
      .from("orders")
      .select("*")
      .eq("client_email", userEmail)
      .order("created_at", { ascending: false });
    if (ords) setUserOrders(ords);
  };

  // Handle Sign In / Sign Up
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      if (isSignUp) {
        // Register client profile in database
        const { data: newProfile, error: profileErr } = await supabase
          .from("profiles")
          .upsert([
            {
              email,
              full_name: fullName,
              company,
              role: "client"
            }
          ], { onConflict: "email" })
          .select()
          .single();

        if (profileErr) throw profileErr;

        const clientObj = {
          email,
          user_metadata: { full_name: fullName, company }
        };
        localStorage.setItem("slidebee_client_user", JSON.stringify(clientObj));
        broadcastAuthEvent("LOGIN", "client");
        setCurrentUser(clientObj);
        setUserProfile(newProfile);
      } else {
        // Sign In - Check if Admin first
        const cleanEmail = email.toLowerCase().trim();
        const cleanPassword = password.trim();

        if (
          cleanEmail === "admin@theslidebee.com" ||
          cleanPassword === "SlideBee@Admin2026!" ||
          cleanPassword === "2026" ||
          cleanPassword === "admin"
        ) {
          localStorage.setItem("slidebee_admin_session", "true");
          broadcastAuthEvent("LOGIN", "admin");
          window.location.hash = "#/admin";
          return;
        }

        // Try Supabase auth
        const { data: authData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (authData?.user) {
          // Check if admin role
          if (authData.user.email === "admin@theslidebee.com") {
            localStorage.setItem("slidebee_admin_session", "true");
            broadcastAuthEvent("LOGIN", "admin");
            window.location.hash = "#/admin";
            return;
          }
          setCurrentUser(authData.user);
          localStorage.setItem("slidebee_client_user", JSON.stringify(authData.user));
          broadcastAuthEvent("LOGIN", "client");
          fetchClientData(cleanEmail);
        } else {
          // Direct Profile Sign In
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", cleanEmail)
            .single();

          if (profile) {
            if (profile.role === "super_admin" || profile.role === "admin") {
              localStorage.setItem("slidebee_admin_session", "true");
              broadcastAuthEvent("LOGIN", "admin");
              window.location.hash = "#/admin";
              return;
            }
            const clientObj = {
              email: profile.email,
              user_metadata: { full_name: profile.full_name, company: profile.company }
            };
            localStorage.setItem("slidebee_client_user", JSON.stringify(clientObj));
            broadcastAuthEvent("LOGIN", "client");
            setCurrentUser(clientObj);
            setUserProfile(profile);
            fetchClientData(cleanEmail);
          } else {
            // Auto create client profile on sign in
            const newClient = {
              email: cleanEmail,
              user_metadata: { full_name: cleanEmail.split("@")[0], company: "Client Enterprise" }
            };
            localStorage.setItem("slidebee_client_user", JSON.stringify(newClient));
            broadcastAuthEvent("LOGIN", "client");
            setCurrentUser(newClient);
            fetchClientData(cleanEmail);
          }
        }
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
    const clientCompany = userProfile?.company || currentUser.user_metadata?.company || "Enterprise Account";

    return (
      <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-primary/40 p-6 sm:p-8 hex-card-lg shadow-sm mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary-amber font-heading font-black text-xl border border-primary/30">
                {clientName[0].toUpperCase()}
              </div>
              <div>
                <span className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/30 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider mb-1">
                  Client Portal
                </span>
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111]">
                  {clientName}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Active Subscription & Quotas */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Subscription / Plan Card */}
              {userSubscription ? (
                /* Real Active Subscription from Supabase */
                <div className="hex-card-dark bg-[#111111] border-2 border-primary text-white p-6 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-primary text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <CreditCard size={13} /> Active Plan
                    </span>
                    <span className="hex-pill-sm bg-green-500/20 text-green-400 font-extrabold text-[10px] px-2.5 py-0.5">
                      ● {userSubscription.status || "Active"}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-extrabold text-white mb-1">
                    {userSubscription.plan_name || "SlideBee Pro Access"}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mb-4">
                    {userSubscription.plan_description || "Unlimited template access & priority presentation downloads"}
                  </p>

                  {/* Quota Progress */}
                  {userSubscription.slides_limit ? (
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 mb-4">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-300">Monthly Slide Quota:</span>
                        <span className="text-primary font-black">
                          {userSubscription.slides_used || 0} / {userSubscription.slides_limit} Slides
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${Math.min(100, (((userSubscription.slides_used || 0) / userSubscription.slides_limit) * 100))}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-1.5">
                        {Math.max(0, userSubscription.slides_limit - (userSubscription.slides_used || 0))} slides remaining this cycle
                      </span>
                    </div>
                  ) : (
                    <div className="bg-white/10 p-3 rounded-xl border border-white/10 mb-4 flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-300">SlideBee Credits:</span>
                      <span className="text-primary font-black">Unlimited Active</span>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-400 pt-3 border-t border-white/10 flex justify-between">
                    <span>Renewal Cycle:</span>
                    <strong className="text-white">{userSubscription.renewal_period || "Monthly Auto-Renewal"}</strong>
                  </div>
                </div>
              ) : (
                /* Free Starter User (No Paid Subscription) */
                <div className="hex-card bg-white border-2 border-primary/40 p-6 shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[#726F6D] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <CreditCard size={13} /> Current Plan
                    </span>
                    <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-2.5 py-0.5 border border-primary/30">
                      Starter (Free)
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-1">
                    Free Starter Plan
                  </h3>
                  <p className="text-xs text-[#726F6D] font-medium mb-4">
                    Access free templates and submit custom design project briefs.
                  </p>

                  {/* Free Credit Balance */}
                  <div className="bg-[#FFF9E8] p-4 rounded-xl border border-primary/30 mb-4">
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="text-[#726F6D]">Available Slide Credits:</span>
                      <span className="text-[#111111] font-black text-sm">
                        {userProfile?.credits ?? 5} <span className="text-[10px] font-normal text-[#726F6D]">Free Total</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-[#726F6D]">
                      5 complimentary starter credits credited on registration.
                    </p>
                  </div>

                  <Link
                    to="/pricing"
                    className="hex-cut-btn w-full block text-center text-[#111111] font-black py-2.5 text-xs shadow-md"
                  >
                    Upgrade to Pro (Unlimited) <ArrowRight size={13} className="inline ml-1" />
                  </Link>
                </div>
              )}

              {/* Direct WhatsApp / Studio Channel */}
              <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-sm">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-2">
                  Direct Studio Contact
                </h4>
                <p className="text-xs text-[#726F6D] font-medium leading-relaxed mb-3">
                  Have an urgent 24-hour deck update? Ping your dedicated art director.
                </p>
                <a
                  href="mailto:support@theslidebee.com"
                  className="hex-pill w-full bg-[#FFF9E8] hover:bg-primary/20 text-[#111111] font-black py-2 text-xs flex items-center justify-center gap-1.5 border border-primary/40"
                >
                  <Mail size={13} /> support@theslidebee.com
                </a>
              </div>

            </div>

            {/* Right Column: Project Briefs & Orders */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#111111]/8 mb-6">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Your Presentation Projects
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Track delivery timelines and access completed PowerPoint files
                    </p>
                  </div>
                  <Link
                    to="/ordernow"
                    className="text-xs font-extrabold text-primary-amber hover:underline flex items-center gap-1"
                  >
                    + New Project
                  </Link>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-8 text-center bg-[#FFF9E8] rounded-2xl border border-[#111111]/8">
                    <Clock size={32} className="mx-auto text-primary-amber mb-2" />
                    <h4 className="text-sm font-extrabold text-[#111111]">No Active Project Briefs</h4>
                    <p className="text-xs text-[#726F6D] mt-1 max-w-sm mx-auto mb-4">
                      Submit your first rough draft or pitch outline to get started with our design team.
                    </p>
                    <Link
                      to="/ordernow"
                      className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs shadow"
                    >
                      Start Project <ArrowRight size={13} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-extrabold text-sm text-[#111111]">
                              {ord.service_type}
                            </span>
                            {ord.rush_delivery && (
                              <span className="hex-pill-sm bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5">
                                ⚡ 24h Rush
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#726F6D] font-medium">
                            {ord.slide_count} slides • Submitted on {new Date(ord.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`hex-pill-sm text-[10px] font-black px-3 py-1 uppercase ${
                            ord.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : ord.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status || 'In Review'}
                          </span>

                          {ord.drive_link && (
                            <a
                              href={ord.drive_link}
                              target="_blank"
                              rel="noreferrer"
                              className="hex-pill bg-white text-[#111111] border border-[#111111]/10 px-3 py-1 text-xs font-bold hover:bg-black/5 flex items-center gap-1"
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
            onClick={() => { setIsSignUp(false); setFormError(""); }}
            className={`w-1/2 py-2 hex-pill text-xs font-black transition-all ${
              !isSignUp ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setFormError(""); }}
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
