import React, { useState } from "react";
import { Link2, Mail, Check } from "lucide-react";

interface BlogShareBarProps {
  title?: string;
  articleTitle: string;
}

export const BlogShareBar: React.FC<BlogShareBarProps> = ({
  title = "Share Blog",
  articleTitle,
}) => {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(articleTitle)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(articleTitle);
    const body = encodeURIComponent(`Read this article on SlideBee:\n\n${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white border border-[#111111]/10 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#111111]/8">
        <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#111111]">
          {title}
        </h4>
        {copied && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check size={10} /> Copied!
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex-1 py-2 rounded-xl border border-[#111111]/12 hover:border-[#111111]/30 bg-[#FFF9E8] hover:bg-[#FFF4D0] text-[#111111] transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
          title="Copy Article Link"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Link2 size={13} className="text-primary-amber" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>

        {/* LinkedIn SVG Icon */}
        <button
          type="button"
          onClick={handleShareLinkedIn}
          className="w-9 h-9 rounded-xl border border-[#111111]/12 hover:border-[#111111]/30 bg-white hover:bg-black/4 text-[#0077b5] transition-all flex items-center justify-center cursor-pointer"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
          </svg>
        </button>

        {/* X / Twitter SVG Icon */}
        <button
          type="button"
          onClick={handleShareTwitter}
          className="w-9 h-9 rounded-xl border border-[#111111]/12 hover:border-[#111111]/30 bg-white hover:bg-black/4 text-[#111111] transition-all flex items-center justify-center cursor-pointer"
          title="Share on X"
          aria-label="Share on X"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>

        <button
          type="button"
          onClick={handleShareEmail}
          className="w-9 h-9 rounded-xl border border-[#111111]/12 hover:border-[#111111]/30 bg-white hover:bg-black/4 text-[#726F6D] hover:text-[#111111] transition-all flex items-center justify-center cursor-pointer"
          title="Share via Email"
          aria-label="Share via Email"
        >
          <Mail size={15} />
        </button>
      </div>
    </div>
  );
};
