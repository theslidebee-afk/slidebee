import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { X, ArrowRight, Search } from "lucide-react";
import { supabase } from "../lib/supabase";

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

function getSlideSet(item: PortfolioItem): string[] {
  if (item.slides && item.slides.length > 0) return item.slides;
  const match = item.image.match(/\/portfolio\/([a-zA-Z0-9_]+)_(\d+)\.png/);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10);
    const num2 = (num % 16) + 1;
    const num3 = ((num + 1) % 16) + 1;
    return [
      `/portfolio/${prefix}_${num}.png`,
      `/portfolio/${prefix}_${num2}.png`,
      `/portfolio/${prefix}_${num3}.png`,
    ];
  }
  return [item.image, item.image, item.image];
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
      <div className="aspect-[16/10] bg-[#111111] overflow-hidden relative select-none">
        {/* Active Slide with smooth fade */}
        <img
          src={slides[activeIdx]}
          alt={`${item.title} - Slide ${activeIdx + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
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

const portfolioData: PortfolioItem[] = [
  // Nike & Williams Lea Tag
  {
    id: 1,
    title: "Keynote Agenda & Introduction",
    client: "Nike x WLT",
    category: "Brand & Marketing",
    image: "/portfolio/nike_hsbc_cvs_1.png",
    description: "High-impact brand keynote presentation introducing strategic partnership agenda.",
    highlights: ["Custom typography & layout", "Dynamic brand visuals", "Clear agenda hierarchy"]
  },
  {
    id: 2,
    title: "Executive Chapter Divider",
    client: "Nike x WLT",
    category: "Brand & Marketing",
    image: "/portfolio/nike_hsbc_cvs_2.png",
    description: "Editorial style chapter divider emphasizing focal product visuals.",
    highlights: ["Minimalist luxury aesthetic", "High-contrast focal point", "Brand consistency"]
  },
  {
    id: 3,
    title: "Core Competencies Diagram",
    client: "Williams Lea Tag",
    category: "Strategy & Operations",
    image: "/portfolio/nike_hsbc_cvs_3.png",
    description: "Multi-layered capability matrix visualizing end-to-end creative production services.",
    highlights: ["Interactive workflow map", "Structured data categorization", "Corporate branding"]
  },
  {
    id: 4,
    title: "Sourcing & Print Supply Chain",
    client: "Global Retail",
    category: "Strategy & Operations",
    image: "/portfolio/nike_hsbc_cvs_4.png",
    description: "Technical procurement architecture and global supplier sourcing process flow.",
    highlights: ["Process blueprinting", "Technical infographic", "Clean linear progression"]
  },

  // HSBC
  {
    id: 5,
    title: "Mailroom & Scanning Services Pitch",
    client: "HSBC",
    category: "Corporate & Finance",
    image: "/portfolio/nike_hsbc_cvs_5.png",
    description: "Executive service capability presentation for global banking operations.",
    highlights: ["Corporate identity compliance", "Clean modern typography", "Executive summary layout"]
  },
  {
    id: 6,
    title: "Greater China Footprint & Roadmap",
    client: "HSBC",
    category: "Corporate & Finance",
    image: "/portfolio/nike_hsbc_cvs_6.png",
    description: "Strategic geographic footprint roadmap spanning 2011 to 2018 milestones.",
    highlights: ["Timeline data visualization", "Map infographic", "Multi-year milestone tracking"]
  },
  {
    id: 7,
    title: "Optional Technical Solution Architecture",
    client: "HSBC",
    category: "Corporate & Finance",
    image: "/portfolio/nike_hsbc_cvs_7.png",
    description: "Technical scanner fleet hardware and process optimization breakdown.",
    highlights: ["Hardware specs diagram", "Efficiency comparison metrics", "Step-by-step phasing"]
  },
  {
    id: 8,
    title: "Cost Savings & Headcount Matrix",
    client: "HSBC",
    category: "Corporate & Finance",
    image: "/portfolio/nike_hsbc_cvs_8.png",
    description: "Financial savings model demonstrating 40+ FTE reductions and frozen management fees.",
    highlights: ["Financial modeling visuals", "Headcount delta metrics", "Year-over-year cost analysis"]
  },

  // CVS Health
  {
    id: 9,
    title: "Industry Expertise & Pharma Ecosystem",
    client: "CVS Health",
    category: "Healthcare & Tech",
    image: "/portfolio/nike_hsbc_cvs_9.png",
    description: "Healthcare stakeholder ecosystem mapping shopper behaviors, trends, and R&D insights.",
    highlights: ["Healthcare stakeholder map", "Trend & demographic data", "Custom pharmaceutical icons"]
  },
  {
    id: 10,
    title: "Client Roster & Market Leadership",
    client: "CVS Health",
    category: "Healthcare & Tech",
    image: "/portfolio/nike_hsbc_cvs_10.png",
    description: "Marquee client trust showcase visualizing industry tier rankings and partnership longevity.",
    highlights: ["Social proof layout", "Brand logo grid architecture", "Authority building visual matrix"]
  },
  {
    id: 11,
    title: "Omnichannel Creative Capabilities",
    client: "CVS Health",
    category: "Healthcare & Tech",
    image: "/portfolio/nike_hsbc_cvs_11.png",
    description: "Point-of-sale, digital, and print collateral execution matrix across health retail stores.",
    highlights: ["3D retail mockup layout", "Omnichannel workflow", "Color-coded service pillars"]
  },
  {
    id: 12,
    title: "Global Supply Chain Footprint",
    client: "CVS Health",
    category: "Healthcare & Tech",
    image: "/portfolio/nike_hsbc_cvs_12.png",
    description: "Worldwide operational hubs, delivery routes, and automated fulfillment network map.",
    highlights: ["Global hub infographic", "Cross-border transit metrics", "Executive route visualization"]
  },

  // Levi's
  {
    id: 13,
    title: "Global Brand Strategy & Marketing Team",
    client: "Levi's",
    category: "Brand & Marketing",
    image: "/portfolio/levis_yuengling_2.png",
    description: "Global marketing team ideation alignment and regional campaign orchestration.",
    highlights: ["Brand team collaboration map", "Regional insight capture", "Global rollout roadmap"]
  },
  {
    id: 14,
    title: "Benefits & Cost Optimization Framework",
    client: "Levi's",
    category: "Brand & Marketing",
    image: "/portfolio/levis_yuengling_3.png",
    description: "Time savings, money savings, and global alignment metric dashboard.",
    highlights: ["Three-pillar benefit model", "Time & cost saving metrics", "Visual alignment framework"]
  },
  {
    id: 15,
    title: "Milestone Review (2016 – Present)",
    client: "Levi's",
    category: "Brand & Marketing",
    image: "/portfolio/levis_yuengling_4.png",
    description: "Partnership evolution journey tracking campaign fulfillment and strategy workshops.",
    highlights: ["Cyclical timeline diagram", "Discovery workshop milestones", "Campaign delivery lifecycle"]
  },

  // Yuengling
  {
    id: 16,
    title: "Integrated End-to-End Solutions",
    client: "Yuengling",
    category: "Strategy & Operations",
    image: "/portfolio/levis_yuengling_6.png",
    description: "Supply chain fulfillment flowchart from ideation to distribution center delivery.",
    highlights: ["Linear supply chain flow", "Technology & people integration", "Automated workflow steps"]
  },
  {
    id: 17,
    title: "Blended Service Delivery Model",
    client: "Yuengling",
    category: "Strategy & Operations",
    image: "/portfolio/levis_yuengling_7.png",
    description: "On-site, off-site, and hybrid operational staffing and risk management matrix.",
    highlights: ["Three-tier operational matrix", "Disaster recovery SLAs", "Cost-effective staffing models"]
  },
  {
    id: 18,
    title: "Global Capability & Media Ecosystem",
    client: "Yuengling",
    category: "Strategy & Operations",
    image: "/portfolio/levis_yuengling_8.png",
    description: "Broadcast, digital, photography, and cultural adaptation media production hub.",
    highlights: ["Multi-media service wheel", "Asset management ecosystem", "Creative versioning scale"]
  }
];

export default function Examples() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [activeModalSlide, setActiveModalSlide] = useState<number>(0);
  const [items, setItems] = useState<PortfolioItem[]>(portfolioData);
  const [categoryList, setCategoryList] = useState<string[]>([
    "All",
    "Brand & Marketing",
    "Corporate & Finance",
    "Healthcare & Tech",
    "Strategy & Operations"
  ]);

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "portfolio_cms")
      .single()
      .then(({ data }) => {
        if (data?.value?.caseStudies && data.value.caseStudies.length > 0) {
          const mapped: PortfolioItem[] = data.value.caseStudies.map((cs: any) => ({
            id: cs.id,
            title: cs.title,
            client: cs.client,
            category: cs.category,
            image: cs.imageUrl,
            description: cs.description,
            highlights: cs.deliverables || [cs.impact || "High-impact presentation design"]
          }));
          setItems([...mapped, ...portfolioData]);
        }
        if (data?.value?.categories && data.value.categories.length > 0) {
          setCategoryList(data.value.categories);
        }
      });
  }, []);

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

      {/* 3. PORTFOLIO GRID WITH 3-SLIDE HOVER CAROUSEL */}
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
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
                const currentSlideImg = modalSlides[activeModalSlide] || activeModalItem.image;
                return (
                  <div>
                    <div className="aspect-[16/9] bg-[#111111] rounded-2xl overflow-hidden mb-4 shadow-inner relative flex items-center justify-center border-2 border-primary/40">
                      <img
                        src={currentSlideImg}
                        alt={`${activeModalItem.title} - Slide ${activeModalSlide + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/85 text-primary border border-primary/30 text-[10px] font-black px-3 py-1 backdrop-blur-sm shadow">
                        Slide {activeModalSlide + 1} of {modalSlides.length}
                      </div>
                    </div>

                    {/* Slide Thumbnails Selector */}
                    {modalSlides.length > 1 && (
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {modalSlides.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveModalSlide(idx)}
                            className={`hex-card overflow-hidden text-left p-1 border transition-all ${
                              activeModalSlide === idx
                                ? "border-primary ring-2 ring-primary/40 bg-[#FFF9E8]"
                                : "border-primary/25 hover:border-primary/60 bg-white"
                            }`}
                          >
                            <div className="aspect-[16/10] bg-[#111111] rounded overflow-hidden mb-1">
                              <img src={s} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-extrabold text-[#111111] block px-1 truncate">
                              Slide {idx + 1}
                            </span>
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
                      className="hex-pill bg-[#FFF9E8] border border-primary/30 text-xs text-[#111111] font-bold px-3 py-1"
                    >
                      ✓ {h}
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
