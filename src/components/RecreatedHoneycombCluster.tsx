import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Flat-top hexagon clip path
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

interface HexagonData {
  id: string;
  type: 'yellow' | 'dark' | 'white';
  title: string;
  categoryTag?: string;
  badge?: string;
  buttonText?: string;
  image?: string;
  x: number;
  y: number;
  scatterX: number; // Direction & distance to scatter on scroll
  scatterY: number;
  scatterRotate: number;
}

export const RecreatedHoneycombCluster: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Hexagon base dimensions
  const W = 180;
  const H = 156;

  // Geometry grid steps
  const dX = 138;
  const dY = 80;
  const directY = 160;

  const hexItems: HexagonData[] = [
    // 1. Center (Ring 0): Startup Pitch Deck (Golden Yellow)
    {
      id: 'center',
      type: 'yellow',
      title: 'Startup Pitch Deck',
      categoryTag: 'VENTURE',
      badge: 'FEATURED',
      buttonText: 'View Deck',
      image: '/portfolio/case_study_a_1.png',
      x: 0,
      y: 0,
      scatterX: 0,
      scatterY: 80,
      scatterRotate: 5,
    },
    // 2. Top-Left: BUSINESS PLAN (Obsidian Dark)
    {
      id: 'top-left',
      type: 'dark',
      title: 'BUSINESS PLAN',
      categoryTag: 'STRATEGY',
      badge: 'DECK 01',
      buttonText: 'Read More',
      image: '/portfolio/nike_hsbc_cvs_8.png',
      x: -dX,
      y: -dY,
      scatterX: -260,
      scatterY: -180,
      scatterRotate: -15,
    },
    // 3. Top Center: Executive Board Deck (White / Cream)
    {
      id: 'top-center',
      type: 'white',
      title: 'Board Deck',
      categoryTag: 'EXECUTIVE',
      badge: 'Q3',
      buttonText: 'Explore',
      image: '/portfolio/case_study_a_14.png',
      x: 0,
      y: -directY,
      scatterX: 0,
      scatterY: -280,
      scatterRotate: -8,
    },
    // 4. Top-Right: Keynote & Summit (White / Cream)
    {
      id: 'top-right',
      type: 'white',
      title: 'Keynote 2026',
      categoryTag: 'KEYNOTE',
      badge: 'ANNUAL',
      buttonText: 'Preview',
      image: '/portfolio/levis_yuengling_1.png',
      x: dX,
      y: -dY,
      scatterX: 260,
      scatterY: -180,
      scatterRotate: 15,
    },
    // 5. Bottom-Left: MARKETING STRATEGY (White / Cream)
    {
      id: 'bottom-left',
      type: 'white',
      title: 'MARKETING STRATEGY',
      categoryTag: 'GROWTH',
      badge: 'FUNNELS',
      buttonText: 'View Plan',
      image: '/portfolio/case_study_a_2.png',
      x: -dX,
      y: dY,
      scatterX: -260,
      scatterY: 200,
      scatterRotate: -12,
    },
    // 6. Bottom Center: Company Profile (White / Cream)
    {
      id: 'bottom-center',
      type: 'white',
      title: 'Company Profile',
      categoryTag: 'CORPORATE',
      badge: 'OVERVIEW',
      buttonText: 'Inspect',
      image: '/portfolio/nike_hsbc_cvs_2.png',
      x: 0,
      y: directY,
      scatterX: 0,
      scatterY: 280,
      scatterRotate: 10,
    },
    // 7. Bottom-Right: Project Proposal (Obsidian Dark)
    {
      id: 'bottom-right',
      type: 'dark',
      title: 'Project Proposal',
      categoryTag: 'ENTERPRISE',
      badge: 'RFP READY',
      buttonText: 'Get Quote',
      image: '/portfolio/global_brands_4.png',
      x: dX,
      y: dY,
      scatterX: 260,
      scatterY: 200,
      scatterRotate: 18,
    },
    // 8. Far Left (Ring 2): Financial Models (Obsidian Dark)
    {
      id: 'far-left',
      type: 'dark',
      title: 'Financial Model',
      categoryTag: 'FINANCE',
      badge: 'CAPITAL',
      buttonText: 'Review',
      image: '/portfolio/nike_hsbc_cvs_8.png',
      x: -dX * 2,
      y: 0,
      scatterX: -380,
      scatterY: 20,
      scatterRotate: -20,
    },
    // 9. Far Right (Ring 2): Tech Architecture (White / Cream)
    {
      id: 'far-right',
      type: 'white',
      title: 'Tech Architecture',
      categoryTag: 'SYSTEMS',
      badge: 'CLOUD',
      buttonText: 'Architecture',
      image: '/portfolio/levis_yuengling_6.png',
      x: dX * 2,
      y: 0,
      scatterX: 380,
      scatterY: 20,
      scatterRotate: 20,
    },
    // 10. Far Top-Right: Product Rollout (Obsidian Dark)
    {
      id: 'far-top-right',
      type: 'dark',
      title: 'Product Launch',
      categoryTag: 'ROLLOUT',
      badge: 'GTM',
      buttonText: 'GTM Plan',
      image: '/portfolio/global_brands_1.png',
      x: dX,
      y: -directY - dY / 2,
      scatterX: 320,
      scatterY: -320,
      scatterRotate: 25,
    },
    // 11. Far Top-Left: Brand Guidelines (White / Cream)
    {
      id: 'far-top-left',
      type: 'white',
      title: 'Brand System',
      categoryTag: 'IDENTITY',
      badge: 'GUIDE',
      buttonText: 'Design Kit',
      image: '/portfolio/nike_hsbc_cvs_12.png',
      x: -dX,
      y: -directY - dY / 2,
      scatterX: -320,
      scatterY: -320,
      scatterRotate: -25,
    },
  ];

  return (
    <div className="relative w-full h-[620px] max-w-[620px] flex items-center justify-center select-none overflow-visible">
      {/* Hexagon Cluster Container */}
      <div className="relative w-full h-full flex items-center justify-center scale-[0.80] sm:scale-95 lg:scale-100 transition-transform">
        {hexItems.map((hex) => (
          <HexagonCell
            key={hex.id}
            data={hex}
            width={W}
            height={H}
            scrollYProgress={scrollYProgress}
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
  scrollYProgress: any;
}

const HexagonCell: React.FC<HexagonCellProps> = ({ data, width, height, scrollYProgress }) => {
  const isYellow = data.type === 'yellow';
  const isDark = data.type === 'dark';

  // Scroll scatter transforms: as user scrolls down [0, 0.4], hexagons move outward in their own direction
  const x = useTransform(scrollYProgress, [0, 0.35], [data.x, data.x + data.scatterX]);
  const y = useTransform(scrollYProgress, [0, 0.35], [data.y, data.y + data.scatterY]);
  const rotate = useTransform(scrollYProgress, [0, 0.35], [0, data.scatterRotate]);
  const opacity = useTransform(scrollYProgress, [0, 0.28, 0.38], [1, 0.85, 0.15]);
  const scale = useTransform(scrollYProgress, [0, 0.35], [1, 0.8]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        width,
        height,
        x,
        y,
        rotate,
        opacity,
        scale,
        // Center alignment offset
        left: '50%',
        top: '50%',
        marginLeft: -width / 2,
        marginTop: -height / 2,
      }}
      className="group cursor-pointer transition-shadow duration-300 hover:z-40 hover:scale-110"
    >
      {/* 1. Outer Dark Beveled Border (Replicating the thick dark frame) */}
      <div
        className="w-full h-full p-[6px] bg-[#161c27] shadow-[0_12px_28px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:bg-[#FCBF14] group-hover:shadow-[0_0_25px_rgba(252,191,20,0.5)]"
        style={{ clipPath: HEX_CLIP }}
      >
        {/* 2. Inner Frame Ring */}
        <div
          className="w-full h-full p-[1.5px] bg-[#0c1018]"
          style={{ clipPath: HEX_CLIP }}
        >
          {/* 3. Hexagon Card Content */}
          <div
            className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-3 ${
              isYellow
                ? 'bg-[#FCBF14] text-[#111111]'
                : isDark
                ? 'bg-gradient-to-br from-[#1c222e] via-[#12161f] to-[#0b0e14] text-white'
                : 'bg-gradient-to-br from-[#ffffff] via-[#faf8f2] to-[#f4eee1] text-[#111111]'
            }`}
            style={{ clipPath: HEX_CLIP }}
          >
            {/* Background Slide Image / Placeholder */}
            {data.image && (
              <div className="absolute inset-0 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                <img
                  src={data.image}
                  alt={data.title}
                  className={`w-full h-full object-cover ${
                    isYellow
                      ? 'opacity-35 mix-blend-multiply'
                      : isDark
                      ? 'opacity-40 filter contrast-125'
                      : 'opacity-45'
                  }`}
                />
                <div
                  className={`absolute inset-0 ${
                    isYellow
                      ? 'bg-gradient-to-r from-[#FCBF14] via-[#FCBF14]/85 to-transparent'
                      : isDark
                      ? 'bg-gradient-to-t from-[#12161f] via-[#12161f]/85 to-transparent'
                      : 'bg-gradient-to-t from-[#f4eee1] via-[#f4eee1]/75 to-transparent'
                  }`}
                />
              </div>
            )}

            {/* Top Row: Mini Tag / Pill */}
            <div className="relative z-10 flex items-center justify-between">
              <span
                className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isYellow
                    ? 'bg-[#111111] text-[#FCBF14]'
                    : isDark
                    ? 'bg-[#FCBF14]/25 text-[#FCBF14] border border-[#FCBF14]/30'
                    : 'bg-[#FCBF14] text-[#111111]'
                }`}
              >
                {data.categoryTag}
              </span>
              {data.badge && (
                <span
                  className={`text-[7.5px] font-extrabold tracking-wide uppercase px-1 rounded ${
                    isYellow
                      ? 'text-[#111111]/70 bg-white/50'
                      : isDark
                      ? 'text-gray-400 bg-white/5'
                      : 'text-gray-600 bg-black/5'
                  }`}
                >
                  {data.badge}
                </span>
              )}
            </div>

            {/* Wireframe Mini Slide Bars */}
            <div className="relative z-10 my-auto py-0.5 space-y-1 max-w-[70%]">
              <div
                className={`h-0.5 rounded-full ${
                  isYellow ? 'bg-black/25 w-3/4' : isDark ? 'bg-white/20 w-3/4' : 'bg-black/20 w-3/4'
                }`}
              />
              <div
                className={`h-0.5 rounded-full ${
                  isYellow ? 'bg-black/15 w-1/2' : isDark ? 'bg-white/10 w-1/2' : 'bg-black/10 w-1/2'
                }`}
              />
            </div>

            {/* Bottom Row: Title & Action */}
            <div className="relative z-10 pt-1 border-t border-black/5 dark:border-white/5">
              <h4
                className={`font-heading font-black leading-tight text-[11px] sm:text-xs tracking-tight ${
                  isYellow || !isDark ? 'text-[#111111]' : 'text-white'
                }`}
              >
                {data.title}
              </h4>
              
              {data.buttonText && (
                <div className="mt-0.5 flex items-center gap-1">
                  <span
                    className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
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
