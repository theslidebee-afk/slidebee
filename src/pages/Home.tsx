import { useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import CountdownSection from "../components/CountdownSection";
import TryNowForm from "../components/TryNowForm";
import { 
  Shield, 
  Clock, 
  Layers, 
  Headphones, 
  ArrowRight, 
  Sparkles, 
  Sliders
} from "lucide-react";

export default function Home() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState<"executive" | "financial" | "technical">("executive");

  const comparisons = {
    executive: {
      title: "Executive Strategic Keynote",
      beforeImg: "/portfolio/nike_hsbc_cvs_1.png",
      afterImg: "/portfolio/case_study_a_1.png",
      beforeDesc: "Cluttered text bullets, misaligned branding, low readability.",
      afterDesc: "Clean typographic hierarchy, high-contrast focal points, ex-McKinsey polish."
    },
    financial: {
      title: "Series A / Private Equity Deck",
      beforeImg: "/portfolio/nike_hsbc_cvs_8.png",
      afterImg: "/portfolio/global_brands_1.png",
      beforeDesc: "Dense Excel tables, unformatted margins, confusing data points.",
      afterDesc: "Intuitive financial data visualization with clear investment highlights."
    },
    technical: {
      title: "Product Architecture & Ecosystem",
      beforeImg: "/portfolio/nike_hsbc_cvs_10.png",
      afterImg: "/portfolio/levis_yuengling_6.png",
      beforeDesc: "Complex wireframes with generic flowcharts.",
      afterDesc: "Streamlined modern architectural diagrams and system frameworks."
    }
  };

  const currentComparison = comparisons[activeTab];

  const featuredWork = [
    {
      title: "Series A Investment Pitch",
      client: "Venture Backed Tech",
      category: "Startup Pitch",
      image: "/portfolio/case_study_a_1.png"
    },
    {
      title: "Global Supply Chain Model",
      client: "Yuengling",
      category: "Operations",
      image: "/portfolio/levis_yuengling_6.png"
    },
    {
      title: "Executive Board Overview",
      client: "HSBC",
      category: "Corporate Finance",
      image: "/portfolio/nike_hsbc_cvs_8.png"
    },
    {
      title: "Brand Campaign Rollout",
      client: "Nike x WLT",
      category: "Marketing Keynote",
      image: "/portfolio/nike_hsbc_cvs_2.png"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-white">
      
      {/* Hero Section with Full 7-Hexagon Honeycomb Structure */}
      <HeroSection />

      {/* SECTION 2: Before & After Transformation */}
      <section className="py-24 bg-[#0d121f] relative border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-primary text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block mb-3">
              Precision Design Transformation
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-4">
              Raw Drafts Transformed Into <span className="text-primary">Executive Decks</span>
            </h2>
            <p className="text-gray-300 font-light text-base md:text-lg">
              Drag the interactive slider below to inspect the transformation from client draft to polished deliverable.
            </p>
          </div>

          {/* Comparison Category Tabs */}
          <div className="flex justify-center gap-2 md:gap-4 mb-8">
            {(["executive", "financial", "technical"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-primary text-foreground shadow-lg shadow-primary/20 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                }`}
              >
                {tab} Slide
              </button>
            ))}
          </div>

          {/* Interactive Before/After Split Slider */}
          <div className="max-w-4xl mx-auto bg-black/40 border border-white/15 rounded-3xl p-4 md:p-6 shadow-2xl">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden select-none">
              
              {/* After Image (Background) */}
              <img
                src={currentComparison.afterImg}
                alt="After Redesign"
                className="absolute inset-0 w-full h-full object-contain bg-[#111111]"
              />
              
              <div className="absolute top-4 right-4 bg-primary text-foreground font-black text-xs px-3 py-1.5 rounded-full z-10 shadow-lg flex items-center gap-1">
                <Sparkles size={12} /> SlideBee Redesign
              </div>

              {/* Before Image (Clipped Overlay) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={currentComparison.beforeImg}
                  alt="Before Redesign"
                  className="absolute inset-0 w-full h-full object-contain bg-[#161a22]"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-full border border-white/20">
                  Client Original Draft
                </div>
              </div>

              {/* Draggable Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-primary text-foreground rounded-full flex items-center justify-center shadow-2xl border-2 border-white">
                  <Sliders size={16} />
                </div>
              </div>

              {/* Native Range Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                aria-label="Before and after slider position"
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>

            {/* Explanatory Footnotes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10 text-xs">
              <div className="text-gray-400">
                <span className="text-white font-bold block mb-1">Before:</span>
                {currentComparison.beforeDesc}
              </div>
              <div className="text-primary-cream">
                <span className="text-primary font-bold block mb-1">After (SlideBee):</span>
                {currentComparison.afterDesc}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Why Choose SlideBee (Pillars) */}
      <section className="py-24 bg-[#0b0f19] relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-primary text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full inline-block mb-3">
              Core Capabilities & Speed
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-4">
              Why Executives Choose <span className="text-primary">SlideBee</span>
            </h2>
            <p className="text-gray-300 font-light text-base md:text-lg">
              We operate as your on-demand presentation design bureau with strict security, high velocity, and unmatched craft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Confidential</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Strict NDA protection and secure storage for all your private corporate financials and pitch materials.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">24–48h Turnaround</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                High-speed execution without sacrificing quality. Receive your initial deck draft in as fast as 24 hours.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">Fully Editable Slides</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Native PowerPoint, Google Slides, and Keynote formatting. Edit any text, chart, or color with ease.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">Dedicated Art Director</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Direct one-on-one collaboration with experienced presentation designers for seamless revisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Featured Client Decks Grid */}
      <section className="py-24 bg-[#0d121f] border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-primary text-xs font-bold uppercase tracking-widest block mb-2">
                Proven Industry Portfolio
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
                Featured Client Decks
              </h2>
            </div>
            <Link
              to="/examples"
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-white transition-colors border-b-2 border-primary pb-1 shrink-0"
            >
              View All 18+ Case Studies <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWork.map((item, idx) => (
              <Link
                key={idx}
                to="/examples"
                className="group bg-[#151a24] border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all block hover:-translate-y-1 shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden bg-black/40 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                    {item.client}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[11px] text-primary font-bold uppercase tracking-wider mb-1">
                    {item.category}
                  </div>
                  <h3 className="font-heading font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <CountdownSection />

      {/* SECTION 5: Final Contact Section */}
      <section className="py-24 bg-[#0b0f19] relative overflow-hidden border-t border-white/10">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Contact Info & Benefits */}
            <div className="lg:col-span-6 text-white">
              <h2 className="text-4xl md:text-5xl font-heading font-black mb-6 leading-tight">
                Ready to elevate your next <span className="text-primary">presentation?</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 font-light leading-relaxed">
                Whether you need a rapid 24h polish or a full custom overhaul, our ex-McKinsey presentation designers are ready to bring your message to life.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/15 text-primary border border-primary/30 rounded-xl flex items-center justify-center shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-0.5">Submit Your Draft or Outline</h4>
                    <p className="text-gray-400 text-sm">Upload your raw slides or project requirements securely.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/15 text-primary border border-primary/30 rounded-xl flex items-center justify-center shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-0.5">Get Free Art Direction & Quote</h4>
                    <p className="text-gray-400 text-sm">Receive a customized plan and guaranteed delivery timeline.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/15 text-primary border border-primary/30 rounded-xl flex items-center justify-center shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-0.5">Receive Your Presentation Masterpiece</h4>
                    <p className="text-gray-400 text-sm">Fully editable, on-brand, and built for maximum impact.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Try Now Form */}
            <div className="lg:col-span-6">
              <TryNowForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
