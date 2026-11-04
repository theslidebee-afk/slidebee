import React from "react";
import { Crown, CreditCard, CheckCircle2, Clock, Send, UserX, ShieldCheck, Trash2 } from "lucide-react";

interface SubscriptionsTableProps {
  subscriptions: any[];
  activeSubscriptions: any[];
  profiles: any[];
  isSubActive: (s: any) => boolean;
  onOpenManageTier: (target: any) => void;
  onOpenRevokeModal: (sub: any) => void;
  onOpenDeleteModal: (target: any) => void;
  onSendProExpiryReminder: (sub: any) => void;
  onSendProExpiredNotice: (sub: any) => void;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  subscriptions,
  activeSubscriptions,
  profiles,
  isSubActive,
  onOpenManageTier,
  onOpenRevokeModal,
  onOpenDeleteModal,
  onSendProExpiryReminder,
  onSendProExpiredNotice
}) => {
  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-md text-left">
      <div className="p-6 border-b border-[#111111]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-heading font-extrabold text-[#111111]">
              Active Pro Memberships
            </h3>
            <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-2 py-0.5 border border-primary/40">
              {activeSubscriptions.length} Active
            </span>
          </div>
          <p className="text-xs text-[#726F6D] mt-0.5">
            Real-time monitoring of client monthly template quotas (30 templates/mo), Pro tier status, renewals, and complimentary VIP access
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenManageTier(null)}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer self-start sm:self-auto"
        >
          <Crown size={14} /> Grant Subscription Tier to Any Account
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="p-10 text-center text-[#726F6D]">
          <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
          <h4 className="font-heading font-extrabold text-sm text-[#111111]">No Active Subscriptions</h4>
          <p className="text-xs font-medium mt-1">Client Pro memberships and complimentary grants will appear here.</p>
          <button
            type="button"
            onClick={() => onOpenManageTier(null)}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs inline-flex items-center gap-1.5 shadow-sm mt-4 cursor-pointer"
          >
            <Crown size={13} /> Grant First Subscription Tier
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] font-extrabold uppercase tracking-wider">
                <th className="p-4">Subscriber</th>
                <th className="p-4">Plan Name & Tier</th>
                <th className="p-4">Monthly Rate</th>
                <th className="p-4">Monthly Template Quota</th>
                <th className="p-4">Renewal / Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/6 font-medium text-[#111111]">
              {subscriptions.map((sub) => {
                const isComplimentary = Number(sub.amount_usd) === 0 || sub.plan_name?.toLowerCase().includes("complimentary");
                const matchedProfile = profiles.find((p) => p.email?.toLowerCase() === sub.user_email?.toLowerCase());
                const isCurrentlyActive = isSubActive(sub);
                const isPeriodEnded = sub.current_period_end && new Date(sub.current_period_end) <= new Date();

                return (
                  <tr key={sub.id} className="hover:bg-primary/5 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-[#111111]">
                        {matchedProfile?.full_name || sub.user_email}
                      </div>
                      <div className="text-[11px] text-[#726F6D]">{sub.user_email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#111111] flex items-center gap-1.5">
                        {sub.plan_name}
                      </div>
                      {isComplimentary ? (
                        <span className="hex-pill-sm bg-amber-50 text-amber-800 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 mt-0.5 inline-block">
                          Complimentary Grant
                        </span>
                      ) : (
                        <span className="hex-pill-sm bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-bold px-1.5 py-0.5 mt-0.5 inline-block">
                          Pro Member
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-black text-primary-amber">
                      {isComplimentary ? (
                        <span className="text-emerald-700 font-extrabold">Free ($0 / ₹0)</span>
                      ) : (
                        <span>${sub.amount_usd} / ₹{sub.amount_inr?.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold mb-1">
                        {sub.slides_used || 0} / {sub.slides_limit || 30} Templates
                      </div>
                      <div className="w-32 bg-[#FFF9E8] rounded-full h-1.5 overflow-hidden border border-[#111111]/10">
                        <div 
                          className="bg-primary-amber h-full rounded-full" 
                          style={{ width: `${Math.min(100, ((sub.slides_used || 0) / (sub.slides_limit || 30)) * 100)}%` }} 
                        />
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-[#726F6D]">
                      {sub.current_period_end ? (
                        <div>
                          <span className="font-bold text-[#111111]">
                            {new Date(sub.current_period_end).toLocaleDateString()}
                          </span>
                          {!isPeriodEnded ? (
                            <span className="block text-[10px] text-emerald-700 font-extrabold">
                              {Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days Left
                            </span>
                          ) : (
                            <span className="block text-[10px] text-rose-700 font-extrabold">
                              Expired (Period Ended)
                            </span>
                          )}
                        </div>
                      ) : (
                        "Continuous"
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {isCurrentlyActive ? (
                        <span className="hex-pill-sm bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 inline-flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-600" /> Active
                        </span>
                      ) : isPeriodEnded ? (
                        <span className="hex-pill-sm bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-black px-2.5 py-0.5 inline-flex items-center gap-1">
                          <Clock size={10} className="text-rose-600" /> Expired
                        </span>
                      ) : (
                        <span className="hex-pill-sm bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-bold px-2.5 py-0.5">
                          {sub.status || "Canceled"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isCurrentlyActive ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onSendProExpiryReminder(sub)}
                              className="hex-pill-sm bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-extrabold text-[10px] px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Dispatch 7-Day Renewal/Expiry reminder email"
                            >
                              <Send size={11} /> 7-Day Notice
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenRevokeModal(sub)}
                              className="hex-pill-sm bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-[10px] px-2.5 py-1 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Revoke Pro access and compose notice email"
                            >
                              <UserX size={11} /> Revoke Pro
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onSendProExpiredNotice(sub)}
                              className="hex-pill-sm bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-[10px] px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Dispatch Pro Subscription Ended notice email"
                            >
                              <Send size={11} /> Expired Notice
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onOpenManageTier(matchedProfile || { email: sub.user_email, full_name: sub.user_email?.split("@")[0], tier: "monthly" });
                              }}
                              className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black text-[10px] px-2.5 py-1 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Manage client subscription tier and permissions"
                            >
                              <ShieldCheck size={11} /> Manage Tier
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const clientObj = matchedProfile || {
                              id: sub.user_id || "",
                              email: sub.user_email,
                              full_name: sub.user_email?.split("@")[0],
                            };
                            onOpenDeleteModal(clientObj);
                          }}
                          className="hex-pill-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-[10px] px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Delete account and dispatch closure notice"
                        >
                          <Trash2 size={11} /> Delete
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
  );
};
