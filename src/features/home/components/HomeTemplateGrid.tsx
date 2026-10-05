import type { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { HomeTemplateCard } from "./HomeTemplateCard";
import { HomeMarketplaceToolbar, type SortOption } from "./HomeMarketplaceToolbar";
import { HomePagePagination } from "./HomePagePagination";

interface HomeTemplateGridProps {
  templatesRef: RefObject<HTMLElement | null>;
  isFilterActive: boolean;
  templatesSlideUpY: any;
  isSearching: boolean;
  dockOffset: number;
  loading: boolean;
  filteredCatalog: any[];
  displayedTemplates: any[];
  resetToResting: () => void;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  tierFilter: "all" | "free" | "premium";
  setTierFilter: (val: "all" | "free" | "premium") => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  categoriesList: string[];
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  freeCount: number;
  premiumCount: number;
}

export function HomeTemplateGrid({
  templatesRef,
  isFilterActive,
  templatesSlideUpY,
  isSearching,
  dockOffset,
  loading,
  filteredCatalog,
  displayedTemplates,
  resetToResting,
  searchQuery,
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  tierFilter,
  setTierFilter,
  activeCategory,
  setActiveCategory,
  categoriesList,
  sortOption,
  setSortOption,
  freeCount,
  premiumCount,
}: HomeTemplateGridProps) {
  return (
    <motion.section
      id="templates"
      ref={templatesRef}
      style={{
        y: isFilterActive ? 0 : templatesSlideUpY,
      }}
      animate={{
        marginTop: isSearching ? -dockOffset : -32,
      }}
      transition={{
        type: "spring",
        stiffness: 230,
        damping: 26,
        mass: 0.85,
      }}
      className={`scroll-mt-16 relative z-20 bg-[#FFF9E8] rounded-t-[36px] sm:rounded-t-[56px] border-t-2 border-[#FCBF14]/50 shadow-[0_-35px_80px_rgba(0,0,0,0.35)] ${
        isFilterActive ? "pt-3 sm:pt-4" : "pt-6 sm:pt-8"
      } pb-20`}
    >
      <div className="w-[94%] max-w-[1840px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Marketplace Filter Toolbar positioned at top of section */}
        <HomeMarketplaceToolbar
          totalCount={filteredCatalog.length}
          startIndex={startIndex}
          endIndex={endIndex}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categoriesList={categoriesList}
          sortOption={sortOption}
          setSortOption={setSortOption}
          freeCount={freeCount}
          premiumCount={premiumCount}
        />

        {/* Catalog Content (5x5 Structured Grid or Loading / Empty States) */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-extrabold text-[#726F6D] uppercase tracking-wider">
              Loading Presentation Catalog...
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
              onClick={resetToResting}
              className="hex-pill bg-primary text-[#111111] font-black px-6 py-2.5 text-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Strict 5-Column Grid Layout (5 across on lg/xl/2xl screens, rendering 25 items per page) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3.5 sm:gap-4.5 items-start">
              <AnimatePresence mode="popLayout">
                {displayedTemplates.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.88, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 16 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 24,
                      mass: 0.8,
                    }}
                    className="w-full"
                  >
                    <HomeTemplateCard template={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Page Number Selector & Pagination Bar */}
            <HomePagePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </motion.section>
  );
}
