import React from "react";
import { Link } from "react-router-dom";

interface BlogArticleBodyProps {
  content: string;
}

/**
 * Parses inline markdown:
 * - **bold** or __bold__ -> <strong>
 * - *italic* or _italic_ -> <em>
 * - [text](url) -> internal <Link> or external <a>
 * - `code` -> <code>
 * Eliminates all raw asterisks (**) and brackets from text output.
 */
export function renderFormattedInline(text: string): React.ReactNode {
  if (!text) return null;

  // Tokenize regex for markdown elements:
  // 1. Links: [text](url)
  // 2. Bold: **text** or __text__
  // 3. Italic: *text* or _text_
  // 4. Code: `text`
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|`([^`]+)`)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding normal text
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // [text](url)
      const linkText = match[2];
      const linkUrl = match[3];
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");

      if (isInternal) {
        parts.push(
          <Link
            key={match.index}
            to={linkUrl}
            className="text-primary-amber hover:text-[#111111] font-bold underline underline-offset-2 transition-colors"
          >
            {renderFormattedInline(linkText)}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-amber hover:text-[#111111] font-bold underline underline-offset-2 transition-colors"
          >
            {renderFormattedInline(linkText)}
          </a>
        );
      }
    } else if (match[4] || match[5]) {
      // **bold** or __bold__
      const boldContent = match[4] || match[5];
      parts.push(
        <strong key={match.index} className="font-extrabold text-[#111111]">
          {renderFormattedInline(boldContent)}
        </strong>
      );
    } else if (match[6]) {
      // *italic*
      const italicContent = match[6];
      parts.push(
        <em key={match.index} className="italic text-[#333333]">
          {italicContent}
        </em>
      );
    } else if (match[7]) {
      // `code`
      const codeContent = match[7];
      parts.push(
        <code key={match.index} className="bg-[#111111]/5 text-[#111111] px-1.5 py-0.5 rounded text-xs font-mono border border-[#111111]/10">
          {codeContent}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Push remainder
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const BlogArticleBody: React.FC<BlogArticleBodyProps> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-stone max-w-none text-[#111111] text-base leading-relaxed space-y-6 font-medium">
      {content.split(/\n\n+/).map((paragraph: string, idx: number) => {
        const trimmed = paragraph.trim();
        if (!trimmed) return null;

        // Header 2 or 3 (e.g. ## Title or ### Title)
        if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
          const isH2 = trimmed.startsWith("## ");
          const rawTitle = isH2 ? trimmed.replace(/^##\s+/, "") : trimmed.replace(/^###\s+/, "");
          const slug = slugifyHeading(rawTitle);

          return (
            <h3
              key={idx}
              id={slug}
              className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111] pt-6 pb-2 scroll-mt-28 border-b border-[#111111]/8"
            >
              {renderFormattedInline(rawTitle)}
            </h3>
          );
        }

        // Header 4
        if (trimmed.startsWith("#### ")) {
          const rawTitle = trimmed.replace(/^####\s+/, "");
          const slug = slugifyHeading(rawTitle);
          return (
            <h4
              key={idx}
              id={slug}
              className="text-lg font-heading font-extrabold text-[#111111] pt-4 pb-1 scroll-mt-28"
            >
              {renderFormattedInline(rawTitle)}
            </h4>
          );
        }

        // Bullet List
        if (trimmed.startsWith("- ")) {
          const listItems = trimmed.split(/\n-\s+/);
          return (
            <ul key={idx} className="space-y-2 pl-4 border-l-2 border-primary/40 my-4">
              {listItems.map((item, i) => (
                <li key={i} className="text-sm text-[#333333] leading-relaxed">
                  {renderFormattedInline(item.replace(/^- /, ""))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered List
        if (trimmed.match(/^[0-9]+\.\s/)) {
          const numItems = trimmed.split(/\n(?=[0-9]+\.\s)/);
          return (
            <ol key={idx} className="space-y-3 pl-5 list-decimal text-sm text-[#333333] leading-relaxed my-4">
              {numItems.map((item, i) => (
                <li key={i} className="pl-1">
                  {renderFormattedInline(item.replace(/^[0-9]+\.\s/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-sm sm:text-base text-[#333333] leading-relaxed">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
