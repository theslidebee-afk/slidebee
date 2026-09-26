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

  // Flight dynamics & heading
  const [headingX, setHeadingX] = useState<number>(1);
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

      // Determine flight direction and banking tilt
      if (Math.abs(dx) > 1.2) {
        const dir = dx > 0 ? 1 : -1;
        setHeadingX(dir);
        // Bank into the turn
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
            ? 1.28
            : isQuote
            ? 1.22
            : isHover
            ? 1.16
            : 1.05,
          rotate: isPerched ? 0 : tiltAngle,
        }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 28,
        }}
        // The bee head hotspot is positioned near top-center of the SVG
        className="absolute -translate-x-[14px] -translate-y-[8px] pointer-events-none cursor-none flex items-center justify-center"
      >
        <div
          style={{
            transform: `scaleX(${headingX})`,
            transition: "transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          className={isPerched ? "animate-bee-hover" : ""}
        >
          {/* Main Bee Graphic Container */}
          <div className="relative w-11 h-11 flex items-center justify-center">
            
            <svg
              width="40"
              height="40"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)] overflow-visible"
            >
              {/* Left Wing */}
              <path
                d="M12 11 C8 3, 2 7, 7 13 C9.5 15, 12 13, 12 11 Z"
                fill="#FFFDF5"
                fillOpacity="0.92"
                stroke="#111111"
                strokeWidth="1.2"
                className={
                  isPerched
                    ? ""
                    : isHover || isMovingFast
                    ? "animate-bee-wing-left-fast"
                    : "animate-bee-wing-left"
                }
              />

              {/* Right Wing */}
              <path
                d="M16 11 C20 3, 26 7, 21 13 C18.5 15, 16 13, 16 11 Z"
                fill="#FFFDF5"
                fillOpacity="0.92"
                stroke="#111111"
                strokeWidth="1.2"
                className={
                  isPerched
                    ? ""
                    : isHover || isMovingFast
                    ? "animate-bee-wing-right-fast"
                    : "animate-bee-wing-right"
                }
              />

              {/* Bee Stinger Point */}
              <path d="M14 25 L12.8 28.5 L15.2 28.5 Z" fill="#111111" />

              {/* Honey Striped Abdomen */}
              <ellipse
                cx="14"
                cy="17.5"
                rx="6.5"
                ry="8"
                fill="#FCBF14"
                stroke="#111111"
                strokeWidth="1.6"
              />

              {/* Charcoal Stripes */}
              <path
                d="M8.5 15 Q14 17.5, 19.5 15"
                stroke="#111111"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 18.5 Q14 21, 20 18.5"
                stroke="#111111"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M9 22 Q14 24, 19 22"
                stroke="#111111"
                strokeWidth="1.6"
                strokeLinecap="round"
              />

              {/* Antennae */}
              <path
                d="M11.5 10.5 C9.5 7.5, 7 8, 6.5 9"
                stroke="#111111"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle cx="6" cy="9.5" r="1.1" fill="#FCBF14" />

              <path
                d="M16.5 10.5 C18.5 7.5, 21 8, 21.5 9"
                stroke="#111111"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle cx="22" cy="9.5" r="1.1" fill="#FCBF14" />

              {/* Eyes */}
              <circle cx="11.5" cy="12.5" r="1.2" fill="#111111" />
              <circle cx="16.5" cy="12.5" r="1.2" fill="#111111" />
              <circle cx="12" cy="12.2" r="0.45" fill="#FFFFFF" />
              <circle cx="17" cy="12.2" r="0.45" fill="#FFFFFF" />

              {/* ------------------------------------------------------------- */}
              {/* STATE SVG 1: CARD HOVER -> INSPECTOR MONOCLE OVER EYE        */}
              {/* ------------------------------------------------------------- */}
              {isCard && (
                <g className="animate-in fade-in zoom-in-75 duration-200">
                  {/* Monocle Gold Rim & Glass */}
                  <circle
                    cx="16.5"
                    cy="12.5"
                    r="2.6"
                    fill="#FCBF14"
                    fillOpacity="0.25"
                    stroke="#FCBF14"
                    strokeWidth="0.9"
                  />
                  {/* Monocle Lens Glint */}
                  <path
                    d="M15.5 11.2 Q17 11.2, 17.8 12.2"
                    stroke="#FFFFFF"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                  />
                  {/* Gold Hanging Chain */}
                  <path
                    d="M19 13.5 C20.5 16, 21 19, 20.5 21"
                    stroke="#FCBF14"
                    strokeWidth="0.6"
                    strokeDasharray="0.8 0.8"
                    fill="none"
                  />
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* STATE SVG 2: BUTTON HOVER -> ACTION NECTAR SPARK              */}
              {/* ------------------------------------------------------------- */}
              {isHover && (
                <g className="animate-in fade-in duration-200">
                  <path
                    d="M14 4 L14.8 6.5 L17.5 7.2 L14.8 8 L14 10.5 L13.2 8 L10.5 7.2 L13.2 6.5 Z"
                    fill="#FCBF14"
                    className="animate-bee-sparkle origin-[14px_7.2px]"
                  />
                </g>
              )}
            </svg>

            {/* --------------------------------------------------------------- */}
            {/* STATE SVG 3: PRESENTATION SLIDE CANVAS (Held by Bee on Cards)   */}
            {/* --------------------------------------------------------------- */}
            {isCard && (
              <div className="absolute -bottom-3.5 -right-5 pointer-events-none animate-in fade-in zoom-in-75 duration-200">
                <svg
                  width="36"
                  height="26"
                  viewBox="0 0 36 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                >
                  {/* 16:9 Slide Canvas Frame */}
                  <rect
                    x="1"
                    y="1"
                    width="34"
                    height="24"
                    rx="3"
                    fill="#181818"
                    stroke="#FCBF14"
                    strokeWidth="1.4"
                  />
                  {/* Top Slide Accent Bar */}
                  <rect x="3" y="3" width="30" height="2.5" rx="1" fill="#FCBF14" />
                  {/* Slide Title Line */}
                  <rect x="4" y="8" width="12" height="1.8" rx="0.5" fill="#FFFFFF" fillOpacity="0.85" />
                  {/* Miniature Presentation Bar Charts */}
                  <rect x="4" y="18" width="3" height="4" rx="0.5" fill="#FCBF14" />
                  <rect x="9" y="14" width="3" height="8" rx="0.5" fill="#FFE270" />
                  <rect x="14" y="11" width="3" height="11" rx="0.5" fill="#FCBF14" />
                  <rect x="19" y="16" width="3" height="6" rx="0.5" fill="#FFE270" />
                  {/* Slide Layout Wireframe Box */}
                  <rect
                    x="24"
                    y="11"
                    width="8"
                    height="11"
                    rx="1"
                    fill="#242424"
                    stroke="#FCBF14"
                    strokeWidth="0.8"
                    strokeDasharray="1 1"
                  />
                </svg>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* STATE SVG 4: GOLDEN STUDIO QUILL STYLUS (Drafting Quotes)      */}
            {/* --------------------------------------------------------------- */}
            {isQuote && (
              <div className="absolute -bottom-3 -right-4 pointer-events-none animate-in fade-in zoom-in-75 duration-200">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)]"
                >
                  {/* Feather Shaft */}
                  <path
                    d="M19 3 C17 3, 11 6, 8 12 L7 17 L12 16 C18 13, 21 7, 21 5 Z"
                    fill="#FCBF14"
                    stroke="#111111"
                    strokeWidth="1.2"
                  />
                  {/* Feather Vane Texture */}
                  <path d="M14 9 L18 6" stroke="#111111" strokeWidth="0.8" strokeLinecap="round" />
                  <path d="M12 12 L16 9" stroke="#111111" strokeWidth="0.8" strokeLinecap="round" />
                  {/* Nib / Stylus Tip */}
                  <path d="M7 17 L4 20 L5.5 20.5 L8 18 Z" fill="#111111" />
                  {/* Golden Ink Droplet Spark */}
                  <circle cx="3.5" cy="21" r="1.2" fill="#FCBF14" />
                </svg>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};
