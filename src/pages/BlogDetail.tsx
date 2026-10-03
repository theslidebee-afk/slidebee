import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft } from "lucide-react";
import { d1 } from "../lib/d1";
import { normalizeR2Url } from "../lib/r2";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  defaultArticles,
  BlogArticleBody,
  BlogCtaBanner,
  type BlogArticle
} from "../features/blog";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const activeArticleId = article?.id || id || "1";
  const articleKeywords = article?.keywords || [
    "presentation design",
    "pitch deck strategy",
    "powerpoint templates",
    "executive keynote design",
  ];

  const cleanDescription =
    article?.metaDescription ||
    (article?.content
      ? article.content.replace(/#{1,6}\s+/g, "").replace(/\*\*|\*/g, "").slice(0, 155) + "..."
      : "Expert guides on presentation design, pitch decks, and executive storytelling.");

  const ogImageUrl = article?.imageUrl
    ? (article.imageUrl.startsWith("http") ? article.imageUrl : `https://theslidebee.com${article.imageUrl}`)
    : "https://theslidebee.com/slidebee_logo_light.png";

  const canonicalUrl = `https://theslidebee.com/blog/${activeArticleId}`;

  const blogJsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: cleanDescription,
        image: [ogImageUrl],
        datePublished: "2026-09-01T00:00:00Z",
        dateModified: "2026-10-01T00:00:00Z",
        author: {
          "@type": "Organization",
          name: "SlideBee Presentation Studio",
          url: "https://theslidebee.com"
        },
        publisher: {
          "@type": "Organization",
          name: "SlideBee",
          logo: {
            "@type": "ImageObject",
            url: "https://theslidebee.com/slidebee_logo_light.png"
          }
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl
        }
      }
    : undefined;

  usePageSEO({
    title: article ? `${article.title} | SlideBee Insights` : "Presentation Insights | SlideBee Blog",
    description: cleanDescription,
    keywords: articleKeywords,
    canonicalUrl,
    ogType: "article",
    ogImage: ogImageUrl,
    ogUrl: canonicalUrl,
    twitterCard: "summary_large_image",
    twitterImage: ogImageUrl,
    jsonLd: blogJsonLd,
  });

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      try {
        const { data } = await d1
          .from("site_config")
          .select("value")
          .eq("key", "blog_cms")
          .maybeSingle();

        if (data?.value && Array.isArray(data.value)) {
          const found = data.value.find((a: any) => String(a.id) === String(id));
          if (found) {
            setArticle(found);
            setLoading(false);
            return;
          }
        }

        // Fallback to default articles
        if (id && defaultArticles[id]) {
          setArticle(defaultArticles[id]);
        } else if (id) {
          // If custom id, pick first default or match
          setArticle(defaultArticles["1"]);
        }
      } catch (err) {
        console.warn("Could not load article:", err);
        if (id && defaultArticles[id]) {
          setArticle(defaultArticles[id]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-36 pb-24 large-hex-grid">
        <div className="w-[90%] max-w-[800px] mx-auto text-center px-4">
          <h1 className="text-3xl font-heading font-extrabold mb-4">Article Not Found</h1>
          <p className="text-sm text-[#726F6D] mb-8">The requested article could not be located.</p>
          <Link
            to="/blog"
            className="hex-pill inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-3 text-xs shadow-md"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-32 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[960px] mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#726F6D] hover:text-primary-amber transition-colors"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
        </div>

        {/* Header Metadata */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="hex-pill-sm bg-[#111111] text-[#FCBF14] border border-primary/40 text-[10px] font-black px-3.5 py-1">
              {article.category || "Design Insights"}
            </span>
            <div className="flex items-center text-xs text-[#726F6D] font-bold gap-1.5">
              <Calendar size={13} className="text-primary-amber" />
              <span>{article.date || "September 2026"}</span>
            </div>
            {article.readTime && (
              <>
                <span className="text-xs text-[#726F6D]">•</span>
                <span className="text-xs text-[#726F6D] font-medium">{article.readTime}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] leading-tight">
            {article.title}
          </h1>
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-primary/40 shadow-xl mb-12 bg-[#111111]">
            <img
              src={normalizeR2Url(article.imageUrl)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <BlogArticleBody content={article.content} />

        {/* Bottom CTA Banner */}
        <BlogCtaBanner />
      </div>
    </div>
  );
}
