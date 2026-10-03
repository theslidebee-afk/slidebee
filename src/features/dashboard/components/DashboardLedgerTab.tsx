import { Trash2 } from "lucide-react";

interface DashboardLedgerTabProps {
  userTier: string;
  quotaRemaining: number;
  quotaTotal: number;
  quotaUsed: number;
  onDeleteAccount?: () => void;
}

export function DashboardLedgerTab({
  userTier,
  quotaRemaining,
  quotaTotal,
  quotaUsed,
  onDeleteAccount,
}: DashboardLedgerTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-black text-[#111111]">
          Design Credit Ledger & Account
        </h2>
        <p className="text-xs text-[#726F6D]">
          Audit trail of template credits, monthly resets, and account controls
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
          <span className="text-[10px] font-black uppercase text-[#726F6D] block">
            Current Membership
          </span>
          <span className="text-lg font-heading font-black text-[#111111] capitalize">
            {userTier} Plan
          </span>
        </div>
        <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
          <span className="text-[10px] font-black uppercase text-[#726F6D] block">
            {userTier === "free" ? "Daily Community Quota" : "Monthly Pro Quota"}
          </span>
          <span className="text-lg font-heading font-black text-[#111111]">
            {quotaRemaining} / {quotaTotal} remaining {userTier === "free" ? "today" : "this month"}
          </span>
          {userTier === "free" && (
            <span className="text-[10px] text-amber-800 font-bold block mt-1">
              Free Community Decks only • Premium decks require Pro
            </span>
          )}
        </div>
        <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
          <span className="text-[10px] font-black uppercase text-[#726F6D] block">
            Downloaded Decks
          </span>
          <span className="text-lg font-heading font-black text-[#111111]">
            {quotaUsed} consumed
          </span>
        </div>
      </div>

      {onDeleteAccount && (
        <div className="p-6 rounded-3xl border border-red-200 bg-red-50/40 flex items-center justify-between">
          <div>
            <h4 className="font-heading font-black text-sm text-red-700">Account Erasure</h4>
            <p className="text-xs text-red-900/70">
              Permanently delete account credentials and download licenses
            </p>
          </div>
          <button
            type="button"
            onClick={onDeleteAccount}
            className="hex-pill bg-white text-red-600 border border-red-200 text-xs font-bold px-4 py-2 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      )}
    </div>
  );
}
