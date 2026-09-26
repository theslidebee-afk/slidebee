import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Paintbrush,
  TrendingUp,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { useStudioStore } from "../modules/StudioStoreClient";

interface SlideItem {
  id: string;
  title: string;
  category: string;
  image: string;
  client?: string;
  code?: string;
}

const defaultUpperSlides: SlideItem[] = [
  {
    id: "deck-volvo",
    title: "Executive Strategic Keynote",
    category: "Keynote",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg",
    client: "Volvo Industrial & Mobility",
    code: "SLD-318",
  },
  {
    id: "deck-accenture",
    title: "Series A Investor Pitch Deck",
    category: "Fundraising",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg",
    client: "Accenture Enterprise Venture",
    code: "SLD-301",
  },
  {
    id: "deck-nike",
    title: "Global Brand Strategy",
    category: "Branding",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg",
    client: "Nike Brand Identity",
    code: "SLD-310",
  },
  {
    id: "deck-levis",
    title: "Retail Expansion Showcase",
    category: "Commercial",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-1.jpg",
    client: "Levi's Heritage & Markets",
    code: "SLD-314",
  },
  {
    id: "deck-cvs",
    title: "Enterprise Healthcare Analysis",
    category: "Healthcare",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg",
    client: "CVS Health Transformation",
    code: "SLD-306",
  },
];

const defaultLowerSlides: SlideItem[] = [
  {
    id: "deck-hsbc",
    title: "Financial KPI & Capital Markets",
    category: "Finance",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-1.jpg",
    client: "HSBC Corporate Markets",
    code: "SLD-304",
  },
  {
    id: "deck-intel",
    title: "DeepTech & Semiconductor Briefing",
    category: "Technology",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-1.jpg",
    client: "Intel Silicon & Cloud",
    code: "SLD-307",
  },
  {
    id: "deck-tag",
    title: "Creative Production & RFP Deck",
    category: "Sales & RFP",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-1.jpg",
    client: "Williams Lea Tag",
    code: "SLD-317",
  },
  {
    id: "deck-british-american",
    title: "Global Market Expansion Strategy",
    category: "Strategy",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-1.jpg",
    client: "British American Markets",
    code: "SLD-312",
  },
  {
    id: "deck-company-profile",
    title: "Corporate Credentials & Profile",
    category: "Business",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-2.jpg",
    client: "Enterprise Credentials",
    code: "SLD-315",
  },
];

