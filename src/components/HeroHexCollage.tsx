import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Zap } from 'lucide-react';

export const HeroHexCollage: React.FC = () => {
  return (
    <div className="relative w-full max-w-[720px] lg:max-w-[750px] xl:max-w-[780px] aspect-[1/0.92] select-none mx-auto flex items-center justify-center">
      {/* Soft Ambient Golden Glow */}
      <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] bg-[#FCBF14]/15 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Main Collage Canvas Container */}
      <div className="relative w-full h-full">

        {/* ============================================================
            1. MASTER FOCAL HEXAGON (Center-Left Hero Anchor)
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.02, y: -4 }}
          className="absolute left-[3%] sm:left-[4%] top-[10%] w-[270px] sm:w-[325px] xl:w-[370px] aspect-[0.866] z-10 group cursor-pointer"
          style={{
            filter: "drop-shadow(0 20px 35px rgba(17, 17, 17, 0.22))"
          }}
        >
          {/* Crisp 3px Gold Border via Padding */}
          <div
            className="w-full h-full p-[3px] bg-gradient-to-b from-[#FFE17D] via-[#FCBF14] to-[#C98800] transition-colors"
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
          >
            <div
              className="w-full h-full bg-[#111111] overflow-hidden relative"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              <img
                src="/portfolio/case_study_a_1.png"
                alt="Series A Investor Pitch Deck"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
              />

              {/* Gradient Overlay & Editorial Badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/20 to-transparent flex flex-col justify-end p-5 text-center">
                <div className="inline-flex items-center justify-center gap-1.5 bg-[#111111]/80 backdrop-blur-md border border-[#FCBF14]/50 px-3 py-1 rounded-full mx-auto mb-2 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FCBF14] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-black text-[#FCBF14] uppercase tracking-wider">
                    Investor Pitch Deck
                  </span>
                </div>
                <p className="text-white text-xs sm:text-sm font-extrabold line-clamp-1">
                  Series A / Seed Funding Deck
                </p>
                <span className="text-gray-300 text-[10px] font-medium">45+ High-Conversion Slides</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            2. TOP-RIGHT SATELLITE HEXAGON (Product Strategy)
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="absolute left-[54%] sm:left-[57%] top-[2%] w-[145px] sm:w-[170px] xl:w-[195px] aspect-[0.866] z-10 group cursor-pointer"
          style={{
            filter: "drop-shadow(0 14px 26px rgba(17, 17, 17, 0.16))"
          }}
        >
          <div
            className="w-full h-full p-[2.5px] bg-gradient-to-b from-white via-[#FCBF14]/70 to-[#FCBF14]"
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
          >
            <div
              className="w-full h-full bg-[#111111] overflow-hidden relative"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              <img
                src="/portfolio/case_study_a_14.png"
                alt="Product Roadmap"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-center">
                <span className="text-white text-[10px] sm:text-[11px] font-black">
                  Product Roadmap
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            3. MIDDLE-RIGHT SATELLITE HEXAGON (KPI Dashboard)
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="absolute left-[67%] sm:left-[69%] top-[33%] w-[155px] sm:w-[185px] xl:w-[215px] aspect-[0.866] z-10 group cursor-pointer"
          style={{
            filter: "drop-shadow(0 16px 28px rgba(17, 17, 17, 0.18))"
          }}
        >
          <div
            className="w-full h-full p-[2.5px] bg-gradient-to-b from-[#FFE17D] via-[#FCBF14] to-[#C98800]"
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
          >
            <div
              className="w-full h-full bg-[#111111] overflow-hidden relative"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              <img
                src="/portfolio/nike_hsbc_cvs_10.png"
                alt="KPI & Metrics Dashboard"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 text-center">
                <span className="text-[#FCBF14] text-[9px] font-extrabold uppercase tracking-wider">
                  Executive
                </span>
                <span className="text-white text-[10px] sm:text-[11px] font-black">
                  KPI & Metrics
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            4. SOLID HONEY GOLD INTERACTIVE HEXAGON ("BOOK A TOUR" STYLE)
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          whileHover={{ scale: 1.08, y: -6 }}
          whileTap={{ scale: 0.96 }}
          className="absolute left-[45%] sm:left-[48%] top-[56%] w-[138px] sm:w-[160px] xl:w-[185px] aspect-[0.866] z-20 cursor-pointer"
          style={{
            filter: "drop-shadow(0 16px 30px rgba(252, 191, 20, 0.45))"
          }}
        >
          <Link to="/templates" className="block w-full h-full group">
            {/* Outer Hexagon with crisp border */}
            <div
              className="w-full h-full p-[2.5px] bg-[#111111] group-hover:bg-black transition-colors"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              {/* Inner Solid Honey Gold Hexagon */}
              <div
                className="w-full h-full bg-[#FCBF14] group-hover:bg-[#EAA905] transition-colors flex flex-col items-center justify-center p-3 text-center"
                style={{
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                }}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]/75 mb-0.5">
                  EXPLORE
                </span>
                <span className="text-xs sm:text-sm xl:text-base font-black text-[#111111] leading-tight mb-1.5">
                  5,000+<br />DECKS
                </span>
                <div className="w-6 h-6 rounded-full bg-[#111111] text-[#FCBF14] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ============================================================
            5. BOTTOM-CENTER ACCENT HEXAGON (Creative Brand Deck)
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="absolute left-[16%] sm:left-[19%] top-[68%] w-[125px] sm:w-[145px] xl:w-[168px] aspect-[0.866] z-10 group cursor-pointer"
          style={{
            filter: "drop-shadow(0 14px 24px rgba(17, 17, 17, 0.16))"
          }}
        >
          <div
            className="w-full h-full p-[2px] bg-gradient-to-b from-white via-[#FCBF14]/80 to-[#FCBF14]"
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
          >
            <div
              className="w-full h-full bg-[#111111] overflow-hidden relative"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              <img
                src="/portfolio/levis_yuengling_1.png"
                alt="Creative Brand Decks"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5 text-center">
                <span className="text-white text-[10px] font-black">
                  Creative Brand
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            6. FAR TOP-RIGHT SUBTLE HEXAGON (Consulting Deck Depth)
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          className="absolute left-[78%] sm:left-[80%] top-[0%] w-[110px] sm:w-[128px] xl:w-[150px] aspect-[0.866] z-0 group cursor-pointer hidden sm:block"
          style={{
            filter: "drop-shadow(0 10px 20px rgba(17, 17, 17, 0.12))"
          }}
        >
          <div
            className="w-full h-full p-[2px] bg-gradient-to-b from-white/90 to-[#FCBF14]/60"
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }}
          >
            <div
              className="w-full h-full bg-[#111111] overflow-hidden relative"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
              }}
            >
              <img
                src="/portfolio/global_brands_1.png"
                alt="Consulting Strategy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-center">
                <span className="text-white text-[9px] font-black">
                  Consulting
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            7. FLOATING STATS PILL & RATING BADGES
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-0 bottom-[2%] z-20 bg-white/95 backdrop-blur-md border-2 border-[#FCBF14]/60 rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-2"
        >
          <div className="flex items-center text-amber-500">
            <Star size={12} className="fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] font-black text-[#111111]">
            4.9/5 Rating <span className="font-medium text-[#726F6D]">(1,200+ Reviews)</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="absolute right-[2%] top-[74%] z-20 bg-[#111111]/95 text-white border border-[#FCBF14]/40 rounded-full px-3 py-1 shadow-lg flex items-center gap-1.5"
        >
          <Zap size={12} className="text-[#FCBF14] fill-[#FCBF14]" />
          <span className="text-[10px] font-black tracking-wide text-white">
            24h Turnaround
          </span>
        </motion.div>

      </div>
    </div>
  );
};

export default HeroHexCollage;
