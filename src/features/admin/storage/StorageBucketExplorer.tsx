import React, { useState } from "react";
import { 
  HardDrive, 
  Search, 
  RefreshCw, 
  Check, 
  Copy, 
  ExternalLink, 
  Trash2, 
  FileText, 
  ImageIcon 
} from "lucide-react";
import { fetchR2Telemetry, R2_PUBLIC_BASE_URL } from "../../../lib/r2";

interface StorageBucketExplorerProps {
  storageStats: any;
  setStorageStats: React.Dispatch<React.SetStateAction<any>>;
  onDeleteObject: (key: string) => Promise<void>;
}

export const StorageBucketExplorer: React.FC<StorageBucketExplorerProps> = ({
  storageStats,
  setStorageStats,
  onDeleteObject,
}) => {
  const [storageSearchTerm, setStorageSearchTerm] = useState("");
  const [storageFolderFilter, setStorageFolderFilter] = useState("all");
  const [copiedUrlKey, setCopiedUrlKey] = useState<string | null>(null);

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-[#111111]/8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
              <HardDrive size={18} className="text-primary-amber" />
              <span>Live Cloudflare R2 Bucket Explorer (slidebee)</span>
            </h3>
            <p className="text-xs text-[#726F6D]">
              Public Edge CDN: <code className="bg-black/5 px-1 py-0.5 rounded text-[11px] font-mono">{R2_PUBLIC_BASE_URL}</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#726F6D]" />
              <input
                type="text"
                placeholder="Search R2 files..."
                value={storageSearchTerm}
                onChange={(e) => setStorageSearchTerm(e.target.value)}
                className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary font-medium"
              />
            </div>
            <button
              type="button"
              onClick={async () => {
                const data = await fetchR2Telemetry();
                if (data?.success) {
                  setStorageStats((prev: any) => ({
                    ...prev,
                    ...data,
                    objects: data.objects || [],
                  }));
                }
              }}
              className="hex-pill-sm bg-black/5 hover:bg-black/10 text-[#111111] font-bold text-xs p-2"
              title="Refresh telemetry from Cloudflare R2"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Folder Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#111111]/6">
          <span className="text-[10px] font-extrabold text-[#726F6D] uppercase tracking-wider mr-1">
            Folder:
          </span>
          {[
            { id: "all", label: "All Objects", count: (storageStats.objects || []).length },
            { id: "templates/decks", label: "templates/decks/", count: (storageStats.objects || []).filter((o: any) => o.key.startsWith("templates/decks/")).length },
            { id: "templates/slides", label: "templates/slides/", count: (storageStats.objects || []).filter((o: any) => o.key.startsWith("templates/slides/")).length },
            { id: "marquee", label: "marquee/", count: (storageStats.objects || []).filter((o: any) => o.key.startsWith("marquee/")).length },
            { id: "bulk-ingest", label: "bulk-ingest/", count: (storageStats.objects || []).filter((o: any) => o.key.startsWith("bulk-ingest/")).length },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStorageFolderFilter(f.id)}
              className={`hex-pill-sm text-[11px] font-bold px-3 py-1 transition-all ${
                storageFolderFilter === f.id
                  ? "bg-primary text-[#111111] shadow-xs"
                  : "bg-black/5 hover:bg-black/10 text-[#726F6D]"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {storageStats.objects && storageStats.objects.length > 0 ? (
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9E8] text-[#726F6D] font-extrabold text-[10px] uppercase tracking-wider border-b border-[#111111]/8 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3">Object Key / File Name</th>
                <th className="px-5 py-3">Storage Class</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Last Modified</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/5">
              {storageStats.objects
                .filter((o: any) => {
                  const matchesSearch = !storageSearchTerm || o.key.toLowerCase().includes(storageSearchTerm.toLowerCase());
                  const matchesFolder = storageFolderFilter === "all" || o.key.startsWith(`${storageFolderFilter}/`);
                  return matchesSearch && matchesFolder;
                })
                .map((obj: any) => {
                  const folder = obj.key.includes("/") ? obj.key.split("/").slice(0, -1).join("/") : "root";
                  const isPpt = obj.key.endsWith(".pptx") || obj.key.endsWith(".ppt");
                  const isImg = obj.key.match(/\.(jpg|jpeg|png|webp|svg)$/i);

                  return (
                    <tr key={obj.key} className="hover:bg-black/[0.01] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {isPpt ? (
                            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-bold text-[9px]">
                              PPT
                            </div>
                          ) : isImg ? (
                            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                              <ImageIcon size={13} />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                              <FileText size={13} />
                            </div>
                          )}

                          <div>
                            <div className="font-bold text-[#111111] text-xs font-mono break-all">
                              {obj.key}
                            </div>
                            <span className="hex-pill-sm bg-black/5 text-[#726F6D] text-[9px] font-mono px-1.5 py-0.5">
                              folder: {folder}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="hex-pill-sm bg-green-50 text-green-800 border border-green-200 text-[10px] font-bold px-2 py-0.5">
                          Standard R2
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-[#111111]">
                        {obj.sizeMB} MB
                        <span className="text-[10px] text-[#726F6D] font-normal block">
                          {(obj.size / 1024).toFixed(0)} KB
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[#726F6D] text-[11px]">
                        {obj.uploaded ? new Date(obj.uploaded).toLocaleDateString() : "Active"}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(obj.publicUrl);
                              setCopiedUrlKey(obj.key);
                              setTimeout(() => setCopiedUrlKey(null), 2000);
                            }}
                            className="hex-pill-sm bg-black/5 hover:bg-black/10 text-[#111111] font-bold text-[10px] px-2.5 py-1.5 flex items-center gap-1"
                            title="Copy Cloudflare R2 Public CDN URL"
                          >
                            {copiedUrlKey === obj.key ? (
                              <>
                                <Check size={11} className="text-green-700" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={11} /> Copy URL
                              </>
                            )}
                          </button>

                          <a
                            href={obj.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black text-[10px] px-2.5 py-1.5 flex items-center gap-1 shadow-xs"
                          >
                            <ExternalLink size={11} /> Open
                          </a>

                          <button
                            type="button"
                            onClick={() => onDeleteObject(obj.key)}
                            className="hex-pill-sm bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] p-1.5"
                            title="Delete from R2"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-[#726F6D]">
          <HardDrive size={28} className="mx-auto text-gray-300 mb-2" />
          <p className="font-extrabold text-xs text-[#111111]">Loading live objects from Cloudflare R2...</p>
          <p className="text-[11px] mt-1">Bucket: slidebee • Region: APAC • 10.00 GB Free Storage</p>
        </div>
      )}
    </div>
  );
};
