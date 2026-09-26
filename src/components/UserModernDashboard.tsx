import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Download,
  Briefcase,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Bell,
  ArrowRight,
  FileText,
  MessageCircle,
  ChevronDown,
  LayoutGrid,
  CreditCard,
  Trash2
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

// Minimalist Presentation Easel Whiteboard SVG Icon (matching reference mockup)

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
  proDaysRemaining: _proDaysRemaining,
  isProUser: _isProUser,
  isProExpired: _isProExpired,
  handleLogout,
  studioWhatsapp = "919876543210",
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "purchased" | "custom" | "marketplace" | "ledger">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(17);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);

  const clientName =
    userProfile?.full_name ||
    currentUser.user_metadata?.full_name ||
    currentUser.email.split("@")[0];

  // Quota metrics calculation
  const quotaTotal = userTier === "free" ? 3 : (userTier === "lifetime" ? 45 : 30);
  const quotaUsed = userTier === "free" ? downloadsToday : downloadsThisMonth;
  const quotaRemaining = userTier === "free" ? remainingFreeToday : remainingPremiumThisMonth;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaTotal) * 100));

  // Circular gauge SVG helpers
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  // Available design credits gauge
  const creditGaugePercent = quotaPercent > 0 ? (100 - quotaPercent) : 76;
  const creditStrokeDashoffset = circumference - (creditGaugePercent / 100) * circumference;

  // Project milestone gauge
  const milestoneGaugePercent = 75;
  const milestoneStrokeDashoffset = circumference - (milestoneGaugePercent / 100) * circumference;

  // Active custom order or fallback
  const activeOrder = userOrders.find(
    (o) => o.status !== "completed" && o.status !== "delivered"
  ) || userOrders[0];

  const activeProjectTitle =
    activeOrder?.project_title || activeOrder?.service_type || "Q4 Investor Pitch Deck";
  const activeMilestone =
    activeOrder?.status === "draft_1"
      ? "Draft 1 (Blueprint)"
      : activeOrder?.status === "draft_2"
      ? "Draft 2 (Design Alignment)"
      : activeOrder?.status === "polish"
      ? "Final Polish"
      : "Final Polish";

  // Recent deliverables list
  const defaultDeliverables = [
    {
      id: "deck-1",
      title: "Sequoia Series A Pitch Deck",
      subtitle: "38 slides, PPTX, 42 MB",
      downloadUrl: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/downloads/sequoia_pitch.pptx",
      thumbnailBg: "bg-[#181818]"
    },
    {
      id: "deck-2",
      title: "Executive KPI Dashboard",
      subtitle: "18 slides, PPTX",
      downloadUrl: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/downloads/kpi_dashboard.pptx",
      thumbnailBg: "bg-[#F3F4F6]"
    }
  ];

  // Custom project deliverables uploaded by studio admin
  const customOrderDeliverables = userOrders
    .filter((o) => Boolean(o.deliverable_url))
    .map((o, i) => ({
      id: o.id || `custom-deliverable-${i}`,
      title: o.deliverable_name || o.project_title || o.service_type || "Custom Master Presentation",
      subtitle: `${o.slide_count || "Custom"} slides, Final PPTX Master, Delivered`,
      downloadUrl: o.deliverable_url,
      thumbnailBg: "bg-[#181818]",
      isCustomProject: true
    }));

  const allPurchasedDeliverables = [
    ...customOrderDeliverables,
    ...purchasedItems.map((p, i) => ({
      id: p.id || `purchased-${i}`,
      title: p.title || p.template_title || p.template_name || `SlideDeck #${i + 1}`,
      subtitle: `${p.slide_count || 24} slides, PPTX, ${p.file_size || "18 MB"}`,
      downloadUrl: p.download_url || "#",
      thumbnailBg: (i + customOrderDeliverables.length) % 2 === 0 ? "bg-[#181818]" : "bg-[#F3F4F6]",
      isCustomProject: false
    }))
  ];

  const deliverablesToDisplay = allPurchasedDeliverables.length > 0
    ? allPurchasedDeliverables.slice(0, 4)
    : defaultDeliverables;

  // Dynamic user notifications
  const notifications: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    time: string;
    tab?: "overview" | "purchased" | "custom" | "marketplace" | "ledger";
  }> = [];

  const masterDeliverableOrder = userOrders.find((o) => Boolean(o.deliverable_url));
  if (masterDeliverableOrder) {
    notifications.push({
      id: "deliverable-ready",
      category: "Master Ready",
      title: "Final Master (.pptx) Available",
      description: `Studio deliverable for "${masterDeliverableOrder.project_title || masterDeliverableOrder.service_type || 'Custom Order'}" is ready for download.`,
      time: "Just now",
      tab: "custom"
    });
  }

  if (activeOrder) {
    notifications.push({
      id: "order-milestone",
      category: "Project Status",
      title: `${activeProjectTitle}: ${activeMilestone}`,
      description: `Your presentation brief is currently in the ${activeMilestone} milestone.`,
      time: "Active",
      tab: "custom"
    });
  }

  notifications.push({
    id: "quota-status",
    category: "Quota",
    title: `${quotaRemaining} / ${quotaTotal} Downloads Available`,
    description: `Your ${userTier.toUpperCase()} membership cycle has ${quotaRemaining} template downloads ready.`,
    time: "Cycle active",
    tab: "ledger"
  });

  notifications.push({
    id: "catalog-update",
    category: "Studio Update",
    title: "New Executive Decks Added",
    description: "Explore the latest 16:9 master templates in the marketplace.",
    time: "This week",
    tab: "marketplace"
  });

  // Calendar dates (September 2026 - 31 days)
  // Day 17 is active (charcoal circle), Day 15 has gold milestone dot
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
    { day: 15, hasDot: true },
    { day: 16 },
    { day: 17, isDefaultActive: true },
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
    { day: 31 }
  ];

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] text-[#111111] overflow-hidden flex justify-center items-start pt-16 sm:pt-20 pb-16 px-3 sm:px-6 lg:px-8">
      {/* Background Graphic matching user reference mockup */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />

      {/* ========================================================================= */}
      {/* MAIN FLOATING DASHBOARD CONTAINER                                         */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[1560px] bg-white rounded-[32px] sm:rounded-[44px] shadow-[0_25px_80px_rgba(215,160,25,0.18),0_10px_30px_rgba(0,0,0,0.06)] border border-[#ECCF87]/40 overflow-hidden flex flex-col xl:flex-row min-h-[850px]">
        
        {/* ======================================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR NAVIGATION                                       */}
        {/* ======================================================================= */}
        <div className="w-full xl:w-72 border-b xl:border-b-0 xl:border-r border-gray-100 p-6 sm:p-7 flex flex-col justify-between shrink-0 bg-white">
          
          <div className="space-y-8">
            {/* SlideBee Logo */}
            <div className="flex items-center px-1">
              <Link to="/" className="flex items-center">
                <SlideBeeLogo variant="light" size="sm" />
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2">
              
              {/* Overview (Active in Mockup) */}
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} className={activeTab === "overview" ? "text-primary-amber" : "text-[#726F6D]"} />
                  <span>Overview</span>
                </div>
              </button>

              {/* My Purchased Decks */}
              <button
                type="button"
                onClick={() => setActiveTab("purchased")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "purchased"
                    ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className={activeTab === "purchased" ? "text-primary-amber" : "text-[#726F6D]"} />
                  <span>My Purchased Decks</span>
                </div>
                {purchasedItems.length > 0 && (
                  <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">
                    {purchasedItems.length}
                  </span>
                )}
              </button>

              {/* Custom Projects */}
              <button
                type="button"
                onClick={() => setActiveTab("custom")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "custom"
                    ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className={activeTab === "custom" ? "text-primary-amber" : "text-[#726F6D]"} />
                  <span>Custom Projects</span>
                </div>
                {userOrders.length > 0 && (
                  <span className="text-[10px] bg-primary text-[#111111] px-2 py-0.5 rounded-full font-bold">
                    {userOrders.length}
                  </span>
                )}
              </button>

              {/* Template Marketplace */}
              <button
                type="button"
                onClick={() => setActiveTab("marketplace")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "marketplace"
                    ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid size={18} className={activeTab === "marketplace" ? "text-primary-amber" : "text-[#726F6D]"} />
                  <span>Template Marketplace</span>
                </div>
              </button>

              {/* Credit Ledger */}
              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "ledger"
                    ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                    : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className={activeTab === "ledger" ? "text-primary-amber" : "text-[#726F6D]"} />
                  <span>Subscription & Quota</span>
                </div>
                <span className="text-[10px] uppercase font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {userTier}
                </span>
              </button>

            </nav>
          </div>

          {/* Bottom Card: VIP Studio Hotline (Matching Reference Mockup) */}
          <div className="mt-8 pt-4">
            <a
              href={`https://wa.me/${studioWhatsapp}?text=Hi%20SlideBee,%20inquiring%20about%20my%20presentation%20dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#F7D878] to-[#E9BC43] text-[#111111] shadow-sm hover:shadow-md transition-all group text-center cursor-pointer border border-[#E0A824]/30"
            >
              <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center mx-auto mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                <MessageCircle size={22} className="fill-white" />
              </div>
              <div className="text-xs font-heading font-black leading-tight">
                VIP Studio Hotline -
              </div>
              <div className="text-[11px] font-medium text-[#111111]/85 mt-0.5">
                Direct WhatsApp priority channel
              </div>
            </a>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* COLUMN 2: CENTER MAIN CONTENT AREA                                      */}
        {/* ======================================================================= */}
        <div className="flex-1 min-w-0 p-6 sm:p-8 lg:p-9 space-y-6 overflow-y-auto">
          
          {/* Top Search Bar (Exact placeholder from mockup) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search your purchased decks, custom orders, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F4F6]/75 border border-transparent rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#111111] placeholder:text-[#8E8B88] font-medium outline-none focus:bg-white focus:border-primary transition-all shadow-2xs"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>

          {/* VIEW: OVERVIEW (Default View Matching Reference Mockup) */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Welcome Banner Card (Black card with angled slide preview) */}
              <div className="bg-[#151515] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-white/5">
                
                {/* Left Text */}
                <div className="relative z-10 max-w-md space-y-1.5">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium tracking-wide">
                    Welcome back, {clientName}
                  </p>
                  <h2 className="text-xl sm:text-2xl lg:text-[26px] font-heading font-black text-white leading-snug tracking-tight">
                    Your {activeProjectTitle} is in{" "}
                    <span className="text-[#FCBF14]">{activeMilestone}</span> milestone
                  </h2>
                </div>

                {/* Right Angled Slide Thumbnail Cards (Matching Mockup) */}
                <div className="relative z-10 hidden md:flex items-center -mr-2 shrink-0">
                  <div className="relative w-48 sm:w-56 h-32 rounded-2xl bg-white p-3.5 shadow-2xl rotate-2 border border-white/20 flex flex-col justify-between transform hover:rotate-0 transition-transform">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary-amber bg-primary/20 px-2 py-0.5 rounded">
                        Master Slide
                      </span>
                      <span className="text-[9px] font-mono text-gray-400">16:9 HD</span>
                    </div>
                    <div className="space-y-1 my-1">
                      <div className="text-[11px] font-heading font-black text-[#111111] line-clamp-1">
                        {activeProjectTitle}
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <div className="w-16 h-1.5 bg-[#FCBF14] rounded-full" />
                        <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 font-bold flex items-center justify-between border-t border-gray-100 pt-1.5">
                      <span>Enterprise Deck</span>
                      <span className="text-emerald-700 font-black">Ready</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 3 Metric Cards Row (Metric goal, Project Milestone, Presentation formats) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Card 1: Metric goal */}
                <div className="bg-gradient-to-b from-white to-[#FFFDF7] border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[220px]">
                  <h4 className="text-xs sm:text-sm font-heading font-black text-[#111111]">
                    Metric goal
                  </h4>
                  
                  {/* Circular Donut Gauge: Available Design Credits */}
                  <div className="relative w-28 h-28 my-2 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#F3F4F6"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#E5A817"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={creditStrokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-heading font-black text-[#111111]">
                        {quotaRemaining} <span className="text-xs text-[#726F6D]">/ {quotaTotal}</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#726F6D]">
                    Available Design Credits
                  </p>
                </div>

                {/* Card 2: Project Milestone: */}
                <div className="bg-gradient-to-b from-white to-[#FFFDF7] border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[220px]">
                  <h4 className="text-xs sm:text-sm font-heading font-black text-[#111111]">
                    Project Milestone:
                  </h4>
                  
                  {/* Circular Donut Gauge: 75% Polished */}
                  <div className="relative w-28 h-28 my-2 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#F3F4F6"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        stroke="#E5A817"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={milestoneStrokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-heading font-black text-[#111111]">
                        75%
                      </span>
                      <span className="text-[10px] font-bold text-[#726F6D]">
                        Polished
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#726F6D]">
                    (Draft 2 Ready)
                  </p>
                </div>

                {/* Card 3: Presentation formats */}
                <div className="bg-gradient-to-b from-white to-[#FFFDF7] border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
                  <h4 className="text-xs sm:text-sm font-heading font-black text-[#111111] text-center">
                    Presentation formats
                  </h4>
                  
                  {/* 3 Progress Bars */}
                  <div className="space-y-3.5 my-2">
                    
                    {/* PowerPoint */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                        <span>PowerPoint (.pptx)</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#E5A817] h-full rounded-full transition-all duration-500" style={{ width: "85%" }} />
                      </div>
                    </div>

                    {/* Keynote */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                        <span>Keynote (.key)</span>
                        <span>50%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#E5A817] h-full rounded-full transition-all duration-500" style={{ width: "50%" }} />
                      </div>
                    </div>

                    {/* Google Slides */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                        <span>Google Slides</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#E5A817] h-full rounded-full transition-all duration-500" style={{ width: "40%" }} />
                      </div>
                    </div>

                  </div>

                  <div className="text-[11px] text-center text-[#726F6D] font-medium pt-1">
                    Multi-software deliverables enabled
                  </div>
                </div>

              </div>

              {/* Recent Presentation Deliverables */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-black text-sm sm:text-base text-[#111111]">
                    Recent Presentation Deliverables
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("purchased")}
                    className="text-xs font-bold text-[#726F6D] hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-3">
                  {deliverablesToDisplay.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200/90 rounded-2xl p-4 flex items-center justify-between hover:border-primary/60 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl ${item.thumbnailBg} border border-gray-200 flex items-center justify-center shrink-0`}>
                          <FileText size={18} className={item.thumbnailBg.includes("181818") ? "text-amber-400" : "text-[#111111]"} />
                        </div>
                        <div>
                          <h4 className="font-heading font-black text-xs sm:text-sm text-[#111111]">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[#726F6D] font-medium">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hex-pill bg-white hover:bg-gray-50 text-[#111111] border border-gray-300 px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VIEW: MY PURCHASED DECKS */}
          {activeTab === "purchased" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#111111]">
                    My Purchased Presentation Decks
                  </h2>
                  <p className="text-xs text-[#726F6D]">
                    Direct commercial licenses and deliverables ready for download
                  </p>
                </div>
                <Link
                  to="/#templates"
                  className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-xs"
                >
                  Browse Store Catalog <ArrowRight size={13} />
                </Link>
              </div>

              {allPurchasedDeliverables.length === 0 ? (
                <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-3xl">
                  <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-[#111111]">No purchases or deliverables recorded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPurchasedDeliverables.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl ${item.thumbnailBg} flex items-center justify-center shrink-0`}>
                            <FileText size={20} className={item.thumbnailBg.includes("181818") ? "text-amber-400" : "text-[#111111]"} />
                          </div>
                          <div>
                            <h4 className="font-heading font-black text-sm text-[#111111]">
                              {item.title}
                            </h4>
                            <p className="text-xs text-[#726F6D]">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        {item.isCustomProject && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-[#FCBF14] px-2 py-0.5 rounded-full shrink-0">
                            Custom Master
                          </span>
                        )}
                      </div>
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black py-2.5 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Download size={14} /> Download Presentation Files (.pptx)
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: CUSTOM PROJECTS */}
          {activeTab === "custom" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#111111]">
                    Custom Presentation Projects
                  </h2>
                  <p className="text-xs text-[#726F6D]">
                    Commission progress, milestone reviews, and executive polish
                  </p>
                </div>
                <Link
                  to="/services"
                  className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-xs"
                >
                  Start New Brief <ArrowRight size={13} />
                </Link>
              </div>

              {userOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF9E8] border border-primary/30 text-[#111111] flex items-center justify-center mx-auto">
                    <Briefcase size={26} />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="font-heading font-black text-base text-[#111111]">
                      No custom projects commissioned yet
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Have a high-stakes investor pitch deck or keynote? Submit your brief to our bespoke presentation studio.
                    </p>
                  </div>
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 hex-pill bg-primary hover:bg-primary/90 text-[#111111] font-black text-xs px-6 py-2.5 shadow-sm"
                  >
                    Commission Presentation Deck <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {userOrders.map((order, idx) => {
                    const title = order.project_title || order.service_type || `Custom Presentation #${idx + 1}`;
                    const isDelivered = order.status === "completed" || order.status === "delivered";
                    const milestoneText = isDelivered
                      ? "Completed & Delivered"
                      : order.status === "draft_1"
                      ? "Draft 1 (Blueprint)"
                      : order.status === "draft_2"
                      ? "Draft 2 (Design Alignment)"
                      : order.status === "polish"
                      ? "Final Polish"
                      : "In Review";
                    const progressPercent = isDelivered
                      ? 100
                      : order.status === "draft_1"
                      ? 35
                      : order.status === "draft_2"
                      ? 70
                      : 85;

                    return (
                      <div
                        key={order.id || idx}
                        className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber bg-primary/20 px-2 py-0.5 rounded">
                                {order.service_type || "Custom Presentation"}
                              </span>
                              {order.rush_delivery && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                  Rush 24h
                                </span>
                              )}
                            </div>
                            <h3 className="font-heading font-black text-base text-[#111111] mt-1.5">
                              {title}
                            </h3>
                            <p className="text-xs text-[#726F6D]">
                              Brief submitted: {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Active cycle"}
                              {order.slide_count ? ` • ${order.slide_count} slides` : ""}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                              isDelivered
                                ? "text-emerald-800 bg-emerald-100"
                                : "text-amber-800 bg-amber-100"
                            }`}
                          >
                            {milestoneText}
                          </span>
                        </div>

                        {/* Progress Stepper */}
                        <div className="py-2">
                          <div className="flex justify-between text-xs font-bold text-[#111111] mb-2">
                            <span>Milestone Progress</span>
                            <span>{progressPercent}% Polished</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Master Deliverable Download Box (If Admin Attached Deliverable) */}
                        {order.deliverable_url ? (
                          <div className="bg-[#FEF5DC] border border-[#FCBF14]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#FCBF14] text-[#111111] flex items-center justify-center font-bold shrink-0">
                                <Download size={20} />
                              </div>
                              <div>
                                <h5 className="font-heading font-black text-sm text-[#111111]">
                                  {order.deliverable_name || "Final Master Presentation (.pptx)"}
                                </h5>
                                <p className="text-xs text-[#726F6D]">
                                  Studio delivery verified • Full commercial license included
                                </p>
                              </div>
                            </div>
                            <a
                              href={order.deliverable_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto hex-pill bg-[#111111] hover:bg-black text-white text-xs font-black px-5 py-2.5 flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
                            >
                              <Download size={14} /> Download Final Master (.pptx)
                            </a>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-[#726F6D]">
                              Final master deliverables will appear here upon studio milestone completion.
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              In Production
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs">
                          <span className="text-[#726F6D]">
                            Need changes? Request rapid turnaround with your dedicated studio team.
                          </span>
                          <a
                            href={`https://wa.me/${studioWhatsapp}?text=Inquiring%20about%20my%20brief%20${encodeURIComponent(title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hex-pill bg-[#111111] hover:bg-black text-white font-bold px-4 py-2 flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
                          >
                            <MessageCircle size={13} /> Chat with Lead Designer
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: TEMPLATE MARKETPLACE */}
          {activeTab === "marketplace" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#111111]">
                    SlideBee Template Marketplace
                  </h2>
                  <p className="text-xs text-[#726F6D]">
                    Browse over 100+ executive presentation master decks
                  </p>
                </div>
                <Link
                  to="/#templates"
                  className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-5 py-2.5 flex items-center gap-1.5 shadow-xs"
                >
                  Explore Full Catalog <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultDeliverables.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-3xl p-5 bg-white space-y-3 shadow-2xs">
                    <div className="h-36 rounded-2xl bg-gray-100 flex items-center justify-center font-heading font-black text-sm text-gray-400">
                      Slide Artwork Preview
                    </div>
                    <h4 className="font-heading font-black text-sm text-[#111111]">{item.title}</h4>
                    <p className="text-xs text-[#726F6D]">Enterprise Keynote & PPTX Master</p>
                    <Link
                      to="/#templates"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-amber hover:underline"
                    >
                      View Template Details <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: CREDIT LEDGER & ACCOUNT */}
          {activeTab === "ledger" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-heading font-black text-[#111111]">
                  Design Credit Ledger & Account
                </h2>
                <p className="text-xs text-[#726F6D]">
                  Audit trail of template credits, monthly resets, and account controls
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
                  <span className="text-[10px] font-black uppercase text-[#726F6D] block">Current Membership</span>
                  <span className="text-lg font-heading font-black text-[#111111] capitalize">{userTier} Plan</span>
                </div>
                <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
                  <span className="text-[10px] font-black uppercase text-[#726F6D] block">Available Quota</span>
                  <span className="text-lg font-heading font-black text-[#111111]">{quotaRemaining} / {quotaTotal} remaining</span>
                </div>
                <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
                  <span className="text-[10px] font-black uppercase text-[#726F6D] block">Downloaded Decks</span>
                  <span className="text-lg font-heading font-black text-[#111111]">{quotaUsed} consumed</span>
                </div>
              </div>

              {onDeleteAccount && (
                <div className="p-6 rounded-3xl border border-red-200 bg-red-50/40 flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-black text-sm text-red-700">Account Erasure</h4>
                    <p className="text-xs text-red-900/70">Permanently delete account credentials and download licenses</p>
                  </div>
                  <button
                    type="button"
                    onClick={onDeleteAccount}
                    className="hex-pill bg-white text-red-600 border border-red-200 text-xs font-bold px-4 py-2 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete Account
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ======================================================================= */}
        {/* COLUMN 3: RIGHT SIDEBAR (Matching Reference Mockup)                     */}
        {/* ======================================================================= */}
        <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-100 p-6 sm:p-7 shrink-0 bg-white flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            
            {/* Top Right Header Controls: (?) Help, (Bell) Notifications, Avatar + Caret */}
            <div className="flex items-center justify-end gap-3.5">
              
              {/* Help Button */}
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#111111] transition-colors cursor-pointer"
                title="Help and Documentation"
              >
                <HelpCircle size={16} />
              </button>

              {/* Notification Bell with Interactive Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen((prev) => !prev);
                    setUnreadNotifications(false);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isNotificationsOpen ? "bg-[#FCBF14] text-[#111111]" : "bg-gray-100 hover:bg-gray-200 text-[#111111]"
                  }`}
                  title="Notifications"
                >
                  <Bell size={16} />
                </button>
                {unreadNotifications && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}

                {/* Notification Dropdown Popover */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-12 w-80 sm:w-88 bg-white border border-[#111111]/10 rounded-3xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-xs text-[#111111]">Notifications</span>
                        <span className="text-[10px] bg-primary/20 text-[#111111] px-1.5 py-0.5 rounded-full font-bold">
                          {notifications.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-gray-400 hover:text-[#111111] text-xs font-bold cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.tab) setActiveTab(n.tab);
                            setIsNotificationsOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-gray-50 hover:bg-[#FFF9EC] border border-gray-100 hover:border-primary/40 transition-all cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber">
                              {n.category}
                            </span>
                            <span className="text-[10px] text-gray-400">{n.time}</span>
                          </div>
                          <p className="text-xs font-bold text-[#111111] leading-snug">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[#726F6D]">
                            {n.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Avatar with Chevron */}
              <div className="flex items-center gap-1.5 pl-1 cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-heading font-black text-xs text-primary-amber">
                  {clientName[0]?.toUpperCase() || "S"}
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </div>

            </div>

            {/* Calendar Section: Project Milestone Header & Days Grid */}
            <div className="space-y-3 pt-2">
              
              {/* Calendar Header with < > Controls */}
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-black text-sm text-[#111111]">
                  Project Milestone
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Weekday Letters: S M T W T F S */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* September Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                {calendarDays.map((item, idx) => {
                  if (item.empty) {
                    return <span key={idx} className="py-1.5" />;
                  }

                  const isSelected = item.day === selectedCalendarDate;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCalendarDate(item.day as number)}
                      className="relative py-1.5 flex flex-col items-center justify-center transition-all cursor-pointer"
                    >
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition-all text-xs ${
                          isSelected
                            ? "bg-[#2A2A2A] text-white font-black shadow-xs"
                            : "hover:bg-gray-100 text-[#111111]"
                        }`}
                      >
                        {item.day}
                      </span>
                      {/* Milestone Gold Dot Indicator (e.g. Day 15) */}
                      {item.hasDot && !isSelected && (
                        <span className="w-1 h-1 bg-[#E5A817] rounded-full mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Active Project Highlight Card (Soft Honey Cream Card) */}
            <div className="bg-[#FFF9EC] border border-[#F4DC9E] rounded-3xl p-5 space-y-3 shadow-2xs">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  {activeOrder?.status === "completed" || activeOrder?.status === "delivered" ? "Delivered" : "Active Brief"}
                </span>
                <h4 className="font-heading font-black text-sm sm:text-base text-[#111111]">
                  {activeProjectTitle}
                </h4>
                <p className="text-xs text-[#726F6D]">
                  {activeOrder?.service_type || "Executive presentation design studio"}
                </p>
              </div>

              {/* Clock Timer */}
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111111]">
                <Clock size={13} className="text-[#111111]" />
                <span>{activeOrder?.rush_delivery ? "Rush 24h Turnaround" : "48h Standard Delivery"}</span>
              </div>

              {/* Dual Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const waUrl = `https://wa.me/${studioWhatsapp}?text=Hi%20SlideBee,%20requesting%20revision%20for%20${encodeURIComponent(activeProjectTitle)}`;
                    window.open(waUrl, "_blank");
                  }}
                  className="w-full bg-[#151515] hover:bg-black text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  Request Revision / Chat
                </button>
                {activeOrder?.deliverable_url ? (
                  <a
                    href={activeOrder.deliverable_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#F5B921] hover:bg-[#E0A71B] text-[#111111] font-black text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Download size={13} /> Download Final Master (.pptx)
                  </a>
                ) : (
                  <div className="w-full bg-white/80 text-[#726F6D] border border-dashed border-[#ECCF87] font-bold text-[11px] py-2.5 rounded-xl text-center">
                    Milestone: {activeMilestone}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Logout Button at bottom of Right Sidebar */}
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
