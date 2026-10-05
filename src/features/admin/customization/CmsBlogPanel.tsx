import React, { useState } from "react";
import {
  Save,
  Plus,
  UploadCloud,
  Trash2,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Eye,
  Edit3,
  Copy,
  Sparkles,
  User,
  Image as ImageIcon
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { uploadToR2 } from "../../../lib/r2";
import {
  allDefaultBlogArticles,
  DEFAULT_BLOG_SETTINGS,
  BlogArticleBody,
  type BlogArticle,
  type BlogGlobalSettings
} from "../../blog";
import { RouteUrlSelector } from "../shared/RouteUrlSelector";

export const CmsBlogPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving } = useAdmin();
  const [activeTab, setActiveTab] = useState<"articles" | "settings">("articles");
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [previewModeId, setPreviewModeId] = useState<string | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Parse state from siteConfigs["blog_cms"]
  const getInitialState = (): { articles: BlogArticle[]; settings: BlogGlobalSettings } => {
    const raw = siteConfigs["blog_cms"];
    let articles: BlogArticle[] = allDefaultBlogArticles;
    let settings: BlogGlobalSettings = DEFAULT_BLOG_SETTINGS;

    if (raw) {
      if (Array.isArray(raw)) {
        // Legacy array of articles
        const cmsIds = new Set(raw.map((a: any) => String(a.id)));
        const missing = allDefaultBlogArticles.filter((d) => !cmsIds.has(String(d.id)));
        articles = [...raw, ...missing];
      } else if (typeof raw === "object" && raw.articles) {
        // Modern schema
        const cmsArticles = Array.isArray(raw.articles) ? raw.articles : [];
        const cmsIds = new Set(cmsArticles.map((a: any) => String(a.id)));
        const missing = allDefaultBlogArticles.filter((d) => !cmsIds.has(String(d.id)));
        articles = [...cmsArticles, ...missing];
        if (raw.settings) {
          settings = { ...DEFAULT_BLOG_SETTINGS, ...raw.settings };
        }
      }
    }

    return { articles, settings };
  };

  const { articles, settings } = getInitialState();

  const updateArticles = (newArticles: BlogArticle[]) => {
    setSiteConfigs({
      ...siteConfigs,
      blog_cms: {
        articles: newArticles,
        settings,
      },
    });
  };

  const updateSettings = (newSettings: BlogGlobalSettings) => {
    setSiteConfigs({
      ...siteConfigs,
      blog_cms: {
        articles,
        settings: newSettings,
      },
    });
  };

  const handleSaveAll = async () => {
    const payload = {
      articles,
      settings,
    };
    await handleSaveConfig("blog_cms", payload);
  };

  // Upload cover image
  const handleUploadCover = async (articleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(`cover-${articleId}`);
    try {
      const res = await uploadToR2(file, { folder: "blog" });
      if (res.success && res.publicUrl) {
        const updated = articles.map((a) =>
          String(a.id) === String(articleId) ? { ...a, imageUrl: res.publicUrl } : a
        );
        updateArticles(updated);
      }
    } catch (err) {
      console.warn("Cover image upload failed:", err);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  // Upload author avatar
  const handleUploadAvatar = async (articleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(`avatar-${articleId}`);
    try {
      const res = await uploadToR2(file, { folder: "avatars" });
      if (res.success && res.publicUrl) {
        const updated = articles.map((a) =>
          String(a.id) === String(articleId)
            ? { ...a, author: { ...a.author, avatar: res.publicUrl, name: a.author?.name || "SlideBee Editorial", role: a.author?.role || "Author" } }
            : a
        );
        updateArticles(updated);
      }
    } catch (err) {
      console.warn("Avatar upload failed:", err);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(a.id).includes(searchQuery)
  );

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#111111]">
              Blog & Presentation Playbook CMS Studio (/blog)
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider bg-primary/20 text-[#111111] px-2.5 py-0.5 rounded-full">
              Zero Hardcoding
            </span>
          </div>
          <p className="text-xs text-[#726F6D]">
            Manage full markdown articles, subtitles, authors, sticky promotional cards, table of contents, and related playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Reset all 13 articles and settings to SlideBee Master Library? This loads full markdown content, authors, and promotional configurations."
                )
              ) {
                const fresh = {
                  articles: allDefaultBlogArticles,
                  settings: DEFAULT_BLOG_SETTINGS,
                };
                setSiteConfigs({ ...siteConfigs, blog_cms: fresh });
                handleSaveConfig("blog_cms", fresh);
              }
            }}
            disabled={configSaving}
            className="hex-pill bg-white border border-[#111111]/15 hover:bg-black/5 text-[#111111] font-bold px-3 py-2 text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Reset to 13 Master Articles"
          >
            <RotateCcw size={13} /> Reset to Defaults
          </button>

          <button
            onClick={handleSaveAll}
            disabled={configSaving}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Save size={14} /> {configSaving ? "Saving..." : "Save Blog Posts & Settings"}
          </button>
        </div>
      </div>

      {/* Main Tabs: Articles Manager vs Global Blog Settings */}
      <div className="flex items-center gap-2 border-b border-[#111111]/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("articles")}
          className={`hex-pill px-4 py-2 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "articles"
              ? "bg-[#111111] text-[#FCBF14] shadow-sm"
              : "bg-white text-[#726F6D] hover:text-[#111111] border border-[#111111]/10"
          }`}
        >
          <FileText size={14} />
          <span>Articles Manager ({articles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`hex-pill px-4 py-2 text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "settings"
              ? "bg-[#111111] text-[#FCBF14] shadow-sm"
              : "bg-white text-[#726F6D] hover:text-[#111111] border border-[#111111]/10"
          }`}
        >
          <Sliders size={14} />
          <span>Global Blog & Sticky Settings</span>
        </button>
      </div>

      {/* TAB 1: ARTICLES MANAGER */}
      {activeTab === "articles" && (
        <div className="space-y-5">
          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search articles by title, category, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 bg-white border border-[#111111]/15 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-primary"
            />

            <button
              type="button"
              onClick={() => {
                const newId = String(Date.now());
                const newArt: BlogArticle = {
                  id: newId,
                  title: "New Executive Presentation Strategy Playbook",
                  subtitle: "Enter the supporting lead thesis explaining the core problem and executive action required.",
                  content: `### Executive Overview\nWrite the opening thesis here with **bold emphasis** and clear takeaways.\n\n### 1. Key Framework Component\n- First point of structural evidence\n- Second strategic metric or proof anchor\n\n### Conclusion & Next Action\nWrap up the executive guidance here with actionable next steps.`,
                  category: "Strategy",
                  date: "October 2026",
                  readTime: "6 min read",
                  imageUrl: "/portfolio/case_study_a_1.png",
                  author: {
                    name: "SlideBee Editorial Desk",
                    role: "Senior Presentation Strategists & Art Directors",
                    avatar: "/slidebee_logo_light.png"
                  },
                  isPublished: true,
                  keywords: ["presentation design", "executive slides"],
                  metaDescription: "Executive presentation playbook tailored for boardroom decision-makers."
                };
                updateArticles([...articles, newArt]);
                setExpandedArticleId(newId);
              }}
              className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <Plus size={14} /> Add New Article
            </button>
          </div>

          {/* Articles List / Accordions */}
          <div className="space-y-4">
            {filteredArticles.map((art) => {
              const isExpanded = expandedArticleId === String(art.id);
              const isPreview = previewModeId === String(art.id);
              const realIndex = articles.findIndex((a) => String(a.id) === String(art.id));

              return (
                <div
                  key={art.id}
                  className="bg-[#FFF9E8] rounded-2xl border border-[#111111]/12 overflow-hidden transition-all shadow-2xs"
                >
                  {/* Article Card Top Row / Summary */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-black text-primary-amber bg-white px-2.5 py-1 rounded-full border border-primary/30 shrink-0">
                        #{realIndex + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#111111] text-[#FCBF14] px-2 py-0.5 rounded-full">
                            {art.category || "General"}
                          </span>
                          <span className="text-[11px] text-[#726F6D] font-bold">
                            {art.date}
                          </span>
                        </div>
                        <h4 className="text-sm font-heading font-extrabold text-[#111111] truncate">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <a
                        href={`/blog/${art.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hex-pill-sm bg-white border border-[#111111]/15 hover:bg-black/5 text-[#111111] font-bold px-2.5 py-1.5 text-[11px] flex items-center gap-1"
                        title="View Live on Frontend"
                      >
                        <ExternalLink size={12} /> Live Site
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const dup: BlogArticle = {
                            ...art,
                            id: String(Date.now()),
                            title: `${art.title} (Copy)`,
                          };
                          updateArticles([...articles, dup]);
                        }}
                        className="hex-pill-sm bg-white border border-[#111111]/15 hover:bg-black/5 text-[#111111] font-bold px-2.5 py-1.5 text-[11px] flex items-center gap-1 cursor-pointer"
                        title="Duplicate Article"
                      >
                        <Copy size={12} /> Duplicate
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete article "${art.title}"?`)) {
                            const updated = articles.filter((a) => String(a.id) !== String(art.id));
                            updateArticles(updated);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-1.5 text-xs font-bold flex items-center cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedArticleId(isExpanded ? null : String(art.id))}
                        className={`hex-pill px-3 py-1.5 text-xs font-extrabold flex items-center gap-1 cursor-pointer ${
                          isExpanded
                            ? "bg-[#111111] text-[#FCBF14]"
                            : "bg-primary hover:bg-primary-dark text-[#111111]"
                        }`}
                      >
                        <span>{isExpanded ? "Close" : "Edit Article"}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Full Editor */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-[#111111]/10 space-y-6 bg-[#FFFDF5]">
                      
                      {/* Section 1: Article Headline & Subtitle */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-amber">
                          <Edit3 size={13} />
                          <span>1. Title & Header Subtitle</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Article Title (Headline)
                            </label>
                            <input
                              type="text"
                              value={art.title || ""}
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], title: e.target.value };
                                updateArticles(updated);
                              }}
                              className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:border-primary outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Category (e.g. Pitch Decks, Business, Strategy)
                            </label>
                            <input
                              type="text"
                              value={art.category || ""}
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], category: e.target.value };
                                updateArticles(updated);
                              }}
                              className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:border-primary outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">
                            Article Subtitle (Lead paragraph shown under the headline on the blog page)
                          </label>
                          <textarea
                            rows={2}
                            value={art.subtitle || art.metaDescription || ""}
                            placeholder="Enter the supporting lead thesis explaining the core problem and executive action required."
                            onChange={(e) => {
                              const updated = [...articles];
                              updated[realIndex] = {
                                ...updated[realIndex],
                                subtitle: e.target.value,
                                metaDescription: e.target.value,
                              };
                              updateArticles(updated);
                            }}
                            className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs leading-relaxed font-medium text-[#111111] focus:border-primary outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Publication Date
                            </label>
                            <input
                              type="text"
                              value={art.date || ""}
                              placeholder="October 2026"
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], date: e.target.value };
                                updateArticles(updated);
                              }}
                              className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-medium text-[#111111] focus:border-primary outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Read Time
                            </label>
                            <input
                              type="text"
                              value={art.readTime || ""}
                              placeholder="6 min read"
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], readTime: e.target.value };
                                updateArticles(updated);
                              }}
                              className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-medium text-[#111111] focus:border-primary outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Author Profile (Avatar, Name, Role) */}
                      <div className="space-y-3 pt-3 border-t border-[#111111]/10">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-amber">
                          <User size={13} />
                          <span>2. Author Profile</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Author Name
                            </label>
                            <input
                              type="text"
                              value={art.author?.name || ""}
                              placeholder="Vishal Suresh"
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[realIndex] = {
                                  ...updated[realIndex],
                                  author: {
                                    ...updated[realIndex].author,
                                    name: e.target.value,
                                    role: updated[realIndex].author?.role || "Senior Presentation Strategist",
                                    avatar: updated[realIndex].author?.avatar || "/slidebee_logo_light.png"
                                  }
                                };
                                updateArticles(updated);
                              }}
                              className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:border-primary outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Author Role / Title
                            </label>
                            <input
                              type="text"
                              value={art.author?.role || ""}
                              placeholder="Founder & Lead Architect"
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[realIndex] = {
                                  ...updated[realIndex],
                                  author: {
                                    ...updated[realIndex].author,
                                    role: e.target.value,
                                    name: updated[realIndex].author?.name || "SlideBee Editorial Desk",
                                    avatar: updated[realIndex].author?.avatar || "/slidebee_logo_light.png"
                                  }
                                };
                                updateArticles(updated);
                              }}
                              className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-medium text-[#111111] focus:border-primary outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Author Avatar (R2 / URL)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={art.author?.avatar || ""}
                                placeholder="/slidebee_logo_light.png"
                                onChange={(e) => {
                                  const updated = [...articles];
                                  updated[realIndex] = {
                                    ...updated[realIndex],
                                    author: {
                                      ...updated[realIndex].author,
                                      avatar: e.target.value,
                                      name: updated[realIndex].author?.name || "SlideBee Editorial Desk",
                                      role: updated[realIndex].author?.role || "Author"
                                    }
                                  };
                                  updateArticles(updated);
                                }}
                                className="flex-1 bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-medium text-[#111111] focus:border-primary outline-none"
                              />
                              <label className="cursor-pointer hex-pill bg-white border border-primary/40 px-3 py-2 text-[11px] font-bold text-[#111111] hover:bg-black/5 flex items-center gap-1 shrink-0">
                                <UploadCloud size={13} className="text-primary-amber" />
                                <span>{uploadingIdx === `avatar-${art.id}` ? "Uploading..." : "Upload"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingIdx === `avatar-${art.id}`}
                                  className="hidden"
                                  onChange={(e) => handleUploadAvatar(String(art.id), e)}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Cover Image (Full Width) */}
                      <div className="space-y-3 pt-3 border-t border-[#111111]/10">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-amber">
                          <ImageIcon size={13} />
                          <span>3. Blog Cover Image (Full Grid Width)</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={art.imageUrl || ""}
                            placeholder="https://... or /portfolio/..."
                            onChange={(e) => {
                              const updated = [...articles];
                              updated[realIndex] = { ...updated[realIndex], imageUrl: e.target.value };
                              updateArticles(updated);
                            }}
                            className="flex-1 bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-medium text-[#111111] focus:border-primary outline-none"
                          />
                          <label className="cursor-pointer hex-pill bg-white border border-primary/40 px-3 py-2 text-[11px] font-bold text-[#111111] hover:bg-black/5 flex items-center gap-1 shrink-0">
                            <UploadCloud size={13} className="text-primary-amber" />
                            <span>{uploadingIdx === `cover-${art.id}` ? "Uploading..." : "Upload to R2"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingIdx === `cover-${art.id}`}
                              className="hidden"
                              onChange={(e) => handleUploadCover(String(art.id), e)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Section 4: Full Article Markdown Body Editor with Live Preview */}
                      <div className="space-y-3 pt-3 border-t border-[#111111]/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-amber">
                            <FileText size={13} />
                            <span>4. Full Article Markdown Content (Body)</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewModeId(isPreview ? null : String(art.id))}
                              className={`hex-pill-sm px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                isPreview
                                  ? "bg-primary text-[#111111]"
                                  : "bg-white text-[#726F6D] border border-[#111111]/15 hover:text-[#111111]"
                              }`}
                            >
                              <Eye size={12} /> {isPreview ? "Back to Markdown Editor" : "Live Rendered Preview"}
                            </button>
                          </div>
                        </div>

                        {/* Formatting Toolbar */}
                        {!isPreview && (
                          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-xl border border-[#111111]/10 text-[11px] font-bold text-[#726F6D]">
                            <span className="text-[10px] text-gray-400 mr-1 uppercase">Quick Inserts:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = art.content || "";
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], content: current + "\n\n### New Section Header\n" };
                                updateArticles(updated);
                              }}
                              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[#111111] cursor-pointer"
                            >
                              ### Heading
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = art.content || "";
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], content: current + " **bold key takeaway** " };
                                updateArticles(updated);
                              }}
                              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[#111111] cursor-pointer"
                            >
                              **Bold**
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = art.content || "";
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], content: current + "\n- Bullet item here\n" };
                                updateArticles(updated);
                              }}
                              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[#111111] cursor-pointer"
                            >
                              - Bullet List
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = art.content || "";
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], content: current + "\n1. Numbered item here\n" };
                                updateArticles(updated);
                              }}
                              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[#111111] cursor-pointer"
                            >
                              1. Numbered List
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = art.content || "";
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], content: current + " [Link Title](/ordernow) " };
                                updateArticles(updated);
                              }}
                              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[#111111] cursor-pointer"
                            >
                              [Link Title](/url)
                            </button>
                          </div>
                        )}

                        {isPreview ? (
                          <div className="bg-white p-6 rounded-2xl border border-[#111111]/15 shadow-inner max-h-[480px] overflow-y-auto">
                            <BlogArticleBody content={art.content} />
                          </div>
                        ) : (
                          <div>
                            <textarea
                              rows={14}
                              value={art.content || ""}
                              onChange={(e) => {
                                const updated = [...articles];
                                updated[realIndex] = { ...updated[realIndex], content: e.target.value };
                                updateArticles(updated);
                              }}
                              className="w-full bg-white border border-[#111111]/15 rounded-2xl p-4 text-xs font-mono leading-relaxed text-[#111111] focus:border-primary outline-none shadow-xs"
                              placeholder="Write the full article markdown here..."
                            />
                            <div className="flex items-center justify-between text-[11px] text-[#726F6D] mt-1 px-1">
                              <span>Markdown supported: ### Headings, **Bold**, *Italic*, - Lists, [Links](/path)</span>
                              <span>{art.content ? art.content.split(/\s+/).filter(Boolean).length : 0} words</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 5: Sticky Promotional Card (Per-Article Customization) */}
                      <div className="space-y-3 pt-3 border-t border-[#111111]/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary-amber">
                            <Sparkles size={13} />
                            <span>5. Sticky Corner Promotional Card (Optional Override)</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...articles];
                              if (updated[realIndex].customPromo) {
                                updated[realIndex] = { ...updated[realIndex], customPromo: undefined };
                              } else {
                                updated[realIndex] = {
                                  ...updated[realIndex],
                                  customPromo: { ...settings.defaultPromo },
                                };
                              }
                              updateArticles(updated);
                            }}
                            className={`hex-pill-sm px-3 py-1 text-xs font-bold cursor-pointer ${
                              art.customPromo
                                ? "bg-primary text-[#111111]"
                                : "bg-white text-[#726F6D] border border-[#111111]/15"
                            }`}
                          >
                            {art.customPromo ? "Customizing This Card" : "Using Global Default"}
                          </button>
                        </div>

                        {art.customPromo && (
                          <div className="bg-white p-4 rounded-xl border border-[#111111]/12 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                                  Promo Badge
                                </label>
                                <input
                                  type="text"
                                  value={art.customPromo.badge || ""}
                                  placeholder="Special Offer"
                                  onChange={(e) => {
                                    const updated = [...articles];
                                    updated[realIndex] = {
                                      ...updated[realIndex],
                                      customPromo: { ...updated[realIndex].customPromo!, badge: e.target.value },
                                    };
                                    updateArticles(updated);
                                  }}
                                  className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                                  Promo Headline
                                </label>
                                <input
                                  type="text"
                                  value={art.customPromo.title || ""}
                                  placeholder="Launch Your Store for ₹25,000"
                                  onChange={(e) => {
                                    const updated = [...articles];
                                    updated[realIndex] = {
                                      ...updated[realIndex],
                                      customPromo: { ...updated[realIndex].customPromo!, title: e.target.value },
                                    };
                                    updateArticles(updated);
                                  }}
                                  className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-[#111111] block mb-1">
                                Promo Description Text
                              </label>
                              <input
                                type="text"
                                value={art.customPromo.description || ""}
                                placeholder="500 products, Razorpay checkout, and Cloudflare hosting."
                                onChange={(e) => {
                                  const updated = [...articles];
                                  updated[realIndex] = {
                                    ...updated[realIndex],
                                    customPromo: { ...updated[realIndex].customPromo!, description: e.target.value },
                                  };
                                  updateArticles(updated);
                                }}
                                className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-medium text-[#111111]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                                  Button Label
                                </label>
                                <input
                                  type="text"
                                  value={art.customPromo.buttonText || ""}
                                  placeholder="Order Now"
                                  onChange={(e) => {
                                    const updated = [...articles];
                                    updated[realIndex] = {
                                      ...updated[realIndex],
                                      customPromo: { ...updated[realIndex].customPromo!, buttonText: e.target.value },
                                    };
                                    updateArticles(updated);
                                  }}
                                  className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                                />
                              </div>

                              <div>
                                <RouteUrlSelector
                                  label="Button Destination URL"
                                  value={art.customPromo.buttonUrl || ""}
                                  placeholder="/ordernow?service=ecommerce"
                                  onChange={(url) => {
                                    const updated = [...articles];
                                    updated[realIndex] = {
                                      ...updated[realIndex],
                                      customPromo: { ...updated[realIndex].customPromo!, buttonUrl: url },
                                    };
                                    updateArticles(updated);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL BLOG & STICKY SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          
          {/* 1. Related Blogs Section Settings */}
          <div className="bg-[#FFF9E8] p-5 sm:p-6 rounded-2xl border border-[#111111]/12 space-y-4">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-primary-amber">
              1. Related Presentation Playbooks (Bottom Section)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={settings.relatedTitle || ""}
                  placeholder="Related Presentation Playbooks"
                  onChange={(e) => updateSettings({ ...settings, relatedTitle: e.target.value })}
                  className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#111111]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                  Section Subtitle / Description
                </label>
                <input
                  type="text"
                  value={settings.relatedSubtitle || ""}
                  placeholder="Explore more insights and executive guides."
                  onChange={(e) => updateSettings({ ...settings, relatedSubtitle: e.target.value })}
                  className="w-full bg-white border border-[#111111]/15 rounded-xl px-3 py-2 text-xs font-medium text-[#111111]"
                />
              </div>
            </div>
          </div>

          {/* 2. Table of Contents & Social Share Bar Settings */}
          <div className="bg-[#FFF9E8] p-5 sm:p-6 rounded-2xl border border-[#111111]/12 space-y-4">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-primary-amber">
              2. Sticky Corner Navigation & Social Sharing
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#111111]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111111]">
                    Table of Contents Block
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#726F6D]">
                    <input
                      type="checkbox"
                      checked={settings.showToc}
                      onChange={(e) => updateSettings({ ...settings, showToc: e.target.checked })}
                      className="rounded"
                    />
                    <span>Visible</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.tocTitle || ""}
                  placeholder="Table of Contents"
                  onChange={(e) => updateSettings({ ...settings, tocTitle: e.target.value })}
                  className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                />
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#111111]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111111]">
                    Social Share Bar Block
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#726F6D]">
                    <input
                      type="checkbox"
                      checked={settings.showShare}
                      onChange={(e) => updateSettings({ ...settings, showShare: e.target.checked })}
                      className="rounded"
                    />
                    <span>Visible</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.shareTitle || ""}
                  placeholder="Share Blog"
                  onChange={(e) => updateSettings({ ...settings, shareTitle: e.target.value })}
                  className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                />
              </div>
            </div>
          </div>

          {/* 3. Global Default Promotional Card */}
          <div className="bg-[#FFF9E8] p-5 sm:p-6 rounded-2xl border border-[#111111]/12 space-y-4">
            <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-primary-amber">
              3. Global Default Sticky Promotional Card
            </h4>
            <p className="text-xs text-[#726F6D]">
              Shown in the sticky right corner of articles that do not specify a custom promotional override.
            </p>

            <div className="bg-white p-4 rounded-xl border border-[#111111]/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#111111] block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={settings.defaultPromo?.badge || ""}
                    placeholder="Executive Design Studio"
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        defaultPromo: { ...settings.defaultPromo, badge: e.target.value },
                      })
                    }
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#111111] block mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={settings.defaultPromo?.title || ""}
                    placeholder="Need Bespoke Slides for Your Next Board Meeting?"
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        defaultPromo: { ...settings.defaultPromo, title: e.target.value },
                      })
                    }
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                  Description Text
                </label>
                <input
                  type="text"
                  value={settings.defaultPromo?.description || ""}
                  placeholder="Get investor-grade PowerPoint and Google Slides crafted with 24-hour turnaround."
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      defaultPromo: { ...settings.defaultPromo, description: e.target.value },
                    })
                  }
                  className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-medium text-[#111111]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#111111] block mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={settings.defaultPromo?.buttonText || ""}
                    placeholder="Order Custom Decks"
                    onChange={(e) =>
                      updateSettings({
                        ...settings,
                        defaultPromo: { ...settings.defaultPromo, buttonText: e.target.value },
                      })
                    }
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111]"
                  />
                </div>

                <div>
                  <RouteUrlSelector
                    label="Button Target Link"
                    value={settings.defaultPromo?.buttonUrl || ""}
                    placeholder="/ordernow"
                    onChange={(url) =>
                      updateSettings({
                        ...settings,
                        defaultPromo: { ...settings.defaultPromo, buttonUrl: url },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
