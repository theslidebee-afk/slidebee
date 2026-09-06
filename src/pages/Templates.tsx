import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Download, Check, X, Eye, ArrowRight } from "lucide-react";
import SoftwareBadge from "../components/SoftwareIcons";
import { useCurrency } from "../context/CurrencyContext";
import { supabase } from "../lib/supabase";

export interface TemplateItem {
  id: string;
  code?: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  slides?: string[];
  slidesCount: number;
  rating: number;
  downloads: number;
  formats: ("PPT" | "Slides" | "Canva")[];
  description: string;
  features: string[];
}

export const templateCatalog: TemplateItem[] = [
  {
    id: "investor-pitch-deck",
    code: "SLD-101",
    title: "Investor Pitch Deck",
    category: "Pitch Decks",
    price: 499,
    originalPrice: 999,
    image: "/portfolio/case_study_a_1.png",
    slidesCount: 45,
    rating: 4.9,
    downloads: 1420,
    formats: ["PPT", "Slides", "Canva"],
    description: "Series A / Seed funding investor presentation deck with financial models, team layouts, and traction metrics.",
    features: ["45+ High-Conversion Slides", "Light & Dark Theme Included", "Fully Editable Vector Charts"]
  },
  {
    id: "company-profile-2024",
    code: "SLD-102",
    title: "Company Profile 2024",
    category: "Business",
    price: 299,
    originalPrice: 599,
    image: "/portfolio/nike_hsbc_cvs_2.png",
    slidesCount: 30,
    rating: 4.8,
    downloads: 980,
    formats: ["PPT", "Slides"],
    description: "Complete corporate credentials, leadership, milestones, and portfolio presentation toolkit.",
    features: ["30+ Clean Layouts", "Drag-and-Drop Image Placeholders", "Brand Guidelines Slide"]
  },
  {
    id: "swot-analysis-suite",
    code: "SLD-103",
    title: "SWOT Analysis Suite",
    category: "Strategy",
    price: 299,
    originalPrice: 499,
    image: "/portfolio/case_study_a_2.png",
    slidesCount: 25,
    rating: 4.9,
    downloads: 1120,
    formats: ["PPT", "Slides", "Canva"],
    description: "Modern strategic analysis frameworks, matrix layouts, and competitive positioning maps.",
    features: ["25 Matrix & SWOT Variations", "High-Resolution Icons", "Free Font Files Included"]
  },
  {
    id: "marketing-growth-plan",
    code: "SLD-104",
    title: "Marketing Growth Plan",
    category: "Marketing",
    price: 499,
    originalPrice: 899,
    image: "/portfolio/case_study_a_8.png",
    slidesCount: 40,
    rating: 4.7,
    downloads: 870,
    formats: ["PPT", "Slides", "Canva"],
    description: "Campaign funnels, customer personas, CAC/LTV charts, and omnichannel go-to-market strategies.",
    features: ["40+ Funnel & Channel Slides", "KPI Dashboard Layouts", "Canva & PPT Versions"]
  },
  {
    id: "timeline-milestones-pack",
    code: "SLD-105",
    title: "Timeline & Roadmap Pack",
    category: "Timelines",
    price: 299,
    originalPrice: 499,
    image: "/portfolio/nike_hsbc_cvs_8.png",
    slidesCount: 35,
    rating: 4.9,
    downloads: 2150,
    formats: ["PPT", "Slides"],
    description: "Quarterly roadmaps, project Gantt charts, sprint timelines, and corporate history milestones.",
    features: ["35 Diverse Timeline Variations", "Horizontal & Vertical Formats", "Easy Date Editing"]
  },
  {
    id: "kpi-executive-dashboard",
    code: "SLD-106",
    title: "KPI & Metrics Dashboard",
    category: "Finance",
    price: 499,
    originalPrice: 899,
    image: "/portfolio/nike_hsbc_cvs_10.png",
    slidesCount: 38,
    rating: 4.8,
    downloads: 1340,
    formats: ["PPT", "Slides", "Canva"],
    description: "Excel-linked financial dashboards, revenue breakdowns, churn charts, and executive scorecards.",
    features: ["Excel-Linked Dynamic Charts", "Dark & Light Mode Included", "Executive Summary Slides"]
  },
  {
    id: "product-roadmap-slides",
    code: "SLD-107",
    title: "Product Roadmap Slides",
    category: "Strategy",
    price: 499,
    originalPrice: 799,
    image: "/portfolio/case_study_a_14.png",
    slidesCount: 32,
    rating: 4.9,
    downloads: 910,
    formats: ["PPT", "Slides"],
    description: "Feature release cycles, user journey maps, and engineering sprint reviews.",
    features: ["Agile Sprint Frameworks", "Feature Prioritization Matrix", "Release Schedule Templates"]
  },
  {
    id: "consulting-master-toolkit",
    code: "SLD-108",
    title: "Consulting Master Toolkit",
    category: "Business",
    price: 799,
    originalPrice: 1499,
    image: "/portfolio/global_brands_1.png",
    slidesCount: 65,
    rating: 5.0,
    downloads: 3200,
    formats: ["PPT", "Slides", "Canva"],
    description: "The ultimate deck inspired by MBB (McKinsey, BCG, Bain) frameworks for client-ready deliverables.",
    features: ["65+ High-Stakes Consulting Slides", "Problem Solving Frameworks", "Client Deliverable Ready"]
  },
  {
    id: "infographics-mega-pack",
    code: "SLD-109",
    title: "Infographics Mega Pack",
    category: "Infographics",
    price: 399,
    originalPrice: 799,
    image: "/portfolio/levis_yuengling_1.png",
    slidesCount: 50,
    rating: 4.9,
    downloads: 1890,
    formats: ["PPT", "Slides", "Canva"],
    description: "Vibrant visual diagrams, process flows, pie charts, pyramid models, and comparison vectors.",
    features: ["500+ Vector Icons", "50 Unique Infographic Slides", "Custom Color Themes"]
  },
  {
    id: "education-workshop-deck",
    code: "SLD-110",
    title: "Masterclass & Workshop Deck",
    category: "Education",
    price: 299,
    originalPrice: 599,
    image: "/portfolio/levis_yuengling_6.png",
    slidesCount: 42,
    rating: 4.8,
    downloads: 780,
    formats: ["PPT", "Slides", "Canva"],
    description: "Engaging training, webinar, course, and keynote presentation layouts with exercise slides.",
    features: ["Interactive Exercise Slides", "Q&A & Agenda Frameworks", "Certificate & Handout Layouts"]
  }
];

