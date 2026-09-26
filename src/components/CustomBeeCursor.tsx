import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useBeeCursor } from "../context/BeeCursorContext";

interface PollenParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const CustomBeeCursor: React.FC = () => {
  const { beeState, setBeeState } = useBeeCursor();

  // Mouse coordinates with spring physics
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const springConfig = { damping: 26, stiffness: 360, mass: 0.45 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Flight dynamics & banking
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [isMovingFast, setIsMovingFast] = useState<boolean>(false);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [particles, setParticles] = useState<PollenParticle[]>([]);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  const lastPos = useRef({ x: -100, y: -100, time: Date.now() });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleId = useRef<number>(0);
  const rippleId = useRef<number>(0);

  // Check if device supports fine hover (desktop mouse) and hide system cursor
  useEffect(() => {
    if (typeof window !== "undefined") {
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      setIsSupported(finePointer.matches);

      if (finePointer.matches) {
        document.body.classList.add("custom-bee-active");
      }

      const handleChange = (e: MediaQueryListEvent) => {
        setIsSupported(e.matches);
        if (e.matches) {
          document.body.classList.add("custom-bee-active");
        } else {
          document.body.classList.remove("custom-bee-active");
        }
      };

      finePointer.addEventListener("change", handleChange);
      return () => {
        finePointer.removeEventListener("change", handleChange);
        document.body.classList.remove("custom-bee-active");
      };
    }
  }, []);

  // Mouse tracking and click listeners
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

      // Determine banking tilt
      if (Math.abs(dx) > 1.2) {
        const tilt = Math.max(-20, Math.min(20, (dx / dt) * 14 + (dy / dt) * 6));
        setTiltAngle(tilt);
      }

      setIsMovingFast(speed > 0.85);

      // Spawn pollen particle on rapid motion
      if (speed > 1.1 && Math.random() > 0.55) {
        particleId.current += 1;
        setParticles((prev) => [
          ...prev.slice(-5),
          {
            id: particleId.current,
            x: e.clientX - dx * 0.4,
            y: e.clientY - dy * 0.4,
            opacity: 0.85,
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
      if (
        target.closest("[data-bee-state='card']") ||
        target.closest(".slide-card") ||
        target.closest(".hex-card") ||
        target.closest(".group\\/card")
      ) {
        setBeeState("card");
      } else if (
        target.closest("[data-bee-state='quote']") ||
        target.closest("a[href*='ordernow']") ||
        target.closest("button[data-action='quote']")
      ) {
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

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      rippleId.current += 1;
      setRipples((prev) => [
        ...prev.slice(-3),
        { id: rippleId.current, x: e.clientX, y: e.clientY },
      ]);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    resetIdleTimer();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
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
    }, 400);
    return () => clearTimeout(timer);
  }, [particles]);

  // Clean up click ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 450);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (!isSupported || !isVisible || beeState === "hidden") return null;

  // Determine active states
  const isCard = beeState === "card";
  const isHover = beeState === "hover";
  const isQuote = beeState === "quote";
  const isPerched = isIdle && !isMovingFast;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
      
      {/* 1. Click Ripple Pulses */}
      {ripples.map((r) => (
        <div
          key={r.id}
          style={{ left: r.x, top: r.y }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#FCBF14] animate-bee-click-pulse pointer-events-none"
        />
      ))}

      {/* 2. Trailing Pollen Dust Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ scale: 1, opacity: p.opacity }}
          animate={{ scale: 0.15, opacity: 0, y: "+=14" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ left: p.x, top: p.y }}
          className="absolute w-2 h-2 rounded-full bg-[#FCBF14] shadow-[0_0_8px_#FCBF14]"
        />
      ))}

      {/* 3. Soft Golden Glow Aura */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div
          className={`rounded-full transition-all duration-300 ${
            isCard
              ? "w-14 h-14 bg-[#FCBF14]/30 blur-lg"
              : isQuote
              ? "w-12 h-12 bg-amber-400/25 blur-md"
              : isHover
              ? "w-10 h-10 bg-[#FCBF14]/25 blur-md"
              : "w-6 h-6 bg-[#FCBF14]/15 blur-xs"
          }`}
        />
      </motion.div>

      {/* 4. The Animated Interactive Bee SVG Cursor */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: isMouseDown
            ? 0.86
            : isPerched
            ? 0.92
            : isCard
            ? 1.25
            : isQuote
            ? 1.2
            : isHover
            ? 1.15
            : 1.0,
          rotate: isPerched ? 0 : tiltAngle,
        }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 28,
        }}
        // Bee head hotspot positioned right at cursor point
        className="absolute -translate-x-[20px] -translate-y-[8px] pointer-events-none cursor-none flex items-center justify-center"
      >
        <div className={isPerched ? "animate-bee-hover" : ""}>
          {/* Minimalist Bee Graphic (Compact, centered, no heart trail line) */}
          <div className="relative flex items-center justify-center">
            <svg
              width="44"
              height="38"
              viewBox="-110 -75 220 190"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.30)] overflow-visible"
            >
              {/* Minimalist Bee Group (Tilted ~22 deg naturally for cursor pointing) */}
              <g transform="rotate(22)">
                {/* Left Wing */}
                <path
                  d="M -16 -4 C -82 -32 -118 8 -88 44 C -64 68 -24 38 -12 14 Z"
                  fill="#FFFFFF"
                  stroke="#1E1E1E"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  className={
                    isPerched
                      ? ""
                      : isHover || isMovingFast
                      ? "animate-bee-wing-left-fast origin-[0_0]"
                      : "animate-bee-wing-left origin-[0_0]"
                  }
                />

