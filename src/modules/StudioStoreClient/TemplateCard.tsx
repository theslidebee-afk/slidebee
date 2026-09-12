import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Download, FileText, ArrowRight, Sparkles } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { type StoreTemplate } from "./useStudioStore";

interface TemplateCardProps {
  template: StoreTemplate;
  showStars?: boolean;
  showDownloads?: boolean;
}

export function TemplateCard({ template, showStars = false, showDownloads = false }: TemplateCardProps) {
  const { formatPrice, currency } = useCurrency();
  const price = currency === "USD" ? template.price_usd : template.price_inr;
  const originalPrice = currency === "USD" ? template.price_usd * 2 : template.original_price_inr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="hex-card bg-white border border-[#111111]/8 overflow-hidden group hover:border-[#111111]/20 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail Slide Preview */}
        <div className="relative aspect-[16/9] overflow-hidden bg-[#111111]/5">
          <img
            src={template.image_url}
            alt={template.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Deliverable Badge Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span className="hex-pill bg-[#111111]/90 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 border border-white/10 flex items-center gap-1.5 shadow-sm">
              <FileText className="w-3 h-3 text-primary" />
              Master PowerPoint (.pptx)
            </span>

            {/* Credit Eligibility Tag */}
            {template.is_credit_eligible && (
              <span className="hex-pill bg-primary text-[#111111] font-black text-[10px] px-2.5 py-0.5 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#111111]" />
                Free Starter Credits Tag
              </span>
            )}
          </div>

          {/* Metrics Overlay (Toggled via Admin site_config) */}
          {(showStars || showDownloads) && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
              {showStars && (
                <span className="hex-pill bg-[#111111]/85 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 flex items-center gap-1 border border-white/10">
                  <Star className="w-3 h-3 fill-primary-amber text-primary-amber" />
                  {template.rating.toFixed(1)}
                </span>
              )}
              {showDownloads && (
                <span className="hex-pill bg-[#111111]/85 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 flex items-center gap-1 border border-white/10">
                  <Download className="w-3 h-3 text-[#FCBF14]" />
                  {template.downloads.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-primary-amber uppercase tracking-wider">
              {template.category}
            </span>
          </div>

          <h3 className="text-base font-heading font-extrabold text-[#111111] mb-2 line-clamp-1 group-hover:text-primary-amber transition-colors">
            {template.title}
          </h3>

          <p className="text-xs text-[#726F6D] line-clamp-2 mb-4 leading-relaxed">
            {template.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-[#726F6D] pb-3 border-b border-[#111111]/8 font-medium">
            <span>{template.slides_count} Master Slides</span>
            <span>16:9 Widescreen</span>
          </div>
        </div>
      </div>

      {/* Card Footer & Pricing */}
      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center justify-between mb-3">
          <div>
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
            {template.is_credit_eligible ? (
              <span className="text-[10px] font-bold text-emerald-600 block">
                Eligible for 5 Free Starter Credits
              </span>
            ) : (
              <span className="text-[10px] font-medium text-[#726F6D] block">
                Commercial PPTX Master License
              </span>
            )}
          </div>

          <Link
            to={`/templates/${template.id}`}
            className="hex-pill bg-primary hover:bg-primary-hover text-[#111111] font-bold text-xs px-3.5 py-2 flex items-center gap-1.5 transition-all shadow-sm group-hover:scale-105"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
