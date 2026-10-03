import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";

export const BlogCtaBanner: React.FC = () => {
  return (
    <div className="hex-card-dark p-8 sm:p-10 border-2 border-primary text-center relative overflow-hidden shadow-2xl">
      <div className="max-w-xl mx-auto space-y-4 relative z-10">
        <span className="hex-pill inline-flex items-center gap-1.5 bg-primary text-[#111111] px-4 py-1 text-xs font-black uppercase tracking-wider">
          <Layers size={12} /> Transform Your Decks
        </span>
        <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
          Need Investor-Grade Slides Built for Your Next Meeting?
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 font-medium">
          Explore our curated marketplace of master PowerPoint templates or book our bespoke redesign services with 24-hour delivery.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/templates"
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-3 text-xs transition-transform hover:scale-105 shadow-md flex items-center gap-1.5"
          >
            Browse Templates <ArrowRight size={14} />
          </Link>
          <Link
            to="/ordernow"
            className="hex-pill bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 text-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </div>
  );
};
