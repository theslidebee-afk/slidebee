import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { RecreatedHoneycombCluster } from "../components/RecreatedHoneycombCluster";
import { templateCatalog } from "./Templates";
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState<"sales" | "executive" | "financial">("sales");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const navigate = useNavigate();

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

  const comparisons = {
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

  const currentComparison = comparisons[activeTab];

  const testimonials = [
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

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E8] text-[#111111]">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#FFF9E8] text-[#111111] large-hex-grid overflow-hidden pt-28 pb-10 border-b border-[#111111]/5">
        
        {/* Soft Golden Glow */}
        <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-[#FCBF14]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-8">
            
            {/* Left Column: Headline, Hexagonal CTAs & Hexagonal Search */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left">
              
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-5xl lg:text-5xl font-heading font-extrabold text-[#111111] leading-[1.14] mb-4 tracking-tight"
              >
                Present Better. <br />
                <span className="text-primary-amber drop-shadow-sm">
                  Faster.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-sm sm:text-base text-[#726F6D] mb-6 max-w-lg font-medium leading-relaxed"
              >
                Premium PowerPoint templates and expert presentation design services — all in one hive.
              </motion.p>

              {/* Action Buttons (Hexagonal Capsule Shape) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 mb-6"
              >
                <Link
                  to="/templates"
                  className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-8 py-3.5 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-md shadow-primary/25"
                >
                  Browse Templates <ArrowRight size={15} />
                </Link>
                <Link
                  to="/ordernow"
                  className="hex-pill bg-[#111111] hover:bg-black text-white font-bold border border-[#111111] px-8 py-3.5 text-xs sm:text-sm transition-all hover:scale-105 flex items-center gap-1.5 shadow-sm"
                >
                  Hire a Designer <ArrowRight size={15} />
                </Link>
              </motion.div>

              {/* Search Bar (Hexagonal Box) */}
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative max-w-lg"
              >
                <div className="hex-card relative flex items-center bg-white border border-[#111111]/15 shadow-md p-2 focus-within:border-primary transition-all">
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
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-6 py-2.5 transition-all text-xs shrink-0 shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </motion.form>
            </div>

            {/* Right Column: 7-Hexagon Honeycomb Cluster */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <RecreatedHoneycombCluster />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS STRIP (Hexagonal Chamfered Category Cards) */}
      <section className="py-8 bg-[#FFF9E8] large-hex-grid border-b border-[#111111]/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/templates?category=${encodeURIComponent(cat.label)}`}
                className="hex-card flex items-center sm:flex-col justify-center gap-2.5 sm:gap-2 p-3.5 bg-white hover:bg-primary/10 border border-[#111111]/8 hover:border-primary shadow-sm hover:shadow-md transition-all group text-center"
              >
                <div className="hex-pill p-2 bg-[#FFF9E8] group-hover:scale-110 transition-transform shrink-0">
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

      {/* 3. TRENDING TEMPLATES GRID (Hexagonal Cards & Half-Hexagon Slide Previews) */}
      <section className="py-16 bg-[#FFF9E8] large-hex-grid">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#111111] mb-1.5">
                Trending Templates
              </h2>
              <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
                Professionally designed, fully editable, and ready to impress.
              </p>
            </div>
            <Link
              to="/templates"
              className="hex-pill bg-white px-5 py-2 inline-flex items-center gap-1.5 text-primary-amber hover:text-[#111111] font-extrabold text-xs sm:text-sm transition-colors shrink-0 shadow-sm border border-[#111111]/10"
            >
              Explore All Templates <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templateCatalog.slice(0, 8).map((item) => (
              <Link
                key={item.id}
                to="/templates"
                className="hex-card group bg-white border border-[#111111]/10 overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                {/* Half-Hexagon Preview Notch Cut */}
                <div className="half-hex-preview relative aspect-[16/11] overflow-hidden bg-black/5 border-b border-[#111111]/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="hex-pill-sm absolute top-2.5 left-2.5 bg-[#111111]/85 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-0.5">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 pt-2 flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] group-hover:text-primary-amber transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <span className="text-xs sm:text-sm font-heading font-black text-[#111111] ml-2">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2.5 border-t border-[#111111]/5 mt-2.5">
                    {item.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="hex-pill-sm text-[8.5px] font-extrabold px-2 py-0.5 bg-[#FFF9E8] border border-[#111111]/10 text-[#726F6D]"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. "NEED SOMETHING CUSTOM?" SERVICE STRIP (Hex Cards) */}
      <section className="py-14 bg-white large-hex-grid border-y border-[#111111]/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-[#111111] mb-1">
                Need Something Custom?
              </h2>
              <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
                Our presentation specialists can redesign, build, and animate your slides.
              </p>
            </div>
            <Link
              to="/ordernow"
              className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-6 py-3 text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md hover:scale-105 shrink-0"
            >
              Request Custom Design <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="hex-card bg-[#FFF9E8] border border-[#111111]/5 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
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

            <div className="hex-card bg-[#FFF9E8] border border-[#111111]/5 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
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

            <div className="hex-card bg-[#FFF9E8] border border-[#111111]/5 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
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

            <div className="hex-card bg-[#FFF9E8] border border-[#111111]/5 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
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
      </section>

      {/* 5. "FROM ROUGH CONTENT TO POLISHED SLIDES" (Hexagonal Container) */}
      <section className="py-16 bg-[#FFF9E8] large-hex-grid">
        <div className="container mx-auto px-4 md:px-8">
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
                        : "bg-white text-[#726F6D] border border-[#111111]/10 hover:border-primary"
                    }`}
                  >
                    {tab} Slide
                  </button>
                ))}
              </div>
            </div>

            {/* Draggable Split Slider (Hexagonal Frame) */}
            <div className="lg:col-span-7">
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-3 md:p-4 shadow-xl">
                <div className="relative aspect-[16/9] overflow-hidden select-none">
                  <img
                    src={currentComparison.afterImg}
                    alt="After Redesign"
                    className="absolute inset-0 w-full h-full object-contain bg-[#111111]"
                  />
                  <div className="hex-pill-sm absolute top-3 right-3 bg-primary text-[#111111] font-extrabold text-[10px] px-3 py-1 z-10 shadow flex items-center gap-1">
                    <Sparkles size={11} /> After
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
                    <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-md text-white font-bold text-[10px] px-3 py-1 border border-white/20">
                      Before
                    </div>
                  </div>

                  <div
                    className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-20"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="hex-pill absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-[#111111] flex items-center justify-center shadow-lg border border-white">
                      <Sliders size={14} />
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

      {/* 6. "HOW SLIDEBEE WORKS" 4-STEP FLOW (Hex Cards) */}
      <section className="py-16 bg-white large-hex-grid border-t border-[#111111]/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111111] mb-2">
              How SlideBee Works
            </h2>
            <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
              Simple, transparent, and built for speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="hex-card flex flex-col items-start bg-[#FFF9E8] border border-[#111111]/5 p-6 relative shadow-sm">
              <div className="hex-pill w-8 h-8 bg-primary text-[#111111] font-black text-xs flex items-center justify-center mb-3 shadow">
                1
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Choose a Template
              </h4>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                Browse thousands of professional templates for any business purpose.
              </p>
            </div>

            <div className="hex-card flex flex-col items-start bg-[#FFF9E8] border border-[#111111]/5 p-6 relative shadow-sm">
              <div className="hex-pill w-8 h-8 bg-primary text-[#111111] font-black text-xs flex items-center justify-center mb-3 shadow">
                2
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Download or Upload Content
              </h4>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                Download instantly or upload your draft notes and brand guidelines.
              </p>
            </div>

            <div className="hex-card flex flex-col items-start bg-[#FFF9E8] border border-[#111111]/5 p-6 relative shadow-sm">
              <div className="hex-pill w-8 h-8 bg-primary text-[#111111] font-black text-xs flex items-center justify-center mb-3 shadow">
                3
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                We Design or You Customize
              </h4>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                We design it for you or you customize easily with our editable slides.
              </p>
            </div>

            <div className="hex-card flex flex-col items-start bg-[#FFF9E8] border border-[#111111]/5 p-6 relative shadow-sm">
              <div className="hex-pill w-8 h-8 bg-primary text-[#111111] font-black text-xs flex items-center justify-center mb-3 shadow">
                4
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Present with Confidence
              </h4>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                Deliver presentations that inspire, persuade, and leave a lasting impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STATS & PRICING (Hexagonal Cards) */}
      <section className="py-16 bg-[#FFF9E8] large-hex-grid border-t border-[#111111]/5">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* 3 Stats Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14 max-w-3xl mx-auto">
            <div className="hex-card bg-white border border-[#111111]/8 p-5 text-center shadow-sm">
              <div className="text-3xl font-heading font-black text-primary-amber mb-0.5">
                5,000+
              </div>
              <p className="text-[#726F6D] text-[10px] uppercase tracking-wider font-extrabold">
                Templates Available
              </p>
            </div>
            <div className="hex-card bg-white border border-[#111111]/8 p-5 text-center shadow-sm">
              <div className="text-3xl font-heading font-black text-primary-amber mb-0.5">
                1,200+
              </div>
              <p className="text-[#726F6D] text-[10px] uppercase tracking-wider font-extrabold">
                Happy Clients
              </p>
            </div>
            <div className="hex-card bg-white border border-[#111111]/8 p-5 text-center shadow-sm">
              <div className="text-3xl font-heading font-black text-primary-amber mb-0.5">
                98%
              </div>
              <p className="text-[#726F6D] text-[10px] uppercase tracking-wider font-extrabold">
                Satisfaction Rate
              </p>
            </div>
          </div>

          {/* Pricing Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111111] mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#726F6D] text-xs sm:text-sm font-medium mb-4">
              Choose the plan that fits your presentation needs.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="hex-pill inline-flex items-center gap-1.5 bg-white p-1 border border-[#111111]/10 shadow-sm">
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
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Pricing Cards (Hexagonal Chamfered) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            
            {/* Starter (Free) */}
            <div className="hex-card bg-white border border-[#111111]/10 p-6 flex flex-col justify-between shadow-sm">
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
                <div className="space-y-2 border-t border-[#111111]/10 pt-4 text-xs text-[#111111] font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> 5 Free Templates
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Standard Downloads
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Basic Support
                  </div>
                </div>
              </div>

              <Link
                to="/templates"
                className="hex-pill mt-6 block text-center bg-[#FFF9E8] hover:bg-primary/20 border border-[#111111]/10 text-[#111111] font-extrabold py-2.5 text-xs transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Pro (Most Popular) */}
            <div className="hex-card bg-white border-2 border-primary p-6 flex flex-col justify-between relative shadow-xl">
              <div className="hex-pill-sm absolute top-3 right-4 bg-primary text-[#111111] font-black text-[9px] uppercase tracking-widest px-3 py-0.5 shadow">
                Most Popular
              </div>

              <div>
                <span className="text-[10px] text-primary-amber font-bold uppercase tracking-wider block mb-1">
                  Pro Access
                </span>
                <div className="text-3xl font-heading font-black text-[#111111] mb-1">
                  ₹{billingPeriod === "yearly" ? "999" : "199"}<span className="text-xs font-normal text-[#726F6D]">/{billingPeriod === "yearly" ? "year" : "month"}</span>
                </div>
                <p className="text-[#726F6D] text-xs font-medium mb-4">
                  Unlimited access to premium templates.
                </p>
                <div className="space-y-2 border-t border-[#111111]/10 pt-4 text-xs text-[#111111] font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Unlimited Template Downloads
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Premium 4K Vector Slides
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Priority Customer Support
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary-amber" /> Commercial License Included
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert("Redirecting to Pro checkout...")}
                className="hex-pill mt-6 w-full bg-primary hover:bg-primary-dark text-[#111111] font-extrabold py-3 text-xs transition-all shadow"
              >
                Go Pro Now
              </button>
            </div>

            {/* Studio (Custom) */}
            <div className="hex-card bg-white border border-[#111111]/10 p-6 flex flex-col justify-between shadow-sm">
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
                <div className="space-y-2 border-t border-[#111111]/10 pt-4 text-xs text-[#111111] font-medium">
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

              <Link
                to="/ordernow"
                className="hex-pill mt-6 block text-center bg-[#FFF9E8] hover:bg-primary/20 border border-[#111111]/10 text-[#111111] font-extrabold py-2.5 text-xs transition-all"
              >
                Get a Quote
              </Link>
            </div>
          </div>

          {/* Testimonials (Hexagonal Chamfered) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="hex-card bg-white border border-[#111111]/8 p-5 flex flex-col justify-between shadow-sm"
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

                <div className="flex items-center gap-2.5 pt-3 border-t border-[#111111]/5">
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
  );
}
