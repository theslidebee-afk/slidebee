import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export default function About() {
  usePageSEO({
    title: "About Us | A Specialized Presentation Design Team | SlideBee",
    description: "Slidebee is powered by a team of presentation designers, visual storytellers, and creative professionals. We are a global destination for better presentations.",
  });

  return (
    <div className="min-h-screen bg-white text-[#111111] overflow-hidden pt-24 sm:pt-28 pb-0">
      
      {/* ========================================================================= */}
      {/* 1. OUR TEAM SECTION                                                       */}
      {/* ========================================================================= */}
      <section className="w-[90%] max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#726F6D] block">
              OUR TEAM
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-heading font-black text-[#111111] leading-[1.08] tracking-tight">
              A Specialized<br />
              Presentation<br />
              <span className="text-[#FCBF14]">Design Team.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#555250] font-normal leading-relaxed max-w-lg">
              Slidebee is powered by a team of presentation designers, visual storytellers, and creative professionals with extensive experience across industries.
            </p>

            <div className="pt-2">
              <Link
                to="/examples"
                data-bee-state="hover"
                className="inline-flex items-center gap-2 bg-[#FCBF14] hover:bg-[#E0A810] text-[#111111] font-bold text-sm sm:text-base px-8 py-3.5 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                <span>Meet Our Work</span>
                <ArrowRight size={17} className="stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Right Visual Column: Team Photo with Stepped Silhouette & Sticky Note */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            
            <div className="relative w-full max-w-[500px]">
              
              {/* Stepped Organic Silhouette Team Image Container */}
              <div className="relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] bg-[#F5F5F5] aspect-[4/3.3]">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80"
                  alt="SlideBee Presentation Design Team"
                  className="w-full h-full object-cover grayscale contrast-110 brightness-95"
                  loading="lazy"
                />
              </div>

              {/* Yellow Sticky Note with Radiating Accent Lines */}
              <div className="absolute -top-6 right-2 sm:-top-8 sm:right-4 z-20 flex items-start gap-2">
                
                {/* 3 Radiating Sketched Tick Lines to the left */}
                <svg className="w-6 h-8 text-[#111111] mt-2 shrink-0 select-none" viewBox="0 0 24 32" fill="none">
                  <path d="M22 6L4 12" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M22 16L2 16" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M22 26L4 20" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" />
                </svg>

                {/* Tilted Sticky Note */}
                <div className="bg-[#FFD028] text-[#111111] px-5 py-4 sm:px-6 sm:py-5 rounded-lg shadow-[0_12px_30px_rgba(0,0,0,0.18)] rotate-[-4deg] hover:rotate-0 transition-transform duration-300 border border-[#E5AC0E]/30">
                  <p className="font-heading font-extrabold text-sm sm:text-base leading-snug tracking-tight text-center whitespace-pre-line">
                    {"Different\nPerspectives\nBetter Slides"}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. OUR VISION SECTION                                                     */}
      {/* ========================================================================= */}
      <section className="w-[90%] max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#726F6D] block">
              OUR VISION
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-heading font-black text-[#111111] leading-[1.08] tracking-tight">
              A Global Destination<br />
              for <span className="text-[#FCBF14]">Better Presentations.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#555250] font-normal leading-relaxed max-w-xl">
              We aim to make Slidebee a trusted global destination for presentation design — where anyone can find the right tools, templates, and creative expertise to communicate their ideas more effectively.
            </p>
          </div>

          {/* Right Visual Column: Hand-Drawn Paper Airplane with Flight Loop */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-8 lg:pt-0">
            
            <div className="relative w-full max-w-[380px] h-[220px]">
              
              {/* Paper Airplane and Loop Trail SVG */}
              <svg
                viewBox="0 0 340 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible select-none"
              >
                {/* Swirling Loop-de-loop Trail Line */}
                <path
                  d="M 120 160 C 145 150, 165 140, 175 125 C 190 100, 170 80, 150 90 C 135 100, 140 125, 160 120 C 185 110, 220 70, 260 40"
                  stroke="#111111"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Origami Paper Airplane Facing Top-Right */}
                <g transform="translate(262, 38) rotate(-10)">
                  {/* Underwing Shadow */}
                  <path
                    d="M 0 0 L -55 24 L -28 10 Z"
                    fill="#E0A810"
                    stroke="#111111"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Top Wing Yellow */}
                  <path
                    d="M 0 0 L -55 -16 L -28 10 Z"
                    fill="#FCBF14"
                    stroke="#111111"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Center Crease */}
                  <path
                    d="M 0 0 L -28 10"
                    stroke="#111111"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>
              </svg>

              {/* Hand-Drawn Styled Text Note beside Trail */}
              <div className="absolute left-6 bottom-4">
                <p className="font-heading font-black italic text-base sm:text-lg text-[#111111] leading-tight">
                  Clear Ideas<br />
                  Create Bigger<br />
                  Opportunities
                </p>
                {/* Yellow Hand-Drawn Underline under Opportunities */}
                <svg className="w-24 h-3 mt-1 text-[#FCBF14]" viewBox="0 0 100 12" fill="none">
                  <path
                    d="M 2 7 Q 50 12, 98 4"
                    stroke="#FCBF14"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FULL-WIDTH CALL TO ACTION (Yellow Background)                          */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FCBF14] text-[#111111] py-20 sm:py-28 relative overflow-hidden text-center mt-12">
        
        {/* Organic Decorative Fluid Blobs on Left and Right Edges */}
        <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-40">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path d="M 0 50 C 60 20, 90 90, 80 140 C 70 190, 20 180, 0 200 Z" fill="#F0B108" />
          </svg>
        </div>

        <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-40">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path d="M 200 40 C 130 50, 110 120, 130 160 C 150 190, 170 190, 200 180 Z" fill="#F0B108" />
          </svg>
        </div>

        <div className="relative z-10 w-[90%] max-w-[850px] mx-auto space-y-6">
          
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#111111]/80 block">
            LET'S CREATE BETTER PRESENTATIONS
          </span>

          <h2 className="text-4xl sm:text-6xl lg:text-[68px] font-heading font-black text-[#111111] leading-[1.05] tracking-tight">
            Your Ideas. Our Design.
          </h2>

          <p className="text-base sm:text-xl text-[#111111]/90 font-medium max-w-xl mx-auto">
            Choose your way to create better presentations with Slidebee.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            
            {/* Button 1: Dark - Explore Templates */}
            <Link
              to="/"
              data-bee-state="hover"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#111111] hover:bg-black text-white font-bold text-sm sm:text-base px-9 py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Templates</span>
            </Link>

            {/* Button 2: Light - Get a Custom Presentation */}
            <Link
              to="/ordernow"
              data-bee-state="quote"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-[#FFFDF5] text-[#111111] font-bold text-sm sm:text-base px-9 py-4 rounded-full shadow-md border border-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Get a Custom Presentation</span>
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}
