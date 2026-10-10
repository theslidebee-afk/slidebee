import { useState, useRef, useEffect, useCallback } from "react";
import type { TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Crown, Layers } from "lucide-react";
import type { StoreTemplate } from "../../../modules/StudioStoreClient";

interface TemplateSlideViewerProps {
  template: StoreTemplate;
  slides: string[];
  activeSlideIdx: number;
  setActiveSlideIdx: (val: number | ((prev: number) => number)) => void;
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: () => void;
}

export function TemplateSlideViewer({
  template,
  slides,
  activeSlideIdx,
  setActiveSlideIdx,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
}: TemplateSlideViewerProps) {
  const currentSlideImg = slides[activeSlideIdx] || template.image_url;
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    if (thumbnailsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = thumbnailsRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  }, []);

  // Auto-center the active thumbnail when activeSlideIdx changes
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeEl = thumbnailsRef.current.children[activeSlideIdx] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
    const timer = setTimeout(updateScrollState, 300);
    return () => clearTimeout(timer);
  }, [activeSlideIdx, updateScrollState]);

  // Track container scroll position and window resizing
  useEffect(() => {
    const el = thumbnailsRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [slides, updateScrollState]);

  // Keyboard navigation for arrow keys (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (slides.length <= 1) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveSlideIdx((prev: number) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveSlideIdx((prev: number) => (prev + 1) % slides.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length, setActiveSlideIdx]);

  const scrollThumbnails = (direction: "left" | "right") => {
    if (thumbnailsRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      thumbnailsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="lg:col-span-7 space-y-4">
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="hex-card-dark bg-[#FFF9E8] border-2 border-primary/50 overflow-hidden shadow-2xl relative w-full flex items-center justify-center group touch-pan-y"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeSlideIdx}
            src={currentSlideImg}
            alt={`${template.title} - Slide ${activeSlideIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full h-auto block select-none rounded-xl"
          />
        </AnimatePresence>

        {/* Prev / Next Slide Navigation Arrows (44px Touch Targets) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveSlideIdx((prev: number) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#111111]/85 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-75 hover:opacity-100 hover:scale-105"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlideIdx((prev: number) => (prev + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#111111]/85 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-75 hover:opacity-100 hover:scale-105"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/90 text-primary border border-primary/40 text-[10px] font-black px-3 py-1 backdrop-blur-md shadow flex items-center gap-1.5 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Slide {activeSlideIdx + 1} of {slides.length}
        </div>

        {!template.is_premium ? (
          <div className="hex-pill-sm absolute top-3 right-3 bg-emerald-600 text-white font-black text-[10px] px-3 py-1 shadow-md flex items-center gap-1 z-10 border border-emerald-700">
            <Download size={11} /> Free Community Deck
          </div>
        ) : (
          <div className="hex-pill-sm absolute top-3 right-3 bg-[#111111]/90 text-[#FCBF14] font-black text-[10px] px-3 py-1 shadow-md flex items-center gap-1 z-10 border border-[#FCBF14]/40 backdrop-blur-md">
            <Crown size={11} className="fill-[#FCBF14]" /> PRO Master Deck
          </div>
        )}
      </div>

      {/* Slide Navigation Thumbnails with Dedicated Scroll Controls */}
      {slides.length > 1 && (
        <div className="space-y-2">
          {/* Header strip with slide counter and navigation hint */}
          <div className="flex items-center justify-between px-1 text-xs text-[#726F6D]">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#111111]">
              <Layers size={13} className="text-primary-amber" />
              <span>All Slides ({slides.length})</span>
            </div>
            <span className="text-[10px] font-semibold text-[#726F6D]">
              Use arrow keys or click to inspect
            </span>
          </div>

          {/* Carousel with Flanking Left & Right Scroll Buttons */}
          <div className="relative flex items-center gap-2">
            {/* Scroll Thumbnails Left Button */}
            <button
              type="button"
              onClick={() => scrollThumbnails("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-[#111111] text-primary border border-primary/40 flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 ${
                canScrollLeft
                  ? "hover:bg-black hover:scale-105 active:scale-95"
                  : "opacity-25 cursor-not-allowed pointer-events-none"
              }`}
              title="Scroll thumbnails left"
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Scrollable Thumbnails Strip */}
            <div
              ref={thumbnailsRef}
              className="flex-1 flex items-center gap-3 overflow-x-auto py-2 px-1 touch-pan-x scroll-smooth custom-slide-scrollbar"
            >
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`relative w-28 sm:w-32 min-h-[44px] rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-[#FFF9E8] group/thumb ${
                    activeSlideIdx === idx
                      ? "border-primary ring-2 ring-primary/40 shadow-lg scale-105"
                      : "border-[#111111]/20 opacity-70 hover:opacity-100 hover:border-primary/60 hover:scale-[1.02]"
                  }`}
                  title={`View Slide ${idx + 1}`}
                  aria-label={`View Slide ${idx + 1}`}
                >
                  <img
                    src={s}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-auto block object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span
                    className={`absolute bottom-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded shadow ${
                      activeSlideIdx === idx
                        ? "bg-primary text-[#111111]"
                        : "bg-black/75 text-white"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  {activeSlideIdx === idx && (
                    <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-primary animate-pulse shadow ring-1 ring-[#111111]" />
                  )}
                </button>
              ))}
            </div>

            {/* Scroll Thumbnails Right Button */}
            <button
              type="button"
              onClick={() => scrollThumbnails("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-[#111111] text-primary border border-primary/40 flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 ${
                canScrollRight
                  ? "hover:bg-black hover:scale-105 active:scale-95"
                  : "opacity-25 cursor-not-allowed pointer-events-none"
              }`}
              title="Scroll thumbnails right"
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

