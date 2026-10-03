import React from "react";
import { Sliders, Plus, Save, Trash2, UploadCloud } from "lucide-react";

interface CoreCapabilitiesManagerProps {
  currentServicesMap: Record<string, any>;
  onSaveServices: () => void;
  configSaving: boolean;
  onAddService: () => void;
  onRemoveService: (serviceKey: string) => void;
  onUpdateServiceField: (serviceKey: string, field: string, val: string) => void;
  onServiceImageUpload: (serviceKey: string, field: "beforeImg" | "afterImg", e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingFieldKey: string | null;
}

export const CoreCapabilitiesManager: React.FC<CoreCapabilitiesManagerProps> = ({
  currentServicesMap,
  onSaveServices,
  configSaving,
  onAddService,
  onRemoveService,
  onUpdateServiceField,
  onServiceImageUpload,
  uploadingFieldKey
}) => {
  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
            <Sliders size={16} className="text-primary-amber" />
            Core Capabilities & Interactive Before / After Showcases (/services)
          </h3>
          <p className="text-xs text-[#726F6D]">
            Configure service deliverables, turnaround badges, and upload interactive before-and-after comparison slides to Cloudflare R2.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onAddService}
            className="hex-pill bg-white hover:bg-primary/10 text-[#111111] border border-primary/40 font-black px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} className="text-primary-amber" /> + Add New Service
          </button>
          <button
            type="button"
            onClick={onSaveServices}
            disabled={configSaving}
            className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Save size={14} /> {configSaving ? "Saving..." : "Save All Services"}
          </button>
        </div>
      </div>

      {/* Services Cards List */}
      <div className="space-y-6">
        {Object.keys(currentServicesMap).map((serviceKey) => {
          const svc = currentServicesMap[serviceKey] || {};
          const isCustom = !["redesign", "handwritten", "cleanup", "data", "template", "graphic"].includes(serviceKey);

          return (
            <div key={serviceKey} className="bg-[#FFF9E8] p-5 rounded-2xl border border-[#111111]/10 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#111111]/8 pb-3">
                <div className="flex items-center gap-2">
                  <span className="hex-pill-sm bg-[#111111] text-[#FCBF14] text-[10px] font-black px-2.5 py-0.5">
                    {isCustom ? "Custom Service" : "Core Capability"}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-primary-amber">
                    {svc.title || "Untitled Service"}
                  </span>
                </div>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => onRemoveService(serviceKey)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-[#111111] block mb-1">
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={svc.title || ""}
                    onChange={(e) => onUpdateServiceField(serviceKey, "title", e.target.value)}
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#111111] block mb-1">
                    Turnaround Time Badge
                  </label>
                  <input
                    type="text"
                    value={svc.turnaround || ""}
                    onChange={(e) => onUpdateServiceField(serviceKey, "turnaround", e.target.value)}
                    placeholder="e.g. 24h – 48h"
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-medium text-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#111111] block mb-1">
                    Best Suited For Audience
                  </label>
                  <input
                    type="text"
                    value={svc.idealFor || ""}
                    onChange={(e) => onUpdateServiceField(serviceKey, "idealFor", e.target.value)}
                    placeholder="e.g. Corporate decks, executive briefings"
                    className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-medium text-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#111111] block mb-1">
                  Service Description / Tagline
                </label>
                <input
                  type="text"
                  value={svc.tagline || ""}
                  onChange={(e) => onUpdateServiceField(serviceKey, "tagline", e.target.value)}
                  placeholder="Short description explaining the transformation..."
                  className="w-full bg-white border border-[#111111]/12 rounded-xl px-3 py-1.5 text-xs font-medium text-[#111111]"
                />
              </div>

              {/* Before & After Image Comparison Uploader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#111111]/6">
                {/* Before Image */}
                <div className="bg-white p-3 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold text-red-700 block">
                      Raw Draft (Before Image)
                    </label>
                    <label className="cursor-pointer text-[9px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <UploadCloud size={11} /> {uploadingFieldKey === `svc_beforeImg_${serviceKey}` ? "Uploading..." : "Upload to R2"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingFieldKey === `svc_beforeImg_${serviceKey}`}
                        className="hidden"
                        onChange={(e) => onServiceImageUpload(serviceKey, "beforeImg", e)}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {svc.beforeImg && (
                      <img
                        src={svc.beforeImg}
                        alt="Before Preview"
                        className="w-14 h-9 object-cover rounded border border-red-200 flex-shrink-0"
                      />
                    )}
                    <input
                      type="text"
                      value={svc.beforeImg || ""}
                      onChange={(e) => onUpdateServiceField(serviceKey, "beforeImg", e.target.value)}
                      placeholder="R2 CDN URL or upload"
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded px-2.5 py-1 text-[11px] font-mono"
                    />
                  </div>
                </div>

                {/* After Image */}
                <div className="bg-white p-3 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold text-green-700 block">
                      SlideBee Polish (After Image)
                    </label>
                    <label className="cursor-pointer text-[9px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <UploadCloud size={11} /> {uploadingFieldKey === `svc_afterImg_${serviceKey}` ? "Uploading..." : "Upload to R2"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingFieldKey === `svc_afterImg_${serviceKey}`}
                        className="hidden"
                        onChange={(e) => onServiceImageUpload(serviceKey, "afterImg", e)}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {svc.afterImg && (
                      <img
                        src={svc.afterImg}
                        alt="After Preview"
                        className="w-14 h-9 object-cover rounded border border-green-200 flex-shrink-0"
                      />
                    )}
                    <input
                      type="text"
                      value={svc.afterImg || ""}
                      onChange={(e) => onUpdateServiceField(serviceKey, "afterImg", e.target.value)}
                      placeholder="R2 CDN URL or upload"
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded px-2.5 py-1 text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
