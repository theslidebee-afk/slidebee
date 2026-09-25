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

const defaultSlides: SlideItem[] = [
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
    id: "deck-cvs",
    title: "Enterprise Healthcare Analysis",
    category: "Healthcare",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg",
    client: "CVS Health Transformation",
    code: "SLD-306",
  },
  {
    id: "deck-tag",
    title: "Creative Production & RFP Deck",
    category: "Sales & RFP",
    image: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-1.jpg",
    client: "Williams Lea Tag",
    code: "SLD-317",
  },
];

export function Suspended3DCarousel() {
  const { templates } = useStudioStore();
  const [slides, setSlides] = useState<SlideItem[]>(defaultSlides);
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const dragStartX = useRef<number | null>(null);

  // Sync with live store templates if available
  useEffect(() => {
    if (templates && templates.length >= 4) {
      const mapped = templates.slice(0, 10).map((t, idx) => ({
        id: t.id || `tpl-${idx}`,
        title: t.title,
        category: t.category || "Presentation",
        image: t.image_url || defaultSlides[idx % defaultSlides.length].image,
        client: t.code || defaultSlides[idx % defaultSlides.length].client,
        code: t.code,
      }));
      setSlides(mapped);
    }
  }, [templates]);

  const total = slides.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  // Autoplay rotation every 5s when not hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, total]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = clientX - dragStartX.current;
    if (diff > 50) {
      prevSlide();
    } else if (diff < -50) {
      nextSlide();
    }
    dragStartX.current = null;
  };

  return (
    <div
      className="relative w-full py-12 sm:py-16 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Header Section (Matching Pinterest Reference) */}
      <div className="max-w-3xl mx-auto text-center px-4 mb-8 sm:mb-12 relative z-10">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] tracking-tight leading-[1.08] mb-4">
          Supercharge Your Workflow
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-[#726F6D] font-medium leading-relaxed max-w-xl mx-auto mb-6">
          All-in-one studio to storyboard, design, and deliver board-ready presentations — faster and smarter.
        </p>
        <Link
          to="/ordernow"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg shadow-[#FCBF14]/25 hover:scale-105 transition-all"
        >
          <span>Get Started for Free</span>
          <ArrowRight size={15} className="text-[#111111]" />
        </Link>
      </div>

      {/* 2. 3D Suspended Curved Perspective Carousel Container */}
      <div
        className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] lg:h-[540px] flex items-center justify-center select-none"
        style={{ perspective: "1500px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* Suspended Stage Floor Shadow - Creates the Hovering Sensation */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 w-[85%] max-w-[1100px] h-12 bg-black/15 blur-2xl rounded-full pointer-events-none" />

        {/* Left & Right Atmospheric Edge Vignette Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-[#FFF9E8] via-[#FFF9E8]/80 to-transparent z-40 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l from-[#FFF9E8] via-[#FFF9E8]/80 to-transparent z-40 pointer-events-none" />

        <div
          className="relative w-full h-full flex items-center justify-center animate-float-suspended"
          style={{ transformStyle: "preserve-3d" }}
        >
          {slides.map((slide, index) => {
            // Calculate circular offset relative to activeIndex
            let offset = ((index - activeIndex + total + Math.floor(total / 2)) % total) - Math.floor(total / 2);

            // Hide cards positioned too far around the ring
            const isVisible = Math.abs(offset) <= 3;
            if (!isVisible) return null;

            // Concave Amphitheater 3D Arc calculation (Matching Pinterest Reference):
            // Outer cards wrap forward toward the viewer and rotate inward facing the center.
            const absOffset = Math.abs(offset);
            const rotateY = -offset * (absOffset >= 2 ? 18 : 13);
            const translateX = offset * (window.innerWidth < 640 ? 150 : 210);
            // Center is slightly recessed, outer cards step forward into space
            const translateZ = (Math.pow(absOffset, 1.4) * 45) - 40;
            // Slight vertical elevation curve matching the panoramic ribbon
            const translateY = -(Math.pow(absOffset, 1.2) * 8);
            // Scale increases slightly as cards swing forward
            const scale = 0.92 + (absOffset * 0.035);
            // Smooth falloff for outer cards
            const opacity = Math.max(0.65, 1 - absOffset * 0.12);
            // zIndex ensures proper 3D stacking order
            const zIndex = 40 - Math.round(absOffset * 5);

            const isCenter = offset === 0;

            return (
              <div
                key={slide.id}
                onClick={() => setActiveIndex(index)}
                className={`absolute w-[200px] sm:w-[260px] md:w-[300px] lg:w-[340px] aspect-[4/5] rounded-[24px] sm:rounded-[32px] overflow-hidden cursor-pointer transition-all duration-700 ease-out shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${
                  isCenter
                    ? "ring-4 ring-[#FCBF14] ring-offset-4 ring-offset-[#FFF9E8] shadow-[0_25px_60px_rgba(252,191,20,0.25)]"
                    : "hover:brightness-105"
                }`}
                style={{
                  transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Slide Preview Cover Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  loading="lazy"
                  onError={(e) => {
                    const fallback = defaultSlides[index % defaultSlides.length].image;
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                />

                {/* Dark Gradient Overlay & Slide Meta */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#111111]/80 backdrop-blur-md text-[#FCBF14] text-[10px] sm:text-xs font-black px-3 py-1 rounded-full border border-[#FCBF14]/30">
                      {slide.category}
                    </span>
                    {slide.code && (
                      <span className="text-[10px] text-white/70 font-mono font-bold">
                        {slide.code}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base lg:text-lg font-heading font-black text-white leading-tight drop-shadow-md">
                      {slide.title}
                    </h3>
                    {slide.client && (
                      <p className="text-[11px] sm:text-xs text-white/80 font-medium mt-1">
                        {slide.client}
                      </p>
                    )}
                    {isCenter && (
                      <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between">
                        <span className="text-[10px] text-[#FCBF14] font-extrabold uppercase tracking-wider">
                          Executive Master Deck
                        </span>
                        <Link
                          to={slide.code ? `/template/${slide.code}` : "/#templates"}
                          className="inline-flex items-center gap-1 text-[11px] text-white hover:text-[#FCBF14] font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>View Deck</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 sm:left-12 lg:left-24 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/90 hover:bg-white text-[#111111] shadow-xl border border-black/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 sm:right-12 lg:right-24 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/90 hover:bg-white text-[#111111] shadow-xl border border-black/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === activeIndex
                ? "w-8 h-2.5 bg-[#FCBF14]"
                : "w-2.5 h-2.5 bg-[#111111]/20 hover:bg-[#111111]/40"
            }`}
          />
        ))}
      </div>

      {/* 3. Three Feature Columns Beneath the Carousel (Matching Pinterest Reference) */}
      <div className="max-w-[1580px] w-[90%] mx-auto mt-14 sm:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 text-center">
          
          {/* Column 1: Presentation Redesign */}
          <div className="flex flex-col items-center p-6 bg-white/70 backdrop-blur-sm rounded-3xl border border-primary/25 hover:border-primary transition-all shadow-sm">
            <div className="w-13 h-13 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4">
              <Paintbrush className="w-6 h-6 text-[#111111]" />
            </div>
            <h4 className="text-lg sm:text-xl font-heading font-black text-[#111111] mb-2">
              Presentation Redesign
            </h4>
            <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed max-w-xs">
              Transform rough notes, documents, and messy slides into polished, board-ready presentations with flawless visual hierarchy.
            </p>
          </div>

          {/* Column 2: Pitch Deck & Storyboarding */}
          <div className="flex flex-col items-center p-6 bg-white/70 backdrop-blur-sm rounded-3xl border border-primary/25 hover:border-primary transition-all shadow-sm">
            <div className="w-13 h-13 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-[#111111]" />
            </div>
            <h4 className="text-lg sm:text-xl font-heading font-black text-[#111111] mb-2">
              Pitch Deck & Storyboarding
            </h4>
            <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed max-w-xs">
              Compelling narratives and investor-grade slide systems engineered to secure venture capital and executive stakeholder alignment.
            </p>
          </div>

          {/* Column 3: Data Visualization & Analytics */}
          <div className="flex flex-col items-center p-6 bg-white/70 backdrop-blur-sm rounded-3xl border border-primary/25 hover:border-primary transition-all shadow-sm">
            <div className="w-13 h-13 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-[#111111]" />
            </div>
            <h4 className="text-lg sm:text-xl font-heading font-black text-[#111111] mb-2">
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
