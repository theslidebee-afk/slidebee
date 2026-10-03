import React from "react";
import { Clock, FileText, Cloud, Eye, EyeOff, Edit3, Trash2 } from "lucide-react";
import { normalizeR2Url } from "../../../../lib/r2";

interface TemplatesGridViewProps {
  templates: any[];
  onEditTemplate: (tpl: any) => void;
  onTogglePublished: (tpl: any) => void;
  onToggleFreeTier: (tpl: any) => void;
  onDeleteTemplate: (id: string | number, title: string) => void;
  formatUploadedDate: (dateStr?: string) => string;
}

export const TemplatesGridView: React.FC<TemplatesGridViewProps> = ({
  templates,
  onEditTemplate,
  onTogglePublished,
  onToggleFreeTier,
  onDeleteTemplate,
  formatUploadedDate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {templates.map((tpl: any) => (
        <div
          key={tpl.id}
          className="hex-card bg-white border border-[#111111]/10 overflow-hidden shadow-sm flex flex-col justify-between"
        >
          <div className="aspect-[16/10] bg-[#111111] overflow-hidden">
            <img
              src={normalizeR2Url(tpl.image_url || tpl.thumbnail_url || "/portfolio/case_study_a_1.png")}
              alt={tpl.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/20 text-[10px] font-extrabold px-3 py-0.5 uppercase tracking-wider">
                {tpl.category}
              </div>
              {tpl.code && (
                <span className="text-[10px] font-black text-[#726F6D] uppercase font-mono">
                  {tpl.code}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-extrabold text-[#726F6D]">
              <Clock size={11} className="text-primary-amber" />
              <span>Uploaded: {formatUploadedDate(tpl.created_at)}</span>
            </div>

            <h4 className="font-heading font-extrabold text-base text-[#111111] mb-1">
              {tpl.title}
            </h4>
            <p className="text-xs text-[#726F6D] font-medium line-clamp-2 mb-3">
              {tpl.description}
            </p>

            <div className="flex items-center gap-1.5 pt-2 border-t border-[#111111]/8 mb-2 text-[11px] font-bold text-[#111111]">
              <FileText size={13} className="text-primary-amber" />
              <span>Deliverable: Master PowerPoint (.pptx)</span>
            </div>

            <div className="bg-[#FFF9E8] border border-primary/30 rounded-lg p-2.5 mb-3 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-[#111111]">
                <span className="flex items-center gap-1">
                  <Cloud size={12} className="text-primary-amber" />
                  R2 Cloud Storage:
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-black text-[9px]">
                  {tpl.download_url && tpl.download_url.includes("r2.dev") ? "Mapped to R2" : "Connected"}
                </span>
              </div>
              <div className="text-[10px] text-[#726F6D] font-mono truncate flex items-center justify-between">
                <span className="truncate" title={tpl.download_url || tpl.file_name}>
                  {tpl.download_url ? tpl.download_url.split("/").slice(-2).join("/") : (tpl.file_name ? `templates/decks/${tpl.file_name}` : "templates/decks/pending")}
                </span>
                {tpl.download_url && (
                  <a
                    href={normalizeR2Url(tpl.download_url, "decks")}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="ml-2 text-primary-amber hover:underline font-sans font-black text-[9px] shrink-0"
                  >
                    Test PPTX
                  </a>
                )}
              </div>
              <div className="text-[9px] text-[#726F6D] flex items-center justify-between pt-0.5 border-t border-primary/10">
                <span>Slide Previews: {Array.isArray(tpl.slides) ? tpl.slides.length : (tpl.slide_count || 0)} cached</span>
                <span className="font-mono text-[9px] text-emerald-800 font-bold">
                  {tpl.thumbnail_url && tpl.thumbnail_url.includes("r2.dev") ? "R2 CDN Active" : "Live CDN"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#111111]/8 text-xs font-bold">
              <span>{tpl.slide_count || tpl.slides_count || 25} Slides</span>
              <span className="text-primary-amber font-extrabold">
                ₹{tpl.price_inr} / ${tpl.price_usd}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#111111]/8 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${tpl.is_published !== false ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                <span className="text-[10px] font-extrabold text-[#726F6D]">
                  {tpl.is_published !== false ? "Storefront: Visible" : "Storefront: Hidden"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onTogglePublished(tpl)}
                className={`hex-pill text-[10px] font-black px-3 py-1 transition-all flex items-center gap-1 cursor-pointer ${
                  tpl.is_published !== false
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                {tpl.is_published !== false ? (
                  <>
                    <Eye size={12} className="text-emerald-700" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={12} className="text-gray-500" />
                    <span>Disabled</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#111111]/8 text-[11px] font-bold">
              <span className="text-[10px] font-extrabold text-[#726F6D]">Free Community Deck Tag:</span>
              <button
                type="button"
                onClick={() => onToggleFreeTier(tpl)}
                className={`hex-pill text-[9px] font-black px-2.5 py-1 transition-all cursor-pointer ${
                  tpl.is_credit_eligible
                    ? "bg-primary text-[#111111] border border-[#111111]/20 shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                {tpl.is_credit_eligible ? "Eligible (Free Tag)" : "+ Tag as Free"}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[#111111]/8 mt-3">
              <button
                type="button"
                onClick={() => onEditTemplate(tpl)}
                className="hex-pill-sm flex-1 bg-primary hover:bg-primary-dark text-[#111111] font-black py-1.5 text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Edit3 size={13} /> Edit Template
              </button>
              <button
                type="button"
                onClick={() => onDeleteTemplate(tpl.id, tpl.title)}
                className="hex-pill-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                title="Delete Template"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
