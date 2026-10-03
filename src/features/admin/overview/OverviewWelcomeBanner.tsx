import React from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

interface OverviewWelcomeBannerProps {
  ordersCount: number;
  templatesCount: number;
  activeProCount: number;
  remainingGB: string;
  setActiveTab: (tab: "overview" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions") => void;
}

export const OverviewWelcomeBanner: React.FC<OverviewWelcomeBannerProps> = ({
  ordersCount,
  templatesCount,
  activeProCount,
  remainingGB,
  setActiveTab,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-primary/20">
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-[#FCBF14]/20 border border-[#FCBF14]/40 px-3 py-1 rounded-full text-[#FCBF14] text-[11px] font-black uppercase tracking-wider mb-3">
          <Crown size={12} /> SlideBee Executive Studio
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white mb-2">
          Welcome back, Master Admin!
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Live telemetry for SlideBee presentation commissions, template downloads, and client subscriptions. Synced in real-time with Cloudflare D1.
        </p>

        {/* Inline Stats Counter with Clickable Links */}
        <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab("orders"); navigate("/admin/orders"); }}
            className="text-left group cursor-pointer"
          >
            <span className="text-gray-400 group-hover:text-primary-amber block text-[10px] uppercase font-bold transition-colors">
              Active Briefs →
            </span>
            <span className="font-heading font-black text-lg text-white group-hover:text-primary-amber transition-colors">
              {ordersCount}
            </span>
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            type="button"
            onClick={() => { setActiveTab("templates"); navigate("/admin/templates"); }}
            className="text-left group cursor-pointer"
          >
            <span className="text-gray-400 group-hover:text-primary-amber block text-[10px] uppercase font-bold transition-colors">
              Store Catalog →
            </span>
            <span className="font-heading font-black text-lg text-white group-hover:text-primary-amber transition-colors">
              {templatesCount} Decks
            </span>
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            type="button"
            onClick={() => { setActiveTab("subscriptions"); navigate("/admin/subscriptions"); }}
            className="text-left group cursor-pointer"
          >
            <span className="text-gray-400 group-hover:text-primary-amber block text-[10px] uppercase font-bold transition-colors">
              Pro Retainers →
            </span>
            <span className="font-heading font-black text-lg text-[#FCBF14] group-hover:underline">
              {activeProCount} VIP
            </span>
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            type="button"
            onClick={() => { setActiveTab("storage"); navigate("/admin/storage"); }}
            className="text-left group cursor-pointer"
          >
            <span className="text-gray-400 group-hover:text-primary-amber block text-[10px] uppercase font-bold transition-colors">
              Storage Free →
            </span>
            <span className="font-heading font-black text-lg text-white group-hover:text-primary-amber transition-colors">
              {remainingGB} GB
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
