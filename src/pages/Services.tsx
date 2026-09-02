import { useState } from "react";
import TryNowForm from "../components/TryNowForm";
import { 
  Shield, 
  Clock, 
  Layers, 
  Headphones, 
  Sparkles, 
  Sliders,
  Paintbrush,
  TrendingUp,
  BarChart3,
  LayoutGrid
} from "lucide-react";

export default function Services() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState<"executive" | "financial" | "technical">("executive");

  const comparisons = {
    executive: {
      title: "Executive Strategic Keynote",
      beforeImg: "/portfolio/nike_hsbc_cvs_1.png",
      afterImg: "/portfolio/case_study_a_14.png",
      beforeDesc: "Dense unformatted text, standard table layout, no visual hierarchy.",
      afterDesc: "Ex-McKinsey strategic alignment, bespoke typography, focal points."
    },
    financial: {
      title: "Series A Investment Pitch Deck",
      beforeImg: "/portfolio/nike_hsbc_cvs_10.png",
      afterImg: "/portfolio/global_brands_1.png",
      beforeDesc: "Raw complex spreadsheets, unpolished diagrams, no clear narrative.",
      afterDesc: "Investor-ready cap tables, burn rate charts, traction milestones."
    },
    technical: {
      title: "Technical Product & Cloud Architecture",
      beforeImg: "/portfolio/levis_yuengling_1.png",
      afterImg: "/portfolio/levis_yuengling_6.png",
      beforeDesc: "Overcrowded system diagrams, confusing flow arrows.",
      afterDesc: "Polished isometric system architecture, color-coded data flows."
    }
  };

  const currentComparison = comparisons[activeTab];

  const services = [
    {
      icon: <Paintbrush className="w-8 h-8 text-primary-amber" />,
      title: "Presentation Redesign",
      subtitle: "From Cluttered Drafts to Clean Impact",
      desc: "We take your existing raw PowerPoint or Google Slides and completely rebuild them with modern typography, custom vector graphics, and high-impact layouts.",
      features: ["Full visual overhaul & formatting", "Custom vector graphics & icons", "Brand typography & color harmonization", "Turnaround in 24–48 hours"]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-amber" />,
      title: "Investor Pitch Decks",
      subtitle: "Designed to Secure Funding",
      desc: "High-stakes pitch decks engineered for angel rounds, Series A/B, and VC presentations that tell your story with conviction and data clarity.",
      features: ["Problem-solution narrative framing", "Financial model & unit economics visualizers", "Market sizing & competitor matrix", "Investor-grade design standards"]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-amber" />,
      title: "Data & Financial Visualization",
      subtitle: "Complex Data Made Simple",
      desc: "Transform messy spreadsheets, tables, and financial charts into clear, compelling diagrams that executives understand in seconds.",
      features: ["Dynamic Excel-linked charts", "Custom infographics & flow diagrams", "KPI dashboards & executive scorecards", "Clear data callouts & milestones"]
    },
    {
      icon: <LayoutGrid className="w-8 h-8 text-primary-amber" />,
      title: "Enterprise Master Templates",
      subtitle: "Brand-Aligned Slide Systems",
      desc: "Bespoke corporate presentation design systems with master slides, pre-built layout variants, and strict brand guideline compliance for your entire team.",
      features: ["Master slide system architecture", "Light & Dark theme templates", "Complete font & color palette guide", "Pre-built business frameworks"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-20 large-hex-grid">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
            Custom Presentation Design Bureau 🐝
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-4 leading-tight">
            Elevate Every Slide. <br />
            <span className="text-primary-amber">Deliver with Confidence.</span>
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium">
            Our presentation specialists craft bespoke, high-conversion slide decks for visionary founders, corporate leaders, and global consulting teams.
          </p>
        </div>

        {/* 4 Core Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#111111]/8 rounded-3xl p-8 hover:border-primary hover:shadow-xl transition-all duration-300 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 bg-[#FFF9E8] border border-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  {svc.icon}
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-[#111111] mb-1">
                  {svc.title}
                </h3>
                <h4 className="text-xs font-bold text-primary-amber uppercase tracking-wider mb-3">
                  {svc.subtitle}
                </h4>
                <p className="text-[#726F6D] text-sm leading-relaxed mb-6 font-medium">
                  {svc.desc}
                </p>
              </div>

              <div className="border-t border-[#111111]/5 pt-6 space-y-2.5">
                {svc.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2.5 text-xs text-[#111111] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-amber" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Before / After Interactive Split Comparison */}
        <div className="bg-white border border-[#111111]/8 rounded-3xl p-8 md:p-12 mb-20 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
              Visual Transformation
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] mb-2">
              See the SlideBee Difference
            </h2>
            <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
              Drag the interactive slider to compare raw unformatted drafts against finished executive deliverables.
            </p>

            {/* Tab Selection */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {(["executive", "financial", "technical"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-primary text-[#111111] shadow"
                      : "bg-[#FFF9E8] text-[#726F6D] border border-[#111111]/5 hover:text-[#111111]"
                  }`}
                >
                  {tab} Slide
                </button>
              ))}
            </div>
          </div>

          {/* Draggable Split Comparison Slider */}
          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl select-none border border-[#111111]/10">
              <img
                src={currentComparison.afterImg}
                alt="After Redesign"
                className="absolute inset-0 w-full h-full object-contain bg-[#111111]"
              />
              <div className="absolute top-4 right-4 bg-primary text-[#111111] font-black text-xs px-3 py-1 rounded-full z-10 shadow flex items-center gap-1">
                <Sparkles size={13} /> After (SlideBee Design)
              </div>

              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src={currentComparison.beforeImg}
                  alt="Before Redesign"
                  className="absolute inset-0 w-full h-full object-contain bg-[#161a22]"
                />
                <div className="absolute top-4 left-4 bg-[#111111]/80 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full border border-white/20">
                  Before (Client Draft)
                </div>
              </div>

              <div
                className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-primary text-[#111111] rounded-full flex items-center justify-center shadow-2xl border-2 border-white">
                  <Sliders size={18} />
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                aria-label="Before and after slider"
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              />
            </div>
          </div>
        </div>

        {/* Quality Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-white border border-[#111111]/8 p-6 rounded-2xl text-center shadow-sm">
            <Clock className="w-6 h-6 text-primary-amber mx-auto mb-2" />
            <h4 className="font-heading font-extrabold text-sm text-[#111111]">24–48h Turnaround</h4>
            <p className="text-[11px] text-[#726F6D] mt-1 font-medium">Rapid delivery for urgent deadlines</p>
          </div>
          <div className="bg-white border border-[#111111]/8 p-6 rounded-2xl text-center shadow-sm">
            <Shield className="w-6 h-6 text-primary-amber mx-auto mb-2" />
            <h4 className="font-heading font-extrabold text-sm text-[#111111]">100% Confidential</h4>
            <p className="text-[11px] text-[#726F6D] mt-1 font-medium">Strict enterprise NDA protection</p>
          </div>
          <div className="bg-white border border-[#111111]/8 p-6 rounded-2xl text-center shadow-sm">
            <Layers className="w-6 h-6 text-primary-amber mx-auto mb-2" />
            <h4 className="font-heading font-extrabold text-sm text-[#111111]">Fully Editable</h4>
            <p className="text-[11px] text-[#726F6D] mt-1 font-medium">Native PPTX & Google Slides files</p>
          </div>
          <div className="bg-white border border-[#111111]/8 p-6 rounded-2xl text-center shadow-sm">
            <Headphones className="w-6 h-6 text-primary-amber mx-auto mb-2" />
            <h4 className="font-heading font-extrabold text-sm text-[#111111]">Dedicated Lead</h4>
            <p className="text-[11px] text-[#726F6D] mt-1 font-medium">Direct communication with senior designer</p>
          </div>
        </div>

        {/* Contact / Quote Request Form */}
        <div id="contact-form" className="bg-white border border-[#111111]/8 rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] mb-2">
              Ready to Upgrade Your Presentation?
            </h2>
            <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
              Submit your project details or draft slides. We'll review your scope and provide a custom proposal within 2 hours.
            </p>
          </div>
          <div className="max-w-xl mx-auto">
            <TryNowForm />
          </div>
        </div>

      </div>
    </div>
  );
}
