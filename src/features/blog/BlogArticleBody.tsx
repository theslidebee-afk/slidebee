import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface BlogArticleBodyProps {
  content: string;
}

export const BlogArticleBody: React.FC<BlogArticleBodyProps> = ({ content }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <article className="hex-card-lg bg-white border-2 border-primary/30 p-8 sm:p-12 shadow-sm mb-12">
      <div className="prose prose-stone max-w-none text-[#111111] text-sm sm:text-base leading-relaxed space-y-6 font-medium">
        {content.split(/\n\n+/).map((paragraph: string, idx: number) => {
          const trimmed = paragraph.trim();
          if (trimmed.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111] pt-4 pb-1">
                {trimmed.replace("### ", "")}
              </h3>
            );
          }
          if (trimmed.startsWith("- ")) {
            const listItems = trimmed.split(/\n-\s+/);
            return (
              <ul key={idx} className="space-y-2 pl-4 border-l-2 border-primary/40 my-4">
                {listItems.map((item, i) => (
                  <li key={i} className="text-xs sm:text-sm text-[#333333] leading-relaxed">
                    {item.replace(/^- /, "")}
                  </li>
                ))}
              </ul>
            );
          }
          if (trimmed.match(/^[0-9]+\.\s/)) {
            const numItems = trimmed.split(/\n(?=[0-9]+\.\s)/);
            return (
              <ol key={idx} className="space-y-2 pl-5 list-decimal text-xs sm:text-sm text-[#333333] leading-relaxed my-4">
                {numItems.map((item, i) => (
                  <li key={i}>
                    {item.replace(/^[0-9]+\.\s/, "")}
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <p key={idx} className="text-xs sm:text-sm text-[#333333] leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Social Share & Author Bar */}
      <div className="border-t border-primary/20 mt-10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-heading font-black text-xs text-[#111111]">
            SB
          </div>
          <div>
            <div className="text-xs font-heading font-extrabold text-[#111111]">
              SlideBee Editorial Team
            </div>
            <div className="text-[11px] text-[#726F6D] font-medium">
              Senior Presentation Strategists & Art Directors
            </div>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="hex-pill inline-flex items-center gap-1.5 bg-[#FFF9E8] hover:bg-black/5 text-[#111111] border border-primary/40 px-4 py-2 text-xs font-extrabold transition-all cursor-pointer"
        >
          {copiedLink ? <Check size={13} className="text-green-600" /> : <Share2 size={13} />}
          <span>{copiedLink ? "Link Copied" : "Share Article"}</span>
        </button>
      </div>
    </article>
  );
};
