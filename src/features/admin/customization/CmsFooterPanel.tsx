import React from "react";
import { Save } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const CmsFooterPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving } = useAdmin();

  const footerConfig = siteConfigs["footer_cms"] || {};

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            Footer Social Media & Brand Links Customizer
          </h3>
          <p className="text-xs text-[#726F6D]">
            Update LinkedIn, Twitter/X, Instagram, and Dribbble channels
          </p>
        </div>
        <button
          onClick={() => handleSaveConfig("footer_cms", footerConfig)}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save size={14} /> {configSaving ? "Saving..." : "Save Footer Links"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={footerConfig.showSocialIcons !== false}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                footer_cms: { ...footerConfig, showSocialIcons: e.target.checked }
              })}
              className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
            />
            <span className="text-xs font-bold text-[#111111]">Show Social Media Icons in Footer</span>
          </label>
        </div>
        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={footerConfig.linkedinUrl || "https://linkedin.com/company/theslidebee"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              footer_cms: { ...footerConfig, linkedinUrl: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Twitter / X URL
          </label>
          <input
            type="url"
            value={footerConfig.twitterUrl || "https://twitter.com/theslidebee"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              footer_cms: { ...footerConfig, twitterUrl: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Instagram URL
          </label>
          <input
            type="url"
            value={footerConfig.instagramUrl || "https://instagram.com/theslidebee"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              footer_cms: { ...footerConfig, instagramUrl: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Dribbble Portfolio URL
          </label>
          <input
            type="url"
            value={footerConfig.dribbbleUrl || "https://dribbble.com/theslidebee"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              footer_cms: { ...footerConfig, dribbbleUrl: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-[#111111] block mb-1">
          Brand Tagline
        </label>
        <input
          type="text"
          value={footerConfig.tagline || "Elevating presentations for world-class brands."}
          onChange={(e) => setSiteConfigs({
            ...siteConfigs,
            footer_cms: { ...footerConfig, tagline: e.target.value }
          })}
          className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
        />
      </div>
    </div>
  );
};
