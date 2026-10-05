import React from "react";
import { Save } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { CmsAboutTeamSection } from "./about/CmsAboutTeamSection";
import { CmsAboutVisionSection } from "./about/CmsAboutVisionSection";
import { RouteUrlSelector } from "../shared/RouteUrlSelector";

export const CmsAboutPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving } = useAdmin();

  const aboutConfig = siteConfigs["about_cms"] || {};

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            About Page Story & Vision Customizer (/about)
          </h3>
          <p className="text-xs text-[#726F6D]">
            Update the team spotlight, company vision, and bottom call-to-action sections on the About page.
          </p>
        </div>
        <button
          onClick={() => handleSaveConfig("about_cms", aboutConfig)}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save size={14} /> {configSaving ? "Saving..." : "Save About Page"}
        </button>
      </div>

      {/* 1. OUR TEAM SECTION */}
      <CmsAboutTeamSection
        aboutConfig={aboutConfig}
        siteConfigs={siteConfigs}
        setSiteConfigs={setSiteConfigs}
      />

      {/* 2. OUR VISION SECTION */}
      <CmsAboutVisionSection
        aboutConfig={aboutConfig}
        siteConfigs={siteConfigs}
        setSiteConfigs={setSiteConfigs}
      />

      {/* 3. BOTTOM CALL TO ACTION SECTION */}
      <div className="bg-[#111111] text-white p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCBF14]" />
          <h4 className="font-heading font-extrabold text-xs text-[#FCBF14] uppercase tracking-wider">
            Section 3: Bottom Call to Action
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">
              CTA Eyebrow Label
            </label>
            <input
              type="text"
              value={aboutConfig.ctaEyebrow ?? "LET'S CREATE BETTER PRESENTATIONS"}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, ctaEyebrow: e.target.value }
              })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-300 block mb-1">
              CTA Main Heading
            </label>
            <input
              type="text"
              value={aboutConfig.ctaHeading ?? "Your Ideas. Our Design."}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, ctaHeading: e.target.value }
              })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-300 block mb-1">
            CTA Subtitle Description
          </label>
          <input
            type="text"
            value={aboutConfig.ctaSubtitle ?? "Choose your way to create better presentations with Slidebee."}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              about_cms: { ...aboutConfig, ctaSubtitle: e.target.value }
            })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-medium text-white placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#FCBF14] block">
              Primary Button
            </label>
            <input
              type="text"
              value={aboutConfig.ctaPrimaryText ?? "Explore Templates"}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, ctaPrimaryText: e.target.value }
              })}
              placeholder="Explore Templates"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
            <RouteUrlSelector
              label="Primary Destination Link"
              value={aboutConfig.ctaPrimaryLink ?? "/templates"}
              onChange={(url) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, ctaPrimaryLink: url }
              })}
              placeholder="/templates"
              dark
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-300 block">
              Secondary Button
            </label>
            <input
              type="text"
              value={aboutConfig.ctaSecondaryText ?? "Get a Custom Presentation"}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, ctaSecondaryText: e.target.value }
              })}
              placeholder="Get a Custom Presentation"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
            />
            <RouteUrlSelector
              label="Secondary Destination Link"
              value={aboutConfig.ctaSecondaryLink ?? "/ordernow"}
              onChange={(url) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, ctaSecondaryLink: url }
              })}
              placeholder="/ordernow"
              dark
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CmsAboutPanel;
