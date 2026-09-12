import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Blog() {
  usePageSEO({
    title: "Presentation Design Insights & Guides | SlideBee Blog",
    description: "Expert advice on venture pitch decks, executive keynote delivery, slide storytelling, and corporate master template architecture.",
  });

  const [blogs] = useState<any[]>([
    {
      id: "1",
      title: "The 3-Second Rule: Why Most C-Suite Slides Fail to Persuade",
      content: "When presenting to senior executive stakeholders, dense walls of bullet points force the audience to read instead of listen. Here is how Ex-McKinsey consultants structure high-impact focal points.",
      imageUrl: "/portfolio/case_study_a_14.png",
      date: "September 2026",
      category: "Strategy"
    },
    {
      id: "2",
      title: "How to Design a Series A Pitch Deck That Secures Partner Meetings",
      content: "Venture capitalists look at hundreds of decks per week. Learn the 12 essential slides, TAM/SAM/SOM market sizing visualization, and unit economics framing that get rounds closed.",
      imageUrl: "/portfolio/global_brands_1.png",
      date: "August 2026",
      category: "Fundraising"
    },
    {
      id: "3",
      title: "Building an Enterprise Master Template System That Teams Actually Use",
      content: "Why do corporate slide templates break within weeks? Discover the layout locking techniques and modular drag-and-drop systems that keep 500+ employee organizations visually aligned.",
      imageUrl: "/portfolio/levis_yuengling_6.png",
      date: "August 2026",
      category: "Branding"
    }
  ]);

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
            <motion.article 
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
                <img 
                  src={blog.imageUrl} 
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
                <div className="text-primary-amber text-xs font-black inline-flex items-center gap-1.5 mt-auto">
                  Read Article <ArrowRight size={14} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
