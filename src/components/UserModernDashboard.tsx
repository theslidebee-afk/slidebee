import React, { useState } from "react";
import { Search } from "lucide-react";
import {
  DashboardSidebar,
  DashboardRightSidebar,
  DashboardOverviewTab,
  DashboardPurchasedTab,
  DashboardCustomTab,
  DashboardMarketplaceTab,
  DashboardLedgerTab,
  type DashboardTab,
} from "../features/dashboard";

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
  proDaysRemaining: _proDaysRemaining,
  isProUser: _isProUser,
  isProExpired: _isProExpired,
  handleLogout,
  studioWhatsapp = "919876543210",
  onDeleteAccount,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const clientName =
    userProfile?.full_name ||
    currentUser.user_metadata?.full_name ||
    currentUser.email.split("@")[0];

  // Quota metrics calculation
  const quotaTotal = userTier === "free" ? 3 : userTier === "lifetime" ? 45 : 30;
  const quotaUsed = userTier === "free" ? downloadsToday : downloadsThisMonth;
  const quotaRemaining = userTier === "free" ? remainingFreeToday : remainingPremiumThisMonth;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaTotal) * 100));

  // Circular gauge SVG calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const creditGaugePercent = quotaPercent > 0 ? 100 - quotaPercent : 76;
  const creditStrokeDashoffset = circumference - (creditGaugePercent / 100) * circumference;

  const milestoneGaugePercent = 75;
  const milestoneStrokeDashoffset = circumference - (milestoneGaugePercent / 100) * circumference;

  // Active custom order
  const activeOrder =
    userOrders.find((o) => o.status !== "completed" && o.status !== "delivered") || userOrders[0];

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
      downloadUrl:
        "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/downloads/sequoia_pitch.pptx",
      thumbnailBg: "bg-[#181818]",
    },
    {
      id: "deck-2",
      title: "Executive KPI Dashboard",
      subtitle: "18 slides, PPTX",
      downloadUrl:
        "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/downloads/kpi_dashboard.pptx",
      thumbnailBg: "bg-[#F3F4F6]",
    },
  ];

  const customOrderDeliverables = userOrders
    .filter((o) => Boolean(o.deliverable_url))
    .map((o, i) => ({
      id: o.id || `custom-deliverable-${i}`,
      title: o.deliverable_name || o.project_title || o.service_type || "Custom Master Presentation",
      subtitle: `${o.slide_count || "Custom"} slides, Final PPTX Master, Delivered`,
      downloadUrl: o.deliverable_url,
      thumbnailBg: "bg-[#181818]",
      isCustomProject: true,
    }));

  const allPurchasedDeliverables = [
    ...customOrderDeliverables,
    ...purchasedItems.map((p, i) => ({
      id: p.id || `purchased-${i}`,
      title: p.title || p.template_title || p.template_name || `SlideDeck #${i + 1}`,
      subtitle: `${p.slide_count || 24} slides, PPTX, ${p.file_size || "18 MB"}`,
      downloadUrl: p.download_url || "#",
      thumbnailBg: (i + customOrderDeliverables.length) % 2 === 0 ? "bg-[#181818]" : "bg-[#F3F4F6]",
      isCustomProject: false,
    })),
  ];

  const deliverablesToDisplay =
    allPurchasedDeliverables.length > 0
      ? allPurchasedDeliverables.slice(0, 4)
      : defaultDeliverables;

  return (
    <div className="relative min-h-screen bg-[#FFF8E7] text-[#111111] overflow-hidden flex justify-center items-start pt-16 sm:pt-20 pb-16 px-3 sm:px-6 lg:px-8">
      {/* Background Graphic matching user reference mockup */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
      />

      {/* Main Floating Dashboard Container */}
      <div className="relative z-10 w-full max-w-[1560px] bg-white rounded-[32px] sm:rounded-[44px] shadow-[0_25px_80px_rgba(215,160,25,0.18),0_10px_30px_rgba(0,0,0,0.06)] border border-[#ECCF87]/40 overflow-hidden flex flex-col xl:flex-row min-h-[850px]">
        {/* Column 1: Left Sidebar Navigation */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          purchasedCount={purchasedItems.length}
          ordersCount={userOrders.length}
          userTier={userTier}
          studioWhatsapp={studioWhatsapp}
        />

        {/* Column 2: Center Main Content Area */}
        <div className="flex-1 min-w-0 p-6 sm:p-8 lg:p-9 space-y-6 overflow-y-auto">
          {/* Top Search Bar */}
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

          {activeTab === "overview" && (
            <DashboardOverviewTab
              clientName={clientName}
              activeProjectTitle={activeProjectTitle}
              activeMilestone={activeMilestone}
              quotaTotal={quotaTotal}
              quotaRemaining={quotaRemaining}
              userTier={userTier}
              creditStrokeDashoffset={creditStrokeDashoffset}
              milestoneStrokeDashoffset={milestoneStrokeDashoffset}
              radius={radius}
              circumference={circumference}
              deliverablesToDisplay={deliverablesToDisplay}
              onViewAllPurchased={() => setActiveTab("purchased")}
            />
          )}

          {activeTab === "purchased" && (
            <DashboardPurchasedTab allPurchasedDeliverables={allPurchasedDeliverables} />
          )}

          {activeTab === "custom" && (
            <DashboardCustomTab userOrders={userOrders} studioWhatsapp={studioWhatsapp} />
          )}

          {activeTab === "marketplace" && (
            <DashboardMarketplaceTab defaultDeliverables={defaultDeliverables} />
          )}

          {activeTab === "ledger" && (
            <DashboardLedgerTab
              userTier={userTier}
              quotaRemaining={quotaRemaining}
              quotaTotal={quotaTotal}
              quotaUsed={quotaUsed}
              onDeleteAccount={onDeleteAccount}
            />
          )}
        </div>

        {/* Column 3: Right Sidebar */}
        <DashboardRightSidebar
          clientName={clientName}
          activeOrder={activeOrder}
          activeProjectTitle={activeProjectTitle}
          activeMilestone={activeMilestone}
          studioWhatsapp={studioWhatsapp}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default UserModernDashboard;
