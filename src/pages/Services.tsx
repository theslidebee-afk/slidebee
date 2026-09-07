import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { MagneticButton } from "../components/MagneticButton";
import { 
  Shield, 
  Clock, 
  Layers, 
  Sliders, 
  Paintbrush, 
  TrendingUp, 
  BarChart3, 
  LayoutGrid, 
  Award, 
  Megaphone,
  ArrowRight,
  CheckCircle2,
  X
} from "lucide-react";

const STORAGE_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides";

const defaultTopMarqueeSlides = [
  `${STORAGE_BASE}/accenture_slide-1.jpg`,
  `${STORAGE_BASE}/nike_slide-1.jpg`,
  `${STORAGE_BASE}/volvo_slide-1.jpg`,
  `${STORAGE_BASE}/intel_slide-1.jpg`,
  `${STORAGE_BASE}/hsbc_slide-1.jpg`,
  `${STORAGE_BASE}/tag_slide-1.jpg`,
];

const defaultBottomMarqueeSlides = [
  `${STORAGE_BASE}/cvs_health_slide-1.jpg`,
  `${STORAGE_BASE}/british_american_slide-1.jpg`,
  `${STORAGE_BASE}/levis_slide-1.jpg`,
  `${STORAGE_BASE}/accenture_slide-2.jpg`,
  `${STORAGE_BASE}/nike_slide-2.jpg`,
  `${STORAGE_BASE}/volvo_slide-2.jpg`,
];

const defaultWorkedCompanies = [
  { name: "Accenture", category: "Consulting & Strategy" },
  { name: "Nike", category: "Retail & Innovation" },
  { name: "Volvo", category: "Automotive & Mobility" },
  { name: "Intel", category: "Silicon & Cloud Compute" },
  { name: "HSBC", category: "Global Banking & Compliance" },
  { name: "CVS Health", category: "Healthcare & Omnichannel" },
  { name: "British American", category: "Global Enterprise Strategy" },
  { name: "Levi's", category: "Consumer Brands" },
  { name: "Williams Lea Tag", category: "Creative Production & RFP" }
];

