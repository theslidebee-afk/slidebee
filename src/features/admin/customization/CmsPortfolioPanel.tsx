import React, { useState } from "react";
import { Save, Trash2, UploadCloud, ArrowLeft, ArrowRight } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { uploadToR2 } from "../../../lib/r2";

const DEFAULT_PORTFOLIO_CASE_STUDIES = [
  {
    id: 1,
    title: "Series B Growth & Capital Markets Deck",
    client: "Fintech Platform",
    category: "Fundraising",
    storageFolder: "portfolio",
    slides: [
      "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg",
      "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-2.jpg",
    ],
    imageUrl: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg",
    impact: "$42M Secured",
    description: "Multi-jurisdiction investor deck showcasing unit economics, ARR trajectory, and expansion strategy.",
    deliverables: ["Master PowerPoint (.pptx)", "Executive PDF"]
  },
  {
    id: 2,
    title: "Global Supply Chain & Logistics Strategy",
    client: "Enterprise Retailer",
    category: "Strategy & Operations",
    storageFolder: "portfolio",
    slides: [
      "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg",
      "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-2.jpg",
    ],
    imageUrl: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg",
    impact: "Board Unanimously Approved",
    description: "Corporate strategic realignment roadmap across 24 regional distribution hubs.",
    deliverables: ["Master PowerPoint (.pptx)", "Executive One-Pager"]
  }
];

