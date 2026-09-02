import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Flat-top hexagon clip path
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

interface HexagonData {
  id: string;
  type: 'yellow' | 'dark' | 'white';
  title: string;
  subtitle?: string;
  buttonText?: string;
  image?: string;
  x: number;
  y: number;
  driftDown: number; // Downward scroll drift distance
}

export const RecreatedHoneycombCluster: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Scroll animations: cluster drifts down and fades out as user scrolls past hero
  const clusterY = useTransform(scrollYProgress, [0, 0.22], [0, 160]);
  const clusterOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.05]);
  const clusterScale = useTransform(scrollYProgress, [0, 0.22], [1, 0.92]);

  // Hexagon dimensions
  const W = 188;
  const H = 163; // 188 * 0.866

  // Mathematical delta offsets for interlocking flat-top hexagons with clean gap
  const dX = 144;      // 0.75 * W + gap
  const dY = 84;       // 0.5 * H + gap
  const directY = 168; // H + gap

  const hexItems: HexagonData[] = [
    // 1. Center: Startup Pitch Deck (Golden Yellow)
    {
      id: 'center',
      type: 'yellow',
      title: 'Startup Pitch Deck',
      subtitle: 'Series A / Seed',
      buttonText: 'View Deck',
      image: '/portfolio/case_study_a_1.png',
      x: 0,
      y: 0,
      driftDown: 140,
    },
    // 2. Top-Left: BUSINESS PLAN (Obsidian Dark)
    {
      id: 'top-left',
      type: 'dark',
      title: 'BUSINESS PLAN',
      subtitle: 'Financial Models',
      buttonText: 'Read More',
      image: '/portfolio/nike_hsbc_cvs_8.png',
      x: -dX,
      y: -dY,
      driftDown: 180,
    },
    // 3. Top Center: Board Deck (White / Light)
    {
      id: 'top-center',
      type: 'white',
      title: 'Board Deck',
      subtitle: 'Executive Review',
      buttonText: 'Explore',
      image: '/portfolio/case_study_a_14.png',
      x: 0,
      y: -directY,
      driftDown: 200,
    },
    // 4. Top-Right: Keynote 2026 (White / Light)
    {
      id: 'top-right',
      type: 'white',
      title: 'Keynote 2026',
      subtitle: 'Summit Keynote',
      buttonText: 'Preview',
      image: '/portfolio/levis_yuengling_1.png',
      x: dX,
      y: -dY,
      driftDown: 180,
    },
    // 5. Bottom-Left: MARKETING STRATEGY (White / Light)
    {
      id: 'bottom-left',
      type: 'white',
      title: 'MARKETING STRATEGY',
      subtitle: 'Growth Funnels',
      buttonText: 'View Plan',
      image: '/portfolio/case_study_a_2.png',
      x: -dX,
      y: dY,
      driftDown: 110,
    },
    // 6. Bottom Center: Company Profile (White / Light)
    {
      id: 'bottom-center',
      type: 'white',
      title: 'Company Profile',
      subtitle: 'Corporate Overview',
      buttonText: 'Inspect',
      image: '/portfolio/nike_hsbc_cvs_2.png',
      x: 0,
      y: directY,
      driftDown: 90,
    },
    // 7. Bottom-Right: Project Proposal (Obsidian Dark)
    {
      id: 'bottom-right',
      type: 'dark',
      title: 'Project Proposal',
      subtitle: 'Enterprise RFP',
      buttonText: 'Get Quote',
      image: '/portfolio/global_brands_4.png',
      x: dX,
      y: dY,
      driftDown: 110,
    },
  ];

  return (
    <div className="relative w-full h-[540px] max-w-[540px] flex items-center justify-center select-none overflow-visible">
      {/* Cluster Container with Scroll Downward Drift & Fade Out */}
      <motion.div
        style={{
          y: clusterY,
          opacity: clusterOpacity,
          scale: clusterScale,
        }}
        className="relative w-full h-full flex items-center justify-center scale-[0.85] sm:scale-95 lg:scale-100 transition-transform"
      >
        {hexItems.map((hex, idx) => (
          <HexagonCell
            key={hex.id}
            data={hex}
            width={W}
            height={H}
            index={idx}
          />
        ))}
      </motion.div>
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      style={{
        position: 'absolute',
        width,
        height,
        left: '50%',
        top: '50%',
        marginLeft: data.x - width / 2,
        marginTop: data.y - height / 2,
      }}
      className="group cursor-pointer transition-all duration-300 hover:z-30 hover:scale-105"
    >
      {/* 1. Outer Dark Beveled Frame */}
      <div
        className="w-full h-full p-[5px] bg-[#1a202c] shadow-[0_10px_25px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover:bg-[#FCBF14] group-hover:shadow-[0_0_20px_rgba(252,191,20,0.4)]"
        style={{ clipPath: HEX_CLIP }}
      >
        {/* 2. Inner Frame Ring */}
        <div
          className="w-full h-full p-[1.5px] bg-[#0c1018]"
          style={{ clipPath: HEX_CLIP }}
        >
          {/* 3. Hexagon Card Content Body */}
          <div
            className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-center text-center px-4 py-3 ${
              isYellow
                ? 'bg-[#FCBF14] text-[#111111]'
                : isDark
                ? 'bg-gradient-to-br from-[#1c222e] via-[#12161f] to-[#0b0e14] text-white'
                : 'bg-gradient-to-br from-[#ffffff] via-[#faf8f2] to-[#f4eee1] text-[#111111]'
            }`}
            style={{ clipPath: HEX_CLIP }}
          >
            {/* Background Thumbnail Image with Soft Protective Gradient */}
            {data.image && (
              <div className="absolute inset-0 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                <img
                  src={data.image}
                  alt={data.title}
                  className={`w-full h-full object-cover ${
                    isYellow
                      ? 'opacity-20 mix-blend-multiply'
                      : isDark
                      ? 'opacity-25 filter contrast-125'
                      : 'opacity-30'
                  }`}
                />
                <div
                  className={`absolute inset-0 ${
                    isYellow
                      ? 'bg-gradient-to-b from-[#FCBF14]/95 via-[#FCBF14]/85 to-[#FCBF14]/95'
                      : isDark
                      ? 'bg-gradient-to-b from-[#12161f]/95 via-[#12161f]/85 to-[#12161f]/95'
                      : 'bg-gradient-to-b from-[#ffffff]/95 via-[#faf8f2]/85 to-[#f4eee1]/95'
                  }`}
                />
              </div>
            )}

            {/* Centered Content: Title, Subtitle & Action Pill */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-1 max-w-[85%]">
              <h4
                className={`font-heading font-black leading-tight text-xs sm:text-sm tracking-tight ${
                  isYellow || !isDark ? 'text-[#111111]' : 'text-white'
                }`}
              >
                {data.title}
              </h4>
              
              {data.subtitle && (
                <p
                  className={`text-[10px] font-semibold leading-none ${
                    isYellow
                      ? 'text-[#333333]'
                      : isDark
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {data.subtitle}
                </p>
              )}

              {/* Action Button */}
              {data.buttonText && (
                <div className="pt-1.5">
                  <span
                    className={`inline-block text-[8.5px] font-bold px-2.5 py-0.5 rounded-full shadow-sm transition-transform group-hover:scale-105 ${
                      isYellow
                        ? 'bg-[#111111] text-[#FCBF14]'
                        : isDark
                        ? 'bg-[#FCBF14] text-[#111111]'
                        : 'bg-[#111111] text-white'
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
