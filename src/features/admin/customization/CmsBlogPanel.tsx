import React, { useState } from "react";
import { Save, Plus, UploadCloud, Trash2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { uploadToR2 } from "../../../lib/r2";

const DEFAULT_BLOGS = [
  {
    id: "1",
    title: "The 3-Second Rule: Why Most C-Suite Slides Fail to Persuade",
    content: "When presenting to senior executive stakeholders, dense walls of bullet points force the audience to read instead of listen. Here is how Ex-McKinsey consultants structure high-impact focal points.",
    imageUrl: "/portfolio/case_study_a_14.png",
    date: "September 2026",
    category: "Strategy"
  },
  {
    id: "2",
    title: "How to Design a Series A Pitch Deck That Secures Partner Meetings",
    content: "Venture capitalists look at hundreds of decks per week. Learn the 12 essential slides, TAM/SAM/SOM market sizing visualization, and unit economics framing that get rounds closed.",
    imageUrl: "/portfolio/global_brands_1.png",
    date: "August 2026",
    category: "Fundraising"
  },
  {
    id: "3",
    title: "Building an Enterprise Master Template System That Teams Actually Use",
    content: "Why do corporate slide templates break within weeks? Discover the layout locking techniques and modular drag-and-drop systems that keep 500+ employee organizations visually aligned.",
    imageUrl: "/portfolio/levis_yuengling_6.png",
    date: "August 2026",
    category: "Branding"
  }
];

export const CmsBlogPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving } = useAdmin();
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const blogs = Array.isArray(siteConfigs["blog_cms"]) ? siteConfigs["blog_cms"] : DEFAULT_BLOGS;

  const handleUploadCover = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await uploadToR2(file, { folder: "blog" });
      if (res.success && res.publicUrl) {
        const updated = [...blogs];
        updated[idx] = { ...updated[idx], imageUrl: res.publicUrl };
        setSiteConfigs({ ...siteConfigs, blog_cms: updated });
      }
    } catch (err) {
      console.warn("Blog image upload failed:", err);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            Blog & Presentation Playbook CMS (/blog)
          </h3>
          <p className="text-xs text-[#726F6D]">
            Publish, edit, or manage insights, strategy articles, and executive guides
          </p>
        </div>
        <button
          onClick={() => handleSaveConfig("blog_cms", blogs)}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save size={14} /> {configSaving ? "Saving..." : "Save Blog Posts"}
        </button>
      </div>

      <div className="space-y-4">
        {blogs.map((b: any, idx: number) => (
          <div key={b.id || idx} className="bg-[#FFF9E8] p-5 rounded-xl border border-[#111111]/10 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-primary-amber uppercase tracking-wider">
                Article #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  const updated = blogs.filter((_: any, i: number) => i !== idx);
                  setSiteConfigs({ ...siteConfigs, blog_cms: updated });
                }}
                className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-[#111111] block mb-1">Article Title</label>
                <input
                  type="text"
                  value={b.title || ""}
                  onChange={(e) => {
                    const updated = [...blogs];
                    updated[idx] = { ...updated[idx], title: e.target.value };
                    setSiteConfigs({ ...siteConfigs, blog_cms: updated });
                  }}
                  className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">Category (e.g. Strategy, Fundraising)</label>
                <input
                  type="text"
                  value={b.category || ""}
                  onChange={(e) => {
                    const updated = [...blogs];
                    updated[idx] = { ...updated[idx], category: e.target.value };
                    setSiteConfigs({ ...siteConfigs, blog_cms: updated });
                  }}
                  className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">Publication Date</label>
                <input
                  type="text"
                  value={b.date || ""}
                  placeholder="September 2026"
                  onChange={(e) => {
                    const updated = [...blogs];
                    updated[idx] = { ...updated[idx], date: e.target.value };
                    setSiteConfigs({ ...siteConfigs, blog_cms: updated });
                  }}
                  className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-[#111111] block mb-1">Cover Image (R2 / WebP)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={b.imageUrl || ""}
                    placeholder="https://... or /portfolio/..."
                    onChange={(e) => {
                      const updated = [...blogs];
                      updated[idx] = { ...updated[idx], imageUrl: e.target.value };
                      setSiteConfigs({ ...siteConfigs, blog_cms: updated });
                    }}
                    className="flex-1 bg-white border border-[#111111]/12 rounded px-2.5 py-1.5 text-xs"
                  />
                  <label className="cursor-pointer hex-pill bg-white border border-primary/40 px-3 py-1.5 text-[11px] font-bold text-[#111111] hover:bg-black/5 flex items-center gap-1 shrink-0">
                    <UploadCloud size={13} className="text-primary-amber" />
                    <span>{uploadingIdx === idx ? "Uploading..." : "Upload R2"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingIdx === idx}
                      className="hidden"
                      onChange={(e) => handleUploadCover(idx, e)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#111111] block mb-1">Article Excerpt / Content</label>
              <textarea
                rows={3}
                value={b.content || ""}
                onChange={(e) => {
                  const updated = [...blogs];
                  updated[idx] = { ...updated[idx], content: e.target.value };
                  setSiteConfigs({ ...siteConfigs, blog_cms: updated });
                }}
                className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1.5 text-xs leading-relaxed"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            const newArticle = {
              id: String(Date.now()),
              title: "New Executive Presentation Guide",
              content: "Enter the summary or key takeaways of the article here for executive readers.",
              imageUrl: "/portfolio/case_study_a_1.png",
              date: "September 2026",
              category: "Strategy"
            };
            setSiteConfigs({ ...siteConfigs, blog_cms: [...blogs, newArticle] });
          }}
          className="hex-pill w-full bg-[#FFF9E8] hover:bg-black/5 text-[#111111] border border-[#111111]/15 py-3 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={14} /> Add New Article (/blog)
        </button>
      </div>
    </div>
  );
};
