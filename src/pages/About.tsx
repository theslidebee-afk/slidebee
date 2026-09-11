import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  ArrowRight, 
  Award
} from "lucide-react";

export default function About() {
  const [aboutConfig, setAboutConfig] = useState<any>({
    headline: "We Turn Complex Business Ideas into Unforgettable Visuals.",
    subheadline: "SlideBee is a dedicated presentation design studio engineered for high-growth startups, C-suite executives, and forward-thinking enterprises.",
    storyHeading: "Most Great Ideas Get Lost in Bad PowerPoint Slides.",
    storyParagraph1: "Founders spend months building transformative products, only to pitch them with crowded bullet points, default templates, and unreadable spreadsheet screenshots.",
    storyParagraph2: "SlideBee was founded to fix this. We combine ex-consulting strategic framing with world-class graphic artistry to create presentations that command the room and secure deals."
  });

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "about_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) setAboutConfig(data.value);
      });
  }, []);

interface ValueItem {
  icon?: any;
  title: string;
  desc: string;
}

  const defaultValues: ValueItem[] = [
    {
      icon: <Target className="w-6 h-6 text-primary-amber" />,
      title: "Clarity Above All",
      desc: "If an investor or executive cannot grasp the key takeaway in 3 seconds, the slide has failed. We ruthlessly cut visual clutter."
    },
    {
      icon: <Zap className="w-6 h-6 text-primary-amber" />,
      title: "Relentless Speed",
      desc: "High-stakes presentations don't wait weeks. We deliver agency-grade decks in 24 to 48 hours without compromising quality."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary-amber" />,
      title: "Strict Confidentiality",
      desc: "We work with confidential cap tables, M&A filings, and unannounced products under strict enterprise NDAs and encrypted drives."
    },
    {
      icon: <Award className="w-6 h-6 text-primary-amber" />,
      title: "100% Editable Vector Assets",
      desc: "No locked images or uneditable PDFs. You receive native Master PowerPoint (.pptx) files your team can edit forever."
    }
  ];

  const values: ValueItem[] = Array.isArray(aboutConfig?.values) && aboutConfig.values.length > 0
    ? aboutConfig.values.map((v: any, i: number): ValueItem => ({
        ...defaultValues[i % defaultValues.length],
        ...v
      }))
    : defaultValues;

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden pt-28 pb-20 large-hex-grid">
      
      {/* 1. HERO SECTION */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/12 rounded-full blur-[140px] pointer-events-none" />

        <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          The SlideBee Story
        </span>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#111111] leading-[1.12] mb-4 tracking-tight">
          {aboutConfig.headline}
        </h1>

        <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
          {aboutConfig.subheadline}
        </p>
      </section>

      {/* 2. THE MISSION & CRAFT */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="hex-card-lg bg-white border-2 border-primary/40 p-8 sm:p-14 shadow-xl">
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block">
              Why We Started SlideBee
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] leading-tight">
              {aboutConfig.storyHeading}
            </h2>
            <p className="text-[#726F6D] text-sm sm:text-base font-medium leading-relaxed">
              {aboutConfig.storyParagraph1}
            </p>
            <p className="text-[#726F6D] text-sm sm:text-base font-medium leading-relaxed">
              {aboutConfig.storyParagraph2}
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES GRID */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-1">
            Our Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111111]">
            What Sets SlideBee Apart
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="hex-card bg-white border-2 border-primary/40 hover:border-primary p-6 shadow-sm h-full flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="hex-pure w-12 h-12 bg-[#FFF9E8] border border-primary/30 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                  {v.icon}
                </div>
                <h3 className="font-heading font-extrabold text-base text-[#111111] mb-2">
                  {v.title}
                </h3>
                <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hex-card-dark bg-[#111111] border-2 border-primary text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FCBF14]/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mb-3">
              Ready to Upgrade Your Deck?
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm font-medium mb-8">
              Send us your draft slides or project outline. We'll send you a custom redesign sample and quote within 2 hours.
            </p>
            <Link
              to="/ordernow"
              className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-8 py-3.5 text-xs sm:text-sm transition-all shadow-xl hover:scale-105"
            >
              Get Started Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
