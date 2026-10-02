import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { d1 } from "../lib/d1";
import { normalizeR2Url } from "../lib/r2";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Blog() {
  usePageSEO({
    title: "Presentation Design Insights & Guides | SlideBee Blog",
    description: "Expert advice on venture pitch decks, executive keynote delivery, slide storytelling, and corporate master template architecture.",
    keywords: [
      "presentation design blog",
      "pitch deck strategy",
      "powerpoint templates playbook",
      "executive keynote tips",
      "slide design tutorials",
      "presentation storytelling frameworks"
    ],
    canonicalUrl: "https://theslidebee.com/blog",
    ogImage: "https://theslidebee.com/portfolio/case_study_a_14.png",
    ogUrl: "https://theslidebee.com/blog",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "SlideBee Presentation Playbook & Insights",
      "description": "Strategic guides, typography teardowns, and executive storytelling frameworks.",
      "url": "https://theslidebee.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "SlideBee",
        "url": "https://theslidebee.com"
      }
    }
  });

  const [blogs, setBlogs] = useState<any[]>([
    {
      id: "1",
      title: "The 3-Second Rule: Why Most C-Suite Slides Fail to Persuade",
      content: "When presenting to senior executive stakeholders, dense bullet points force the audience to read instead of listen. Here is how Ex-McKinsey presentation consultants structure high-impact focal points.",
      imageUrl: "/portfolio/case_study_a_14.png",
      date: "September 2026",
      category: "Strategy"
    },
    {
      id: "2",
      title: "How to Design a Series A Pitch Deck That Secures Partner Meetings",
      content: "Venture capitalists review hundreds of decks per week. Learn the 12 essential slides, TAM/SAM/SOM market sizing visualization, and unit economics framing that get rounds closed.",
      imageUrl: "/portfolio/global_brands_1.png",
      date: "August 2026",
      category: "Fundraising"
    },
    {
      id: "3",
      title: "Building an Enterprise Master Template System That Teams Actually Use",
      content: "Why do corporate slide templates break within weeks? Discover layout locking techniques and modular drag-and-drop systems that keep 500+ employee organizations visually aligned.",
      imageUrl: "/portfolio/levis_yuengling_6.png",
      date: "August 2026",
      category: "Branding"
    },
    {
      id: "4",
      title: "Top 10 Presentation Design Best Practices for High-Stakes Keynotes",
      content: "Keynote presentation design requires dramatic contrast, cinematic typography, and zero clutter. Master the stage visual techniques trusted by Fortune 500 CEOs.",
      imageUrl: "/portfolio/nike_hsbc_cvs_1.png",
      date: "September 2026",
      category: "Keynote"
    },
    {
      id: "5",
      title: "PowerPoint vs Google Slides vs Keynote: Which is Best for Executives?",
      content: "A detailed comparison of PowerPoint, Google Slides, and Apple Keynote for enterprise presentation design, real-time collaboration, and typography rendering.",
      imageUrl: "/portfolio/case_study_a_3.png",
      date: "July 2026",
      category: "Software"
    },
    {
      id: "6",
      title: "How Much Does Professional Presentation Design Cost in 2026? Pricing Breakdown",
      content: "A transparent agency cost guide: from freelance slide redesigns to full bespoke venture pitch deck studios. Learn what drives presentation design pricing.",
      imageUrl: "/portfolio/global_brands_4.png",
      date: "July 2026",
      category: "Economics"
    },
    {
      id: "7",
      title: "Complete Ecommerce Website Development Guide for Modern Brands (₹25,000 Package)",
      content: "Everything small businesses need to know about launching an ecommerce store with 500 products, Razorpay checkout, Cloudflare deployment, and customer accounts for ₹25,000.",
      imageUrl: "/portfolio/case_study_a_8.png",
      date: "September 2026",
      category: "Ecommerce"
    },
    {
      id: "8",
      title: "Data Visualization in Presentations: Turning Complex Spreadsheets into Persuasive Charts",
      content: "How senior financial analysts and design directors transform dense Excel tables into clean, persuasive waterfall charts, cohort heatmaps, and margin visualizers.",
      imageUrl: "/portfolio/nike_hsbc_cvs_4.png",
      date: "June 2026",
      category: "Data Viz"
    },
    {
      id: "9",
      title: "The Anatomy of a High-Converting B2B Sales Deck: Frameworks & Real Examples",
      content: "Why feature checklists fail in enterprise sales. How to structure a 10-slide sales narrative that builds consensus across skeptical buyer committees and CFOs.",
      imageUrl: "/portfolio/levis_yuengling_2.png",
      date: "June 2026",
      category: "Sales"
    },
    {
      id: "10",
      title: "Essential SEO & Digital Storefront Checklist for Growing Businesses in 2026",
      content: "A step-by-step technical SEO guide covering Google Search Console indexing, Schema.org rich snippets, XML sitemaps, and mobile performance optimization.",
      imageUrl: "/portfolio/global_brands_8.png",
      date: "May 2026",
      category: "SEO & Growth"
    }
  ]);

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

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-32 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            SlideBee Insights
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-3">
            The Presentation <span className="text-primary-amber">Playbook.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#726F6D] font-medium">
            Strategic guides, typography teardowns, and executive storytelling frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.div 
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
      </div>
    </div>
  );
}
