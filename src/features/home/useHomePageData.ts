import { useState, useEffect, useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { d1 } from "../../lib/d1";
import type { TestimonialItem } from "./components/HomeTestimonialsSection";

export function useHomePageData() {
  const heroRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLElement>(null);

  // Window scroll-driven motion for hero dissolve and template slide-up
  const { scrollY } = useScroll();
  const heroCardY = useTransform(scrollY, [0, 420], [0, -40]);
  const heroCardOpacity = useTransform(scrollY, [0, 360], [1, 0]);
  const videoScale = useTransform(scrollY, [0, 480], [1, 0.94]);
  const videoOpacity = useTransform(scrollY, [0, 450], [1, 0.1]);
  const templatesSlideUpY = useTransform(scrollY, [0, 420], [0, -75]);

  // Filtering & Pagination State (5x5 grid = 25 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortOption, setSortOption] = useState<"trending" | "newest" | "price_asc" | "price_desc" | "downloads">("trending");
  const pageSize = 25;
  const setVisibleCount = (_val?: any) => {
    setCurrentPage(1);
  };
  const visibleCount = pageSize;
  const [activeSidebarCategory, setActiveSidebarCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "premium">("all");
  const [isBrowsingActive, setIsBrowsingActive] = useState<boolean>(false);

  const isFilterActive =
    isBrowsingActive ||
    isSearchFocused ||
    searchQuery.trim().length > 0 ||
    activeSidebarCategory !== "all" ||
    tierFilter !== "all";

  const [dockOffset, setDockOffset] = useState<number>(505);

  const resetToResting = () => {
    setIsBrowsingActive(false);
    setIsSearchFocused(false);
    setSearchQuery("");
    setActiveSidebarCategory("all");
    setTierFilter("all");
    setSortOption("trending");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSidebarCategory, searchQuery, tierFilter, sortOption]);

  // Measure exact resting distance
  useEffect(() => {
    const calculateOffset = () => {
      const heroEl = heroRef.current;
      const sloganEl = document.getElementById("hero-slogan-note");
      if (heroEl && sloganEl) {
        const heroRect = heroEl.getBoundingClientRect();
        const sloganRect = sloganEl.getBoundingClientRect();

        let targetOffset: number;
        if (isFilterActive) {
          targetOffset = heroRect.bottom - (sloganRect.bottom + 65);
        } else {
          const restingDiff = heroRect.bottom - sloganRect.bottom;
          targetOffset = restingDiff + 175;
        }

        const safeOffset = Math.max(340, Math.min(525, Math.round(targetOffset)));
        setDockOffset(safeOffset);
      }
    };

    calculateOffset();
    const timer = setTimeout(calculateOffset, 200);
    window.addEventListener("resize", calculateOffset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateOffset);
    };
  }, [isFilterActive]);

  // Outside-Click Dismissal
  useEffect(() => {
    if (!isFilterActive) return;
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const cardEl = document.getElementById("hero-search-card");
      const templatesEl = document.getElementById("templates");
      if (cardEl?.contains(target) || templatesEl?.contains(target)) return;
      resetToResting();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isFilterActive]);

  const [categoriesList, setCategoriesList] = useState<string[]>([
    "Pitch Decks",
    "Business",
    "Infographics",
    "Marketing",
    "Corporate",
    "Finance",
    "Strategy",
  ]);
  const [customTestimonials, setCustomTestimonials] = useState<TestimonialItem[] | null>(null);
  const [heroConfig, setHeroConfig] = useState<any>({
    badge: "PRESENTATIONS FOR A BRIGHTER TOMORROW",
    title: "Ideas Deserve\nBetter Slides.",
    subtitle:
      "At Slidebee, we help businesses, professionals, and creators turn ideas into clear, engaging, and beautiful presentations that make an impact.",
  });
  const [curatedTrendingIds, setCuratedTrendingIds] = useState<string[]>([]);
  const [homeBannerTop, setHomeBannerTop] = useState<any>({
    enabled: true,
    badge: "EXECUTIVE SUITE",
    title: "100+ Board-Ready Presentation Templates & Frameworks",
    subtitle: "Built for founders, management consultants, and enterprise teams. 100% editable .pptx slides.",
    ctaText: "Explore Full Studio",
    ctaLink: "#templates",
    imageUrl: "",
  });
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
    d1.from("site_config")
      .select("*")
      .eq("key", "template_categories")
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setCategoriesList(data.value);
        }
      });

    d1.from("site_config")
      .select("*")
      .eq("key", "testimonials")
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data?.value && Array.isArray(data.value)) {
          setCustomTestimonials(data.value);
        }
      });

    d1.from("site_config")
      .select("*")
      .in("key", ["hero", "home_banner_top", "home_banner_1", "home_banner_2", "trending_templates", "featured_templates"])
      .then(({ data }: { data: any }) => {
        if (data && Array.isArray(data)) {
          data.forEach((row: any) => {
            if (row.key === "hero" && row.value) {
              setHeroConfig((prev: any) => ({ ...prev, ...row.value }));
            }
            if (row.key === "home_banner_top" && row.value) {
              setHomeBannerTop((prev: any) => ({ ...prev, ...row.value }));
            }
            if (row.key === "home_banner_1" && row.value) {
              setHomeBanner1((prev: any) => ({ ...prev, ...row.value }));
            }
            if (row.key === "home_banner_2" && row.value) {
              setHomeBanner2((prev: any) => ({ ...prev, ...row.value }));
            }
            if ((row.key === "trending_templates" || row.key === "featured_templates") && row.value) {
              const raw = row.value;
              const ids = Array.isArray(raw) ? raw : Array.isArray(raw?.ids) ? raw.ids : [];
              if (Array.isArray(ids) && ids.length > 0) {
                setCuratedTrendingIds(ids.map(String));
              }
            }
          });
        }
      });
  }, []);

  const defaultTestimonials: TestimonialItem[] = [
    {
      quote:
        "SlideBee's templates saved us hours of work. The quality, structure, and typography are exceptional!",
      name: "Rohan Mehta",
      role: "Founder, FinEdge",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      quote:
        "The design team understood our brand perfectly and delivered a board-ready deck within 24 hours.",
      name: "Priya Sharma",
      role: "Marketing Head, Nexora",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
      rating: 5,
    },
    {
      quote:
        "Our investor deck looked stunning and helped us raise our $4.5M seed round effortlessly!",
      name: "Arjun Patel",
      role: "CEO, InnovateX",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      rating: 5,
    },
  ];

  const testimonials =
    customTestimonials && customTestimonials.length > 0 ? customTestimonials : defaultTestimonials;

  return {
    heroRef,
    templatesRef,
    heroCardY,
    heroCardOpacity,
    videoScale,
    videoOpacity,
    templatesSlideUpY,
    visibleCount,
    setVisibleCount,
    activeSidebarCategory,
    setActiveSidebarCategory,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    tierFilter,
    setTierFilter,
    isBrowsingActive,
    setIsBrowsingActive,
    isFilterActive,
    dockOffset,
    resetToResting,
    categoriesList,
    heroConfig,
    curatedTrendingIds,
    setCuratedTrendingIds,
    currentPage,
    setCurrentPage,
    pageSize,
    sortOption,
    setSortOption,
    homeBannerTop,
    homeBanner1,
    homeBanner2,
    testimonials,
  };
}
