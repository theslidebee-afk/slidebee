import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/examples?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/examples');
    }
  };

  const trendingTags = [
    { label: "Pitch Deck", query: "Pitch Deck" },
    { label: "Business Plan", query: "Business Plan" },
    { label: "Project Proposal", query: "Proposal" },
    { label: "Company Profile", query: "Corporate" },
  ];

  const features = [
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      title: "10,000+",
      desc: "Premium Templates",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: "Fully Editable",
      desc: "Easy to Customize",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Drag & Drop",
      desc: "Image Placeholder",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Free Fonts",
      desc: "Included & Verified",
    },
    {
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "16:9 Aspect Ratio",
      desc: "Widescreen Size",
    },
  ];

  return (
    <section className="relative min-h-[90vh] bg-[#0b0f19] overflow-hidden pt-28 pb-12 flex flex-col justify-between">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Content */}
      <div className="container mx-auto px-4 md:px-8 my-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Option 3 Headline, Search & Trending */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            
            {/* Bee Flight Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-5"
            >
              <span className="text-primary font-heading font-bold text-xs sm:text-sm tracking-wide flex items-center gap-1.5 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/25 shadow-sm">
                Buzzing with Creative Slides
                <svg className="w-9 h-3 text-primary inline-block stroke-current fill-none stroke-[1.5]" viewBox="0 0 40 12">
                  <path d="M 2 8 C 10 0, 18 12, 26 6 C 30 3, 34 8, 38 4" strokeDasharray="3 2" />
                </svg>
                <span className="text-base">🐝</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-white leading-[1.12] mb-5 tracking-tight"
            >
              Find the Perfect Template <br />
              <span className="text-primary drop-shadow-[0_4px_25px_rgba(252,191,20,0.35)]">
                For Every Presentation
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl font-normal leading-relaxed"
            >
              Professional PowerPoint templates for business, education, marketing, startup pitch decks, and executive reporting.
            </motion.p>

            {/* Live Search Input with Golden Button */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative max-w-xl mb-6"
            >
              <div className="relative flex items-center bg-[#151a24] rounded-2xl border border-white/15 shadow-2xl p-1.5 focus-within:border-primary focus-within:shadow-[0_0_25px_rgba(252,191,20,0.25)] transition-all">
                <input
                  type="text"
                  placeholder="Search for templates (e.g. Pitch Deck, Marketing)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-foreground font-black px-6 sm:px-8 py-3.5 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_4px_15px_rgba(252,191,20,0.4)] shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </motion.form>

            {/* Trending Now Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-400"
            >
              <span className="font-bold text-gray-200 mr-1">Trending Now:</span>
              {trendingTags.map((tag) => (
                <Link
                  key={tag.label}
                  to={`/examples?search=${encodeURIComponent(tag.query)}`}
                  className="bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/40 border border-white/10 text-gray-300 px-3 py-1 rounded-full transition-all text-xs font-medium"
                >
                  {tag.label}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Full 7-Hexagon Honeycomb Cluster with Thick Borders */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-6 flex items-center justify-center relative select-none"
          >
            {/* Background Golden Hexagon Outline Lines */}
            <div className="absolute -top-10 -right-10 w-full h-full pointer-events-none opacity-30 z-0">
              <svg viewBox="0 0 500 500" className="w-full h-full stroke-primary fill-none stroke-[1.5]">
                <path d="M 380 80 L 445 117.5 L 445 192.5 L 380 230 L 315 192.5 L 315 117.5 Z" />
                <path d="M 445 192.5 L 510 230 L 510 305 L 445 342.5 L 380 305 L 380 230 Z" />
                <path d="M 380 305 L 445 342.5 L 445 417.5 L 380 455 L 315 417.5 L 315 342.5 Z" />
              </svg>
            </div>

            {/* Complete 7-Hexagon Cluster Graphic with Beveled Borders */}
            <div className="relative w-full max-w-[560px] sm:max-w-[620px] aspect-square flex items-center justify-center group z-10">
              <img
                src="/slidebee_honeycomb_cluster.png"
                alt="SlideBee Honeycomb Templates: Startup Pitch Deck, Business Plan, Marketing Strategy, Company Profile, Project Proposal"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Subtle ambient pulse behind the center Startup Pitch Deck */}
              <div className="absolute w-36 h-36 bg-primary/25 rounded-full blur-2xl pointer-events-none -z-10 group-hover:bg-primary/40 transition-colors" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Feature Strip (5 Pillars) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="container mx-auto px-4 md:px-8 z-10 pt-10"
      >
        <div className="bg-[#151a24]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3 px-2 border-r last:border-r-0 border-white/5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                {feat.icon}
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-white text-xs sm:text-sm leading-tight">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
