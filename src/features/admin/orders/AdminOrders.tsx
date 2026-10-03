import React, { useState } from "react";
import { 
  ShoppingBag, 
  Zap, 
  ArrowRight, 
  Check, 
  ExternalLink 
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { ORDER_MILESTONES, getMilestoneIndex, getSafeExternalUrl } from "../shared/adminConstants";
import { OrderBriefModal } from "./OrderBriefModal";

export const AdminOrders: React.FC = () => {
  const {
    orders,
    setOrders,
    searchTerm,
    handleUpdateOrderStatus
  } = useAdmin();

  const [orderMilestoneFilter, setOrderMilestoneFilter] = useState<string>("all");
  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);

  const filteredOrders = orders.filter((o: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (o.client_email && o.client_email.toLowerCase().includes(term)) ||
      (o.service_type && o.service_type.toLowerCase().includes(term)) ||
      (o.client_name && o.client_name.toLowerCase().includes(term));
      
    if (orderMilestoneFilter === "all") return matchesSearch;
    const currentIdx = getMilestoneIndex(o.status);
    const targetIdx = ORDER_MILESTONES.findIndex((m) => m.key === orderMilestoneFilter);
    return matchesSearch && currentIdx === targetIdx;
  });

  return (
    <div className="space-y-6">
      {/* 1. Milestone Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ORDER_MILESTONES.map((m, idx) => {
          const count = orders.filter((o: any) => getMilestoneIndex(o.status) === idx).length;
          const isFilterActive = orderMilestoneFilter === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setOrderMilestoneFilter(isFilterActive ? "all" : m.key)}
              className={`hex-card text-left p-4 border transition-all cursor-pointer ${
                isFilterActive 
                  ? "bg-[#111111] text-white border-[#111111] shadow-lg scale-[1.02]"
                  : "bg-white border-[#111111]/10 hover:border-primary/60 hover:bg-[#FFF9E8] shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  isFilterActive ? "bg-primary text-[#111111]" : "bg-[#FFF9E8] text-[#111111] border border-primary/30"
                }`}>
                  Stage {m.step}
                </span>
                <span className={`text-xs font-black ${isFilterActive ? "text-primary" : "text-[#726F6D]"}`}>
                  {count} {count === 1 ? "order" : "orders"}
                </span>
              </div>
              <div className="font-heading font-extrabold text-sm sm:text-base leading-tight mb-1">
                {m.label}
              </div>
              <div className={`text-[11px] font-medium leading-relaxed truncate ${
                isFilterActive ? "text-white/70" : "text-[#726F6D]"
              }`}>
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#111111]/10 p-4 hex-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#726F6D] mr-1">Filter by Stage:</span>
          <button
            type="button"
            onClick={() => setOrderMilestoneFilter("all")}
            className={`hex-pill-sm px-3 py-1 text-xs font-extrabold transition-all border cursor-pointer ${
              orderMilestoneFilter === "all"
                ? "bg-[#111111] text-primary border-[#111111] shadow-sm"
                : "bg-[#FFF9E8] text-[#111111] border-[#111111]/10 hover:border-primary"
            }`}
          >
            All Orders ({orders.length})
          </button>
          {ORDER_MILESTONES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setOrderMilestoneFilter(m.key)}
              className={`hex-pill-sm px-3 py-1 text-xs font-extrabold transition-all border cursor-pointer ${
                orderMilestoneFilter === m.key
                  ? "bg-[#111111] text-primary border-[#111111] shadow-sm"
                  : "bg-[#FFF9E8] text-[#111111] border-[#111111]/10 hover:border-primary"
              }`}
            >
              {m.label} ({orders.filter((o: any) => getMilestoneIndex(o.status) === m.step - 1).length})
            </button>
          ))}
        </div>

        {orderMilestoneFilter !== "all" && (
          <button
            type="button"
            onClick={() => setOrderMilestoneFilter("all")}
            className="text-xs text-primary-amber font-extrabold hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* 3. Orders Table with Interactive Milestone Stepper */}
      <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-md">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[#726F6D]">
            <ShoppingBag size={36} className="mx-auto text-gray-300 mb-2" />
            <h4 className="font-heading font-extrabold text-sm text-[#111111]">No Orders Matching Filter</h4>
            <p className="text-xs font-medium mt-1">Try switching stage filters or clearing the search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] font-extrabold uppercase tracking-wider">
                  <th className="p-4">Date & Client</th>
                  <th className="p-4">Service & Scope</th>
                  <th className="p-4">Rush / Target</th>
                  <th className="p-4 min-w-[380px]">Milestone Timeline Stepper (1-Click Advance)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/6 font-medium text-[#111111]">
                {filteredOrders.map((ord: any) => {
                  const currentIdx = getMilestoneIndex(ord.status);
                  const nextMilestone = currentIdx < ORDER_MILESTONES.length - 1 ? ORDER_MILESTONES[currentIdx + 1] : null;

                  return (
                    <tr key={ord.id} className="hover:bg-primary/5 transition-colors">
                      {/* Date & Client Column */}
                      <td className="p-4">
                        <div className="font-extrabold text-[#111111] text-sm flex items-center gap-1.5">
                          {ord.client_name || "Client"}
                          {ord.target_date && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                              Due: {ord.target_date}
                            </span>
                          )}
                        </div>
                        <div className="text-[#726F6D] text-[11px] font-medium">{ord.client_email}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Submitted {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Recent"}
                        </div>
                      </td>

                      {/* Service & Scope Column */}
                      <td className="p-4">
                        <div className="font-extrabold text-[#111111]">{ord.service_type || "Presentation Design"}</div>
                        <div className="text-[11px] text-[#726F6D]">{ord.slide_count || "Custom"} slides</div>
                        {ord.budget && (
                          <div className="text-[10px] font-bold text-primary-amber">Budget: {ord.budget}</div>
                        )}
                      </td>

                      {/* Rush Delivery Column */}
                      <td className="p-4 whitespace-nowrap">
                        {ord.rush_delivery ? (
                          <span className="hex-pill-sm bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 border border-red-200 shadow-sm flex items-center gap-1 w-fit">
                            <Zap size={11} className="inline" /> 24h Rush
                          </span>
                        ) : (
                          <span className="hex-pill-sm bg-gray-100 text-[#726F6D] text-[10px] font-bold px-2.5 py-0.5 border border-gray-200">
                            Standard 48h
                          </span>
                        )}
                      </td>

                      {/* Milestone Timeline Stepper (Interactive) */}
                      <td className="p-4">
                        <div className="bg-[#FFF9E8]/70 border border-primary/25 rounded-xl p-3 shadow-inner">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-extrabold text-[#726F6D] uppercase tracking-wider">
                              Current Phase: <strong className="text-[#111111]">{ORDER_MILESTONES[currentIdx].label}</strong>
                            </span>
                            {nextMilestone && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(ord.id, nextMilestone.key)}
                                className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black text-[10px] px-2.5 py-0.5 flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                              >
                                Advance to {nextMilestone.label} <ArrowRight size={10} />
                              </button>
                            )}
                          </div>

                          {/* 4-Step Interactive Horizontal Stepper */}
                          <div className="grid grid-cols-4 gap-1.5 relative">
                            {ORDER_MILESTONES.map((m, idx) => {
                              const isPassed = idx < currentIdx;
                              const isCurrent = idx === currentIdx;

                              return (
                                <button
                                  key={m.key}
                                  type="button"
                                  title={`Set status to ${m.fullLabel}`}
                                  onClick={() => handleUpdateOrderStatus(ord.id, m.key)}
                                  className={`group relative text-center py-2 px-1 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                    isCurrent
                                      ? "bg-[#111111] text-white border-[#111111] shadow-md ring-2 ring-primary/50"
                                      : isPassed
                                      ? "bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200"
                                      : "bg-white text-gray-400 border-gray-200 hover:border-primary/50 hover:text-[#111111]"
                                  }`}
                                >
                                  <div className="flex items-center justify-center">
                                    {isPassed ? (
                                      <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-black">
                                        <Check size={9} strokeWidth={3} />
                                      </div>
                                    ) : isCurrent ? (
                                      <div className="w-4 h-4 rounded-full bg-primary text-[#111111] flex items-center justify-center text-[9px] font-black animate-pulse">
                                        {m.step}
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[9px] font-bold border border-gray-300 group-hover:border-primary">
                                        {m.step}
                                      </div>
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-extrabold truncate w-full px-0.5 ${
                                    isCurrent ? "text-primary font-black" : isPassed ? "text-amber-900" : "text-gray-500"
                                  }`}>
                                    {m.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {ord.drive_link && (
                            <a
                              href={getSafeExternalUrl(ord.drive_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="hex-pill-sm bg-white border border-[#111111]/12 hover:border-primary text-[#111111] font-bold px-2.5 py-1.5 inline-flex items-center gap-1 text-[11px] shadow-sm cursor-pointer"
                            >
                              <ExternalLink size={11} className="text-primary-amber" /> Drive
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setInspectingOrder(ord)}
                            className="hex-pill-sm bg-[#111111] text-white hover:text-primary font-bold px-3 py-1.5 inline-flex items-center gap-1 text-[11px] transition-colors shadow-sm cursor-pointer"
                          >
                            Inspect Brief
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {inspectingOrder && (
        <OrderBriefModal
          order={inspectingOrder}
          onClose={() => setInspectingOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onOrderUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
          }}
        />
      )}
    </div>
  );
};
export default AdminOrders;
