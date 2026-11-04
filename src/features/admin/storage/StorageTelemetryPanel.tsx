import React from "react";
import { HardDrive, ShieldCheck } from "lucide-react";

interface StorageTelemetryPanelProps {
  storageStats: {
    totalUsedMB: number;
    pptxMB: number;
    pptxCount: number;
    imagesMB: number;
    imagesCount: number;
  };
}

export const StorageTelemetryPanel: React.FC<StorageTelemetryPanelProps> = ({ storageStats }) => {
  const totalR2QuotaMB = 10240; // 10 GB
  const actualUsedMB = storageStats.totalUsedMB;
  const remainingMB = Math.max(0, totalR2QuotaMB - actualUsedMB);
  const percentUsed = ((actualUsedMB / totalR2QuotaMB) * 100).toFixed(1);
  const remainingGB = (remainingMB / 1024).toFixed(2);

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#111111]/8 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary-amber">
            <HardDrive size={24} />
          </div>
          <div>
            <h3 className="text-lg font-heading font-extrabold text-[#111111]">
              Cloudflare R2 Object Storage
            </h3>
            <p className="text-xs text-[#726F6D]">
              Free Tier Quota: <strong>10.00 GB Available</strong> • $0.00 Egress Bandwidth Fees
            </p>
          </div>
        </div>

        <div className="hex-pill bg-[#FFF9E8] border border-primary/30 px-4 py-2 text-xs font-extrabold text-[#111111]">
          Status: Connected & Active
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-extrabold mb-2">
          <span className="text-[#111111]">{actualUsedMB} MB Used</span>
          <span className="text-primary-amber">{remainingGB} GB Remaining ({100 - Number(percentUsed)}% Free)</span>
        </div>
        <div className="w-full bg-[#FFF9E8] rounded-full h-4 overflow-hidden border border-[#111111]/10 p-0.5">
          <div 
            className="bg-primary-amber h-full rounded-full transition-all" 
            style={{ width: `${Math.max(1, Number(percentUsed))}%` }} 
          />
        </div>
      </div>

      {/* Storage Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
            PowerPoint Decks (.pptx)
          </span>
          <div className="text-xl font-heading font-black text-[#111111]">
            {storageStats.pptxMB} MB
          </div>
          <span className="text-[10px] text-[#726F6D] font-medium">
            {storageStats.pptxCount} Master PowerPoint (.pptx) Decks
          </span>
        </div>

        <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
            Slide Previews (.jpg/.png)
          </span>
          <div className="text-xl font-heading font-black text-[#111111]">
            {storageStats.imagesMB} MB
          </div>
          <span className="text-[10px] text-[#726F6D] font-medium">
            {storageStats.imagesCount} portfolio & interior slide previews
          </span>
        </div>

        <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
            Monthly Egress Bandwidth
          </span>
          <div className="text-xl font-heading font-black text-green-700">
            $0.00 / FREE
          </div>
          <span className="text-[10px] text-green-800 font-medium">
            Zero bandwidth fees on Cloudflare CDN
          </span>
        </div>
      </div>

      {/* Zero-Billing Safety Banner */}
      <div className="mt-6 bg-[#111111] text-white p-5 rounded-2xl border border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-sm text-white">Strict Zero-Cost Billing Policy</span>
              <span className="hex-pill-sm bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                Active & Enforced
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Hard storage ceiling at 10.00 GB (9.90 GB cutoff). Over-quota uploads automatically blocked to guarantee $0.00 zero billing.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="hex-pill-sm bg-white/10 text-white/90 border border-white/10 px-2.5 py-1">
            Storage Cap: 10.00 GB
          </span>
          <span className="hex-pill-sm bg-white/10 text-white/90 border border-white/10 px-2.5 py-1">
            Max PPTX: 50 MB
          </span>
          <span className="hex-pill-sm bg-white/10 text-white/90 border border-white/10 px-2.5 py-1">
            Max Image: 10 MB
          </span>
          <span className="hex-pill-sm bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1">
            Cloudflare R2 Native: Active
          </span>
        </div>
      </div>
    </div>
  );
};
