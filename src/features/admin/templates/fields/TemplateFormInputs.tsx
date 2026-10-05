import React from "react";
import { Crown, Gift, CheckCircle2 } from "lucide-react";
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
  isCreditEligible?: boolean;
  setIsCreditEligible: (val: boolean) => void;
  tier?: "free" | "premium";
  setTier?: (val: "free" | "premium") => void;
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
  setIsCreditEligible,
  tier = "premium",
  setTier
}) => {
  const isFree = tier === "free";

  const handleSelectTier = (newTier: "free" | "premium") => {
    if (setTier) {
      setTier(newTier);
    }
    if (newTier === "free") {
      setPriceINR(0);
      setPriceUSD(0);
      setIsCreditEligible(false);
    } else {
      if (Number(priceINR) === 0) setPriceINR(499);
      if (Number(priceUSD) === 0) setPriceUSD(9);
      setIsCreditEligible(true);
    }
  };

  return (
    <>
      {/* Tier Selection Segmented Control */}
      <div className="text-left space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block">
          Template Tier & Classification *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSelectTier("free")}
            className={`p-3 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer text-left ${
              isFree
                ? "bg-emerald-50 border-emerald-500 shadow-sm"
                : "bg-white border-[#111111]/10 hover:border-emerald-300"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isFree ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
            }`}>
              <Gift size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#111111]">
                  Free Community Deck
                </span>
                {isFree && (
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#726F6D] font-medium mt-0.5 leading-snug">
                Zero amount taken (₹0 / $0). Free registered users get 3 downloads per day.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTier("premium")}
            className={`p-3 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer text-left ${
              !isFree
                ? "bg-[#FFF9E8] border-primary shadow-sm"
                : "bg-white border-[#111111]/10 hover:border-primary/40"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              !isFree ? "bg-[#111111] text-[#FCBF14]" : "bg-gray-100 text-gray-600"
            }`}>
              <Crown size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#111111]">
                  Premium Presentation Deck
                </span>
                {!isFree && (
                  <span className="bg-[#111111] text-[#FCBF14] text-[9px] font-black px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#726F6D] font-medium mt-0.5 leading-snug">
                Has price. Can be bought individually or redeemed via Pro subscription quota.
              </p>
            </div>
          </button>
        </div>
      </div>

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

        {isFree ? (
          <div className="col-span-2 bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 flex items-center gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <div className="text-left">
              <span className="text-[11px] font-black text-emerald-900 uppercase block">
                Free Community Tier (₹0 / $0)
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                Price is locked to ₹0. Zero amount taken from clients.
              </span>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                Price INR (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
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
                min="1"
                required
                value={priceUSD ?? ""}
                onChange={(e) => setPriceUSD(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary"
              />
            </div>
          </>
        )}
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
    </>
  );
};
