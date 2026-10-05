import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Infinity as InfinityIcon, Sparkles, ArrowRight } from "lucide-react";

interface HomeHeroBannersProps {
  isFilterActive: boolean;
  homeBannerTop?: {
    enabled?: boolean;
    badge?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    imageUrl?: string;
  };
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
  homeBannerTop,
  homeBanner1,
  homeBanner2,
  scrollToTemplates,
}: HomeHeroBannersProps) {
  const showTopBanner = homeBannerTop?.enabled !== false && !!(homeBannerTop?.title || homeBannerTop?.imageUrl);

  return (
    <motion.div
      animate={{
        height: isFilterActive ? 0 : "auto",
        opacity: isFilterActive ? 0 : 1,
        marginBottom: isFilterActive ? 0 : 24,
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden w-full max-w-7xl 2xl:max-w-[1560px] mx-auto relative z-20 text-left"
    >
      {/* 3rd Top Banner (Spanning full width above the split banners) */}
      {showTopBanner && (
        <div className="mb-4 sm:mb-5">
          {homeBannerTop?.ctaLink && homeBannerTop.ctaLink !== "#templates" && !homeBannerTop.ctaLink.startsWith("#") ? (
            <Link
              to={homeBannerTop.ctaLink}
              className="group bg-gradient-to-r from-[#181818] via-[#222222] to-[#121212] text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 lg:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.3)] border-2 border-[#FCBF14]/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden cursor-pointer hover:border-[#FCBF14] transition-all duration-300 block"
            >
              {/* Background ambient gold aura */}
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FCBF14]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCBF14]/20 border border-[#FCBF14]/50 text-[#FCBF14] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2.5">
                  <Sparkles size={12} />
                  <span>{homeBannerTop?.badge || "STUDIO HEADLINE"}</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white leading-tight mb-2">
                  {homeBannerTop?.title || "Executive Presentation Decks & Master Templates"}
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-white/80 font-medium max-w-3xl leading-relaxed">
                  {homeBannerTop?.subtitle || "Tailored for senior leadership, venture capital pitches, and board meetings."}
                </p>

                {homeBannerTop?.ctaText && (
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-2 bg-[#FCBF14] hover:bg-[#D99B00] text-[#111111] font-heading font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg group-hover:scale-102 transition-all">
                      <span>{homeBannerTop.ctaText}</span>
                      <ArrowRight size={15} />
                    </span>
                  </div>
                )}
              </div>

              {/* Optional R2 Image Showcase */}
              {homeBannerTop?.imageUrl && (
                <div className="relative z-10 shrink-0 w-full md:w-auto max-w-xs sm:max-w-sm aspect-video rounded-2xl overflow-hidden border border-[#FCBF14]/40 shadow-xl bg-black/50 group-hover:scale-[1.02] transition-transform duration-500">
                  <img
                    src={homeBannerTop.imageUrl}
                    alt={homeBannerTop.title || "Promotional Banner"}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              )}
            </Link>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={scrollToTemplates}
              className="group bg-gradient-to-r from-[#181818] via-[#222222] to-[#121212] text-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 lg:p-8 shadow-[0_15px_45px_rgba(0,0,0,0.3)] border-2 border-[#FCBF14]/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden cursor-pointer hover:border-[#FCBF14] transition-all duration-300"
            >
              {/* Background ambient gold aura */}
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FCBF14]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCBF14]/20 border border-[#FCBF14]/50 text-[#FCBF14] text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2.5">
                  <Sparkles size={12} />
                  <span>{homeBannerTop?.badge || "STUDIO HEADLINE"}</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white leading-tight mb-2">
                  {homeBannerTop?.title || "Executive Presentation Decks & Master Templates"}
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-white/80 font-medium max-w-3xl leading-relaxed">
                  {homeBannerTop?.subtitle || "Tailored for senior leadership, venture capital pitches, and board meetings."}
                </p>

                {homeBannerTop?.ctaText && (
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-2 bg-[#FCBF14] hover:bg-[#D99B00] text-[#111111] font-heading font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg group-hover:scale-102 transition-all">
                      <span>{homeBannerTop.ctaText}</span>
                      <ArrowRight size={15} />
                    </span>
                  </div>
                )}
              </div>

              {/* Optional R2 Image Showcase */}
              {homeBannerTop?.imageUrl && (
                <div className="relative z-10 shrink-0 w-full md:w-auto max-w-xs sm:max-w-sm aspect-video rounded-2xl overflow-hidden border border-[#FCBF14]/40 shadow-xl bg-black/50 group-hover:scale-[1.02] transition-transform duration-500">
                  <img
                    src={homeBannerTop.imageUrl}
                    alt={homeBannerTop.title || "Promotional Banner"}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Two Split Banners Below */}
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
            className="group bg-[#111111] text-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden min-h-[125px] sm:min-h-[140px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 block text-left"
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
            className="group bg-[#111111] text-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden min-h-[125px] sm:min-h-[140px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 text-left"
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
