import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  Layers, 
  Sliders, 
  DollarSign, 
  HardDrive, 
  LayoutDashboard, 
  Crown, 
  Search 
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const AdminNavigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    orders,
    templates,
    profiles,
    subscriptions,
    storageStats,
    searchTerm,
    setSearchTerm
  } = useAdmin();
  const navigate = useNavigate();

  const registeredClientsCount = profiles.filter(
    (p) => (p.role === "client" || !p.role) && p.email?.toLowerCase().trim() !== "admin@theslidebee.com"
  ).length;

  const activeProSubscribers = subscriptions.filter((s) => s.status === "active");

  const totalR2QuotaMB = 10240;
  const remainingMB = Math.max(0, totalR2QuotaMB - storageStats.totalUsedMB);
  const remainingGB = (remainingMB / 1024).toFixed(2);
  const percentUsed = ((storageStats.totalUsedMB / totalR2QuotaMB) * 100).toFixed(1);

  const handleNav = (tab: "overview" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions", path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  return (
    <div className="space-y-6">
      {/* 6 Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Briefs */}
        <div 
          onClick={() => handleNav("orders", "/admin/orders")}
          className="bg-white border border-[#111111]/10 p-4 rounded-2xl shadow-xs cursor-pointer hover:border-primary transition-all"
        >
          <div className="flex items-center justify-between text-primary-amber mb-1.5">
            <ShoppingBag size={18} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
              Briefs
            </span>
          </div>
          <div className="text-2xl font-heading font-black text-[#111111]">
            {orders.length}
          </div>
          <span className="text-[10px] text-[#726F6D] font-medium block">
            {orders.filter(o => o.status === "pending").length} pending
          </span>
        </div>

        {/* Templates */}
        <div 
          onClick={() => handleNav("templates", "/admin/templates")}
          className="bg-white border border-[#111111]/10 p-4 rounded-2xl shadow-xs cursor-pointer hover:border-primary transition-all"
        >
          <div className="flex items-center justify-between text-primary-amber mb-1.5">
            <Layers size={18} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
              Templates
            </span>
          </div>
          <div className="text-2xl font-heading font-black text-[#111111]">
            {templates.length}
          </div>
          <span className="text-[10px] text-[#726F6D] font-medium block">
            In Store CMS
          </span>
        </div>

        {/* Clients & Pro */}
        <div 
          onClick={() => handleNav("subscriptions", "/admin/subscriptions")}
          className="bg-white border border-[#111111]/10 p-4 rounded-2xl shadow-xs cursor-pointer hover:border-primary transition-all"
        >
          <div className="flex items-center justify-between text-primary-amber mb-1.5">
            <Crown size={18} className="text-amber-500" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
              Clients & Pro
            </span>
          </div>
          <div className="text-2xl font-heading font-black text-[#111111]">
            {registeredClientsCount}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            {activeProSubscribers.length} Active Pro VIP
          </span>
        </div>

        {/* Site CMS */}
        <div 
          onClick={() => handleNav("customization", "/admin/customization")}
          className="bg-white border border-[#111111]/10 p-4 rounded-2xl shadow-xs cursor-pointer hover:border-primary transition-all"
        >
          <div className="flex items-center justify-between text-primary-amber mb-1.5">
            <Sliders size={18} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
              Site CMS
            </span>
          </div>
          <div className="text-2xl font-heading font-black text-[#111111]">
            8
          </div>
          <span className="text-[10px] text-[#726F6D] font-medium block">
            Dynamic Pages
          </span>
        </div>

        {/* Pricing Rates */}
        <div 
          onClick={() => handleNav("billing", "/admin/billing")}
          className="bg-white border border-[#111111]/10 p-4 rounded-2xl shadow-xs cursor-pointer hover:border-primary transition-all"
        >
          <div className="flex items-center justify-between text-primary-amber mb-1.5">
            <DollarSign size={18} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
              Pricing Rates
            </span>
          </div>
          <div className="text-2xl font-heading font-black text-[#111111]">
            Rates
          </div>
          <span className="text-[10px] text-[#726F6D] font-medium block">
            Tiers & Addons
          </span>
        </div>

        {/* Cloudflare R2 Storage */}
        <div 
          onClick={() => handleNav("storage", "/admin/storage")}
          className="bg-white border border-[#111111]/10 p-4 rounded-2xl shadow-xs cursor-pointer hover:border-primary transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-primary-amber mb-1.5">
            <HardDrive size={18} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
              Cloudflare R2
            </span>
          </div>
          <div className="text-2xl font-heading font-black text-[#111111]">
            {remainingGB} <span className="text-xs font-bold text-[#726F6D]">GB Free</span>
          </div>
          <div className="w-full bg-[#FFF9E8] rounded-full h-1.5 mt-2 overflow-hidden border border-[#111111]/10">
            <div 
              className="bg-primary h-full rounded-full transition-all" 
              style={{ width: `${Math.max(3, Number(percentUsed))}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#111111]/10 p-2.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleNav("overview", "/admin")}
            className={`px-4 py-2 hex-pill text-xs font-heading font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:bg-black/5 hover:text-primary-amber"
            }`}
          >
            <LayoutDashboard size={14} /> Studio Overview
          </button>
          <button
            type="button"
            onClick={() => handleNav("orders", "/admin/orders")}
            className={`px-4 py-2 hex-pill text-xs font-heading font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:bg-black/5 hover:text-primary-amber"
            }`}
          >
            <ShoppingBag size={14} /> Client Briefs ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => handleNav("templates", "/admin/templates")}
            className={`px-4 py-2 hex-pill text-xs font-heading font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "templates"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:bg-black/5 hover:text-primary-amber"
            }`}
          >
            <Layers size={14} /> Template Studio ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => handleNav("subscriptions", "/admin/subscriptions")}
            className={`px-4 py-2 hex-pill text-xs font-heading font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "subscriptions"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:bg-black/5 hover:text-primary-amber"
            }`}
          >
            <Crown size={14} /> Client Ledger ({registeredClientsCount})
          </button>
          <button
            type="button"
            onClick={() => handleNav("customization", "/admin/customization")}
            className={`px-4 py-2 hex-pill text-xs font-heading font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "customization"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:bg-black/5 hover:text-primary-amber"
            }`}
          >
            <Sliders size={14} /> Site Customization (8 Pages)
          </button>
          <button
            type="button"
            onClick={() => handleNav("billing", "/admin/billing")}
            className={`px-4 py-2 hex-pill text-xs font-heading font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "billing"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:bg-black/5 hover:text-primary-amber"
            }`}
          >
            <DollarSign size={14} /> Pricing Rates
          </button>
          <button
            type="button"
            onClick={() => handleNav("storage", "/admin/storage")}
            className={`px-4 py-2 hex-pill text-xs font-heading font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "storage"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:bg-black/5 hover:text-primary-amber"
            }`}
          >
            <HardDrive size={14} /> Cloudflare R2 ({remainingGB}GB)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder={
                activeTab === "subscriptions" 
                  ? "Search clients..." 
                  : activeTab === "templates" 
                  ? "Search templates..." 
                  : "Search records..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#FFF9E8] border border-[#111111]/12 hex-pill pl-9 pr-4 py-1.5 text-xs text-[#111111] font-medium outline-none focus:border-primary shadow-xs"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminNavigation;
