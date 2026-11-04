import React from "react";
import { Save } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { CmsTrendingSelector } from "./homepage/CmsTrendingSelector";
import { CmsPromotionalBanners } from "./homepage/CmsPromotionalBanners";

export const CmsHomepagePanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving, templates } = useAdmin();

  const getTrendingIds = (): string[] => {
    const raw = siteConfigs["trending_templates"] || siteConfigs["featured_templates"];
    if (!raw) return templates.slice(0, 8).map(t => String(t.id));
    if (Array.isArray(raw)) return raw.map(String);
    if (Array.isArray(raw.ids)) return raw.ids.map(String);
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
        if (Array.isArray(parsed?.ids)) return parsed.ids.map(String);
      } catch (e) {}
    }
    return templates.slice(0, 8).map(t => String(t.id));
  };

  const selectedIds = getTrendingIds();

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            Homepage Hero Stage (Center Frosted Card)
          </h3>
          <p className="text-xs text-[#726F6D]">
            Update the headline, supporting subtitle, and badge text displayed on the central translucent card in the hero stage.
          </p>
        </div>
        <button
          onClick={() => {
            const current = siteConfigs["hero"] || {};
            const title = current.title || current.headline || "Ideas Deserve\nBetter Slides.";
            const slogan = current.slogan || "Better Presentations Brighter Ideas";
            const synchronizedHero = {
              ...current,
              title,
              headline: title,
              slogan,
            };
            handleSaveConfig("hero", synchronizedHero);
          }}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
        >
          <Save size={14} /> {configSaving ? "Saving..." : "Save Hero Card"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Central Card Display Headline (Title)
          </label>
          <textarea
            rows={2}
            value={siteConfigs["hero"]?.title || siteConfigs["hero"]?.headline || ""}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              hero: { ...(siteConfigs["hero"] || {}), title: e.target.value, headline: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl p-3 text-xs font-bold text-[#111111]"
            placeholder={"e.g. Ideas Deserve\nBetter Slides."}
          />
          <p className="text-[10px] text-[#726F6D] mt-1">Controls the main headline on the frosted card atop the marketplace.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Hero Bottom Tagline / Slogan
          </label>
          <input
            type="text"
            value={siteConfigs["hero"]?.slogan || ""}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              hero: { ...(siteConfigs["hero"] || {}), slogan: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/15 hex-pill px-4 py-2.5 text-xs font-bold text-[#111111]"
            placeholder="e.g. Better Presentations Brighter Ideas"
          />
          <p className="text-[10px] text-[#726F6D] mt-1">Controls the script italic note beneath the hero stage with the honey gold underline.</p>
        </div>
      </div>

      {/* TRENDING TEMPLATES SELECTION ON HOMEPAGE */}
      <CmsTrendingSelector
        selectedIds={selectedIds}
        templates={templates}
        siteConfigs={siteConfigs}
        setSiteConfigs={setSiteConfigs}
        handleSaveConfig={handleSaveConfig}
        configSaving={configSaving}
      />

      {/* TOP SPLIT PROMOTIONAL BANNERS CUSTOMIZER */}
      <CmsPromotionalBanners
        siteConfigs={siteConfigs}
        setSiteConfigs={setSiteConfigs}
        handleSaveConfig={handleSaveConfig}
        configSaving={configSaving}
      />
    </div>
  );
};

export default CmsHomepagePanel;
