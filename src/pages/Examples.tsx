import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { d1 } from "../lib/d1";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  DEFAULT_MAPPED_ITEMS,
  PortfolioCard,
  PortfolioModal,
  PortfolioToolbar,
  type PortfolioItem
} from "../features/examples";

export default function Examples() {
  usePageSEO({
    title: "Presentation Design Portfolio & Case Studies | SlideBee",
    description: "Explore presentation redesign case studies, venture pitch decks, and corporate keynotes delivered for Fortune 500 brands and high-growth startups.",
  });

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [activeModalSlide, setActiveModalSlide] = useState<number>(0);
  const [items, setItems] = useState<PortfolioItem[]>(DEFAULT_MAPPED_ITEMS);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryList, setCategoryList] = useState<string[]>([
    "All",
    "Brand & Marketing",
    "Corporate & Finance",
    "Healthcare & Tech",
    "Strategy & Operations"
  ]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchPortfolio() {
      try {
        const { data, error } = await d1
          .from("site_config")
          .select("value")
          .eq("key", "portfolio_cms")
          .single();

        if (!isMounted) return;

        if (!error && data?.value?.caseStudies && Array.isArray(data.value.caseStudies) && data.value.caseStudies.length > 0) {
          const mapped: PortfolioItem[] = data.value.caseStudies.map((cs: any) => {
            const slideList: string[] = Array.isArray(cs.slides) && cs.slides.length > 0
              ? cs.slides
              : (Array.isArray(cs.slideUrls) && cs.slideUrls.length > 0
                  ? cs.slideUrls
                  : (cs.imageUrl ? [cs.imageUrl] : []));
            return {
              id: cs.id,
              title: cs.title,
              client: cs.client,
              category: cs.category,
              image: cs.imageUrl || slideList[0] || "/examples/accenture_slide-1.jpg",
              slides: slideList.length > 0 ? slideList : undefined,
              description: cs.description,
              highlights: cs.deliverables || [cs.impact || "High-impact presentation design"]
            };
          });
          setItems(mapped);
        } else {
          setItems(DEFAULT_MAPPED_ITEMS);
        }

        if (data?.value?.categories && Array.isArray(data.value.categories)) {
          setCategoryList(data.value.categories);
        }
      } catch (err) {
        console.error("Failed to load portfolio CMS:", err);
        setItems(DEFAULT_MAPPED_ITEMS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPortfolio();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm.trim() ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.highlights.some((h) => h.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      {/* 1. HERO SECTION */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/12 rounded-full blur-[140px] pointer-events-none" />

        <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          Proven Client Work & Case Studies
        </span>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#111111] leading-[1.12] mb-4 tracking-tight">
          Our Executive <br />
          <span className="text-primary-amber">Presentation Portfolio.</span>
        </h1>

        <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
          Explore real client presentations, investor pitch decks, and strategic keynotes designed for global brands.
        </p>
      </section>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <PortfolioToolbar
        categoryList={categoryList}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        searchTerm={searchTerm}
        onSearchChange={(q) => setSearchTerm(q)}
      />

      {/* 3. PORTFOLIO GRID */}
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="hex-card-lg bg-white border-2 border-primary/20 p-5 animate-pulse rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/10] bg-[#111111]/10 rounded-xl mb-4" />
                  <div className="w-24 h-4 bg-primary/20 rounded mb-2" />
                  <div className="w-4/5 h-5 bg-black/10 rounded mb-3" />
                  <div className="w-full h-3.5 bg-black/5 rounded mb-1.5" />
                  <div className="w-2/3 h-3.5 bg-black/5 rounded mb-4" />
                </div>
                <div className="flex gap-2 pt-3 border-t border-black/5">
                  <div className="w-20 h-4 bg-primary/15 rounded" />
                  <div className="w-24 h-4 bg-primary/15 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white border-2 border-primary/30 rounded-2xl hex-card p-8 max-w-md mx-auto shadow-sm">
            <p className="text-base font-extrabold text-[#111111] mb-2">No presentations found</p>
            <p className="text-xs text-[#726F6D] mb-4">
              Try adjusting your search query or switching to another category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
              }}
              className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2 text-xs transition-all shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <PortfolioCard
                key={item.id}
                item={item}
                onSelect={(selectedItem, slideIdx) => {
                  setActiveModalItem(selectedItem);
                  setActiveModalSlide(slideIdx);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL PREVIEW */}
      <PortfolioModal
        item={activeModalItem}
        activeSlide={activeModalSlide}
        onClose={() => setActiveModalItem(null)}
        onSelectSlide={(idx) => setActiveModalSlide(idx)}
      />
    </div>
  );
}
