import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Infinity as InfinityIcon } from "lucide-react";

interface HomeHeroBannersProps {
  isFilterActive: boolean;
  homeBanner1: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  homeBanner2: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  scrollToTemplates: () => void;
}

export function HomeHeroBanners({
  isFilterActive,
  homeBanner1,
  homeBanner2,
  scrollToTemplates,
}: HomeHeroBannersProps) {
  return (
    <motion.div
      animate={{
        height: isFilterActive ? 0 : "auto",
        opacity: isFilterActive ? 0 : 1,
        marginBottom: isFilterActive ? 0 : 24,
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden w-full mx-auto relative z-20 text-left"
    >
      {/* Two Split Promotional Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-1">
        {/* Banner 1: Yellow - Create Presentations That Make an Impact */}
        {homeBanner1.ctaLink && homeBanner1.ctaLink !== "#templates" && !homeBanner1.ctaLink.startsWith("#") ? (
          <Link
            to={homeBanner1.ctaLink}
            data-bee-state="quote"
            className="group bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] text-[#111111] rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 shadow-[0_10px_30px_rgba(252,191,20,0.22)] border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden min-h-[125px] sm:min-h-[140px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 block text-left"
          >
            {/* Organic Fluid Texture Wave 1 */}
            <div className="absolute -bottom-10 -left-10 w-52 h-52 pointer-events-none opacity-35">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M0 120 C 60 80, 120 160, 200 110 L 200 200 L 0 200 Z" fill="#F09B0A" />
              </svg>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="relative shrink-0">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#FFFDF5] shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#111111] fill-[#111111]" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-black text-[#111111] leading-tight">
                  {homeBanner1.title || "Create Presentations That Make an Impact"}
                </h3>
                <p className="text-xs sm:text-sm text-[#111111]/85 font-medium mt-1">
                  {homeBanner1.subtitle || "Turn your ideas into amazing slides."}
                </p>
              </div>
            </div>
            
            {homeBanner1.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto relative z-10">
                <span className="inline-flex items-center justify-center bg-[#111111] text-white text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 min-h-[46px] rounded-full shadow-md group-hover:bg-[#222222] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
                  {homeBanner1.ctaText}
                </span>
              </div>
            )}
          </Link>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={scrollToTemplates}
            data-bee-state="quote"
            className="group bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] text-[#111111] rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 shadow-[0_10px_30px_rgba(252,191,20,0.22)] border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden min-h-[125px] sm:min-h-[140px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative shrink-0">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#FFFDF5] shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#111111] fill-[#111111]" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-black text-[#111111] leading-tight">
                  {homeBanner1.title || "Create Presentations That Make an Impact"}
                </h3>
                <p className="text-xs sm:text-sm text-[#111111]/85 font-medium mt-1">
                  {homeBanner1.subtitle || "Turn your ideas into amazing slides."}
                </p>
              </div>
            </div>
            
            {homeBanner1.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto relative z-10">
                <span className="inline-flex items-center justify-center bg-[#111111] text-white text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 min-h-[46px] rounded-full shadow-md group-hover:bg-[#222222] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
                  {homeBanner1.ctaText}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Banner 2: Dark - Get Unlimited Downloads */}
        {homeBanner2.ctaLink && homeBanner2.ctaLink !== "#templates" && !homeBanner2.ctaLink.startsWith("#") ? (
          <Link
            to={homeBanner2.ctaLink}
            data-bee-state="catalog"
            className="group bg-[#111111] text-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden min-h-[125px] sm:min-h-[140px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 block text-left"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative shrink-0">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#1C1C1C] border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  <InfinityIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#FCBF14]" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-black text-white leading-tight">
                  {homeBanner2.title || "Get Unlimited Downloads"}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">
                  {homeBanner2.subtitle || "Access all templates. No limits."}
                </p>
              </div>
            </div>
            
            {homeBanner2.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto relative z-10">
                <span className="inline-flex items-center justify-center bg-[#FCBF14] text-[#111111] text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 min-h-[46px] rounded-full shadow-md group-hover:bg-[#e0a810] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
                  {homeBanner2.ctaText}
                </span>
              </div>
            )}
          </Link>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={scrollToTemplates}
            data-bee-state="catalog"
            className="group bg-[#111111] text-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden min-h-[125px] sm:min-h-[140px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative shrink-0">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#1C1C1C] border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  <InfinityIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#FCBF14]" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-black text-white leading-tight">
                  {homeBanner2.title || "Get Unlimited Downloads"}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">
                  {homeBanner2.subtitle || "Access all templates. No limits."}
                </p>
              </div>
            </div>
            
            {homeBanner2.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto relative z-10">
                <span className="inline-flex items-center justify-center bg-[#FCBF14] text-[#111111] text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 min-h-[46px] rounded-full shadow-md group-hover:bg-[#e0a810] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
                  {homeBanner2.ctaText}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
