import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CsvIssue } from "./bulkImportUtils";

interface BulkCsvParserTabProps {
  csvRawText: string;
  onRawTextChange: (text: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parsedBulkTemplates: any[];
  csvErrors: CsvIssue[];
  csvWarnings: CsvIssue[];
  shouldMirrorAssets: boolean;
  setShouldMirrorAssets: (mirror: boolean) => void;
}

export const BulkCsvParserTab: React.FC<BulkCsvParserTabProps> = ({
  csvRawText,
  onRawTextChange,
  onFileUpload,
  parsedBulkTemplates,
  csvErrors,
  csvWarnings,
  shouldMirrorAssets,
  setShouldMirrorAssets
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
            Upload .CSV / Spreadsheet File
          </label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={onFileUpload}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-lg px-4 py-2.5 text-xs text-[#111111] font-medium outline-none cursor-pointer"
          />
          <span className="text-[10px] text-[#726F6D] mt-1 block">
            Supports standard CSV from Microsoft Excel, Google Sheets, or Numbers.
          </span>
        </div>

        <div className="bg-[#FFF9E8] border border-primary/30 p-3.5 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#111111]">Cloudflare R2 Auto-Mirroring:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={shouldMirrorAssets}
                onChange={(e) => setShouldMirrorAssets(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-[11px] text-[#726F6D] leading-tight">
            Automatically downloads external Google Drive or web images and converts them to permanent Cloudflare R2 assets.
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
          Or Paste Raw CSV Data Directly
        </label>
        <textarea
          rows={5}
          value={csvRawText}
          onChange={(e) => onRawTextChange(e.target.value)}
          placeholder="code,title,category,price_inr,price_usd,original_price_inr,slide_count,thumbnail_url,slides_preview_urls,download_url..."
          className="w-full bg-white border border-[#111111]/15 rounded-xl p-3 text-xs font-mono text-[#111111] outline-none focus:border-primary resize-y"
        />
      </div>

      {/* CSV Validation Feedback Bar */}
      {csvErrors.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3.5 text-xs text-red-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-900">
            <AlertCircle size={16} />
            <span>{csvErrors.length} Critical Formatting Error{csvErrors.length > 1 ? "s" : ""} Found in CSV</span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1.5 text-[11px]">
            {csvErrors.map((err, idx) => (
              <div key={idx} className="bg-white/80 p-1.5 rounded border border-red-200 flex items-start gap-2">
                <span className="font-mono font-bold bg-red-100 text-red-900 px-1 rounded shrink-0">
                  Row {err.row}
                </span>
                <div>
                  <strong className="text-red-950 font-semibold">{err.code}</strong>: {err.issue}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {csvWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-800 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertTriangle size={15} />
            <span>{csvWarnings.length} Warning{csvWarnings.length > 1 ? "s" : ""}</span>
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1 text-[11px]">
            {csvWarnings.map((w, idx) => (
              <div key={idx} className="bg-white/80 p-1 rounded border border-amber-200">
                Row {w.row} ({w.code}): {w.issue}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedBulkTemplates.length > 0 && (
        <div className="bg-white border border-[#111111]/12 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#111111]/8">
            <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-600" />
              Parsed {parsedBulkTemplates.length} Ready Templates
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-[#111111]/6 text-xs">
            {parsedBulkTemplates.map((t, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-7 rounded bg-gray-100 overflow-hidden shrink-0 border border-black/10">
                    <img src={t.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-[#111111] truncate">{t.title}</div>
                    <div className="text-[10px] text-[#726F6D]">
                      {t.code} • {t.category} • {t.slide_count} slides • ₹{t.price_inr} (${t.price_usd})
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#FFF9E8] px-2 py-0.5 rounded border border-primary/20 shrink-0">
                  {t.slides?.length || 1} preview slides
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
