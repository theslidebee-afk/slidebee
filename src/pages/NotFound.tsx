import { Link } from "react-router-dom";
import { Home, FileQuestion, Layers } from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export default function NotFound() {
  usePageSEO({
    title: "Page Not Found (404) | SlideBee",
    description: "The requested slide deck or page could not be found. Return to SlideBee home to browse executive presentation designs.",
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FFF9E8] px-4 py-20 relative overflow-hidden large-hex-grid">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10">
        {/* Hexagonal Error Badge */}
        <div className="inline-flex items-center justify-center w-24 h-24 hex-card bg-white border-2 border-[#FCBF14] shadow-lg mb-8 mx-auto text-[#111111]">
          <FileQuestion size={44} className="text-[#FCBF14]" />
        </div>

        <div className="hex-pill inline-block bg-[#111111] text-[#FCBF14] px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4">
          Error 404
        </div>

        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-[#111111] tracking-tight mb-4">
          Slide Not Found
        </h1>

        <p className="text-[#726F6D] text-base sm:text-lg mb-8 leading-relaxed max-w-md mx-auto">
          The slide or page you are looking for has been relocated, archived, or does not exist in the Hive.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FCBF14] text-[#111111] font-bold hex-card hover:bg-[#E5AC10] transition-colors shadow-sm"
          >
            <Home size={18} />
            Return to Hive
          </Link>

          <Link
            to="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#111111] font-bold hex-card border-2 border-[#111111]/20 hover:border-[#111111] transition-colors shadow-sm"
          >
            <Layers size={18} className="text-[#FCBF14]" />
            Browse Templates
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-[#111111]/10 text-xs text-[#726F6D]">
          Need custom executive slide design?{" "}
          <Link to="/contact" className="text-[#111111] font-bold underline hover:text-[#FCBF14] transition-colors">
            Contact our design team
          </Link>
        </div>
      </div>
    </div>
  );
}