export function Suspended3DCarousel() {
  const { templates } = useStudioStore();
  const [upperSlides, setUpperSlides] = useState<SlideItem[]>(defaultUpperSlides);
  const [lowerSlides, setLowerSlides] = useState<SlideItem[]>(defaultLowerSlides);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);

  // Sync with store templates if available
  useEffect(() => {
    if (templates && templates.length >= 8) {
      const upperMapped = templates.slice(0, 5).map((t, idx) => ({
        id: t.id || `tpl-up-${idx}`,
        title: t.title,
        category: t.category || "Keynote",
        image: t.image_url || defaultUpperSlides[idx % defaultUpperSlides.length].image,
        client: t.code || defaultUpperSlides[idx % defaultUpperSlides.length].client,
        code: t.code,
      }));
      const lowerMapped = templates.slice(5, 10).map((t, idx) => ({
        id: t.id || `tpl-low-${idx}`,
        title: t.title,
        category: t.category || "Strategy",
        image: t.image_url || defaultLowerSlides[idx % defaultLowerSlides.length].image,
        client: t.code || defaultLowerSlides[idx % defaultLowerSlides.length].client,
        code: t.code,
      }));
      setUpperSlides(upperMapped);
      setLowerSlides(lowerMapped);
    }
  }, [templates]);

  const total = upperSlides.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Autoplay rotation every 5s when not hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, total]);

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
  };

  const onTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null) return;
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = clientX - touchStartX.current;
    if (diff > 45) {
      handlePrev();
    } else if (diff < -45) {
      handleNext();
    }
    touchStartX.current = null;
  };

  // Render a uniform slide card with flat styling
  const renderCard = (slide: SlideItem, isHighlight: boolean) => (
    <div
      key={slide.id}
      data-bee-state="card"
      className={`shrink-0 w-[260px] sm:w-[320px] md:w-[360px] aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden relative border transition-all duration-300 shadow-md hover:shadow-xl ${
        isHighlight
          ? "border-primary ring-2 ring-primary/40 shadow-primary/20 scale-[1.02]"
          : "border-primary/25 hover:border-primary/60 bg-white"
      }`}
    >
      {/* Slide Cover Image */}
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="lazy"
        onError={(e) => {
          const fallback = defaultUpperSlides[0].image;
          if (e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback;
          }
        }}
      />

      {/* Gradient Overlay & Meta Details */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-between p-3.5 sm:p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="bg-[#111111]/85 backdrop-blur-md text-[#FCBF14] text-[10px] font-black px-3 py-1 rounded-full border border-[#FCBF14]/30 uppercase tracking-wider">
            {slide.category}
          </span>
          {slide.code && (
            <span className="text-[10px] text-white/80 font-mono font-bold bg-white/10 px-2 py-0.5 rounded">
              {slide.code}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-xs sm:text-sm font-heading font-black text-white leading-snug line-clamp-1 drop-shadow-sm">
            {slide.title}
          </h3>
          {slide.client && (
            <p className="text-[10px] sm:text-xs text-white/80 font-medium line-clamp-1 mt-0.5">
              {slide.client}
            </p>
          )}

          <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between">
            <span className="text-[10px] text-[#FCBF14] font-extrabold uppercase tracking-wider">
              SlideBee Master Deck
            </span>
            <Link
              to={slide.code ? `/template/${slide.code}` : "/#templates"}
              className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white hover:text-[#FCBF14] font-bold transition-colors"
            >
              <span>View Deck</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Triple the array for seamless infinite wrap
  const upperTrack = [...upperSlides, ...upperSlides, ...upperSlides];
  const lowerTrack = [...lowerSlides, ...lowerSlides, ...lowerSlides];

  return (
    <div
      className="relative w-full py-8 sm:py-12 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Header Section */}
      <div className="max-w-3xl mx-auto text-center px-4 mb-8 sm:mb-12 relative z-10">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] tracking-tight leading-[1.08] mb-4">
          Supercharge Your Workflow
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-[#726F6D] font-medium leading-relaxed max-w-xl mx-auto mb-6">
          All-in-one presentation studio to storyboard, design, and deliver board-ready decks with speed and precision.
        </p>
        <Link
          to="/ordernow"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg shadow-[#FCBF14]/25 hover:scale-105 transition-all"
        >
          <span>Get Started for Free</span>
          <ArrowRight size={15} className="text-[#111111]" />
        </Link>
      </div>

      {/* 2. Simplified Two-Lined Flat Sliding Carousel */}
      <div
        className="relative w-full overflow-hidden select-none py-4"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
      >
        {/* Left & Right Soft Vignette Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#FFF9E8] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#FFF9E8] to-transparent z-20 pointer-events-none" />

        {/* Carousel Tracks Container */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Row 1: Upper Slide Cards */}
          <div
            className="flex gap-4 sm:gap-6 transition-transform duration-700 ease-in-out px-4"
            style={{
              transform: `translateX(calc(-${(currentIndex + total) * 100}% / 3.5))`,
            }}
          >
            {upperTrack.map((slide, index) =>
              renderCard(slide, (index % total) === currentIndex)
            )}
          </div>

          {/* Row 2: Lower Slide Cards (offset by 1 card for visual balance) */}
          <div
            className="flex gap-4 sm:gap-6 transition-transform duration-700 ease-in-out px-4"
            style={{
              transform: `translateX(calc(-${((currentIndex + 1) + total) * 100}% / 3.5))`,
            }}
          >
            {lowerTrack.map((slide, index) =>
              renderCard(slide, (index % total) === ((currentIndex + 1) % total))
            )}
          </div>

        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-[#111111] shadow-xl border border-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-[#111111] shadow-xl border border-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {upperSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === currentIndex
                ? "w-8 h-2.5 bg-[#FCBF14]"
                : "w-2.5 h-2.5 bg-[#111111]/20 hover:bg-[#111111]/40"
            }`}
          />
        ))}
      </div>

      {/* 3. Three Feature Columns Beneath the Carousel */}
      <div className="max-w-[1580px] w-[90%] mx-auto mt-12 sm:mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
          
          {/* Column 1: Presentation Redesign */}
          <div className="flex flex-col items-center p-6 bg-white/75 backdrop-blur-sm rounded-3xl border border-primary/25 hover:border-primary transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-3">
              <Paintbrush className="w-6 h-6 text-[#111111]" />
            </div>
            <h4 className="text-base sm:text-lg font-heading font-black text-[#111111] mb-2">
              Presentation Redesign
            </h4>
            <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed max-w-xs">
              Transform rough notes, documents, and messy slides into polished, board-ready presentations with flawless visual hierarchy.
            </p>
          </div>

          {/* Column 2: Pitch Deck & Storyboarding */}
          <div className="flex flex-col items-center p-6 bg-white/75 backdrop-blur-sm rounded-3xl border border-primary/25 hover:border-primary transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-3">
              <TrendingUp className="w-6 h-6 text-[#111111]" />
            </div>
            <h4 className="text-base sm:text-lg font-heading font-black text-[#111111] mb-2">
              Pitch Deck & Storyboarding
            </h4>
            <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed max-w-xs">
              Compelling narratives and investor-grade slide systems engineered to secure venture capital and executive stakeholder alignment.
            </p>
          </div>

          {/* Column 3: Data Visualization & Analytics */}
          <div className="flex flex-col items-center p-6 bg-white/75 backdrop-blur-sm rounded-3xl border border-primary/25 hover:border-primary transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6 text-[#111111]" />
            </div>
            <h4 className="text-base sm:text-lg font-heading font-black text-[#111111] mb-2">
              Data Visualization
            </h4>
            <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed max-w-xs">
              Turn complex spreadsheets and dense financial models into intuitive charts, cohort waterfalls, and clear executive dashboards.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