export default function Services() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedService, setSelectedService] = useState<string>("redesign");
  const [customServices, setCustomServices] = useState<Record<string, any>>({});
  const [topMarqueeSlides, setTopMarqueeSlides] = useState<string[]>(defaultTopMarqueeSlides);
  const [bottomMarqueeSlides, setBottomMarqueeSlides] = useState<string[]>(defaultBottomMarqueeSlides);
  const [workedCompanies, setWorkedCompanies] = useState<{ name: string; category: string }[]>(defaultWorkedCompanies);

  useEffect(() => {
    // 1. Fetch custom services configuration
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "services_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) setCustomServices(data.value);
      });

    // 2. Fetch worked companies configuration
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "worked_companies")
      .single()
      .then(({ data }) => {
        if (data?.value?.companies && Array.isArray(data.value.companies) && data.value.companies.length > 0) {
          setWorkedCompanies(data.value.companies);
        }
      });

    // 3. Fetch custom marquee configuration or dynamically pull from portfolio examples
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "services_marquee_cms")
      .single()
      .then(({ data }) => {
        if (data?.value && (data.value.topSlides?.length > 0 || data.value.bottomSlides?.length > 0)) {
          if (Array.isArray(data.value.topSlides) && data.value.topSlides.length > 0) {
            setTopMarqueeSlides(data.value.topSlides);
          }
          if (Array.isArray(data.value.bottomSlides) && data.value.bottomSlides.length > 0) {
            setBottomMarqueeSlides(data.value.bottomSlides);
          }
        } else {
          // Dynamic fallback to portfolio examples
          supabase
            .from("site_config")
            .select("value")
            .eq("key", "portfolio_cms")
            .single()
            .then(({ data: pData }) => {
              if (pData?.value?.caseStudies && Array.isArray(pData.value.caseStudies)) {
                const allSlides: string[] = [];
                pData.value.caseStudies.forEach((cs: any) => {
                  if (Array.isArray(cs.slides) && cs.slides.length > 0) {
                    allSlides.push(...cs.slides);
                  } else if (cs.imageUrl) {
                    allSlides.push(cs.imageUrl);
                  }
                });
                if (allSlides.length >= 4) {
                  const mid = Math.ceil(allSlides.length / 2);
                  setTopMarqueeSlides(allSlides.slice(0, mid));
                  setBottomMarqueeSlides(allSlides.slice(mid));
                }
              }
            });
        }
      });
  }, []);

  // 6 Services with detailed comparisons
  const servicesData = {
    redesign: {
      id: "redesign",
      title: "Presentation Redesign",
      tagline: "From Cluttered Drafts to Clean, Executive Impact",
      icon: <Paintbrush className="w-5 h-5 text-primary-amber" />,
      beforeImg: `${STORAGE_BASE}/hsbc_slide-2.jpg`,
      afterImg: `${STORAGE_BASE}/accenture_slide-1.jpg`,
      beforeTitle: "Raw Draft / Before",
      afterTitle: "SlideBee Redesign / After",
      beforeIssues: [
        "Overcrowded text blocks and unformatted tables",
        "Generic default templates without visual hierarchy",
        "Distracting clip art and mismatched font sizes"
      ],
      afterBenefits: [
        "Executive visual hierarchy guided by senior art directors",
        "Bespoke iconography, high-contrast KPI highlight cards",
        "100% editable vector shapes in Master PowerPoint (.pptx)"
      ],
      turnaround: "24h – 48h",
      idealFor: "Corporate decks, weekly business reviews, conference presentations"
    },
    pitch: {
      id: "pitch",
      title: "Investor Pitch Decks",
      tagline: "Engineered to Capture VC Attention & Secure Funding",
      icon: <TrendingUp className="w-5 h-5 text-primary-amber" />,
      beforeImg: `${STORAGE_BASE}/british_american_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/nike_slide-1.jpg`,
      beforeTitle: "Rough Founder Notes",
      afterTitle: "Investor-Ready Pitch Deck",
      beforeIssues: [
        "Unclear problem-solution narrative structure",
        "Messy financial projections and confusing cap tables",
        "Missing market sizing (TAM/SAM/SOM) visualization"
      ],
      afterBenefits: [
        "Proven 12-slide venture capital storytelling structure",
        "Clean unit economics, traction metrics, and burn rate charts",
        "Designed to pass partner review meetings with confidence"
      ],
      turnaround: "48h – 72h",
      idealFor: "Pre-seed, Seed, Series A & B fundraising rounds"
    },
    keynote: {
      id: "keynote",
      title: "Executive & Board Keynotes",
      tagline: "High-Stakes Strategic Alignment for C-Suite Leaders",
      icon: <Award className="w-5 h-5 text-primary-amber" />,
      beforeImg: `${STORAGE_BASE}/tag_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/volvo_slide-1.jpg`,
      beforeTitle: "Dense Department Report",
      afterTitle: "Board-Ready Executive Keynote",
      beforeIssues: [
        "Too much operational noise obscuring strategic priorities",
        "Inconsistent typography and low-contrast projection colors",
        "Lack of clear 'bottom-line-up-front' (BLUF) takeaways"
      ],
      afterBenefits: [
        "Ex-McKinsey strategic framing and executive summaries",
        "Ultra-high contrast layouts optimized for large stage screens",
        "Speaker-friendly rhythm and visual focal points"
      ],
      turnaround: "24h Rush Available",
      idealFor: "Board meetings, all-hands townhalls, keynote addresses"
    },
    data: {
      id: "data",
      title: "Data & Financial Visualization",
      tagline: "Turn Complex Spreadsheets into Intuitive Visual Stories",
      icon: <BarChart3 className="w-5 h-5 text-primary-amber" />,
      beforeImg: `${STORAGE_BASE}/cvs_health_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/intel_slide-1.jpg`,
      beforeTitle: "Raw Spreadsheet Screenshot",
      afterTitle: "Dynamic Visual Dashboard",
      beforeIssues: [
        "Unreadable spreadsheet screenshots pasted into slides",
        "Cluttered charts with too many series and no focal point",
        "Audience cannot identify key takeaways within 3 seconds"
      ],
      afterBenefits: [
        "Excel-linked interactive charts and revenue waterfalls",
        "Cohort retention heatmaps and quarterly growth comparisons",
        "Clear callout cards highlighting critical KPI movements"
      ],
      turnaround: "24h – 48h",
      idealFor: "Quarterly financial reviews, SaaS metric dashboards, investor updates"
    },
    template: {
      id: "template",
      title: "Master Branded Template Systems",
      tagline: "Empower Your Entire Organization with Cohesive Design",
      icon: <LayoutGrid className="w-5 h-5 text-primary-amber" />,
      beforeImg: `${STORAGE_BASE}/hsbc_slide-4.jpg`,
      afterImg: `${STORAGE_BASE}/levis_slide-1.jpg`,
      beforeTitle: "Fragmented Slide Library",
      afterTitle: "Unified Master Template System",
      beforeIssues: [
        "Different departments using wildly mismatched deck styles",
        "Broken master layouts with shifting logo positions",
        "Employees spending hours wrestling with alignment"
      ],
      afterBenefits: [
        "50+ pre-built drag-and-drop master slide layouts",
        "Locked brand color palettes, fonts, and custom vector icons",
        "User guide included for effortless company-wide rollout"
      ],
      turnaround: "3 – 5 Days",
      idealFor: "Growing scale-ups, enterprise brands, sales organizations"
    },
    sales: {
      id: "sales",
      title: "Sales & Marketing Collateral",
      tagline: "High-Conversion Proposals That Close Deals Faster",
      icon: <Megaphone className="w-5 h-5 text-primary-amber" />,
      beforeImg: `${STORAGE_BASE}/intel_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/tag_slide-1.jpg`,
      beforeTitle: "Text-Heavy Word Document",
      afterTitle: "Compelling Client Proposal",
      beforeIssues: [
        "Generic proposals that fail to differentiate your service",
        "Unclear pricing tiers and vague scope descriptions",
        "Lack of social proof and visual case study proof-points"
      ],
      afterBenefits: [
        "Modern proposal architecture emphasizing client ROI",
        "Clear tiered pricing comparison tables and timelines",
        "Credibility-building case study and testimonial frameworks"
      ],
      turnaround: "24h – 48h",
      idealFor: "B2B client pitches, agency proposals, RFP responses"
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
      
      {/* 1. HERO SECTION WITH DUAL MOVING SLIDE MARQUEES */}
      <section className="relative bg-[#FFF9E8] pt-28 pb-16 border-b border-primary/20 large-hex-grid overflow-hidden">
        
        {/* Soft Golden Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FCBF14]/12 rounded-full blur-[150px] pointer-events-none" />

        {/* TOP MARQUEE (Moving Left) */}
        <div className="w-full overflow-hidden mb-10 opacity-90">
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
            className="flex items-center gap-5 w-max"
          >
            {[...topMarqueeSlides, ...topMarqueeSlides, ...topMarqueeSlides].map((img, i) => (
              <div
                key={`top-${i}`}
                className="hex-card w-56 sm:w-72 aspect-[16/10] bg-[#111111]/5 border-2 border-primary/40 overflow-hidden shadow-md shrink-0 hover:border-primary transition-all group"
              >
                <img
                  src={img}
                  alt="Presentation Slide"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                  loading="lazy"
                  onError={(e) => {
                    const fallback = defaultTopMarqueeSlides[i % defaultTopMarqueeSlides.length];
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* CENTER HERO CONTENT */}
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 relative">
          <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            SlideBee Design Studio
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#111111] leading-[1.12] mb-4 tracking-tight">
            World-Class Presentation Design <br />
            <span className="text-primary-amber">On Demand.</span>
          </h1>

          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto mb-8 leading-relaxed">
            From emergency 24-hour pitch deck redesigns to complete enterprise master template systems — we make your ideas unforgettable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <MagneticButton>
              <Link
                to="/ordernow"
                className="hex-cut-btn text-[#111111] font-black px-8 py-3.5 text-xs sm:text-sm gap-2"
              >
                Request Custom Design <ArrowRight size={16} />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <a
                href="#services-grid"
                className="hex-cut-btn light-btn text-[#111111] font-extrabold px-8 py-3.5 text-xs sm:text-sm"
              >
                Explore Offerings
              </a>
            </MagneticButton>
          </div>
        </div>

        {/* BOTTOM MARQUEE (Moving Right) */}
        <div className="w-full overflow-hidden mt-10 opacity-90">
          <motion.div
            animate={{ x: [-1200, 0] }}
            transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
            className="flex items-center gap-5 w-max"
          >
            {[...bottomMarqueeSlides, ...bottomMarqueeSlides, ...bottomMarqueeSlides].map((img, i) => (
              <div
                key={`bot-${i}`}
                className="hex-card w-56 sm:w-72 aspect-[16/10] bg-[#111111]/5 border-2 border-primary/40 overflow-hidden shadow-md shrink-0 hover:border-primary transition-all group"
              >
                <img
                  src={img}
                  alt="Presentation Slide"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                  loading="lazy"
                  onError={(e) => {
                    const fallback = defaultBottomMarqueeSlides[i % defaultBottomMarqueeSlides.length];
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>

      </section>

      {/* 1.5 PREVIOUS WORKED COMPANIES BRAND MARQUEE */}
      <section className="py-8 bg-white border-b border-primary/25 overflow-hidden">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 text-center mb-5">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#726F6D] inline-block">
            Trusted by Leaders & Executives Across Global Enterprises
          </span>
        </div>
        <div className="w-full overflow-hidden">
          <motion.div
            animate={{ x: [0, -1400] }}
            transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
            className="flex items-center gap-6 w-max"
          >
            {[...workedCompanies, ...workedCompanies, ...workedCompanies].map((comp, idx) => (
              <div
                key={`comp-${idx}`}
                className="hex-card px-6 py-3 bg-[#FFF9E8] border border-primary/40 rounded-xl flex items-center gap-3 shrink-0 shadow-xs hover:border-primary transition-all group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-primary-amber group-hover:scale-125 transition-transform" />
                <div className="text-left">
                  <div className="font-heading font-extrabold text-sm text-[#111111] tracking-tight group-hover:text-primary-amber transition-colors">
                    {comp.name}
                  </div>
                  {comp.category && (
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                      {comp.category}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. THE 6 CORE SERVICES WITH INTERACTIVE BEFORE/AFTER SHOWCASE */}
      <section id="services-grid" className="py-20 bg-[#FFF9E8] large-hex-grid">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
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

          {/* 6 Service Selector Equilateral Hexagons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {Object.values(servicesData).map((svc) => (
              <button
                key={svc.id}
                onClick={() => {
                  setSelectedService(svc.id as any);
                  setSliderPosition(50);
                }}
                className={`hex-equilateral-h p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  selectedService === svc.id
                    ? "bg-[#111111] text-[#FCBF14] shadow-lg scale-105"
                    : "bg-white text-[#111111] hover:bg-primary/10 shadow-sm"
                }`}
              >
                <div className={`hex-pure w-8 h-8 flex items-center justify-center mb-1.5 transition-transform ${
                  selectedService === svc.id ? "bg-primary text-[#111111]" : "bg-[#FFF9E8] text-primary-amber"
                }`}>
                  {svc.icon}
                </div>
                <span className="font-heading font-extrabold text-[11px] leading-tight px-1">
                  {svc.title}
                </span>
              </button>
            ))}
          </div>

          {/* ACTIVE SERVICE BEFORE/AFTER SHOWCASE CONTAINER */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeServiceData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="hex-card-lg bg-white border-2 border-primary/40 p-6 md:p-10 shadow-xl max-w-5xl mx-auto"
            >
              
              {/* Header Details */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-primary/20 mb-8">
                <div>
                  <div className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/30 text-xs font-extrabold px-4 py-1 uppercase tracking-wider mb-2">
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
                  className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-7 py-3 text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:scale-105 shrink-0"
                >
                  Order {activeServiceData.title} <ArrowRight size={15} />
                </Link>
              </div>

              {/* Grid: Interactive Split Slider & Transformation Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Interactive Drag Before/After Slider */}
                <div className="lg:col-span-7">
                  <div className="hex-card bg-[#111111] border-2 border-primary/40 p-2 shadow-xl">
                    <div className="relative aspect-[16/9] overflow-hidden select-none">
                      
                      {/* After Image */}
                      <img
                        src={activeServiceData.afterImg}
                        alt={activeServiceData.afterTitle}
                        className="absolute inset-0 w-full h-full object-contain bg-[#111111]"
                      />
                      <div className="hex-pill-sm absolute top-3 right-3 bg-primary text-[#111111] font-black text-[10px] px-3 py-1 z-10 shadow">
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
                        <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/85 backdrop-blur-md text-white font-extrabold text-[10px] px-3 py-1 border border-white/20">
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
                  <p className="text-center text-[11px] text-[#726F6D] font-medium mt-2.5">
                    Drag slider left and right to inspect the redesign details
                  </p>
                </div>

                {/* Transformation Details & Breakdown */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Before Problems */}
                  <div className="hex-card p-[1.5px] bg-red-500/20">
                    <div className="hex-card bg-red-500/5 p-4">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-red-600 mb-2 flex items-center gap-1.5">
                        <X size={13} className="text-red-600" /> Before (Raw Draft Flaws):
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[#726F6D] font-medium">
                        {(activeServiceData.beforeIssues || []).map((issue: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* After Results */}
                  <div className="hex-card p-[1.5px] bg-[#FCBF14]/40">
                    <div className="hex-card bg-[#FFF9E8] p-4">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-2 flex items-center gap-1.5">
                        SlideBee Executive Polish:
                      </h5>
                      <ul className="space-y-1.5 text-xs text-[#111111] font-medium">
                        {(activeServiceData.afterBenefits || []).map((benefit: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-amber shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Ideal For */}
                  <div className="pt-2">
                    <span className="text-[11px] text-[#726F6D] font-bold uppercase tracking-wider block mb-1">
                      Best Suited For:
                    </span>
                    <p className="text-xs text-[#111111] font-bold">
                      {activeServiceData.idealFor}
                    </p>
                  </div>

                </div>

              </div>

              {/* Dedicated Call to Action Bar for the Active Before/After Service */}
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
                  className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-7 py-3 text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:scale-105 shrink-0"
                >
                  Order {activeServiceData.title} <ArrowRight size={15} />
                </Link>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* 3. STUDIO GUARANTEES (3 Equilateral Hex Cards) */}
      <section className="py-16 bg-white large-hex-grid border-t border-primary/20">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="hex-equilateral-h bg-[#FFF9E8] p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="hex-pure w-11 h-11 bg-primary/25 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-primary-amber" />
              </div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] mb-1">
                24h – 48h Turnaround
              </h4>
              <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed max-w-[200px]">
                Fast turns with priority rush delivery options for urgent meetings.
              </p>
            </div>

            <div className="hex-equilateral-h bg-[#FFF9E8] p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="hex-pure w-11 h-11 bg-primary/25 flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-primary-amber" />
              </div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] mb-1">
                Strict NDA & Security
              </h4>
              <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed max-w-[200px]">
                Protected with signed enterprise NDAs and private encrypted drives.
              </p>
            </div>

            <div className="hex-equilateral-h bg-[#FFF9E8] p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="hex-pure w-11 h-11 bg-primary/25 flex items-center justify-center mb-2">
                <Layers className="w-5 h-5 text-primary-amber" />
              </div>
              <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] mb-1">
                Fully Editable Files
              </h4>
              <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed max-w-[200px]">
                Receive 100% editable Master PowerPoint (.pptx) presentation and vector assets.
              </p>
            </div>

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
            className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-8 py-4 text-xs sm:text-sm transition-all shadow-xl hover:scale-105"
          >
            Start Your Project Brief <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
