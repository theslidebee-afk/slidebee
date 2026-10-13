import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";
import { d1 } from "../lib/d1";

const DEFAULT_ABOUT_CONFIG = {
  heroTitle: "About Us",
  heroSubtitle: "Crafting high-impact executive presentation systems and bespoke presentation decks for visionary founders and global leaders.",
  heroBreadcrumb: "Home \u00BB About Us",
  heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=85",
  heroColorTheme: "charcoal_amber",

  teamEyebrow: "OUR TEAM",
  teamHeading: "A Specialized\nPresentation\nDesign Team.",
  teamSubtitle: "Slidebee is powered by a team of presentation designers, visual storytellers, and creative professionals with extensive experience across industries.",
  teamCtaText: "Meet Our Work",
  teamCtaLink: "/examples",
  teamImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  teamNote: "Different\nPerspectives\nBetter Slides",

  visionEyebrow: "OUR VISION",
  visionHeading: "A Global Destination\nfor Better Presentations.",
  visionSubtitle: "We aim to make Slidebee a trusted global destination for presentation design — where anyone can find the right tools, templates, and creative expertise to communicate their ideas more effectively.",
  visionNote: "Clear Ideas\nCreate Bigger\nOpportunities",

  ctaEyebrow: "LET'S CREATE BETTER PRESENTATIONS",
  ctaHeading: "Your Ideas. Our Design.",
  ctaSubtitle: "Choose your way to create better presentations with Slidebee.",
  ctaPrimaryText: "Explore Templates",
  ctaPrimaryLink: "/",
  ctaSecondaryText: "Get a Custom Presentation",
  ctaSecondaryLink: "/ordernow",
};

function getHeroOverlay(theme?: string) {
  switch (theme) {
    case "pine_emerald":
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1F13]/92 via-[#0E2E1C]/82 to-[#0A1F13]/94 pointer-events-none" />
      );
    case "midnight_obsidian":
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/95 via-[#141414]/85 to-[#0D0D0D]/95 pointer-events-none" />
      );
    case "charcoal_amber":
    default:
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/90 via-[#1A1508]/82 to-[#111111]/92 pointer-events-none" />
      );
  }
}

