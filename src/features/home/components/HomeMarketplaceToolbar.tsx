import React from "react";
import { ArrowUpDown, Crown, Gift, LayoutGrid } from "lucide-react";

export type SortOption = "trending" | "newest" | "price_asc" | "price_desc" | "downloads";

interface HomeMarketplaceToolbarProps {
  totalCount: number;
  startIndex: number;
  endIndex: number;
  tierFilter: "all" | "free" | "premium";
  setTierFilter: (val: "all" | "free" | "premium") => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  categoriesList: string[];
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  freeCount: number;
  premiumCount: number;
}

export const HomeMarketplaceToolbar: React.FC<HomeMarketplaceToolbarProps> = ({
  totalCount,
  startIndex,
  endIndex,
  tierFilter,
  setTierFilter,
  activeCategory,
  setActiveCategory,
  categoriesList,
  sortOption,
  setSortOption,
  freeCount,
  premiumCount,
}) => {
  return (
    <div className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#FCBF14]/40 p-3 sm:p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Left: Live Count Indicator & Quick View Mode */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FCBF14]/20 flex items-center justify-center text-[#111111]">
            <LayoutGrid size={16} />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-heading font-black text-[#111111] block">
              Marketplace Catalog
            </span>
            <span className="text-[11px] text-[#726F6D] font-bold">
              {totalCount > 0 ? (
                <>Showing <span className="text-[#111111] font-black">{startIndex}–{endIndex}</span> of {totalCount} Templates</>
              ) : (
                "0 Templates Found"
              )}
            </span>
          </div>
        </div>

        {/* Tier Toggles (Mobile inline) */}
        <div className="flex items-center gap-1 bg-[#FFF9E8] p-1 rounded-xl border border-[#FCBF14]/30 lg:hidden">
          <button
            onClick={() => setTierFilter("all")}
            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
              tierFilter === "all" ? "bg-[#111111] text-[#FCBF14]" : "text-[#726F6D]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTierFilter("free")}
            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 ${
              tierFilter === "free" ? "bg-emerald-600 text-white" : "text-[#726F6D]"
            }`}
          >
            <Gift size={10} /> Free ({freeCount})
          </button>
          <button
            onClick={() => setTierFilter("premium")}
            className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 ${
              tierFilter === "premium" ? "bg-[#FCBF14] text-[#111111]" : "text-[#726F6D]"
            }`}
          >
            <Crown size={10} /> Pro ({premiumCount})
          </button>
        </div>
      </div>

      {/* Center: Desktop Tier Badges & Category Quick Selector */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Tier Segmented Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FFF9E8] p-1.5 rounded-xl border border-[#FCBF14]/30 shadow-xs">
          <button
            onClick={() => setTierFilter("all")}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
              tierFilter === "all" ? "bg-[#111111] text-[#FCBF14] shadow-xs" : "text-[#726F6D] hover:text-[#111111]"
            }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setTierFilter("free")}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              tierFilter === "free" ? "bg-emerald-600 text-white shadow-xs" : "text-[#726F6D] hover:text-emerald-700"
            }`}
          >
            <Gift size={13} />
            <span>Free Tier ({freeCount})</span>
          </button>
          <button
            onClick={() => setTierFilter("premium")}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              tierFilter === "premium" ? "bg-[#FCBF14] text-[#111111] shadow-xs" : "text-[#726F6D] hover:text-[#111111]"
            }`}
          >
            <Crown size={13} />
            <span>Premium Tier ({premiumCount})</span>
          </button>
        </div>

        {/* Category Dropdown */}
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          aria-label="Filter by category"
          className="bg-white border border-[#111111]/15 text-[#111111] font-heading font-extrabold text-xs px-3.5 py-2 rounded-xl focus:outline-hidden focus:border-[#FCBF14] cursor-pointer"
        >
          <option value="all">All Categories</option>
          <option value="trending">Curated Trending</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Sort By Dropdown */}
      <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
        <span className="text-xs font-bold text-[#726F6D] flex items-center gap-1 shrink-0">
          <ArrowUpDown size={13} className="text-[#FCBF14]" /> Sort By:
        </span>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          aria-label="Sort templates by"
          className="bg-white border border-[#111111]/15 text-[#111111] font-heading font-extrabold text-xs px-3 py-2 rounded-xl focus:outline-hidden focus:border-[#FCBF14] cursor-pointer flex-1 sm:flex-initial"
        >
          <option value="trending">Curated Trending</option>
          <option value="newest">Newest Releases</option>
          <option value="downloads">Most Downloaded</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};
