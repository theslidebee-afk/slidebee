import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import type { BlogPromoCardConfig } from "./defaultArticles";

interface BlogStickyPromoProps {
  promo: BlogPromoCardConfig;
}

export const BlogStickyPromo: React.FC<BlogStickyPromoProps> = ({ promo }) => {
  if (!promo || !promo.title) return null;

  const isInternal = promo.buttonUrl?.startsWith("/") || promo.buttonUrl?.startsWith("#");

  return (
    <div className="bg-[#111111] text-white rounded-2xl p-5 border border-primary/30 shadow-lg relative overflow-hidden space-y-3.5 group">
      {/* Ambient background glow */}
      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

      {promo.badge && (
        <span className="hex-pill-sm inline-flex items-center gap-1 bg-[#FCBF14] text-[#111111] text-[10px] font-black px-2.5 py-0.5 shadow-xs">
          <Sparkles size={10} className="fill-[#111111]" /> {promo.badge}
        </span>
      )}

      <h4 className="text-sm sm:text-base font-heading font-extrabold text-white leading-snug group-hover:text-primary transition-colors">
        {promo.title}
      </h4>

      {promo.description && (
        <p className="text-xs text-gray-300 leading-relaxed font-medium">
          {promo.description}
        </p>
      )}

      <div className="pt-1">
        {isInternal ? (
          <Link
            to={promo.buttonUrl || "/ordernow"}
            className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <span>{promo.buttonText || "Order Now"}</span>
            <ArrowRight size={13} />
          </Link>
        ) : (
          <a
            href={promo.buttonUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <span>{promo.buttonText || "Order Now"}</span>
            <ArrowRight size={13} />
          </a>
        )}
      </div>
    </div>
  );
};
