import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit3, Eye, EyeOff, Download, Trash2 } from "lucide-react";
import { normalizeR2Url } from "../../../../lib/r2";

interface TemplatesTableViewProps {
  templates: any[];
  sort: string;
  onSortChange: (updater: (prev: string) => string) => void;
  onEditTemplate: (tpl: any) => void;
  onTogglePublished: (tpl: any) => void;
  onDeleteTemplate: (id: string | number, title: string) => void;
  formatUploadedDate: (dateStr?: string) => string;
}

export const TemplatesTableView: React.FC<TemplatesTableViewProps> = ({
  templates,
  sort,
  onSortChange,
  onEditTemplate,
  onTogglePublished,
  onDeleteTemplate,
  formatUploadedDate
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#111111]/10 shadow-xs overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] text-[11px] font-black uppercase tracking-wider select-none">
              <th className="py-3.5 px-4 font-black">
                <button
                  type="button"
                  onClick={() => onSortChange((prev) => prev === "title_asc" ? "title_desc" : "title_asc")}
                  className="flex items-center gap-1 hover:text-[#111111] cursor-pointer"
                >
                  <span>SKU / Title</span>
                  <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="py-3.5 px-3 font-black">Preview</th>
              <th className="py-3.5 px-4 font-black">
                <button
                  type="button"
                  onClick={() => onSortChange((prev) => prev === "title_asc" ? "title_desc" : "title_asc")}
                  className="flex items-center gap-1 hover:text-[#111111] cursor-pointer"
                >
                  <span>Category</span>
                  <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="py-3.5 px-4 font-black">
                <button
                  type="button"
                  onClick={() => onSortChange((prev) => prev === "price_desc" ? "price_asc" : "price_desc")}
                  className="flex items-center gap-1 hover:text-[#111111] cursor-pointer"
                >
                  <span>Price</span>
                  <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="py-3.5 px-3 font-black text-center">
                <button
                  type="button"
                  onClick={() => onSortChange((prev) => prev === "slides_desc" ? "date_desc" : "slides_desc")}
                  className="inline-flex items-center gap-1 hover:text-[#111111] cursor-pointer"
                >
                  <span>Slides</span>
                  <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="py-3.5 px-4 font-black">
                <button
                  type="button"
                  onClick={() => onSortChange((prev) => prev === "date_desc" ? "date_asc" : "date_desc")}
                  className="flex items-center gap-1 hover:text-[#111111] cursor-pointer text-primary-amber"
                >
                  <span>Uploaded Date</span>
                  {sort === "date_desc" ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                </button>
              </th>
              <th className="py-3.5 px-4 font-black">Status</th>
              <th className="py-3.5 px-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#111111]/8">
            {templates.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#726F6D] font-bold">
                  No matching presentation templates found. Try clearing your filters or search.
                </td>
              </tr>
            ) : (
              templates.map((tpl: any) => (
                <tr key={tpl.id} className="hover:bg-[#FFF9E8]/40 transition-colors group">
                  {/* SKU / Title */}
                  <td className="py-3.5 px-4 max-w-[280px]">
                    <div className="flex items-center gap-2 mb-1">
                      {tpl.code ? (
                        <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-[#111111] border border-[#111111]/10">
                          {tpl.code}
                        </span>
                      ) : null}
                      <span className="text-[10px] text-[#726F6D] font-mono">{tpl.id?.slice(0, 8)}</span>
                    </div>
                    <h5 className="font-heading font-extrabold text-xs text-[#111111] line-clamp-1 group-hover:text-primary-amber transition-colors">
                      {tpl.title}
                    </h5>
                    <p className="text-[11px] text-[#726F6D] line-clamp-1 mt-0.5">
                      {tpl.description}
                    </p>
                  </td>

                  {/* Preview Thumbnail */}
                  <td className="py-3.5 px-3">
                    <div className="w-14 h-9 rounded-lg bg-[#111111] overflow-hidden border border-[#111111]/15 shadow-2xs shrink-0">
                      <img
                        src={normalizeR2Url(tpl.image_url || tpl.thumbnail_url || "/portfolio/case_study_a_1.png")}
                        alt={tpl.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFF9E8] text-primary-amber border border-primary/30 shadow-2xs">
                      {tpl.category || "General"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {(!tpl.is_premium || Number(tpl.price_inr) === 0) ? (
                      <div className="font-heading font-black text-xs text-emerald-700">
                        ₹0 (Free Deck)
                      </div>
                    ) : (
                      <>
                        <div className="font-heading font-black text-xs text-[#111111]">
                          ₹{tpl.price_inr}
                        </div>
                        <div className="text-[10px] text-[#726F6D] font-bold">
                          ${tpl.price_usd} USD
                        </div>
                      </>
                    )}
                  </td>

                  {/* Slides Count */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-center">
                    <span className="font-mono text-xs font-bold text-[#111111]">
                      {tpl.slides_count || tpl.slide_count || 25}
                    </span>
                  </td>

                  {/* Uploaded Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-xs font-bold text-[#111111]">
                      {formatUploadedDate(tpl.created_at)}
                    </div>
                    <div className="text-[10px] text-[#726F6D]">
                      {tpl.created_at ? new Date(tpl.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Verified"}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full w-fit ${
                        tpl.is_published !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tpl.is_published !== false ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {tpl.is_published !== false ? "Published" : "Draft"}
                      </span>
                      {(!tpl.is_premium || Number(tpl.price_inr) === 0) ? (
                        <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full w-fit border border-emerald-300">
                          Free Tier
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full w-fit border border-amber-300">
                            Premium
                          </span>
                          {tpl.is_credit_eligible ? (
                            <span className="text-[9px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-full w-fit border border-blue-200">
                              Pro Credit
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditTemplate(tpl)}
                        className="p-1.5 text-gray-500 hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Template Properties"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onTogglePublished(tpl)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title={tpl.is_published !== false ? "Unpublish Template" : "Publish Template"}
                      >
                        {tpl.is_published !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      {tpl.download_url && (
                        <a
                          href={normalizeR2Url(tpl.download_url, "decks")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-500 hover:text-primary-amber hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Download Master PPTX"
                        >
                          <Download size={13} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteTemplate(tpl.id, tpl.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
