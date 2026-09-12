import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { X, ArrowRight, Search, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { normalizeR2Url, R2_PUBLIC_BASE_URL } from "../lib/r2";
import { usePageSEO } from "../hooks/usePageSEO";

interface PortfolioItem {
  id: number;
  title: string;
  client: string;
  category: "All" | "Brand & Marketing" | "Corporate & Finance" | "Healthcare & Tech" | "Strategy & Operations" | string;
  image: string;
  slides?: string[];
  description: string;
  highlights: string[];
}

const STORAGE_BASE = `${R2_PUBLIC_BASE_URL}/templates/slides`;

export const DEFAULT_PORTFOLIO_CASE_STUDIES = [
  {
    id: 1,
    title: "Global Marketing & Brand Strategy",
    client: "Nike",
    category: "Brand & Marketing",
    storageFolder: "portfolio",
    imageUrl: "/portfolio/nike_hsbc_cvs_8.png",
    slides: ["/portfolio/nike_hsbc_cvs_8.png", "/portfolio/case_study_a_1.png"],
    impact: "$24M Campaign Launch",
    description: "Multi-channel global marketing playbook delivered for executive leadership alignment.",
    deliverables: ["Master PowerPoint (.pptx)", "Executive Keynote"]
  },
  {
    id: 2,
    title: "Private Banking & Wealth Management Keynote",
    client: "HSBC",
    category: "Corporate & Finance",
    storageFolder: "portfolio",
    imageUrl: "/portfolio/nike_hsbc_cvs_1.png",
    slides: ["/portfolio/nike_hsbc_cvs_1.png", "/portfolio/case_study_a_14.png"],
    impact: "$1.2B AUM Allocation",
    description: "High-net-worth investor deck outlining European wealth management positioning.",
    deliverables: ["Investor Deck", "Board Keynote"]
  },
  {
    id: 3,
    title: "Healthcare Digital Transformation",
    client: "CVS Health",
    category: "Healthcare & Tech",
    storageFolder: "portfolio",
    imageUrl: "/portfolio/nike_hsbc_cvs_10.png",
    slides: ["/portfolio/nike_hsbc_cvs_10.png", "/portfolio/global_brands_1.png"],
    impact: "Omnichannel Rollout",
    description: "Strategic telehealth adoption roadmap and patient engagement architecture.",
    deliverables: ["Operational Playbook", "C-Suite Presentation"]
  },
  {
    id: 4,
    title: "Enterprise Strategy & Digital Keynote",
    client: "Accenture",
    category: "Strategy & Operations",
    storageFolder: "use_cases",
    imageUrl: "/portfolio/case_study_a_1.png",
    slides: ["/portfolio/case_study_a_1.png", "/portfolio/case_study_a_14.png"],
    impact: "$18M Client Deal",
    description: "Digital transformation transformation deck for Fortune 50 enterprise client pitch.",
    deliverables: ["Pitch Deck", "Vector Diagram Kit"]
  },
  {
    id: 5,
    title: "Brand Architecture & Licensing Review",
    client: "Levi's",
    category: "Brand & Marketing",
    storageFolder: "use_cases",
    imageUrl: "/portfolio/levis_yuengling_3.png",
    slides: ["/portfolio/levis_yuengling_3.png", "/portfolio/levis_yuengling_4.png"],
    impact: "Global Alignment",
    description: "Three-pillar brand framework, cost optimization metrics, and visual design system.",
    deliverables: ["Brand Playbook", "Executive Summary"]
  },
  {
    id: 6,
    title: "Supply Chain Operations & Media Ecosystem",
    client: "Yuengling",
    category: "Strategy & Operations",
    storageFolder: "use_cases",
    imageUrl: "/portfolio/levis_yuengling_6.png",
    slides: ["/portfolio/levis_yuengling_6.png", "/portfolio/levis_yuengling_7.png", "/portfolio/levis_yuengling_8.png"],
    impact: "Fulfillment Scaled",
    description: "Supply chain fulfillment flowchart and multi-tier operational staffing matrix.",
    deliverables: ["Operations Framework", "Process Flowchart"]
  }
];

const DEFAULT_MAPPED_ITEMS: PortfolioItem[] = DEFAULT_PORTFOLIO_CASE_STUDIES.map((cs) => ({
  id: cs.id,
  title: cs.title,
  client: cs.client,
  category: cs.category,
  image: cs.imageUrl,
  slides: cs.slides,
  description: cs.description,
  highlights: cs.deliverables
}));

export function normalizeSlideUrl(url: string): string {
  if (!url) return `${STORAGE_BASE}/accenture_slide-1.jpg`;
  return normalizeR2Url(url, "slides");
}

function getSlideSet(item: PortfolioItem): string[] {
  if (item.slides && item.slides.length > 0) return item.slides.map(normalizeSlideUrl);
  if (item.image) return [normalizeSlideUrl(item.image)];
  return [`${STORAGE_BASE}/accenture_slide-1.jpg`];
}

function PortfolioCard({ 
  item, 
  onSelect 
}: { 
  item: PortfolioItem; 
  onSelect: (item: PortfolioItem, selectedSlide: number) => void;
}) {
  const slides = getSlideSet(item);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setActiveIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, 1200);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  return (
    <div
      onClick={() => onSelect(item, activeIdx)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
    >
      <div className="aspect-[16/10] bg-[#FFF9E8] overflow-hidden relative select-none border-b border-primary/20">
        {/* Active Slide with smooth fade */}
        <img
          src={slides[activeIdx]}
          alt={`${item.title} - Slide ${activeIdx + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          loading="lazy"
          onError={(e) => {
            const fallback = `${STORAGE_BASE}/accenture_slide-1.jpg`;
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
        />

        {/* Client Badge */}
        <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/90 text-primary text-[10px] font-black px-3 py-1 backdrop-blur-sm shadow z-10">
          {item.client}
        </div>

        {/* 3-Slide Hover Indicator Pill */}
        <div className={`hex-pill-sm absolute top-3 right-3 bg-[#111111]/85 text-white text-[10px] font-extrabold px-2.5 py-0.5 backdrop-blur-sm transition-all duration-300 z-10 flex items-center gap-1 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Slide {activeIdx + 1} / {slides.length}
        </div>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-[#111111]/70 px-2.5 py-1 rounded-full backdrop-blur-sm">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(i);
              }}
              className={`rounded-full transition-all duration-300 ${
                activeIdx === i
                  ? "w-4 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-amber block mb-1">
          {item.category}
        </span>
        <h3 className="font-heading font-extrabold text-base text-[#111111] mb-2 leading-snug group-hover:text-primary-amber transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-[#726F6D] font-medium line-clamp-2 leading-relaxed mb-4">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#111111]/8">
          {item.highlights.slice(0, 2).map((h, i) => (
            <span key={i} className="text-[10px] bg-[#FFF9E8] border border-primary/20 text-[#111111] font-bold px-2 py-0.5 rounded">
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        const { data, error } = await supabase
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

  // Keyboard navigation for active modal slides
  useEffect(() => {
    if (!activeModalItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const modalSlides = getSlideSet(activeModalItem);
      if (e.key === "ArrowLeft") {
        setActiveModalSlide((prev) => (prev - 1 + modalSlides.length) % modalSlides.length);
      } else if (e.key === "ArrowRight") {
        setActiveModalSlide((prev) => (prev + 1) % modalSlides.length);
      } else if (e.key === "Escape") {
        setActiveModalItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalItem]);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.highlights.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      
      {/* 1. HERO SECTION (Warm Milk Cream + Honey Gold Glow) */}
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
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`hex-pill px-5 py-2 text-xs font-extrabold transition-all border ${
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-primary/40 hex-pill pl-10 pr-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary shadow-sm"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

        </div>
      </div>

      {/* 3. PORTFOLIO GRID WITH 4-SLIDE HOVER CAROUSEL */}
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
            <p className="text-xs text-[#726F6D] mb-4">Try adjusting your search query or switching to another category filter.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
              }}
              className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2 text-xs transition-all shadow-sm"
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

      {/* 4. MODAL PREVIEW WITH MULTI-SLIDE NAVIGATION */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="hex-card-lg bg-white border-2 border-primary/50 p-6 sm:p-8 max-w-4xl w-full shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111111] transition-colors hex-pill bg-black/5 hover:bg-black/10"
              >
                <X size={20} />
              </button>

              {/* Main Slide Viewer */}
              {(() => {
                const modalSlides = getSlideSet(activeModalItem);
                const currentSlideImg = normalizeSlideUrl(modalSlides[activeModalSlide] || activeModalItem.image);
                return (
                  <div>
                    <div className="w-full bg-[#FFF9E8] rounded-2xl overflow-hidden mb-4 shadow-inner relative flex items-center justify-center border-2 border-primary/40 group/viewer">
                      <img
                        src={currentSlideImg}
                        alt={`${activeModalItem.title} - Slide ${activeModalSlide + 1}`}
                        className="w-full h-auto block select-none rounded-xl"
                        onError={(e) => {
                          const fallback = `${STORAGE_BASE}/accenture_slide-1.jpg`;
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                      
                      {/* Slide Indicator Badge */}
                      <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/85 text-primary border border-primary/30 text-[10px] font-black px-3 py-1 backdrop-blur-sm shadow z-10">
                        Slide {activeModalSlide + 1} of {modalSlides.length}
                      </div>

                      {/* Prev Slide Arrow */}
                      {modalSlides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setActiveModalSlide((prev) => (prev - 1 + modalSlides.length) % modalSlides.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111]/80 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-80 hover:opacity-100 hover:scale-110"
                          title="Previous Slide (or Left Arrow key)"
                        >
                          <ChevronLeft size={20} />
                        </button>
                      )}

                      {/* Next Slide Arrow */}
                      {modalSlides.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setActiveModalSlide((prev) => (prev + 1) % modalSlides.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111]/80 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-80 hover:opacity-100 hover:scale-110"
                          title="Next Slide (or Right Arrow key)"
                        >
                          <ChevronRight size={20} />
                        </button>
                      )}
                    </div>

                    {/* Slide Thumbnails Selector Gallery */}
                    {modalSlides.length > 1 && (
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-6 custom-scrollbar">
                        {modalSlides.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveModalSlide(idx)}
                            className={`hex-card overflow-hidden text-left p-1 border transition-all shrink-0 w-28 sm:w-32 cursor-pointer ${
                              activeModalSlide === idx
                                ? "border-primary ring-2 ring-primary/40 bg-[#FFF9E8]"
                                : "border-primary/25 hover:border-primary/60 bg-white"
                            }`}
                          >
                            <div className="aspect-[16/10] bg-[#111111] rounded overflow-hidden mb-1">
                              <img src={normalizeSlideUrl(s)} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] font-extrabold text-[#111111] truncate">
                                Slide {idx + 1}
                              </span>
                              {activeModalSlide === idx && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary/20 mb-4">
                <div>
                  <div className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/25 text-[10px] font-black px-3 py-1 uppercase tracking-wider mb-2">
                    {activeModalItem.client} • {activeModalItem.category}
                  </div>
                  <h2 className="text-2xl font-heading font-extrabold text-[#111111]">
                    {activeModalItem.title}
                  </h2>
                </div>

                <Link
                  to={`/ordernow?ref=${encodeURIComponent(activeModalItem.title)}`}
                  className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-3 text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shrink-0"
                >
                  Request Similar Design <ArrowRight size={15} />
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
                {activeModalItem.description}
              </p>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#111111] block mb-2">
                  Key Design Deliverables:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeModalItem.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="hex-pill bg-[#FFF9E8] border border-primary/30 text-xs text-[#111111] font-bold px-3 py-1 inline-flex items-center gap-1.5"
                    >
                      <Check size={11} className="text-emerald-600" /> {h}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
