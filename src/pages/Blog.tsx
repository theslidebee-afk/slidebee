import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Search, Sparkles } from "lucide-react";
import { d1 } from "../lib/d1";
import { normalizeR2Url } from "../lib/r2";
import { usePageSEO } from "../hooks/usePageSEO";

export const initialBlogArticles = [
  {
    id: "1",
    title: "The 3-Second Rule: Why Most C-Suite Strategy Slides Fail to Persuade",
    content: "When presenting to senior executive stakeholders, dense bullet points force the audience to read instead of listen. Here is how Ex-McKinsey presentation consultants structure high-impact focal points.",
    imageUrl: "/portfolio/case_study_a_14.png",
    date: "September 2026",
    category: "Strategy",
    readTime: "5 min read"
  },
  {
    id: "2",
    title: "How to Design a Series A Pitch Deck That Secures Partner Meetings (PowerPoint & Google Slides)",
    content: "Venture capitalists review hundreds of decks per week. Learn the 12 essential slides, TAM/SAM/SOM market sizing visualization, and unit economics framing that get rounds closed.",
    imageUrl: "/portfolio/global_brands_1.png",
    date: "August 2026",
    category: "Pitch Decks",
    readTime: "7 min read"
  },
  {
    id: "3",
    title: "Building an Enterprise Corporate Presentation Template System That Teams Actually Use",
    content: "Why do corporate slide templates break within weeks? Discover layout locking techniques and modular drag-and-drop systems that keep 500+ employee organizations visually aligned.",
    imageUrl: "/portfolio/levis_yuengling_6.png",
    date: "August 2026",
    category: "Corporate",
    readTime: "6 min read"
  },
  {
    id: "4",
    title: "Top 10 Executive Business Presentation Best Practices for High-Stakes Keynotes & Board Meetings",
    content: "Keynote and board presentation design requires dramatic contrast, cinematic typography, and zero clutter. Master the executive stage visual techniques trusted by Fortune 500 CEOs.",
    imageUrl: "/portfolio/nike_hsbc_cvs_1.png",
    date: "September 2026",
    category: "Business",
    readTime: "5 min read"
  },
  {
    id: "5",
    title: "PowerPoint vs Google Slides vs Keynote: The Enterprise Executive Software Comparison",
    content: "A detailed comparison of PowerPoint (.pptx), Google Slides, and Apple Keynote for enterprise presentation design, typography rendering, and cross-team collaboration.",
    imageUrl: "/portfolio/case_study_a_3.png",
    date: "July 2026",
    category: "Business",
    readTime: "6 min read"
  },
  {
    id: "6",
    title: "Financial Presentation Design: How to Present Unit Economics, M&A, and Investor Financial Models",
    content: "How senior financial analysts and design directors transform dense Excel models into clean, persuasive waterfall charts, cohort heatmaps, and EBITDA visualizers in PowerPoint.",
    imageUrl: "/portfolio/nike_hsbc_cvs_4.png",
    date: "June 2026",
    category: "Finance",
    readTime: "6 min read"
  },
  {
    id: "7",
    title: "Complete Ecommerce Website Development Guide for Modern Brands (₹25,000 Package)",
    content: "Everything small businesses need to know about launching an online store with 500 products, Razorpay checkout, Cloudflare deployment, and customer accounts for ₹25,000.",
    imageUrl: "/portfolio/case_study_a_8.png",
    date: "September 2026",
    category: "Business",
    readTime: "7 min read"
  },
  {
    id: "8",
    title: "Infographic Presentation Design: Turning Complex Data, Timelines & Workflows into Persuasive PowerPoint Slides",
    content: "How to design high-impact infographic slides, process flow diagrams, swimlane visualizers, and circular roadmaps that simplify complex enterprise workflows.",
    imageUrl: "/portfolio/global_brands_4.png",
    date: "July 2026",
    category: "Infographics",
    readTime: "6 min read"
  },
  {
    id: "9",
    title: "Designing High-Impact Marketing Presentation Decks for Product Launches & GTM Campaigns",
    content: "Why generic feature lists fail in product marketing. How CMOs and growth leads build persuasive go-to-market presentation decks that align sales and executive stakeholders.",
    imageUrl: "/portfolio/case_study_a_1.png",
    date: "August 2026",
    category: "Marketing",
    readTime: "6 min read"
  },
  {
    id: "10",
    title: "The Anatomy of a High-Converting B2B Strategic Proposal Deck: Frameworks & Real Examples",
    content: "Why feature checklists fail in enterprise sales. How to structure a 10-slide sales narrative that builds consensus across skeptical buyer committees and CFOs.",
    imageUrl: "/portfolio/levis_yuengling_2.png",
    date: "June 2026",
    category: "Strategy",
    readTime: "5 min read"
  },
  {
    id: "11",
    title: "How Much Does Professional Presentation Design Cost in 2026? Agency vs Freelancer vs In-House Pricing",
    content: "A transparent agency cost guide: from freelance slide redesigns to full bespoke venture pitch deck studios. Learn what drives presentation design pricing across global markets.",
    imageUrl: "/portfolio/case_study_a_2.png",
    date: "July 2026",
    category: "Finance",
    readTime: "5 min read"
  },
  {
    id: "12",
    title: "Essential Technical SEO, GEO & Digital Discovery Architecture for Modern Presentation Studios in 2026",
    content: "A step-by-step technical SEO and GEO-targeting blueprint covering Google Search Console indexing, Schema.org WebSite snippets, XML sitemaps, and Core Web Vitals optimization.",
    imageUrl: "/portfolio/global_brands_8.png",
    date: "May 2026",
    category: "Corporate",
    readTime: "6 min read"
  },
  {
    id: "13",
    title: "How to Build & Launch a High-Converting Ecommerce Store in India for ₹25,000 (Complete 2026 Blueprint)",
    content: "Why smart Indian brands are skipping bloated SaaS fees for lightning-fast serverless storefronts with Razorpay, zero recurring monthly costs, and enterprise Google Cloud/Cloudflare edge delivery.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    date: "May 2026",
    category: "Business",
    readTime: "8 min read"
  }
];

