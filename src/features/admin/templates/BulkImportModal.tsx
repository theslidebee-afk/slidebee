import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UploadCloud,
  FileText,
  ImageIcon,
  Download,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import {
  handleDownloadSampleCSV,
  parseAndValidateCsv,
  executeBulkImport,
  BulkAssetUploaderTab,
  BulkCsvParserTab,
  type CsvIssue
} from "./bulk";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: any[];
  onImportSuccess: (importedTemplates: any[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  templates,
  onImportSuccess
}) => {
  const [bulkModalTab, setBulkModalTab] = useState<"csv" | "assets">("csv");
  const [bulkUploadedAssets, setBulkUploadedAssets] = useState<
    Array<{ id: string; name: string; size: string; url: string; type: "ppt" | "image" }>
  >([]);
  const [csvRawText, setCsvRawText] = useState("");
  const [parsedBulkTemplates, setParsedBulkTemplates] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<CsvIssue[]>([]);
  const [csvWarnings, setCsvWarnings] = useState<CsvIssue[]>([]);
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const [bulkImportSuccessCount, setBulkImportSuccessCount] = useState<number | null>(null);
  const [shouldMirrorAssets, setShouldMirrorAssets] = useState(true);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseCSV = (raw: string) => {
    setCsvRawText(raw);
    const { items, errors, warnings } = parseAndValidateCsv(raw, templates);
    setParsedBulkTemplates(items);
    setCsvErrors(errors);
    setCsvWarnings(warnings);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) handleParseCSV(text);
    };
    reader.readAsText(file);
  };

  const handleGenerateCsvRowFromUploadedAssets = () => {
    if (bulkUploadedAssets.length === 0) return;
    const newSku = `SLD-${Math.floor(100 + Math.random() * 900)}`;
    const pptAsset = bulkUploadedAssets.find((a) => a.type === "ppt");
    const imageAssets = bulkUploadedAssets.filter((a) => a.type === "image");
    const thumbUrl = imageAssets[0]?.url || "";
    const previewUrls = imageAssets.map((a) => a.url).join(";");
    const pptUrl = pptAsset?.url || "";

    const newRow = `"${newSku}","Executive Pitch Deck ${newSku}","Pitch Decks",999,19,1999,${Math.max(
      imageAssets.length,
      25
    )},"${thumbUrl}","${previewUrls || thumbUrl}","${pptUrl}","PowerPoint (.pptx)","Custom executive pitch deck layout ready for high-stakes presentations.","${Math.max(
      imageAssets.length,
      25
    )}+ High-Impact Slides;Editable Vector Elements;16:9 Widescreen"\n`;

    const nextRaw = csvRawText
      ? csvRawText.trim() + "\n" + newRow
      : "code,title,category,price_inr,price_usd,original_price_inr,slide_count,thumbnail_url,slides_preview_urls,download_url,formats,description,features\n" +
        newRow;
    handleParseCSV(nextRaw);
    setBulkModalTab("csv");
  };

  const handleExecuteImport = async () => {
    if (parsedBulkTemplates.length === 0) return;
    setIsImportingBulk(true);

    const result = await executeBulkImport(parsedBulkTemplates, shouldMirrorAssets, setIngestStatus);

    if (result.success) {
      onImportSuccess(parsedBulkTemplates);
      setBulkImportSuccessCount(result.insertedCount);
      setTimeout(() => {
        onClose();
        setBulkImportSuccessCount(null);
        setParsedBulkTemplates([]);
        setCsvRawText("");
        setIngestStatus(null);
      }, 2500);
    } else {
      alert("Import warning: " + result.error);
    }
    setIsImportingBulk(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border-2 border-[#111111]/15 rounded-2xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto"
        >
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#111111]/10 mb-4 gap-3">
            <div>
              <h3 className="text-xl font-heading font-extrabold text-[#111111] flex items-center gap-2">
                <UploadCloud className="text-primary-amber" size={22} /> Bulk Import Presentation Templates
              </h3>
              <p className="text-xs text-[#726F6D]">
                Upload a CSV spreadsheet with Master PowerPoint (.pptx) deliverables and multi-slide preview images
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="rounded-lg bg-[#FFF9E8] hover:bg-[#111111] hover:text-[#FCBF14] border border-[#111111]/10 px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download size={13} /> Download Sample CSV
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-[#111111] rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sub-Tab Switcher inside Modal */}
          <div className="flex items-center gap-2 mb-5 border-b border-[#111111]/8 pb-2">
            <button
              type="button"
              onClick={() => setBulkModalTab("csv")}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                bulkModalTab === "csv"
                  ? "bg-[#111111] text-primary shadow"
                  : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              <FileText size={13} /> 1. Spreadsheet CSV ({parsedBulkTemplates.length} Ready)
            </button>
            <button
              type="button"
              onClick={() => setBulkModalTab("assets")}
              className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                bulkModalTab === "assets"
                  ? "bg-[#111111] text-primary shadow"
                  : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              <ImageIcon size={13} /> 2. Slide Previews & PPT Uploader ({bulkUploadedAssets.length})
            </button>
          </div>

          {bulkModalTab === "csv" && (
            <BulkCsvParserTab
              csvRawText={csvRawText}
              onRawTextChange={handleParseCSV}
              onFileUpload={handleFileUpload}
              parsedBulkTemplates={parsedBulkTemplates}
              csvErrors={csvErrors}
              csvWarnings={csvWarnings}
              shouldMirrorAssets={shouldMirrorAssets}
              setShouldMirrorAssets={setShouldMirrorAssets}
            />
          )}

          {bulkModalTab === "assets" && (
            <BulkAssetUploaderTab
              bulkUploadedAssets={bulkUploadedAssets}
              setBulkUploadedAssets={setBulkUploadedAssets}
              onGenerateCsvRow={handleGenerateCsvRowFromUploadedAssets}
            />
          )}

          {/* Import Execution Footer */}
          {bulkImportSuccessCount !== null ? (
            <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-center text-green-900 font-bold flex items-center justify-center gap-2 text-sm">
              <CheckCircle2 size={18} className="text-green-600" />
              <span>Successfully imported {bulkImportSuccessCount} templates to your store catalog!</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#111111]/10">
              <div className="text-xs text-[#726F6D] flex items-center gap-2">
                {ingestStatus && (
                  <span className="flex items-center gap-1.5 text-primary-amber font-bold animate-pulse">
                    <RefreshCw size={13} className="animate-spin" /> {ingestStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#726F6D] hover:bg-black/5 cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedBulkTemplates.length === 0 || csvErrors.length > 0 || isImportingBulk}
                  onClick={handleExecuteImport}
                  className="rounded-xl bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                >
                  {isImportingBulk ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Importing...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} /> Import {parsedBulkTemplates.length} Templates
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
