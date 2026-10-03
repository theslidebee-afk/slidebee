import React from "react";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const AdminBilling: React.FC = () => {
  const { 
    siteConfigs, 
    setSiteConfigs, 
    handleSaveConfig, 
    configSaving, 
    configSavedSuccess, 
    configValidationError 
  } = useAdmin();

  const pricingConfig = siteConfigs["pricing"] || {};

  return (
    <div className="space-y-8">
      {configSavedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 size={16} /> Changes saved successfully to live website database!
        </div>
      )}
      {configValidationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-shake">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" /> {configValidationError}
        </div>
      )}

      {/* PLATFORM CONFIG: PRICING RATES & TIERS */}
      <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
          <div>
            <h3 className="text-base font-heading font-extrabold text-[#111111]">
              Template Marketplace Rates & Tiers
            </h3>
            <p className="text-xs text-[#726F6D]">
              Control live subscription rates for template marketplace membership tiers (Monthly Pro, Yearly Pro, Lifetime VIP) in USD ($) and INR (₹).
            </p>
          </div>
          <button
            onClick={() => handleSaveConfig("pricing", pricingConfig)}
            disabled={configSaving}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all hover:scale-105"
          >
            <Save size={14} /> {configSaving ? "Saving..." : "Save Pricing Rates"}
          </button>
        </div>

        {/* TEMPLATE MARKETPLACE ACCESS PLANS */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="hex-pill-sm bg-primary/20 text-[#111111] text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider">
              Marketplace Plans
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#111111]">
              Template Marketplace Access Plans & Deals (/pricing)
            </h4>
          </div>
          <p className="text-[11px] text-[#726F6D] mb-4">
            Controls the live subscription cards, discount calculations, and checkout fees for the template catalog.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Monthly Pro Plan */}
            <div className="bg-[#FFF9E8] p-5 rounded-2xl border border-[#111111]/8">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-3">
                Monthly Pro Plan
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                    USD Price ($/mo)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.tier_monthly_usd ?? 5}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      pricing: { ...pricingConfig, tier_monthly_usd: e.target.value === "" ? "" : Number(e.target.value) }
                    })}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                    INR Price (₹/mo)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.tier_monthly_inr ?? 399}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      pricing: { ...pricingConfig, tier_monthly_inr: e.target.value === "" ? "" : Number(e.target.value) }
                    })}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Yearly Pro Plan */}
            <div className="bg-[#FFF9E8] p-5 rounded-2xl border border-[#111111]/8">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-3">
                Yearly Pro Plan (Best Value)
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                    USD Price ($/year)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.tier_yearly_usd ?? 45}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      pricing: { ...pricingConfig, tier_yearly_usd: e.target.value === "" ? "" : Number(e.target.value) }
                    })}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                    INR Price (₹/year)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.tier_yearly_inr ?? 3499}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      pricing: { ...pricingConfig, tier_yearly_inr: e.target.value === "" ? "" : Number(e.target.value) }
                    })}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Lifetime VIP Access */}
            <div className="bg-[#FFF9E8] p-5 rounded-2xl border border-[#111111]/8">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-3">
                Lifetime VIP Access
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                    USD Price ($ one-time)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.tier_lifetime_usd ?? 75}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      pricing: { ...pricingConfig, tier_lifetime_usd: e.target.value === "" ? "" : Number(e.target.value) }
                    })}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                    INR Price (₹ one-time)
                  </label>
                  <input
                    type="number"
                    value={pricingConfig.tier_lifetime_inr ?? 5999}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      pricing: { ...pricingConfig, tier_lifetime_inr: e.target.value === "" ? "" : Number(e.target.value) }
                    })}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
