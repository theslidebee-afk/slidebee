import React from "react";
import { ImageIcon, UploadCloud, Trash2 } from "lucide-react";
import { normalizeR2Url } from "../../../../lib/r2";

interface TemplatePreviewsFieldProps {
  thumbnail: string;
  setThumbnail: (url: string) => void;
  isUploadingCover: boolean;
  onCoverImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  slides: string[];
  isUploadingSlide: boolean;
  onSlideImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMakeCover?: (index: number) => void;
  onRemoveSlide: (index: number) => void;
}

export const TemplatePreviewsField: React.FC<TemplatePreviewsFieldProps> = ({
  thumbnail,
  setThumbnail,
  isUploadingCover,
  onCoverImageUpload,
  slides,
  isUploadingSlide,
  onSlideImageUpload,
  onMakeCover,
  onRemoveSlide
}) => {
  return (
    <div className="bg-white border border-[#111111]/10 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary text-[#111111] flex items-center justify-center font-bold">
            <ImageIcon size={14} />
          </div>
          <div>
            <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">
              2. Template Previews & Slide Deck Gallery
            </h4>
            <p className="text-[10px] text-[#726F6D]">
              Upload cover image and interior slides directly to Cloudflare R2
            </p>
          </div>
        </div>
        {slides.length > 0 && (
          <span className="rounded-lg bg-primary/20 text-[#111111] font-black text-[10px] px-2.5 py-0.5">
            {slides.length} Slide Previews
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cover Image */}
        <div className="bg-[#FFF9E8] p-3 rounded-lg border border-[#111111]/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-extrabold text-[#111111] block">
                Primary Cover / Thumbnail Image *
              </label>
              <span className="text-[10px] text-[#726F6D]">
                Main display card across marketplace.
              </span>
            </div>
            <label
              className={`rounded-lg bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isUploadingCover ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <UploadCloud size={13} className="text-primary-amber" />
              <span>{isUploadingCover ? "Uploading..." : "Upload Cover"}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploadingCover}
                onChange={onCoverImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-[#726F6D] shrink-0">Or R2 URL:</span>
            <input
              type="url"
              placeholder="https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value.trim())}
              className="flex-1 bg-white border border-[#111111]/15 rounded px-2.5 py-1 text-[11px] font-mono text-[#111111]"
            />
          </div>

          {thumbnail ? (
            <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-[#111111]/8">
              <div className="w-20 h-14 bg-[#111111] rounded overflow-hidden shrink-0 border border-primary/30">
                <img
                  src={normalizeR2Url(thumbnail)}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-[#726F6D] space-y-0.5 flex-1 min-w-0">
                <span className="font-extrabold text-[#111111] block text-[11px]">Cover Image Selected</span>
                <span className="text-[10px] block truncate font-mono">{thumbnail}</span>
              </div>
              <button
                type="button"
                onClick={() => setThumbnail("")}
                className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-1 cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-[#111111]/15 rounded-lg text-center bg-white/60">
              <p className="text-[11px] text-[#726F6D]">No cover selected. Click "Upload Cover" or paste R2 URL.</p>
            </div>
          )}
        </div>

        {/* Interior Slides Gallery */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
              <ImageIcon size={13} className="text-primary-amber" /> Interior Slides ({slides.length})
            </span>
            <label className={`rounded-lg bg-primary hover:bg-primary-dark text-[#111111] font-black px-3 py-1.5 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${isUploadingSlide ? "opacity-60 cursor-not-allowed" : ""}`}>
              <UploadCloud size={13} />
              <span>{isUploadingSlide ? "Uploading..." : "Upload Slides"}</span>
              <input
                type="file"
                multiple
                disabled={isUploadingSlide}
                accept="image/*"
                onChange={onSlideImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {slides.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1.5 border border-[#111111]/10 rounded-lg bg-[#FFF9E8]/50">
              {slides.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#111111]/10 rounded p-1 text-left shadow-sm relative group"
                >
                  <div className="aspect-[16/10] bg-[#111111] rounded overflow-hidden mb-1">
                    <img src={normalizeR2Url(s)} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[8px] font-black text-[#111111]">
                      {idx === 0 ? "Cover" : `#${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-1">
                      {idx > 0 && onMakeCover && (
                        <button
                          type="button"
                          onClick={() => onMakeCover(idx)}
                          className="text-[8px] text-primary-amber font-extrabold hover:underline cursor-pointer"
                          title="Make Cover"
                        >
                          Top
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveSlide(idx)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 border-2 border-dashed border-[#111111]/15 rounded-lg text-center bg-[#FFF9E8]/30">
              <p className="text-[11px] text-[#726F6D]">No interior slides uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
