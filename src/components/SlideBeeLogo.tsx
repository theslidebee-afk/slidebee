interface SlideBeeLogoProps {
  className?: string;
  variant?: "light" | "dark" | "auto";
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function SlideBeeLogo({
  className = "",
  variant = "auto",
  showText = true,
  size = "md"
}: SlideBeeLogoProps) {
  const sizeMap = {
    sm: { icon: "w-7 h-7", text: "text-lg", hexagon: 28 },
    md: { icon: "w-10 h-10", text: "text-2xl", hexagon: 40 },
    lg: { icon: "w-14 h-14", text: "text-3xl", hexagon: 56 }
  };

  const textClass = variant === "dark" 
    ? "text-white" 
    : variant === "light" 
      ? "text-[#111111]" 
      : "text-current";

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Hexagonal Honeycomb Bee Emblem from Slide 3 */}
      <div className={`relative ${sizeMap[size].icon} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hexagon Outer Border in Honey Gold */}
          <polygon
            points="50,4 92,27 92,73 50,96 8,73 8,27"
            fill="#FCBF14"
            fillOpacity="0.15"
            stroke="#FCBF14"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          {/* Inner Hexagon Ring */}
          <polygon
            points="50,14 84,33 84,67 50,86 16,67 16,33"
            fill="#FCBF14"
            fillOpacity="0.9"
            stroke="#936610"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Stylized Geometric Bee Icon */}
          {/* Bee Head */}
          <circle cx="50" cy="36" r="6" fill="#111111" />
          <path d="M46 32 L42 27 M54 32 L58 27" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />

          {/* Bee Wings (Left & Right Hexagonal Flaps) */}
          <ellipse cx="34" cy="48" rx="9" ry="6" transform="rotate(-30 34 48)" fill="#111111" fillOpacity="0.9" />
          <ellipse cx="66" cy="48" rx="9" ry="6" transform="rotate(30 66 48)" fill="#111111" fillOpacity="0.9" />

          {/* Bee Body & Stripes */}
          <rect x="43" y="44" width="14" height="24" rx="7" fill="#111111" />
          <rect x="44.5" y="49" width="11" height="3" rx="1.5" fill="#FCBF14" />
          <rect x="44.5" y="55" width="11" height="3" rx="1.5" fill="#FCBF14" />
          <polygon points="50,71 47,67 53,67" fill="#111111" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <span className={`font-heading font-extrabold tracking-tight ${sizeMap[size].text} ${textClass}`}>
          Slide<span className="text-primary">bee</span>
        </span>
      )}
    </div>
  );
}
