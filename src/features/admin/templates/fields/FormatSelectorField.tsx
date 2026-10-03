import React from "react";
import { LayoutTemplate, Check, Plus } from "lucide-react";

export const AVAILABLE_FORMAT_TAGS = ["PowerPoint", "Google Slides", "Keynote", "Canva", "Figma"];

interface FormatSelectorFieldProps {
  formats: string[];
  setFormats: (formats: string[]) => void;
}

export const FormatSelectorField: React.FC<FormatSelectorFieldProps> = ({
  formats,
  setFormats
}) => {
  return (
    <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/10 text-left space-y-2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
            <LayoutTemplate size={13} className="text-primary-amber" />
            <span>Software Compatibility</span>
          </label>
          <span className="text-[10px] font-bold text-[#726F6D]">
            {formats.length} Selected
          </span>
        </div>
        <p className="text-[10px] text-[#726F6D]">
          Select presentation software supported by this template. Click to toggle.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {AVAILABLE_FORMAT_TAGS.map((fmt) => {
          const isSelected = formats.includes(fmt);
          return (
            <button
              key={fmt}
              type="button"
              onClick={() => {
                if (isSelected) {
                  setFormats(formats.filter((f) => f !== fmt));
                } else {
                  setFormats([...formats, fmt]);
                }
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                isSelected
                  ? "bg-[#111111] text-[#FCBF14] border border-[#111111]"
                  : "bg-white text-[#111111] border border-[#111111]/15 hover:border-primary"
              }`}
            >
              {isSelected ? <Check size={11} className="text-[#FCBF14]" /> : <Plus size={11} className="text-[#726F6D]" />}
              <span>{fmt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
