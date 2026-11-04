import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import type { StoreTemplate } from "../../../modules/StudioStoreClient";

interface SimilarTemplatesGridProps {
  similarTemplates: StoreTemplate[];
  formatPrice: (inr: number, usd?: number) => string;
}

export function SimilarTemplatesGrid({
  similarTemplates,
  formatPrice,
}: SimilarTemplatesGridProps) {
  if (similarTemplates.length === 0) return null;

  return (
    <section className="pt-10 border-t border-[#111111]/10 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
        <div>
          <span className="text-primary-amber text-xs font-black uppercase tracking-widest block mb-1">
            Related Master Decks
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111]">
            Similar Presentation Templates
          </h2>
        </div>
        <Link
          to="/#templates"
          className="hex-pill-sm inline-flex items-center gap-1.5 bg-white border border-primary/40 px-3.5 py-1.5 text-xs font-bold text-[#111111] hover:border-primary transition-all shadow-sm"
        >
          Browse Full Library <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {similarTemplates.map((sim) => (
          <Link
            key={sim.id}
            to={`/template/${sim.id}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="hex-card group bg-white border-2 border-primary/30 hover:border-primary overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between text-left"
          >
            {/* Direction 2: Framed Presentation Canvas (Inset Slide Mockup) */}
            <div className="p-3 bg-[#FFF9E8]/75 border-b border-primary/20">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white shadow-sm border border-[#111111]/10 group-hover:shadow-md transition-all duration-300">
                <img
                  src={sim.image_url}
                  alt={sim.title}
                  className="w-full h-full object-contain bg-white group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-grow">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber">
                    {sim.category}
                  </span>
                  {!sim.is_premium && (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Download size={9} /> Free Deck
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="font-heading font-extrabold text-xs text-[#111111] group-hover:text-primary-amber transition-colors line-clamp-1">
                    {sim.title}
                  </h3>
                  {sim.is_premium ? (
                    <span className="text-xs font-heading font-black text-[#111111] ml-2 shrink-0">
                      {formatPrice(sim.price_inr, sim.price_usd)}
                    </span>
                  ) : (
                    <span className="text-xs font-heading font-black text-emerald-700 ml-2 shrink-0">
                      Free
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-primary/15 text-[10px] font-bold text-[#726F6D]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                <span>{sim.slides_count} Master Slides (.pptx)</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
