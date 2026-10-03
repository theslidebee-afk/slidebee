import { motion } from "framer-motion";
import { Download, Eye, Star, Crown, Check, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrency } from "../../../context/CurrencyContext";
import type { StoreTemplate } from "../../../modules/StudioStoreClient";

interface TemplateCardProps {
  item: StoreTemplate;
  isProUser: boolean;
  showStars: boolean;
  showDownloads: boolean;
}

export function TemplateCard({ item, isProUser, showStars, showDownloads }: TemplateCardProps) {
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="hex-card group bg-white border-2 border-primary/35 overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 flex flex-col justify-between shadow-sm cursor-pointer"
      onClick={() => navigate(`/template/${item.id}`)}
    >
      {/* Framed Presentation Canvas */}
      <div className="p-3 sm:p-3.5 bg-[#FFF9E8]/75 border-b border-primary/20">
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white shadow-sm border border-[#111111]/10 group-hover:shadow-md transition-all duration-300">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-contain bg-white group-hover:scale-102 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
            <span className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-xl">
              <Eye size={13} /> View Full Deck
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 pt-3.5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber">
              {item.category}
            </span>
            {!item.is_premium ? (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                FREE TEMPLATE
              </span>
            ) : (
              <span className="bg-[#111111] text-[#FCBF14] border border-[#FCBF14]/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown size={9} className="fill-[#FCBF14]" /> PREMIUM
              </span>
            )}
            {showStars && item.rating ? (
              <span className="text-[#111111] text-[10px] font-extrabold flex items-center gap-1">
                <Star size={10} className="text-amber-500 fill-amber-500" /> {item.rating}
              </span>
            ) : null}
          </div>

          <h3 className="font-heading font-extrabold text-base text-[#111111] group-hover:text-primary-amber transition-colors mb-1.5 line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-[#726F6D] line-clamp-2 leading-relaxed mb-4 font-medium">
            {item.description}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between pt-3 border-t border-primary/15 mb-3">
            <div>
              {!item.is_premium ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-heading font-black text-emerald-800">Free</span>
                    <span className="text-xs text-[#726F6D] line-through font-bold">
                      {formatPrice(item.price_inr, item.price_usd)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 block">3 Free Downloads / Day</span>
                </>
              ) : isProUser ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-heading font-black text-[#111111]">Unlocked</span>
                    <span className="text-xs text-[#726F6D] line-through font-bold">
                      {formatPrice(item.price_inr, item.price_usd)}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-primary-amber flex items-center gap-1 mt-0.5">
                    <Crown size={10} /> Pro Plan Access
                  </span>
                </>
              ) : (
                <>
                  <div className="text-lg font-heading font-black text-[#111111]">
                    {formatPrice(item.price_inr, item.price_usd)}
                  </div>
                  {item.original_price_inr && (
                    <div className="text-[10px] text-[#726F6D] line-through font-medium">
                      {formatPrice(item.original_price_inr, (item.price_usd || 5) * 2)}
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-primary-amber block">
                    Unlocked with {currency === "INR" ? "₹399/mo" : "$5/mo"} Pro
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-[#FFF9E8] border border-primary/40 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#111111]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              PowerPoint (.pptx)
            </div>
          </div>

          {!item.is_premium ? (
            <div className="text-[10px] text-emerald-700 font-extrabold mb-2.5 flex items-center gap-1">
              <Check size={11} /> 100% Free with Basic Registration
            </div>
          ) : isProUser ? (
            <div className="text-[10px] text-emerald-700 font-extrabold mb-2.5 flex items-center gap-1">
              <Crown size={11} className="text-amber-500" /> Included with Pro Membership Quota
            </div>
          ) : (
            <div className="text-[10px] text-[#726F6D] font-medium mb-2.5">
              Commercial PPTX Master License
            </div>
          )}

          {showDownloads && item.downloads ? (
            <div className="text-[10px] text-[#726F6D] font-bold mb-2">
              {item.downloads.toLocaleString()} executive downloads
            </div>
          ) : null}

          {!item.is_premium ? (
            <Link
              to={`/template/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
            >
              <Download size={14} /> Download Free <ArrowRight size={12} />
            </Link>
          ) : isProUser ? (
            <Link
              to={`/template/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
            >
              <Crown size={14} className="text-[#111111]" /> Download with Pro <ArrowRight size={12} />
            </Link>
          ) : (
            <Link
              to={`/template/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hex-pill w-full bg-[#111111] hover:bg-black text-[#FCBF14] font-extrabold py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center border border-primary/30"
            >
              <Download size={14} /> Unlock with Pro ({currency === "INR" ? "₹399" : "$5"}) <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
