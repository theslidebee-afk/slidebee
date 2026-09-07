import React from 'react';
import { motion, MotionValue, useTransform, useMotionValue } from 'framer-motion';

interface HoneycombClusterProps {
  scrollYProgress?: MotionValue<number>;
  size?: 'normal' | 'large' | 'compact';
  activeCount?: number; // If manual count is passed
}

// Flat-top hexagon clip path
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

export const HoneycombCluster: React.FC<HoneycombClusterProps> = ({ 
  scrollYProgress,
  size = 'large'
}) => {
  // Scaled dimensions: larger by default
  const isLarge = size === 'large';
  const width = isLarge ? 210 : 170;
  const height = isLarge ? 182 : 148;
  const deltaX = isLarge ? 160 : 130;
  const deltaY = isLarge ? 92 : 75;
  const verticalDelta = isLarge ? 184 : 150;

  const hexItems = [
    // 0: Center (always visible as the initial anchor)
    {
      id: 'center',
      title: 'Startup Pitch Deck',
      subtitle: 'Series A Framework',
      tag: 'FEATURED',
      img: '/portfolio/case_study_a_1.png',
      theme: 'yellow',
      x: 0,
      y: 0,
      initialOffset: { x: 0, y: 0 },
      scrollRange: [0, 0.05],
      step: 1,
    },
    // 1: Top-Left (Business Plan)
    {
      id: 'top-left',
      title: 'BUSINESS PLAN',
      subtitle: 'Financial Models',
      tag: 'STRATEGY',
      img: '/portfolio/nike_hsbc_cvs_1.png',
      theme: 'dark',
      x: -deltaX,
      y: -deltaY,
      initialOffset: { x: -380, y: -180 },
      scrollRange: [0.05, 0.22],
      step: 2,
    },
    // 2: Top (Executive Slides)
    {
      id: 'top',
      title: 'Board Deck',
      subtitle: 'Q3 Executive',
      tag: 'EXECUTIVE',
      img: '/portfolio/global_brands_1.png',
      theme: 'image',
      x: 0,
      y: -verticalDelta,
      initialOffset: { x: 0, y: -350 },
      scrollRange: [0.20, 0.38],
      step: 3,
    },
    // 3: Top-Right (Conference Slide)
    {
      id: 'top-right',
      title: 'Keynote 2026',
      subtitle: 'Annual Summit',
      tag: 'KEYNOTE',
      img: '/portfolio/levis_yuengling_1.png',
      theme: 'image',
      x: deltaX,
      y: -deltaY,
      initialOffset: { x: 380, y: -180 },
      scrollRange: [0.35, 0.52],
      step: 4,
    },
    // 4: Bottom-Left (Marketing Strategy)
    {
      id: 'bottom-left',
      title: 'MARKETING STRATEGY',
      subtitle: 'Growth Funnels',
      tag: 'CAMPAIGN',
      img: '/portfolio/case_study_a_2.png',
      theme: 'light',
      x: -deltaX,
      y: deltaY,
      initialOffset: { x: -380, y: 180 },
      scrollRange: [0.48, 0.65],
      step: 5,
    },
    // 5: Bottom (Company Profile)
    {
      id: 'bottom',
      title: 'Company Profile',
      subtitle: 'Corporate Overview',
      tag: 'ABOUT US',
      img: '/portfolio/nike_hsbc_cvs_2.png',
      theme: 'light',
      x: 0,
      y: verticalDelta,
      initialOffset: { x: 0, y: 350 },
      scrollRange: [0.60, 0.78],
      step: 6,
    },
    // 6: Bottom-Right (Project Proposal)
    {
      id: 'bottom-right',
      title: 'Project Proposal',
      subtitle: 'Enterprise RFP',
      tag: 'PROPOSAL',
      img: '/portfolio/global_brands_4.png',
      theme: 'dark',
      x: deltaX,
      y: deltaY,
      initialOffset: { x: 380, y: 180 },
      scrollRange: [0.72, 0.90],
      step: 7,
    },
  ];

  return (
    <div className={`relative w-full ${isLarge ? 'h-[600px] max-w-[640px]' : 'h-[480px] max-w-[500px]'} mx-auto flex items-center justify-center`}>
      {/* Background faint wireframe honeycomb grid */}
      <div className="absolute inset-0 pointer-events-none opacity-25 z-0">
        <svg viewBox="0 0 600 600" className="w-full h-full stroke-primary fill-none stroke-[2]">
          <path d="M 300 60 L 380 106 L 380 198 L 300 244 L 220 198 L 220 106 Z" opacity="0.4" />
          <path d="M 460 152 L 540 198 L 540 290 L 460 336 L 380 290 L 380 198 Z" opacity="0.5" />
          <path d="M 460 336 L 540 382 L 540 474 L 460 520 L 380 474 L 380 382 Z" opacity="0.4" />
          <path d="M 300 428 L 380 474 L 380 566 L 300 612 L 220 566 L 220 474 Z" opacity="0.5" />
          <path d="M 140 336 L 220 382 L 220 474 L 140 520 L 60 474 L 60 382 Z" opacity="0.4" />
          <path d="M 140 152 L 220 198 L 220 290 L 140 336 L 60 290 L 60 198 Z" opacity="0.5" />
        </svg>
      </div>

      {/* Hexagon Cluster Container */}
      <div className="relative w-full h-full flex items-center justify-center z-10 scale-95 sm:scale-100 transition-transform">
        {hexItems.map((item, index) => (
          <HexagonItem
            key={item.id}
            item={item}
            width={width}
            height={height}
            isCenter={index === 0}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
};

interface HexagonItemProps {
  item: {
    id: string;
    title: string;
    subtitle?: string;
    tag?: string;
    img?: string;
    theme: string;
    x: number;
    y: number;
    initialOffset: { x: number; y: number };
    scrollRange: number[];
  };
  width: number;
  height: number;
  isCenter: boolean;
  scrollYProgress?: MotionValue<number>;
}

const HexagonItem: React.FC<HexagonItemProps> = ({ 
  item, 
  width, 
  height, 
  isCenter, 
  scrollYProgress 
}) => {
  // Unconditional motion hooks to satisfy React Rules of Hooks
  const defaultProgress = useMotionValue(1);
  const activeProgress = scrollYProgress ?? defaultProgress;

  const x = useTransform(
    activeProgress,
    isCenter ? [0, 0.01] : item.scrollRange,
    isCenter ? [0, 0] : [item.x + item.initialOffset.x, item.x]
  );

  const y = useTransform(
    activeProgress,
    isCenter ? [0, 0.01] : item.scrollRange,
    isCenter ? [0, 0] : [item.y + item.initialOffset.y, item.y]
  );

  const opacity = useTransform(
    activeProgress,
    isCenter ? [0, 0.01] : [item.scrollRange[0], item.scrollRange[0] + 0.08],
    isCenter ? [1, 1] : [0, 1]
  );

  const scale = useTransform(
    activeProgress,
    isCenter ? [0, 0.01] : [item.scrollRange[0], item.scrollRange[1]],
    isCenter ? [1, 1] : [0.65, 1]
  );

  // Background styling
  let bgClasses = 'bg-[#181d28] border-[#FCBF14]/40 text-white';
  if (item.theme === 'yellow') {
    bgClasses = 'bg-[#FCBF14] text-[#111111] shadow-[0_15px_40px_rgba(252,191,20,0.6)]';
  } else if (item.theme === 'light') {
    bgClasses = 'bg-[#FFF9E8] text-[#111111] shadow-xl';
  } else if (item.theme === 'dark') {
    bgClasses = 'bg-[#151a24] text-white border border-[#FCBF14]/30 shadow-2xl';
  }

  return (
    <motion.div
      style={{
        position: 'absolute',
        width,
        height,
        x,
        y,
        opacity,
        scale,
      }}
      className="group cursor-pointer select-none"
    >
      {/* Outer Hexagon Clipping Border */}
      <div
        className="w-full h-full p-[3px] transition-transform duration-300 group-hover:scale-105"
        style={{
          clipPath: HEX_CLIP,
          backgroundColor: item.theme === 'yellow' ? '#FCBF14' : 'rgba(252, 191, 20, 0.45)',
        }}
      >
        {/* Inner Content Hexagon */}
        <div
          className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-4 ${bgClasses}`}
          style={{ clipPath: HEX_CLIP }}
        >
          {/* Background image preview */}
          {item.img && (
            <div className="absolute inset-0 z-0">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity group-hover:scale-110 duration-500"
              />
              <div
                className={`absolute inset-0 ${
                  item.theme === 'yellow'
                    ? 'bg-[#FCBF14]/70 mix-blend-multiply'
                    : item.theme === 'light'
                    ? 'bg-[#FFF9E8]/85'
                    : 'bg-gradient-to-b from-[#151a24]/90 via-[#151a24]/75 to-[#151a24]/95'
                }`}
              />
            </div>
          )}

          {/* Top Tag / Badge */}
          <div className="relative z-10 flex items-center justify-between">
            {item.tag && (
              <span
                className={`text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase ${
                  item.theme === 'yellow'
                    ? 'bg-[#111111] text-[#FCBF14]'
                    : item.theme === 'light'
                    ? 'bg-[#FCBF14] text-[#111111]'
                    : 'bg-[#FCBF14]/25 text-[#FCBF14] border border-[#FCBF14]/40'
                }`}
              >
                {item.tag}
              </span>
            )}
            {isCenter && (
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111111] bg-white/70 px-2 py-0.5 rounded ml-auto">
                START
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="relative z-10 mt-auto pb-1 text-center">
            <h4
              className={`font-heading font-black leading-tight text-sm md:text-base tracking-tight ${
                item.theme === 'yellow' || item.theme === 'light' ? 'text-[#111111]' : 'text-white'
              }`}
            >
              {item.title}
            </h4>
            {item.subtitle && (
              <p
                className={`text-[11px] font-medium leading-none mt-1 opacity-85 ${
                  item.theme === 'yellow' || item.theme === 'light' ? 'text-[#333333]' : 'text-gray-300'
                }`}
              >
                {item.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