export default function About() {
  const [cfg, setCfg] = useState(DEFAULT_ABOUT_CONFIG);

  usePageSEO({
    title: "About Us | A Specialized Presentation Design Team | SlideBee",
    description: "Slidebee is powered by a team of presentation designers, visual storytellers, and creative professionals. We are a global destination for better presentations.",
  });

  useEffect(() => {
    d1
      .from("site_config")
      .select("value")
      .eq("key", "about_cms")
      .single()
      .then(({ data }) => {
        if (data?.value && typeof data.value === "object") {
          setCfg((prev) => ({ ...prev, ...data.value }));
        }
      })
      .catch(() => {});
  }, []);

  const breadcrumbRaw = cfg.heroBreadcrumb || "Home \u00BB About Us";
  const breadcrumbParts = breadcrumbRaw.split(/\s*(?:>>|\u00BB|>)\s*/);
  const rootBreadcrumb = breadcrumbParts[0] || "Home";
  const currentBreadcrumb = breadcrumbParts[1] || "About Us";
  const heroImageSrc = cfg.heroImage || DEFAULT_ABOUT_CONFIG.heroImage;

  return (
    <div className="min-h-screen bg-white text-[#111111] overflow-hidden pt-20 sm:pt-24 pb-0">
      
      {/* ========================================================================= */}
      {/* HERO HEADER: ARCHITECTURAL FULL-BLEED MASTHEAD (Sharp Edges, rounded-none) */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] overflow-hidden rounded-none border-b border-[#FCBF14]/30 select-none flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        {/* Background Photographic Image Layer */}
        <img
          src={heroImageSrc}
          alt={cfg.teamHeading?.replace(/\n/g, " ") || "SlideBee Team"}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Brand Palette Duotone Gradient Overlay */}
        {getHeroOverlay(cfg.heroColorTheme)}

        {/* Ambient Warm Golden Center Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(252,191,20,0.22)_0%,transparent_70%)] pointer-events-none" />

        {/* Centered Content: Breadcrumb, Eyebrow, Heading, Subtitle, CTA Button */}
        <div className="relative z-10 w-[92%] max-w-4xl mx-auto flex flex-col items-center justify-center space-y-5 sm:space-y-6">
          {/* Breadcrumbs Navigation */}
          <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#FCBF14] drop-shadow">
            <Link
              to="/"
              className="text-[#FCBF14] hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {rootBreadcrumb}
            </Link>
            <span className="text-[#FCBF14]/70 font-bold select-none">&gt;&gt;</span>
            <span className="text-white">
              {currentBreadcrumb}
            </span>
          </nav>

          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#FCBF14] block">
            {cfg.teamEyebrow || "OUR TEAM"}
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-heading font-black text-white leading-[1.08] tracking-tight whitespace-pre-line mx-auto drop-shadow-md">
            {cfg.teamHeading || "A Specialized\nPresentation\nDesign Team."}
          </h1>

          <p className="text-base sm:text-lg text-[#FFF9E8]/90 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
            {cfg.teamSubtitle || "Slidebee is powered by a team of presentation designers, visual storytellers, and creative professionals with extensive experience across industries."}
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              to={cfg.teamCtaLink || "/examples"}
              data-bee-state="hover"
              className="inline-flex items-center gap-2 bg-[#FCBF14] hover:bg-[#E0A810] text-[#111111] font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <span>{cfg.teamCtaText || "Meet Our Work"}</span>
              <ArrowRight size={17} className="stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. OUR VISION SECTION                                                     */}
      {/* ========================================================================= */}
      <section className="w-[90%] max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#726F6D] block">
              {cfg.visionEyebrow || "OUR VISION"}
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-heading font-black text-[#111111] leading-[1.08] tracking-tight whitespace-pre-line">
              {cfg.visionHeading || "A Global Destination\nfor Better Presentations."}
            </h2>

            <p className="text-base sm:text-lg text-[#555250] font-normal leading-relaxed max-w-xl">
              {cfg.visionSubtitle || "We aim to make Slidebee a trusted global destination for presentation design — where anyone can find the right tools, templates, and creative expertise to communicate their ideas more effectively."}
            </p>
          </div>

          {/* Right Visual Column: Hand-Drawn Paper Airplane with Flight Loop */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-8 lg:pt-0">
            
            <div className="relative w-full max-w-[380px] h-[220px]">
              
              {/* Paper Airplane and Loop Trail SVG */}
              <svg
                viewBox="0 0 340 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible select-none"
              >
                {/* Swirling Loop-de-loop Trail Line */}
                <path
                  d="M 120 160 C 145 150, 165 140, 175 125 C 190 100, 170 80, 150 90 C 135 100, 140 125, 160 120 C 185 110, 220 70, 260 40"
                  stroke="#111111"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Origami Paper Airplane Facing Top-Right */}
                <g transform="translate(262, 38) rotate(-10)">
                  {/* Underwing Shadow */}
                  <path
                    d="M 0 0 L -55 24 L -28 10 Z"
                    fill="#E0A810"
                    stroke="#111111"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Top Wing Yellow */}
                  <path
                    d="M 0 0 L -55 -16 L -28 10 Z"
                    fill="#FCBF14"
                    stroke="#111111"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Center Crease */}
                  <path
                    d="M 0 0 L -28 10"
                    stroke="#111111"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>
              </svg>

              {/* Hand-Drawn Styled Text Note beside Trail */}
              <div className="absolute left-6 bottom-4">
                <p className="font-heading font-black italic text-base sm:text-lg text-[#111111] leading-tight whitespace-pre-line">
                  {cfg.visionNote || "Clear Ideas\nCreate Bigger\nOpportunities"}
                </p>
                {/* Yellow Hand-Drawn Underline under Opportunities */}
                <svg className="w-24 h-3 mt-1 text-[#FCBF14]" viewBox="0 0 100 12" fill="none">
                  <path
                    d="M 2 7 Q 50 12, 98 4"
                    stroke="#FCBF14"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FULL-WIDTH CALL TO ACTION (Yellow Background)                          */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FCBF14] text-[#111111] py-20 sm:py-28 relative overflow-hidden text-center mt-12">
        
        {/* Organic Decorative Fluid Blobs on Left and Right Edges */}
        <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-40">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path d="M 0 50 C 60 20, 90 90, 80 140 C 70 190, 20 180, 0 200 Z" fill="#F0B108" />
          </svg>
        </div>

        <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-40">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path d="M 200 40 C 130 50, 110 120, 130 160 C 150 190, 170 190, 200 180 Z" fill="#F0B108" />
          </svg>
        </div>

        <div className="relative z-10 w-[90%] max-w-[850px] mx-auto space-y-6">
          
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#111111]/80 block">
            {cfg.ctaEyebrow || "LET'S CREATE BETTER PRESENTATIONS"}
          </span>

          <h2 className="text-4xl sm:text-6xl lg:text-[68px] font-heading font-black text-[#111111] leading-[1.05] tracking-tight">
            {cfg.ctaHeading || "Your Ideas. Our Design."}
          </h2>

          <p className="text-base sm:text-xl text-[#111111]/90 font-medium max-w-xl mx-auto">
            {cfg.ctaSubtitle || "Choose your way to create better presentations with Slidebee."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            
            {/* Button 1: Dark - Explore Templates */}
            <Link
              to={cfg.ctaPrimaryLink || "/"}
              data-bee-state="hover"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#111111] hover:bg-black text-white font-bold text-sm sm:text-base px-9 py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>{cfg.ctaPrimaryText || "Explore Templates"}</span>
            </Link>

            {/* Button 2: Light - Get a Custom Presentation */}
            <Link
              to={cfg.ctaSecondaryLink || "/ordernow"}
              data-bee-state="quote"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-[#FFFDF5] text-[#111111] font-bold text-sm sm:text-base px-9 py-4 rounded-full shadow-md border border-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>{cfg.ctaSecondaryText || "Get a Custom Presentation"}</span>
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}