const BLOG_CATEGORIES = [
  "All",
  "Pitch Decks",
  "Business",
  "Infographics",
  "Marketing",
  "Corporate",
  "Finance",
  "Strategy"
];

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryParam = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState<any[]>(initialBlogArticles);

  usePageSEO({
    title: "Presentation Design Insights & Guides | SlideBee Playbook",
    description: "Expert guides and playbooks on PowerPoint presentation templates, investor pitch decks, corporate slide systems, financial models, and executive keynote storytelling.",
    keywords: [
      "presentation design blog",
      "powerpoint templates",
      "pitch deck strategy",
      "business presentation slides",
      "infographic powerpoint",
      "corporate slide templates",
      "marketing presentation deck",
      "financial modeling presentation",
      "executive keynote tips",
      "slide design agency"
    ],
    canonicalUrl: "https://theslidebee.com/blog",
    ogImage: "https://theslidebee.com/portfolio/case_study_a_14.png",
    ogUrl: "https://theslidebee.com/blog",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "SlideBee Presentation Playbook & Category Guides",
      "description": "Strategic guides, typography teardowns, and executive presentation frameworks across Pitch Decks, Business, Infographics, Marketing, Corporate, Finance, and Strategy.",
      "url": "https://theslidebee.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "SlideBee",
        "url": "https://theslidebee.com"
      }
    }
  });

  // Sync category param with state
  useEffect(() => {
    if (activeCategoryParam && BLOG_CATEGORIES.includes(activeCategoryParam)) {
      setSelectedCategory(activeCategoryParam);
    }
  }, [activeCategoryParam]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  useEffect(() => {
    async function loadBlogCms() {
      try {
        const { data } = await d1
          .from("site_config")
          .select("value")
          .eq("key", "blog_cms")
          .maybeSingle();
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setBlogs(data.value);
        }
      } catch (err) {
        console.warn("Could not load dynamic blog CMS:", err);
      }
    }
    loadBlogCms();
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory = selectedCategory === "All" || blog.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery =
        !searchQuery.trim() ||
        blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [blogs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-32 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            SlideBee Presentation Playbook
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-3">
            The Presentation <span className="text-primary-amber">Playbook.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#726F6D] font-medium max-w-xl mx-auto leading-relaxed">
            Executive guides, PowerPoint templates teardowns, and high-stakes storytelling frameworks across every presentation category.
          </p>
        </div>

        {/* Search & Category Pills Controls */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search presentation playbooks, PowerPoint guides, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-primary/30 hex-pill pl-12 pr-5 py-3 text-xs sm:text-sm text-[#111111] font-medium outline-none focus:border-primary shadow-sm"
            />
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
            {BLOG_CATEGORIES.map((cat) => {
              const count = cat === "All" 
                ? blogs.length 
                : blogs.filter((b) => b.category?.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`hex-pill px-4 py-2 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-[#111111] shadow-md border border-primary"
                      : "bg-white text-[#726F6D] hover:text-[#111111] border border-primary/20 hover:border-primary/40"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? "bg-[#111111] text-primary" : "bg-primary/20 text-[#111111]"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16 hex-card-lg bg-white border border-primary/30 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-primary-amber mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#111111] mb-1">No articles found</h3>
            <p className="text-xs text-[#726F6D] mb-4">No playbook guides matched your filter or search query.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="hex-pill bg-primary text-[#111111] px-5 py-2 text-xs font-extrabold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredBlogs.map((blog, index) => (
              <motion.div 
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/blog/${blog.id}`}
                  className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group h-full cursor-pointer"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
                    <img 
                      src={normalizeR2Url(blog.imageUrl)} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/85 text-primary border border-primary/30 text-[10px] font-extrabold px-3 py-1 backdrop-blur-sm">
                      {blog.category}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-[11px] text-[#726F6D] font-bold mb-2 gap-1.5">
                      <Calendar size={13} className="text-primary-amber" />
                      <span>{blog.date}</span>
                      {blog.readTime && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>{blog.readTime}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-2 leading-snug group-hover:text-primary-amber transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-[#726F6D] font-medium line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {blog.content}
                    </p>
                    <div className="text-primary-amber text-xs font-black inline-flex items-center gap-1.5 mt-auto group-hover:translate-x-1 transition-transform">
                      Read Article <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
