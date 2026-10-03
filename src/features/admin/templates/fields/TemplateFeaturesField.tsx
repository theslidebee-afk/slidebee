import React, { useState } from "react";
import { Plus, X, Sparkles } from "lucide-react";

interface TemplateFeaturesFieldProps {
  features: string[];
  setFeatures: (features: string[]) => void;
}

const FEATURE_PRESETS = [
  "Capability Matrix",
  "Process Workflow Flowchart",
  "Enterprise RFP Deck",
  "35+ Vector Slides",
  "16:9 Widescreen Full HD",
  "Light and Dark Accents",
  "Master Theme Typography",
  "Instant PowerPoint (.pptx) Download",
  "100% Fully Editable Shapes & Colors",
  "Perpetual Commercial Royalty-Free",
];

export const TemplateFeaturesField: React.FC<TemplateFeaturesFieldProps> = ({
  features,
  setFeatures,
}) => {
  const [inputVal, setInputVal] = useState("");

  const handleAddFeature = (featToAdd?: string) => {
    const text = (featToAdd || inputVal).trim();
    if (!text) return;
    if (!features.includes(text)) {
      setFeatures([...features, text]);
    }
    if (!featToAdd) {
      setInputVal("");
    }
  };

  const handleRemoveFeature = (idxToRemove: number) => {
    setFeatures(features.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="bg-[#FFF9E8] border border-primary/40 rounded-xl p-3.5 space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-black text-[#111111] uppercase tracking-wider block">
            What is Included in This Deck (Features Checklist)
          </label>
          <span className="text-[10px] text-[#726F6D] font-medium">
            Displayed on the template details page under "WHAT IS INCLUDED IN THIS DECK:"
          </span>
        </div>
        <span className="text-[10px] font-bold text-primary-amber bg-white border border-primary/30 px-2 py-0.5 rounded-full">
          {features.length} Features
        </span>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="e.g. Capability Matrix, Process Workflow Flowchart, Enterprise RFP Deck..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddFeature();
            }
          }}
          className="flex-1 bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => handleAddFeature()}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
        >
          <Plus size={14} /> Add Feature
        </button>
      </div>

      {/* Active features list */}
      {features.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {features.map((feat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 bg-white border border-primary/40 text-[#111111] text-xs font-semibold px-2.5 py-1 rounded-lg shadow-xs"
            >
              <span>{feat}</span>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="text-gray-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                title="Remove feature"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick Add Presets */}
      <div className="pt-2 border-t border-primary/20">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5 flex items-center gap-1">
          <Sparkles size={11} className="text-primary-amber" /> Quick Add Suggestions:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {FEATURE_PRESETS.filter((p) => !features.includes(p)).slice(0, 5).map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => handleAddFeature(preset)}
              className="text-[10px] font-bold bg-white/70 hover:bg-white text-[#726F6D] hover:text-[#111111] border border-[#111111]/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
