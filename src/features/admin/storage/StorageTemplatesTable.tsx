import React from "react";
import { ShoppingBag, FileText, Download, Edit3 } from "lucide-react";

interface StorageTemplatesTableProps {
  templates: any[];
  openEditTemplateModal: (template: any) => void;
}

export const StorageTemplatesTable: React.FC<StorageTemplatesTableProps> = ({
  templates,
  openEditTemplateModal,
}) => {
  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[#111111]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary-amber" />
            <span>Storefront Templates & Master PPTX Inventory (Database Audit)</span>
          </h3>
          <p className="text-xs text-[#726F6D]">
            Cross-referenced with live D1 database. All presentation deliverables & previews are hosted on Cloudflare R2 CDN.
          </p>
        </div>
        <div className="hex-pill bg-[#FFF9E8] border border-primary/20 text-[#111111] px-3.5 py-1.5 text-xs font-bold">
          {templates.length} Storefront Templates Registered
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FFF9E8] text-[#726F6D] font-extrabold text-[10px] uppercase tracking-wider border-b border-[#111111]/8">
            <tr>
              <th className="px-5 py-3">Template / SKU</th>
              <th className="px-5 py-3">Master PPTX Deliverable</th>
              <th className="px-5 py-3">Slide Previews</th>
              <th className="px-5 py-3">Pricing & Access</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111111]/5">
            {templates.map((tpl) => {
              const pptxUrl = tpl.download_url || "";
              const slides = Array.isArray(tpl.slides) ? tpl.slides : [tpl.thumbnail_url || tpl.image_url];
              const fileName = tpl.file_name || (pptxUrl.split("/").pop() || "presentation.pptx");
              const fileSize = tpl.file_size || "4.5 MB";

              return (
                <tr key={tpl.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-[#111111]/10">
                        <img
                          src={tpl.thumbnail_url || tpl.image_url || "/portfolio/case_study_a_1.png"}
                          alt={tpl.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-[#111111] text-xs flex items-center gap-2">
                          <span>{tpl.title}</span>
                          <span className="hex-pill-sm bg-black/5 text-[#726F6D] text-[9px] font-mono px-1.5 py-0.5">
                            {tpl.code || "SLD"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#726F6D]">{tpl.category || "General"}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                        <FileText size={13} className="text-primary-amber shrink-0" />
                        <span className="truncate max-w-[180px]">{fileName}</span>
                        <span className="hex-pill-sm bg-primary/20 text-[#111111] text-[9px] font-bold px-1.5 py-0.5">
                          {fileSize}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#726F6D] font-mono block truncate max-w-[220px]">
                        {pptxUrl.replace("https://", "")}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[#111111]">
                        {tpl.slide_count || tpl.slides_count || slides.length} Slides
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden py-1">
                        {slides.slice(0, 3).map((s: string, idx: number) => (
                          <img
                            key={idx}
                            src={s}
                            alt={`Slide ${idx + 1}`}
                            className="w-5 h-5 rounded-full object-cover border border-white shadow-xs"
                          />
                        ))}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-[11px] font-extrabold text-[#111111]">
                      ₹{tpl.price_inr} / ${tpl.price_usd}
                    </div>
                    <span className="text-[10px] text-[#726F6D]">
                      {tpl.is_credit_eligible ? "Free Community Tier Deck" : "Premium Master Deck"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {pptxUrl && (
                        <a
                          href={pptxUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black text-[10px] px-2.5 py-1.5 flex items-center gap-1 shadow-xs transition-all"
                          title="Test download from Cloudflare R2"
                        >
                          <Download size={11} /> Test PPTX
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditTemplateModal(tpl)}
                        className="hex-pill-sm bg-black/5 hover:bg-black/10 text-[#111111] font-bold text-[10px] px-2.5 py-1.5 flex items-center gap-1"
                      >
                        <Edit3 size={11} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
