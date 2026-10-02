import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Paintbrush,
  PenTool,
  Sparkles,
  BarChart3,
  LayoutGrid,
  Palette,
  ArrowRight
} from "lucide-react";
import { useStudioStore } from "../modules/StudioStoreClient";
import { d1 } from "../lib/d1";

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

interface Suspended3DCarouselProps {
  onSelectService?: (serviceId: string) => void;
}

export function Suspended3DCarousel({ onSelectService }: Suspended3DCarouselProps = {}) {
  const { templates } = useStudioStore();
  const [upperSlides, setUpperSlides] = useState<SlideItem[]>(defaultUpperSlides);
  const [lowerSlides, setLowerSlides] = useState<SlideItem[]>(defaultLowerSlides);

  // Fetch custom slides if configured via Admin Services Carousel selector
  useEffect(() => {
    d1
      .from("site_config")
      .select("value")
      .eq("key", "services_carousel_slides")
      .single()
      .then(({ data }) => {
        if (data?.value?.upperSlides && Array.isArray(data.value.upperSlides) && data.value.upperSlides.length > 0) {
          setUpperSlides(data.value.upperSlides);
        } else if (templates && templates.length >= 8) {
          const upperMapped = templates.slice(0, 5).map((t, idx) => ({
            id: t.id || `tpl-up-${idx}`,
            title: t.title,
            category: t.category || "Keynote",
            image: t.image_url || defaultUpperSlides[idx % defaultUpperSlides.length].image,
            client: t.code || defaultUpperSlides[idx % defaultUpperSlides.length].client,
            code: t.code,
          }));
          setUpperSlides(upperMapped);
        }

        if (data?.value?.lowerSlides && Array.isArray(data.value.lowerSlides) && data.value.lowerSlides.length > 0) {
          setLowerSlides(data.value.lowerSlides);
        } else if (templates && templates.length >= 8) {
          const lowerMapped = templates.slice(5, 10).map((t, idx) => ({
            id: t.id || `tpl-low-${idx}`,
            title: t.title,
            category: t.category || "Strategy",
            image: t.image_url || defaultLowerSlides[idx % defaultLowerSlides.length].image,
            client: t.code || defaultLowerSlides[idx % defaultLowerSlides.length].client,
            code: t.code,
          }));
          setLowerSlides(lowerMapped);
        }
      })
      .catch(() => {});
  }, [templates]);

  // Render a clean slide card displaying exclusively the slide preview image (scaled down slightly)
  const renderCard = (slide: SlideItem | string | any, uniqueKey: string) => {
    const imageUrl = typeof slide === "string" ? slide : (slide?.image || slide?.thumbnail_url || defaultUpperSlides[0].image);
    const titleText = typeof slide === "string" ? "Slide Deck" : (slide?.title || "Slide Deck");
    return (
      <div
        key={uniqueKey}
        data-bee-state="card"
        className="shrink-0 w-[205px] sm:w-[245px] md:w-[275px] aspect-[16/10] rounded-2xl overflow-hidden relative border border-primary/25 hover:border-primary/80 bg-white transition-all duration-300 shadow-sm hover:shadow-xl group"
      >
        {/* Slide Cover Image */}
        <img
          src={imageUrl}
          alt={titleText}
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
  };

  // Duplicated arrays for seamless infinite looping
  const upperTrack = [...upperSlides, ...upperSlides, ...upperSlides, ...upperSlides];
  const lowerTrack = [...lowerSlides, ...lowerSlides, ...lowerSlides, ...lowerSlides];

  return (
    <div className="relative w-full py-8 sm:py-12 overflow-hidden">
      
      {/* 1. Header Section (without Get Started for Free button) */}
      <div className="max-w-3xl mx-auto text-center px-4 mb-8 sm:mb-12 relative z-10">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] tracking-tight leading-[1.08] mb-4">
          Supercharge Your Workflow
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-[#726F6D] font-medium leading-relaxed max-w-xl mx-auto">
          All-in-one presentation studio to storyboard, design, and deliver board-ready decks with speed and precision.
        </p>
      </div>

      {/* 2. Continuous Two-Row Auto-Scrolling Marquee */}
      <div className="relative w-full overflow-hidden select-none py-2 pause-on-hover">
        

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

      {/* 3. The 6 Core Services Grid Beneath the Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1600px] w-[92%] mx-auto mt-16 sm:mt-24 relative z-20"
      >
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-primary-amber text-xs font-black uppercase tracking-widest block mb-1.5">
            End-To-End Studio Capabilities
          </span>
          <h3 className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
            Our 6 Executive Services
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 text-left">
          
          {/* Service 1: Redesign and Visual Enhancement */}
          <div className="flex flex-col justify-between p-6 sm:p-7 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-primary/25 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Paintbrush className="w-6 h-6 text-[#111111]" />
              </div>
              <h4 className="text-lg font-heading font-black text-[#111111] mb-1.5 group-hover:text-primary-amber transition-colors">
                Redesign and Visual Enhancement
              </h4>
              <p className="text-xs font-bold text-primary-amber mb-2">
                We uplift your slides with creativity
              </p>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
                Transform rough notes, messy slides, and draft documents into polished, board-ready presentations with flawless visual hierarchy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectService?.("redesign")}
              className="hex-pill-sm self-start bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-transform hover:scale-103 cursor-pointer"
            >
              <span>Explore Transformation</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Service 2: Handwritten Conversions */}
          <div className="flex flex-col justify-between p-6 sm:p-7 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-primary/25 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6 text-[#111111]" />
              </div>
              <h4 className="text-lg font-heading font-black text-[#111111] mb-1.5 group-hover:text-primary-amber transition-colors">
                Handwritten Conversions
              </h4>
              <p className="text-xs font-bold text-primary-amber mb-2">
                Deciphering handwritten text to marvelous-looking presentations
              </p>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
                Turn whiteboard sketches, iPad scribbles, and napkin concepts into clean, vector-rendered digital presentations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectService?.("handwritten")}
              className="hex-pill-sm self-start bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-transform hover:scale-103 cursor-pointer"
            >
              <span>Explore Transformation</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Service 3: Quick Scrub and Clean Up */}
          <div className="flex flex-col justify-between p-6 sm:p-7 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-primary/25 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-[#111111]" />
              </div>
              <h4 className="text-lg font-heading font-black text-[#111111] mb-1.5 group-hover:text-primary-amber transition-colors">
                Quick Scrub and Clean Up
              </h4>
              <p className="text-xs font-bold text-primary-amber mb-2">
                Fixing presentation as swiftly as a kite
              </p>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
                Rapid turnaround typography unification, alignment fixes, margin correction, and visual polish under tight deadlines.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectService?.("cleanup")}
              className="hex-pill-sm self-start bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-transform hover:scale-103 cursor-pointer"
            >
              <span>Explore Transformation</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Service 4: Data Visualization */}
          <div className="flex flex-col justify-between p-6 sm:p-7 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-primary/25 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-[#111111]" />
              </div>
              <h4 className="text-lg font-heading font-black text-[#111111] mb-1.5 group-hover:text-primary-amber transition-colors">
                Data Visualization
              </h4>
              <p className="text-xs font-bold text-primary-amber mb-2">
                Blending numbers with our marvelous design
              </p>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
                Turn complex spreadsheets and dense financial models into intuitive charts, cohort waterfalls, and executive dashboards.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectService?.("data")}
              className="hex-pill-sm self-start bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-transform hover:scale-103 cursor-pointer"
            >
              <span>Explore Transformation</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Service 5: Template Creation */}
          <div className="flex flex-col justify-between p-6 sm:p-7 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-primary/25 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-6 h-6 text-[#111111]" />
              </div>
              <h4 className="text-lg font-heading font-black text-[#111111] mb-1.5 group-hover:text-primary-amber transition-colors">
                Template Creation
              </h4>
              <p className="text-xs font-bold text-primary-amber mb-2">
                Highly stylized presentation templates
              </p>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
                Custom corporate master templates, design systems, branded typography scales, and modular multi-slide layout libraries.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectService?.("template")}
              className="hex-pill-sm self-start bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-transform hover:scale-103 cursor-pointer"
            >
              <span>Explore Transformation</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Service 6: Graphic Design */}
          <div className="flex flex-col justify-between p-6 sm:p-7 bg-white/90 backdrop-blur-md rounded-3xl border-2 border-primary/25 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 text-[#111111]" />
              </div>
              <h4 className="text-lg font-heading font-black text-[#111111] mb-1.5 group-hover:text-primary-amber transition-colors">
                Graphic Design
              </h4>
              <p className="text-xs font-bold text-primary-amber mb-2">
                Designing your visual story
              </p>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
                Custom vector illustrations, 3D conceptual graphics, iconography, and visual metaphors that elevate strategic storytelling.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectService?.("graphic")}
              className="hex-pill-sm self-start bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-transform hover:scale-103 cursor-pointer"
            >
              <span>Explore Transformation</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
