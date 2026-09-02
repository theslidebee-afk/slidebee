import React from 'react';
import { motion } from 'framer-motion';

// Flat-top hexagon clip path
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

interface HexagonData {
  id: string;
  type: 'yellow' | 'dark' | 'white';
  title: string;
  categoryTag?: string;
  badge?: string;
  hasButton?: boolean;
  buttonText?: string;
  image?: string;
  imagePosition?: 'right' | 'top' | 'bottom';
  x: number;
  y: number;
}

export const RecreatedHoneycombCluster: React.FC = () => {
  // Dimensions for each hexagon
  const W = 210;
  const H = 182; // 210 * 0.866

  // Spacing offsets with slight gap for dark borders
  const deltaX = 162; // 0.75 * W + gap
  const deltaY = 94;  // 0.5 * H + gap
  const deltaYDirect = 188; // H + gap

  const hexItems: HexagonData[] = [
    // 1. Center: Startup Pitch Deck (Golden Yellow)
    {
      id: 'center',
      type: 'yellow',
      title: 'Startup Pitch Deck',
      categoryTag: 'PRESENTATION',
      badge: 'FEATURED',
      hasButton: true,
      buttonText: 'View Deck',
      image: '/portfolio/case_study_a_1.png',
      imagePosition: 'right',
      x: 0,
      y: 0,
    },
    // 2. Top-Left: BUSINESS PLAN (Obsidian Dark)
    {
      id: 'top-left',
      type: 'dark',
      title: 'BUSINESS PLAN',
      categoryTag: 'STRATEGY',
      badge: 'DECK 01',
      hasButton: true,
      buttonText: 'Read More',
      image: '/portfolio/nike_hsbc_cvs_8.png',
      imagePosition: 'bottom',
      x: -deltaX,
      y: -deltaY,
    },
    // 3. Top Center: Architecture / Keynote (White / Cream)
    {
      id: 'top-center',
      type: 'white',
      title: 'Design Architecture',
      categoryTag: 'PORTFOLIO',
      badge: 'PRO',
      hasButton: true,
      buttonText: 'Explore',
      image: '/portfolio/case_study_a_14.png',
      imagePosition: 'top',
      x: 0,
      y: -deltaYDirect,
    },
    // 4. Top-Right: Brand / Global Keynote (White / Cream)
    {
      id: 'top-right',
      type: 'white',
      title: 'Brand Showcase',
      categoryTag: 'MARKETING',
      badge: 'NEW',
      hasButton: true,
      buttonText: 'Preview',
      image: '/portfolio/levis_yuengling_1.png',
      imagePosition: 'bottom',
      x: deltaX,
      y: -deltaY,
    },
    // 5. Bottom-Left: MARKETING STRATEGY (White / Cream with yellow accents)
    {
      id: 'bottom-left',
      type: 'white',
      title: 'MARKETING STRATEGY',
      categoryTag: 'GROWTH',
      badge: 'Q3 PLAN',
      hasButton: true,
      buttonText: 'View Plan',
      image: '/portfolio/case_study_a_2.png',
      imagePosition: 'bottom',
      x: -deltaX,
      y: deltaY,
    },
    // 6. Bottom Center: Company Profile (White / Cream)
    {
      id: 'bottom-center',
      type: 'white',
      title: 'Company Profile',
      categoryTag: 'CORPORATE',
      badge: 'OVERVIEW',
      hasButton: true,
      buttonText: 'Inspect',
      image: '/portfolio/nike_hsbc_cvs_2.png',
      imagePosition: 'bottom',
      x: 0,
      y: deltaYDirect,
    },
    // 7. Bottom-Right: Project Proposal (Obsidian Dark)
    {
      id: 'bottom-right',
      type: 'dark',
      title: 'Project Proposal',
      categoryTag: 'ENTERPRISE',
      badge: 'RFP READY',
      hasButton: true,
      buttonText: 'Get Quote',
      image: '/portfolio/global_brands_4.png',
      imagePosition: 'right',
      x: deltaX,
      y: deltaY,
    },
  ];

  return (
    <div className="relative w-full h-[580px] max-w-[580px] flex items-center justify-center select-none">
      
      {/* Background ambient golden wireframe lines */}
      <div className="absolute -top-12 -right-12 w-[600px] h-[600px] pointer-events-none opacity-25 z-0">
        <svg viewBox="0 0 600 600" className="w-full h-full stroke-primary fill-none stroke-[1.5]">
          <path d="M 300 30 L 385 79 L 385 177 L 300 226 L 215 177 L 215 79 Z" />
          <path d="M 470 128 L 555 177 L 555 275 L 470 324 L 385 275 L 385 177 Z" />
          <path d="M 470 324 L 555 373 L 555 471 L 470 520 L 385 471 L 385 373 Z" />
          <path d="M 300 422 L 385 471 L 385 569 L 300 618 L 215 569 L 215 471 Z" />
          <path d="M 130 324 L 215 373 L 215 471 L 130 520 L 45 471 L 45 373 Z" />
          <path d="M 130 128 L 215 177 L 215 275 L 130 324 L 45 275 L 45 177 Z" />
        </svg>
      </div>

      {/* Hexagon Cluster Container */}
      <div className="relative w-full h-full flex items-center justify-center z-10 scale-[0.88] sm:scale-100 transition-transform">
        {hexItems.map((hex, idx) => (
          <HexagonCell
            key={hex.id}
            data={hex}
            width={W}
            height={H}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
};

interface HexagonCellProps {
  data: HexagonData;
  width: number;
  height: number;
  index: number;
}

const HexagonCell: React.FC<HexagonCellProps> = ({ data, width, height, index }) => {
  const isYellow = data.type === 'yellow';
  const isDark = data.type === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      style={{
        position: 'absolute',
        width,
        height,
        transform: `translate(${data.x}px, ${data.y}px)`,
      }}
      className="group cursor-pointer transition-all duration-300 hover:z-30 hover:scale-105"
    >
      {/* 1. Outer Dark Beveled Frame (The thick border shown in the PPT slide) */}
      <div
        className="w-full h-full p-[7px] bg-[#1a202c] shadow-[0_12px_30px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:bg-[#FCBF14]/80 group-hover:shadow-[0_0_25px_rgba(252,191,20,0.4)]"
        style={{ clipPath: HEX_CLIP }}
      >
        {/* 2. Inner Sub-border line */}
        <div
          className="w-full h-full p-[2px] bg-[#0e121a]"
          style={{ clipPath: HEX_CLIP }}
        >
          {/* 3. Hexagon Inner Content Canvas */}
          <div
            className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-3.5 ${
              isYellow
                ? 'bg-[#FCBF14] text-[#111111]'
                : isDark
                ? 'bg-gradient-to-br from-[#1c222e] via-[#12161f] to-[#0b0e14] text-white'
                : 'bg-gradient-to-br from-[#ffffff] via-[#faf8f2] to-[#f4eee1] text-[#111111]'
            }`}
            style={{ clipPath: HEX_CLIP }}
          >
            {/* Background Image / Thumbnail Placeholder */}
            {data.image && (
              <div
                className={`absolute inset-0 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-110 ${
                  data.imagePosition === 'right'
                    ? 'left-1/3'
                    : data.imagePosition === 'top'
                    ? '-top-4'
                    : 'top-1/3'
                }`}
              >
                <img
                  src={data.image}
                  alt={data.title}
                  className={`w-full h-full object-cover ${
                    isYellow
                      ? 'opacity-35 mix-blend-multiply'
                      : isDark
                      ? 'opacity-40 filter contrast-125'
                      : 'opacity-50'
                  }`}
                />
                <div
                  className={`absolute inset-0 ${
                    isYellow
                      ? 'bg-gradient-to-r from-[#FCBF14] via-[#FCBF14]/80 to-transparent'
                      : isDark
                      ? 'bg-gradient-to-t from-[#12161f] via-[#12161f]/80 to-transparent'
                      : 'bg-gradient-to-t from-[#f4eee1] via-[#f4eee1]/70 to-transparent'
                  }`}
                />
              </div>
            )}

            {/* Top Row: Mini Tag / Pill */}
            <div className="relative z-10 flex items-center justify-between">
              <span
                className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isYellow
                    ? 'bg-[#111111] text-[#FCBF14]'
                    : isDark
                    ? 'bg-[#FCBF14]/20 text-[#FCBF14] border border-[#FCBF14]/30'
                    : 'bg-[#FCBF14] text-[#111111]'
                }`}
              >
                {data.categoryTag}
              </span>
              {data.badge && (
                <span
                  className={`text-[8px] font-extrabold tracking-wide uppercase px-1 rounded ${
                    isYellow
                      ? 'text-[#111111]/70 bg-white/40'
                      : isDark
                      ? 'text-gray-400 bg-white/5'
                      : 'text-gray-600 bg-black/5'
                  }`}
                >
                  {data.badge}
                </span>
              )}
            </div>

            {/* Wireframe Mini Slide Bars / Placeholder lines */}
            <div className="relative z-10 my-auto py-1 space-y-1 max-w-[70%]">
              <div
                className={`h-1 rounded-full ${
                  isYellow ? 'bg-black/20 w-3/4' : isDark ? 'bg-white/15 w-3/4' : 'bg-black/15 w-3/4'
                }`}
              />
              <div
                className={`h-1 rounded-full ${
                  isYellow ? 'bg-black/15 w-1/2' : isDark ? 'bg-white/10 w-1/2' : 'bg-black/10 w-1/2'
                }`}
              />
            </div>

            {/* Bottom Row: Title & Action */}
            <div className="relative z-10 pt-1 border-t border-black/5 dark:border-white/5">
              <h4
                className={`font-heading font-black leading-tight text-xs tracking-tight ${
                  isYellow || !isDark ? 'text-[#111111]' : 'text-white'
                }`}
              >
                {data.title}
              </h4>
              
              {data.hasButton && (
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isYellow
                        ? 'bg-[#111111] text-[#FCBF14]'
                        : isDark
                        ? 'bg-[#FCBF14] text-[#111111]'
                        : 'bg-[#FCBF14] text-[#111111]'
                    }`}
                  >
                    {data.buttonText} →
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
