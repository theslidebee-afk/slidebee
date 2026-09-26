import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { HexProcessInfographic } from "../components/HexProcessInfographic";
import { Suspended3DCarousel } from "../components/Suspended3DCarousel";
import { 
  Sliders, 
  Paintbrush, 
  PenTool,
  Sparkles,
  BarChart3, 
  LayoutGrid, 
  Palette,
  ArrowRight
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

const STORAGE_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides";

export default function Services() {
  usePageSEO({
    title: "Executive Presentation Design Services | SlideBee",
    description: "Full-service presentation design studio: pitch deck design, keynote polish, board decks, financial data visualization, and master template design.",
  });

  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get("service");

  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedService, setSelectedService] = useState<string>(() => {
    const validServices = ["redesign", "handwritten", "cleanup", "data", "template", "graphic"];
    const initialParam = new URLSearchParams(window.location.hash.split("?")[1] || window.location.search).get("service");
    return initialParam && validServices.includes(initialParam) ? initialParam : "redesign";
  });
  const [customServices, setCustomServices] = useState<Record<string, any>>({});

  useEffect(() => {
    const validServices = ["redesign", "handwritten", "cleanup", "data", "template", "graphic"];
    if (serviceParam && validServices.includes(serviceParam)) {
      setSelectedService(serviceParam);
      setSliderPosition(50);
    }
  }, [serviceParam]);

  useEffect(() => {
    // Fetch custom services configuration
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "services_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) setCustomServices(data.value);
      });
  }, []);

  // 6 Services with detailed comparisons
  const servicesData = {
    redesign: {
      id: "redesign",
      title: "Redesign and Visual Enhancement",
      tagline: "We uplift your slides with creativity",
      icon: <Paintbrush className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/hsbc_slide-2.jpg`,
      afterImg: `${STORAGE_BASE}/accenture_slide-1.jpg`,
      beforeTitle: "Raw Draft / Before",
      afterTitle: "SlideBee Redesign / After",
      turnaround: "24h – 48h",
      idealFor: "Corporate decks, weekly business reviews, conference presentations"
    },
    handwritten: {
      id: "handwritten",
      title: "Handwritten Conversions",
      tagline: "Deciphering handwritten text to marvelous-looking presentations",
      icon: <PenTool className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/british_american_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/nike_slide-1.jpg`,
      beforeTitle: "Handwritten Notes / Sketches",
      afterTitle: "Marvelous Presentation / After",
      turnaround: "24h – 48h",
      idealFor: "Whiteboard concepts, handwritten brainstorms, napkin sketches"
    },
    cleanup: {
      id: "cleanup",
      title: "Quick Scrub and Clean Up",
      tagline: "Fixing presentation as swiftly as a kite",
      icon: <Sparkles className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/cvs_health_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/volvo_slide-1.jpg`,
      beforeTitle: "Rough Draft & Misalignments",
      afterTitle: "Cleaned & Aligned Presentation",
      turnaround: "12h – 24h Rush",
      idealFor: "Emergency board meetings, rapid cleanup, formatting alignment"
    },
    data: {
      id: "data",
      title: "Data Visualization",
      tagline: "Blending numbers with our marvelous design",
      icon: <BarChart3 className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/tag_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/intel_slide-1.jpg`,
      beforeTitle: "Raw Spreadsheet Data",
      afterTitle: "Marvelous Visual Dashboard",
      turnaround: "24h – 48h",
      idealFor: "Financial reports, quarterly investor reviews, SaaS metrics"
    },
    template: {
      id: "template",
      title: "Template Creation",
      tagline: "Highly stylized presentation templates",
      icon: <LayoutGrid className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/hsbc_slide-4.jpg`,
      afterImg: `${STORAGE_BASE}/levis_slide-1.jpg`,
      beforeTitle: "Standard Plain Template",
      afterTitle: "Highly Stylized Master System",
      turnaround: "2 – 4 Days",
      idealFor: "Company brand systems, sales organizations, agency templates"
    },
    graphic: {
      id: "graphic",
      title: "Graphic Design",
      tagline: "Designing your visual story",
      icon: <Palette className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/intel_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/tag_slide-1.jpg`,
      beforeTitle: "Text-Heavy Concept",
      afterTitle: "Designed Visual Story",
      turnaround: "24h – 48h",
      idealFor: "Custom infographics, product storyboards, marketing collateral"
    }
  };

  const defaultService = (servicesData as any)[selectedService] || servicesData.redesign;
  const customOverride = customServices[selectedService] || {};
  const activeServiceData = {
    ...defaultService,
    ...customOverride,
    icon: defaultService.icon
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden">
      
      {/* 1. HERO SECTION WITH TWO-LINED 3D SUSPENDED PERSPECTIVE CAROUSEL */}
      <section className="relative bg-[#FFF9E8] pt-24 sm:pt-28 pb-16 border-b border-primary/20 large-hex-grid overflow-hidden">
        {/* Soft Golden Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FCBF14]/12 rounded-full blur-[160px] pointer-events-none" />

        <div className="w-[92%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <Suspended3DCarousel />
        </div>
      </section>

      {/* 2. THE 6 CORE SERVICES WITH INTERACTIVE BEFORE/AFTER SHOWCASE */}
      <section id="services-grid" className="py-20 bg-[#FFF9E8] large-hex-grid">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
              Our 6 Specialized Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] mb-3">
              Select a Service to See the Transformation
            </h2>
            <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
              Click any service below to inspect the before-and-after redesign slider and exact deliverables.
            </p>
          </div>

          {/* 6 Service Selector Modern Rounded Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-10 max-w-5xl mx-auto">
            {Object.values(servicesData).map((svc) => {
              const isSelected = selectedService === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => {
                    setSelectedService(svc.id as any);
                    setSliderPosition(50);
                  }}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? "bg-[#111111] text-[#FCBF14] border-[#FCBF14] shadow-lg shadow-[#FCBF14]/20 scale-103"
                      : "bg-white/95 hover:bg-white text-[#111111] border-primary/25 hover:border-primary/60 shadow-xs hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                      isSelected
                        ? "bg-[#FCBF14] text-[#111111]"
                        : "bg-[#FFF9E8] text-primary-amber"
                    }`}
                  >
                    {svc.icon}
                  </div>
                  <span className="font-heading font-extrabold text-xs leading-tight">
                    {svc.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE SERVICE BEFORE/AFTER SHOWCASE CONTAINER */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeServiceData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-2 border-primary/40 rounded-3xl p-6 sm:p-10 shadow-xl max-w-5xl mx-auto"
            >
              
              {/* Header Details */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-primary/20 mb-8">
                <div>
                  <div className="inline-block bg-[#FFF9E8] text-primary-amber border border-primary/30 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider mb-2">
                    Turnaround: {activeServiceData.turnaround}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111111]">
                    {activeServiceData.title}
                  </h3>
                  <p className="text-[#726F6D] text-xs sm:text-sm font-medium mt-1">
                    {activeServiceData.tagline}
                  </p>
                </div>

                <Link
                  to={`/ordernow?service=${encodeURIComponent(activeServiceData.title)}`}
                  className="bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black px-7 py-3 rounded-full text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-[#FCBF14]/25 hover:scale-105 shrink-0"
                >
                  Order {activeServiceData.title} <ArrowRight size={15} />
                </Link>
              </div>

              {/* Centered Heroic Before/After Drag Slider */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-[#111111] border-2 border-primary/40 rounded-2xl p-2 sm:p-3 shadow-2xl overflow-hidden">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden select-none">
                    
                    {/* After Image */}
                    <img
                      src={activeServiceData.afterImg}
                      alt={activeServiceData.afterTitle}
                      className="absolute inset-0 w-full h-full object-contain bg-[#111111]"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-[#111111] font-black text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full z-10 shadow-md">
                      {activeServiceData.afterTitle}
                    </div>

                    {/* Before Image (Clipped) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                    >
                      <img
                        src={activeServiceData.beforeImg}
                        alt={activeServiceData.beforeTitle}
                        className="absolute inset-0 w-full h-full object-contain bg-[#161a22]"
                      />
                      <div className="absolute top-3 left-3 bg-[#111111]/85 backdrop-blur-md text-white font-extrabold text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full border border-white/20">
                        {activeServiceData.beforeTitle}
                      </div>
                    </div>

                    {/* Slider Divider Bar */}
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-primary cursor-ew-resize z-20"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="hex-slider-knob absolute top-1/2 -translate-y-1/2 -translate-x-1/2">
                        <Sliders size={15} />
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      aria-label="Before and after transformation slider"
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    />
                  </div>
                </div>

                {/* Subtitle & Suited For Tagline */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-2 text-xs text-[#726F6D] font-medium">
                  <p>Drag slider left and right to inspect the redesign details</p>
                  {activeServiceData.idealFor && (
                    <p className="font-bold text-[#111111]">
                      Best Suited For: <span className="text-[#726F6D] font-medium">{activeServiceData.idealFor}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Dedicated Call to Action Bar */}
              <div className="mt-8 pt-6 border-t border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFF9E8] p-5 sm:p-6 rounded-2xl border border-primary/30 shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-amber block mb-1">
                    Ready to elevate your slides?
                  </span>
                  <h4 className="text-base sm:text-lg font-heading font-extrabold text-[#111111]">
                    Get Started with {activeServiceData.title}
                  </h4>
                  <p className="text-xs text-[#726F6D] font-medium mt-0.5">
                    Estimated Turnaround: <strong className="text-[#111111]">{activeServiceData.turnaround}</strong> • 100% editable vector slides & strict enterprise NDA
                  </p>
                </div>
                <Link
                  to={`/ordernow?service=${encodeURIComponent(activeServiceData.title)}`}
                  className="bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black px-7 py-3 rounded-full text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-[#FCBF14]/25 hover:scale-105 shrink-0"
                >
                  Order {activeServiceData.title} <ArrowRight size={15} />
                </Link>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* 3. HOW SLIDEBEE WORKS (4-Step Infographic Pipeline - Preserved) */}
      <section className="py-16 bg-[#FFF9E8] border-t border-primary/20">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/85 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 sm:p-10 lg:p-12 shadow-lg">
            <HexProcessInfographic />
          </div>
        </div>
      </section>

      {/* 4. BOTTOM ACTION BANNER */}
      <section className="py-16 bg-[#111111] text-white text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto max-w-2xl z-10 relative">
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white mb-3">
            Have a Presentation Due Soon?
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm font-medium mb-8 max-w-lg mx-auto">
            Upload your rough outline, draft slides, or bullet points. We'll send you a custom proposal and quote within 2 hours.
          </p>
          <Link
            to="/ordernow"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black px-8 py-4 rounded-full text-xs sm:text-sm transition-all shadow-xl shadow-[#FCBF14]/25 hover:scale-105"
          >
            Start Your Project Brief <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
