import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface SlideBeeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  name?: string;
}

export const SlideBeeSelect: React.FC<SlideBeeSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
        {label}
      </label>

      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between min-h-[48px] bg-[#FFF9E8] border-2 transition-all duration-200 rounded-2xl px-4 py-3 text-left text-base sm:text-sm font-bold text-[#111111] shadow-sm cursor-pointer select-none ${
          isOpen
            ? "border-primary ring-2 ring-primary/30 shadow-md"
            : "border-primary/40 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-primary-amber transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#111111]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-2 bg-[#FFFDF7] border-2 border-primary rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden py-1.5 max-h-60 overflow-y-auto"
            role="listbox"
          >
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 min-h-[44px] text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary text-[#111111] font-black"
                      : "text-[#111111] font-semibold hover:bg-primary/20"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#111111] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
