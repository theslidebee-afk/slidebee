import { Link } from "react-router-dom";
import { FileText, ArrowRight, Download } from "lucide-react";

interface PurchasedItem {
  id: string;
  title: string;
  subtitle: string;
  downloadUrl: string;
  thumbnailBg: string;
  isCustomProject?: boolean;
}

interface DashboardPurchasedTabProps {
  allPurchasedDeliverables: PurchasedItem[];
}

export function DashboardPurchasedTab({
  allPurchasedDeliverables,
}: DashboardPurchasedTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-xs"
        >
          Browse Store Catalog <ArrowRight size={13} />
        </Link>
      </div>

      {allPurchasedDeliverables.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-3xl">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-bold text-[#111111]">No purchases or deliverables recorded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allPurchasedDeliverables.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${item.thumbnailBg} flex items-center justify-center shrink-0`}>
                    <FileText
                      size={20}
                      className={item.thumbnailBg.includes("181818") ? "text-amber-400" : "text-[#111111]"}
                    />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-sm text-[#111111]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#726F6D]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                {item.isCustomProject && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-[#FCBF14] px-2 py-0.5 rounded-full shrink-0">
                    Custom Master
                  </span>
                )}
              </div>
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black py-2.5 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Download size={14} /> Download Presentation Files (.pptx)
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
