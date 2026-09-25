import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Download, ArrowRight, Crown } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { type StoreTemplate } from "./useStudioStore";

interface TemplateCardProps {
  template: StoreTemplate;
  showStars?: boolean;
  showDownloads?: boolean;
  isPro?: boolean;
}

export function TemplateCard({ template, showStars = false, showDownloads = false, isPro = false }: TemplateCardProps) {
  const { formatPrice, currency } = useCurrency();
  const price = currency === "USD" ? template.price_usd : template.price_inr;
  const originalPrice = currency === "USD" ? template.price_usd * 2 : template.original_price_inr;

  const isFree = !template.is_premium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="hex-card bg-white border-2 border-primary/35 overflow-hidden group hover:border-primary hover:shadow-2xl transition-all duration-300 flex flex-col justify-between shadow-sm"
    >
      <div>
        {/* Direction 2: Framed Presentation Canvas (Inset Slide Mockup) */}
        <div className="p-3 sm:p-3.5 bg-[#FFF9E8]/75 border-b border-primary/20">
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white shadow-sm border border-[#111111]/10 group-hover:shadow-md transition-all duration-300">
            <img
              src={template.image_url}
              alt={template.title}
              className="w-full h-full object-contain bg-white group-hover:scale-102 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 pt-3.5">
          {/* Metadata Row (Off the slide canvas) */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber">
              {template.category}
            </span>

            <div className="flex items-center gap-2">
              {isFree ? (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  FREE TEMPLATE
                </span>
              ) : (
                <span className="bg-[#111111] text-[#FCBF14] border border-[#FCBF14]/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown size={9} className="fill-[#FCBF14]" /> PREMIUM
                </span>
              )}
              {showStars && (
                <span className="text-[10px] font-extrabold text-[#111111] flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-primary-amber text-primary-amber" />
                  {template.rating.toFixed(1)}
                </span>
              )}
              {showDownloads && (
                <span className="text-[10px] font-bold text-[#726F6D] flex items-center gap-0.5">
                  <Download className="w-3 h-3 text-[#726F6D]" />
                  {template.downloads.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-base font-heading font-extrabold text-[#111111] mb-1.5 line-clamp-1 group-hover:text-primary-amber transition-colors">
            {template.title}
          </h3>

          <p className="text-xs text-[#726F6D] line-clamp-2 mb-4 leading-relaxed font-medium">
            {template.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-[#726F6D] pb-3 border-b border-primary/15 font-medium">
            <span>{template.slides_count} Master Slides</span>
            <span>16:9 Widescreen</span>
            <span className="text-[#111111] font-bold">.pptx</span>
          </div>
        </div>
      </div>

      {/* Card Footer & Pricing */}
      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            {isFree ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-heading font-black text-emerald-800">
                    Free
                  </span>
                  <span className="text-xs text-[#726F6D] line-through font-bold">
                    {formatPrice(price)}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 block">
                  3 Free Downloads / Day
                </span>
              </>
            ) : isPro ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-heading font-black text-[#111111]">
                    Unlocked
                  </span>
                  <span className="text-xs text-[#726F6D] line-through font-bold">
                    {formatPrice(price)}
                  </span>
                </div>
                <span className="text-[10px] font-black text-primary-amber flex items-center gap-1 mt-0.5">
                  <Crown size={10} /> Pro Plan Access
                </span>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-heading font-extrabold text-[#111111]">
                    {formatPrice(price)}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-xs text-[#726F6D] line-through font-medium">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-primary-amber block">
                  Unlocked with \$5/mo Pro
                </span>
              </>
            )}
          </div>

          <Link
            to={`/template/${template.id}`}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-bold text-xs px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm group-hover:scale-105"
          >
            <span>{isFree ? "Download Free" : (isPro ? "Download" : "Inspect")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
