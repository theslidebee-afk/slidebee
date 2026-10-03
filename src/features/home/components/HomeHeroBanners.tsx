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
        marginBottom: isFilterActive ? 0 : 20,
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden w-full max-w-5xl lg:max-w-6xl mx-auto relative z-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pb-1">
        {/* Banner 1: Yellow - Create Presentations That Make an Impact */}
        {homeBanner1.ctaLink && homeBanner1.ctaLink !== "#templates" && !homeBanner1.ctaLink.startsWith("#") ? (
          <Link
            to={homeBanner1.ctaLink}
            data-bee-state="quote"
            className="group bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] text-[#111111] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_10px_30px_rgba(252,191,20,0.22)] border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 block text-left"
          >
            {/* Organic Fluid Texture Wave 1 (Bottom Left) */}
            <div className="absolute -bottom-10 -left-10 w-52 h-52 pointer-events-none opacity-35">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M0 120 C 60 80, 120 160, 200 110 L 200 200 L 0 200 Z" fill="#F09B0A" />
              </svg>
            </div>

            {/* Organic Fluid Texture Wave 2 (Bottom Right) */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 pointer-events-none opacity-25">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M0 140 C 70 110, 130 180, 200 130 L 200 200 L 0 200 Z" fill="#E08B00" />
              </svg>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
              {/* White Circle Badge with Radiating Spark Lines */}
              <div className="relative shrink-0">
                <svg className="absolute -top-2 -right-2 w-5 h-5 pointer-events-none" viewBox="0 0 30 30" fill="none">
                  <path d="M15 4V11" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M6 8L11 13" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M24 8L19 13" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                </svg>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFFDF5] shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] fill-[#111111]" />
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-heading font-black text-[#111111] leading-tight">
                  {homeBanner1.title || "Create Presentations That Make an Impact"}
                </h3>
                <p className="text-xs sm:text-sm text-[#111111]/85 font-medium mt-0.5">
                  {homeBanner1.subtitle || "Turn your ideas into amazing slides."}
                </p>
              </div>
            </div>
            
            {homeBanner1.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto">
                <span className="inline-flex items-center justify-center bg-[#111111] text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded-full shadow-md group-hover:bg-[#222222] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
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
            className="group bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] text-[#111111] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_10px_30px_rgba(252,191,20,0.22)] border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 text-left"
          >
            {/* Organic Fluid Texture Wave 1 (Bottom Left) */}
            <div className="absolute -bottom-10 -left-10 w-52 h-52 pointer-events-none opacity-35">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M0 120 C 60 80, 120 160, 200 110 L 200 200 L 0 200 Z" fill="#F09B0A" />
              </svg>
            </div>

            {/* Organic Fluid Texture Wave 2 (Bottom Right) */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 pointer-events-none opacity-25">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M0 140 C 70 110, 130 180, 200 130 L 200 200 L 0 200 Z" fill="#E08B00" />
              </svg>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
              {/* White Circle Badge with Radiating Spark Lines */}
              <div className="relative shrink-0">
                <svg className="absolute -top-2 -right-2 w-5 h-5 pointer-events-none" viewBox="0 0 30 30" fill="none">
                  <path d="M15 4V11" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M6 8L11 13" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M24 8L19 13" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                </svg>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFFDF5] shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] fill-[#111111]" />
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-heading font-black text-[#111111] leading-tight">
                  {homeBanner1.title || "Create Presentations That Make an Impact"}
                </h3>
                <p className="text-xs sm:text-sm text-[#111111]/85 font-medium mt-0.5">
                  {homeBanner1.subtitle || "Turn your ideas into amazing slides."}
                </p>
              </div>
            </div>
            
            {homeBanner1.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto">
                <span className="inline-flex items-center justify-center bg-[#111111] text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded-full shadow-md group-hover:bg-[#222222] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
                  {homeBanner1.ctaText}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Banner 2: Obsidian Gold - Get Unlimited Downloads */}
        {homeBanner2.ctaLink && homeBanner2.ctaLink !== "#templates" && !homeBanner2.ctaLink.startsWith("#") ? (
          <Link
            to={homeBanner2.ctaLink}
            className="group bg-[#161616]/92 backdrop-blur-md text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_40px_rgba(252,191,20,0.18)] border border-[#FCBF14]/35 hover:border-[#FCBF14] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 block text-left"
          >
            {/* Organic Flowing Contour Texture 1 (Top Left) */}
            <div className="absolute -top-10 -left-10 w-56 h-56 pointer-events-none opacity-30">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M0 0 L 160 0 C 130 60, 80 120, 0 160 Z" fill="#242424" />
                <path d="M0 0 L 120 0 C 90 50, 60 90, 0 120 Z" fill="#2a2a2a" />
              </svg>
            </div>

            {/* Organic Flowing Contour Texture 2 (Bottom Right) */}
            <div className="absolute -bottom-8 -right-8 w-52 h-52 pointer-events-none opacity-25">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M200 80 C 140 120, 80 140, 40 200 L 200 200 Z" fill="#262626" />
              </svg>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
              {/* Yellow Circle Badge with Infinity Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FCBF14] shadow-[0_6px_22px_rgba(252,191,20,0.35)] flex items-center justify-center shrink-0">
                <InfinityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] stroke-[2.8]" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-heading font-black text-white leading-tight">
                  {homeBanner2.title || "Get Unlimited Downloads"}
                </h3>
                <p className="text-xs sm:text-sm text-[#D4D4D4] font-medium mt-0.5">
                  {homeBanner2.subtitle || "Access all templates. No limits."}
                </p>
              </div>
            </div>
            
            {homeBanner2.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto">
                <span className="inline-flex items-center justify-center bg-[#FCBF14] text-[#111111] text-[11px] sm:text-xs font-black uppercase tracking-wider px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded-full shadow-md group-hover:bg-[#FFD034] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
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
            className="group bg-[#161616]/92 backdrop-blur-md text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_40px_rgba(252,191,20,0.18)] border border-[#FCBF14]/35 hover:border-[#FCBF14] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 text-left"
          >
            {/* Organic Flowing Contour Texture 1 (Top Left) */}
            <div className="absolute -top-10 -left-10 w-56 h-56 pointer-events-none opacity-30">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M0 0 L 160 0 C 130 60, 80 120, 0 160 Z" fill="#242424" />
                <path d="M0 0 L 120 0 C 90 50, 60 90, 0 120 Z" fill="#2a2a2a" />
              </svg>
            </div>

            {/* Organic Flowing Contour Texture 2 (Bottom Right) */}
            <div className="absolute -bottom-8 -right-8 w-52 h-52 pointer-events-none opacity-25">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                <path d="M200 80 C 140 120, 80 140, 40 200 L 200 200 Z" fill="#262626" />
              </svg>
            </div>

            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
              {/* Yellow Circle Badge with Infinity Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FCBF14] shadow-[0_6px_22px_rgba(252,191,20,0.35)] flex items-center justify-center shrink-0">
                <InfinityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] stroke-[2.8]" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-heading font-black text-white leading-tight">
                  {homeBanner2.title || "Get Unlimited Downloads"}
                </h3>
                <p className="text-xs sm:text-sm text-[#D4D4D4] font-medium mt-0.5">
                  {homeBanner2.subtitle || "Access all templates. No limits."}
                </p>
              </div>
            </div>
            
            {homeBanner2.ctaText && (
              <div className="mt-3 sm:mt-0 shrink-0 w-full sm:w-auto">
                <span className="inline-flex items-center justify-center bg-[#FCBF14] text-[#111111] text-[11px] sm:text-xs font-black uppercase tracking-wider px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded-full shadow-md group-hover:bg-[#FFD034] transition-colors whitespace-nowrap w-full sm:w-auto text-center">
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
