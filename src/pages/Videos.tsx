import { motion } from "framer-motion";
import { Play, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Videos() {
  const videoPlaylists = [
    {
      id: "1",
      title: "Executive Presentation Teardown: Turning 40 Slides into 10",
      duration: "14:20",
      category: "Masterclass",
      thumbnail: "/portfolio/case_study_a_14.png",
      desc: "Watch our senior art director restructure a bloated corporate roadmap deck into a high-stakes board presentation."
    },
    {
      id: "2",
      title: "Investor Pitch Deck Visuals: Unit Economics & Cap Table Framing",
      duration: "18:45",
      category: "Fundraising",
      thumbnail: "/portfolio/global_brands_1.png",
      desc: "How to visualize complex SaaS metrics, CAC/LTV, and market sizing diagrams so VCs immediately get the value."
    },
    {
      id: "3",
      title: "Building Scalable PowerPoint Master Templates in 2026",
      duration: "12:10",
      category: "Template Design",
      thumbnail: "/portfolio/levis_yuengling_6.png",
      desc: "A deep dive into PowerPoint slide masters, theme colors, typography hierarchies, and modular vector asset libraries."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-32 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            SlideBee Studio Video Library
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-3">
            Presentations in <span className="text-primary-amber">Motion.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#726F6D] font-medium">
            Watch executive design masterclasses, pitch deck teardowns, and master template tutorials.
          </p>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {videoPlaylists.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                  <div className="hex-pure w-14 h-14 bg-primary text-[#111111] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play size={20} className="fill-[#111111] ml-0.5" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="hex-pill-sm absolute bottom-3 right-3 bg-[#111111]/90 text-white text-[10px] font-bold px-2.5 py-1 flex items-center gap-1 backdrop-blur-sm border border-primary/30">
                  <Clock size={11} className="text-primary" /> {video.duration}
                </div>

                <div className="hex-pill-sm absolute top-3 left-3 bg-primary text-[#111111] text-[10px] font-extrabold px-3 py-1">
                  {video.category}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-base font-heading font-extrabold text-[#111111] mb-2 leading-snug group-hover:text-primary-amber transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-[#726F6D] font-medium leading-relaxed mb-4">
                    {video.desc}
                  </p>
                </div>

                <div className="text-primary-amber text-xs font-black inline-flex items-center gap-1.5 pt-2 border-t border-primary/20">
                  Watch Masterclass <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="hex-card-dark bg-[#111111] border-2 border-primary text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FCBF14]/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-2xl font-heading font-extrabold text-white mb-2">
              Want a Bespoke Deck for Your Team?
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm font-medium mb-6">
              Our presentation team designs high-converting venture pitch decks, keynotes, and master templates in 24h–48h.
            </p>
            <Link
              to="/ordernow"
              className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-8 py-3.5 text-xs sm:text-sm transition-all shadow-xl hover:scale-105"
            >
              Start Your Brief <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
