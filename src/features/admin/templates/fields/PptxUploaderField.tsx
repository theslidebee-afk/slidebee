import React from "react";
import { HardDrive, CheckCircle2 } from "lucide-react";
import { normalizeR2Url } from "../../../../lib/r2";

interface PptxUploaderFieldProps {
  pptFilename?: string;
  pptSize?: string;
  downloadUrl?: string;
  isUploadingPpt: boolean;
  onPptFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePpt?: () => void;
}

export const PptxUploaderField: React.FC<PptxUploaderFieldProps> = ({
  pptFilename,
  pptSize,
  downloadUrl,
  isUploadingPpt,
  onPptFileUpload,
  onRemovePpt
}) => {
  const hasFile = Boolean(pptFilename || downloadUrl);
  const displayName = pptFilename || (downloadUrl ? downloadUrl.split("/").pop() : "");

  return (
    <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/10 text-left space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
            <HardDrive size={13} className="text-primary-amber" />
            <span>Master PPTX Deliverable</span>
          </label>
        </div>
        <p className="text-[10px] text-[#726F6D]">
          The Master PowerPoint (.pptx) file buyers receive upon checkout or instant download.
        </p>
      </div>

      <div className="bg-white p-3 rounded-lg border border-[#111111]/10 space-y-2">
        <label className="rounded-lg bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3 py-2 text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm w-full justify-center transition-transform hover:scale-[1.01]">
          <HardDrive size={13} className="text-primary-amber" />
          <span>{isUploadingPpt ? "Uploading to Cloudflare R2..." : "Choose Master PowerPoint File (.pptx)"}</span>
          <input
            type="file"
            accept=".pptx,.ppt"
            disabled={isUploadingPpt}
            onChange={onPptFileUpload}
            className="hidden"
          />
        </label>

        {hasFile ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-lg text-xs font-bold flex items-center justify-between">
            <div className="truncate flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span className="truncate text-[11px]">
                {pptFilename ? `${pptFilename} ${pptSize ? `(${pptSize})` : ""}` : `Attached: ${displayName}`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {downloadUrl && (
                <a
                  href={normalizeR2Url(downloadUrl, "decks")}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-primary-amber hover:underline text-xs font-black"
                >
                  Test PPTX
                </a>
              )}
              {onRemovePpt && (
                <button
                  type="button"
                  onClick={onRemovePpt}
                  className="text-red-600 hover:text-red-800 text-[11px] font-bold underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-[#726F6D] block text-center">
            Master presentation (.pptx) uploaded directly to Cloudflare R2.
          </span>
        )}
      </div>
    </div>
  );
};

