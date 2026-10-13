import React from "react";
import { RouteUrlSelector } from "../../shared/RouteUrlSelector";
import { Sparkles, ArrowRight } from "lucide-react";

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
  const topBar = siteConfigs["home_top_bar"] || {
    enabled: true,
    badge: "STUDIO SPECIAL",
    title: "100+ Board-Ready Presentation Templates & Frameworks",
    ctaText: "Explore Studio",
    ctaLink: "#templates",
  };

  const handleSaveTopBar = async () => {
    await handleSaveConfig("home_top_bar", topBar);
  };

  const handleSaveAllBanners = async () => {
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
    await handleSaveConfig("home_top_bar", topBar);
    await handleSaveConfig("home_banner_1", banner1);
    await handleSaveConfig("home_banner_2", banner2);
  };

  return (
    <div className="pt-6 border-t border-[#111111]/8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#111111]/8">
        <div>
          <h4 className="text-sm font-heading font-extrabold text-[#111111]">
            Homepage Hero Promotional Banners & Announcement Bar
          </h4>
          <p className="text-xs text-[#726F6D]">
            Customize the navbar-sized announcement bar on top and the two promotional split banners below.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAllBanners}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs shadow cursor-pointer transition-all"
        >
          {configSaving ? "Saving Banners..." : "Save All Promotional Banners"}
        </button>
      </div>

      {/* TOP ANNOUNCEMENT BAR (NAVBAR-SIZED STRIP) */}
      <div className="bg-[#181818] text-white p-5 sm:p-6 rounded-2xl border-2 border-[#FCBF14]/40 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FCBF14]" />
            <h5 className="font-heading font-black text-xs text-[#FCBF14] uppercase tracking-wider">
              Top Announcement Bar (Navbar-Sized Horizontal Strip)
            </h5>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Visibility Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-200 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span>Show on Homepage:</span>
              <input
                type="checkbox"
                checked={topBar.enabled !== false}
                onChange={(e) =>
                  setSiteConfigs({
                    ...siteConfigs,
                    home_top_bar: { ...topBar, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#FCBF14] cursor-pointer"
              />
              <span className="text-[11px] font-black text-[#FCBF14]">
                {topBar.enabled !== false ? "ENABLED" : "HIDDEN"}
              </span>
            </label>

            <button
              type="button"
              onClick={handleSaveTopBar}
              disabled={configSaving}
              className="hex-pill bg-[#FCBF14] hover:bg-[#D99B00] text-[#111111] font-black px-3.5 py-1.5 text-xs shadow cursor-pointer transition-all shrink-0"
            >
              {configSaving ? "Saving..." : "Save Announcement Bar"}
            </button>
          </div>
        </div>

        {/* Live Preview Strip */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
            Live Preview (Exact Navbar Profile):
          </span>
          <div className="bg-gradient-to-r from-[#181818] via-[#222222] to-[#121212] text-white rounded-full px-4 sm:px-6 py-2.5 shadow-md border border-[#FCBF14]/40 flex items-center justify-between gap-3 overflow-hidden select-none">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCBF14]/20 border border-[#FCBF14]/50 text-[#FCBF14] text-[10px] font-black uppercase tracking-wider shrink-0">
                <Sparkles size={11} />
                <span>{topBar.badge || "STUDIO SPECIAL"}</span>
              </span>
              <span className="text-xs font-heading font-extrabold text-white truncate">
                {topBar.title || "100+ Board-Ready Presentation Templates & Frameworks"}
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-[11px] font-black text-[#FCBF14]">
              <span>{topBar.ctaText || "Explore Studio"}</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>

        {/* Config Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">Badge Text</label>
            <input
              type="text"
              value={topBar.badge || ""}
              onChange={(e) =>
                setSiteConfigs({
                  ...siteConfigs,
                  home_top_bar: { ...topBar, badge: e.target.value },
                })
              }
              placeholder="STUDIO SPECIAL"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-gray-300 block mb-1">Announcement Title</label>
            <input
              type="text"
              value={topBar.title || ""}
              onChange={(e) =>
                setSiteConfigs({
                  ...siteConfigs,
                  home_top_bar: { ...topBar, title: e.target.value },
                })
              }
              placeholder="100+ Board-Ready Presentation Templates & Frameworks"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">Button Label</label>
            <input
              type="text"
              value={topBar.ctaText || ""}
              onChange={(e) =>
                setSiteConfigs({
                  ...siteConfigs,
                  home_top_bar: { ...topBar, ctaText: e.target.value },
                })
              }
              placeholder="Explore Studio"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <RouteUrlSelector
              label="Button Destination Link"
              value={topBar.ctaLink || "#templates"}
              onChange={(url) =>
                setSiteConfigs({
                  ...siteConfigs,
                  home_top_bar: { ...topBar, ctaLink: url },
                })
              }
              placeholder="#templates"
              dark
            />
          </div>
        </div>
      </div>

      {/* SPLIT BANNERS BELOW */}
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
