import React from "react";
import { Crown, Award } from "lucide-react";

interface SubscriptionsMetricStripProps {
  totalClients: number;
  activeVips: number;
  lifetimeCount: number;
  freeCount: number;
}

export const SubscriptionsMetricStrip: React.FC<SubscriptionsMetricStripProps> = ({
  totalClients,
  activeVips,
  lifetimeCount,
  freeCount
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      <div className="hex-card bg-white border border-[#111111]/8 p-5 shadow-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
          Total Client Accounts
        </span>
        <div className="text-3xl font-heading font-black text-[#111111]">
          {totalClients}
        </div>
        <span className="text-[11px] text-[#726F6D] font-medium mt-0.5 block">
          Registered founders & studio clients
        </span>
      </div>

      <div className="hex-card bg-white border border-[#111111]/8 p-5 shadow-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
          Monthly & Yearly VIPs
        </span>
        <div className="text-3xl font-heading font-black text-amber-600 flex items-center gap-2">
          {activeVips}
          <Crown size={20} className="text-amber-500" />
        </div>
        <span className="text-[11px] text-[#726F6D] font-medium mt-0.5 block">
          30 monthly / 360 yearly downloads
        </span>
      </div>

      <div className="hex-card bg-white border border-[#111111]/8 p-5 shadow-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
          Lifetime All-Access
        </span>
        <div className="text-3xl font-heading font-black text-amber-700 flex items-center gap-2">
          {lifetimeCount}
          <Award size={20} className="text-amber-600" />
        </div>
        <span className="text-[11px] text-[#726F6D] font-medium mt-0.5 block">
          Unlimited downloads & VIP atelier forever
        </span>
      </div>

      <div className="hex-card bg-white border border-[#111111]/8 p-5 shadow-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
          Free Community Tier
        </span>
        <div className="text-3xl font-heading font-black text-[#111111]">
          {freeCount}
        </div>
        <span className="text-[11px] text-[#726F6D] font-medium mt-0.5 block">
          3 community deck downloads / day
        </span>
      </div>
    </div>
  );
};
