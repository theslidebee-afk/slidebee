import { useMemo } from "react";
import { motion } from "framer-motion";
import { useStudioStore } from "../modules/StudioStoreClient";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  HomeHeroBanners,
  HomeSearchDock,
  HomeTemplateGrid,
  HomeCustomServiceStrip,
  HomeTestimonialsSection,
} from "../features/home";
import { useHomePageData } from "../features/home/useHomePageData";

export default function Home() {
  usePageSEO({
    title: "SlideBee | Executive PowerPoint Presentation Templates & Bespoke Design Studio",
    description:
      "SlideBee is a premier presentation design studio and marketplace for PowerPoint (.pptx) and Google Slides. Investor pitch decks, business templates, and bespoke slide design.",
    keywords: [
      "presentation design",
      "powerpoint templates",
      "pitch deck design",
      "google slides templates",
      "executive presentation studio",
      "investor deck design",
      "infographic slides",
      "business presentation templates",
    ],
    canonicalUrl: "https://theslidebee.com/",
  });

  const {
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
    setIsBrowsingActive,
    isFilterActive,
    dockOffset,
    resetToResting,
    categoriesList,
    heroConfig,
    curatedTrendingIds,
    homeBanner1,
    homeBanner2,
    testimonials,
  } = useHomePageData();

  const isSearching = isFilterActive;
  const { templates: allTemplates, loading } = useStudioStore();

  const scrollToTemplates = () => {
    const el = document.getElementById("templates");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
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

      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier =
        tierFilter === "all" ||
        (tierFilter === "free" && !item.is_premium) ||
        (tierFilter === "premium" && item.is_premium);

      return matchesSidebarCategory && matchesSearch && matchesTier;
    });

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

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E8] large-hex-grid text-[#111111]">
      {/* 1 & 2. UNIFIED HERO STAGE */}
      <section
        id="hero-stage"
        ref={heroRef}
        className="relative w-full min-h-[85vh] lg:min-h-screen overflow-hidden flex flex-col items-center justify-start bg-[#FFF9E8] pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-14 transition-all duration-300"
      >
        {/* Total Hero Section Background Video */}
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
          <div className="absolute inset-0 bg-[#FCBF14]/10 mix-blend-multiply pointer-events-none" />
        </motion.div>

        {/* Seamless Bottom Gradient Feather into Templates Section */}
        <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-64 bg-gradient-to-b from-transparent via-[#FFF9E8]/70 to-[#FFF9E8] pointer-events-none z-10" />

        {/* Central Stage Container */}
        <motion.div
          style={{ y: heroCardY, opacity: heroCardOpacity }}
          className="w-[92%] max-w-[1760px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center"
        >
          {/* Top Split Promotion Banners */}
          <HomeHeroBanners
            isFilterActive={isFilterActive}
            homeBanner1={homeBanner1}
            homeBanner2={homeBanner2}
            scrollToTemplates={scrollToTemplates}
          />

          {/* Central Translucent Frosted Glass Card with Search Bar & Template Controls */}
          <HomeSearchDock
            isSearching={isSearching}
            isFilterActive={isFilterActive}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            tierFilter={tierFilter}
            setTierFilter={setTierFilter}
            activeSidebarCategory={activeSidebarCategory}
            setActiveSidebarCategory={setActiveSidebarCategory}
            setIsBrowsingActive={setIsBrowsingActive}
            setVisibleCount={setVisibleCount}
            resetToResting={resetToResting}
            allTemplates={allTemplates}
            freeCount={freeCount}
            premiumCount={premiumCount}
            filteredCatalog={filteredCatalog}
            displayedCount={displayedContinuousTemplates.length}
            allCategoryPills={allCategoryPills}
            heroConfig={heroConfig}
          />
        </motion.div>
      </section>

      {/* 3. CONTINUOUS TEMPLATES SECTION */}
      <HomeTemplateGrid
        templatesRef={templatesRef}
        isFilterActive={isFilterActive}
        templatesSlideUpY={templatesSlideUpY}
        isSearching={isSearching}
        dockOffset={dockOffset}
        loading={loading}
        filteredCatalog={filteredCatalog}
        displayedTemplates={displayedContinuousTemplates}
        hasMoreTemplates={hasMoreTemplates}
        handleLoadMore={handleLoadMore}
        resetToResting={resetToResting}
        searchQuery={searchQuery}
        visibleCount={visibleCount}
      />

      {/* 4. "NEED SOMETHING CUSTOM?" SERVICE STRIP */}
      <HomeCustomServiceStrip />

      {/* 5. CLIENT TESTIMONIALS */}
      <HomeTestimonialsSection testimonials={testimonials} />
    </div>
  );
}
