import type { TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Crown } from "lucide-react";
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
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlideIdx((prev: number) => (prev + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[#111111]/85 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-75 hover:opacity-100 hover:scale-105"
              title="Next Slide"
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

      {/* Slide Navigation Thumbnails (Touch Momentum Scroll) */}
      {slides.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlideIdx(idx)}
              className={`relative w-28 min-h-[44px] rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-[#FFF9E8] ${
                activeSlideIdx === idx
                  ? "border-primary shadow-md scale-105"
                  : "border-[#111111]/15 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={s} alt={`Slide ${idx + 1}`} className="w-full h-auto block object-cover" />
              <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
