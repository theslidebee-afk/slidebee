import React, { useState, useMemo } from "react";
import { Save, Check, Plus, LayoutGrid, List, Search } from "lucide-react";
import { normalizeR2Url } from "../../../../lib/r2";

interface CmsTrendingSelectorProps {
  selectedIds: string[];
  templates: any[];
  siteConfigs: any;
  setSiteConfigs: React.Dispatch<React.SetStateAction<any>>;
  handleSaveConfig: (key: string, value: any) => Promise<void>;
  configSaving: boolean;
}

export const CmsTrendingSelector: React.FC<CmsTrendingSelectorProps> = ({
  selectedIds,
  templates,
  siteConfigs,
  setSiteConfigs,
  handleSaveConfig,
  configSaving,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase().trim();
    return templates.filter((t: any) => 
      t.title?.toLowerCase().includes(q) ||
      t.code?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  const toggleTrending = (tmpl: any) => {
    const isSelected = selectedIds.some(id => 
      id === String(tmpl.id) || 
      (tmpl.slug && id === String(tmpl.slug)) || 
      (tmpl.code && id === String(tmpl.code))
    );

    let updated: string[];
    if (isSelected) {
      updated = selectedIds.filter(id => 
        id !== String(tmpl.id) && 
        id !== String(tmpl.slug) && 
        id !== String(tmpl.code)
      );
    } else {
      updated = [...selectedIds, String(tmpl.id)];
    }
    setSiteConfigs({
      ...siteConfigs,
      trending_templates: { ids: updated },
      featured_templates: { ids: updated }
    });
  };

  return (
    <div className="pt-6 border-t border-[#111111]/8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF9E8] p-4 rounded-2xl border border-primary/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-heading font-extrabold text-[#111111]">
              Trending Templates Selection on Homepage
            </h4>
            <span className="hex-pill-sm bg-primary text-[#111111] font-black text-[10px] px-2.5 py-0.5">
              {selectedIds.length} Curated for Trending Row
            </span>
          </div>
          <p className="text-xs text-[#726F6D]">
            Curate which Cloudflare R2 presentation decks appear in the Trending row on the landing page.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#111111]/15 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-[#111111] shadow-xs"
                  : "text-[#726F6D] hover:text-[#111111]"
              }`}
              title="Gallery Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary text-[#111111] shadow-xs"
                  : "text-[#726F6D] hover:text-[#111111]"
              }`}
              title="Compact List View"
            >
              <List size={15} />
            </button>
          </div>
          <button
            type="button"
            onClick={async () => {
              await handleSaveConfig("trending_templates", { ids: selectedIds });
              await handleSaveConfig("featured_templates", { ids: selectedIds });
            }}
            disabled={configSaving}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2 text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={13} /> {configSaving ? "Saving..." : "Save Trending Decks"}
          </button>
        </div>
      </div>

      {/* Search Bar for Quick Filtering */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#726F6D]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter templates by name, SKU, or category..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#111111]/15 rounded-xl font-medium outline-none focus:border-primary"
        />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[540px] overflow-y-auto p-3 bg-white rounded-2xl border border-[#111111]/10">
          {filteredTemplates.map((tmpl) => {
            const isSelected = selectedIds.some(id => 
              id === String(tmpl.id) || 
              (tmpl.slug && id === String(tmpl.slug)) || 
              (tmpl.code && id === String(tmpl.code))
            );

            const previewImg = normalizeR2Url(
              tmpl.image_url || tmpl.thumbnail_url || tmpl.image || "/portfolio/case_study_a_1.png"
            );

            return (
              <div
                key={tmpl.id}
                onClick={() => toggleTrending(tmpl)}
                className={`hex-card rounded-2xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? "bg-[#FFF9E8]/90 border-primary shadow-md ring-2 ring-primary/40"
                    : "bg-white border-[#111111]/10 opacity-70 hover:opacity-100 hover:border-primary/50"
                }`}
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/5 border-b border-[#111111]/10">
                    <img
                      src={previewImg}
                      alt={tmpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      <span className="hex-pill-sm bg-[#111111]/90 backdrop-blur-md text-white border border-white/10 text-[9px] font-extrabold px-2.5 py-0.5">
                        {tmpl.category}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`hex-pill-sm text-[9px] font-black px-2.5 py-0.5 shadow flex items-center gap-1 ${
                        isSelected 
                          ? "bg-primary text-[#111111] border border-[#111111]/20" 
                          : "bg-[#111111]/80 text-white border border-white/10"
                      }`}>
                        {isSelected ? <Check size={10} strokeWidth={3} /> : <Plus size={10} strokeWidth={3} />}
                        {isSelected ? "In Trending" : "+ Add to Trending"}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="hex-pill-sm bg-[#111111]/90 backdrop-blur-md text-primary text-[9px] font-black px-2 py-0.5 border border-primary/30">
                        {tmpl.code || `SLD-${String(tmpl.id).slice(0, 4).toUpperCase()}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h5 className="font-heading font-extrabold text-xs text-[#111111] line-clamp-1 mb-1 group-hover:text-primary-amber transition-colors">
                      {tmpl.title}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-[#726F6D] font-medium">
                      <span>{tmpl.slides_count || tmpl.slide_count || 25} Master Slides</span>
                      <span className="font-heading font-black text-[#111111]">
                        ₹{tmpl.price_inr || 499}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3 pt-1">
                  <div className={`w-full py-1.5 rounded-lg text-center text-[10px] font-black transition-all ${
                    isSelected 
                      ? "bg-primary text-[#111111]" 
                      : "bg-[#111111]/5 text-[#726F6D] group-hover:bg-primary/20 group-hover:text-[#111111]"
                  }`}>
                    {isSelected ? "Selected for Homepage Trending" : "Select for Trending"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#111111]/10 overflow-hidden shadow-2xs max-h-[540px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] text-[10px] font-black uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Thumbnail</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/6 font-medium">
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedIds.some(id => 
                  id === String(tmpl.id) || 
                  (tmpl.slug && id === String(tmpl.slug)) || 
                  (tmpl.code && id === String(tmpl.code))
                );

                const previewImg = normalizeR2Url(
                  tmpl.image_url || tmpl.thumbnail_url || tmpl.image || "/portfolio/case_study_a_1.png"
                );

                return (
                  <tr 
                    key={tmpl.id}
                    onClick={() => toggleTrending(tmpl)}
                    className={`hover:bg-primary/5 transition-colors cursor-pointer ${
                      isSelected ? "bg-[#FFF9E8]/70" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? "bg-primary text-[#111111]" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {isSelected ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                        {isSelected ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="w-10 h-7 rounded bg-gray-100 overflow-hidden border border-[#111111]/10">
                        <img src={previewImg} alt={tmpl.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#111111] text-[10px]">
                      {tmpl.code || `SLD-${String(tmpl.id).slice(0, 4)}`}
                    </td>
                    <td className="py-2.5 px-4 font-heading font-extrabold text-[#111111] max-w-xs truncate">
                      {tmpl.title}
                    </td>
                    <td className="py-2.5 px-3 text-[#726F6D] text-[11px]">
                      {tmpl.category}
                    </td>
                    <td className="py-2.5 px-3 font-black text-[#111111]">
                      ₹{tmpl.price_inr || 499}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTrending(tmpl);
                        }}
                        className={`text-[10px] font-black px-3 py-1 rounded-lg transition-all cursor-pointer ${
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
  );
};
