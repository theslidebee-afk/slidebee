import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { normalizeR2Url } from "../../lib/r2";
import type { BlogArticle } from "./defaultArticles";

interface BlogRelatedArticlesProps {
  articles: BlogArticle[];
  currentId: string;
  category?: string;
  title?: string;
  subtitle?: string;
}

export const BlogRelatedArticles: React.FC<BlogRelatedArticlesProps> = ({
  articles,
  currentId,
  category,
  title = "Related Presentation Playbooks",
  subtitle = "Explore more insights and executive guides to accelerate high-stakes pitch and ecommerce conversions.",
}) => {
  // Filter out current article
  const others = articles.filter((a) => String(a.id) !== String(currentId));

  // Prioritize same category, then append others
  const sameCategory = others.filter(
    (a) => a.category?.toLowerCase() === category?.toLowerCase()
  );
  const differentCategory = others.filter(
    (a) => a.category?.toLowerCase() !== category?.toLowerCase()
  );

  const relatedList = [...sameCategory, ...differentCategory].slice(0, 3);

  if (relatedList.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-[#111111]/10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary-amber block mb-1.5">
            Discover More
          </span>
          <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111111]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#726F6D] mt-1 max-w-2xl font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          to="/blog"
          className="text-xs font-extrabold text-[#111111] hover:text-primary-amber flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>View All Articles</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedList.map((item) => {
          const authorName = item.author?.name || "SlideBee Editorial";
          const authorAvatar = item.author?.avatar || "/slidebee_logo_light.png";

          return (
            <Link
              key={item.id}
              to={`/blog/${item.id}`}
              className="bg-white border border-[#111111]/12 hover:border-primary rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col group cursor-pointer"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#111111]">
                <img
                  src={normalizeR2Url(item.imageUrl)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#111111]/85 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {item.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-grow">
                <h4 className="text-sm sm:text-base font-heading font-extrabold text-[#111111] mb-2 leading-snug line-clamp-2 group-hover:text-primary-amber transition-colors">
                  {item.title}
                </h4>

                <p className="text-xs text-[#726F6D] leading-relaxed line-clamp-2 mb-4 flex-grow font-medium">
                  {item.subtitle || item.excerpt || item.metaDescription || item.content.slice(0, 120)}
                </p>

                {/* Author & Date Footer */}
                <div className="pt-3 border-t border-[#111111]/6 flex items-center justify-between text-[11px] text-[#726F6D]">
                  <div className="flex items-center gap-2">
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-5 h-5 rounded-full object-cover bg-primary/20 border border-[#111111]/10"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/slidebee_logo_light.png";
                      }}
                    />
                    <span className="font-bold text-[#111111] truncate max-w-[110px]">
                      {authorName}
                    </span>
                  </div>
                  <span className="font-medium shrink-0">{item.date}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
