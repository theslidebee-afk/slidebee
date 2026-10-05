import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ArrowRight, Download, ShieldCheck, Clock, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export interface PurchasedItem {
  id: string;
  title: string;
  subtitle: string;
  downloadUrl: string;
  thumbnailBg: string;
  isCustomProject?: boolean;
  purchasedAt?: string;
  templateSlug?: string;
}

export interface DashboardPurchasedTabProps {
  allPurchasedDeliverables: PurchasedItem[];
  isProUser?: boolean;
  quotaRemaining?: number;
}

export function DashboardPurchasedTab({
  allPurchasedDeliverables,
  isProUser = false,
  quotaRemaining = 0,
}: DashboardPurchasedTabProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [redownloadNotice, setRedownloadNotice] = useState<string | null>(null);

  const isWithinGracePeriod = (purchasedAt?: string): boolean => {
    if (!purchasedAt) return false;
    try {
      const purchasedTime = new Date(purchasedAt).getTime();
      if (isNaN(purchasedTime)) return false;
      const now = Date.now();
      const diffHours = (now - purchasedTime) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 24;
    } catch {
      return false;
    }
  };

  const handleProRedownload = (item: PurchasedItem) => {
    setDownloadingId(item.id);
    setRedownloadNotice(`Redownloading "${item.title}". Deducted 1 Pro credit.`);
    
    // Trigger download
    const link = document.createElement("a");
    link.href = item.downloadUrl;
    link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pptx`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-heading font-black text-[#111111]">
            My Purchased Presentation Decks
          </h2>
          <p className="text-xs text-[#726F6D]">
            Direct commercial licenses and deliverables ready for download
          </p>
        </div>
        <Link
          to="/#templates"
          className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          Browse Store Catalog <ArrowRight size={13} />
        </Link>
      </div>

      {/* Digital Delivery & Metered Redownload Policy Notice */}
      <div className="bg-[#FFFDF7] border border-[#FCBF14]/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#111111] shadow-2xs">
        <ShieldCheck size={18} className="text-[#D99B00] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-xs uppercase tracking-wider text-[#111111]">
            Digital Delivery & Metered Offline Access Policy
          </p>
          <p className="text-[#726F6D] leading-relaxed text-xs">
            Presentation files (.pptx) are streamed directly to your browser upon purchase for immediate offline storage. Single purchases include an initial 24-hour delivery grace window to save to your local drive. Pro members may redownload decks at any time using their monthly quota. Custom presentation deliverables remain permanently accessible.
          </p>
        </div>
      </div>

      {redownloadNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#D99B00]" />
            <span>{redownloadNotice}</span>
          </div>
          <button
            onClick={() => setRedownloadNotice(null)}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {allPurchasedDeliverables.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-3xl bg-white/50">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-bold text-[#111111]">No purchases or deliverables recorded yet</p>
          <p className="text-xs text-[#726F6D] mt-1">
            Templates acquired or custom briefs commissioned will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPurchasedDeliverables.map((item) => {
            const hasGrace = isWithinGracePeriod(item.purchasedAt);
            const canDirectDownload = item.isCustomProject || hasGrace;

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-xl ${item.thumbnailBg} flex items-center justify-center shrink-0`}>
                      <FileText
                        size={20}
                        className={item.thumbnailBg.includes("181818") ? "text-amber-400" : "text-[#111111]"}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-heading font-black text-sm text-[#111111] truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#726F6D] truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  {item.isCustomProject ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-[#FCBF14] px-2 py-0.5 rounded-full shrink-0">
                      Custom Master
                    </span>
                  ) : hasGrace ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      <Clock size={10} /> Grace Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                      Saved License
                    </span>
                  )}
                </div>

                {canDirectDownload ? (
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black py-2.5 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download size={14} /> Download Presentation Files (.pptx)
                  </a>
                ) : isProUser && quotaRemaining > 0 ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleProRedownload(item)}
                      disabled={downloadingId === item.id}
                      className="w-full hex-pill bg-[#111111] hover:bg-[#222222] text-[#FCBF14] text-xs font-black py-2.5 flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={downloadingId === item.id ? "animate-spin" : ""} />
                      {downloadingId === item.id
                        ? "Streaming File..."
                        : `Redownload Deck (Uses 1 Pro Quota - ${quotaRemaining} Left)`}
                    </button>
                    <p className="text-[11px] text-center text-[#726F6D]">
                      Uses 1 monthly quota credit from your active Pro plan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <div className="flex items-start gap-2 text-[11px] text-gray-600">
                      <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Delivery window ended. Files are stored on your local disk. To download a fresh copy, use Pro quota or acquire a new license.
                      </span>
                    </div>
                    <Link
                      to={item.templateSlug ? `/templates/${item.templateSlug}` : "/#templates"}
                      className="w-full hex-pill bg-white hover:bg-gray-100 border border-gray-300 text-[#111111] text-xs font-bold py-2 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      Acquire Fresh License <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
