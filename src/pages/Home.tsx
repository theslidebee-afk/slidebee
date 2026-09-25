import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Infinity as InfinityIcon,
  ArrowRight,
  Search,
  Crown,
  Download,
  Eye,
  Star,
  FileText,
  PieChart,
  TrendingUp,
  Sparkles,
  Paintbrush,
  BarChart3,
  LayoutGrid,
  Monitor,
  Flame,
  ChevronRight,
  Users,
  Gift
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useStudioStore } from "../modules/StudioStoreClient";
import { MagneticButton } from "../components/MagneticButton";
import { usePageSEO } from "../hooks/usePageSEO";
import { supabase } from "../lib/supabase";

export default function Home() {
  usePageSEO({
    title: "SlideBee | Ideas Deserve Better Slides | Executive PowerPoint Templates & Design Studio",
    description: "At Slidebee, we help businesses, professionals, and creators turn ideas into clear, engaging, and beautiful presentations that make an impact. Browse our continuous template marketplace or hire an executive presentation designer.",
  });

  const navigate = useNavigate();

  // Authentication & Pro Membership State
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<string>("free");

  // Catalog State
  const { templates: allTemplates, loading, showStars } = useStudioStore();
  const { formatPrice } = useCurrency();

  // Filtering & Continuous Scroll State
  const [activeSidebarCategory, setActiveSidebarCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "premium">("all");
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [customTestimonials, setCustomTestimonials] = useState<any[] | null>(null);

  // Quick jump on hash change or mount
  useEffect(() => {
    if (window.location.hash === "#templates") {
      setTimeout(() => {
        document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);

  // Check User Pro Status
  useEffect(() => {
    const checkProStatus = async () => {
      let email = "";
      const local = localStorage.getItem("slidebee_client_user");
      if (local) {
        try {
          const u = JSON.parse(local);
          if (u?.email) email = u.email;
          if (u?.tier) {
            setUserTier(u.tier);
            if (["monthly", "yearly", "lifetime"].includes(u.tier)) {
              setIsProUser(true);
              return;
            }
          }
        } catch (e) {}
      }
      if (!email) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) email = data.user.email;
      }
      if (email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tier")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (profile?.tier) {
          setUserTier(profile.tier);
          if (["monthly", "yearly", "lifetime"].includes(profile.tier)) {
            setIsProUser(true);
            return;
          }
        }

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_email", email.toLowerCase().trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (
          sub &&
          sub.status === "active" &&
          (!sub.current_period_end || new Date(sub.current_period_end) > new Date())
        ) {
          setIsProUser(true);
        }
      }
    };
    checkProStatus();

    // Fetch site config comparison data
    // Fetch testimonials configuration
    supabase
      .from("site_config")
      .select("*")
      .eq("key", "testimonials")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && Array.isArray(data.value)) {
          setCustomTestimonials(data.value);
        }
      });
  }, []);

  const scrollToTemplates = () => {
    const el = document.getElementById("templates");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Curate Trending Templates (Top downloaded decks)
  const trendingTemplates = useMemo(() => {
    return [...allTemplates]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 4);
  }, [allTemplates]);

  // Curate Leading Templates (Handpicked executive master decks)
  const leadingTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const titleLower = t.title.toLowerCase();
      return (
        titleLower.includes("profile") ||
        titleLower.includes("rfp") ||
        titleLower.includes("retail") ||
        titleLower.includes("expansion") ||
        titleLower.includes("strategy") ||
        titleLower.includes("series a") ||
        titleLower.includes("growth")
      );
    }).slice(0, 4);
  }, [allTemplates]);

  // Filter Catalog for Continuous Scrolling Feed
  const filteredCatalog = useMemo(() => {
    return allTemplates.filter((item) => {
      // 1. Sidebar Category match
      let matchesSidebarCategory = true;
      if (activeSidebarCategory === "trending") {
        matchesSidebarCategory = (item.downloads || 0) >= 1000 || item.is_featured;
      } else if (activeSidebarCategory === "infographic") {
        matchesSidebarCategory =
          item.category.toLowerCase().includes("info") ||
          item.title.toLowerCase().includes("kpi") ||
          item.title.toLowerCase().includes("dashboard") ||
          item.title.toLowerCase().includes("roadmap");
      } else if (activeSidebarCategory === "pitch_deck") {
        matchesSidebarCategory =
          item.category.toLowerCase().includes("pitch") ||
          item.title.toLowerCase().includes("deck") ||
          item.title.toLowerCase().includes("pitch");
      } else if (activeSidebarCategory === "planner") {
        matchesSidebarCategory =
          item.title.toLowerCase().includes("plan") ||
          item.title.toLowerCase().includes("framework") ||
          item.category.toLowerCase().includes("strategy");
      } else if (activeSidebarCategory !== "all") {
        matchesSidebarCategory =
          item.category.toLowerCase() === activeSidebarCategory.toLowerCase();
      }

      // 2. Search Query match
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Tier Filter match
      const matchesTier =
        tierFilter === "all" ||
        (tierFilter === "free" && !item.is_premium) ||
        (tierFilter === "premium" && item.is_premium);

      return matchesSidebarCategory && matchesSearch && matchesTier;
    });
  }, [allTemplates, activeSidebarCategory, searchQuery, tierFilter]);

  const displayedContinuousTemplates = useMemo(() => {
    return filteredCatalog.slice(0, visibleCount);
  }, [filteredCatalog, visibleCount]);

  const hasMoreTemplates = visibleCount < filteredCatalog.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const freeCount = useMemo(() => allTemplates.filter((t) => !t.is_premium).length, [allTemplates]);
  const premiumCount = useMemo(() => allTemplates.filter((t) => t.is_premium).length, [allTemplates]);

  const defaultTestimonials = [
    {
      quote: "SlideBee's templates saved us hours of work. The quality, structure, and typography are exceptional!",
      name: "Rohan Mehta",
      role: "Founder, FinEdge",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      quote: "The design team understood our brand perfectly and delivered a board-ready deck within 24 hours.",
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
      
      {/* ========================================================================= */}
      {/* 1. TOP SPLIT PROMOTION BANNERS (From Client Mockup)                      */}
      {/* ========================================================================= */}
      <section className="pt-24 sm:pt-28 pb-4">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Banner 1: Yellow - Create Presentations That Make an Impact */}
            <div className="bg-[#FCBF14] text-[#111111] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Zap className="w-6 h-6 text-[#111111] fill-[#111111]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-black text-[#111111] leading-tight">
                    Create Presentations That Make an Impact
                  </h3>
                  <p className="text-xs sm:text-sm text-[#111111]/85 font-medium mt-0.5">
                    Turn your ideas into amazing slides.
                  </p>
                </div>
              </div>
              <Link
                to="/ordernow"
                className="hex-pill bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-black px-5 py-2.5 flex items-center gap-1.5 transition-all shadow shrink-0 self-stretch sm:self-auto justify-center"
              >
                Get Started <ArrowRight size={14} />
              </Link>
            </div>

            {/* Banner 2: Black - Get Unlimited Downloads */}
            <div className="bg-[#111111] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#FCBF14] flex items-center justify-center shadow-sm shrink-0">
                  <InfinityIcon className="w-6 h-6 text-[#111111] stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-black text-white leading-tight">
                    Get Unlimited Downloads
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 font-medium mt-0.5">
                    Access all templates. No limits.
                  </p>
                </div>
              </div>
              <button
                onClick={scrollToTemplates}
                className="hex-pill bg-[#FCBF14] hover:bg-[#e0a810] text-[#111111] text-xs sm:text-sm font-black px-5 py-2.5 flex items-center gap-1.5 transition-all shadow shrink-0 self-stretch sm:self-auto justify-center cursor-pointer"
              >
                Explore Now <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HERO MAIN SECTION (Ideas Deserve Better Slides + MacBook Mockup)       */}
      {/* ========================================================================= */}
      <section className="pt-8 sm:pt-12 pb-16 overflow-hidden">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Bold Headline & Action Triggers */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left">
              
              {/* Eyebrow */}
              <div className="mb-4">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#726F6D]">
                  PRESENTATIONS FOR A BRIGHTER TOMORROW
                </span>
              </div>

              {/* Bold Display Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black text-[#111111] leading-[1.04] tracking-tight mb-5">
                Ideas Deserve<br />
                Better Slides<span className="text-[#FCBF14]">.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-[#726F6D] font-medium leading-relaxed max-w-xl mb-8">
                At Slidebee, we help businesses, professionals, and creators turn ideas into clear, engaging, and beautiful presentations that make an impact.
              </p>

              {/* Trust Indicators Row */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-4 border-t border-[#111111]/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#FCBF14] fill-[#FCBF14]" />
                  <span className="text-xs sm:text-sm font-bold text-[#111111]">
                    Professional Quality
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#111111]" />
                  <span className="text-xs sm:text-sm font-bold text-[#111111]">
                    Trusted by Creators & Teams
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#FCBF14]" />
                  <span className="text-xs sm:text-sm font-bold text-[#111111]">
                    Save Time. Present Better.
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Fluid Yellow Backdrop + Modern MacBook Slide Display */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
              
              {/* Fluid Yellow Organic Backdrop Shape */}
              <div className="absolute w-[90%] sm:w-[500px] h-[360px] sm:h-[420px] bg-[#FCBF14] rounded-[45%_55%_65%_35%/50%_45%_55%_50%] -rotate-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-95 filter blur-[0.5px] -z-0" />

              {/* Little Sunburst Rays Top Right */}
              <div className="absolute top-2 right-8 sm:right-16 z-10 hidden sm:block">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 5V13" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M9.5 9.5L15 15" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M30.5 9.5L25 15" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Realistic MacBook Mockup Frame */}
              <div className="relative z-10 w-full max-w-[560px] mx-auto select-none">
                {/* Laptop Screen Bezel */}
                <div className="bg-[#1e1e1e] p-2.5 sm:p-3.5 rounded-t-2xl border-t-2 border-x-2 border-white/20 shadow-2xl">
                  {/* Camera Dot */}
                  <div className="w-2 h-2 rounded-full bg-[#111111] mx-auto mb-2 border border-white/10" />

                  {/* High-Impact Slide Preview Inside Screen */}
                  <div className="relative aspect-[16/10] bg-[#141414] rounded-lg overflow-hidden border border-white/10 flex flex-col justify-between p-5 sm:p-7 text-white">
                    
                    {/* Slide Top Navigation / Brand */}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FCBF14]" />
                        <span className="font-heading font-black text-xs sm:text-sm tracking-wider text-white">
                          Slidebee
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-white/60 italic font-medium">
                        Ideas move people.
                      </span>
                    </div>

                    {/* Dramatic Typography & Mountain Fluid Artwork */}
                    <div className="relative z-10 my-auto">
                      <p className="text-white text-sm sm:text-base font-extrabold tracking-wide">
                        From Ideas to
                      </p>
                      <h2 className="text-3xl sm:text-5xl font-heading font-black text-[#FCBF14] tracking-tight leading-none mt-1 mb-3">
                        Impact
                      </h2>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-white/80">
                        <span>Clear</span>
                        <span>•</span>
                        <span>Engaging</span>
                        <span>•</span>
                        <span>Memorable</span>
                      </div>
                    </div>

                    {/* Background Slide Graphic (Mountain + Golden Wave Silhouette) */}
                    <div className="absolute right-0 bottom-0 w-3/5 h-4/5 pointer-events-none opacity-90 overflow-hidden">
                      <svg viewBox="0 0 300 240" fill="none" className="w-full h-full object-cover">
                        <polygon points="120,240 200,60 280,240" fill="#262626" />
                        <polygon points="180,240 230,100 300,240" fill="#333333" />
                        <polygon points="140,240 190,120 250,240" fill="#1c1c1c" />
                        <path d="M40 240 C 100 180, 160 210, 240 140 C 270 120, 290 130, 300 120 L 300 240 Z" fill="#FCBF14" fillOpacity="0.85" />
                      </svg>
                    </div>

                    {/* Deliverable Watermark */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] text-white/50 border-t border-white/10 pt-2">
                      <span>Executive Keynote System</span>
                      <span>PowerPoint (.pptx)</span>
                    </div>

                  </div>
                </div>

                {/* Laptop Chassis Base */}
                <div className="bg-[#2c2c2c] h-3.5 sm:h-4 rounded-b-xl relative shadow-2xl border-b border-white/10">
                  {/* Laptop Center Opening Groove */}
                  <div className="w-14 sm:w-16 h-1.5 bg-[#1a1a1a] rounded-b-md mx-auto" />
                </div>
                {/* Laptop Shadow on Table */}
                <div className="w-[90%] h-4 bg-black/25 blur-md rounded-full mx-auto -mt-1" />
              </div>

              {/* Playful Handwritten Note with Golden Underline */}
              <div className="mt-4 sm:mt-6 text-center sm:text-right w-full max-w-[560px] pr-4">
                <span className="inline-block font-heading font-black italic text-base sm:text-xl text-[#111111] tracking-tight relative">
                  Better Presentations Brighter Ideas
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#FCBF14]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10, 100 3" stroke="#FCBF14" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CONTINUOUS TEMPLATES SECTION (#templates)                              */}
      {/* ========================================================================= */}
      <section id="templates" className="scroll-mt-24 py-16 border-t-2 border-primary/20">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: Dark Category & Filter Sidebar (From Mockup)    */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-3 lg:sticky lg:top-24">
              <div className="bg-[#181818] border border-white/10 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between">
                
                <div>
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FCBF14] flex items-center gap-1.5">
                      <LayoutGrid size={14} /> Catalog Filter
                    </span>
                    <span className="text-[10px] font-extrabold bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                      {userTier !== "free" ? `${userTier.toUpperCase()} VIP` : `${allTemplates.length} Decks`}
                    </span>
                  </div>

                  {/* Navigation Categories Strip */}
                  <div className="flex flex-col gap-1.5 mb-6">
                    
                    {/* 1. Latest templates */}
                    <button
                      onClick={() => {
                        setActiveSidebarCategory("all");
                        setVisibleCount(12);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all text-left cursor-pointer ${
                        activeSidebarCategory === "all"
                          ? "bg-[#242424] text-[#FCBF14] shadow border-l-4 border-[#FCBF14]"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles size={16} className={activeSidebarCategory === "all" ? "text-[#FCBF14]" : "text-white/60"} />
                        <span>Latest templates</span>
                      </div>
                      <ChevronRight size={14} className={activeSidebarCategory === "all" ? "text-[#FCBF14]" : "opacity-0"} />
                    </button>

                    {/* 2. Trending templates */}
                    <button
                      onClick={() => {
                        setActiveSidebarCategory("trending");
                        setVisibleCount(12);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all text-left cursor-pointer ${
                        activeSidebarCategory === "trending"
                          ? "bg-[#242424] text-[#FCBF14] shadow border-l-4 border-[#FCBF14]"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Flame size={16} className={activeSidebarCategory === "trending" ? "text-[#FCBF14]" : "text-white/60"} />
                        <span>Trending templates</span>
                      </div>
                      <ChevronRight size={14} className={activeSidebarCategory === "trending" ? "text-[#FCBF14]" : "opacity-0"} />
                    </button>

                    {/* 3. Infographic templates */}
                    <button
                      onClick={() => {
                        setActiveSidebarCategory("infographic");
                        setVisibleCount(12);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all text-left cursor-pointer ${
                        activeSidebarCategory === "infographic"
                          ? "bg-[#242424] text-[#FCBF14] shadow border-l-4 border-[#FCBF14]"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <PieChart size={16} className={activeSidebarCategory === "infographic" ? "text-[#FCBF14]" : "text-white/60"} />
                        <span>Infographic templates</span>
                      </div>
                      <ChevronRight size={14} className={activeSidebarCategory === "infographic" ? "text-[#FCBF14]" : "opacity-0"} />
                    </button>

                    {/* 4. Pitch deck templates */}
                    <button
                      onClick={() => {
                        setActiveSidebarCategory("pitch_deck");
                        setVisibleCount(12);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all text-left cursor-pointer ${
                        activeSidebarCategory === "pitch_deck"
                          ? "bg-[#242424] text-[#FCBF14] shadow border-l-4 border-[#FCBF14]"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Monitor size={16} className={activeSidebarCategory === "pitch_deck" ? "text-[#FCBF14]" : "text-white/60"} />
                        <span>Pitch deck templates</span>
                      </div>
                      <ChevronRight size={14} className={activeSidebarCategory === "pitch_deck" ? "text-[#FCBF14]" : "opacity-0"} />
                    </button>

                    {/* 5. Word doc planner */}
                    <button
                      onClick={() => {
                        setActiveSidebarCategory("planner");
                        setVisibleCount(12);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all text-left cursor-pointer ${
                        activeSidebarCategory === "planner"
                          ? "bg-[#242424] text-[#FCBF14] shadow border-l-4 border-[#FCBF14]"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className={activeSidebarCategory === "planner" ? "text-[#FCBF14]" : "text-white/60"} />
                        <span>Word doc planner</span>
                      </div>
                      <ChevronRight size={14} className={activeSidebarCategory === "planner" ? "text-[#FCBF14]" : "opacity-0"} />
                    </button>

                  </div>

                  {/* Tier Filter Buttons */}
                  <div className="pt-4 border-t border-white/10 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider text-white/60 block mb-2">
                      Access Tier
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setTierFilter("all")}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                          tierFilter === "all"
                            ? "bg-[#FCBF14] text-[#111111] font-black"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span>All Tiers</span>
                        <span>{allTemplates.length}</span>
                      </button>
                      <button
                        onClick={() => setTierFilter("free")}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                          tierFilter === "free"
                            ? "bg-emerald-600 text-white font-black"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Free Library (3/day)
                        </span>
                        <span>{freeCount}</span>
                      </button>
                      <button
                        onClick={() => setTierFilter("premium")}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                          tierFilter === "premium"
                            ? "bg-[#FCBF14] text-[#111111] font-black"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Crown size={12} className={tierFilter === "premium" ? "text-[#111111]" : "text-[#FCBF14]"} />
                          Premium Decks
                        </span>
                        <span>{premiumCount}</span>
                      </button>
                    </div>
                  </div>

                  {/* Format Deliverable Card */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
                    <span className="text-[10px] font-black uppercase text-[#FCBF14] block mb-1">
                      Deliverable Format
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-2 h-2 rounded-full bg-[#FCBF14]" />
                      Master PowerPoint (.pptx)
                    </div>
                  </div>

                </div>

                {/* Sidebar Bottom Flourish */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-white/50 text-[11px] font-medium">
                  <span>Great presentations start here.</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12C8 6 16 18 20 12" stroke="#FCBF14" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Trending, Leading & Endless Continuous Catalog */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-9 space-y-12">
              
              {/* SECTION A: TRENDING TEMPLATES */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111]">
                        Trending Templates
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[#726F6D] font-medium">
                      Most downloaded by executive leaders and startup founders this month.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full shrink-0">
                    High Demand
                  </span>
                </div>

                {/* 4 Trending Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {trendingTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => navigate(`/template/${template.id}`)}
                      className="group bg-white rounded-2xl border-2 border-primary/30 hover:border-primary overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="p-3 bg-[#FFF9E8]/70 border-b border-primary/20">
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white shadow-inner">
                          <img
                            src={template.image_url}
                            alt={template.title}
                            className="w-full h-full object-contain group-hover:scale-103 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="hex-pill bg-[#FCBF14] text-[#111111] text-xs font-black px-3.5 py-1.5 shadow flex items-center gap-1">
                              <Eye size={12} /> View Deck
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase text-primary-amber">
                              {template.category}
                            </span>
                            {!template.is_premium ? (
                              <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                FREE
                              </span>
                            ) : (
                              <span className="text-[9px] font-black bg-[#111111] text-[#FCBF14] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Crown size={9} className="fill-[#FCBF14]" /> PRO
                              </span>
                            )}
                          </div>
                          <h3 className="font-heading font-extrabold text-sm text-[#111111] group-hover:text-primary-amber transition-colors line-clamp-1 mb-1">
                            {template.title}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-primary/15 mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111111]">
                            <div className="w-4 h-4 rounded bg-orange-600 text-white font-black text-[9px] flex items-center justify-center">
                              P
                            </div>
                            <span>Presentation</span>
                          </div>
                          <span className="text-xs font-black text-[#111111]">
                            {!template.is_premium ? "Free" : formatPrice(template.price_inr)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: LEADING TEMPLATES */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-5 h-5 text-[#FCBF14] fill-[#FCBF14]" />
                      <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111]">
                        Leading Templates
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[#726F6D] font-medium">
                      Curated master frameworks engineered for boardrooms and investor pitches.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-primary-amber bg-primary/15 border border-primary/30 px-3 py-1 rounded-full shrink-0">
                    Editor's Pick
                  </span>
                </div>

                {/* 4 Leading Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {leadingTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => navigate(`/template/${template.id}`)}
                      className="group bg-white rounded-2xl border-2 border-primary/30 hover:border-primary overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div className="p-3 bg-[#FFF9E8]/70 border-b border-primary/20">
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white shadow-inner">
                          <img
                            src={template.image_url}
                            alt={template.title}
                            className="w-full h-full object-contain group-hover:scale-103 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="hex-pill bg-[#FCBF14] text-[#111111] text-xs font-black px-3.5 py-1.5 shadow flex items-center gap-1">
                              <Eye size={12} /> View Deck
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-grow">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase text-primary-amber">
                              {template.category}
                            </span>
                            {!template.is_premium ? (
                              <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                FREE
                              </span>
                            ) : (
                              <span className="text-[9px] font-black bg-[#111111] text-[#FCBF14] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Crown size={9} className="fill-[#FCBF14]" /> PRO
                              </span>
                            )}
                          </div>
                          <h3 className="font-heading font-extrabold text-sm text-[#111111] group-hover:text-primary-amber transition-colors line-clamp-1 mb-1">
                            {template.title}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-primary/15 mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111111]">
                            <div className="w-4 h-4 rounded bg-orange-600 text-white font-black text-[9px] flex items-center justify-center">
                              P
                            </div>
                            <span>Presentation</span>
                          </div>
                          <span className="text-xs font-black text-[#111111]">
                            {!template.is_premium ? "Free" : formatPrice(template.price_inr)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: CONTINUOUS ALL TEMPLATES CATALOG */}
              <div className="pt-4 border-t-2 border-primary/20">
                
                {/* Search & Dynamic Filter Header Bar */}
                <div className="bg-white/85 backdrop-blur-md rounded-2xl border-2 border-primary/30 p-4 sm:p-5 mb-8 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Live Search */}
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#726F6D]" />
                      <input
                        type="text"
                        placeholder="Search all pitch decks, frameworks..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setVisibleCount(12);
                        }}
                        className="w-full bg-[#FFF9E8]/70 border border-primary/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#726F6D]/60 focus:outline-none focus:border-primary transition-all font-medium"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#726F6D] hover:text-[#111111] text-xs font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Filter Status Badge */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-xs font-extrabold text-[#726F6D]">
                        Showing {displayedContinuousTemplates.length} of {filteredCatalog.length} templates
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] bg-[#FFF9E8] px-3 py-1.5 rounded-lg border border-primary/30">
                        <span className="w-2 h-2 rounded-full bg-[#FCBF14]" />
                        PowerPoint (.pptx)
                      </div>
                    </div>

                  </div>
                </div>

                {/* Templates Grid */}
                {loading ? (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs font-extrabold text-[#726F6D] uppercase tracking-wider">
                      Loading Continuous Catalog...
                    </p>
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="bg-white border-2 border-primary/30 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
                    <FileText size={40} className="mx-auto text-primary-amber mb-3" />
                    <h3 className="text-xl font-heading font-extrabold text-[#111111] mb-2">
                      No Templates Found
                    </h3>
                    <p className="text-xs text-[#726F6D] mb-6 font-medium">
                      No templates match "{searchQuery}" under the current filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveSidebarCategory("all");
                        setTierFilter("all");
                        setVisibleCount(12);
                      }}
                      className="hex-pill bg-primary text-[#111111] font-black px-6 py-2.5 text-xs cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayedContinuousTemplates.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/template/${item.id}`)}
                          className="hex-card group bg-white border-2 border-primary/35 overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 flex flex-col justify-between shadow-sm cursor-pointer"
                        >
                          {/* Framed Slide Mockup */}
                          <div className="p-3 sm:p-3.5 bg-[#FFF9E8]/75 border-b border-primary/20">
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white shadow-sm border border-[#111111]/10 group-hover:shadow-md transition-all duration-300">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-contain bg-white group-hover:scale-102 transition-transform duration-500"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                <span className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-xl">
                                  <Eye size={13} /> View Full Deck
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 pt-3.5 flex flex-col flex-grow justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber">
                                  {item.category}
                                </span>
                                {!item.is_premium ? (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                    FREE TEMPLATE
                                  </span>
                                ) : (
                                  <span className="bg-[#111111] text-[#FCBF14] border border-[#FCBF14]/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Crown size={9} className="fill-[#FCBF14]" /> PREMIUM
                                  </span>
                                )}
                                {showStars && item.rating ? (
                                  <span className="text-[#111111] text-[10px] font-extrabold flex items-center gap-1">
                                    <Star size={10} className="text-amber-500 fill-amber-500" /> {item.rating}
                                  </span>
                                ) : null}
                              </div>

                              <h3 className="font-heading font-extrabold text-base text-[#111111] group-hover:text-primary-amber transition-colors mb-1.5 line-clamp-1">
                                {item.title}
                              </h3>
                              <p className="text-xs text-[#726F6D] line-clamp-2 leading-relaxed mb-4 font-medium">
                                {item.description}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center justify-between pt-3 border-t border-primary/15 mb-3">
                                <div>
                                  {!item.is_premium ? (
                                    <>
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="text-base sm:text-lg font-heading font-black text-emerald-800">
                                          Free
                                        </span>
                                        <span className="text-xs text-[#726F6D] line-through font-bold">
                                          {formatPrice(item.price_inr)}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-bold text-emerald-700 block">
                                        3 Free Downloads / Day
                                      </span>
                                    </>
                                  ) : isProUser ? (
                                    <>
                                      <div className="flex items-baseline gap-1.5">
                                        <span className="text-base sm:text-lg font-heading font-black text-[#111111]">
                                          Unlocked
                                        </span>
                                        <span className="text-xs text-[#726F6D] line-through font-bold">
                                          {formatPrice(item.price_inr)}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-black text-primary-amber flex items-center gap-1 mt-0.5">
                                        <Crown size={10} /> Pro Plan Access
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="text-lg font-heading font-black text-[#111111]">
                                        {formatPrice(item.price_inr)}
                                      </div>
                                      <span className="text-[10px] font-bold text-primary-amber block">
                                        Unlocked with $5/mo Pro
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 bg-[#FFF9E8] border border-primary/40 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#111111]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                                  PowerPoint (.pptx)
                                </div>
                              </div>

                              {!item.is_premium ? (
                                <Link
                                  to={`/template/${item.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
                                >
                                  <Download size={13} /> Download Free <ArrowRight size={12} />
                                </Link>
                              ) : isProUser ? (
                                <Link
                                  to={`/template/${item.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-2.5 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
                                >
                                  <Crown size={13} className="text-[#111111]" /> Download with Pro <ArrowRight size={12} />
                                </Link>
                              ) : (
                                <Link
                                  to={`/template/${item.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hex-pill w-full bg-[#111111] hover:bg-black text-[#FCBF14] font-extrabold py-2.5 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center border border-primary/30"
                                >
                                  <Download size={13} /> Unlock with Pro ($5) <ArrowRight size={12} />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Continuous / Endless Load More Button */}
                    {hasMoreTemplates && (
                      <div className="text-center pt-10">
                        <button
                          onClick={handleLoadMore}
                          className="hex-pill bg-white hover:bg-primary/10 border-2 border-primary text-[#111111] font-black text-sm px-8 py-3.5 shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-102"
                        >
                          <span>Load More Templates ({filteredCatalog.length - visibleCount} Remaining)</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. "NEED SOMETHING CUSTOM?" SERVICE STRIP                                */}
      {/* ========================================================================= */}
      <section className="py-12 border-t-2 border-primary/20">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-[#111111] mb-1">
                  Need Something Custom?
                </h2>
                <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
                  Our presentation specialists redesign, storyboard, and animate executive slides in 24h–48h.
                </p>
              </div>
              <MagneticButton>
                <Link
                  to="/ordernow"
                  className="hex-cut-btn text-[#111111] font-black px-7 py-3 text-xs sm:text-sm gap-2 shrink-0 bg-primary hover:bg-primary-dark"
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

      {/* ========================================================================= */}
      {/* 5. CLIENT TESTIMONIALS                                                    */}
      {/* ========================================================================= */}
      <section className="pt-12 pb-20">
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-sm">
              Client Reviews
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111]">
              Trusted by Founders & Executives
            </h2>
          </div>

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
  );
}
