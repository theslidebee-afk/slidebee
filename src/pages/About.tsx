import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export default function About() {
  usePageSEO({
    title: "About Us | A Specialized Presentation Design Team | SlideBee",
    description: "SlideBee is a specialized presentation design studio and global destination for better presentations. We turn complex ideas into high-impact, board-ready slide decks.",
  });

  const [aboutConfig, setAboutConfig] = useState<any>({
    teamHeading: "A Specialized Presentation Design Team.",
    teamBody: "At SlideBee, we are a collective of elite presentation designers, strategic narrative thinkers, and information architects. We have eliminated generic slide templates and boring bullet points, crafting custom presentations that communicate executive authority, close multi-million dollar fundraising rounds, and captivate audiences globally.",
    visionHeading: "A Global Destination for Better Presentations.",
    visionBody: "Our vision is to redefine how high-stakes ideas are communicated worldwide. Every pitch, keynote, and strategic proposal deserves visual clarity that commands attention and inspires action. By uniting continuous marketplace innovation with bespoke bespoke studio craftsmanship, SlideBee delivers the standard of excellence modern leaders demand.",
  });

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "about_cms")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setAboutConfig((prev: any) => ({ ...prev, ...data.value }));
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">

        {/* ========================================================================= */}
        {/* BLOCK 1: OUR TEAM                                                         */}
        {/* ========================================================================= */}
        <section className="bg-white/85 backdrop-blur-md rounded-[32px] sm:rounded-[44px] border-2 border-primary/35 p-8 sm:p-14 lg:p-18 shadow-xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FCBF14]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Subtitle Badge */}
              <div>
                <span className="hex-pill inline-block bg-[#FFF9E8] border border-[#FCBF14]/40 text-[#111111] px-5 py-1.5 text-xs sm:text-sm font-black uppercase tracking-widest shadow-xs">
                  OUR TEAM
                </span>
              </div>

              {/* Heading with Yellow Accent */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] leading-[1.08] tracking-tight">
                A Specialized Presentation{" "}
                <span className="text-[#FCBF14]">Design Team.</span>
              </h2>

              {/* Body Text */}
              <p className="text-sm sm:text-base lg:text-lg text-[#555250] font-medium leading-relaxed max-w-2xl">
                {aboutConfig.teamBody}
              </p>

              {/* Key Highlights List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Dedicated presentation specialists",
                  "Ex-consulting narrative framing",
                  "Venture capital & pitch deck mastery",
                  "100% editable vector slide systems"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#111111]">
                    <CheckCircle2 size={16} className="text-[#FCBF14] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA Yellow Button */}
              <div className="pt-4">
                <Link
                  to="/examples"
                  data-bee-state="hover"
                  className="inline-flex items-center gap-2 bg-[#FCBF14] hover:bg-[#E0A810] text-[#111111] font-black text-xs sm:text-sm px-8 py-4 rounded-full shadow-lg shadow-[#FCBF14]/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Meet Our Work</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

            </div>

            {/* Right Visual Column: Generic Placeholder Image + Yellow Sticky Note */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-primary/40 shadow-2xl bg-[#111111] aspect-[4/3]">
                
                {/* Generic Studio / Presentation Design Placeholder Image */}
                <img
                  src="https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg"
                  alt="SlideBee Presentation Design Studio"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700 select-none"
                  loading="lazy"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                <div className="absolute top-4 left-4 bg-[#111111]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] font-mono font-bold text-white/90">
                  SlideBee Studio Team
                </div>
              </div>

              {/* Yellow Sticky Note: Tilted & Pinned */}
              <div className="absolute -bottom-6 -right-3 sm:-bottom-8 sm:-right-6 bg-gradient-to-br from-[#FFE37A] via-[#FCBF14] to-[#E5AC0E] text-[#111111] p-5 sm:p-6 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.25)] border-2 border-white max-w-[240px] sm:max-w-[280px] -rotate-3 hover:rotate-0 transition-transform duration-300">
                
                {/* Pin / Tape Dot */}
                <div className="w-3.5 h-3.5 rounded-full bg-[#111111]/30 mx-auto -mt-2 mb-3 shadow-inner border border-black/20" />

                <p className="font-heading font-black text-sm sm:text-base leading-snug tracking-tight text-center">
                  Different Perspectives<br />
                  <span className="text-[#111111] underline decoration-[#111111]/40 decoration-2">
                    Better Slides.
                  </span>
                </p>

                <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#111111]/70">
                  <Sparkles size={11} />
                  <span>The SlideBee Standard</span>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* BLOCK 2: OUR VISION                                                       */}
        {/* ========================================================================= */}
        <section className="bg-white/85 backdrop-blur-md rounded-[32px] sm:rounded-[44px] border-2 border-primary/35 p-8 sm:p-14 lg:p-18 shadow-xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FCBF14]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Visual Column: Hand-drawn Paper Airplane Graphic + Banner */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-[#FFFDF5] rounded-3xl border-2 border-primary/30 shadow-inner relative overflow-hidden text-center">
              
              {/* Paper Airplane Vector Graphic with Dynamic Dotted Flight Trail */}
              <div className="w-full max-w-[320px] aspect-square relative flex items-center justify-center">
                <svg
                  viewBox="0 0 300 240"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-md select-none pointer-events-none"
                >
                  {/* Curving Dotted Trajectory Flight Trail */}
                  <path
                    d="M 30 200 C 60 210, 110 200, 130 150 C 150 100, 120 60, 150 45 C 180 30, 220 70, 260 50"
                    stroke="#FCBF14"
                    strokeWidth="3.5"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Little trajectory puffs */}
                  <circle cx="32" cy="200" r="3.5" fill="#FCBF14" />
                  <circle cx="50" cy="204" r="2.5" fill="#FCBF14" />
                  <circle cx="85" cy="195" r="2" fill="#FCBF14" />

                  {/* Hand-Drawn Minimalist Origami Paper Airplane (Tilted soaring upwards) */}
                  <g transform="translate(245, 48) rotate(-15) scale(0.95)">
                    {/* Main Wing Body Right */}
                    <path
                      d="M 0 0 L -75 42 L -35 15 Z"
                      fill="#FCBF14"
                      stroke="#111111"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    {/* Main Wing Body Left */}
                    <path
                      d="M 0 0 L -70 -25 L -35 15 Z"
                      fill="#FFFDF5"
                      stroke="#111111"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    {/* Fold Crease */}
                    <path
                      d="M 0 0 L -35 15 L -35 32 Z"
                      fill="#E0A810"
                      stroke="#111111"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    {/* Top Spine Highlight */}
                    <path
                      d="M 0 0 L -60 -10"
                      stroke="#111111"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
              </div>

              {/* Prominent Vision Tagline Note */}
              <div className="mt-2 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-lg border border-white/10 max-w-xs">
                <p className="font-heading font-black text-xs sm:text-sm tracking-tight text-[#FCBF14]">
                  Clear Ideas Create Bigger Opportunities
                </p>
                <p className="text-[10px] text-white/70 font-medium mt-0.5">
                  Visual clarity gives great minds leverage.
                </p>
              </div>

            </div>

            {/* Right Content Column */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              
              {/* Subtitle Badge */}
              <div>
                <span className="hex-pill inline-block bg-[#FFF9E8] border border-[#FCBF14]/40 text-[#111111] px-5 py-1.5 text-xs sm:text-sm font-black uppercase tracking-widest shadow-xs">
                  OUR VISION
                </span>
              </div>

              {/* Heading with Yellow Accent */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] leading-[1.08] tracking-tight">
                A Global Destination for{" "}
                <span className="text-[#FCBF14]">Better Presentations.</span>
              </h2>

              {/* Body Text */}
              <p className="text-sm sm:text-base lg:text-lg text-[#555250] font-medium leading-relaxed max-w-2xl">
                {aboutConfig.visionBody}
              </p>

              {/* 3 Vision Tenets */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    title: "Radical Visual Economy",
                    desc: "Eliminating superfluous noise so your core value proposition communicates instantly."
                  },
                  {
                    title: "Boardroom-Ready Polish",
                    desc: "Engineering slides with mathematical typography, executive grids, and perfect alignment."
                  },
                  {
                    title: "Frictionless Delivery",
                    desc: "Empowering teams with modular templates and rapid on-demand bespoke turnarounds."
                  }
                ].map((tenet, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FFF9E8]/80 rounded-2xl border border-primary/20 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#111111] shrink-0 sm:w-48">
                      {tenet.title}
                    </span>
                    <span className="text-xs text-[#555250] font-medium">
                      {tenet.desc}
                    </span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* BLOCK 3: CALL TO ACTION (Yellow Background)                               */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-[#FFC72C] via-[#FFD034] to-[#FFAE00] rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 lg:p-18 shadow-2xl border-2 border-[#E0A810] relative overflow-hidden text-center text-[#111111]">
          
          {/* Organic Background Contour Waves */}
          <div className="absolute -top-16 -left-16 w-80 h-80 pointer-events-none opacity-25">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <path d="M0 0 L 160 0 C 130 60, 80 120, 0 160 Z" fill="#E08B00" />
            </svg>
          </div>

          <div className="absolute -bottom-16 -right-16 w-80 h-80 pointer-events-none opacity-25">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <path d="M200 80 C 140 120, 80 140, 40 200 L 200 200 Z" fill="#D48200" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            
            {/* Subtitle */}
            <span className="inline-block text-xs sm:text-sm font-black tracking-widest uppercase text-[#111111]/85 bg-white/40 px-4 py-1.5 rounded-full border border-black/10">
              LET'S CREATE BETTER PRESENTATIONS
            </span>

            {/* Display Heading */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black text-[#111111] leading-[1.05] tracking-tight">
              Your Ideas. Our Design.
            </h2>

            {/* Subheading */}
            <p className="text-sm sm:text-base lg:text-lg text-[#111111]/90 font-medium max-w-xl mx-auto leading-relaxed">
              Choose your way to create better presentations with Slidebee.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              
              {/* Button 1: Dark - Explore Templates */}
              <Link
                to="/"
                data-bee-state="hover"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-white font-black text-xs sm:text-sm px-8 py-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>Explore Templates</span>
                <ArrowRight size={16} className="text-[#FCBF14]" />
              </Link>

              {/* Button 2: Light - Get a Custom Presentation */}
              <Link
                to="/ordernow"
                data-bee-state="quote"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#FFFDF5] text-[#111111] font-black text-xs sm:text-sm px-8 py-4 rounded-full shadow-lg border border-black/15 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Get a Custom Presentation</span>
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

        </section>

      </div>
    </div>
  );
}
