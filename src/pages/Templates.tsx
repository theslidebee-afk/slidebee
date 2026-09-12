import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Download, Eye, ArrowRight, Star, FileText, Sparkles } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useStudioStore, type StoreTemplate } from "../modules/StudioStoreClient";

export type { StoreTemplate as TemplateItem };

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialOnlyFree = searchParams.get("freeCredits") === "true";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [onlyCreditEligible, setOnlyCreditEligible] = useState<boolean>(initialOnlyFree);

  const { formatPrice } = useCurrency();

  // Deep Module: StudioStoreClient
  const { templates: filteredTemplates, allTemplates, freeTemplates, showStars, showDownloads, loading } = useStudioStore({
    category: selectedCategory,
    searchQuery,
    onlyCreditEligible
  });

  const categories = [
    "All",
    "Business",
    "Pitch Decks",
    "Infographics",
    "Marketing",
    "Strategy",
    "Education",
    "Finance",
    "Timelines"
  ];

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-20 large-hex-grid">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
            SlideBee Presentation Studio
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-3 leading-tight">
            Executive Presentation Templates
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium">
            Handcrafted, board-ready PowerPoint (.pptx) master decks engineered for senior leaders and founders.
          </p>
        </div>

        {/* Search & Deliverable Guarantee Bar */}
        <div className="hex-card bg-white border border-[#111111]/8 p-4 md:p-6 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#726F6D]" />
              <input
                type="text"
                placeholder="Search templates, pitch decks, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hex-card w-full bg-[#FFF9E8] border border-[#111111]/10 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-[#111111] placeholder-gray-400 focus:outline-none focus:border-primary font-medium"
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

            {/* Quick Actions: Free Starter Credits Library Toggle & Deliverable Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const nextVal = !onlyCreditEligible;
                  setOnlyCreditEligible(nextVal);
                  if (nextVal) {
                    setSearchParams(prev => ({ ...Object.fromEntries(prev.entries()), freeCredits: "true" }));
                  } else {
                    searchParams.delete("freeCredits");
                    setSearchParams(searchParams);
                  }
                }}
                className={`hex-pill px-4 py-2 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm border ${
                  onlyCreditEligible
                    ? "bg-[#111111] text-primary border-primary"
                    : "bg-[#FFF9E8] text-[#111111] border-primary/50 hover:bg-primary/20"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-amber" />
                <span>5 Free Credits Library ({freeTemplates.length})</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-extrabold text-[#111111] bg-[#FFF9E8] border border-primary/40 px-3.5 py-2 rounded-xl">
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
                  setSelectedCategory(cat);
                  setSearchParams(cat === "All" ? {} : { category: cat });
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

        {/* Free Credits Library Banner if Filter Active */}
        {onlyCreditEligible && (
          <div className="hex-card bg-[#FFFDF5] border-2 border-primary/50 p-4 sm:p-5 mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#111111]" />
              </div>
              <div>
                <h4 className="text-sm font-heading font-extrabold text-[#111111]">
                  Design Credits Library (1 Free Master Deck with 5 Credits)
                </h4>
                <p className="text-xs text-[#726F6D] font-medium">
                  Showing designated templates eligible for your 5 free registration credits.
                </p>
              </div>
            </div>
            <button
              onClick={() => setOnlyCreditEligible(false)}
              className="hex-pill text-xs font-extrabold text-[#111111] bg-white border border-primary/40 px-3.5 py-1.5 hover:bg-primary/20 shrink-0"
            >
              View Full Catalog ({allTemplates.length})
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-extrabold text-[#726F6D] uppercase tracking-wider">
              Loading Executive Catalog...
            </p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="hex-card bg-white border border-[#111111]/8 p-12 text-center max-w-lg mx-auto shadow-sm">
            <FileText size={40} className="mx-auto text-primary-amber mb-3" />
            <h3 className="text-xl font-heading font-extrabold text-[#111111] mb-2">
              No Templates Matching Your Query
            </h3>
            <p className="text-xs text-[#726F6D] mb-6 font-medium">
              We couldn't find any templates matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setOnlyCreditEligible(false);
              }}
              className="hex-pill bg-primary text-[#111111] font-extrabold px-6 py-2.5 text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="hex-card group bg-white border-2 border-primary/35 overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 flex flex-col justify-between shadow-sm cursor-pointer"
                onClick={() => navigate(`/template/${item.id}`)}
              >
                {/* Half-Hexagon Preview Cut */}
                <div className="half-hex-preview relative aspect-[16/11] overflow-hidden bg-black/5 border-b border-primary/20">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Badge */}
                  <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/85 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-0.5 z-10 border border-primary/30">
                    {item.category}
                  </div>

                  {/* Credit Eligible Tag */}
                  {item.is_credit_eligible && (
                    <div className="hex-pill-sm absolute top-3 right-3 bg-primary text-[#111111] text-[10px] font-black px-2.5 py-0.5 z-10 shadow border border-[#111111]/20 flex items-center gap-1">
                      <Sparkles size={10} /> 5 Free Credits Tag
                    </div>
                  )}

                  {/* Optional Star Rating (Controlled by Admin Toggle) */}
                  {showStars && item.rating && !item.is_credit_eligible ? (
                    <div className="hex-pill-sm absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#111111] text-[10px] font-extrabold px-2.5 py-0.5 shadow z-10 border border-primary/30 inline-flex items-center gap-1">
                      <Star size={10} className="text-amber-500 fill-amber-500" /> {item.rating}
                    </div>
                  ) : null}

                  {/* Quick Preview Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                    <Link
                      to={`/template/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-5 py-2.5 flex items-center gap-1.5 shadow-xl hover:scale-105 transition-transform"
                    >
                      <Eye size={13} /> View Full Deck
                    </Link>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pt-3 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-heading font-extrabold text-base text-[#111111] group-hover:text-primary-amber transition-colors mb-1.5 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#726F6D] line-clamp-2 leading-relaxed mb-4 font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between pt-3 border-t border-primary/15 mb-3">
                      <div>
                        <div className="text-lg font-heading font-black text-[#111111]">
                          {formatPrice(item.price_inr)}
                        </div>
                        {item.original_price_inr && (
                          <div className="text-[10px] text-[#726F6D] line-through font-medium">
                            {formatPrice(item.original_price_inr)}
                          </div>
                        )}
                      </div>
                      
                      {/* Deliverable Badge */}
                      <div className="flex items-center gap-1.5 bg-[#FFF9E8] border border-primary/40 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#111111]">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        PowerPoint (.pptx)
                      </div>
                    </div>

                    {/* Credit Eligibility Subtext */}
                    {item.is_credit_eligible ? (
                      <div className="text-[10px] text-emerald-700 font-extrabold mb-2.5 flex items-center gap-1">
                        <Sparkles size={11} /> Eligible for 5 Free Starter Credits
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#726F6D] font-medium mb-2.5">
                        Commercial PPTX Master License
                      </div>
                    )}

                    {/* Optional Downloads Metric */}
                    {showDownloads && item.downloads ? (
                      <div className="text-[10px] text-[#726F6D] font-bold mb-2">
                        {item.downloads.toLocaleString()} executive downloads
                      </div>
                    ) : null}

                    <Link
                      to={`/template/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hex-pill w-full bg-[#111111] hover:bg-black text-[#FCBF14] font-extrabold py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center border border-primary/30"
                    >
                      <Download size={14} /> View Details & Buy <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