export const CmsPortfolioPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving } = useAdmin();
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const currentStudies: any[] =
    siteConfigs["portfolio_cms"]?.caseStudies && siteConfigs["portfolio_cms"].caseStudies.length > 0
      ? siteConfigs["portfolio_cms"].caseStudies
      : DEFAULT_PORTFOLIO_CASE_STUDIES;

  const updateCaseStudies = (nextStudies: any[]) => {
    const nextCfg = {
      ...(siteConfigs["portfolio_cms"] || {}),
      caseStudies: nextStudies
    };
    setSiteConfigs((prev) => ({ ...prev, portfolio_cms: nextCfg }));
    return nextCfg;
  };

  const updateAndSave = (nextStudies: any[]) => {
    const nextCfg = updateCaseStudies(nextStudies);
    handleSaveConfig("portfolio_cms", nextCfg);
  };

  const handleUploadCover = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await uploadToR2(file, { folder: "portfolio/covers" });
      if (res.success && res.publicUrl) {
        const updated = [...currentStudies];
        const existingSlides = Array.isArray(updated[idx].slides) ? [...updated[idx].slides] : [];
        if (existingSlides.length === 0) existingSlides.push(res.publicUrl);
        else existingSlides[0] = res.publicUrl;

        updated[idx] = {
          ...updated[idx],
          imageUrl: res.publicUrl,
          slides: existingSlides,
        };
        updateAndSave(updated);
      }
    } catch (err) {
      console.warn("Cover upload failed:", err);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadSlides = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingIdx(idx);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadToR2(file, { folder: "portfolio/slides", fileName: file.name });
        if (res.success && res.publicUrl) {
          uploadedUrls.push(res.publicUrl);
        }
      }
      if (uploadedUrls.length > 0) {
        const updated = [...currentStudies];
        const currentSlides = Array.isArray(updated[idx].slides) ? [...updated[idx].slides] : [];
        updated[idx] = {
          ...updated[idx],
          slides: [...currentSlides, ...uploadedUrls],
          imageUrl: updated[idx].imageUrl || uploadedUrls[0]
        };
        updateAndSave(updated);
      }
    } catch (err) {
      console.warn("Slides upload failed:", err);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveSlide = (csIdx: number, slideIdx: number) => {
    const updated = [...currentStudies];
    const currentSlides = Array.isArray(updated[csIdx].slides) ? [...updated[csIdx].slides] : [];
    currentSlides.splice(slideIdx, 1);
    updated[csIdx] = {
      ...updated[csIdx],
      slides: currentSlides
    };
    updateAndSave(updated);
  };

  const handleMoveSlide = (csIdx: number, slideIdx: number, direction: "left" | "right") => {
    const updated = [...currentStudies];
    const currentSlides = Array.isArray(updated[csIdx].slides) ? [...updated[csIdx].slides] : [];
    const targetIdx = direction === "left" ? slideIdx - 1 : slideIdx + 1;
    if (targetIdx < 0 || targetIdx >= currentSlides.length) return;
    const temp = currentSlides[slideIdx];
    currentSlides[slideIdx] = currentSlides[targetIdx];
    currentSlides[targetIdx] = temp;
    updated[csIdx] = { ...updated[csIdx], slides: currentSlides };
    updateAndSave(updated);
  };

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            Portfolio & Case Studies Customizer (/examples)
          </h3>
          <p className="text-xs text-[#726F6D]">
            Add, edit, or remove client presentation showcase items, slides, and R2 assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const newCS = {
                id: Date.now(),
                title: "New Presentation Case Study",
                client: "Client / Enterprise Name",
                category: "Strategy & Operations",
                storageFolder: "portfolio",
                slides: [],
                imageUrl: "",
                impact: "e.g. $10M Raised / Board Approved",
                description: "Executive presentation deck tailored for high-stakes business meetings.",
                deliverables: ["Master PowerPoint (.pptx)", "High-Res PDF"]
              };
              updateAndSave([newCS, ...currentStudies]);
            }}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            + Add Case Study
          </button>
          <button
            type="button"
            onClick={() => handleSaveConfig("portfolio_cms", { ...(siteConfigs["portfolio_cms"] || {}), caseStudies: currentStudies })}
            disabled={configSaving}
            className="hex-pill bg-[#111111] hover:bg-black text-[#FCBF14] font-black px-5 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Save size={14} /> {configSaving ? "Saving..." : "Save Portfolio"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentStudies.map((cs: any, idx: number) => {
          return (
            <div key={cs.id || idx} className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-primary-amber uppercase tracking-wider">
                  Case Study #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = currentStudies.filter((_, i) => i !== idx);
                    updateAndSave(next);
                  }}
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 size={13} className="inline mr-1" /> Delete Case Study
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#111111] block mb-1">Title</label>
                  <input
                    type="text"
                    value={cs.title || ""}
                    onChange={(e) => {
                      const updated = [...currentStudies];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      updateCaseStudies(updated);
                    }}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#111111] block mb-1">Client Name</label>
                  <input
                    type="text"
                    value={cs.client || ""}
                    onChange={(e) => {
                      const updated = [...currentStudies];
                      updated[idx] = { ...updated[idx], client: e.target.value };
                      updateCaseStudies(updated);
                    }}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#111111] block mb-1">Outcome / Impact Badge</label>
                  <input
                    type="text"
                    value={cs.impact || ""}
                    onChange={(e) => {
                      const updated = [...currentStudies];
                      updated[idx] = { ...updated[idx], impact: e.target.value };
                      updateCaseStudies(updated);
                    }}
                    placeholder="e.g. $42M Raised"
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#111111] block mb-1">Category</label>
                  <input
                    type="text"
                    value={cs.category || ""}
                    onChange={(e) => {
                      const updated = [...currentStudies];
                      updated[idx] = { ...updated[idx], category: e.target.value };
                      updateCaseStudies(updated);
                    }}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-[#111111]">Primary Cover Image</label>
                  <label className="cursor-pointer text-[9px] font-bold text-primary-amber bg-white hover:bg-amber-50 border border-primary/30 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <UploadCloud size={11} /> {uploadingIdx === idx ? "Uploading..." : "Upload Cover to R2"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingIdx === idx}
                      className="hidden"
                      onChange={(e) => handleUploadCover(idx, e)}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {cs.imageUrl && (
                    <img src={cs.imageUrl} alt="Cover" className="w-12 h-8 object-cover rounded border flex-shrink-0" />
                  )}
                  <input
                    type="text"
                    value={cs.imageUrl || ""}
                    onChange={(e) => {
                      const updated = [...currentStudies];
                      updated[idx] = { ...updated[idx], imageUrl: e.target.value };
                      updateCaseStudies(updated);
                    }}
                    placeholder="Cover URL"
                    className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Multi-Slide Deck Previews */}
              <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-[#111111]/10">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-bold text-[#111111] block">
                      Case Study Slide Deck Previews ({Array.isArray(cs.slides) ? cs.slides.length : 0} Slides)
                    </label>
                    <span className="text-[9px] text-[#726F6D]">
                      Select multiple images at once to upload to R2 and power the /examples carousel.
                    </span>
                  </div>
                  <label className="cursor-pointer text-[9px] font-bold text-[#111111] bg-[#FCBF14] hover:bg-[#FFE270] px-2.5 py-1 rounded flex items-center gap-1 shadow-2xs">
                    <UploadCloud size={11} /> {uploadingIdx === idx ? "Uploading Slides..." : "+ Upload Slides from PC"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingIdx === idx}
                      className="hidden"
                      onChange={(e) => handleUploadSlides(idx, e)}
                    />
                  </label>
                </div>

                {Array.isArray(cs.slides) && cs.slides.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                    {cs.slides.map((slideUrl: string, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="relative group bg-white border border-[#111111]/12 rounded-lg p-1 flex flex-col items-center shadow-2xs"
                      >
                        <img
                          src={slideUrl}
                          alt={`Slide ${sIdx + 1}`}
                          className="w-full h-14 object-cover rounded mb-1"
                        />
                        <div className="w-full flex items-center justify-between text-[9px] text-[#726F6D] px-1 font-mono">
                          <span>#{sIdx + 1}</span>
                          <div className="flex items-center gap-0.5">
                            {sIdx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, sIdx, "left")}
                                className="hover:text-[#111111] p-0.5 cursor-pointer"
                                title="Move Left"
                              >
                                <ArrowLeft size={10} />
                              </button>
                            )}
                            {sIdx < cs.slides.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, sIdx, "right")}
                                className="hover:text-[#111111] p-0.5 cursor-pointer"
                                title="Move Right"
                              >
                                <ArrowRight size={10} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveSlide(idx, sIdx)}
                              className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer ml-1"
                              title="Remove Slide"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-[#726F6D] italic py-1">
                    No preview slides added yet. Upload multiple slide PNGs or JPEGs above.
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">Project Brief / Description</label>
                <textarea
                  rows={2}
                  value={cs.description || ""}
                  onChange={(e) => {
                    const updated = [...currentStudies];
                    updated[idx] = { ...updated[idx], description: e.target.value };
                    updateCaseStudies(updated);
                  }}
                  className="w-full bg-white border border-[#111111]/12 rounded p-2 text-xs"
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            const newCS = {
              id: Date.now(),
              title: "New Presentation Case Study",
              client: "Client / Enterprise Name",
              category: "Strategy & Operations",
              storageFolder: "portfolio",
              slides: [],
              imageUrl: "",
              impact: "e.g. $10M Raised / Board Approved",
              description: "Executive presentation deck tailored for high-stakes business meetings.",
              deliverables: ["Master PowerPoint (.pptx)", "High-Res PDF"]
            };
            updateAndSave([newCS, ...currentStudies]);
          }}
          className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] py-3 text-xs font-black flex items-center justify-center gap-2 shadow cursor-pointer"
        >
          + Add New Case Study (Instant Save to Portfolio & Examples)
        </button>
      </div>
    </div>
  );
};
