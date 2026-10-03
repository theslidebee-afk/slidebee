import React from "react";
import { useNavigate } from "react-router-dom";

interface OverviewKpiCardsProps {
  orders: any[];
  templates: any[];
  registeredClientsCount: number;
  activeProSubscribers: any[];
  remainingGB: string;
  setActiveTab: (tab: "overview" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions") => void;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  orders,
  templates,
  registeredClientsCount,
  activeProSubscribers,
  remainingGB,
  setActiveTab,
}) => {
  const navigate = useNavigate();

  // Top categories calculation
  const categoryCounts = templates.reduce((acc: Record<string, number>, t: any) => {
    const cat = t.category || "Pitch Decks";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      count: count as number,
      percent: templates.length > 0 ? Math.min(100, Math.round(((count as number) / templates.length) * 100)) : 25
    }));
  const displayCategories = topCategories.length > 0 ? topCategories : [
    { name: "Pitch Decks", count: 18, percent: 45 },
    { name: "Executive Keynotes", count: 12, percent: 30 },
    { name: "Sales Collateral", count: 8, percent: 20 },
    { name: "Board Reviews", count: 5, percent: 12 }
  ];

  // Donut gauge calculations
  const totalBriefsCount = orders.length;
  const deliveredBriefsCount = orders.filter(o => o.status === "completed" || o.status === "delivered").length;
  const fulfillmentRate = totalBriefsCount > 0 ? Math.round((deliveredBriefsCount / totalBriefsCount) * 100) : 100;
  const gaugeCircumference = 2 * Math.PI * 38;
  const fulfillmentOffset = gaugeCircumference - (fulfillmentRate / 100) * gaugeCircumference;

  const proConversionRate = registeredClientsCount > 0 ? Math.min(100, Math.round((activeProSubscribers.length / registeredClientsCount) * 100)) : 0;
  const proOffset = gaugeCircumference - (proConversionRate / 100) * gaugeCircumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Order Fulfillment */}
      <div className="bg-white border border-[#111111]/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#726F6D]">
            Brief Fulfillment
          </span>
          <button
            type="button"
            onClick={() => { setActiveTab("orders"); navigate("/admin/orders"); }}
            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            {deliveredBriefsCount} Delivered →
          </button>
        </div>
        <div className="flex items-center gap-6 my-2">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" stroke="#F3F4F6" strokeWidth="8" fill="none" />
              <circle
                cx="45"
                cy="45"
                r="38"
                stroke="#FCBF14"
                strokeWidth="8"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={fulfillmentOffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-heading font-black text-[#111111]">
                {fulfillmentRate}%
              </span>
              <span className="text-[9px] font-bold text-[#726F6D]">Done</span>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-[#111111]">Delivery Rate</p>
            <button
              type="button"
              onClick={() => {
                setActiveTab("orders");
                navigate("/admin/orders");
              }}
              className="text-[11px] text-[#726F6D] hover:text-[#111111] hover:underline block text-left cursor-pointer"
            >
              {orders.filter(o => o.status === "pending").length} pending review
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("orders");
                navigate("/admin/orders");
              }}
              className="text-[11px] text-amber-700 font-bold hover:underline block text-left cursor-pointer"
            >
              {orders.filter(o => o.status === "in_progress").length} in design
            </button>
          </div>
        </div>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#726F6D]">
          <button
            type="button"
            onClick={() => { setActiveTab("orders"); navigate("/admin/orders"); }}
            className="hover:text-[#111111] hover:underline cursor-pointer"
          >
            Manage Briefs
          </button>
          <strong className="text-[#111111]">{orders.length} commissions</strong>
        </div>
      </div>

      {/* Card 2: Pro VIP Retainers */}
      <div className="bg-white border border-[#111111]/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-[#726F6D]">
            Client Pro Retainers
          </span>
          <button
            type="button"
            onClick={() => { setActiveTab("subscriptions"); navigate("/admin/subscriptions"); }}
            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            {activeProSubscribers.length} Active →
          </button>
        </div>
        <div className="flex items-center gap-6 my-2">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" stroke="#F3F4F6" strokeWidth="8" fill="none" />
              <circle
                cx="45"
                cy="45"
                r="38"
                stroke="#111111"
                strokeWidth="8"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={proOffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-heading font-black text-[#111111]">
                {proConversionRate}%
              </span>
              <span className="text-[9px] font-bold text-[#726F6D]">Pro</span>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-extrabold text-[#111111]">Pro Membership Health</p>
            <button
              type="button"
              onClick={() => { setActiveTab("subscriptions"); navigate("/admin/subscriptions"); }}
              className="text-[11px] text-[#726F6D] hover:text-[#111111] hover:underline block text-left cursor-pointer"
            >
              {registeredClientsCount} client accounts
            </button>
            <p className="text-[11px] text-emerald-700 font-bold">
              Subscriptions healthy
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#726F6D]">
          <button
            type="button"
            onClick={() => { setActiveTab("subscriptions"); navigate("/admin/subscriptions"); }}
            className="hover:text-[#111111] hover:underline cursor-pointer"
          >
            All Clients →
          </button>
          <strong className="text-[#111111]">{registeredClientsCount} accounts</strong>
        </div>
      </div>

      {/* Card 3: Template Catalog Breakdown */}
      <div className="bg-white border border-[#111111]/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#726F6D]">
            Catalog Breakdown
          </span>
          <button
            type="button"
            onClick={() => { setActiveTab("templates"); navigate("/admin/templates"); }}
            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/20 text-[#111111] hover:bg-primary transition-colors cursor-pointer"
          >
            {templates.length} Decks →
          </button>
        </div>
        <div className="space-y-2.5 my-2">
          {displayCategories.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveTab("templates");
                navigate("/admin/templates");
              }}
              className="w-full text-left space-y-1 group cursor-pointer"
            >
              <div className="flex justify-between text-[11px] font-bold text-[#111111] group-hover:text-primary-amber transition-colors">
                <span>{cat.name}</span>
                <span className="text-[#726F6D] font-mono">{cat.count} ({cat.percent}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.percent}%` }}
                />
              </div>
            </button>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#726F6D]">
          <button
            type="button"
            onClick={() => { setActiveTab("storage"); navigate("/admin/storage"); }}
            className="hover:text-[#111111] hover:underline cursor-pointer"
          >
            R2 Storage Quota
          </button>
          <strong className="text-[#111111]">{remainingGB} GB free</strong>
        </div>
      </div>
    </div>
  );
};
