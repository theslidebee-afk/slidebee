import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Download, Eye, ArrowRight, Star, FileText, Crown, Check } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useStudioStore, type StoreTemplate } from "../modules/StudioStoreClient";
import { usePageSEO } from "../hooks/usePageSEO";
import { supabase } from "../lib/supabase";

export type { StoreTemplate as TemplateItem };

export default function Templates() {
  usePageSEO({
    title: "Premium PowerPoint Templates & Slide Decks | SlideBee",
    description: "Browse 100% editable corporate PowerPoint templates, pitch decks, keynote presentations, and master systems. Free templates with 3 daily downloads, and premium templates for Monthly, Yearly, and Lifetime members.",
  });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialTier = (searchParams.get("tier") as "all" | "free" | "premium") || (searchParams.get("freeCredits") === "true" ? "free" : "all");

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "premium">(initialTier);
  const [isProUser, setIsProUser] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<string>("free");

  useEffect(() => {
    const checkProStatus = async () => {
      let email = "";
      const local = localStorage.getItem("slidebee_client_user");
      if (local) {
        try {
          const u = JSON.parse(local);
          if (u?.email) email = u.email;
          if (u?.tier) {
            setUserTier(u.tier);
            if (["monthly", "yearly", "lifetime"].includes(u.tier)) {
              setIsProUser(true);
              return;
            }
          }
        } catch (e) {}
      }
      if (!email) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) email = data.user.email;
      }
      if (email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tier")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (profile?.tier) {
          setUserTier(profile.tier);
          if (["monthly", "yearly", "lifetime"].includes(profile.tier)) {
            setIsProUser(true);
            return;
          }
        }

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_email", email.toLowerCase().trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (
          sub &&
          sub.status === "active" &&
          (!sub.current_period_end || new Date(sub.current_period_end) > new Date())
        ) {
          setIsProUser(true);
        }
      }
    };
    checkProStatus();
  }, []);

  // Read dynamically from deep storefront hook
  const { templates: allTemplates, loading, showStars, showDownloads } = useStudioStore();
  const { formatPrice } = useCurrency();

  // Distinct category list
  const categories = ["All", ...Array.from(new Set(allTemplates.map(t => t.category)))];

  const filteredTemplates = allTemplates.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier =
      tierFilter === "all" ||
      (tierFilter === "free" && !item.is_premium) ||
      (tierFilter === "premium" && item.is_premium);
    return matchesCategory && matchesSearch && matchesTier;
  });

  const freeTemplates = allTemplates.filter(t => !t.is_premium);
  const premiumTemplates = allTemplates.filter(t => t.is_premium);

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        
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

            {/* Quick Segment Filter: All / Free (3/day) / Premium */}
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
                  className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all ${
                    tierFilter === "all"
                      ? "bg-[#111111] text-[#FCBF14] shadow"
                      : "text-[#726F6D] hover:text-[#111111]"
                  }`}
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
                  className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 ${
                    tierFilter === "free"
                      ? "bg-emerald-700 text-white shadow"
                      : "text-[#726F6D] hover:text-[#111111]"
                  }`}
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
                  className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 ${
                    tierFilter === "premium"
                      ? "bg-primary text-[#111111] shadow"
                      : "text-[#726F6D] hover:text-[#111111]"
                  }`}
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
                  Full 30+ slide executive frameworks unlocked with Monthly ($5), Yearly ($45), or Lifetime ($75) membership.
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
                setTierFilter("all");
                setSearchParams({});
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
                {/* Direction 2: Framed Presentation Canvas (Inset Slide Mockup) */}
                <div className="p-3 sm:p-3.5 bg-[#FFF9E8]/75 border-b border-primary/20">
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-white shadow-sm border border-[#111111]/10 group-hover:shadow-md transition-all duration-300">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-contain bg-white group-hover:scale-102 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                      <span className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-xl">
                        <Eye size={13} /> View Full Deck
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pt-3.5 flex flex-col flex-grow justify-between">
                  <div>
                    {/* Category & Tags Row (Off the slide canvas) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber">
                        {item.category}
                      </span>
                      {!item.is_premium ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          FREE TEMPLATE
                        </span>
                      ) : (
                        <span className="bg-[#111111] text-[#FCBF14] border border-[#FCBF14]/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crown size={9} className="fill-[#FCBF14]" /> PREMIUM
                        </span>
                      )}
                      {showStars && item.rating ? (
                        <span className="text-[#111111] text-[10px] font-extrabold flex items-center gap-1">
                          <Star size={10} className="text-amber-500 fill-amber-500" /> {item.rating}
                        </span>
                      ) : null}
                    </div>

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
                        {!item.is_premium ? (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-heading font-black text-emerald-800">
                                Free
                              </span>
                              <span className="text-xs text-[#726F6D] line-through font-bold">
                                {formatPrice(item.price_inr)}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 block">
                              3 Free Downloads / Day
                            </span>
                          </>
                        ) : isProUser ? (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-heading font-black text-[#111111]">
                                Unlocked
                              </span>
                              <span className="text-xs text-[#726F6D] line-through font-bold">
                                {formatPrice(item.price_inr)}
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-primary-amber flex items-center gap-1 mt-0.5">
                              <Crown size={10} /> Pro Plan Access
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="text-lg font-heading font-black text-[#111111]">
                              {formatPrice(item.price_inr)}
                            </div>
                            {item.original_price_inr && (
                              <div className="text-[10px] text-[#726F6D] line-through font-medium">
                                {formatPrice(item.original_price_inr)}
                              </div>
                            )}
                            <span className="text-[10px] font-bold text-primary-amber block">
                              Unlocked with $5/mo Pro
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Deliverable Badge */}
                      <div className="flex items-center gap-1.5 bg-[#FFF9E8] border border-primary/40 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#111111]">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        PowerPoint (.pptx)
                      </div>
                    </div>

                    {/* Tier Subtext */}
                    {!item.is_premium ? (
                      <div className="text-[10px] text-emerald-700 font-extrabold mb-2.5 flex items-center gap-1">
                        <Check size={11} /> 100% Free with Basic Registration
                      </div>
                    ) : isProUser ? (
                      <div className="text-[10px] text-emerald-700 font-extrabold mb-2.5 flex items-center gap-1">
                        <Crown size={11} className="text-amber-500" /> Included with Pro Membership Quota
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

                    {!item.is_premium ? (
                      <Link
                        to={`/template/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
                      >
                        <Download size={14} /> Download Free <ArrowRight size={12} />
                      </Link>
                    ) : isProUser ? (
                      <Link
                        to={`/template/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
                      >
                        <Crown size={14} className="text-[#111111]" /> Download with Pro <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <Link
                        to={`/template/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hex-pill w-full bg-[#111111] hover:bg-black text-[#FCBF14] font-extrabold py-3 text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm text-center border border-primary/30"
                      >
                        <Download size={14} /> Unlock with Pro ($5) <ArrowRight size={12} />
                      </Link>
                    )}
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
