import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Flat-top hexagon clip path
const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

export const PageHoneycombJourney: React.FC = () => {
  const { scrollYProgress } = useScroll();

  // Milestones mapping to 7 hexagons
  // Scroll ranges:
  // Hex 1 (Hero): 0 - 0.2
  // Hex 2 (Before/After): 0.15 - 0.35
  // Hex 3 (Features): 0.35 - 0.55
  // Hex 4 (Features): 0.45 - 0.65
  // Hex 5 (Portfolio): 0.60 - 0.80
  // Hex 6 (Portfolio): 0.70 - 0.88
  // Hex 7 (Contact): 0.85 - 1.0

  const miniHexagons = [
    { id: 'center', label: '1. Hero', color: '#FCBF14', x: 0, y: 0, threshold: 0.0 },
    { id: 'top-left', label: '2. Before/After', color: '#FFFFFF', x: -22, y: -13, threshold: 0.18 },
    { id: 'top', label: '3. Pillars', color: '#FCBF14', x: 0, y: -26, threshold: 0.35 },
    { id: 'top-right', label: '4. Speed', color: '#FFFFFF', x: 22, y: -13, threshold: 0.50 },
    { id: 'bottom-left', label: '5. Work', color: '#FCBF14', x: -22, y: 13, threshold: 0.65 },
    { id: 'bottom', label: '6. Quality', color: '#FFFFFF', x: 0, y: 26, threshold: 0.78 },
    { id: 'bottom-right', label: '7. Finalize', color: '#FCBF14', x: 22, y: 13, threshold: 0.88 },
  ];

  // Calculate percentage completed
  const progressPercent = useTransform(scrollYProgress, [0, 1], [14, 100]);

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 bg-[#111622]/90 backdrop-blur-xl border border-primary/30 p-3.5 rounded-2xl shadow-2xl shadow-primary/10">
      {/* Mini Assembling Honeycomb Visualization */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {miniHexagons.map((hex) => (
          <MiniHex
            key={hex.id}
            hex={hex}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>

      {/* Info Pill */}
      <div className="flex flex-col pr-2">
        <div className="flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Hive Assembly</span>
        </div>
        <div className="text-white font-heading font-extrabold text-sm">
          <motion.span>{useTransform(progressPercent, (v) => `${Math.round(v)}%`)}</motion.span> Complete
        </div>
        <p className="text-[10px] text-gray-400 font-light mt-0.5">
          Scroll to lock all 7 hexagons
        </p>
      </div>
    </div>
  );
};

interface MiniHexProps {
  hex: {
    id: string;
    label: string;
    color: string;
    x: number;
    y: number;
    threshold: number;
  };
  scrollYProgress: any;
}

const MiniHex: React.FC<MiniHexProps> = ({ hex, scrollYProgress }) => {
  const scale = useTransform(
    scrollYProgress,
    [Math.max(0, hex.threshold - 0.08), hex.threshold],
    [0.3, 1]
  );

  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, hex.threshold - 0.08), hex.threshold],
    [0.2, 1]
  );

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: 26,
        height: 22.5,
        x: hex.x,
        y: hex.y,
        scale,
        opacity,
        clipPath: HEX_CLIP,
        backgroundColor: hex.color,
      }}
      className="transition-shadow duration-300"
    >
      <div 
        className="w-full h-full bg-[#111622]/40 hover:bg-transparent transition-colors"
        style={{ clipPath: HEX_CLIP }}
      />
    </motion.div>
  );
};
