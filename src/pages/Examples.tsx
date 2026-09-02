import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Sparkles, ArrowRight, ExternalLink } from "lucide-react";

interface PortfolioItem {
  id: number;
  title: string;
  client: string;
  category: "All" | "Brand & Marketing" | "Corporate & Finance" | "Healthcare & Tech" | "Strategy & Operations";
  image: string;
  description: string;
  highlights: string[];
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
    highlights: ["Circular ecosystem chart", "Key stakeholder mapping", "Data point highlights"]
  },
  {
    id: 10,
    title: "Digital Workflow & Technology Platform",
    client: "CVS Health",
    category: "Healthcare & Tech",
    image: "/portfolio/nike_hsbc_cvs_10.png",
    description: "Proprietary digital management tool architecture and mobile interface showcase.",
    highlights: ["Mobile app mockups", "Digital workflow stages", "Volume statistics (2M+ assets)"]
  },
  {
    id: 11,
    title: "Executive Pitch Agenda & Governance",
    client: "CVS Health",
    category: "Healthcare & Tech",
    image: "/portfolio/nike_hsbc_cvs_11.png",
    description: "Strategic governance roadmap highlighting Centers of Excellence and case studies.",
    highlights: ["Modern icon hierarchy", "Step-by-step agenda flow", "Executive polish"]
  },
  {
    id: 12,
    title: "Brand Refresh & Packaging Origination",
    client: "CVS Health",
    category: "Brand & Marketing",
    image: "/portfolio/nike_hsbc_cvs_12.png",
    description: "Multi-SKU pharmaceutical product packaging refresh and brand rollout deck.",
    highlights: ["Packaging visual suite", "3D product asset renders", "Before/After redesign proof"]
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

const categories = [
  "All",
  "Brand & Marketing",
  "Corporate & Finance",
  "Healthcare & Tech",
  "Strategy & Operations"
] as const;

export default function Examples() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

  const filteredItems = selectedCategory === "All"
    ? portfolioData
    : portfolioData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white pt-32 pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          >
            <Sparkles size={14} />
            Proven Client Work & Case Studies
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-extrabold mb-6 leading-tight"
          >
            Our Presentation <span className="text-primary">Portfolio</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 font-light"
          >
            Explore actual keynote slides, executive decks, and financial pitch frameworks designed for world-class enterprises.
          </motion.p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-14">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-primary text-foreground shadow-lg shadow-primary/25 scale-105"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setActiveModalItem(item)}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-pointer flex flex-col"
              >
                {/* Slide Preview Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-black/60 border-b border-white/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="bg-primary text-foreground font-bold px-4 py-2 rounded-full text-sm flex items-center gap-1.5 shadow-md">
                      Enlarge Slide <ExternalLink size={14} />
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                    {item.client}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs uppercase tracking-widest text-primary font-bold mb-2">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white group-hover:text-primary transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed mb-4 flex-grow">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                    {item.highlights.map((h, i) => (
                      <span key={i} className="text-[11px] bg-white/5 text-gray-300 px-2.5 py-1 rounded-md border border-white/5">
                        • {h}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-3xl p-10 md:p-14 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Need a Presentation Designed Like These?
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-8 font-light">
            Share your raw content or draft deck. Our master designers will craft an executive-ready masterpiece within 24–48 hours.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-foreground font-extrabold text-base px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-primary/30"
          >
            Start Your Project Now <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModalItem(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border border-white/20 rounded-3xl overflow-hidden max-w-5xl w-full shadow-2xl relative flex flex-col"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-white text-white hover:text-black p-2 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={22} />
              </button>

              <div className="relative aspect-[16/9] bg-black">
                <img
                  src={activeModalItem.image}
                  alt={activeModalItem.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161b26]">
                <div>
                  <div className="inline-block bg-primary/20 text-primary border border-primary/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                    {activeModalItem.client} • {activeModalItem.category}
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    {activeModalItem.title}
                  </h3>
                  <p className="text-gray-300 text-sm max-w-2xl font-light">
                    {activeModalItem.description}
                  </p>
                </div>

                <Link
                  to="/contact"
                  className="bg-primary hover:bg-primary-dark text-foreground font-bold px-6 py-3.5 rounded-full shrink-0 flex items-center gap-2 transition-all shadow-lg"
                >
                  Request Similar Deck <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
