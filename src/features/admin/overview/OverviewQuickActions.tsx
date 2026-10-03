import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ShoppingBag, Plus, Gift, Sliders, Clock } from "lucide-react";
import { ORDER_MILESTONES, getMilestoneIndex } from "../shared/adminConstants";

interface OverviewQuickActionsProps {
  orders: any[];
  setActiveTab: (tab: "overview" | "orders" | "templates" | "customization" | "billing" | "storage" | "subscriptions") => void;
  setIsAddTemplateOpen: (open: boolean) => void;
  setSelectedOrderForModal: (order: any) => void;
  setOverviewOrderToInspect: (order: any) => void;
}

export const OverviewQuickActions: React.FC<OverviewQuickActionsProps> = ({
  orders,
  setActiveTab,
  setIsAddTemplateOpen,
  setSelectedOrderForModal,
  setOverviewOrderToInspect,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Executive Quick Actions */}
      <div className="bg-white border border-[#111111]/10 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-heading font-black text-sm text-[#111111] flex items-center gap-2">
            <Zap size={16} className="text-primary-amber" /> Studio Command Launchpad
          </h3>
          <span className="text-[10px] font-extrabold text-[#726F6D] uppercase">Direct Actions</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setActiveTab("orders"); navigate("/admin/orders"); }}
            className="p-3.5 rounded-2xl bg-[#FFF9E8] border border-primary/30 hover:border-primary text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <ShoppingBag size={18} className="text-[#111111] mb-2" />
            <div className="font-heading font-black text-xs text-[#111111]">Review Briefs</div>
            <div className="text-[10px] text-[#726F6D] font-medium">{orders.length} total projects</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("templates");
              setIsAddTemplateOpen(true);
              navigate("/admin/templates");
            }}
            className="p-3.5 rounded-2xl bg-[#FFF9E8] border border-primary/30 hover:border-primary text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={18} className="text-[#111111] mb-2" />
            <div className="font-heading font-black text-xs text-[#111111]">Add Template</div>
            <div className="text-[10px] text-[#726F6D] font-medium">Publish to storefront</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("subscriptions");
              navigate("/admin/subscriptions");
            }}
            className="p-3.5 rounded-2xl bg-[#FFF9E8] border border-primary/30 hover:border-primary text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Gift size={18} className="text-[#111111] mb-2" />
            <div className="font-heading font-black text-xs text-[#111111]">Grant VIP Pro</div>
            <div className="text-[10px] text-[#726F6D] font-medium">Assign Pro membership</div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("customization"); navigate("/admin/customization"); }}
            className="p-3.5 rounded-2xl bg-[#FFF9E8] border border-primary/30 hover:border-primary text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Sliders size={18} className="text-[#111111] mb-2" />
            <div className="font-heading font-black text-xs text-[#111111]">Site Customizer</div>
            <div className="text-[10px] text-[#726F6D] font-medium">Banners, CMS & hero</div>
          </button>
        </div>
      </div>

      {/* Urgent Pending Briefs Feed */}
      <div className="bg-white border border-[#111111]/10 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-heading font-black text-sm text-[#111111] flex items-center gap-2">
            <Clock size={16} className="text-primary-amber" /> Live Brief Pipeline
          </h3>
          <button
            type="button"
            onClick={() => { setActiveTab("orders"); navigate("/admin/orders"); }}
            className="text-[10px] font-black text-primary-amber hover:underline cursor-pointer"
          >
            View All ({orders.length}) →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-[#726F6D] text-xs">
            No active commissions currently in the pipeline.
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.slice(0, 3).map((ord) => {
              const milestone = ORDER_MILESTONES[getMilestoneIndex(ord.status)] || ORDER_MILESTONES[0];
              return (
                <div
                  key={ord.id}
                  className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 hover:bg-[#FFF9E8]/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-[#111111] truncate">
                      {ord.service_type || "Presentation Design"}
                    </div>
                    <div className="text-[10px] text-[#726F6D] truncate">
                      {ord.client_name || ord.client_email} • {ord.slide_count || "Custom"} slides
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/20 text-[#111111]">
                      {milestone.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderForModal(ord);
                        setOverviewOrderToInspect(ord);
                      }}
                      className="hex-pill-sm bg-[#111111] text-white hover:text-primary text-[10px] font-bold px-2.5 py-1 cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
