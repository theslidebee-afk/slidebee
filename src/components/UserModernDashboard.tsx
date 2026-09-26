import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Download,
  Layers,
  Briefcase,
  Sliders,
  Sparkles,
  Search,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Bell,
  Settings,
  ArrowRight,
  FileText,
  User,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import SlideBeeLogo from "./SlideBeeLogo";

interface UserModernDashboardProps {
  currentUser: any;
  userProfile: any;
  userSubscription: any;
  userTier: string;
  userOrders: any[];
  purchasedItems: any[];
  usageHistory: any[];
  downloadsToday: number;
  downloadsThisMonth: number;
  remainingFreeToday: number;
  remainingPremiumThisMonth: number;
  proDaysRemaining: number | null;
  isProUser: boolean;
  isProExpired: boolean;
  handleLogout: () => void;
  studioWhatsapp?: string;
  onDeleteAccount?: () => void;
}

export const UserModernDashboard: React.FC<UserModernDashboardProps> = ({
  currentUser,
  userProfile,
  userSubscription: _userSubscription,
  userTier,
  userOrders,
  purchasedItems,
  usageHistory: _usageHistory,
  downloadsToday,
  downloadsThisMonth,
  remainingFreeToday,
  remainingPremiumThisMonth,
  proDaysRemaining,
  isProUser: _isProUser,
  isProExpired: _isProExpired,
  handleLogout,
  studioWhatsapp: _studioWhatsapp,
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "downloads" | "briefs" | "tier">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(26);

  const clientName =
    userProfile?.full_name ||
    currentUser.user_metadata?.full_name ||
    currentUser.email.split("@")[0];
  const clientCompany =
    userProfile?.company ||
    currentUser.user_metadata?.company ||
    "Enterprise Client";

  // Quota metrics calculation
  const quotaTotal = userTier === "free" ? 3 : (userTier === "lifetime" ? 45 : 30);
  const quotaUsed = userTier === "free" ? downloadsToday : downloadsThisMonth;
  const quotaRemaining = userTier === "free" ? remainingFreeToday : remainingPremiumThisMonth;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaTotal) * 100));

  // Circular gauge SVG helpers
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (quotaPercent / 100) * circumference;

  const scorePercent = userTier === "lifetime" ? 100 : userTier === "yearly" ? 85 : userTier === "monthly" ? 65 : 35;
  const scoreStrokeDashoffset = circumference - (scorePercent / 100) * circumference;

  // Recent downloads or sample master slides
  const defaultRecentSlides = [
    {
      id: "deck-1",
      title: "Executive Strategic Keynote",
      category: "Keynote",
      size: "4.8 MB",
      format: "16:9 Widescreen PPTX",
      url: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg",
      code: "SLD-318"
    },
    {
      id: "deck-2",
      title: "Series A Investor Pitch Deck",
      category: "Fundraising",
      size: "7.2 MB",
      format: "16:9 Widescreen PPTX",
      url: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg",
      code: "SLD-301"
    },
    {
      id: "deck-3",
      title: "Financial KPI & Capital Markets",
      category: "Finance",
      size: "5.4 MB",
      format: "16:9 Widescreen PPTX",
      url: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-1.jpg",
      code: "SLD-304"
    },
    {
      id: "deck-4",
      title: "DeepTech & Semiconductor Briefing",
      category: "Technology",
      size: "6.1 MB",
      format: "16:9 Widescreen PPTX",
      url: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-1.jpg",
      code: "SLD-307"
    }
  ];

  const recentItems = purchasedItems.length > 0 
    ? purchasedItems.slice(0, 5).map((p, i) => ({
        id: p.id || `purchased-${i}`,
        title: p.title || p.template_name || `SlideDeck #${i + 1}`,
        category: p.category || "Presentation",
        size: "5.2 MB",
        format: "16:9 Master PPTX",
        url: p.thumbnail_url || defaultRecentSlides[i % defaultRecentSlides.length].url,
        code: p.template_code || `SLD-0${i + 1}`
      }))
    : defaultRecentSlides;

  // Calendar dates generation (September 2026)
  const calendarDays = [
    { day: "", empty: true },
    { day: "", empty: true },
    { day: 1 },
    { day: 2 },
    { day: 3 },
    { day: 4 },
    { day: 5 },
    { day: 6 },
    { day: 7 },
    { day: 8 },
    { day: 9 },
    { day: 10 },
    { day: 11 },
    { day: 12 },
    { day: 13 },
    { day: 14 },
    { day: 15 },
    { day: 16 },
    { day: 17 },
    { day: 18 },
    { day: 19 },
    { day: 20 },
    { day: 21 },
    { day: 22 },
    { day: 23 },
    { day: 24 },
    { day: 25 },
    { day: 26 },
    { day: 27 },
    { day: 28 },
    { day: 29 },
    { day: 30 },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#111111] pt-24 pb-16 px-3 sm:px-6 lg:px-8 flex justify-center items-start">
      
      {/* Eduspot-Style Unified Floating Dashboard Card */}
      <div className="w-full max-w-[1580px] bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_20px_70px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col xl:flex-row min-h-[840px]">
        
        {/* ========================================================================= */}
        {/* 1. LEFT SIDEBAR NAVIGATION                                                */}
        {/* ========================================================================= */}
        <div className="w-full xl:w-64 border-b xl:border-b-0 xl:border-r border-gray-100 p-6 sm:p-7 flex flex-col justify-between shrink-0 bg-[#FAFAFA]/70">
          
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <SlideBeeLogo variant="light" size="sm" />
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              
              {/* Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "dashboard"
                    ? "bg-[#FFF9E8] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-white hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} className={activeTab === "dashboard" ? "text-primary-amber" : "text-[#888]"} />
                  <span>Dashboard</span>
                </div>
              </button>

              {/* My Downloads */}
              <button
                type="button"
                onClick={() => setActiveTab("downloads")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "downloads"
                    ? "bg-[#FFF9E8] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-white hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Download size={18} className={activeTab === "downloads" ? "text-primary-amber" : "text-[#888]"} />
                  <span>My Downloads</span>
                </div>
                {purchasedItems.length > 0 && (
                  <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">
                    {purchasedItems.length}
                  </span>
                )}
              </button>

              {/* Catalog Templates */}
              <Link
                to="/"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold text-[#726F6D] hover:bg-white hover:text-[#111111] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-[#888]" />
                  <span>Templates</span>
                </div>
                <ExternalLink size={12} className="text-gray-400" />
              </Link>

              {/* Custom Briefs */}
              <button
                type="button"
                onClick={() => setActiveTab("briefs")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "briefs"
                    ? "bg-[#FFF9E8] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-white hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className={activeTab === "briefs" ? "text-primary-amber" : "text-[#888]"} />
                  <span>Custom Briefs</span>
                </div>
                {userOrders.length > 0 && (
                  <span className="text-[10px] bg-primary text-[#111111] px-2 py-0.5 rounded-full font-bold">
                    {userOrders.length}
                  </span>
                )}
              </button>

              {/* Account Tier & Settings */}
              <button
                type="button"
                onClick={() => setActiveTab("tier")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "tier"
                    ? "bg-[#FFF9E8] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-white hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders size={18} className={activeTab === "tier" ? "text-primary-amber" : "text-[#888]"} />
                  <span>Plan & Tier</span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {userTier}
                </span>
              </button>

            </nav>
          </div>

          {/* Bottom Card: SlideBee Mobile & Custom Studio */}
          <div className="mt-8 pt-4 border-t border-gray-100">
            <div className="bg-white border border-gray-200/70 p-4 rounded-2xl shadow-xs text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#FFF9E8] text-primary-amber mx-auto flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <h4 className="text-xs font-heading font-black text-[#111111]">
                Need Custom Slides?
              </h4>
              <p className="text-[10px] text-[#726F6D] leading-tight">
                Hire our senior slide art directors with 24-48h turnaround.
              </p>
              <Link
                to="/ordernow"
                className="w-full inline-block bg-[#FCBF14] hover:bg-[#E0A810] text-[#111111] text-[11px] font-extrabold py-2 px-3 rounded-xl transition-all shadow-xs"
              >
                Get a Quote
              </Link>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN CENTER CONTENT AREA                                               */}
        {/* ========================================================================= */}
        <div className="flex-1 p-6 sm:p-8 space-y-7 overflow-y-auto bg-white">
          
          {/* Top Search Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search master slides, keynotes, pitch decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5F6F8] rounded-full pl-11 pr-4 py-2.5 text-xs text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FCBF14]/50 border-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/ordernow"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#111111] hover:bg-black text-white px-4 py-2.5 rounded-full transition-all shadow-xs"
              >
                <span>Submit Brief</span>
                <ArrowRight size={13} className="text-[#FCBF14]" />
              </Link>
            </div>
          </div>

          {activeTab === "dashboard" && (
            <>
              {/* Top Welcome Banner (Matching Eduspot blue banner in SlideBee dark luxury aesthetic) */}
              <div className="bg-[#141414] text-white rounded-[26px] p-6 sm:p-8 relative overflow-hidden shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-white/5">
                
                {/* Golden ambient gradient */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#FCBF14]/15 rounded-full blur-[70px] pointer-events-none" />

                <div className="relative z-10 space-y-2 max-w-md">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#FCBF14]">
                    SlideBee Client Portal
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-black text-white leading-tight">
                    Welcome back,<br />
                    {clientName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium">
                    {clientCompany} • Access your executive master presentations or request on-demand polishing.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FCBF14] hover:underline"
                    >
                      <span>Explore 1,000+ templates library</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Right Decorative Presentation Mockup Graphic */}
                <div className="relative z-10 hidden md:flex items-center gap-2">
                  <div className="w-24 h-16 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-2 shadow-lg -rotate-6">
                    <div className="w-full h-full rounded bg-[#FCBF14]/30 flex items-center justify-center text-[10px] font-bold text-white">
                      Keynote
                    </div>
                  </div>
                  <div className="w-28 h-20 bg-white/15 backdrop-blur-md rounded-xl border border-[#FCBF14]/40 p-2 shadow-2xl rotate-3">
                    <div className="w-full h-full rounded bg-[#FCBF14] text-[#111111] flex items-center justify-center text-xs font-extrabold shadow-sm">
                      Pitch Deck
                    </div>
                  </div>
                </div>

              </div>

              {/* 3 Metric Cards (Matching Eduspot Today's goal / Score / Courses cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Card 1: Today's Goal (Circular Donut Gauge) */}
                <div className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-heading font-black text-[#111111]">
                    Today's quota
                  </h3>

                  <div className="flex flex-col items-center justify-center my-4 relative">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#F0F0F0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#FCBF14"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-heading font-black text-[#111111]">
                        {quotaPercent}%
                      </span>
                      <span className="text-[10px] font-bold text-[#726F6D]">
                        {quotaUsed} of {quotaTotal}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-[#726F6D] font-medium pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FCBF14]" /> Used ({quotaUsed})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-300" /> Limit ({quotaTotal})
                    </span>
                  </div>
                </div>

                {/* Card 2: Account Health / Balance Gauge */}
                <div className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-heading font-black text-[#111111]">
                    Available balance
                  </h3>

                  <div className="flex flex-col items-center justify-center my-4 relative">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#F0F0F0"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#111111"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={scoreStrokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-heading font-black text-[#111111]">
                        {quotaRemaining}
                      </span>
                      <span className="text-[10px] font-bold text-[#726F6D]">
                        Decks left
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-[#726F6D] font-medium pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#111111]" /> Active Plan
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Verified
                    </span>
                  </div>
                </div>

                {/* Card 3: Top Categories Breakdown (Matching Eduspot Horizontal Bar Chart) */}
                <div className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-heading font-black text-[#111111] mb-2">
                    Top categories
                  </h3>

                  <div className="space-y-2.5 my-2">
                    {[
                      { name: "Keynotes", pct: 85, color: "bg-[#FCBF14]" },
                      { name: "Pitch Decks", pct: 65, color: "bg-[#111111]" },
                      { name: "Financial KPI", pct: 40, color: "bg-amber-500" },
                      { name: "Strategy", pct: 25, color: "bg-gray-400" }
                    ].map((cat, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-bold text-[#111111] w-20 shrink-0 text-[11px]">
                          {cat.name}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color}`}
                            style={{ width: `${cat.pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#726F6D] w-8 text-right">
                          {cat.pct}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-[#726F6D] font-medium pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FCBF14]" /> SlideBee Curated
                    </span>
                  </div>
                </div>

              </div>

              {/* Recent Slide Decks & Media (Matching Eduspot 'Media for lessons' list view) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-heading font-black text-[#111111]">
                    Recent Downloads & Media
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("downloads")}
                    className="text-xs font-bold text-primary-amber hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-2.5">
                  {recentItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAFAFA] hover:bg-[#FFFDF5] border border-gray-200/60 hover:border-[#FCBF14]/50 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#111111] shrink-0 shadow-2xs">
                          <FileText size={18} className="text-[#FCBF14]" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-[#111111] leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-[#726F6D] font-medium mt-0.5">
                            {item.format} • {item.size}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-[#555]">
                          {item.code}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="w-8 h-8 rounded-full bg-white hover:bg-[#FCBF14] border border-gray-200 flex items-center justify-center text-[#111111] transition-all shadow-2xs"
                          title="Download PPTX Deck"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sub-View: Downloads */}
          {activeTab === "downloads" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-heading font-black text-[#111111]">
                  All Licensed & Downloaded Decks ({purchasedItems.length})
                </h3>
                <span className="text-xs text-[#726F6D]">
                  Stored permanently in your client account
                </span>
              </div>

              {purchasedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {purchasedItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 hover:border-primary transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-primary-amber shrink-0">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#111111]">
                            {item.title || item.template_name || `Presentation Deck #${idx + 1}`}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {item.template_code || "PPTX 16:9"}
                          </span>
                        </div>
                      </div>
                      <a
                        href={item.download_url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="w-full text-center bg-[#111111] hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition-all"
                      >
                        Download Master PPTX
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-3">
                  <Download size={28} className="mx-auto text-gray-400" />
                  <p className="text-xs text-gray-600 font-medium">
                    You haven't claimed any templates yet. Browse our marketplace to get started.
                  </p>
                  <Link
                    to="/"
                    className="inline-block bg-[#FCBF14] text-[#111111] text-xs font-bold px-5 py-2.5 rounded-full"
                  >
                    Browse Templates Catalog
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Sub-View: Briefs */}
          {activeTab === "briefs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-heading font-black text-[#111111]">
                  Custom Presentation Projects ({userOrders.length})
                </h3>
                <Link
                  to="/ordernow"
                  className="text-xs font-bold text-primary-amber hover:underline"
                >
                  + Submit New Project
                </Link>
              </div>

              {userOrders.length > 0 ? (
                <div className="space-y-3">
                  {userOrders.map((order: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                            {order.service_type || "Custom Deck"}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            order.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {order.status?.toUpperCase() || "IN PROGRESS"}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#111111]">
                          {order.project_title || `Order #${order.id?.slice(0, 8) || idx + 1}`}
                        </h4>
                      </div>
                      <div className="text-xs text-right">
                        <span className="font-extrabold text-[#111111] block">
                          {order.amount ? `$${order.amount}` : "Quote Based"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Active"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#FAFAFA] rounded-2xl border border-dashed border-gray-200 space-y-3">
                  <Briefcase size={28} className="mx-auto text-gray-400" />
                  <p className="text-xs text-gray-600 font-medium">
                    No custom agency briefs submitted yet. Send us your rough slides or outline for a 2-hour quote.
                  </p>
                  <Link
                    to="/ordernow"
                    className="inline-block bg-[#111111] text-white text-xs font-bold px-5 py-2.5 rounded-full"
                  >
                    Submit a Project Brief
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Sub-View: Plan & Tier */}
          {activeTab === "tier" && (
            <div className="space-y-5">
              <div className="bg-[#FFF9E8] border border-[#FCBF14]/40 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                    Current Active Membership
                  </span>
                  <span className="text-xs font-black bg-[#FCBF14] text-[#111111] px-3 py-1 rounded-full uppercase">
                    {userTier}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-black text-[#111111]">
                  {userTier === "lifetime"
                    ? "SlideBee Lifetime VIP"
                    : userTier === "yearly"
                    ? "SlideBee Yearly Pro"
                    : userTier === "monthly"
                    ? "SlideBee Monthly Pro"
                    : "SlideBee Basic Free Plan"}
                </h3>
                <p className="text-xs text-[#555250] leading-relaxed">
                  {userTier === "free"
                    ? "You are currently on the free starter plan (3 daily downloads). Upgrade to unlock all 30-slide master decks."
                    : "Your subscription includes complete commercial presentation rights and editable PowerPoint master files."}
                </p>
                {proDaysRemaining !== null && (
                  <p className="text-xs font-bold text-amber-800">
                    Duration remaining in plan: {proDaysRemaining} days
                  </p>
                )}
                <div className="pt-2">
                  <Link
                    to="/pricing"
                    className="inline-block bg-[#111111] text-white text-xs font-bold px-5 py-2.5 rounded-full"
                  >
                    View Upgrade Options
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 3. RIGHT SIDEBAR (Matching Eduspot user profile, calendar, today card)     */}
        {/* ========================================================================= */}
        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-100 p-6 sm:p-7 flex flex-col justify-between shrink-0 bg-[#FAFAFA]/50 space-y-6">
          
          <div className="space-y-6">
            {/* Top User Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <button type="button" className="p-1.5 hover:text-black rounded-lg transition-colors" title="Help & Support">
                  <HelpCircle size={17} />
                </button>
                <button type="button" className="p-1.5 hover:text-black rounded-lg transition-colors relative" title="Notifications">
                  <Bell size={17} />
                  <span className="w-1.5 h-1.5 bg-[#FCBF14] rounded-full absolute top-1 right-1" />
                </button>
                <button type="button" className="p-1.5 hover:text-black rounded-lg transition-colors" title="Account Settings">
                  <Settings size={17} />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#111111] block leading-tight">
                    {clientName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium block">
                    {currentUser.email.slice(0, 16)}...
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                  {clientName[0]?.toUpperCase() || <User size={15} />}
                </div>
              </div>
            </div>

            {/* Calendar Widget (Matching Eduspot Calendar) */}
            <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-heading font-black text-[#111111]">
                  September 2026
                </span>
                <div className="flex items-center gap-1 text-gray-400">
                  <button type="button" className="p-1 hover:text-black rounded">
                    <ChevronLeft size={14} />
                  </button>
                  <button type="button" className="p-1 hover:text-black rounded">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => item.day && setSelectedCalendarDate(item.day as number)}
                    disabled={!item.day}
                    className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[11px] font-medium transition-all ${
                      item.day === selectedCalendarDate
                        ? "bg-[#FCBF14] text-[#111111] font-black shadow-xs scale-105"
                        : item.day
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-transparent cursor-default"
                    }`}
                  >
                    {item.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Highlight Project Card (Matching Eduspot 'The Modern JavaScript Bootcamp' card) */}
            <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFF9E8] text-amber-800 px-2 py-0.5 rounded border border-[#FCBF14]/30">
                  Today
                </span>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <Check size={10} /> Active Studio
                </span>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-heading font-black text-[#111111] leading-tight">
                  Executive Presentation Polish
                </h4>
                <p className="text-[10px] text-[#726F6D] font-medium mt-1 leading-relaxed">
                  Turn rough drafts or notes into executive-grade slide architecture.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#FCBF14]" />
                  <span>SLA Guarantee</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-gray-400" />
                  <span>24h – 48h Turnaround</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/ordernow"
                  className="w-full text-center py-2 px-2 text-[11px] font-bold text-[#111111] border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
                >
                  Submit Brief
                </Link>
                <Link
                  to="/"
                  className="w-full text-center py-2 px-2 text-[11px] font-black bg-[#FCBF14] hover:bg-[#E0A810] text-[#111111] rounded-xl shadow-xs transition-all"
                >
                  Browse Decks
                </Link>
              </div>
            </div>

          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={14} /> Log Out of SlideBee
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default UserModernDashboard;

