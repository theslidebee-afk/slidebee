import React, { useState } from "react";
import { RouteUrlSelector } from "../../shared/RouteUrlSelector";
import { Sparkles, UploadCloud, Trash2 } from "lucide-react";
import { uploadToR2 } from "../../../../lib/r2";

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
  const [uploadingTopBarImage, setUploadingTopBarImage] = useState(false);

  const topBar = siteConfigs["home_top_bar"] || {
    enabled: true,
    badge: "STUDIO SPECIAL",
    title: "100+ Board-Ready Presentation Templates & Frameworks",
    ctaText: "Explore Studio",
    ctaLink: "#templates",
  };

  const handleUploadTopBarImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTopBarImage(true);
    try {
      const res = await uploadToR2(file, { folder: "banners/promo" });
      if (res.success && res.publicUrl) {
        setSiteConfigs({
          ...siteConfigs,
          home_top_bar: { ...topBar, imageUrl: res.publicUrl },
        });
      }
    } catch (err) {
      console.warn("Announcement banner image upload failed:", err);
    } finally {
      setUploadingTopBarImage(false);
      if (e.target) e.target.value = "";
    }
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

      {/* TOP ANNOUNCEMENT BAR: ATTACHED NAVBAR PROMOTIONAL BANNER */}
      <div className="bg-[#181818] text-white p-5 sm:p-6 rounded-2xl border-2 border-[#FCBF14]/40 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FCBF14]" />
            <h5 className="font-heading font-black text-xs text-[#FCBF14] uppercase tracking-wider">
              Attached Navbar Promotional Banner (Homepage Only)
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
              {configSaving ? "Saving..." : "Save Attached Banner"}
            </button>
          </div>
        </div>

        {/* Live Preview Strip */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
            Live Preview (Attached Directly Beneath Fixed Navbar):
          </span>
          <div className="w-full bg-[#161616] rounded-xl border border-white/10 py-2 px-4 flex items-center justify-center overflow-hidden select-none">
            {topBar.imageUrl ? (
              <img
                src={topBar.imageUrl}
                alt="Promotion Banner Preview"
                className="max-h-11 w-auto max-w-full object-contain rounded select-none shadow-xs"
              />
            ) : (
              <div className="h-8 w-full max-w-xl rounded-lg border border-dashed border-[#FCBF14]/40 bg-[#FCBF14]/5 flex items-center justify-center text-[#FCBF14] text-[11px] font-heading font-extrabold tracking-wider gap-2 select-none px-3">
                <Sparkles size={12} className="text-[#FCBF14] shrink-0" />
                <span className="truncate">SLIDEBEE EXECUTIVE PRESENTATION STUDIO &middot; CURATED TEMPLATES & BESPOKE DECKS</span>
              </div>
            )}
          </div>
        </div>

        {/* Destination Link Selector */}
        <div>
          <RouteUrlSelector
            label="Banner Destination Click Link"
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

        {/* Promotional Graphic / Animated GIF Uploader */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-[11px] font-bold text-gray-300 block">
              Promotional Graphic / Animated GIF (Cloudflare R2: <code className="text-[#FCBF14] font-mono">banners/promo/</code>)
            </label>
            <span className="text-[10px] text-[#FCBF14] font-mono font-bold">
              Standard: 1920x48px (Full-width edge-to-edge strip)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topBar.imageUrl || ""}
              onChange={(e) =>
                setSiteConfigs({
                  ...siteConfigs,
                  home_top_bar: { ...topBar, imageUrl: e.target.value },
                })
              }
              placeholder="https://... (or upload animated GIF / image to R2 below)"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-gray-400 focus:outline-none focus:border-[#FCBF14]"
            />

            <label className="hex-pill-sm bg-[#FCBF14] hover:bg-[#D99B00] text-[#111111] text-xs font-black px-4 py-2 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow">
              <UploadCloud size={14} />
              <span>{uploadingTopBarImage ? "Uploading..." : "Upload Image / GIF to R2"}</span>
              <input
                type="file"
                accept="image/gif,image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleUploadTopBarImage}
                disabled={uploadingTopBarImage}
                className="hidden"
              />
            </label>

            {topBar.imageUrl && (
              <button
                type="button"
                onClick={() =>
                  setSiteConfigs({
                    ...siteConfigs,
                    home_top_bar: { ...topBar, imageUrl: "" },
                  })
                }
                className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                title="Remove image"
              >
                <Trash2 size={13} />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Upload an edge-to-edge strip graphic (<span className="text-[#FCBF14] font-bold">1920×48 px</span> or animated <span className="text-[#FCBF14] font-bold">.GIF</span>). For optimal responsive display across all monitors, center key text/icons within the middle <span className="text-white font-bold">1200 px</span> and extend background color across full width. Uploaded directly to <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">banners/promo/</code>.
          </p>
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
