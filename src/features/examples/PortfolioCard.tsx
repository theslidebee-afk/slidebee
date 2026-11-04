import React, { useState, useEffect } from "react";
import { type PortfolioItem, getSlideSet, STORAGE_BASE } from "./types";

interface PortfolioCardProps {
  item: PortfolioItem;
  onSelect: (item: PortfolioItem, selectedSlide: number) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  item,
  onSelect
}) => {
  const slides = getSlideSet(item);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setActiveIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  return (
    <div
      onClick={() => onSelect(item, activeIdx)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      {/* Direction 2: Framed Presentation Canvas (Inset Slide Mockup) */}
      <div className="p-3 sm:p-3.5 bg-[#FFF9E8]/75 border-b border-primary/20 relative">
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white shadow-sm border border-[#111111]/10 group-hover:shadow-md transition-all duration-300">
          {/* Active Slide with smooth fade */}
          <img
            src={slides[activeIdx]}
            alt={`${item.title} - Slide ${activeIdx + 1}`}
            className="w-full h-full object-contain bg-white group-hover:scale-102 transition-all duration-500"
            loading="lazy"
            onError={(e) => {
              const fallback = `${STORAGE_BASE}/accenture_slide-1.jpg`;
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />

          {/* 3-Slide Hover Indicator Pill */}
          <div
            className={`hex-pill-sm absolute top-2 right-2 bg-[#111111]/85 text-white text-[9px] font-extrabold px-2 py-0.5 backdrop-blur-sm transition-all duration-300 z-10 flex items-center gap-1 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Slide {activeIdx + 1} / {slides.length}
          </div>

          {/* Bottom Pagination Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-[#111111]/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(i);
                }}
                className={`rounded-full transition-all duration-300 ${
                  activeIdx === i
                    ? "w-3.5 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 pt-3.5">
        {/* Header row: Client + Category (Off the slide canvas) */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-amber">
            {item.category}
          </span>
          <span className="bg-[#111111] text-primary text-[9px] font-black px-2.5 py-0.5 rounded-full">
            {item.client}
          </span>
        </div>

        <h3 className="font-heading font-extrabold text-base text-[#111111] mb-2 leading-snug group-hover:text-primary-amber transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-[#726F6D] font-medium line-clamp-2 leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#111111]/8">
          {item.highlights.slice(0, 2).map((h, i) => (
            <span
              key={i}
              className="text-[10px] bg-[#FFF9E8] border border-primary/20 text-[#111111] font-bold px-2 py-0.5 rounded"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
