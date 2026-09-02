import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomBeeCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Check if hovering over clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Trailing Golden Glow Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full bg-primary/30 blur-[2px] hidden md:block"
        animate={{
          x: mousePosition.x - (isHovered ? 20 : 12),
          y: mousePosition.y - (isHovered ? 20 : 12),
          width: isHovered ? 40 : 24,
          height: isHovered ? 40 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
          mass: 0.5,
        }}
      />

      {/* 2. Custom Bee / Precision Cursor Icon */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:flex items-center justify-center"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
          scale: isHovered ? 1.3 : 1,
          rotate: isHovered ? 15 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 35,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_8px_rgba(252,191,20,0.6)]"
        >
          {/* Stylized Golden Bee Pointer */}
          <circle cx="12" cy="12" r="5" fill="#FCBF14" stroke="#111111" strokeWidth="1.5" />
          <line x1="10" y1="10" x2="14" y2="10" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="13" x2="15" y2="13" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" />
          {/* Wings */}
          <path
            d="M8 8C6 6 5 4 8 4C11 4 10 7 9 9"
            fill="#FFF9E8"
            fillOpacity="0.8"
            stroke="#111111"
            strokeWidth="0.8"
          />
          <path
            d="M16 8C18 6 19 4 16 4C13 4 14 7 15 9"
            fill="#FFF9E8"
            fillOpacity="0.8"
            stroke="#111111"
            strokeWidth="0.8"
          />
          {/* Stinger point */}
          <path d="M12 17L11 19.5L13 19.5Z" fill="#111111" />
        </svg>
      </motion.div>
    </>
  );
};
