import { Search, Crown, FileText, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { SetURLSearchParams } from "react-router-dom";
import { useCurrency } from "../../../context/CurrencyContext";
import type { StoreTemplate } from "../../../modules/StudioStoreClient";

interface TemplatesFilterBarProps {
  allTemplates: StoreTemplate[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tierFilter: "all" | "free" | "premium";
  setTierFilter: (t: "all" | "free" | "premium") => void;
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  userTier: string;
}

export function TemplatesFilterBar({
  allTemplates,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  tierFilter,
  setTierFilter,
  searchParams,
  setSearchParams,
  userTier,
}: TemplatesFilterBarProps) {
  const { currency } = useCurrency();
  const freeTemplates = allTemplates.filter(t => !t.is_premium);
  const premiumTemplates = allTemplates.filter(t => t.is_premium);

  return (
    <>
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <div className="hex-pill inline-flex items-center gap-2 bg-[#111111] text-[#FCBF14] text-xs font-black px-4 py-1.5 uppercase tracking-wider shadow-sm border border-primary/40">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SlideBee Storefront
          </div>
          <div className="hex-pill inline-flex items-center gap-1.5 bg-white text-[#111111] text-xs font-extrabold px-3.5 py-1.5 shadow-sm border border-primary/30">
            <Crown size={12} className="text-primary-amber" />
            <span>Your Plan: {userTier === "free" ? "Basic Free (3/day)" : `${userTier.charAt(0).toUpperCase() + userTier.slice(1)} Pro`}</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-4 tracking-tight">
          Curated Executive Slide Decks
        </h1>
        <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-2xl mx-auto">
          100% editable corporate pitch decks, quarterly business reviews, board reports, and visual frameworks engineered in native Microsoft PowerPoint.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl border-2 border-primary/30 p-4 sm:p-5 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">

          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#726F6D]" />
            <input
              type="text"
              placeholder="Search templates, pitch decks, infographics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF9E8]/70 border border-primary/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#111111] placeholder:text-[#726F6D]/60 focus:outline-none focus:border-primary transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#726F6D] hover:text-[#111111] text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tier Segment Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="hex-pill inline-flex items-center gap-1 bg-[#FFF9E8] p-1 border-2 border-primary/40 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setTierFilter("all");
                  searchParams.delete("tier");
                  searchParams.delete("freeCredits");
                  setSearchParams(searchParams);
                }}
                className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all ${tierFilter === "all" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"}`}
              >
                All ({allTemplates.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setTierFilter("free");
                  searchParams.set("tier", "free");
                  searchParams.delete("freeCredits");
                  setSearchParams(searchParams);
                }}
                className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 ${tierFilter === "free" ? "bg-emerald-700 text-white shadow" : "text-[#726F6D] hover:text-[#111111]"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Free (3/day) ({freeTemplates.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setTierFilter("premium");
                  searchParams.set("tier", "premium");
                  searchParams.delete("freeCredits");
                  setSearchParams(searchParams);
                }}
                className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 ${tierFilter === "premium" ? "bg-primary text-[#111111] shadow" : "text-[#726F6D] hover:text-[#111111]"}`}
              >
                <Crown size={12} className="text-[#111111]" />
                Premium ({premiumTemplates.length})
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-[#111111] bg-[#FFF9E8] border border-primary/40 px-3.5 py-2 rounded-xl">
              <FileText size={15} className="text-primary-amber" />
              <span>Deliverable: Master PowerPoint (.pptx)</span>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (selectedCategory.toLowerCase() === cat.toLowerCase() && cat !== "All") {
                  setSelectedCategory("All");
                  setSearchParams({});
                } else {
                  setSelectedCategory(cat);
                  setSearchParams(cat === "All" ? {} : { category: cat });
                }
              }}
              className={`hex-pill px-5 py-2 text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#111111] text-[#FCBF14] shadow-md"
                  : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111] hover:bg-[#FCBF14]/15 border border-[#111111]/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Free Templates Banner if Filter Active */}
      {tierFilter === "free" && (
        <div className="hex-card bg-emerald-50/80 border-2 border-emerald-300 p-4 sm:p-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h4 className="text-sm font-heading font-extrabold text-[#111111]">
                Basic Free Library (3 Downloads Per Day)
              </h4>
              <p className="text-xs text-[#726F6D] font-medium">
                Showing templates available to all free registered accounts. Up to 3 downloads each day.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTierFilter("all");
              searchParams.delete("tier");
              setSearchParams(searchParams);
            }}
            className="hex-pill text-xs font-extrabold text-[#111111] bg-white border border-emerald-300 px-3.5 py-1.5 hover:bg-emerald-100 shrink-0"
          >
            View All ({allTemplates.length})
          </button>
        </div>
      )}

      {/* Premium Templates Banner if Filter Active */}
      {tierFilter === "premium" && (
        <div className="hex-card bg-[#FFFDF5] border-2 border-primary p-4 sm:p-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-primary-amber" />
            </div>
            <div>
              <h4 className="text-sm font-heading font-extrabold text-[#111111]">
                Premium Executive Decks (30 Templates / Month)
              </h4>
              <p className="text-xs text-[#726F6D] font-medium">
                Full 30+ slide executive frameworks unlocked with Monthly ({currency === "INR" ? "₹399" : "$5"}), Yearly ({currency === "INR" ? "₹3,499" : "$45"}), or Lifetime ({currency === "INR" ? "₹5,999" : "$75"}) membership.
              </p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="hex-pill text-xs font-black text-[#111111] bg-primary border border-primary-dark px-4 py-2 hover:bg-primary-dark shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            Upgrade Plan <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </>
  );
}
