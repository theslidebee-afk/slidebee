import React, { useMemo } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface HoneycombBackgroundProps {
  scrollYProgress: MotionValue<number>;
}

// Flat-top hexagon clip path
const HEX_CLIP_PATH = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

export const HoneycombBackground: React.FC<HoneycombBackgroundProps> = ({ scrollYProgress }) => {
  // Generate hexagon grid positions
  const hexGrid = useMemo(() => {
    const grid = [];
    const rows = 9;
    const cols = 9;
    
    // Hexagon dimensions
    const hexWidth = 100;
    const hexHeight = 115.47; // hexWidth / Math.sqrt(3) * 2;
    const xOffset = hexWidth * 0.75;
    const yOffset = hexHeight;

    // Center coordinates
    const centerX = 4;
    const centerY = 4;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Offset odd columns down by half a height
        const isOddCol = c % 2 !== 0;
        const x = c * xOffset;
        const y = r * yOffset + (isOddCol ? yOffset / 2 : 0);

        // Calculate distance from center to order the animation
        const distFromCenter = Math.sqrt(Math.pow(c - centerX, 2) + Math.pow(r - centerY, 2));
        
        // Stagger appearance: alternating left/right
        let sideModifier = c < centerX ? 1 : 2; // Left side vs Right side
        if (c === centerX) sideModifier = 0;
        
        const appearOrder = distFromCenter * 2 + (c % 2 === 0 ? 0.5 : 0) + (sideModifier * 0.2);

        grid.push({
          id: `hex-${r}-${c}`,
          x,
          y,
          dist: distFromCenter,
          order: appearOrder,
          col: c,
          row: r,
          isCenter: c === centerX && r === centerY
        });
      }
    }

    // Sort by appearance order to easily map them to scroll progress
    grid.sort((a, b) => a.order - b.order);
    
    // Center the whole grid via a transform later
    return grid;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Ambient Background Swarm (Direction 3 concept) */}
      <AmbientSwarm />

      {/* 2. Scroll-Triggered Honeycomb Grid (Direction 1 concept) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[675px] h-[950px] opacity-20 mix-blend-screen md:opacity-30">
        {hexGrid.map((hex, index) => {
          // Calculate when this specific hexagon should appear based on its order in the array
          const startProgress = index / hexGrid.length * 0.8; // Use 80% of scroll for the build-up
          const endProgress = startProgress + 0.1;

          // Map the scroll progress to scale and opacity
          const scale = useTransform(scrollYProgress, [startProgress, endProgress], [0, 1]);
          const opacity = useTransform(scrollYProgress, [startProgress, endProgress], [0, 1]);
          
          const isBrandColor = index % 5 === 0;

          return (
            <motion.div
              key={hex.id}
              style={{
                position: 'absolute',
                left: hex.x,
                top: hex.y,
                width: 100,
                height: 115.47,
                clipPath: HEX_CLIP_PATH,
                scale,
                opacity,
              }}
              className={`${
                hex.isCenter ? 'bg-primary' : 
                isBrandColor ? 'bg-primary/40' : 'bg-white/10'
              } backdrop-blur-sm transition-colors duration-500`}
            >
              {/* Inner border/styling to make it look like a wireframe filled in */}
              <div 
                className="absolute inset-[2px] bg-[#0b0f19]/80"
                style={{ clipPath: HEX_CLIP_PATH }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Subtle background floating hexagons
const AmbientSwarm = () => {
  // Generate random particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 10,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 opacity-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-primary"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 1.1547,
            clipPath: HEX_CLIP_PATH,
          }}
          animate={{
            y: [0, -60, 0],
            x: [0, 30, 0],
            rotate: [0, 15, -15, 0],
            opacity: [0.0, 0.5, 0.0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
