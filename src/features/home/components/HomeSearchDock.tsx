import { motion, AnimatePresence } from "framer-motion";
import { Search, Crown, Sparkles, Flame } from "lucide-react";

interface HomeSearchDockProps {
  isSearching: boolean;
  isFilterActive: boolean;
  isSearchFocused: boolean;
  setIsSearchFocused: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  tierFilter: "all" | "free" | "premium";
  setTierFilter: (val: "all" | "free" | "premium") => void;
  activeSidebarCategory: string;
  setActiveSidebarCategory: (val: string) => void;
  setIsBrowsingActive: (val: boolean) => void;
  setVisibleCount: (val: number | ((prev: number) => number)) => void;
  resetToResting: () => void;
  allTemplates: any[];
  freeCount: number;
  premiumCount: number;
  filteredCatalog: any[];
  displayedCount: number;
  allCategoryPills: string[];
  heroConfig: any;
}

export function HomeSearchDock({
  isSearching,
  isFilterActive: _isFilterActive,
  isSearchFocused,
  setIsSearchFocused,
  searchQuery,
  setSearchQuery,
  tierFilter,
  setTierFilter,
  activeSidebarCategory,
  setActiveSidebarCategory,
  setIsBrowsingActive,
  setVisibleCount,
  resetToResting,
  allTemplates,
  freeCount,
  premiumCount,
  filteredCatalog,
  displayedCount,
  allCategoryPills,
  heroConfig,
}: HomeSearchDockProps) {
  return (
    <>
      {/* Central Translucent Frosted Glass Card with Search Bar & Template Controls */}
      <motion.div
        id="hero-search-card"
        layout
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`w-full max-w-5xl lg:max-w-6xl mx-auto bg-[#FFFDF5]/95 sm:bg-[#FFFDF5]/98 backdrop-blur-2xl border-2 border-white/95 rounded-[32px] sm:rounded-[44px] shadow-[0_30px_90px_rgba(0,0,0,0.24)] transition-all relative text-left z-30 ${
          isSearching ? "p-4 sm:p-5" : "p-5 sm:p-7 lg:p-8"
        }`}
      >
        {/* Row 1: Section Heading & Summary */}
        <motion.div
          animate={{
            opacity: isSearching ? 0 : 1,
            height: isSearching ? 0 : "auto",
            marginBottom: isSearching ? 0 : 16,
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-[#726F6D]">
                Showing {displayedCount} of {filteredCatalog.length} templates
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-heading font-black text-[#111111] tracking-tight leading-tight">
              {heroConfig?.headline || "Explore Executive Presentation Templates"}
            </h2>
          </div>
        </motion.div>

        {/* Row 2: Live Search Input & Access Tier Toggles Strip */}
        <div className="bg-white rounded-2xl border border-[#111111]/10 p-2.5 sm:p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-3.5 transition-all duration-300">
          {/* Live Search Input - Kinetic Expansion on Focus */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`relative flex-1 transition-all duration-300 ${
              isSearching ? "md:flex-[2.8]" : "md:flex-1"
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
                setIsBrowsingActive(true);
                if (window.scrollY > 40) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              onBlur={() => {
                setIsSearchFocused(false);
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsBrowsingActive(true);
                setVisibleCount(24);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === "Escape") {
                  resetToResting();
                  (e.target as HTMLInputElement).blur();
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

          {/* Access Tier Filter Pills */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`flex items-center bg-[#F4EEDC] p-1 rounded-xl border border-[#111111]/8 self-start md:self-auto shrink-0 transition-all duration-300 ${
              isSearchFocused ? "md:opacity-95 md:scale-[0.98] origin-right" : "md:opacity-100 md:scale-100"
            }`}
          >
            <button
              onClick={() => {
                setIsBrowsingActive(true);
                setTierFilter("all");
                setVisibleCount(24);
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
                setIsBrowsingActive(true);
                setTierFilter("free");
                setVisibleCount(24);
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
                setIsBrowsingActive(true);
                setTierFilter("premium");
                setVisibleCount(24);
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

        {/* Row 3: Multi-Line Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 py-1">
          {/* All Templates */}
          <button
            onClick={() => {
              setIsBrowsingActive(true);
              setActiveSidebarCategory("all");
              setSearchQuery("");
              setVisibleCount(24);
              if (window.scrollY > 40) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
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
              setIsBrowsingActive(true);
              if (activeSidebarCategory === "trending") {
                setActiveSidebarCategory("all");
              } else {
                setActiveSidebarCategory("trending");
              }
              setSearchQuery("");
              setVisibleCount(24);
              if (window.scrollY > 40) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
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
                  setIsBrowsingActive(true);
                  if (isCatActive) {
                    setActiveSidebarCategory("all");
                  } else {
                    setActiveSidebarCategory(cat);
                  }
                  setSearchQuery("");
                  setVisibleCount(24);
                  if (window.scrollY > 40) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
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
      </motion.div>

      {/* Playful Note Beneath Hero Stage */}
      <div id="hero-slogan-note" className="mt-4 sm:mt-5 text-center">
        <span className="inline-block font-heading font-black italic text-sm sm:text-lg lg:text-xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] tracking-tight relative">
          {heroConfig.slogan || "Better Presentations Brighter Ideas"}
          <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-[#FCBF14]" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0 5 Q 50 10, 100 3" stroke="#FCBF14" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </>
  );
}
