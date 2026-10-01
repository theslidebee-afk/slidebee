import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Zap,
  Infinity as InfinityIcon,
  ArrowRight,
  Search,
  Crown,
  Eye,
  Star,
  FileText,
  TrendingUp,
  Sparkles,
  Paintbrush,
  BarChart3,
  LayoutGrid,
  Flame
} from "lucide-react";
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

  // Window scroll-driven motion: templates slide up in direct 1:1 sync with scroll
  const { scrollY } = useScroll();
  const heroCardY = useTransform(scrollY, [0, 480], [0, -30]);
  const heroCardOpacity = useTransform(scrollY, [0, 450], [1, 0.7]);
  const videoScale = useTransform(scrollY, [0, 500], [1, 0.98]);
  const videoOpacity = useTransform(scrollY, [0, 500], [1, 0.85]);
  const templatesSlideUpY = useTransform(scrollY, [0, 420], [80, 0]);


  // Helper to extract inner preview slide thumbnails for SlideEgg-style showcase cards
  // Only returns real uploaded slides — never pads with portfolio placeholders
  const getPreviewSlides = (template: any, count = 6) => {
    const rawSlides = Array.isArray(template?.slides) ? template.slides.filter(Boolean) : [];
    if (rawSlides.length > 0) {
      return rawSlides.slice(0, count);
    }
    // If no slides array but has a cover image, show that
    const cover = template?.image_url || template?.thumbnail_url;
    if (cover) return [cover];
    return [];
  };

  // Determine dynamic mini-slide counts (0, 3, 6, 9) for magnet masonry variation
  const getMiniSlideCount = (template: any) => {
    const category = (template?.category || "").toLowerCase();
    const title = (template?.title || "").toLowerCase();
    if (
      category.includes("infographic") ||
      title.includes("infographic") ||
      category.includes("diagram") ||
      title.includes("diagram")
    ) {
      const idSeed = String(template?.id || "").charCodeAt(0) || 0;
      return idSeed % 2 === 0 ? 0 : 3;
    }
    const idSeed = String(template?.id || template?.title || "deck")
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const mod = idSeed % 3;
    if (mod === 0) return 9;
    if (mod === 1) return 6;
    return 6;
  };

  // Catalog State
  const { templates: allTemplates, loading } = useStudioStore();

  // Filtering & Continuous Scroll State
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeSidebarCategory, setActiveSidebarCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
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
  const [heroConfig, setHeroConfig] = useState<any>({
    badge: "PRESENTATIONS FOR A BRIGHTER TOMORROW",
    title: "Ideas Deserve\nBetter Slides.",
    subtitle: "At Slidebee, we help businesses, professionals, and creators turn ideas into clear, engaging, and beautiful presentations that make an impact.",
  });
  const [curatedTrendingIds, setCuratedTrendingIds] = useState<string[]>([]);
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

  useEffect(() => {
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

    // Fetch dynamic hero, promotional banners, and curated trending templates
    supabase
      .from("site_config")
      .select("*")
      .in("key", ["hero", "home_banner_1", "home_banner_2", "trending_templates", "featured_templates"])
      .then(({ data }) => {
        if (data && Array.isArray(data)) {
          data.forEach((row: any) => {
            if (row.key === "hero" && row.value) {
              setHeroConfig((prev: any) => ({ ...prev, ...row.value }));
            }
            if (row.key === "home_banner_1" && row.value) {
              setHomeBanner1((prev: any) => ({ ...prev, ...row.value }));
            }
            if (row.key === "home_banner_2" && row.value) {
              setHomeBanner2((prev: any) => ({ ...prev, ...row.value }));
            }
            if ((row.key === "trending_templates" || row.key === "featured_templates") && row.value) {
              const raw = row.value;
              const ids = Array.isArray(raw) ? raw : (Array.isArray(raw?.ids) ? raw.ids : []);
              if (Array.isArray(ids) && ids.length > 0) {
                setCuratedTrendingIds(ids.map(String));
              }
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

  // Scroll to search stage so search controls and template cards are both visible at top of viewport
  const scrollToSearchStage = (ms = 70) => {
    setTimeout(() => {
      const searchCard = document.getElementById("hero-search-card");
      if (searchCard) {
        const navOffset = 76; // Accommodate fixed top navbar
        const cardTop = searchCard.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, cardTop - navOffset), behavior: "smooth" });
      } else {
        document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" });
      }
    }, ms);
  };


  // Dynamic category pills combined from site_config and allTemplates
  const allCategoryPills = useMemo(() => {
    const set = new Set<string>(categoriesList);
    allTemplates.forEach((t) => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set);
  }, [categoriesList, allTemplates]);

  // Filter & Sort Catalog for Continuous Scrolling Feed
  const filteredCatalog = useMemo(() => {
    const list = allTemplates.filter((item) => {
      // 1. Sidebar / Top Category match
      let matchesSidebarCategory = true;
      if (activeSidebarCategory === "trending") {
        if (curatedTrendingIds.length > 0) {
          matchesSidebarCategory =
            curatedTrendingIds.includes(String(item.id)) ||
            curatedTrendingIds.includes(String((item as any).slug)) ||
            curatedTrendingIds.includes(String((item as any).code));
        } else {
          matchesSidebarCategory = (item.downloads || 0) >= 1000 || !!item.is_featured;
        }
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

    // When on "all", prioritize curated trending templates at the top
    if (activeSidebarCategory === "all" && curatedTrendingIds.length > 0) {
      return [...list].sort((a, b) => {
        const aTrending =
          curatedTrendingIds.includes(String(a.id)) ||
          curatedTrendingIds.includes(String((a as any).slug)) ||
          curatedTrendingIds.includes(String((a as any).code))
            ? 1
            : 0;
        const bTrending =
          curatedTrendingIds.includes(String(b.id)) ||
          curatedTrendingIds.includes(String((b as any).slug)) ||
          curatedTrendingIds.includes(String((b as any).code))
            ? 1
            : 0;
        return bTrending - aTrending;
      });
    }

    return list;
  }, [allTemplates, activeSidebarCategory, searchQuery, tierFilter, curatedTrendingIds]);

  const displayedContinuousTemplates = useMemo(() => {
    return filteredCatalog.slice(0, visibleCount);
  }, [filteredCatalog, visibleCount]);

  const hasMoreTemplates = visibleCount < filteredCatalog.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 18);
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

  // Minimalist SlideEgg-style Showcase Card with Swallowtail Ribbons
  const renderShowcaseCard = (template: any) => {
    const miniCount = getMiniSlideCount(template);
    const previewSlides = miniCount > 0 ? getPreviewSlides(template, miniCount) : [];

    return (
      <div
        key={template.id}
        onClick={() => navigate(`/template/${template.id}`)}
        data-bee-state="card"
        className="group flex flex-col cursor-pointer transition-all duration-300"
      >
        {/* Main Card Canvas with Subtle Border & Soft Shadow */}
        <div className="relative bg-[#FAFAFA] group-hover:bg-white border border-[#111111]/10 group-hover:border-[#FCBF14] rounded-2xl p-2 sm:p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-xl transition-all duration-300 overflow-hidden">
          
          {/* Swallowtail Ribbon Tag: Free badge for free community decks */}
          {!template.is_premium && (
            <div
              style={{
                clipPath: "polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)",
              }}
              className="absolute top-2 left-0 bg-[#FCBF14] text-[#111111] text-[9px] sm:text-[10px] font-black uppercase pl-2.5 pr-4 py-0.5 sm:py-1 shadow-sm z-20 tracking-wider select-none font-heading"
            >
              Free
            </div>
          )}

          {/* Main Top Slide Cover Preview */}
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-white border border-[#111111]/6 shadow-xs">
            <img
              src={template.image_url || template.thumbnail_url || previewSlides[0] || "/portfolio/case_study_a_1.png"}
              alt={template.title}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />

            {/* Subtle Hover Lens Overlay */}
            <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-[#111111]/90 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 scale-95 group-hover:scale-100 transition-transform">
                <Eye size={12} className="text-[#FCBF14]" /> View Deck
              </span>
            </div>
          </div>

          {/* Multi-Slide Grid Mini Previews (Matching SlideEgg 3-column subgrid) */}
          {miniCount > 0 && previewSlides.length > 0 && (
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 mt-1.5">
              {previewSlides.map((slideUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-[5px] overflow-hidden bg-white border border-[#111111]/6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
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
          )}

        </div>

        {/* Minimalist Title Below Card */}
        <div className="mt-2 px-1">
          <h3 className="font-heading font-extrabold text-xs sm:text-[13px] text-[#111111] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {template.title}
          </h3>
        </div>

      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E8] large-hex-grid text-[#111111]">
      
      {/* ========================================================================= */}
      {/* 1 & 2. UNIFIED HERO STAGE                                                 */}
      {/* ========================================================================= */}
      <section
        id="hero-stage"
        ref={heroRef}
        className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center bg-[#111111] pt-14 sm:pt-16 lg:pt-20 pb-10 sm:pb-14"
      >
        {/* Total Hero Section Background Video: 3D Isometric Animated Cubes with Parallax */}
        <motion.div
          style={{ scale: videoScale, opacity: videoOpacity }}
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        >
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
        </motion.div>

        {/* Central Stage Container */}
        <motion.div
          style={{ y: heroCardY, opacity: heroCardOpacity }}
          className="w-[92%] max-w-[1760px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center"
        >
          
          {/* Top Split Promotion Banners (Center aligned with central card) */}
          <div className="w-full max-w-5xl lg:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5 sm:mb-6">
            
            {/* Banner 1: Yellow - Create Presentations That Make an Impact */}
            {homeBanner1.ctaLink && homeBanner1.ctaLink !== "#templates" && !homeBanner1.ctaLink.startsWith("#") ? (
              <Link
                to={homeBanner1.ctaLink}
                data-bee-state="quote"
                className="group bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] text-[#111111] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 block text-left"
              >
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
              </Link>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={scrollToTemplates}
                data-bee-state="quote"
                className="group bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] text-[#111111] rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.22)] border border-[#e0a810] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 text-left"
              >
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
              </div>
            )}

            {/* Banner 2: Black - Get Unlimited Downloads */}
            {homeBanner2.ctaLink && homeBanner2.ctaLink !== "#templates" && !homeBanner2.ctaLink.startsWith("#") ? (
              <Link
                to={homeBanner2.ctaLink}
                className="group bg-[#0D0D0D]/95 backdrop-blur-md text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.30)] border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 block text-left"
              >
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
              </Link>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={scrollToTemplates}
                className="group bg-[#0D0D0D]/95 backdrop-blur-md text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.30)] border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden min-h-[110px] cursor-pointer hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 text-left"
              >
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
              </div>
            )}

          </div>
          
          {/* Central Translucent Frosted Glass Card with Search Bar & Template Controls */}
          <div
            id="hero-search-card"
            className="w-full max-w-5xl lg:max-w-6xl mx-auto bg-[#FFFDF5]/95 sm:bg-[#FFFDF5]/98 backdrop-blur-2xl border-2 border-white/95 rounded-[32px] sm:rounded-[44px] p-5 sm:p-7 lg:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.24)] transition-all relative text-left scroll-mt-24"
          >

            {/* Row 1: Section Heading & Deliverable Badge */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 sm:mb-5 pt-1">
              <div>
                <span className="text-xs font-bold text-[#726F6D] block mb-1">
                  Showing {displayedContinuousTemplates.length} of {filteredCatalog.length} templates
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-heading font-black text-[#111111] tracking-tight leading-tight">
                  Explore Executive Presentation Templates
                </h2>
              </div>

              {/* Master Format Deliverable Badge */}
              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-[#111111] bg-white px-3.5 py-2 rounded-xl border border-[#111111]/10 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FCBF14]" />
                  <span>Master PowerPoint (.pptx) & Google Slides</span>
                </div>
              </div>
            </div>

            {/* Row 2: Live Search Input & Access Tier Toggles Strip */}
            <div className="bg-white rounded-2xl border border-[#111111]/10 p-2.5 sm:p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 transition-all duration-300">
              
              {/* Live Search Input - Kinetic Expansion on Focus */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`relative flex-1 transition-all duration-300 ${
                  isSearchFocused || searchQuery.trim().length > 0 ? "md:flex-[2.8]" : "md:flex-1"
                }`}
              >
                <Search
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${
                    isSearchFocused ? "text-[#FCBF14]" : "text-[#726F6D]"
                  }`}
                />
                <input
                  type="text"
                  placeholder={
                    isSearchFocused
                      ? "Search pitch decks, business, frameworks, corporate, finance..."
                      : "Search templates, pitch decks, business frameworks..."
                  }
                  value={searchQuery}
                  onFocus={() => {
                    setIsSearchFocused(true);
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(24);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      scrollToSearchStage(30);
                    }
                  }}
                  className={`w-full rounded-xl pl-10 pr-20 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#726F6D]/70 focus:outline-none transition-all duration-300 font-medium ${
                    isSearchFocused
                      ? "bg-white border-2 border-[#FCBF14] shadow-[0_0_0_4px_rgba(252,191,20,0.22)]"
                      : "bg-[#FFF9E8]/70 hover:bg-[#FFF9E8] border border-[#111111]/12"
                  }`}
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setVisibleCount(24);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold bg-[#111111]/8 hover:bg-[#111111]/15 text-[#111111] px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                    >
                      Clear ×
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Access Tier Filter Pills - Gentle contract when search is focused */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`flex items-center bg-[#F4EEDC] p-1 rounded-xl border border-[#111111]/8 self-start md:self-auto shrink-0 transition-all duration-300 ${
                  isSearchFocused ? "md:opacity-95 md:scale-[0.98] origin-right" : "md:opacity-100 md:scale-100"
                }`}
              >
                <button
                  onClick={() => {
                    setTierFilter("all");
                    setVisibleCount(24);
                    scrollToSearchStage(50);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tierFilter === "all"
                      ? "bg-[#111111] text-white shadow-xs font-black"
                      : "text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  All ({allTemplates.length})
                </button>
                <button
                  onClick={() => {
                    setTierFilter("free");
                    setVisibleCount(24);
                    scrollToSearchStage(50);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    tierFilter === "free"
                      ? "bg-[#FCBF14] text-[#111111] shadow-xs font-black"
                      : "text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                  Free ({freeCount})
                </button>
                <button
                  onClick={() => {
                    setTierFilter("premium");
                    setVisibleCount(24);
                    scrollToSearchStage(50);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    tierFilter === "premium"
                      ? "bg-[#FCBF14] text-[#111111] shadow-xs font-black"
                      : "text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  <Crown size={12} className={tierFilter === "premium" ? "text-[#111111] fill-[#111111]" : "text-amber-600"} />
                  Premium ({premiumCount})
                </button>
              </motion.div>

            </div>

            {/* Row 3: Horizontal Scrollable Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {/* All Templates */}
              <button
                onClick={() => {
                  setActiveSidebarCategory("all");
                  setVisibleCount(24);
                  scrollToSearchStage(80);
                }}
                className={`hex-pill px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSidebarCategory === "all"
                    ? "bg-[#111111] text-[#FCBF14] shadow-md scale-102"
                    : "bg-white/80 hover:bg-white text-[#555250] hover:text-[#111111] border border-[#111111]/10"
                }`}
              >
                <Sparkles size={13} className={activeSidebarCategory === "all" ? "text-[#FCBF14]" : "text-[#726F6D]"} />
                <span>All Templates</span>
                <span className="text-[10px] font-mono opacity-60">({allTemplates.length})</span>
              </button>

              {/* Trending */}
              <button
                onClick={() => {
                  setActiveSidebarCategory("trending");
                  setVisibleCount(24);
                  scrollToSearchStage(80);
                }}
                className={`hex-pill px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSidebarCategory === "trending"
                    ? "bg-[#FCBF14] text-[#111111] shadow-md scale-102"
                    : "bg-white/80 hover:bg-white text-[#555250] hover:text-[#111111] border border-[#111111]/10"
                }`}
              >
                <Flame size={13} className={activeSidebarCategory === "trending" ? "text-[#111111] fill-[#111111]" : "text-amber-500 fill-amber-500"} />
                <span>Trending</span>
              </button>

              {/* Dynamic categories */}
              {allCategoryPills.map((cat) => {
                const isCatActive = activeSidebarCategory.toLowerCase() === cat.toLowerCase();
                const count = allTemplates.filter((t: any) => t.category?.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveSidebarCategory(cat);
                      setVisibleCount(24);
                      scrollToSearchStage(80);
                    }}
                    className={`hex-pill px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCatActive
                        ? "bg-[#111111] text-[#FCBF14] shadow-md scale-102"
                        : "bg-white/80 hover:bg-white text-[#555250] hover:text-[#111111] border border-[#111111]/10"
                    }`}
                  >
                    <span>{cat}</span>
                    {count > 0 && <span className="text-[10px] font-mono opacity-60">({count})</span>}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Playful Note Beneath Hero Stage */}
          <div className="mt-4 sm:mt-5 text-center">
            <span className="inline-block font-heading font-black italic text-sm sm:text-lg lg:text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] tracking-tight relative">
              {heroConfig.slogan || "Better Presentations Brighter Ideas"}
              <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-[#FCBF14]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10, 100 3" stroke="#FCBF14" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </div>

        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CONTINUOUS TEMPLATES SECTION (SlideEgg 6-Column Magnet Masonry)         */}
      {/* ========================================================================= */}
      <motion.section
        id="templates"
        style={{ y: templatesSlideUpY }}
        className="scroll-mt-16 relative z-10 bg-[#FFF9E8] rounded-t-[36px] sm:rounded-t-[56px] border-t-2 border-[#FCBF14]/50 shadow-[0_-35px_80px_rgba(0,0,0,0.35)] pt-12 sm:pt-16 pb-20 -mt-8 sm:-mt-14"
      >
        <div className="w-[94%] max-w-[1840px] mx-auto px-2 sm:px-4 lg:px-6">
          
          {/* Quick Active Filter Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111111]/10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#726F6D]">
              <span>Showing {displayedContinuousTemplates.length} of {filteredCatalog.length} templates</span>
              {activeSidebarCategory !== "all" && (
                <span className="bg-[#111111] text-[#FCBF14] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  {activeSidebarCategory}
                </span>
              )}
              {tierFilter !== "all" && (
                <span className="bg-[#FCBF14]/30 text-[#111111] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  {tierFilter}
                </span>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="bg-gray-100 hover:bg-gray-200 text-[#111111] px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  Clear search: "{searchQuery}" ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#111111] bg-white px-3.5 py-1.5 rounded-xl border border-[#111111]/10 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FCBF14]" />
              <span>Master PowerPoint (.pptx) & Google Slides</span>
            </div>
          </div>

          {/* Catalog Content (6-Column Magnet Masonry or Loading / Empty States) */}
          {loading ? (
            <div className="py-24 text-center">
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
                  setVisibleCount(24);
                }}
                className="hex-pill bg-primary text-[#111111] font-black px-6 py-2.5 text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* 6-Column Magnet Masonry Layout */}
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3.5 sm:gap-4">
                {displayedContinuousTemplates.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="break-inside-avoid mb-4 sm:mb-5"
                  >
                    {renderShowcaseCard(item)}
                  </motion.div>
                ))}
              </div>

              {/* Continuous / Endless Load More Button */}
              {hasMoreTemplates && (
                <div className="text-center pt-10 sm:pt-12">
                  <button
                    onClick={handleLoadMore}
                    className="hex-pill bg-white hover:bg-primary/10 border-2 border-primary text-[#111111] font-black text-xs sm:text-sm px-8 py-3.5 shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer hover:scale-102"
                  >
                    <span>Load More Templates ({filteredCatalog.length - visibleCount} Remaining)</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </motion.section>

      {/* ========================================================================= */}
      {/* 4. "NEED SOMETHING CUSTOM?" SERVICE STRIP                                */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 bg-[#FFF9E8] py-12 border-t-2 border-primary/20"
      >
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
      </motion.section>

      {/* ========================================================================= */}
      {/* 5. CLIENT TESTIMONIALS                                                    */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 bg-[#FFF9E8] pt-12 pb-20"
      >
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
      </motion.section>

    </div>
  );
}
