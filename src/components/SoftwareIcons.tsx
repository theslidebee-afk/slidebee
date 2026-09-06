import React from "react";

interface SoftwareIconProps {
  format: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const PowerPointIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#D24726" />
    <path d="M7 6h10a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6H7V6z" fill="#E85C3A" opacity="0.4" />
    <path d="M6 8h10a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H6V8z" fill="#EB3C00" />
    <rect x="4" y="9" width="13" height="14" rx="2.5" fill="#C43E1C" />
    <text x="7.5" y="20" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">P</text>
    <rect x="18" y="11" width="8" height="2.5" rx="1" fill="#FFFFFF" opacity="0.9" />
    <rect x="18" y="15" width="6" height="2.5" rx="1" fill="#FFFFFF" opacity="0.7" />
    <rect x="18" y="19" width="8" height="2.5" rx="1" fill="#FFFFFF" opacity="0.9" />
  </svg>
);

export const GoogleSlidesIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#F4B400" />
    <path d="M7 6h12l7 7v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="#F9AB00" opacity="0.3" />
    <rect x="7" y="10" width="18" height="12" rx="2" fill="#FFFFFF" />
    <rect x="9.5" y="12.5" width="13" height="7" rx="1" fill="#FFF8E1" />
    <rect x="11" y="14" width="6" height="2" rx="0.5" fill="#F4B400" />
    <rect x="11" y="17" width="10" height="1.5" rx="0.5" fill="#F9AB00" />
  </svg>
);

export const KeynoteIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#007AFF" />
    <rect x="7" y="7" width="18" height="12" rx="1.5" fill="#FFFFFF" />
    <path d="M12 19l-3 7m11-7l3 7m-10-7v7m2-7v7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="16" cy="13" r="2.5" fill="#007AFF" />
  </svg>
);

export const CanvaIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="canvaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00C4CC" />
        <stop offset="50%" stopColor="#7D2AE8" />
        <stop offset="100%" stopColor="#8B3DFF" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#canvaGrad)" />
    <text x="8.5" y="22" fill="#FFFFFF" fontSize="15" fontWeight="900" fontStyle="italic" fontFamily="Georgia, serif">C</text>
  </svg>
);

export const FigmaIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#1E1E1E" />
    <path d="M11 6h5a2.5 2.5 0 0 1 0 5h-5V6z" fill="#F24E1E" />
    <path d="M16 6h5a2.5 2.5 0 0 1 0 5h-5V6z" fill="#FF7262" />
    <path d="M16 11h5a2.5 2.5 0 1 1-5 5v-5z" fill="#1ABCFE" />
    <path d="M11 11h5v5h-5a2.5 2.5 0 0 1 0-5z" fill="#A259FF" />
    <path d="M11 16h5v2.5a2.5 2.5 0 1 1-5 0V16z" fill="#0ACF83" />
  </svg>
);

export const PDFIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#E5252A" />
    <rect x="6" y="6" width="20" height="20" rx="2" fill="#FFFFFF" opacity="0.2" />
    <text x="6" y="21" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">PDF</text>
  </svg>
);

export default function SoftwareBadge({ format, size = "sm", showLabel = true, className = "" }: SoftwareIconProps) {
  const norm = (format || "").toLowerCase().trim();
  const iconPx = size === "sm" ? 14 : size === "md" ? 18 : 22;

  let IconComponent = PowerPointIcon;
  let label = format;
  let tooltip = "Microsoft PowerPoint";

  if (norm.includes("ppt") || norm.includes("powerpoint")) {
    IconComponent = PowerPointIcon;
    label = "PowerPoint";
    tooltip = "Microsoft PowerPoint (.pptx)";
  } else if (norm.includes("slide") || norm.includes("google")) {
    IconComponent = GoogleSlidesIcon;
    label = "Google Slides";
    tooltip = "Google Slides";
  } else if (norm.includes("key") || norm.includes("keynote")) {
    IconComponent = KeynoteIcon;
    label = "Keynote";
    tooltip = "Apple Keynote (.key)";
  } else if (norm.includes("canva")) {
    IconComponent = CanvaIcon;
    label = "Canva";
    tooltip = "Canva Template";
  } else if (norm.includes("figma")) {
    IconComponent = FigmaIcon;
    label = "Figma";
    tooltip = "Figma Vector Deck";
  } else if (norm.includes("pdf")) {
    IconComponent = PDFIcon;
    label = "PDF";
    tooltip = "Vector PDF";
  }

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 bg-white border border-primary/40 hover:border-primary px-2.5 py-0.5 rounded-full shadow-sm hover:shadow transition-all text-[#111111] ${className}`}
    >
      <IconComponent size={iconPx} />
      {showLabel && (
        <span className="text-[10px] font-extrabold tracking-tight text-[#111111]">
          {label}
        </span>
      )}
    </span>
  );
}
