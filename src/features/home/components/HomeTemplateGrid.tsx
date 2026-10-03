import type { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";
import { HomeTemplateCard } from "./HomeTemplateCard";

interface HomeTemplateGridProps {
  templatesRef: RefObject<HTMLElement | null>;
  isFilterActive: boolean;
  templatesSlideUpY: any;
  isSearching: boolean;
  dockOffset: number;
  loading: boolean;
  filteredCatalog: any[];
  displayedTemplates: any[];
  hasMoreTemplates: boolean;
  handleLoadMore: () => void;
  resetToResting: () => void;
  searchQuery: string;
  visibleCount: number;
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
  hasMoreTemplates,
  handleLoadMore,
  resetToResting,
  searchQuery,
  visibleCount,
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
              onClick={resetToResting}
              className="hex-pill bg-primary text-[#111111] font-black px-6 py-2.5 text-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* 6-Column Structured Grid Layout with Live Pop-Up Physics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 items-start">
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
  );
}