                {/* Right Wing */}
                <path
                  d="M 16 -4 C 82 -32 118 8 88 44 C 64 68 24 38 12 14 Z"
                  fill="#FFFFFF"
                  stroke="#1E1E1E"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  className={
                    isPerched
                      ? ""
                      : isHover || isMovingFast
                      ? "animate-bee-wing-right-fast origin-[0_0]"
                      : "animate-bee-wing-right origin-[0_0]"
                  }
                />

                {/* Bee Body - Base Golden Yellow */}
                <path
                  d="M 0 -18 C -32 -18 -48 6 -48 30 C -48 60 -26 86 0 88 C 26 86 48 60 48 30 C 48 6 32 -18 0 -18 Z"
                  fill="#FCBF14"
                />

                {/* Black Stripe 1 (Upper Torso) */}
                <path
                  d="M -46 14 C -48 24 -48 30 -47 34 C -24 40 24 40 47 34 C 48 30 48 24 46 14 C 24 20 -24 20 -46 14 Z"
                  fill="#1E1E1E"
                />

                {/* Black Stripe 2 (Lower Abdomen) */}
                <path
                  d="M -42 50 C -38 60 -30 70 -20 77 C -10 80 10 80 20 77 C 30 70 38 60 42 50 C 22 56 -22 56 -42 50 Z"
                  fill="#1E1E1E"
                />

                {/* Body Contour Outline */}
                <path
                  d="M 0 -18 C -32 -18 -48 6 -48 30 C -48 60 -26 86 0 88 C 26 86 48 60 48 30 C 48 6 32 -18 0 -18 Z"
                  stroke="#1E1E1E"
                  strokeWidth="5"
                  fill="none"
                />

                {/* Black Stinger */}
                <path
                  d="M -7 87 L 7 87 L 0 106 Z"
                  fill="#1E1E1E"
                />

                {/* Head - Solid Charcoal Semi-Dome */}
                <path
                  d="M -32 -16 C -32 -48 32 -48 32 -16 C 20 -19 -20 -19 -32 -16 Z"
                  fill="#1E1E1E"
                />

                {/* Antennae with Circular Dot Tips */}
                {/* Left Antenna */}
                <path
                  d="M -12 -38 C -20 -58 -28 -66 -35 -64"
                  stroke="#1E1E1E"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="-36" cy="-64" r="6" fill="#1E1E1E" />

                {/* Right Antenna */}
                <path
                  d="M 12 -38 C 20 -58 35 -64 42 -58"
                  stroke="#1E1E1E"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="43" cy="-57" r="6" fill="#1E1E1E" />
              </g>

              {/* Interactive Hover Sparkle */}
              {isHover && (
                <g className="animate-in fade-in duration-200">
                  <path
                    d="M 28 -40 L 31 -32 L 39 -29 L 31 -26 L 28 -18 L 25 -26 L 17 -29 L 25 -32 Z"
                    fill="#FCBF14"
                    className="animate-bee-sparkle origin-[28px_-29px]"
                  />
                </g>
              )}
            </svg>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
