import React from "react";
import { Check } from "lucide-react";

export type TierType = "free" | "monthly" | "yearly" | "lifetime";

interface TierOptionSelectorProps {
  selectedTier: TierType;
  onSelectTier: (tier: TierType) => void;
  durationMonths: number;
  onSelectDuration: (months: number) => void;
}

export const TierOptionSelector: React.FC<TierOptionSelectorProps> = ({
  selectedTier,
  onSelectTier,
  durationMonths,
  onSelectDuration,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-2">
          Select Access Tier
        </label>
        <div className="space-y-2">
          {[
            {
              id: "free" as TierType,
              title: "Free User",
              badge: "Free Starter",
              desc: "3 community deck downloads / day. Standard catalog access.",
              bg: "hover:bg-gray-50",
              activeBg: "bg-gray-100 border-[#111111]",
            },
            {
              id: "monthly" as TierType,
              title: "Monthly User",
              badge: "Monthly VIP",
              desc: "30 premium deck downloads / month. Priority support.",
              bg: "hover:bg-amber-50/50",
              activeBg: "bg-amber-50 border-amber-500 ring-2 ring-amber-400/30",
            },
            {
              id: "yearly" as TierType,
              title: "Yearly User",
              badge: "Yearly VIP",
              desc: "360 premium deck downloads / year. Consultation call included.",
              bg: "hover:bg-emerald-50/50",
              activeBg: "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400/30",
            },
            {
              id: "lifetime" as TierType,
              title: "Lifetime User",
              badge: "Lifetime VIP",
              desc: "Unlimited master deck downloads forever. Direct VIP WhatsApp hotline.",
              bg: "hover:bg-primary/10",
              activeBg: "bg-[#FFF9E8] border-primary ring-2 ring-primary/40",
            },
          ].map((t) => {
            const isSelected = selectedTier === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTier(t.id)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected ? t.activeBg : `border-[#111111]/12 bg-white ${t.bg}`
                }`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border ${
                  isSelected ? "border-[#111111] bg-[#111111] text-white" : "border-gray-300 bg-white"
                }`}>
                  {isSelected ? <Check size={12} strokeWidth={3} /> : null}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-xs text-[#111111]">
                      {t.title}
                    </span>
                    <span className="text-[10px] font-black uppercase text-[#726F6D]">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#726F6D] mt-0.5 font-medium leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Duration Selector */}
      {selectedTier !== "lifetime" && selectedTier !== "free" && (
        <div>
          <label className="block text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-1">
            Active Duration (Months)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelectDuration(m)}
                className={`py-2 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                  durationMonths === m
                    ? "bg-[#111111] text-[#FCBF14] border-[#111111] shadow-sm"
                    : "bg-white text-[#111111] border-[#111111]/15 hover:border-primary"
                }`}
              >
                {m} {m === 1 ? "Mo" : "Mos"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
