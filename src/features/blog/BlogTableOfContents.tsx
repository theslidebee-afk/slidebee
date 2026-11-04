import React, { useEffect, useState } from "react";
import { ListFilter } from "lucide-react";
import { cleanHeadingText, slugifyHeading } from "./BlogArticleBody";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
  title?: string;
}

export const BlogTableOfContents: React.FC<BlogTableOfContentsProps> = ({
  content,
  title = "Table of Contents",
}) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!content) {
      setHeadings([]);
      return;
    }

    const items: TocItem[] = [];
    const lines = content.split(/\n+/);

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
        const isH3 = trimmed.startsWith("### ");
        const rawTitle = isH3 ? trimmed.replace(/^###\s+/, "") : trimmed.replace(/^##\s+/, "");
        const text = cleanHeadingText(rawTitle);
        const slug = slugifyHeading(rawTitle);
        if (text && slug) {
          items.push({
            id: slug,
            text,
            level: isH3 ? 3 : 2,
          });
        }
      }
    });

    setHeadings(items);
    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Handle initial hash in URL if present
    const hash = window.location.hash?.replace("#", "");
    if (hash) {
      const match = headings.find((h) => h.id === hash);
      if (match) {
        setTimeout(() => {
          scrollToHeading(match.id);
        }, 400);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-90px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // Fixed navigation header offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
      try {
        window.history.replaceState(null, "", `#${id}`);
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <div className="bg-white border border-[#111111]/10 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-2.5 border-b border-[#111111]/8">
        <ListFilter size={14} className="text-primary-amber" />
        <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#111111]">
          {title}
        </h4>
      </div>

      <nav className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
        {headings.map((h, i) => {
          const isActive = activeId === h.id;
          return (
            <button
              key={`${h.id}-${i}`}
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all flex items-start gap-2 cursor-pointer ${
                isActive
                  ? "bg-[#FFF9E8] text-[#111111] font-extrabold border-l-3 border-primary-amber shadow-2xs"
                  : "text-[#726F6D] hover:text-[#111111] hover:bg-black/2 font-medium"
              }`}
            >
              <span className={`text-[10px] mt-0.5 shrink-0 ${isActive ? "text-primary-amber font-black" : "text-gray-400"}`}>
                {i + 1}.
              </span>
              <span className="line-clamp-2 leading-relaxed">{h.text}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
