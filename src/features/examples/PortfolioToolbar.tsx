import React from "react";
import { Search } from "lucide-react";

interface PortfolioToolbarProps {
  categoryList: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (query: string) => void;
}

export const PortfolioToolbar: React.FC<PortfolioToolbarProps> = ({
  categoryList,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          {categoryList.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`hex-pill px-5 py-2 text-xs font-extrabold transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#111111] text-[#FCBF14] border-primary shadow-md scale-105"
                  : "bg-white text-[#111111] border-primary/40 hover:border-primary hover:bg-[#FFF9E8] shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search portfolio..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-primary/40 hex-pill pl-10 pr-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary shadow-sm"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
