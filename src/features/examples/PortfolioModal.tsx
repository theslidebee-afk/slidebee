import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ArrowRight, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { type PortfolioItem, getSlideSet, normalizeSlideUrl, STORAGE_BASE } from "./types";

interface PortfolioModalProps {
  item: PortfolioItem | null;
  activeSlide: number;
  onClose: () => void;
  onSelectSlide: (index: number) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  item,
  activeSlide,
  onClose,
  onSelectSlide
}) => {
  useEffect(() => {
    if (!item) return;
    const modalSlides = getSlideSet(item);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onSelectSlide((activeSlide - 1 + modalSlides.length) % modalSlides.length);
      } else if (e.key === "ArrowRight") {
        onSelectSlide((activeSlide + 1) % modalSlides.length);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, activeSlide, onClose, onSelectSlide]);

  if (!item) return null;

  const modalSlides = getSlideSet(item);
  const currentSlideImg = normalizeSlideUrl(modalSlides[activeSlide] || item.image);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="hex-card-lg bg-white border-2 border-primary/50 p-6 sm:p-8 max-w-4xl w-full shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111111] transition-colors hex-pill bg-black/5 hover:bg-black/10 cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Main Slide Viewer */}
          <div>
            <div className="w-full bg-[#FFF9E8] rounded-2xl overflow-hidden mb-4 shadow-inner relative flex items-center justify-center border-2 border-primary/40 group/viewer">
              <img
                src={currentSlideImg}
                alt={`${item.title} - Slide ${activeSlide + 1}`}
                className="w-full h-auto block select-none rounded-xl"
                onError={(e) => {
                  const fallback = `${STORAGE_BASE}/accenture_slide-1.jpg`;
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
              />

              {/* Slide Indicator Badge */}
              <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/85 text-primary border border-primary/30 text-[10px] font-black px-3 py-1 backdrop-blur-sm shadow z-10">
                Slide {activeSlide + 1} of {modalSlides.length}
              </div>

              {/* Prev Slide Arrow */}
              {modalSlides.length > 1 && (
                <button
                  type="button"
                  onClick={() => onSelectSlide((activeSlide - 1 + modalSlides.length) % modalSlides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111]/80 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-80 hover:opacity-100 hover:scale-110"
                  title="Previous Slide (or Left Arrow key)"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Next Slide Arrow */}
              {modalSlides.length > 1 && (
                <button
                  type="button"
                  onClick={() => onSelectSlide((activeSlide + 1) % modalSlides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111]/80 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-80 hover:opacity-100 hover:scale-110"
                  title="Next Slide (or Right Arrow key)"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Slide Thumbnails Selector Gallery */}
            {modalSlides.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-6 custom-scrollbar">
                {modalSlides.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSlide(idx)}
                    className={`hex-card overflow-hidden text-left p-1 border transition-all shrink-0 w-28 sm:w-32 cursor-pointer ${
                      activeSlide === idx
                        ? "border-primary ring-2 ring-primary/40 bg-[#FFF9E8]"
                        : "border-primary/25 hover:border-primary/60 bg-white"
                    }`}
                  >
                    <div className="aspect-[16/10] bg-[#111111] rounded overflow-hidden mb-1">
                      <img src={normalizeSlideUrl(s)} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-extrabold text-[#111111] truncate">
                        Slide {idx + 1}
                      </span>
                      {activeSlide === idx && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary/20 mb-4">
            <div>
              <div className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/25 text-[10px] font-black px-3 py-1 uppercase tracking-wider mb-2">
                {item.client} • {item.category}
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-[#111111]">
                {item.title}
              </h2>
            </div>

            <Link
              to={`/ordernow?ref=${encodeURIComponent(item.title)}`}
              className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-3 text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              Request Similar Design <ArrowRight size={15} />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
            {item.description}
          </p>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#111111] block mb-2">
              Key Design Deliverables:
            </span>
            <div className="flex flex-wrap gap-2">
              {item.highlights.map((h, i) => (
                <span
                  key={i}
                  className="hex-pill bg-[#FFF9E8] border border-primary/30 text-xs text-[#111111] font-bold px-3 py-1 inline-flex items-center gap-1.5"
                >
                  <Check size={11} className="text-emerald-600" /> {h}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
