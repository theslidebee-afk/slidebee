import React, { useState } from "react";
import { RouteUrlSelector } from "../../shared/RouteUrlSelector";
import { uploadToR2 } from "../../../../lib/r2";
import { UploadCloud, Trash2, Image, Sparkles } from "lucide-react";

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
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);

  const bannerTop = siteConfigs["home_banner_top"] || {
    enabled: true,
    badge: "EXECUTIVE SUITE",
    title: "100+ Board-Ready Presentation Templates & Frameworks",
    subtitle: "Built for founders, management consultants, and enterprise teams. 100% editable .pptx slides.",
    ctaText: "Explore Full Studio",
    ctaLink: "#templates",
    imageUrl: "",
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBannerImage(true);
    try {
      const res = await uploadToR2(file, { folder: "banners" });
      setSiteConfigs({
        ...siteConfigs,
        home_banner_top: {
          ...bannerTop,
          imageUrl: res.publicUrl,
        },
      });
    } catch (err: any) {
      alert("Failed to upload image to Cloudflare R2: " + (err.message || err));
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const handleSaveAllBanners = () => {
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
    handleSaveConfig("home_banner_top", bannerTop);
    handleSaveConfig("home_banner_1", banner1);
    handleSaveConfig("home_banner_2", banner2);
  };

  return (
    <div className="pt-6 border-t border-[#111111]/8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#111111]/8">
        <div>
          <h4 className="text-sm font-heading font-extrabold text-[#111111]">
            Homepage Hero Promotional Banners (3 Banners)
          </h4>
          <p className="text-xs text-[#726F6D]">
            Customize the 3rd wide executive banner on top, and the two split banners below.
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

      {/* BANNER 3: 3rd Top Banner spanning across */}
      <div className="bg-[#181818] text-white p-5 sm:p-6 rounded-2xl border-2 border-[#FCBF14]/40 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FCBF14]" />
            <h5 className="font-heading font-black text-xs text-[#FCBF14] uppercase tracking-wider">
              Banner 3 (Full-Width Top Executive Banner with Image)
            </h5>
          </div>

          {/* Visibility Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-200">
            <span>Show Top Banner on Homepage:</span>
            <input
              type="checkbox"
              checked={bannerTop.enabled !== false}
              onChange={(e) =>
                setSiteConfigs({
                  ...siteConfigs,
                  home_banner_top: { ...bannerTop, enabled: e.target.checked },
                })
              }
              className="w-4 h-4 accent-[#FCBF14] cursor-pointer"
            />
            <span className="text-[11px] font-black text-[#FCBF14]">
              {bannerTop.enabled !== false ? "ENABLED" : "HIDDEN"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Text Config (8 Cols) */}
          <div className="lg:col-span-8 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Badge Text</label>
                <input
                  type="text"
                  value={bannerTop.badge || ""}
                  onChange={(e) =>
                    setSiteConfigs({
                      ...siteConfigs,
                      home_banner_top: { ...bannerTop, badge: e.target.value },
                    })
                  }
                  placeholder="EXECUTIVE SUITE"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Button Label</label>
                <input
                  type="text"
                  value={bannerTop.ctaText || ""}
                  onChange={(e) =>
                    setSiteConfigs({
                      ...siteConfigs,
                      home_banner_top: { ...bannerTop, ctaText: e.target.value },
                    })
                  }
                  placeholder="Explore Full Studio"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">Headline</label>
              <input
                type="text"
                value={bannerTop.title || ""}
                onChange={(e) =>
                  setSiteConfigs({
                    ...siteConfigs,
                    home_banner_top: { ...bannerTop, title: e.target.value },
                  })
                }
                placeholder="100+ Board-Ready Presentation Templates & Frameworks"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs font-bold text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-300 block mb-1">Supporting Description</label>
              <textarea
                rows={2}
                value={bannerTop.subtitle || ""}
                onChange={(e) =>
                  setSiteConfigs({
                    ...siteConfigs,
                    home_banner_top: { ...bannerTop, subtitle: e.target.value },
                  })
                }
                placeholder="Built for founders, management consultants, and enterprise teams. 100% editable .pptx slides."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-xs font-medium text-white placeholder:text-gray-400"
              />
            </div>

            <div>
              <RouteUrlSelector
                label="Button Destination Link"
                value={bannerTop.ctaLink || ""}
                onChange={(url) =>
                  setSiteConfigs({
                    ...siteConfigs,
                    home_banner_top: { ...bannerTop, ctaLink: url },
                  })
                }
                placeholder="#templates"
                dark
              />
            </div>
          </div>

          {/* Right: Cloudflare R2 Image Uploader (4 Cols) */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <label className="text-[11px] font-black uppercase text-[#FCBF14] tracking-wider block mb-2">
                Banner Showcase Image (R2)
              </label>
              <p className="text-[11px] text-gray-300 mb-3">
                Upload a presentation mockup or executive slide visual to display on the right side of the top banner.
              </p>

              {bannerTop.imageUrl ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#FCBF14]/40 bg-black/50 mb-3 shadow-inner">
                  <img
                    src={bannerTop.imageUrl}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSiteConfigs({
                        ...siteConfigs,
                        home_banner_top: { ...bannerTop, imageUrl: "" },
                      })
                    }
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md shadow-md transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-gray-400 mb-3">
                  <Image size={24} className="mb-1 text-gray-500" />
                  <span className="text-[10px] font-bold">No Image Uploaded</span>
                </div>
              )}
            </div>

            <div>
              <label className="hex-pill bg-[#FCBF14] hover:bg-[#D99B00] text-[#111111] font-black text-xs py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all">
                <UploadCloud size={14} />
                <span>{uploadingBannerImage ? "Uploading to R2..." : "Upload Image to R2"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingBannerImage}
                  className="hidden"
                />
              </label>
            </div>
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
