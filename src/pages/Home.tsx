import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import ThreeJsHero from "../components/ThreeJsHero";
import { HexProcessInfographic } from "../components/HexProcessInfographic";
import { MagneticButton } from "../components/MagneticButton";
import { supabase } from "../lib/supabase";
import { normalizeR2Url } from "../lib/r2";
import { 
  Search, 
  ArrowRight, 
  Sliders, 
  Paintbrush, 
  TrendingUp, 
  BarChart3, 
  LayoutGrid,
  Check,
  Briefcase,
  Layers,
  PieChart,
  Megaphone,
  Compass,
  GraduationCap,
  Coins,
  Calendar,
  Star
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Home() {
  usePageSEO({
    title: "SlideBee | Executive Presentation Design Studio & Templates",
    description: "SlideBee is an executive presentation design studio. Turn complex business strategies into pitch decks, board presentations, and bespoke PowerPoint templates in 24h–48h.",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState<"sales" | "executive" | "financial">("sales");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [featuredTemplateIds, setFeaturedTemplateIds] = useState<string[]>([]);
  const [customComparisons, setCustomComparisons] = useState<any>(null);
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [customTestimonials, setCustomTestimonials] = useState<any[] | null>(null);
  const [heroConfig, setHeroConfig] = useState<any>({
    badgeText: "SlideBee Design Studio",
    headline: "Present Better. Faster.",
    subheadline: "Premium PowerPoint templates and expert presentation design services — all in one hive.",
    ctaText: "Browse Templates",
    secondaryCtaText: "Hire a Designer"
  });
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("site_config")
      .select("*")
      .then(({ data }) => {
        if (data) {
          data.forEach((item) => {
            if (item.key === "hero" && item.value) setHeroConfig(item.value);
            if (item.key === "featured_templates") {
              let ids: string[] = [];
              if (Array.isArray(item.value)) {
                ids = item.value.map(String);
              } else if (item.value && Array.isArray(item.value.ids)) {
                ids = item.value.ids.map(String);
              } else if (typeof item.value === "string") {
                try {
                  const parsed = JSON.parse(item.value);
                  if (Array.isArray(parsed)) ids = parsed.map(String);
                  else if (Array.isArray(parsed?.ids)) ids = parsed.ids.map(String);
                } catch (e) {}
              }
              if (ids.length > 0) setFeaturedTemplateIds(ids);
            }
            if (item.key === "home_before_after" && item.value) setCustomComparisons(item.value);
            if (item.key === "pricing" && item.value) setPricingConfig(item.value);
            if (item.key === "testimonials" && Array.isArray(item.value)) setCustomTestimonials(item.value);
          });
        }
      });

    // Also fetch live templates from database using the Deep Module storefront catalog view
    supabase
      .from("v_storefront_catalog")
      .select("*")
      .then(({ data, error }) => {
        if (data && !error && data.length > 0) {
          const mapped = data.map((t: any) => ({
            id: String(t.id),
            slug: t.slug,
            code: t.code || `SLD-${String(t.id).slice(0, 4).toUpperCase()}`,
            title: t.title,
            category: t.category,
            price: t.price_inr || 499,
            originalPrice: t.original_price_inr || (t.price_inr ? t.price_inr * 2 : 999),
            image: normalizeR2Url(t.image_url || t.thumbnail_url || "/portfolio/case_study_a_1.png"),
            slides: Array.isArray(t.slides) ? t.slides.map((s: string) => normalizeR2Url(s)) : [],
            slidesCount: t.slides_count || t.slide_count || 25,
            rating: 4.9,
            downloads: 80,
            formats: ["Master PowerPoint (.pptx)"],
            description: t.description || "Executive presentation deck tailored for high-stakes business meetings."
          }));
          setDbTemplates(mapped);
        }
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/templates');
    }
  };

  const categories = [
    { label: "Business", icon: <Briefcase className="w-5 h-5 text-primary-amber" /> },
    { label: "Pitch Decks", icon: <Layers className="w-5 h-5 text-primary-amber" /> },
    { label: "Infographics", icon: <PieChart className="w-5 h-5 text-primary-amber" /> },
    { label: "Marketing", icon: <Megaphone className="w-5 h-5 text-primary-amber" /> },
    { label: "Strategy", icon: <Compass className="w-5 h-5 text-primary-amber" /> },
    { label: "Education", icon: <GraduationCap className="w-5 h-5 text-primary-amber" /> },
    { label: "Finance", icon: <Coins className="w-5 h-5 text-primary-amber" /> },
    { label: "Timelines", icon: <Calendar className="w-5 h-5 text-primary-amber" /> },
  ];

  const defaultComparisons = {
    sales: {
      title: "Q2 Sales Performance",
      beforeImg: "/portfolio/nike_hsbc_cvs_8.png",
      afterImg: "/portfolio/case_study_a_1.png",
      beforeDesc: "Dense unformatted text, standard table layout, no visual hierarchy.",
      afterDesc: "High-contrast KPI cards, structured revenue bar chart, clear key takeaways."
    },
    executive: {
      title: "Executive Strategic Keynote",
      beforeImg: "/portfolio/nike_hsbc_cvs_1.png",
      afterImg: "/portfolio/case_study_a_14.png",
      beforeDesc: "Mismatched brand colors, generic bullet points.",
      afterDesc: "Ex-McKinsey strategic alignment, bespoke typography, focal points."
    },
    financial: {
      title: "Series A Investment Deck",
      beforeImg: "/portfolio/nike_hsbc_cvs_10.png",
      afterImg: "/portfolio/global_brands_1.png",
      beforeDesc: "Complex raw spreadsheets and unpolished diagrams.",
      afterDesc: "Investor-ready cap tables, burn rate charts, and traction milestones."
    }
  };

  const comparisons = customComparisons || defaultComparisons;
  const currentComparison = comparisons[activeTab] || defaultComparisons[activeTab];

  const defaultTestimonials = [
    {
      quote: "SlideBee's templates saved us hours of work. The quality and typography are exceptional!",
      name: "Rohan Mehta",
      role: "Founder, FinEdge",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      quote: "The design team understood our brand perfectly and delivered beyond expectations within 24h.",
      name: "Priya Sharma",
      role: "Marketing Head, Nexora",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      quote: "Our investor deck looked stunning and helped us raise our $4.5M seed round effortlessly!",
      name: "Arjun Patel",
      role: "CEO, InnovateX",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      rating: 5,
    }
  ];

  const testimonials = (customTestimonials && customTestimonials.length > 0) ? customTestimonials : defaultTestimonials;

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E8] large-hex-grid text-[#111111]">
      <ThreeJsHero />
      <div className="relative z-10">
      
      {/* 1. HERO SECTION */}
      <section className="relative text-[#111111] overflow-hidden pt-28 pb-14 min-h-[90vh] flex items-center">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-8">
            
            {/* Left Column: Bold Editorial Typography, Direct CTAs & Search */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left">
              
              {/* Elegant Eyebrow with Golden Accent Rule */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-[2.5px] bg-[#FCBF14] rounded-full" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#726F6D]">
                  {heroConfig.badge || heroConfig.badgeText || "SlideBee Design Studio"}
                </span>
                {(heroConfig.guarantee) && (
                  <span className="hidden sm:inline-block text-[10px] font-bold bg-[#FCBF14]/20 text-[#936610] px-2.5 py-0.5 rounded-full border border-[#FCBF14]/30">
                    {heroConfig.guarantee}
                  </span>
                )}
              </div>

              {/* High-Impact Hero Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-heading font-black text-[#111111] leading-[1.08] mb-4 tracking-tight"
                dangerouslySetInnerHTML={{
                  __html: heroConfig.title || heroConfig.headline || 'Present With <br class="hidden sm:inline" /><span class="text-transparent bg-clip-text bg-gradient-to-r from-[#D99F06] to-[#FCD34D]">Unfair Advantage</span>'
                }}
              />

              {/* Subheadline & Description */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-sm sm:text-base lg:text-lg text-[#726F6D] font-medium leading-relaxed max-w-xl mb-8"
              >
                {heroConfig.subtitle || heroConfig.subheadline || "Premium PowerPoint templates and expert presentation design services — all in one hive."}
              </motion.p>

              {/* Call-To-Action & Search Group */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8"
              >
                <MagneticButton>
                  <Link
                    to="/templates"
                    className="hex-cut-btn text-[#111111] font-black px-8 py-4 sm:px-9 sm:py-4 text-xs sm:text-sm gap-2"
                  >
                    {heroConfig.ctaPrimary || heroConfig.ctaText || "Browse 5,000+ Templates"} <ArrowRight size={16} />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    to="/services"
                    className="hex-cut-btn dark-btn text-[#FCBF14] font-black px-8 py-4 sm:px-9 sm:py-4 text-xs sm:text-sm gap-2"
                  >
                    {heroConfig.ctaSecondary || heroConfig.secondaryCtaText || "Hire a Designer"} <ArrowRight size={16} />
                  </Link>
                </MagneticButton>
              </motion.div>

              {/* Search Bar (Hexagonal Box) */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative max-w-xl mb-6"
              >
                <div className="hex-card relative flex items-center bg-white border-2 border-primary/50 shadow-md p-2 focus-within:border-primary transition-all">
                  <Search className="w-4 h-4 text-[#726F6D] ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search templates, pitch decks, infographics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-[#111111] placeholder-gray-400 text-xs sm:text-sm focus:outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </motion.form>

              {/* Deliverable Format Guarantee */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                  Exclusive Deliverable:
                </span>
                <span className="hex-pill-sm bg-[#FFF9E8] border border-primary/30 text-[#111111] font-bold text-xs px-3 py-1 shadow-sm">
                  Master PowerPoint Presentation (.pptx)
                </span>
              </div>
            </div>

            {/* Right Column: Empty for Three.js Canvas Visibility */}
            <div className="lg:col-span-6 flex items-center justify-center relative pointer-events-none">
              {/* No more HeroHexCollage, the 3D scene fills this space */}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS STRIP */}
      <section className="py-6">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/templates?category=${encodeURIComponent(cat.label)}`}
                className="hex-card flex items-center sm:flex-col justify-center gap-2.5 sm:gap-2 p-3.5 bg-white hover:bg-primary/10 border-2 border-primary/30 hover:border-primary shadow-sm hover:shadow-md transition-all group text-center"
              >
                <div className="hex-pill p-2 bg-[#FFF9E8] border border-primary/30 group-hover:scale-110 transition-transform shrink-0">
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-[#111111] group-hover:text-primary-amber transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRENDING TEMPLATES GRID */}
      <section className="py-14">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#111111] mb-1.5">
                Trending Templates
              </h2>
              <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
                Professionally designed, fully editable, and ready to impress.
              </p>
            </div>
            <MagneticButton>
              <Link
                to="/templates"
                className="hex-cut-btn text-[#111111] font-black px-7 py-3 gap-2 text-xs sm:text-sm shrink-0"
              >
                Explore All Templates <ArrowRight size={15} />
              </Link>
            </MagneticButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {(() => {
              const allTemplates = dbTemplates;
              const matching = featuredTemplateIds
                .map(fid => allTemplates.find(t => 
                  String(t.id) === String(fid) || 
                  (t.slug && String(t.slug) === String(fid)) ||
                  (t.code && String(t.code) === String(fid))
                ))
                .filter(Boolean) as any[];
              const displayed = matching.length > 0 ? matching : allTemplates.slice(0, 8);
              return displayed.map((item) => (
              <Link
                key={item.id}
                to={`/template/${item.id}`}
                className="hex-card group bg-white border-2 border-primary/35 hover:border-primary overflow-hidden hover:shadow-2xl transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                {/* Preview Image */}
                <div className="relative aspect-video overflow-hidden bg-black/5 border-b border-primary/20">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="hex-pill-sm absolute top-2.5 left-2.5 bg-[#111111]/85 backdrop-blur-md text-white border border-primary/30 text-[10px] font-extrabold px-3 py-0.5">
                    {item.category}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-heading font-extrabold text-sm text-[#111111] group-hover:text-primary-amber transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-xs sm:text-sm font-heading font-black text-[#111111] ml-2">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  {/* Deliverable Badge */}
                  <div className="flex items-center gap-1.5 pt-2.5 border-t border-primary/15 mt-2.5 text-[10px] font-extrabold text-[#111111]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    <span>Master PowerPoint (.pptx)</span>
                  </div>
                </div>
              </Link>
            ));
          })()}
          </div>
        </div>
      </section>

      {/* 4. "NEED SOMETHING CUSTOM?" SERVICE STRIP (Translucent Card Container) */}
      <section className="py-8">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-[#111111] mb-1">
                  Need Something Custom?
                </h2>
                <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
                  Our presentation specialists can redesign, build, and animate your slides.
                </p>
              </div>
              <MagneticButton>
                <Link
                  to="/ordernow"
                  className="hex-cut-btn text-[#111111] font-black px-7 py-3 text-xs sm:text-sm gap-2 shrink-0"
                >
                  Request Custom Design <ArrowRight size={15} />
                </Link>
              </MagneticButton>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
                <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Paintbrush className="w-5 h-5 text-primary-amber" />
                </div>
                <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                  Presentation Redesign
                </h3>
                <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                  Transform cluttered slides into clear, modern, and impactful presentations.
                </p>
              </div>

              <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
                <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-primary-amber" />
                </div>
                <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                  Pitch Deck Design
                </h3>
                <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                  Investor-ready pitch decks that tell your story and secure attention.
                </p>
              </div>

              <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
                <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-primary-amber" />
                </div>
                <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                  Data Visualization
                </h3>
                <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                  Turn complex data into visual stories that drive understanding.
                </p>
              </div>

              <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
                <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5 text-primary-amber" />
                </div>
                <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                  Branded Templates
                </h3>
                <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                  Custom templates that reflect your brand and maintain consistency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "FROM ROUGH CONTENT TO POLISHED SLIDES" */}
      <section className="py-14">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5">
              <span className="text-primary-amber text-xs font-bold uppercase tracking-widest block mb-1.5">
                Proven Transformation
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#111111] mb-3 leading-tight">
                From Rough Content <br />
                <span className="text-primary-amber">To Polished Slides</span>
              </h2>
              <p className="text-[#726F6D] text-xs sm:text-sm font-medium leading-relaxed mb-5">
                We take your raw ideas and turn them into stunning, editable, brand-aligned presentations that make an impact.
              </p>

              {/* Comparison Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(["sales", "executive", "financial"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`hex-pill px-4 py-2 text-xs font-bold capitalize transition-all ${
                      activeTab === tab
                        ? "bg-primary text-[#111111] shadow-sm"
                        : "bg-white text-[#726F6D] border-2 border-primary/40 hover:border-primary"
                    }`}
                  >
                    {tab} Slide
                  </button>
                ))}
              </div>
            </div>

            {/* Draggable Split Slider (Hexagonal Frame) */}
            <div className="lg:col-span-7">
              <div className="hex-card-lg bg-white border-2 border-primary/40 p-3 md:p-4 shadow-xl">
                <div className="relative aspect-[16/9] overflow-hidden select-none">
                  <img
                    src={currentComparison.afterImg}
                    alt="After Redesign"
                    className="absolute inset-0 w-full h-full object-contain bg-[#111111]"
                  />
                  <div className="hex-pill-sm absolute top-3 right-3 bg-primary text-[#111111] font-extrabold text-[10px] px-3 py-1 z-10 shadow">
                    SlideBee Polish (After)
                  </div>

                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                  >
                    <img
                      src={currentComparison.beforeImg}
                      alt="Before Redesign"
                      className="absolute inset-0 w-full h-full object-contain bg-[#161a22]"
                    />
                    <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-md text-white font-bold text-[10px] px-3 py-1 border border-primary/30">
                      Before
                    </div>
                  </div>

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
                    aria-label="Before and after slider"
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "HOW SLIDEBEE WORKS" 4-STEP INFOGRAPHIC PIPELINE */}
      <section className="py-12">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/85 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 sm:p-10 lg:p-12 shadow-lg">
            <HexProcessInfographic />
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section className="pt-8 pb-14">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Pricing Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111111] mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#726F6D] text-xs sm:text-sm font-medium mb-4">
              Choose the plan that fits your presentation needs.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="hex-pill inline-flex items-center gap-1.5 bg-white p-1 border-2 border-primary/40 shadow-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`hex-pill px-4 py-1.5 text-xs font-bold transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-primary text-[#111111] shadow"
                    : "text-[#726F6D] hover:text-[#111111]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`hex-pill px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1 ${
                  billingPeriod === "yearly"
                    ? "bg-primary text-[#111111] shadow"
                    : "text-[#726F6D] hover:text-[#111111]"
                }`}
              >
                <span>Yearly</span>
                <span className="bg-green-500/20 text-green-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {pricingConfig?.pro_discount_percent ?? 50}% OFF
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards (Hexagonal Chamfered) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1580px] w-full mx-auto mb-16">
            
            {/* Starter (Free) */}
            <div className="hex-card bg-white/60 backdrop-blur-xl border-2 border-primary/30 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-[#726F6D] font-bold uppercase tracking-wider block mb-1">
                  Starter
                </span>
                <div className="text-3xl font-heading font-black text-[#111111] mb-1">
                  Free
                </div>
                <p className="text-[#726F6D] text-xs font-medium mb-4">
                  Perfect for trying out templates.
                </p>
                <div className="space-y-2 border-t border-primary/20 pt-4 text-xs text-[#111111] font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> 5 Free Credits (On Sign-up)
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Standard Downloads
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Basic Support
                  </div>
                </div>
              </div>

              <MagneticButton className="w-full mt-6">
                <Link
                  to="/templates"
                  className="hex-cut-btn light-btn w-full block text-center text-[#111111] font-extrabold py-3 text-xs"
                >
                  Get Started
                </Link>
              </MagneticButton>
            </div>

            {/* Pro (Most Popular) */}
            <div className="hex-card bg-white/70 backdrop-blur-xl border-2 border-primary p-6 flex flex-col justify-between relative shadow-xl">
              <div className="hex-pill-sm absolute top-3 right-4 bg-primary text-[#111111] font-black text-[9px] uppercase tracking-widest px-3 py-0.5 shadow">
                Most Popular
              </div>

              <div>
                <span className="text-[10px] text-primary-amber font-bold uppercase tracking-wider block mb-1">
                  Pro Access
                </span>
                {(() => {
                  const monthlyPrice = pricingConfig?.pro_monthly_inr ?? 199;
                  const discount = pricingConfig?.pro_discount_percent ?? 50;
                  const yearlyPrice = Math.round((monthlyPrice * 12) * (1 - discount / 100));
                  return (
                    <div className="text-3xl font-heading font-black text-[#111111] mb-1">
                      ₹{billingPeriod === "yearly" ? yearlyPrice.toLocaleString() : monthlyPrice.toLocaleString()}
                      <span className="text-xs font-normal text-[#726F6D]">
                        /{billingPeriod === "yearly" ? "year" : "month"}
                      </span>
                    </div>
                  );
                })()}
                <p className="text-[#726F6D] text-xs font-medium mb-4">
                  Unlimited access to premium templates.
                </p>
                <div className="space-y-2 border-t border-primary/20 pt-4 text-xs text-[#111111] font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Unlimited SlideBee Credits
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Priority Customer Support
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Commercial License Included
                  </div>
                </div>
              </div>

              <MagneticButton className="w-full mt-6">
                <button
                  onClick={() => alert("Redirecting to Pro checkout...")}
                  className="hex-cut-btn w-full block text-center text-[#111111] font-black py-3 text-xs"
                >
                  Go Pro Now
                </button>
              </MagneticButton>
            </div>

            {/* Studio (Custom) */}
            <div className="hex-card bg-white/60 backdrop-blur-xl border-2 border-primary/30 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-[#726F6D] font-bold uppercase tracking-wider block mb-1">
                  Studio
                </span>
                <div className="text-3xl font-heading font-black text-[#111111] mb-1">
                  Custom
                </div>
                <p className="text-[#726F6D] text-xs font-medium mb-4">
                  Custom design services for your business.
                </p>
                <div className="space-y-2 border-t border-primary/20 pt-4 text-xs text-[#111111] font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> 1-on-1 Senior Art Director
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Unlimited Iterations & Revisions
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Rapid 24h Fast Turnaround
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Dedicated Account Manager
                  </div>
                </div>
              </div>

              <MagneticButton className="w-full mt-6">
                <Link
                  to="/ordernow"
                  className="hex-cut-btn light-btn w-full block text-center text-[#111111] font-extrabold py-3 text-xs"
                >
                  Get a Quote
                </Link>
              </MagneticButton>
            </div>
          </div>

          {/* Testimonials (Hexagonal Chamfered) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1580px] w-full mx-auto">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="hex-card bg-[#FFF9E8] border-2 border-primary/35 p-5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-1 text-primary mb-2.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={13} fill="#FCBF14" />
                    ))}
                  </div>
                  <p className="text-[#111111] text-xs font-medium leading-relaxed mb-4 italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-3 border-t border-primary/20">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="hex-pill w-8 h-8 object-cover border border-primary/30"
                  />
                  <div>
                    <h5 className="font-heading font-extrabold text-xs text-[#111111]">
                      {t.name}
                    </h5>
                    <p className="text-[10px] text-[#726F6D] font-medium">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      </div>
    </div>
  );
}
