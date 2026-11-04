import React, { useState, useMemo } from "react";
import { Layers, Save, UploadCloud, X, Sparkles, Check, LayoutGrid, List, Plus } from "lucide-react";
import { uploadToR2, normalizeR2Url } from "../../../../lib/r2";

interface SuspendedCarouselManagerProps {
  currentUpperSlides: any[];
  currentLowerSlides: any[];
  onSaveCarouselSlides: () => void;
  configSaving: boolean;
  templates: any[];
  onUpdateCarouselTrack: (isUpperTrack: boolean, updatedList: any[]) => void;
}

export const SuspendedCarouselManager: React.FC<SuspendedCarouselManagerProps> = ({
  currentUpperSlides,
  currentLowerSlides,
  onSaveCarouselSlides,
  configSaving,
  templates,
  onUpdateCarouselTrack
}) => {
  const [activeMarqueeTarget, setActiveMarqueeTarget] = useState<"services_top" | "services_bottom">("services_top");
  const [isUploadingMarquee, setIsUploadingMarquee] = useState(false);
  const [marqueeManualUrl, setMarqueeManualUrl] = useState("");
  const [templateViewMode, setTemplateViewMode] = useState<"grid" | "list">("grid");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  const isUpperTrack = activeMarqueeTarget !== "services_bottom";
  const activeCarouselList = isUpperTrack ? currentUpperSlides : currentLowerSlides;

  const filteredTemplates = useMemo(() => {
    if (!templateSearchQuery.trim()) return templates;
    const q = templateSearchQuery.toLowerCase().trim();
    return templates.filter((t: any) =>
      t.title?.toLowerCase().includes(q) ||
      t.code?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  }, [templates, templateSearchQuery]);

  const updateTrack = (updatedList: any[]) => {
    onUpdateCarouselTrack(isUpperTrack, updatedList);
  };

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
            <Layers size={16} className="text-primary-amber" />
            Suspended 3D Carousel Slide Selection (/services)
          </h3>
          <p className="text-xs text-[#726F6D]">
            Curate the upper and lower auto-scrolling slide tracks for the suspended perspective carousel on the Services page.
          </p>
        </div>
        <button
          type="button"
          onClick={onSaveCarouselSlides}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow shrink-0 cursor-pointer"
        >
          <Save size={14} /> {configSaving ? "Saving..." : "Save Carousel Slides"}
        </button>
      </div>

      {/* Track Selection Switcher */}
      <div>
        <label className="text-xs font-extrabold text-[#111111] block mb-2">
          Active Carousel Track:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMarqueeTarget("services_top")}
            className={`hex-pill px-4 py-2 text-xs font-black transition-all border cursor-pointer ${
              isUpperTrack
                ? "bg-[#111111] text-[#FCBF14] border-primary shadow-md scale-105"
                : "bg-white text-[#111111] border-primary/30 hover:border-primary hover:bg-[#FFF9E8]"
            }`}
          >
            Upper Track (Right Gliding) · {currentUpperSlides.length} Slides
          </button>
          <button
            type="button"
            onClick={() => setActiveMarqueeTarget("services_bottom")}
            className={`hex-pill px-4 py-2 text-xs font-black transition-all border cursor-pointer ${
              !isUpperTrack
                ? "bg-[#111111] text-[#FCBF14] border-primary shadow-md scale-105"
                : "bg-white text-[#111111] border-primary/30 hover:border-primary hover:bg-[#FFF9E8]"
            }`}
          >
            Lower Track (Left Gliding) · {currentLowerSlides.length} Slides
          </button>
        </div>
      </div>

      {/* Currently Active Slides in Track */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider">
              Currently Active in {isUpperTrack ? "Upper" : "Lower"} Track ({activeCarouselList.length})
            </h4>
            <p className="text-[11px] text-[#726F6D]">
              These slides scroll continuously across the screen in the 3D suspended view.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm">
              <UploadCloud size={14} />
              <span>{isUploadingMarquee ? "Uploading to R2..." : "Upload Slide Image to R2"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingMarquee}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploadingMarquee(true);
                  try {
                    const r2Res = await uploadToR2(file, { folder: "carousel", fileName: file.name });
                    if (!r2Res.success || !r2Res.publicUrl) throw new Error(r2Res.error || "Upload failed");
                    const newSlide = {
                      id: `cust-${Date.now()}`,
                      title: file.name.replace(/\.[^/.]+$/, ""),
                      category: "Custom Slide",
                      image: r2Res.publicUrl,
                      code: "CUSTOM",
                    };
                    updateTrack([...activeCarouselList, newSlide]);
                  } catch (err: any) {
                    alert("Failed to upload slide to Cloudflare R2: " + (err.message || err));
                  } finally {
                    setIsUploadingMarquee(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Active Slides Cards */}
        {activeCarouselList.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-primary/30 rounded-xl bg-[#FFF9E8]/50">
            <p className="text-xs font-bold text-[#726F6D]">No slides in this track yet. Select from template covers below or upload an image.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {activeCarouselList.map((item: any, idx: number) => {
              const slideImg = typeof item === "string" ? item : (item?.image || item?.thumbnail_url || "");
              const slideTitle = typeof item === "string" ? `Slide ${idx + 1}` : (item?.title || `Slide ${idx + 1}`);
              const slideCode = typeof item === "object" ? (item?.code || item?.category || "") : "";

              return (
                <div key={idx} className="hex-card bg-white border border-primary/40 rounded-xl overflow-hidden shadow-sm relative group flex flex-col justify-between">
                  <div className="aspect-[16/10] bg-[#FFF9E8] overflow-hidden relative">
                    <img src={slideImg} alt={slideTitle} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => updateTrack(activeCarouselList.filter((_: any, i: number) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity shadow cursor-pointer"
                      title="Remove from track"
                    >
                      <X size={12} />
                    </button>
                    {slideCode && (
                      <div className="absolute bottom-1 left-1">
                        <span className="hex-pill-sm bg-[#111111]/85 text-primary text-[8px] font-black px-1.5 py-0.5">
                          {slideCode}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-[10px] font-bold text-[#111111] truncate bg-white">
                    {slideTitle}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Manual Image URL Adder */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Or paste any direct R2 / CDN image URL to add..."
            value={marqueeManualUrl}
            onChange={(e) => setMarqueeManualUrl(e.target.value)}
            className="flex-1 bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-mono"
          />
          <button
            type="button"
            onClick={() => {
              if (marqueeManualUrl.trim()) {
                const newSlide = {
                  id: `cust-${Date.now()}`,
                  title: "Custom Slide",
                  category: "Custom",
                  image: marqueeManualUrl.trim(),
                  code: "CUSTOM",
                };
                updateTrack([...activeCarouselList, newSlide]);
                setMarqueeManualUrl("");
              }
            }}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs cursor-pointer shadow-sm"
          >
            + Add URL
          </button>
        </div>

        {/* Template Cover Images Picker */}
        <div className="pt-6 border-t border-[#111111]/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-primary-amber" />
              Select Directly from Storefront Template Cover Images
            </h4>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="Filter templates..."
                  className="pl-3 pr-3 py-1 text-xs bg-white border border-[#111111]/15 rounded-lg outline-none focus:border-primary font-medium w-44"
                />
              </div>
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#111111]/15 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTemplateViewMode("grid")}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    templateViewMode === "grid" ? "bg-primary text-[#111111]" : "text-[#726F6D]"
                  }`}
                  title="Gallery Grid"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateViewMode("list")}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    templateViewMode === "list" ? "bg-primary text-[#111111]" : "text-[#726F6D]"
                  }`}
                  title="List View"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {templateViewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[380px] overflow-y-auto p-2 bg-[#FFF9E8]/50 rounded-2xl border border-primary/25">
              {filteredTemplates.map((tpl: any) => {
                const coverImg = normalizeR2Url(
                  tpl.image_url || tpl.thumbnail_url || tpl.image || "/portfolio/case_study_a_1.png"
                );
                const isSelected = activeCarouselList.some((item: any) => {
                  const itemImg = typeof item === "string" ? item : item?.image;
                  return itemImg === coverImg || (item?.id && item.id === `tpl-${tpl.id}`);
                });

                const toggleTemplateCover = () => {
                  if (isSelected) {
                    updateTrack(
                      activeCarouselList.filter((item: any) => {
                        const itemImg = typeof item === "string" ? item : item?.image;
                        return itemImg !== coverImg && item?.id !== `tpl-${tpl.id}`;
                      })
                    );
                  } else {
                    const newSlide = {
                      id: `tpl-${tpl.id}`,
                      title: tpl.title,
                      category: tpl.category || "Keynote",
                      image: coverImg,
                      code: tpl.code || `SLD-${String(tpl.id).slice(0, 4)}`,
                    };
                    updateTrack([...activeCarouselList, newSlide]);
                  }
                };

                return (
                  <div
                    key={tpl.id}
                    onClick={toggleTemplateCover}
                    className={`hex-card rounded-xl overflow-hidden border-2 cursor-pointer transition-all p-1 group flex flex-col justify-between ${
                      isSelected
                        ? "border-green-600 bg-green-50/50 ring-2 ring-green-400"
                        : "border-primary/30 bg-white hover:border-primary"
                    }`}
                  >
                    <div className="aspect-[16/10] bg-[#FFF9E8] rounded overflow-hidden relative">
                      <img
                        src={coverImg}
                        alt={tpl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-0.5 shadow">
                          <Check size={12} />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1">
                        <span className="hex-pill-sm bg-[#111111]/85 text-primary text-[8px] font-black px-1.5 py-0.5">
                          {tpl.code || "SLD"}
                        </span>
                      </div>
                    </div>
                    <div className="p-1 text-[10px] font-extrabold text-[#111111] truncate">
                      {tpl.title}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#111111]/10 overflow-hidden shadow-2xs max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] text-[10px] font-black uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3">Active</th>
                    <th className="py-2 px-3">Cover</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/6 font-medium">
                  {filteredTemplates.map((tpl: any) => {
                    const coverImg = normalizeR2Url(
                      tpl.image_url || tpl.thumbnail_url || tpl.image || "/portfolio/case_study_a_1.png"
                    );
                    const isSelected = activeCarouselList.some((item: any) => {
                      const itemImg = typeof item === "string" ? item : item?.image;
                      return itemImg === coverImg || (item?.id && item.id === `tpl-${tpl.id}`);
                    });

                    const toggleTemplateCover = () => {
                      if (isSelected) {
                        updateTrack(
                          activeCarouselList.filter((item: any) => {
                            const itemImg = typeof item === "string" ? item : item?.image;
                            return itemImg !== coverImg && item?.id !== `tpl-${tpl.id}`;
                          })
                        );
                      } else {
                        const newSlide = {
                          id: `tpl-${tpl.id}`,
                          title: tpl.title,
                          category: tpl.category || "Keynote",
                          image: coverImg,
                          code: tpl.code || `SLD-${String(tpl.id).slice(0, 4)}`,
                        };
                        updateTrack([...activeCarouselList, newSlide]);
                      }
                    };

                    return (
                      <tr 
                        key={tpl.id}
                        onClick={toggleTemplateCover}
                        className={`hover:bg-primary/5 transition-colors cursor-pointer ${
                          isSelected ? "bg-green-50/60" : ""
                        }`}
                      >
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                            isSelected ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {isSelected ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                            {isSelected ? "Track" : "Off"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="w-10 h-7 rounded bg-gray-100 overflow-hidden border border-[#111111]/10">
                            <img src={coverImg} alt={tpl.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[#111111] text-[10px]">
                          {tpl.code || `SLD-${String(tpl.id).slice(0, 4)}`}
                        </td>
                        <td className="py-2 px-4 font-heading font-extrabold text-[#111111] max-w-xs truncate">
                          {tpl.title}
                        </td>
                        <td className="py-2 px-3 text-[#726F6D] text-[11px]">
                          {tpl.category || "Keynote"}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTemplateCover();
                            }}
                            className={`text-[10px] font-black px-2.5 py-1 rounded transition-all cursor-pointer ${
                              isSelected
                                ? "bg-red-100 hover:bg-red-200 text-red-800"
                                : "bg-primary hover:bg-primary-dark text-[#111111]"
                            }`}
                          >
                            {isSelected ? "Remove" : "+ Add"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
