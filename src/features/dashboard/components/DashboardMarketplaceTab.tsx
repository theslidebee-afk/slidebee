import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface DeliverableItem {
  id: string;
  title: string;
}

interface DashboardMarketplaceTabProps {
  defaultDeliverables: DeliverableItem[];
}

export function DashboardMarketplaceTab({ defaultDeliverables }: DashboardMarketplaceTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-black text-[#111111]">
            SlideBee Template Marketplace
          </h2>
          <p className="text-xs text-[#726F6D]">
            Browse over 100+ executive presentation master decks
          </p>
        </div>
        <Link
          to="/#templates"
          className="hex-pill bg-primary hover:bg-primary/90 text-[#111111] text-xs font-black px-5 py-2.5 flex items-center gap-1.5 shadow-xs"
        >
          Explore Full Catalog <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultDeliverables.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-3xl p-5 bg-white space-y-3 shadow-2xs">
            <div className="h-36 rounded-2xl bg-gray-100 flex items-center justify-center font-heading font-black text-sm text-gray-400">
              Slide Artwork Preview
            </div>
            <h4 className="font-heading font-black text-sm text-[#111111]">{item.title}</h4>
            <p className="text-xs text-[#726F6D]">Enterprise Keynote & PPTX Master</p>
            <Link
              to="/#templates"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-amber hover:underline"
            >
              View Template Details <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
