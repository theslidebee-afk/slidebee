import React, { useEffect, useState, useRef } from "react";
import { useBeeCursor } from "../context/BeeCursorContext";

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const CustomBeeCursor: React.FC = () => {
  const { beeState, setBeeState } = useBeeCursor();

  // State only for elements that change on interaction, NOT on continuous mousemove
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  // Direct DOM references for zero-latency, 120fps tracking without React re-renders
  const cursorRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef<boolean>(false);
  const rippleId = useRef<number>(0);

  // Check if device supports fine hover (desktop mouse) and activate custom-bee-active
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

  // High-performance pointer tracking via direct DOM transforms (Zero React re-renders on move)
  useEffect(() => {
    if (!isSupported) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let rafId: number | null = null;

    const renderLoop = () => {
      // Instant snap for crisp, lag-free cursor feel
      currentX = targetX;
      currentY = targetY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    const handlePointerMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        if (containerRef.current) {
          containerRef.current.style.opacity = "1";
        }
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

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
        ...prev.slice(-2),
        { id: rippleId.current, x: e.clientX, y: e.clientY },
      ]);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
      }
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      if (containerRef.current) {
        containerRef.current.style.opacity = "1";
      }
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isSupported, setBeeState]);

  // Clean up click ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 450);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (!isSupported || beeState === "hidden") return null;

  const isCard = beeState === "card";
  const isHover = beeState === "hover";
  const isQuote = beeState === "quote";

  const scaleClass = isMouseDown
    ? "scale-90"
    : isCard
    ? "scale-125"
    : isQuote
    ? "scale-120"
    : isHover
    ? "scale-115"
    : "scale-100";

  return (
    <div
      ref={containerRef}
      style={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none transition-opacity duration-150"
    >
      {/* 1. Click Ripple Pulses */}
      {ripples.map((r) => (
        <div
          key={r.id}
          style={{ left: r.x, top: r.y }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#FCBF14] animate-bee-click-pulse pointer-events-none"
        />
      ))}

      {/* 2. Soft Golden Glow Aura */}
      <div
        ref={auraRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
      >
        <div
          className={`rounded-full transition-all duration-200 ${
            isCard
              ? "w-14 h-14 bg-[#FCBF14]/30 blur-lg"
              : isQuote
              ? "w-12 h-12 bg-amber-400/25 blur-md"
              : isHover
              ? "w-10 h-10 bg-[#FCBF14]/25 blur-md"
              : "w-6 h-6 bg-[#FCBF14]/15 blur-xs"
          }`}
        />
      </div>

      {/* 3. The Straight Upright Animated Bee SVG Cursor */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-[6px] pointer-events-none cursor-none flex items-center justify-center will-change-transform"
      >
        <div
          className={`transition-transform duration-150 ease-out ${scaleClass} flex items-center justify-center`}
        >
          {/* Minimalist Bee Graphic - Straight upright, centered hotspot */}
          <div className="relative flex items-center justify-center">
            <svg
              width="40"
              height="36"
              viewBox="-110 -75 220 190"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.30)] overflow-visible"
            >
              {/* Minimalist Bee Group (Straight upright, 0 tilt) */}
              <g>
                {/* Left Wing */}
                <path
                  d="M -16 -4 C -82 -32 -118 8 -88 44 C -64 68 -24 38 -12 14 Z"
                  fill="#FFFFFF"
                  stroke="#1E1E1E"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  className={
                    isHover
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
                    isHover
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
                <path d="M -7 87 L 7 87 L 0 106 Z" fill="#1E1E1E" />

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
      </div>
    </div>
  );
};
