import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  LayoutGrid,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import SlideBeeLogo from "../../../components/SlideBeeLogo";

export type DashboardTab = "overview" | "purchased" | "custom" | "marketplace" | "ledger";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  purchasedCount: number;
  ordersCount: number;
  userTier: string;
  studioWhatsapp: string;
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  purchasedCount,
  ordersCount,
  userTier,
  studioWhatsapp,
}: DashboardSidebarProps) {
  return (
    <div className="w-full xl:w-72 border-b xl:border-b-0 xl:border-r border-gray-100 p-6 sm:p-7 flex flex-col justify-between shrink-0 bg-white">
      <div className="space-y-8">
        {/* SlideBee Logo */}
        <div className="flex items-center justify-between px-1">
          <Link to="/" className="flex items-center">
            <SlideBeeLogo variant="light" size="sm" />
          </Link>
          <div className="xl:hidden">
            <a
              href={`https://wa.me/${studioWhatsapp}?text=Hi%20SlideBee,%20inquiring%20about%20my%20presentation%20dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="hex-pill bg-primary text-[#111111] font-bold text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-xs min-h-[36px]"
            >
              <MessageCircle size={14} /> VIP Chat
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-row xl:flex-col gap-2 overflow-x-auto no-scrollbar touch-pan-x pb-2 xl:pb-0 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`shrink-0 w-auto xl:w-full min-h-[44px] flex items-center justify-between px-3.5 xl:px-4 py-2.5 xl:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
            }`}
          >
            <div className="flex items-center gap-2 xl:gap-3">
              <LayoutDashboard
                size={18}
                className={activeTab === "overview" ? "text-primary-amber" : "text-[#726F6D]"}
              />
              <span>Overview</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("purchased")}
            className={`shrink-0 w-auto xl:w-full min-h-[44px] flex items-center justify-between px-3.5 xl:px-4 py-2.5 xl:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap gap-2 ${
              activeTab === "purchased"
                ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
            }`}
          >
            <div className="flex items-center gap-2 xl:gap-3">
              <FileText
                size={18}
                className={activeTab === "purchased" ? "text-primary-amber" : "text-[#726F6D]"}
              />
              <span>My Decks</span>
            </div>
            {purchasedCount > 0 && (
              <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">
                {purchasedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`shrink-0 w-auto xl:w-full min-h-[44px] flex items-center justify-between px-3.5 xl:px-4 py-2.5 xl:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap gap-2 ${
              activeTab === "custom"
                ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
            }`}
          >
            <div className="flex items-center gap-2 xl:gap-3">
              <Briefcase
                size={18}
                className={activeTab === "custom" ? "text-primary-amber" : "text-[#726F6D]"}
              />
              <span>Custom Projects</span>
            </div>
            {ordersCount > 0 && (
              <span className="text-[10px] bg-primary text-[#111111] px-2 py-0.5 rounded-full font-bold">
                {ordersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("marketplace")}
            className={`shrink-0 w-auto xl:w-full min-h-[44px] flex items-center justify-between px-3.5 xl:px-4 py-2.5 xl:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "marketplace"
                ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
            }`}
          >
            <div className="flex items-center gap-2 xl:gap-3">
              <LayoutGrid
                size={18}
                className={activeTab === "marketplace" ? "text-primary-amber" : "text-[#726F6D]"}
              />
              <span>Marketplace</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`shrink-0 w-auto xl:w-full min-h-[44px] flex items-center justify-between px-3.5 xl:px-4 py-2.5 xl:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap gap-2 ${
              activeTab === "ledger"
                ? "bg-[#FEF5DC] text-[#111111] font-extrabold border border-[#FCBF14]/40 shadow-xs"
                : "text-[#726F6D] hover:bg-gray-50 hover:text-[#111111]"
            }`}
          >
            <div className="flex items-center gap-2 xl:gap-3">
              <CreditCard
                size={18}
                className={activeTab === "ledger" ? "text-primary-amber" : "text-[#726F6D]"}
              />
              <span>Plan & Quota</span>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {userTier}
            </span>
          </button>
        </nav>
      </div>

      {/* VIP Studio Hotline */}
      <div className="hidden xl:block mt-8 pt-4">
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
  );
}
