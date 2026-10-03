import React from "react";
import { Crown, Clock, CheckCircle2, ShieldCheck, Trash2 } from "lucide-react";

interface ClientAccountsTableProps {
  filteredProfiles: any[];
  clientProfiles: any[];
  activeSubscriptions: any[];
  freeClients: any[];
  clientFilter: "all" | "pro" | "free";
  onFilterChange: (f: "all" | "pro" | "free") => void;
  subscriptions: any[];
  isSubActive: (s: any) => boolean;
  onOpenManageTier: (profile: any) => void;
  onOpenDeleteModal: (client: any) => void;
}

export const ClientAccountsTable: React.FC<ClientAccountsTableProps> = ({
  filteredProfiles,
  clientProfiles,
  activeSubscriptions,
  freeClients,
  clientFilter,
  onFilterChange,
  subscriptions,
  isSubActive,
  onOpenManageTier,
  onOpenDeleteModal
}) => {
  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-md text-left">
      <div className="p-6 border-b border-[#111111]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            Registered Client Accounts & Subscription Tiers ({filteredProfiles.length})
          </h3>
          <p className="text-xs text-[#726F6D]">
            All registered client accounts with 1-click subscription tier management, download quota controls, and VIP access permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#726F6D]">Filter:</span>
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1 hex-pill text-[11px] font-extrabold transition-all cursor-pointer ${
              clientFilter === "all" ? "bg-primary text-[#111111]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({clientProfiles.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("pro")}
            className={`px-3 py-1 hex-pill text-[11px] font-extrabold transition-all cursor-pointer ${
              clientFilter === "pro" ? "bg-primary text-[#111111]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Pro Only ({activeSubscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("free")}
            className={`px-3 py-1 hex-pill text-[11px] font-extrabold transition-all cursor-pointer ${
              clientFilter === "free" ? "bg-primary text-[#111111]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Free Only ({freeClients.length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] font-extrabold uppercase tracking-wider">
              <th className="p-4">Full Name & Organization</th>
              <th className="p-4">Work Email</th>
              <th className="p-4">Subscription Tier</th>
              <th className="p-4">Download Quota & Access</th>
              <th className="p-4">WhatsApp VIP Hotline</th>
              <th className="p-4">Joined / Last Active</th>
              <th className="p-4 text-right">Access Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111111]/6 font-medium text-[#111111]">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#726F6D]">
                  No client profiles matching filter "{clientFilter}" or search query.
                </td>
              </tr>
            ) : (
              filteredProfiles.map((p) => {
                const clientSub = subscriptions.find(
                  (s) => s.user_email?.toLowerCase() === p.email?.toLowerCase()
                );
                const isPro = Boolean(clientSub && isSubActive(clientSub));
                const isExpiredPro = Boolean(
                  clientSub && clientSub.status === "active" && clientSub.current_period_end && new Date(clientSub.current_period_end) <= new Date()
                );

                return (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-[#111111]">
                        {p.full_name || "Enterprise Founder"}
                      </div>
                      <div className="text-[11px] text-[#726F6D]">
                        {p.company || "Direct Client"}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#111111]">
                      {p.email}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {p.tier === "lifetime" ? (
                        <span className="hex-pill-sm bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-950 border border-amber-400 font-black text-[10px] px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-xs">
                          <Crown size={11} className="text-amber-700 fill-amber-500" /> Lifetime VIP
                        </span>
                      ) : p.tier === "yearly" ? (
                        <span className="hex-pill-sm bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-[10px] px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-xs">
                          <Crown size={11} className="text-emerald-600" /> Yearly VIP
                        </span>
                      ) : p.tier === "monthly" || isPro ? (
                        <span className="hex-pill-sm bg-amber-50 text-amber-800 border border-amber-300 font-black text-[10px] px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-xs">
                          <Crown size={11} className="text-amber-500" /> Monthly VIP
                        </span>
                      ) : isExpiredPro ? (
                        <span className="hex-pill-sm bg-rose-50 text-rose-800 border border-rose-300 font-extrabold text-[10px] px-2.5 py-0.5 inline-flex items-center gap-1.5 shadow-xs">
                          <Clock size={11} className="text-rose-500" /> Expired VIP
                        </span>
                      ) : (
                        <span className="hex-pill-sm bg-gray-100 text-gray-700 border border-gray-200 font-bold text-[10px] px-2.5 py-0.5">
                          Free User
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {p.tier === "lifetime" ? (
                        <div>
                          <span className="font-black text-amber-800 text-xs">Unlimited All-Access</span>
                          <span className="text-[10px] text-[#726F6D] block">Never expires</span>
                        </div>
                      ) : p.tier === "yearly" ? (
                        <div>
                          <span className="font-black text-[#111111] text-xs">360 Decks / Year</span>
                          <span className="text-[10px] text-emerald-700 font-bold block">30 decks / month</span>
                        </div>
                      ) : p.tier === "monthly" || isPro ? (
                        <div>
                          <span className="font-black text-[#111111] text-xs">30 Decks / Month</span>
                          <span className="text-[10px] text-[#726F6D] block">Priority downloads</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-[#111111] text-xs">3 Decks / Day</span>
                          <span className="text-[10px] text-[#726F6D] block">Community catalog</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {["monthly", "yearly", "lifetime"].includes(p.tier) || isPro ? (
                        <span className="text-emerald-700 font-extrabold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-600" /> VIP Unlocked
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium text-[11px]">
                          Locked (Free)
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-[#726F6D]">
                      <div className="text-[11px] font-bold text-[#111111]">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"}
                      </div>
                      {p.last_sign_in_at && (
                        <span className="text-[10px] text-emerald-700 block">
                          Active: {new Date(p.last_sign_in_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenManageTier(p)}
                          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-[11px] px-3.5 py-1.5 inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                          title="Manage client subscription tier and permissions"
                        >
                          <ShieldCheck size={12} /> Manage Tier
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDeleteModal(p)}
                          className="hex-pill-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-[10px] px-2 py-1 inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Delete account and dispatch closure notice"
                        >
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
