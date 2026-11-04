import React from "react";
import { Search, ArrowUpDown, Sliders, FileSpreadsheet, LayoutGrid, Eye, EyeOff, Coins } from "lucide-react";

interface TemplatesToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  categoriesList: string[];
  templates: any[];
  onOpenCategoryModal: () => void;
  sort: string;
  onSortChange: (val: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  filter: "all" | "published" | "draft" | "free";
  onFilterChange: (filter: "all" | "published" | "draft" | "free") => void;
  filteredCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const TemplatesToolbar: React.FC<TemplatesToolbarProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categoriesList,
  templates,
  onOpenCategoryModal,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  filter,
  onFilterChange,
  filteredCount,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#111111]/10 shadow-xs space-y-4 mb-6 text-left">
      {/* Row 1: Search, Category Filter, Sort Filter, and View Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#726F6D]" />
          <input
            type="text"
            placeholder="Search templates by title, SKU, keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill pl-9 pr-8 py-2.5 text-xs font-medium text-[#111111] outline-none focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[#726F6D] hover:text-[#111111] font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Controls: Category, Sort, View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-1.5 shadow-2xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#726F6D]">Category:</span>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#111111] outline-none cursor-pointer pr-1"
            >
              <option value="All">All Categories ({templates.length})</option>
              {categoriesList.map((cat) => {
                const count = templates.filter((t: any) => t.category?.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Manage Categories Modal Trigger Button */}
          <button
            type="button"
            onClick={onOpenCategoryModal}
            className="hex-pill bg-white hover:bg-gray-50 border border-primary/40 text-primary-amber text-xs font-extrabold px-3 py-2 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            title="Manage taxonomy & categories"
          >
            <Sliders size={13} />
            <span>Manage Categories</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-1.5 shadow-2xs">
            <ArrowUpDown size={13} className="text-primary-amber" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#726F6D]">Sort:</span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#111111] outline-none cursor-pointer pr-1"
            >
              <option value="date_desc">Latest to Oldest (Uploaded)</option>
              <option value="date_asc">Oldest to Latest (Uploaded)</option>
              <option value="title_asc">Title: A to Z</option>
              <option value="title_desc">Title: Z to A</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="downloads_desc">Downloads: Most to Least</option>
              <option value="slides_desc">Slides: High to Low</option>
            </select>
          </div>

          {/* View Mode Toggle: Table vs Grid */}
          <div className="flex items-center bg-[#FFF9E8] border border-[#111111]/12 p-0.5 rounded-full shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`px-3 py-1.5 text-xs font-black rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#111111] text-[#FCBF14] shadow-xs"
                  : "text-[#726F6D] hover:text-[#111111]"
              }`}
              title="Table View"
            >
              <FileSpreadsheet size={13} />
              <span className="hidden sm:inline">Table View</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-1.5 text-xs font-black rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#111111] text-[#FCBF14] shadow-xs"
                  : "text-[#726F6D] hover:text-[#111111]"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Status Filter Tabs and Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#111111]/8">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#111111] text-[#FCBF14]"
                : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111]"
            }`}
          >
            All Templates ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("published")}
            className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "published"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <Eye size={12} />
            <span>Enabled ({templates.filter((t: any) => t.is_published !== false).length})</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("draft")}
            className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "draft"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <EyeOff size={12} />
            <span>Hidden / Draft ({templates.filter((t: any) => t.is_published === false).length})</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("free")}
            className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "free"
                ? "bg-primary text-[#111111]"
                : "bg-primary/20 text-[#111111] hover:bg-primary/30"
            }`}
          >
            <Coins size={12} />
            <span>Free Community ({templates.filter((t: any) => t.is_credit_eligible).length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#726F6D] font-bold">
            Showing {filteredCount} of {templates.length} Decks
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
