import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Paintbrush, TrendingUp, BarChart3, LayoutGrid } from "lucide-react";
import { MagneticButton } from "../../../components/MagneticButton";

export function HomeCustomServiceStrip() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 bg-[#FFF9E8] py-12 border-t-2 border-primary/20"
    >
      <div className="w-[92%] max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 sm:p-10 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-[#111111] mb-1">
                Need Something Custom?
              </h2>
              <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
                Our presentation specialists redesign, storyboard, and animate executive slides in 24h–48h.
              </p>
            </div>
            <MagneticButton>
              <Link
                to="/ordernow"
                className="rounded-full text-[#111111] font-black px-7 py-3 text-xs sm:text-sm gap-2 shrink-0 bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow shadow-md shadow-[#FCBF14]/25 hover:scale-105 transition-all flex items-center"
              >
                Request Custom Design <ArrowRight size={15} />
              </Link>
            </MagneticButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
              <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Paintbrush className="w-5 h-5 text-primary-amber" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Presentation Redesign
              </h3>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                Transform cluttered slides into clear, modern, and impactful presentations.
              </p>
            </div>

            <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
              <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-primary-amber" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Pitch Deck Design
              </h3>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                Investor-ready pitch decks that tell your story and secure attention.
              </p>
            </div>

            <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
              <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-primary-amber" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Data Visualization
              </h3>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                Turn complex data into visual stories that drive understanding.
              </p>
            </div>

            <div className="hex-card bg-[#FFF9E8]/80 border-2 border-primary/30 p-5 flex flex-col items-center text-center group hover:border-primary hover:shadow-md transition-all">
              <div className="hex-pill w-12 h-12 bg-primary/20 border border-primary/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-5 h-5 text-primary-amber" />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Branded Templates
              </h3>
              <p className="text-[#726F6D] text-[11px] font-medium leading-relaxed">
                Custom templates that reflect your brand and maintain consistency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
