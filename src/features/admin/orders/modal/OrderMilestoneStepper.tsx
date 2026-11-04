import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ORDER_MILESTONES, getMilestoneIndex } from "../../shared/adminConstants";

interface OrderMilestoneStepperProps {
  status: string;
  onStatusChange: (statusKey: string) => void;
}

export const OrderMilestoneStepper: React.FC<OrderMilestoneStepperProps> = ({
  status,
  onStatusChange
}) => {
  const currentIdx = getMilestoneIndex(status);

  return (
    <div className="bg-[#FFF9E8] border border-primary/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-3 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-primary-amber" /> Live Milestone Progress
        </h4>
        <span className="text-xs font-extrabold text-primary-amber">
          Stage {currentIdx + 1} of 4: {ORDER_MILESTONES[currentIdx].label}
        </span>
      </div>

      {/* 4-Step Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ORDER_MILESTONES.map((m, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onStatusChange(m.key)}
              className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                isCurrent
                  ? "bg-[#111111] text-white border-[#111111] shadow-md ring-2 ring-primary/40"
                  : isPassed
                  ? "bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200"
                  : "bg-white text-gray-500 border-gray-200 hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                  isCurrent ? "bg-primary text-[#111111]" : isPassed ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {isPassed ? "Done" : isCurrent ? "Active" : `Step ${m.step}`}
                </span>
              </div>
              <div className={`font-extrabold text-xs mb-0.5 ${isCurrent ? "text-primary" : "text-[#111111]"}`}>
                {m.label}
              </div>
              <div className={`text-[10px] font-medium leading-tight ${isCurrent ? "text-white/70" : "text-[#726F6D]"}`}>
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#111111]/10">
        <span className="text-[#726F6D] text-[11px]">
          Click any stage above to update status instantly.
        </span>
        {currentIdx < 3 && (
          <button
            type="button"
            onClick={() => {
              const nextKey = ORDER_MILESTONES[currentIdx + 1].key;
              onStatusChange(nextKey);
            }}
            className="rounded-lg bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            Advance to {ORDER_MILESTONES[currentIdx + 1].label} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
