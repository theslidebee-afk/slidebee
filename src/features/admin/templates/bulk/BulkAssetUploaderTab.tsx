import React, { useState } from "react";
import { UploadCloud, RefreshCw, Copy, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { uploadToR2 } from "../../../../lib/r2";

interface BulkUploadedAsset {
  id: string;
  name: string;
  size: string;
  url: string;
  type: "ppt" | "image";
}

interface BulkAssetUploaderTabProps {
  bulkUploadedAssets: BulkUploadedAsset[];
  setBulkUploadedAssets: React.Dispatch<React.SetStateAction<BulkUploadedAsset[]>>;
  onGenerateCsvRow: () => void;
}

export const BulkAssetUploaderTab: React.FC<BulkAssetUploaderTabProps> = ({
  bulkUploadedAssets,
  setBulkUploadedAssets,
  onGenerateCsvRow
}) => {
  const [isUploadingBulkAssets, setIsUploadingBulkAssets] = useState(false);
  const [copiedAssetUrlsSuccess, setCopiedAssetUrlsSuccess] = useState(false);

  const handleUploadAssets = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingBulkAssets(true);
    const newAssets: BulkUploadedAsset[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isPpt = file.name.endsWith(".pptx") || file.name.endsWith(".ppt");
        const folder = isPpt ? "templates/decks" : "templates/slides";
        const sizeKB = (file.size / 1024).toFixed(1);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const displaySize = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

        const res = await uploadToR2(file, { folder, fileName: file.name });
        if (res.success && res.publicUrl) {
          newAssets.push({
            id: `asset-${Date.now()}-${i}`,
            name: file.name,
            size: displaySize,
            url: res.publicUrl,
            type: isPpt ? "ppt" : "image"
          });
        }
      }
      setBulkUploadedAssets((prev) => [...prev, ...newAssets]);
    } catch (err: any) {
      alert("Error uploading assets to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingBulkAssets(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleCopyAssetUrls = () => {
    if (bulkUploadedAssets.length === 0) return;
    const urlsText = bulkUploadedAssets.map((a) => a.url).join("\n");
    navigator.clipboard.writeText(urlsText);
    setCopiedAssetUrlsSuccess(true);
    setTimeout(() => setCopiedAssetUrlsSuccess(false), 2500);
  };

  const handleRemoveAsset = (id: string) => {
    setBulkUploadedAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAllAssets = () => {
    if (confirm("Remove all uploaded asset references from this session? (Files remain safely on Cloudflare R2)")) {
      setBulkUploadedAssets([]);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="bg-[#FFF9E8] border border-primary/40 rounded-xl p-4 text-xs text-[#111111] leading-relaxed">
        <strong className="text-primary-amber block mb-1">
          Two-Step Cloudflare R2 Ingest Pipeline:
        </strong>
        Upload your Master PowerPoint (.pptx) decks and full slide preview images (.jpg/.png) here first.
        We host them immediately on high-speed Cloudflare R2 CDN, letting you copy public CDN URLs directly into your spreadsheet columns.
      </div>

      <div className="border-2 border-dashed border-[#111111]/20 hover:border-primary rounded-2xl p-6 text-center bg-white transition-all">
        <input
          type="file"
          id="bulk-assets-input"
          multiple
          accept=".pptx,.ppt,.jpg,.jpeg,.png,.webp"
          onChange={handleUploadAssets}
          className="hidden"
          disabled={isUploadingBulkAssets}
        />
        <label
          htmlFor="bulk-assets-input"
          className="cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-[#FFF9E8] text-primary-amber flex items-center justify-center shadow-xs">
            {isUploadingBulkAssets ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>
          <span className="font-heading font-extrabold text-sm text-[#111111]">
            {isUploadingBulkAssets
              ? "Uploading assets to Cloudflare R2 CDN..."
              : "Click to Select or Drop Presentation Decks & Slide Previews"}
          </span>
          <span className="text-[11px] text-[#726F6D]">
            Select multiple .pptx presentation files or .jpg/.png slide previews at once.
          </span>
        </label>
      </div>

      {bulkUploadedAssets.length > 0 && (
        <div className="bg-white border border-[#111111]/12 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#111111]/8">
            <span className="text-xs font-bold text-[#111111]">
              Uploaded Cloudflare R2 CDN Deliverables ({bulkUploadedAssets.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAssetUrls}
                className="rounded-lg bg-[#FFF9E8] hover:bg-[#111111] hover:text-[#FCBF14] border border-[#111111]/15 px-3 py-1 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedAssetUrlsSuccess ? (
                  <CheckCircle2 size={13} className="text-green-600" />
                ) : (
                  <Copy size={13} />
                )}
                {copiedAssetUrlsSuccess ? "Copied All URLs" : "Copy All URLs"}
              </button>
              <button
                type="button"
                onClick={onGenerateCsvRow}
                className="rounded-lg bg-primary hover:bg-primary-dark text-[#111111] px-3 py-1 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={13} /> Generate Template Row
              </button>
              <button
                type="button"
                onClick={handleClearAllAssets}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Clear all uploaded references"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-[#111111]/6 text-xs">
            {bulkUploadedAssets.map((asset) => (
              <div key={asset.id} className="py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      asset.type === "ppt"
                        ? "bg-[#FCBF14] text-[#111111]"
                        : "bg-[#111111] text-white"
                    }`}
                  >
                    {asset.type}
                  </span>
                  <span className="font-semibold text-[#111111] truncate">{asset.name}</span>
                  <span className="text-[#726F6D] text-[10px]">({asset.size})</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(asset.url);
                      alert("Copied asset R2 URL:\n" + asset.url);
                    }}
                    className="text-primary-amber hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset(asset.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Remove asset"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
