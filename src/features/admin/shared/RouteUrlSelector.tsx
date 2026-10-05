import React, { useMemo } from "react";
import { ExternalLink, Compass } from "lucide-react";

export interface RouteOption {
  label: string;
  url: string;
  category: "Standard Pages" | "Deep Links" | "External / Custom";
}

export const SLIDEBEE_ROUTES: RouteOption[] = [
  // Standard Pages
  { label: "Marketplace Catalog (/templates)", url: "/templates", category: "Standard Pages" },
  { label: "Studio Services (/services)", url: "/services", category: "Standard Pages" },
  { label: "Pricing & Memberships (/pricing)", url: "/pricing", category: "Standard Pages" },
  { label: "Commission Custom Deck (/ordernow)", url: "/ordernow", category: "Standard Pages" },
  { label: "Portfolio Case Studies (/examples)", url: "/examples", category: "Standard Pages" },
  { label: "Editorial Blog (/blog)", url: "/blog", category: "Standard Pages" },
  { label: "Contact & Inquiries (/contact)", url: "/contact", category: "Standard Pages" },
  { label: "About SlideBee (/about)", url: "/about", category: "Standard Pages" },

  // Deep Links
  { label: "Services: Presentation Studio (/services?type=presentation)", url: "/services?type=presentation", category: "Deep Links" },
  { label: "Services: E-Commerce Creative (/services?type=ecommerce)", url: "/services?type=ecommerce", category: "Deep Links" },
  { label: "Order: Deck Redesign (/ordernow?service=redesign)", url: "/ordernow?service=redesign", category: "Deep Links" },
  { label: "Order: Handwritten Conversion (/ordernow?service=handwritten)", url: "/ordernow?service=handwritten", category: "Deep Links" },
  { label: "Order: Quick Scrub & Clean Up (/ordernow?service=cleanup)", url: "/ordernow?service=cleanup", category: "Deep Links" },
  { label: "Order: Data Visualization (/ordernow?service=data)", url: "/ordernow?service=data", category: "Deep Links" },
  { label: "Order: Master Template Creation (/ordernow?service=template)", url: "/ordernow?service=template", category: "Deep Links" },
  { label: "Order: Graphic Design (/ordernow?service=graphic)", url: "/ordernow?service=graphic", category: "Deep Links" },
  { label: "Contact: Quote Request (/contact?intent=quote)", url: "/contact?intent=quote", category: "Deep Links" },
];

interface RouteUrlSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  dark?: boolean;
  className?: string;
}

export const RouteUrlSelector: React.FC<RouteUrlSelectorProps> = ({
  value,
  onChange,
  label = "Destination Route URL",
  placeholder = "Select or enter destination URL...",
  dark = false,
  className = "",
}) => {
  const isPredefined = useMemo(() => {
    return SLIDEBEE_ROUTES.some((r) => r.url === value);
  }, [value]);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected && selected !== "__custom__") {
      onChange(selected);
    }
  };

  const categories = useMemo(() => {
    const groups: Record<string, RouteOption[]> = {
      "Standard Pages": [],
      "Deep Links": [],
    };
    SLIDEBEE_ROUTES.forEach((r) => {
      if (groups[r.category]) {
        groups[r.category].push(r);
      }
    });
    return groups;
  }, []);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className={`text-[11px] font-bold block ${dark ? "text-gray-300" : "text-[#111111]"}`}>
            {label}
          </label>
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[10px] font-extrabold flex items-center gap-1 hover:underline ${
                dark ? "text-[#FCBF14]" : "text-primary-amber"
              }`}
              title="Preview / test link destination in new tab"
            >
              <span>Test Link</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      )}

      {/* Preset Selector Dropdown */}
      <div className="relative">
        <select
          value={isPredefined ? value : "__custom__"}
          onChange={handleSelectPreset}
          className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
            dark
              ? "bg-[#1E1E1E] border-white/20 text-[#FCBF14] focus:border-[#FCBF14]"
              : "bg-[#FFF9E8] border-[#111111]/20 text-[#111111] focus:border-primary"
          }`}
        >
          <option value="__custom__">
            {isPredefined ? "-- Select Destination Route --" : "Custom Route / External Link..."}
          </option>
          {Object.entries(categories).map(([catName, opts]) => (
            <optgroup key={catName} label={catName} className={dark ? "bg-[#111111] text-white" : "bg-white text-[#111111]"}>
              {opts.map((opt) => (
                <option key={opt.url} value={opt.url}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Direct URL Input with Icon */}
      <div className="relative flex items-center">
        <Compass
          size={13}
          className={`absolute left-2.5 pointer-events-none ${
            dark ? "text-gray-400" : "text-[#726F6D]"
          }`}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium transition-colors border ${
            dark
              ? "bg-[#141414] border-white/15 text-white placeholder-gray-500 focus:border-[#FCBF14]"
              : "bg-white border-[#111111]/15 text-[#111111] placeholder-[#726F6D] focus:border-primary"
          }`}
        />
      </div>
    </div>
  );
};
