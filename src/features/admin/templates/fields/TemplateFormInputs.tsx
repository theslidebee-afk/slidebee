import React from "react";
import { Coins } from "lucide-react";
import { TemplateFeaturesField } from "./TemplateFeaturesField";

interface TemplateFormInputsProps {
  title: string;
  setTitle: (val: string) => void;
  code: string;
  setCode: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  categoriesList: string[];
  slideCount: number | string;
  setSlideCount: (val: number | string) => void;
  priceINR: number | string;
  setPriceINR: (val: number | string) => void;
  priceUSD: number | string;
  setPriceUSD: (val: number | string) => void;
  description: string;
  setDescription: (val: string) => void;
  features?: string[];
  setFeatures?: (val: string[]) => void;
  isCreditEligible: boolean;
  setIsCreditEligible: (val: boolean) => void;
}

export const TemplateFormInputs: React.FC<TemplateFormInputsProps> = ({
  title,
  setTitle,
  code,
  setCode,
  category,
  setCategory,
  categoriesList,
  slideCount,
  setSlideCount,
  priceINR,
  setPriceINR,
  priceUSD,
  setPriceUSD,
  description,
  setDescription,
  features = [],
  setFeatures,
  isCreditEligible,
  setIsCreditEligible
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
            Template Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Series A Pitch Deck Pro"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
            Template Code (SKU) *
          </label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2 text-xs text-[#111111] font-black uppercase outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary cursor-pointer"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
            Total Slides *
          </label>
          <input
            type="number"
            value={slideCount ?? ""}
            onChange={(e) => setSlideCount(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
            Price INR (₹) *
          </label>
          <input
            type="number"
            value={priceINR ?? ""}
            onChange={(e) => setPriceINR(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
            Price USD ($) *
          </label>
          <input
            type="number"
            value={priceUSD ?? ""}
            onChange={(e) => setPriceUSD(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="text-left">
        <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
          Description & Layout Summary
        </label>
        <textarea
          rows={2}
          placeholder="Short summary of the template features and layout styles..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg p-3 text-xs text-[#111111] font-medium outline-none focus:border-primary resize-none"
        />
      </div>

      {setFeatures && (
        <TemplateFeaturesField
          features={features}
          setFeatures={setFeatures}
        />
      )}

      <div className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between text-left ${
        isCreditEligible 
          ? "bg-primary/20 border-primary shadow-sm" 
          : "bg-[#FFF9E8] border-primary/30"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-primary flex items-center justify-center font-bold">
            <Coins size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#111111] uppercase tracking-wider">
                Free Community Deck Tag (Free Tier Access)
              </span>
              {isCreditEligible && (
                <span className="rounded bg-primary text-[#111111] text-[9px] font-black px-2 py-0.5">
                  ACTIVE
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#726F6D] font-medium">
              Eligible for Free Tier registered users to download using their daily quota.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsCreditEligible(!Boolean(isCreditEligible))}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-xs ${
            isCreditEligible
              ? "bg-[#111111] text-primary border border-primary"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          {isCreditEligible ? "Tagged as Free" : "+ Tag as Free"}
        </button>
      </div>
    </>
  );
};
