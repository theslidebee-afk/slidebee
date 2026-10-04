import { Trash2, Crown, ShieldCheck, CheckCircle } from "lucide-react";

interface DashboardLedgerTabProps {
  userTier: string;
  quotaRemaining: number;
  quotaTotal: number;
  quotaUsed: number;
  isProUser?: boolean;
  userSubscription?: any;
  proDaysRemaining?: number | null;
  onDeleteAccount?: () => void;
}

export function DashboardLedgerTab({
  userTier,
  quotaRemaining,
  quotaTotal,
  quotaUsed,
  isProUser = false,
  userSubscription,
  proDaysRemaining = null,
  onDeleteAccount,
}: DashboardLedgerTabProps) {
  const planName =
    userSubscription?.plan_name ||
    (userTier === "yearly"
      ? "SlideBee Yearly Pro"
      : userTier === "lifetime"
      ? "SlideBee Lifetime VIP"
      : userTier === "monthly"
      ? "SlideBee Monthly Pro"
      : "Free Starter");

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
          <div className="flex items-center gap-1.5 mt-1">
            {isProUser && <Crown size={18} className="text-[#D99B00]" />}
            <span className="text-lg font-heading font-black text-[#111111] capitalize">
              {planName}
            </span>
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
          <span className="text-[10px] font-black uppercase text-[#726F6D] block">
            {userTier === "free" ? "Daily Community Quota" : "Monthly Pro Quota"}
          </span>
          <span className="text-lg font-heading font-black text-[#111111] block mt-1">
            {quotaRemaining} / {quotaTotal} remaining {userTier === "free" ? "today" : "this month"}
          </span>
          {userTier === "free" && (
            <span className="text-[10px] text-amber-800 font-bold block mt-1">
              Free Community Decks only • Premium decks require Pro
            </span>
          )}
          {isProUser && (
            <span className="text-[10px] text-emerald-800 font-bold block mt-1">
              Unrestricted access to all curated presentations
            </span>
          )}
        </div>
        <div className="p-5 rounded-3xl bg-[#FFF9E8] border border-primary/30">
          <span className="text-[10px] font-black uppercase text-[#726F6D] block">
            Downloaded Decks
          </span>
          <span className="text-lg font-heading font-black text-[#111111] block mt-1">
            {quotaUsed} consumed
          </span>
        </div>
      </div>

      {/* Subscription Breakdown Card for Pro Users */}
      {isProUser && (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={20} />
              <h3 className="font-heading font-black text-sm text-[#111111]">
                Active Subscription Status
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Active VIP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#111111]">
            <div className="p-3 bg-[#F9FAFB] rounded-xl border border-gray-100 space-y-0.5">
              <span className="text-[#726F6D] text-[11px] block">Plan Tier:</span>
              <span className="font-extrabold font-heading">{planName}</span>
            </div>
            <div className="p-3 bg-[#F9FAFB] rounded-xl border border-gray-100 space-y-0.5">
              <span className="text-[#726F6D] text-[11px] block">Validity:</span>
              <span className="font-extrabold font-heading">
                {proDaysRemaining !== null ? `${proDaysRemaining} days remaining in cycle` : "Lifetime Access"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#726F6D] block">Included Membership Benefits:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#111111]">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#D99B00] shrink-0" />
                <span>30 Full Presentation Master Decks / month</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#D99B00] shrink-0" />
                <span>Perpetual Commercial & Agency Usage Rights</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#D99B00] shrink-0" />
                <span>Direct VIP WhatsApp Studio Hotline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#D99B00] shrink-0" />
                <span>Priority Turnaround on Bespoke Design Briefs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {onDeleteAccount && (
        <div className="p-6 rounded-3xl border border-red-200 bg-red-50/40 flex items-center justify-between">
          <div>
            <h4 className="font-heading font-black text-sm text-red-700">Account Erasure</h4>
            <p className="text-xs text-red-900/70">
              Permanently delete account credentials, custom briefs, and download licenses
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
