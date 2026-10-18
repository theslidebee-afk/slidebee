import React from "react";
import { Tag, Check, X, Loader2, AlertCircle } from "lucide-react";
import { type AppliedPromotion } from "../usePromotion";

interface CouponInputBoxProps {
  couponInput: string;
  onInputChange: (val: string) => void;
  appliedPromo: AppliedPromotion | null;
  isValidating: boolean;
  validationError: string | null;
  onApply: () => void;
  onRemove: () => void;
  className?: string;
  placeholder?: string;
}

export const CouponInputBox: React.FC<CouponInputBoxProps> = ({
  couponInput,
  onInputChange,
  appliedPromo,
  isValidating,
  validationError,
  onApply,
  onRemove,
  className = "",
  placeholder = "Have a promo code?",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onApply();
    }
  };

  if (appliedPromo) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl border border-amber-300 bg-amber-50/70 text-zinc-900 transition-all ${className}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-[#FCBF14]/30 flex items-center justify-center shrink-0 text-[#936610]">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#936610] bg-[#FFF9E8] px-2 py-0.5 rounded border border-[#FCBF14]/40">
                {appliedPromo.code || "PROMO"}
              </span>
              <span className="text-xs font-semibold text-zinc-800 truncate">
                {appliedPromo.name}
              </span>
            </div>
            <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
              {appliedPromo.savingsText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-black/5 transition-colors shrink-0 ml-2"
          title="Remove promotional code"
          aria-label="Remove promotional code"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 relative">
        <div className="relative flex-1">
          <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={couponInput}
            onChange={(e) => onInputChange(e.target.value.toUpperCase().replace(/\s+/g, ""))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isValidating}
            className="w-full pl-8 pr-3 py-2 text-xs font-medium font-mono uppercase bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#D99B00] focus:border-[#D99B00] transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={onApply}
          disabled={isValidating || !couponInput.trim()}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#111111] text-[#FFF9E8] hover:bg-[#222222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center min-w-[64px]"
        >
          {isValidating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {validationError && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-600 px-1 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
