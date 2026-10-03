import React from "react";

interface CmsAboutVisionSectionProps {
  aboutConfig: any;
  siteConfigs: any;
  setSiteConfigs: React.Dispatch<React.SetStateAction<any>>;
}

export const CmsAboutVisionSection: React.FC<CmsAboutVisionSectionProps> = ({
  aboutConfig,
  siteConfigs,
  setSiteConfigs,
}) => {
  return (
    <div className="bg-[#FFF9E8] p-5 rounded-2xl border border-primary/30 space-y-4">
      <div className="flex items-center gap-2 border-b border-[#111111]/8 pb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FCBF14]" />
        <h4 className="font-heading font-extrabold text-xs text-[#111111] uppercase tracking-wider">
          Section 2: Our Vision
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold text-[#111111] block mb-1">
            Vision Eyebrow Label
          </label>
          <input
            type="text"
            value={aboutConfig.visionEyebrow ?? "OUR VISION"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              about_cms: { ...aboutConfig, visionEyebrow: e.target.value }
            })}
            className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-[#111111]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#111111] block mb-1">
            Vision Sticky Note / Badge Text
          </label>
          <input
            type="text"
            value={aboutConfig.visionNote ?? "Clear Ideas Create Bigger Opportunities"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              about_cms: { ...aboutConfig, visionNote: e.target.value }
            })}
            className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-[#111111]"
          />
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold text-[#111111] block mb-1">
          Vision Heading (Supports Line Breaks)
        </label>
        <textarea
          rows={2}
          value={aboutConfig.visionHeading ?? "A Global Destination\nfor Better Presentations."}
          onChange={(e) => setSiteConfigs({
            ...siteConfigs,
            about_cms: { ...aboutConfig, visionHeading: e.target.value }
          })}
          className="w-full bg-white border border-[#111111]/12 rounded-xl p-2.5 text-xs font-bold text-[#111111]"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-[#111111] block mb-1">
          Vision Subtitle Paragraph
        </label>
        <textarea
          rows={2}
          value={aboutConfig.visionSubtitle ?? "We aim to make Slidebee a trusted global destination for presentation design — where anyone can find the right tools, templates, and creative expertise to communicate their ideas more effectively."}
          onChange={(e) => setSiteConfigs({
            ...siteConfigs,
            about_cms: { ...aboutConfig, visionSubtitle: e.target.value }
          })}
          className="w-full bg-white border border-[#111111]/12 rounded-xl p-2.5 text-xs font-medium text-[#111111]"
        />
      </div>
    </div>
  );
};
