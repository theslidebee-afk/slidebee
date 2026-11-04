import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { d1 } from "../lib/d1";
import { normalizeR2Url } from "../lib/r2";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  allDefaultBlogArticles,
  defaultArticles,
  DEFAULT_BLOG_SETTINGS,
  BlogArticleBody,
  BlogCtaBanner,
  BlogTableOfContents,
  BlogShareBar,
  BlogStickyPromo,
  BlogRelatedArticles,
  type BlogArticle,
  type BlogGlobalSettings
} from "../features/blog";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [allArticles, setAllArticles] = useState<BlogArticle[]>(allDefaultBlogArticles);
  const [settings, setSettings] = useState<BlogGlobalSettings>(DEFAULT_BLOG_SETTINGS);
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
    article?.subtitle ||
    article?.excerpt ||
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
          "@type": "Person",
          name: article.author?.name || "SlideBee Editorial Desk",
          jobTitle: article.author?.role || "Senior Presentation Strategist"
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

        let loadedArticles: BlogArticle[] = allDefaultBlogArticles;
        let loadedSettings: BlogGlobalSettings = DEFAULT_BLOG_SETTINGS;

        if (data?.value) {
          if (Array.isArray(data.value)) {
            // Backward-compatible array of articles
            const cmsIds = new Set(data.value.map((a: any) => String(a.id)));
            const missing = allDefaultBlogArticles.filter((d) => !cmsIds.has(String(d.id)));
            loadedArticles = [...data.value, ...missing];
          } else if (typeof data.value === "object" && data.value.articles) {
            // New schema with settings and articles
            const cmsArticles = Array.isArray(data.value.articles) ? data.value.articles : [];
            const cmsIds = new Set(cmsArticles.map((a: any) => String(a.id)));
            const missing = allDefaultBlogArticles.filter((d) => !cmsIds.has(String(d.id)));
            loadedArticles = [...cmsArticles, ...missing];
            if (data.value.settings) {
              loadedSettings = { ...DEFAULT_BLOG_SETTINGS, ...data.value.settings };
            }
          }
        }

        setAllArticles(loadedArticles);
        setSettings(loadedSettings);

        // Find active article
        const found = loadedArticles.find((a) => String(a.id) === String(id));
        if (found) {
          // If found article has full body, use it. If not, fallback to defaultArticles full content
          const defaultRef = id ? defaultArticles[id] : null;
          const effectiveContent = (found.content && found.content.length > 250)
            ? found.content
            : (defaultRef?.content || found.content || "");

          setArticle({
            ...found,
            content: effectiveContent,
          });
          setLoading(false);
          return;
        }

        // Fallback to defaultArticles
        if (id && defaultArticles[id]) {
          const def = defaultArticles[id];
          setArticle({
            id: String(def.id),
            title: def.title,
            subtitle: def.metaDescription,
            category: def.category,
            date: def.date,
            imageUrl: def.imageUrl,
            readTime: def.readTime,
            content: def.content,
            author: {
              name: "SlideBee Editorial Desk",
              role: "Senior Presentation Strategists & Art Directors",
              avatar: "/slidebee_logo_light.png"
            }
          });
        }
      } catch (err) {
        console.warn("Could not load article:", err);
        if (id && defaultArticles[id]) {
          const def = defaultArticles[id];
          setArticle({
            id: String(def.id),
            title: def.title,
            subtitle: def.metaDescription,
            category: def.category,
            date: def.date,
            imageUrl: def.imageUrl,
            readTime: def.readTime,
            content: def.content,
            author: {
              name: "SlideBee Editorial Desk",
              role: "Senior Presentation Strategists & Art Directors",
              avatar: "/slidebee_logo_light.png"
            }
          });
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

  const authorName = article.author?.name || "SlideBee Editorial Desk";
  const authorRole = article.author?.role || "Senior Presentation Strategists & Art Directors";
  const authorAvatar = article.author?.avatar || "/slidebee_logo_light.png";
  const effectivePromo = article.customPromo || settings.defaultPromo;

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[92%] max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Top: Button to go back */}
        <div className="mb-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#726F6D] hover:text-[#111111] transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Go back to Playbook</span>
          </Link>
        </div>

        {/* Header Section: Category, Title, Subtitle, Author & Date */}
        <header className="space-y-4 mb-8 max-w-4xl">
          <div className="inline-block">
            <span className="hex-pill-sm bg-[#111111] text-[#FCBF14] border border-primary/40 text-[10px] font-black uppercase tracking-wider px-3.5 py-1">
              {article.category || "Presentation Insights"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-[#111111] leading-[1.15] tracking-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-base sm:text-lg text-[#726F6D] font-medium leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author & Date Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#111111]/8">
            <div className="flex items-center gap-3">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover bg-primary/20 border border-[#111111]/15 shadow-2xs"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/slidebee_logo_light.png";
                }}
              />
              <div>
                <div className="text-xs font-heading font-extrabold text-[#111111]">
                  {authorName}
                </div>
                <div className="text-[11px] text-[#726F6D] font-medium">
                  {authorRole}
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-gray-300">•</div>

            <div className="flex items-center text-xs text-[#726F6D] font-bold gap-3">
              <span>{article.date || "September 2026"}</span>
              {article.readTime && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="font-medium">{article.readTime}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Blog Cover Image: Covering full grid */}
        {article.imageUrl && (
          <div className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#111111]/12 shadow-xl mb-12 bg-[#111111]">
            <img
              src={normalizeR2Url(article.imageUrl)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Two-Column Editorial Grid: 8 cols main content + 4 cols sticky corner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Main Editorial Column (8 cols): Unboxed Natural Flow */}
          <main className="lg:col-span-8 min-w-0">
            <BlogArticleBody content={article.content} />
          </main>

          {/* Sticky Corner (4 cols): Sticky on scroll */}
          <aside className="lg:col-span-4 sticky top-28 space-y-5">
            {/* Table of Contents */}
            {settings.showToc && (
              <BlogTableOfContents
                content={article.content}
                title={settings.tocTitle || "Table of Contents"}
              />
            )}

            {/* Share Blog Bar */}
            {settings.showShare && (
              <BlogShareBar
                title={settings.shareTitle || "Share Blog"}
                articleTitle={article.title}
              />
            )}

            {/* Contextual Promotional Card */}
            {effectivePromo && (
              <BlogStickyPromo promo={effectivePromo} />
            )}
          </aside>
        </div>

        {/* Other Blogs Section / Related Blogs */}
        <BlogRelatedArticles
          articles={allArticles}
          currentId={String(article.id)}
          category={article.category}
          title={settings.relatedTitle || "Related Presentation Playbooks"}
          subtitle={settings.relatedSubtitle}
        />

        {/* Bottom CTA Banner */}
        <div className="mt-20">
          <BlogCtaBanner />
        </div>

      </div>
    </div>
  );
}
