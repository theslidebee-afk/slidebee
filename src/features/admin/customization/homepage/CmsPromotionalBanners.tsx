import React from "react";
import { RouteUrlSelector } from "../../shared/RouteUrlSelector";

interface CmsPromotionalBannersProps {
  siteConfigs: any;
  setSiteConfigs: React.Dispatch<React.SetStateAction<any>>;
  handleSaveConfig: (key: string, value: any) => Promise<void>;
  configSaving: boolean;
}

export const CmsPromotionalBanners: React.FC<CmsPromotionalBannersProps> = ({
  siteConfigs,
  setSiteConfigs,
  handleSaveConfig,
  configSaving,
}) => {
  return (
    <div className="pt-6 border-t border-[#111111]/8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#111111]/8">
        <div>
          <h4 className="text-sm font-heading font-extrabold text-[#111111]">
            Homepage Top Split Promotional Banners
          </h4>
          <p className="text-xs text-[#726F6D]">
            Configure the headline, subtitle, and CTA button text for the two prominent banners atop the homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const banner1 = siteConfigs["home_banner_1"] || {
              title: "Create Presentations That Make an Impact",
              subtitle: "Discover pre-designed and custom templates for every stage of your business",
              ctaText: "Learn More",
              ctaLink: "/about",
            };
            const banner2 = siteConfigs["home_banner_2"] || {
              title: "Get unlimited downloads",
              subtitle: "Access all templates with affordable subscription plans.",
              ctaText: "View Plans",
              ctaLink: "/pricing",
            };
            handleSaveConfig("home_banner_1", banner1);
            handleSaveConfig("home_banner_2", banner2);
          }}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-1.5 text-xs shadow cursor-pointer"
        >
          Save Promotional Banners
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1 */}
        <div className="bg-[#FFF9E8] p-5 rounded-2xl border border-primary/30 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCBF14]" />
            <h5 className="font-heading font-extrabold text-xs text-[#111111] uppercase tracking-wider">
              Banner 1 (Golden Yellow Banner)
            </h5>
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#111111] block mb-1">Headline</label>
            <input
              type="text"
              value={siteConfigs["home_banner_1"]?.title || ""}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                home_banner_1: { ...(siteConfigs["home_banner_1"] || {}), title: e.target.value }
              })}
              placeholder="Create Presentations That Make an Impact"
              className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-[#111111] block mb-1">Supporting Description</label>
            <textarea
              rows={2}
              value={siteConfigs["home_banner_1"]?.subtitle || ""}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                home_banner_1: { ...(siteConfigs["home_banner_1"] || {}), subtitle: e.target.value }
              })}
              placeholder="Discover pre-designed and custom templates for every stage of your business"
              className="w-full bg-white border border-[#111111]/15 rounded-lg p-2.5 text-xs font-medium text-[#111111]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#111111] block mb-1">Button Label</label>
              <input
                type="text"
                value={siteConfigs["home_banner_1"]?.ctaText || ""}
                onChange={(e) => setSiteConfigs({
                  ...siteConfigs,
                  home_banner_1: { ...(siteConfigs["home_banner_1"] || {}), ctaText: e.target.value }
                })}
                placeholder="Learn More"
                className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
              />
            </div>
            <div>
              <RouteUrlSelector
                label="Button Destination Link"
                value={siteConfigs["home_banner_1"]?.ctaLink || ""}
                onChange={(url) => setSiteConfigs({
                  ...siteConfigs,
                  home_banner_1: { ...(siteConfigs["home_banner_1"] || {}), ctaLink: url }
                })}
                placeholder="/about"
              />
            </div>
          </div>
        </div>

        {/* Banner 2 */}
        <div className="bg-[#111111] text-white p-5 rounded-2xl border border-white/10 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCBF14]" />
            <h5 className="font-heading font-extrabold text-xs text-[#FCBF14] uppercase tracking-wider">
              Banner 2 (VIP / Dark Charcoal Banner)
            </h5>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">Headline</label>
            <input
              type="text"
              value={siteConfigs["home_banner_2"]?.title || ""}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                home_banner_2: { ...(siteConfigs["home_banner_2"] || {}), title: e.target.value }
              })}
              placeholder="Get unlimited downloads"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">Supporting Description</label>
            <textarea
              rows={2}
              value={siteConfigs["home_banner_2"]?.subtitle || ""}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                home_banner_2: { ...(siteConfigs["home_banner_2"] || {}), subtitle: e.target.value }
              })}
              placeholder="Access all templates with affordable subscription plans."
              className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-xs font-medium text-white placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">Button Label</label>
              <input
                type="text"
                value={siteConfigs["home_banner_2"]?.ctaText || ""}
                onChange={(e) => setSiteConfigs({
                  ...siteConfigs,
                  home_banner_2: { ...(siteConfigs["home_banner_2"] || {}), ctaText: e.target.value }
                })}
                placeholder="View Plans"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <RouteUrlSelector
                label="Button Destination Link"
                value={siteConfigs["home_banner_2"]?.ctaLink || ""}
                onChange={(url) => setSiteConfigs({
                  ...siteConfigs,
                  home_banner_2: { ...(siteConfigs["home_banner_2"] || {}), ctaLink: url }
                })}
                placeholder="/pricing"
                dark
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
