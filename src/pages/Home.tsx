import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Zap,
  Infinity as InfinityIcon,
  ArrowRight,
  Search,
  Crown,
  Download,
  Heart,
  Eye,
  Star,
  FileText,
  TrendingUp,
  Sparkles,
  Paintbrush,
  BarChart3,
  LayoutGrid,
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
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax scroll-linked transforms without opacity dimming
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroCardY = useTransform(scrollYProgress, [0, 0.6], [0, -25]);

  // Helper to extract up to 6 inner preview slide thumbnails for SlideEgg-style showcase cards
  const getPreviewSlides = (template: any, count = 6) => {
    const slides = Array.isArray(template?.slides) ? template.slides.filter(Boolean) : [];
    if (slides.length >= count) {
      return slides.slice(0, count);
    }
    const fallback = template?.thumbnail_url || template?.image_url || "/portfolio/case_study_a_1.png";
    if (slides.length > 0) {
      const list = [...slides];
      while (list.length < count) {
        list.push(list[list.length % slides.length]);
      }
      return list.slice(0, count);
    }
    return Array(count).fill(fallback);
  };

  // Authentication & Pro Membership State
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<string>("free");

  // Catalog State
  const { templates: allTemplates, loading } = useStudioStore();
  const { formatPrice } = useCurrency();

  // Filtering & Continuous Scroll State
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [activeSidebarCategory, setActiveSidebarCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "premium">("all");
  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Pitch Decks",
    "Business",
    "Infographics",
    "Marketing",
    "Corporate",
    "Finance",
    "Strategy"
  ]);
  const [customTestimonials, setCustomTestimonials] = useState<any[] | null>(null);
  const [homeBanner1, setHomeBanner1] = useState<any>({
    title: "Create Presentations That Make an Impact",
    subtitle: "Turn your ideas into amazing slides.",
    ctaText: "Get Started",
    ctaLink: "/ordernow",
  });
  const [homeBanner2, setHomeBanner2] = useState<any>({
    title: "Get Unlimited Downloads",
    subtitle: "Access all templates. No limits.",
    ctaText: "Explore Now",
    ctaLink: "#templates",
  });

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
    // Fetch dynamic template categories
    supabase
      .from("site_config")
      .select("*")
      .eq("key", "template_categories")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setCategoriesList(data.value);
        }
      });

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

    // Fetch dynamic promotional banners
    supabase
      .from("site_config")
      .select("*")
      .in("key", ["home_banner_1", "home_banner_2"])
      .then(({ data }) => {
        if (data && Array.isArray(data)) {
          data.forEach((row: any) => {
            if (row.key === "home_banner_1" && row.value) {
              setHomeBanner1((prev: any) => ({ ...prev, ...row.value }));
            }
            if (row.key === "home_banner_2" && row.value) {
              setHomeBanner2((prev: any) => ({ ...prev, ...row.value }));
            }
          });
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
      } else if (activeSidebarCategory !== "all") {
        matchesSidebarCategory =
          item.category?.toLowerCase() === activeSidebarCategory.toLowerCase();
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

  // Full Showcase Card Renderer matching SlideEgg reference mockup
  const renderShowcaseCard = (template: any) => {
    const previewSlides = getPreviewSlides(template, 6);

    return (
      <div
        key={template.id}
        onClick={() => navigate(`/template/${template.id}`)}
        data-bee-state="card"
        className="group bg-white border border-[#111111]/10 hover:border-primary/80 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
      >
        {/* Top Visual Showcase Area */}
        <div className="space-y-2">
          {/* Main Cover Slide Preview */}
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gray-50 border border-[#111111]/8">
            <img
              src={template.image_url || previewSlides[0]}
              alt={template.title}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />

            {/* Corner Ribbon / Tag */}
            {!template.is_premium ? (
              <div className="absolute top-0 left-0 bg-[#2563EB] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-tl-xl rounded-br-lg shadow-sm z-10 tracking-wider">
                Free
              </div>
            ) : (
              <div className="absolute top-2 left-2 bg-[#111111]/90 backdrop-blur-md text-[#FCBF14] text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-white/10 shadow-sm z-10 flex items-center gap-1">
                <Crown size={10} className="fill-[#FCBF14]" /> PRO
              </div>
            )}

            {/* Quick Action Buttons on Top Right */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/template/${template.id}`);
                }}
                className="w-7 h-7 rounded-full bg-white/95 text-[#111111] hover:text-red-500 shadow-sm flex items-center justify-center transition-colors"
                title="Save to favorites"
              >
                <Heart size={13} />
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/template/${template.id}`);
                }}
                className="w-7 h-7 rounded-full bg-white/95 text-[#111111] hover:text-primary-amber shadow-sm flex items-center justify-center transition-colors"
                title="Quick download"
              >
                <Download size={13} />
              </span>
            </div>

            {/* Subtle Hover Overlay */}
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-15 pointer-events-none">
              <span className="hex-pill bg-[#FCBF14] text-[#111111] text-xs font-black px-3.5 py-1.5 shadow-md flex items-center gap-1.5 scale-95 group-hover:scale-100 transition-transform">
                <Eye size={12} /> View Deck
              </span>
            </div>
          </div>

          {/* Multi-Slide Grid Thumbnail Previews (Matching SlideEgg layout) */}
          <div className="grid grid-cols-3 gap-1.5">
            {previewSlides.map((slideUrl: string, idx: number) => (
              <div
                key={idx}
                className="relative aspect-video rounded-md overflow-hidden bg-gray-50 border border-[#111111]/8 group-hover:border-primary/40 transition-colors"
              >
                <img
                  src={slideUrl}
                  alt={`${template.title} slide ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Details Area */}
        <div className="pt-3 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
              {template.title}
            </h3>
            <p className="text-[11px] text-[#726F6D] font-medium mt-1">
              PowerPoint Presentation & Google Slides
            </p>
          </div>

          <div className="pt-2.5 mt-2 border-t border-[#111111]/6 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#726F6D]">
              {template.slides_count || 30}+ Slides
            </span>
            <div className="text-xs font-black text-[#111111]">
              {!template.is_premium ? (
                <span className="text-blue-600 font-extrabold">Free Download</span>
              ) : isProUser ? (
                <span className="text-amber-600 font-extrabold flex items-center gap-1">
                  <Crown size={11} className="fill-[#FCBF14]" /> Included
                </span>
              ) : (
                formatPrice(template.price_inr)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E8] large-hex-grid text-[#111111]">
      
      {/* ========================================================================= */}
      {/* 1 & 2. UNIFIED HERO STAGE (Parallax Video Background)                     */}
      <section
        ref={heroRef}
        className="relative w-full min-h-screen lg:min-h-[105vh] pt-24 sm:pt-28 pb-20 sm:pb-28 overflow-hidden flex flex-col items-center justify-center bg-[#111111]"
      >
        {/* Total Hero Section Background Video: 3D Isometric Animated Cubes with Parallax */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <video
            src="/hero_section.mp4"
            poster="/hero_section_1.jpeg"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full min-w-full min-h-full object-cover object-center select-none"
          />
          {/* Crisp, clean overlay without heavy darkening or opacity haze */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>

        {/* Central Stage Container */}
        <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          
          {/* Top Split Promotion Banners (Tighter proportions) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
            
            {/* Banner 1: Yellow - Create Presentations That Make an Impact */}
            <div className="bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] text-[#111111] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px]">
              
              {/* Organic Fluid Texture Wave 1 (Bottom Left) */}
              <div className="absolute -bottom-10 -left-10 w-52 h-52 pointer-events-none opacity-35">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                  <path d="M0 120 C 60 80, 120 160, 200 110 L 200 200 L 0 200 Z" fill="#F09B0A" />
                </svg>
              </div>

              {/* Organic Fluid Texture Wave 2 (Bottom Right) */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 pointer-events-none opacity-25">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                  <path d="M0 140 C 70 110, 130 180, 200 130 L 200 200 L 0 200 Z" fill="#E08B00" />
                </svg>
              </div>

              <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
                {/* White Circle Badge with Radiating Spark Lines */}
                <div className="relative shrink-0">
                  <svg className="absolute -top-2 -right-2 w-5 h-5 pointer-events-none" viewBox="0 0 30 30" fill="none">
                    <path d="M15 4V11" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M6 8L11 13" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M24 8L19 13" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                  </svg>

                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFFDF5] shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] fill-[#111111]" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-heading font-black text-[#111111] leading-tight">
                    {homeBanner1.title || "Create Presentations That Make an Impact"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#111111]/85 font-medium mt-0.5">
                    {homeBanner1.subtitle || "Turn your ideas into amazing slides."}
                  </p>
                </div>
              </div>

              <Link
                to={homeBanner1.ctaLink || "/ordernow"}
                data-bee-state="quote"
                className="hex-pill bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 transition-all shadow-md hover:scale-105 shrink-0 self-stretch sm:self-auto justify-center relative z-10"
              >
                <span>{homeBanner1.ctaText || "Get Started"}</span>
                <ArrowRight size={15} className="text-[#FCBF14]" />
              </Link>
            </div>

            {/* Banner 2: Black - Get Unlimited Downloads */}
            <div className="bg-[#0D0D0D]/95 backdrop-blur-md text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.30)] border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px]">
              
              {/* Organic Flowing Contour Texture 1 (Top Left) */}
              <div className="absolute -top-10 -left-10 w-56 h-56 pointer-events-none opacity-40">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                  <path d="M0 0 L 160 0 C 130 60, 80 120, 0 160 Z" fill="#1C1C1C" />
                  <path d="M0 0 L 120 0 C 90 50, 60 90, 0 120 Z" fill="#242424" />
                </svg>
              </div>

              {/* Organic Flowing Contour Texture 2 (Bottom Right) */}
              <div className="absolute -bottom-8 -right-8 w-52 h-52 pointer-events-none opacity-30">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                  <path d="M200 80 C 140 120, 80 140, 40 200 L 200 200 Z" fill="#1F1F1F" />
                </svg>
              </div>

              <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
                {/* Yellow Circle Badge with Infinity Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FCBF14] shadow-[0_6px_22px_rgba(252,191,20,0.35)] flex items-center justify-center shrink-0">
                  <InfinityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111] stroke-[2.8]" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-heading font-black text-white leading-tight">
                    {homeBanner2.title || "Get Unlimited Downloads"}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A0A0A0] font-medium mt-0.5">
                    {homeBanner2.subtitle || "Access all templates. No limits."}
                  </p>
                </div>
              </div>

              {homeBanner2.ctaLink && homeBanner2.ctaLink !== "#templates" && !homeBanner2.ctaLink.startsWith("#") ? (
                <Link
                  to={homeBanner2.ctaLink}
                  className="hex-pill bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] text-xs sm:text-sm font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 transition-all shadow-md shadow-[#FCBF14]/25 hover:scale-105 shrink-0 self-stretch sm:self-auto justify-center cursor-pointer relative z-10"
                >
                  <span>{homeBanner2.ctaText || "Explore Now"}</span>
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <button
                  onClick={scrollToTemplates}
                  className="hex-pill bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] text-xs sm:text-sm font-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 transition-all shadow-md shadow-[#FCBF14]/25 hover:scale-105 shrink-0 self-stretch sm:self-auto justify-center cursor-pointer relative z-10"
                >
                  <span>{homeBanner2.ctaText || "Explore Now"}</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>

          </div>
          
          {/* Central Translucent Frosted Glass Card with Dissolving Parallax */}
          <motion.div
            style={{ y: heroCardY }}
            className="w-full max-w-4xl mx-auto bg-[#FFFDF5]/80 sm:bg-[#FFFDF5]/88 backdrop-blur-2xl border-2 border-white/95 rounded-[32px] sm:rounded-[44px] p-8 sm:p-12 lg:p-16 text-center shadow-[0_30px_90px_rgba(0,0,0,0.22)] flex flex-col items-center justify-center transition-all"
          >
            
            {/* Eyebrow */}
            <div className="mb-4">
              <span className="hex-pill inline-block bg-white/90 border border-primary/40 text-primary-amber px-5 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-xs">
                PRESENTATIONS FOR A BRIGHTER TOMORROW
              </span>
            </div>

            {/* Bold Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black text-[#111111] leading-[1.05] tracking-tight mb-5 max-w-2xl">
              Ideas Deserve<br />
              Better Slides<span className="text-primary-amber">.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-[#555250] font-medium leading-relaxed max-w-2xl mx-auto mb-8">
              At Slidebee, we help businesses, professionals, and creators turn ideas into clear, engaging, and beautiful presentations that make an impact.
            </p>

            {/* Trust Indicators Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-6 border-t border-[#111111]/10 w-full">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-amber fill-[#FCBF14]" />
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
                <Gift className="w-5 h-5 text-primary-amber" />
                <span className="text-xs sm:text-sm font-bold text-[#111111]">
                  Save Time. Present Better.
                </span>
              </div>
            </div>

          </motion.div>

          {/* Playful Note Beneath Hero Stage */}
          <div className="mt-6 text-center">
            <span className="inline-block font-heading font-black italic text-base sm:text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] tracking-tight relative">
              Better Presentations Brighter Ideas
              <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-[#FCBF14]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10, 100 3" stroke="#FCBF14" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CONTINUOUS TEMPLATES SECTION (Solid Crisp Full Opacity)               */}
      {/* ========================================================================= */}
      <section
        id="templates"
        className="scroll-mt-20 relative z-30 bg-[#FFF9E8] rounded-t-[36px] sm:rounded-t-[56px] border-t-2 border-[#FCBF14]/40 shadow-[0_-35px_80px_rgba(0,0,0,0.28)] pt-12 sm:pt-16 pb-20"
      >
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

                  {/* Navigation Categories Strip (Dynamic) */}
                  <div className="flex flex-col gap-1.5 mb-6">
                    
                    {/* All templates */}
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
                        <span>All Templates</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/50">{allTemplates.length}</span>
                    </button>

                    {/* Trending templates */}
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
                        <span>Trending</span>
                      </div>
                      <ChevronRight size={14} className={activeSidebarCategory === "trending" ? "text-[#FCBF14]" : "opacity-0"} />
                    </button>

                    {/* Dynamic categories from database & templates */}
                    {categoriesList.map((cat) => {
                      const count = allTemplates.filter((t: any) => t.category?.toLowerCase() === cat.toLowerCase()).length;
                      const isCatActive = activeSidebarCategory.toLowerCase() === cat.toLowerCase();
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveSidebarCategory(cat);
                            setVisibleCount(12);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all text-left cursor-pointer ${
                            isCatActive
                              ? "bg-[#242424] text-[#FCBF14] shadow border-l-4 border-[#FCBF14]"
                              : "text-white/80 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <LayoutGrid size={15} className={isCatActive ? "text-[#FCBF14]" : "text-white/60"} />
                            <span className="truncate max-w-[155px]">{cat}</span>
                          </div>
                          <span className="text-[10px] font-mono text-white/50">{count}</span>
                        </button>
                      );
                    })}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {trendingTemplates.map((template) => renderShowcaseCard(template))}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {leadingTemplates.map((template) => renderShowcaseCard(template))}
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
                      {displayedContinuousTemplates.map((item) => renderShowcaseCard(item))}
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
                  className="rounded-full text-[#111111] font-black px-7 py-3 text-xs sm:text-sm gap-2 shrink-0 bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow shadow-md shadow-[#FCBF14]/25 hover:scale-105 transition-all flex items-center"
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
