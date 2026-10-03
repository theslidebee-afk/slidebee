import React from "react";
import { Save, UploadCloud } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { DEFAULT_TESTIMONIALS } from "../shared/adminConstants";
import { uploadToR2 } from "../../../lib/r2";

export const CmsTestimonialsPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving } = useAdmin();
  const [uploadingIdx, setUploadingIdx] = React.useState<number | null>(null);

  const testimonials = siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS;

  const handleUploadAvatar = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await uploadToR2(file, { folder: "avatars" });
      if (res.success && res.publicUrl) {
        const current = [...testimonials];
        current[idx] = { ...current[idx], avatar: res.publicUrl };
        setSiteConfigs({ ...siteConfigs, testimonials: current });
      }
    } catch (err) {
      console.warn("Avatar upload failed:", err);
    } finally {
      setUploadingIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            Client Testimonials & Social Proof Customizer
          </h3>
          <p className="text-xs text-[#726F6D]">
            Add, edit, or remove executive reviews, star ratings, quotes, names, roles, and avatar photos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSiteConfigs({
                ...siteConfigs,
                testimonials: [
                  ...testimonials,
                  {
                    name: "New Client",
                    role: "VP of Product, Apex",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                    rating: 5,
                    quote: "Outstanding visual quality and fast turnaround time on our board slides."
                  }
                ]
              });
            }}
            className="text-xs font-bold text-primary-amber hover:underline px-3 py-1.5 bg-[#FFF9E8] rounded-lg border border-primary/30 cursor-pointer"
          >
            + Add New Testimonial
          </button>
          <button
            type="button"
            onClick={() => handleSaveConfig("testimonials", testimonials)}
            disabled={configSaving}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2 text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Save size={14} /> {configSaving ? "Saving..." : "Save Testimonials"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t: any, idx: number) => (
          <div key={idx} className="bg-[#FFF9E8] p-4 rounded-2xl border border-[#111111]/10 space-y-3 relative">
            <div className="flex items-center justify-between border-b border-[#111111]/8 pb-2">
              <span className="text-xs font-black uppercase text-primary-amber">
                Review #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  const current = [...testimonials];
                  current.splice(idx, 1);
                  setSiteConfigs({
                    ...siteConfigs,
                    testimonials: current
                  });
                }}
                className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer"
              >
                Delete
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={t.name ?? ""}
                  onChange={(e) => {
                    const current = [...testimonials];
                    current[idx] = { ...current[idx], name: e.target.value };
                    setSiteConfigs({ ...siteConfigs, testimonials: current });
                  }}
                  className="w-full bg-white border border-[#111111]/12 hex-pill px-2.5 py-1 text-xs font-bold text-[#111111]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#111111] block mb-1">
                  Star Rating (1-5)
                </label>
                <select
                  value={t.rating || 5}
                  onChange={(e) => {
                    const current = [...testimonials];
                    current[idx] = { ...current[idx], rating: Number(e.target.value) };
                    setSiteConfigs({ ...siteConfigs, testimonials: current });
                  }}
                  className="w-full bg-white border border-[#111111]/12 hex-pill px-2.5 py-1 text-xs font-bold text-[#111111]"
                >
                  <option value={5}>5 Stars (Exceptional)</option>
                  <option value={4}>4 Stars (Very Good)</option>
                  <option value={3}>3 Stars (Good)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#111111] block mb-1">
                Role / Title & Company
              </label>
              <input
                type="text"
                value={t.role ?? ""}
                onChange={(e) => {
                  const current = [...testimonials];
                  current[idx] = { ...current[idx], role: e.target.value };
                  setSiteConfigs({ ...siteConfigs, testimonials: current });
                }}
                className="w-full bg-white border border-[#111111]/12 hex-pill px-2.5 py-1 text-xs font-medium text-[#111111]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-[#111111]">
                  Avatar Photo
                </label>
                <label className="cursor-pointer text-[9px] font-bold text-primary-amber bg-white hover:bg-amber-50 border border-primary/30 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                  <UploadCloud size={11} /> {uploadingIdx === idx ? "Uploading..." : "Upload to R2"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingIdx === idx}
                    className="hidden"
                    onChange={(e) => handleUploadAvatar(idx, e)}
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <img 
                  src={t.avatar} 
                  alt="Avatar" 
                  className="w-7 h-7 rounded-full object-cover border border-[#111111]/20 flex-shrink-0" 
                />
                <input
                  type="text"
                  value={t.avatar ?? ""}
                  onChange={(e) => {
                    const current = [...testimonials];
                    current[idx] = { ...current[idx], avatar: e.target.value };
                    setSiteConfigs({ ...siteConfigs, testimonials: current });
                  }}
                  placeholder="Image URL or upload"
                  className="w-full bg-white border border-[#111111]/12 rounded px-2 py-1 text-[10px] font-mono text-[#111111]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                Quote / Client Feedback
              </label>
              <textarea
                rows={2}
                value={t.quote ?? ""}
                onChange={(e) => {
                  const current = [...testimonials];
                  current[idx] = { ...current[idx], quote: e.target.value };
                  setSiteConfigs({ ...siteConfigs, testimonials: current });
                }}
                className="w-full bg-white border border-[#111111]/12 rounded p-2 text-xs font-medium text-[#111111]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
