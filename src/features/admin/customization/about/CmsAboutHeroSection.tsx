import React, { useState } from "react";
import { UploadCloud, Trash2, Image, Sparkles } from "lucide-react";
import { uploadToR2 } from "../../../../lib/r2";

interface CmsAboutHeroSectionProps {
  aboutConfig: any;
  siteConfigs: any;
  setSiteConfigs: React.Dispatch<React.SetStateAction<any>>;
}

export const CmsAboutHeroSection: React.FC<CmsAboutHeroSectionProps> = ({
  aboutConfig,
  siteConfigs,
  setSiteConfigs,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadToR2(file, { folder: "about-hero" });
      if (res.success && res.publicUrl) {
        setSiteConfigs({
          ...siteConfigs,
          about_cms: {
            ...aboutConfig,
            heroImage: res.publicUrl,
          },
        });
      }
    } catch (err) {
      console.warn("About hero image upload failed:", err);
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveHeroImage = () => {
    setSiteConfigs({
      ...siteConfigs,
      about_cms: {
        ...aboutConfig,
        heroImage: "",
      },
    });
  };

  return (
    <div className="bg-[#FFF9E8] p-5 rounded-2xl border border-primary/30 space-y-4">
      <div className="flex items-center justify-between border-b border-[#111111]/8 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCBF14]" />
          <h4 className="font-heading font-extrabold text-xs text-[#111111] uppercase tracking-wider">
            Hero: Our Team Architectural Masthead (/about)
          </h4>
        </div>
        <span className="text-[10px] font-bold text-[#726F6D] uppercase tracking-wider">
          Dark Duotone Full-Bleed
        </span>
      </div>

      {/* Team Main Heading (Supports Line Breaks) */}
      <div>
        <label className="text-[11px] font-bold text-[#111111] block mb-1">
          Hero Main Heading (Supports Line Breaks)
        </label>
        <textarea
          rows={2}
          value={
            aboutConfig.teamHeading ??
            aboutConfig.heroTitle ??
            "A Specialized\nPresentation\nDesign Team."
          }
          onChange={(e) =>
            setSiteConfigs({
              ...siteConfigs,
              about_cms: { ...aboutConfig, teamHeading: e.target.value },
            })
          }
          placeholder="A Specialized&#10;Presentation&#10;Design Team."
          className="w-full bg-white border border-[#111111]/15 rounded-lg p-2.5 text-xs font-bold text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Subtitle / Lead Narrative */}
      <div>
        <label className="text-[11px] font-bold text-[#111111] block mb-1">
          Hero Subtitle / Team Narrative
        </label>
        <textarea
          rows={2}
          value={
            aboutConfig.teamSubtitle ??
            aboutConfig.heroSubtitle ??
            "Slidebee is powered by a team of presentation designers, visual storytellers, and creative professionals with extensive experience across industries."
          }
          onChange={(e) =>
            setSiteConfigs({
              ...siteConfigs,
              about_cms: { ...aboutConfig, teamSubtitle: e.target.value },
            })
          }
          placeholder="Slidebee is powered by a team of presentation designers..."
          className="w-full bg-white border border-[#111111]/15 rounded-lg p-2.5 text-xs font-medium text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Hero CTA Button Label & Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold text-[#111111] block mb-1">
            CTA Button Label
          </label>
          <input
            type="text"
            value={aboutConfig.teamCtaText ?? "Meet Our Work"}
            onChange={(e) =>
              setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, teamCtaText: e.target.value },
              })
            }
            placeholder="Meet Our Work"
            className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#111111] block mb-1">
            CTA Button Destination Link
          </label>
          <input
            type="text"
            value={aboutConfig.teamCtaLink ?? "/examples"}
            onChange={(e) =>
              setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, teamCtaLink: e.target.value },
              })
            }
            placeholder="/examples"
            className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-1.5 text-xs font-medium text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Color Overlay Theme Palette */}
      <div>
        <label className="text-[11px] font-bold text-[#111111] block mb-1 flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#D99B00]" />
          <span>Color Overlay Palette</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() =>
              setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, heroColorTheme: "charcoal_amber" },
              })
            }
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              (aboutConfig.heroColorTheme ?? "charcoal_amber") === "charcoal_amber"
                ? "bg-[#111111] text-white border-[#FCBF14] ring-2 ring-[#FCBF14]/40"
                : "bg-white text-[#111111] border-[#111111]/15 hover:border-primary"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-[#FCBF14] shrink-0" />
              <span className="text-xs font-extrabold truncate">Charcoal & Amber</span>
            </div>
            <p className="text-[10px] opacity-75 leading-tight">
              Executive studio signature wash (Recommended)
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, heroColorTheme: "pine_emerald" },
              })
            }
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              aboutConfig.heroColorTheme === "pine_emerald"
                ? "bg-[#0A1F13] text-white border-[#FCBF14] ring-2 ring-[#FCBF14]/40"
                : "bg-white text-[#111111] border-[#111111]/15 hover:border-primary"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs font-extrabold truncate">Pine Emerald</span>
            </div>
            <p className="text-[10px] opacity-75 leading-tight">
              Earthy luxury green duotone tone
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setSiteConfigs({
                ...siteConfigs,
                about_cms: { ...aboutConfig, heroColorTheme: "midnight_obsidian" },
              })
            }
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              aboutConfig.heroColorTheme === "midnight_obsidian"
                ? "bg-[#0D0D0D] text-white border-[#FCBF14] ring-2 ring-[#FCBF14]/40"
                : "bg-white text-[#111111] border-[#111111]/15 hover:border-primary"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-neutral-400 shrink-0" />
              <span className="text-xs font-extrabold truncate">Midnight Obsidian</span>
            </div>
            <p className="text-[10px] opacity-75 leading-tight">
              Minimal monochromatic cinema tone
            </p>
          </button>
        </div>
      </div>

      {/* Hero Background Image Uploader & URL Input */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
          <label className="text-[11px] font-bold text-[#111111] block">
            Hero Background Image (Cloudflare R2)
          </label>
          <span className="text-[10px] font-bold text-[#D99B00] bg-[#FCBF14]/15 border border-[#FCBF14]/40 px-2 py-0.5 rounded w-fit">
            Recommended: 1920 × 1080 px or 2560 × 1440 px (16:9 Landscape Full-Page Stage)
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={aboutConfig.heroImage ?? ""}
              onChange={(e) =>
                setSiteConfigs({
                  ...siteConfigs,
                  about_cms: { ...aboutConfig, heroImage: e.target.value },
                })
              }
              placeholder="https://... (or upload directly to R2 below)"
              className="flex-1 bg-white border border-[#111111]/15 rounded-lg px-3 py-1.5 text-xs font-mono text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-primary"
            />
            
            <label className="hex-pill-sm bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow">
              <UploadCloud size={14} className="text-[#FCBF14]" />
              <span>{uploadingImage ? "Uploading..." : "Upload to R2"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadHeroImage}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Preview Card */}
          {aboutConfig.heroImage ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#111111]/15 group">
              <img
                src={aboutConfig.heroImage}
                alt="About Hero Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleRemoveHeroImage}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow cursor-pointer"
                >
                  <Trash2 size={13} /> Remove Image
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-24 rounded-xl border border-dashed border-[#111111]/20 bg-white/60 flex flex-col items-center justify-center text-[#726F6D] text-xs">
              <Image size={20} className="mb-1 opacity-50" />
              <span>Using default high-res studio hero background</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
