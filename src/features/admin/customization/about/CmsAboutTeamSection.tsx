import React, { useState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadToR2 } from "../../../../lib/r2";

interface CmsAboutTeamSectionProps {
  aboutConfig: any;
  siteConfigs: any;
  setSiteConfigs: React.Dispatch<React.SetStateAction<any>>;
}

export const CmsAboutTeamSection: React.FC<CmsAboutTeamSectionProps> = ({
  aboutConfig,
  siteConfigs,
  setSiteConfigs,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadTeamImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadToR2(file, { folder: "about-assets" });
      if (res.success && res.publicUrl) {
        setSiteConfigs({
          ...siteConfigs,
          about_cms: {
            ...aboutConfig,
            teamImage: res.publicUrl,
          },
        });
      }
    } catch (err) {
      console.warn("About team image upload failed:", err);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="bg-[#FFF9E8] p-5 rounded-2xl border border-primary/30 space-y-4">
      <div className="flex items-center gap-2 border-b border-[#111111]/8 pb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FCBF14]" />
        <h4 className="font-heading font-extrabold text-xs text-[#111111] uppercase tracking-wider">
          Section 1: Our Team Spotlight
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold text-[#111111] block mb-1">
            Eyebrow Label
          </label>
          <input
            type="text"
            value={aboutConfig.teamEyebrow ?? "OUR TEAM"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              about_cms: { ...aboutConfig, teamEyebrow: e.target.value }
            })}
            placeholder="OUR TEAM"
            className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-[#111111]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#111111] block mb-1">
            CTA Button Label & Link
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={aboutConfig.teamCtaText ?? "Meet Our Work"}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, teamCtaText: e.target.value }
              })}
              placeholder="Meet Our Work"
              className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-[#111111]"
            />
            <input
              type="text"
              value={aboutConfig.teamCtaLink ?? "/examples"}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, teamCtaLink: e.target.value }
              })}
              placeholder="/examples"
              className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-medium text-[#111111]"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold text-[#111111] block mb-1">
          Main Team Heading (Supports Line Breaks)
        </label>
        <textarea
          rows={3}
          value={aboutConfig.teamHeading ?? "A Specialized\nPresentation\nDesign Team."}
          onChange={(e) => setSiteConfigs({
            ...siteConfigs,
            about_cms: { ...aboutConfig, teamHeading: e.target.value }
          })}
          className="w-full bg-white border border-[#111111]/12 rounded-xl p-2.5 text-xs font-bold text-[#111111]"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-[#111111] block mb-1">
          Team Subtitle Paragraph
        </label>
        <textarea
          rows={2}
          value={aboutConfig.teamSubtitle ?? "Slidebee is powered by a team of presentation designers, visual storytellers, and creative professionals with extensive experience across industries."}
          onChange={(e) => setSiteConfigs({
            ...siteConfigs,
            about_cms: { ...aboutConfig, teamSubtitle: e.target.value }
          })}
          className="w-full bg-white border border-[#111111]/12 rounded-xl p-2.5 text-xs font-medium text-[#111111]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#111111]/6">
        {/* Team Photo with R2 Uploader */}
        <div className="bg-white p-3 rounded-xl border border-primary/25 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold text-[#111111] block">
              Team Photo (Cloudflare R2)
            </label>
            <label className="cursor-pointer text-[9px] font-bold text-[#111111] bg-primary hover:bg-primary-dark px-2.5 py-1 rounded-md flex items-center gap-1 shadow-xs">
              <UploadCloud size={11} /> {uploadingImage ? "Uploading..." : "Upload to R2"}
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                className="hidden"
                onChange={handleUploadTeamImage}
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            {aboutConfig.teamImage && (
              <img
                src={aboutConfig.teamImage}
                alt="Team Preview"
                className="w-14 h-10 object-cover rounded border border-primary/30 flex-shrink-0"
              />
            )}
            <input
              type="text"
              value={aboutConfig.teamImage ?? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"}
              onChange={(e) => setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, teamImage: e.target.value }
              })}
              placeholder="Image URL or upload"
              className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded px-2.5 py-1.5 text-[11px] font-mono"
            />
          </div>
        </div>

        {/* Yellow Sticky Note Text */}
        <div className="bg-white p-3 rounded-xl border border-primary/25 space-y-1">
          <label className="text-[11px] font-extrabold text-[#111111] block">
            Yellow Sticky Note Text
          </label>
          <textarea
            rows={3}
            value={aboutConfig.teamNote ?? "Different\nPerspectives\nBetter Slides"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              about_cms: { ...aboutConfig, teamNote: e.target.value }
            })}
            placeholder={"Different\nPerspectives\nBetter Slides"}
            className="w-full bg-[#FFFDF5] border border-primary/30 rounded-lg p-2 text-xs font-bold text-[#111111]"
          />
        </div>
      </div>
    </div>
  );
};
