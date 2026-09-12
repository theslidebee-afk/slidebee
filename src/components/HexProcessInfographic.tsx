import React from "react";
import { Layout, UploadCloud, Palette, Trophy, ChevronRight } from "lucide-react";

const steps = [
  { 
    num: "01", 
    badge: "STEP 01", 
    title: "Select Template or Share Idea", 
    desc: "Choose a curated starting deck or share your raw design ideas and requirements with us.", 
    icon: <Layout className="w-5 h-5 text-[#FCBF14]" />
  },
  { 
    num: "02", 
    badge: "STEP 02", 
    title: "Share Content", 
    desc: "Upload your raw notes, spreadsheets, or brand guidelines securely.", 
    icon: <UploadCloud className="w-5 h-5 text-[#FCBF14]" />
  },
  { 
    num: "03", 
    badge: "STEP 03", 
    title: "Expert Design", 
    desc: "Our senior designers craft high-impact slides with bespoke typography and charts.", 
    icon: <Palette className="w-5 h-5 text-[#111111]" />,
    isHighlighted: true
  },
  { 
    num: "04", 
    badge: "STEP 04", 
    title: "Present & Win", 
    desc: "Receive 100% editable Master PowerPoint (.pptx) ready to impress stakeholders.", 
    icon: <Trophy className="w-5 h-5 text-[#FCBF14]" />
  }
];

const HexProcessInfographic: React.FC = () => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-[2px] bg-[#FCBF14]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#726F6D]">
            4-Step Process Pipeline
          </span>
          <div className="w-8 h-[2px] bg-[#FCBF14]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-heading font-black text-[#111111] mb-4">
          How SlideBee Services Work
        </h2>
        <p className="text-[#726F6D] text-sm md:text-base font-medium max-w-2xl mx-auto">
          From rough notes to boardroom-ready presentations in four simple, transparent milestones.
        </p>
      </div>

      {/* Desktop & Tablet: Horizontal Grid with Connectors */}
      <div className="relative max-w-[1400px] mx-auto">
        {/* Background Connector Line (Hidden on Mobile) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FCBF14]/40 to-transparent -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Chevron pointing to next step (Desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white border-2 border-[#FCBF14]/20 rounded-full items-center justify-center shadow-sm">
                  <ChevronRight className="w-4 h-4 text-[#FCBF14]" />
                </div>
              )}

              {/* Step Card */}
              <div 
                className={`
                  h-full flex flex-col p-8 rounded-2xl border-2 transition-all duration-300 backdrop-blur-xl
                  ${step.isHighlighted 
                    ? 'bg-[#FCBF14]/90 border-[#FCBF14] shadow-xl shadow-[#FCBF14]/20 -translate-y-2' 
                    : 'bg-white/60 border-[#FCBF14]/20 hover:border-[#FCBF14] hover:-translate-y-1 shadow-md hover:shadow-lg'
                  }
                `}
              >
                {/* Number & Icon Header */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-5xl font-black font-heading ${step.isHighlighted ? 'text-[#111111]/10' : 'text-[#FCBF14]/20'}`}>
                    {step.num}
                  </span>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${step.isHighlighted ? 'bg-white/20' : 'bg-[#FFF9E8]'}`}>
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <span className={`text-[10px] font-black uppercase tracking-widest mb-2 ${step.isHighlighted ? 'text-[#111111]/70' : 'text-[#FCBF14]'}`}>
                  {step.badge}
                </span>
                <h4 className={`text-xl font-heading font-black mb-3 ${step.isHighlighted ? 'text-[#111111]' : 'text-[#111111]'}`}>
                  {step.title}
                </h4>
                <p className={`text-sm font-medium leading-relaxed ${step.isHighlighted ? 'text-[#111111]/80' : 'text-[#726F6D]'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { HexProcessInfographic };