export default function Templates() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [activeModalTemplate, setActiveModalTemplate] = useState<TemplateItem | null>(null);
  const [templatesList, setTemplatesList] = useState<TemplateItem[]>(templateCatalog);
  
  const { formatPrice } = useCurrency();

  useEffect(() => {
    supabase
      .from("templates")
      .select("*")
      .then(({ data, error }) => {
        if (data && !error && data.length > 0) {
          const mapped: TemplateItem[] = data.map((t: any) => ({
            id: t.id,
            code: t.code || `SLD-${t.id.slice(0, 4).toUpperCase()}`,
            title: t.title,
            category: t.category,
            price: t.price_inr || 499,
            originalPrice: t.original_price_inr || (t.price_inr ? t.price_inr * 2 : 999),
            image: t.thumbnail_url || "/portfolio/case_study_a_1.png",
            slides: t.slides || [],
            slidesCount: t.slide_count || 25,
            rating: 4.9,
            downloads: 80,
            formats: Array.isArray(t.formats) && t.formats.length > 0 ? t.formats : ["PowerPoint", "Google Slides", "Canva"],
            description: t.description || "Executive presentation deck tailored for high-stakes business meetings.",
            features: [
              `${t.slide_count || 25}+ High-Impact Slides`,
              "16:9 Widescreen Layout",
              "Fully Editable Vector Elements"
            ]
          }));
          // Merge custom database templates with static catalog
          setTemplatesList([...mapped, ...templateCatalog]);
        }
      });
  }, []);

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

  const filteredTemplates = useMemo(() => {
    return templatesList.filter((t) => {
      const matchCategory = selectedCategory === "All" || t.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchFormat = selectedFormat === "All" || t.formats.includes(selectedFormat as any);
      return matchCategory && matchSearch && matchFormat;
    });
  }, [templatesList, selectedCategory, searchQuery, selectedFormat]);

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-20 large-hex-grid">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
            SlideBee Template Marketplace 🐝
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-3 leading-tight">
            Explore Premium Presentation Templates
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium">
            Handcrafted, pixel-perfect PowerPoint, Google Slides, and Canva templates for executive leaders.
          </p>
        </div>

        {/* Search & Filter Bar (Hex Card) */}
        <div className="hex-card bg-white border border-[#111111]/8 p-4 md:p-6 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            
            {/* Search Input (Hex Capsule) */}
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

            {/* Format Filter (Hex Pills) */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs text-[#726F6D] font-bold uppercase tracking-wider shrink-0">
                Format:
              </span>
              {["All", "PPT", "Slides", "Canva"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`hex-pill px-4 py-1.5 text-xs font-extrabold transition-all shrink-0 ${
                    selectedFormat === fmt
                      ? "bg-primary text-[#111111] shadow-sm"
                      : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111] border border-[#111111]/5"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills Strip (Hex Pills) */}
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

        {/* Templates Grid (Hex Cards with Half-Hex Slide Previews) */}
        {filteredTemplates.length === 0 ? (
          <div className="hex-card bg-white border border-[#111111]/8 p-12 text-center max-w-lg mx-auto shadow-sm">
            <h3 className="text-xl font-heading font-extrabold text-[#111111] mb-2">
              No templates found
            </h3>
            <p className="text-xs text-[#726F6D] mb-6 font-medium">
              We couldn't find any templates matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedFormat("All");
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
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Badge */}
                  <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/85 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-0.5 z-10 border border-primary/30">
                    {item.category}
                  </div>

                  {/* SKU Code Badge */}
                  <div className="hex-pill-sm absolute bottom-3 left-3 bg-[#111111]/90 backdrop-blur-md text-primary text-[10px] font-black px-2.5 py-0.5 shadow z-10 border border-primary/40">
                    {item.code || `SLD-${item.id.slice(0, 4).toUpperCase()}`}
                  </div>

                  <div className="hex-pill-sm absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#111111] text-[10px] font-extrabold px-2.5 py-0.5 shadow z-10 border border-primary/30">
                    ⭐ {item.rating}
                  </div>

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
                          {formatPrice(item.price)}
                        </div>
                        {item.originalPrice && (
                          <div className="text-[10px] text-[#726F6D] line-through font-medium">
                            {formatPrice(item.originalPrice)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {item.formats.map((fmt) => (
                          <SoftwareBadge key={fmt} format={fmt} size="sm" showLabel={true} />
                        ))}
                      </div>
                    </div>

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

      {/* Quick Preview & Buy Modal (Hex Frame) */}
      <AnimatePresence>
        {activeModalTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveModalTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="hex-card bg-white border border-[#111111]/10 max-w-2xl w-full overflow-hidden shadow-2xl relative my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalTemplate(null)}
                className="hex-pill absolute top-4 right-4 z-20 bg-black/70 hover:bg-black text-white p-2 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Preview Image */}
              <div className="half-hex-preview relative aspect-[16/9] bg-black">
                <img
                  src={activeModalTemplate.image}
                  alt={activeModalTemplate.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/30 text-xs font-extrabold px-4 py-1 uppercase tracking-wider mb-2">
                      {activeModalTemplate.category} • {activeModalTemplate.slidesCount} Slides
                    </div>
                    <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-[#111111]">
                      {activeModalTemplate.title}
                    </h2>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-3xl font-heading font-black text-[#111111]">
                      {formatPrice(activeModalTemplate.price)}
                    </div>
                    {activeModalTemplate.originalPrice && (
                      <div className="text-sm text-[#726F6D] line-through font-medium">
                        MRP {formatPrice(activeModalTemplate.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[#726F6D] text-sm leading-relaxed font-medium">
                  {activeModalTemplate.description}
                </p>

                {/* Features List */}
                <div className="hex-card bg-[#FFF9E8] border border-[#111111]/5 p-4 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    What's Included:
                  </h4>
                  {activeModalTemplate.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#111111] font-medium">
                      <Check className="w-4 h-4 text-primary-amber shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Download / Buy Button */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#111111]/10">
                  <button
                    onClick={() => {
                      alert(`Thank you for your interest in "${activeModalTemplate.title}". Instant download checkout is being linked.`);
                    }}
                    className="hex-pill w-full sm:flex-1 bg-primary hover:bg-primary-dark text-[#111111] font-black py-4 text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:scale-[1.02]"
                  >
                    <Download size={18} /> Instant Download ({formatPrice(activeModalTemplate.price)})
                  </button>
                  <Link
                    to="/ordernow"
                    className="hex-pill w-full sm:w-auto bg-[#FFF9E8] hover:bg-primary/20 border border-[#111111]/10 text-[#111111] font-extrabold py-4 px-6 text-sm text-center transition-all"
                  >
                    Need It Customized?
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
