import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";

export default function StickyMobileCTA() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  // Hide on admin, login, and the order form itself to prevent UI overlap
  if (
    currentPath.startsWith("/admin") ||
    currentPath.startsWith("/login") ||
    currentPath.startsWith("/account") ||
    currentPath.startsWith("/ordernow") ||
    currentPath.startsWith("/order") ||
    currentPath === "/" ||
    currentPath === "/coming-soon"
  ) {
    return null;
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#111111]/10 px-4 py-2.5 shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FCBF14] flex items-center gap-1">
            <Zap size={12} className="fill-[#FCBF14]" />
            24h-48h Delivery
          </span>
          <span className="text-xs font-heading font-extrabold text-[#111111]">
            Executive Slide Design
          </span>
        </div>

        <Link
          to="/ordernow"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FCBF14] text-[#111111] text-xs font-extrabold rounded-md shadow-sm hover:bg-[#E5AC10] active:scale-95 transition-all"
        >
          <span>Order Slides</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
