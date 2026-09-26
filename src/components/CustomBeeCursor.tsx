import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useBeeCursor } from "../context/BeeCursorContext";

interface PollenParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export const CustomBeeCursor: React.FC = () => {
  const { beeState, setBeeState } = useBeeCursor();

  // Mouse coordinates with spring physics
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springConfig = { damping: 24, stiffness: 320, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Flight dynamics & heading
  const [headingX, setHeadingX] = useState<number>(1);
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [isMovingFast, setIsMovingFast] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [particles, setParticles] = useState<PollenParticle[]>([]);

  const lastPos = useRef({ x: -100, y: -100, time: Date.now() });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleId = useRef<number>(0);

  // Check if device supports fine hover (desktop mouse)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      setIsSupported(finePointer.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsSupported(e.matches);
      };

      finePointer.addEventListener("change", handleChange);
      return () => finePointer.removeEventListener("change", handleChange);
    }
  }, []);

  // Mouse move and element hover tracking
  useEffect(() => {
    if (!isSupported) return;

    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setIsIdle(true);
      }, 3500);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastPos.current.time);
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const speed = Math.hypot(dx, dy) / dt;

      // Update position
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!isVisible) setIsVisible(true);

      // Determine flight direction and banking tilt
      if (Math.abs(dx) > 1.5) {
        const dir = dx > 0 ? 1 : -1;
        setHeadingX(dir);
        // Bank into the turn
        const tilt = Math.max(-18, Math.min(18, (dx / dt) * 12 + (dy / dt) * 6));
        setTiltAngle(tilt);
      }

      setIsMovingFast(speed > 0.8);

      // Spawn pollen particle on rapid motion
      if (speed > 1.2 && Math.random() > 0.6) {
        particleId.current += 1;
        setParticles((prev) => [
          ...prev.slice(-4),
          {
            id: particleId.current,
            x: e.clientX - dx * 0.4,
            y: e.clientY - dy * 0.4,
            opacity: 0.8,
          },
        ]);
      }

      lastPos.current = { x: e.clientX, y: e.clientY, time: now };
      resetIdleTimer();
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Detect specific UI elements
      if (target.closest("[data-bee-state='card']") || target.closest(".slide-card") || target.closest(".group\\/card")) {
        setBeeState("card");
      } else if (target.closest("[data-bee-state='quote']") || target.closest("a[href*='ordernow']")) {
        setBeeState("quote");
      } else if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("cursor-pointer") ||
        target.closest(".cursor-pointer")
      ) {
        setBeeState("hover");
      } else {
        setBeeState("default");
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    resetIdleTimer();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isSupported, isVisible, mouseX, mouseY, setBeeState]);

  // Clean up pollen particles
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) => prev.slice(1));
    }, 450);
    return () => clearTimeout(timer);
  }, [particles]);

  if (!isSupported || !isVisible || beeState === "hidden") return null;

  // Determine active presentation state
  const isCard = beeState === "card";
  const isHover = beeState === "hover";
  const isQuote = beeState === "quote";
  const isPerched = isIdle && !isMovingFast;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none">
      
      {/* 1. Trailing Pollen Dust Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ scale: 1, opacity: p.opacity }}
          animate={{ scale: 0.2, opacity: 0, y: "+=12" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ left: p.x, top: p.y }}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#FCBF14] shadow-[0_0_6px_#FCBF14]"
        />
      ))}

      {/* 2. Soft Golden Atmospheric Aura */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`rounded-full transition-all duration-300 ${
            isHover || isQuote
              ? "w-10 h-10 bg-[#FCBF14]/25 blur-md"
              : isCard
              ? "w-12 h-12 bg-[#FCBF14]/30 blur-lg"
              : "w-7 h-7 bg-[#FCBF14]/15 blur-sm"
          }`}
        />
      </motion.div>

      {/* 3. The Animated Interactive Bee SVG */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: isPerched ? 0.9 : isCard ? 1.25 : isHover ? 1.15 : 1,
          rotate: isPerched ? 0 : tiltAngle,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-none"
      >
        <div
          style={{
            transform: `scaleX(${headingX})`,
            transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className={isPerched ? "animate-bee-hover" : ""}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
          >
            {/* Left Wing */}
            <path
              d="M12 11 C8 4, 3 8, 8 13 C10 15, 12 13, 12 11 Z"
              fill="#FFFDF5"
              fillOpacity="0.88"
              stroke="#111111"
              strokeWidth="1.2"
              className={
                isPerched
                  ? ""
                  : isMovingFast
                  ? "animate-bee-wing-left-fast"
                  : "animate-bee-wing-left"
              }
            />

            {/* Right Wing */}
            <path
              d="M16 11 C20 4, 25 8, 20 13 C18 15, 16 13, 16 11 Z"
              fill="#FFFDF5"
              fillOpacity="0.88"
              stroke="#111111"
              strokeWidth="1.2"
              className={
                isPerched
                  ? ""
                  : isMovingFast
                  ? "animate-bee-wing-right-fast"
                  : "animate-bee-wing-right"
              }
            />

            {/* Bee Stinger */}
            <path d="M14 24.5 L13 27.5 L15 27.5 Z" fill="#111111" />

            {/* Oval Striped Body */}
            <ellipse
              cx="14"
              cy="17"
              rx="6"
              ry="7.5"
              fill="#FCBF14"
              stroke="#111111"
              strokeWidth="1.6"
            />

            {/* Honeycomb Dark Stripes */}
            <path
              d="M9 15 Q14 17, 19 15"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M8.5 18.5 Q14 20.5, 19.5 18.5"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M9.5 22 Q14 23.5, 18.5 22"
              stroke="#111111"
              strokeWidth="1.6"
              strokeLinecap="round"
            />

            {/* Cute Antennae */}
            <path
              d="M12 10.5 C10 8, 8 8.5, 7.5 9.5"
              stroke="#111111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="7" cy="10" r="1" fill="#FCBF14" />

            <path
              d="M16 10.5 C18 8, 20 8.5, 20.5 9.5"
              stroke="#111111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="21" cy="10" r="1" fill="#FCBF14" />

            {/* Eyes */}
            <circle cx="11.5" cy="12.5" r="1.1" fill="#111111" />
            <circle cx="16.5" cy="12.5" r="1.1" fill="#111111" />
            <circle cx="12" cy="12.2" r="0.4" fill="#FFFFFF" />
            <circle cx="17" cy="12.2" r="0.4" fill="#FFFFFF" />
          </svg>

          {/* Context Badge (Optional Icon Floating Near Bee) */}
          {isCard && (
            <div className="absolute -top-3 -right-2 bg-[#111111] text-[#FCBF14] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#FCBF14]/40 shadow-xs scale-90">
              DECK
            </div>
          )}

          {isQuote && (
            <div className="absolute -top-3 -right-2 bg-[#FCBF14] text-[#111111] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-black/20 shadow-xs scale-90">
              QUOTE
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
