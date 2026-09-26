import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Paintbrush,
  TrendingUp,
  BarChart3
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

  // Render a clean slide card displaying exclusively the slide preview image
  const renderCard = (slide: SlideItem, uniqueKey: string) => (
    <div
      key={uniqueKey}
      data-bee-state="card"
      className="shrink-0 w-[240px] sm:w-[280px] md:w-[320px] aspect-[16/10] rounded-2xl overflow-hidden relative border border-primary/25 hover:border-primary/80 bg-white transition-all duration-300 shadow-sm hover:shadow-xl group"
    >
      {/* Slide Cover Image */}
      <img
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        onError={(e) => {
          const fallback = defaultUpperSlides[0].image;
          if (e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback;
          }
        }}
      />
    </div>
  );

  // Duplicated arrays for seamless infinite looping
  const upperTrack = [...upperSlides, ...upperSlides, ...upperSlides, ...upperSlides];
  const lowerTrack = [...lowerSlides, ...lowerSlides, ...lowerSlides, ...lowerSlides];

  return (
    <div className="relative w-full py-8 sm:py-12 overflow-hidden">
      
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

      {/* 2. Continuous Two-Row Auto-Scrolling Marquee */}
      <div className="relative w-full overflow-hidden select-none py-2 pause-on-hover">
        
        {/* Soft Left and Right Vignette Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#FFF9E8] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#FFF9E8] to-transparent z-20 pointer-events-none" />

        {/* Carousel Tracks Container */}
        <div className="space-y-4 sm:space-y-5">
          
          {/* Row 1: Upper Slide Cards - Continuous Slide Right */}
          <div className="overflow-hidden w-full flex">
            <div className="animate-marquee-right flex gap-4 sm:gap-5 px-2">
              {upperTrack.map((slide, index) =>
                renderCard(slide, `upper-${slide.id}-${index}`)
              )}
            </div>
          </div>

          {/* Row 2: Lower Slide Cards - Continuous Slide Left */}
          <div className="overflow-hidden w-full flex">
            <div className="animate-marquee-left flex gap-4 sm:gap-5 px-2">
              {lowerTrack.map((slide, index) =>
                renderCard(slide, `lower-${slide.id}-${index}`)
              )}
            </div>
          </div>

        </div>

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
