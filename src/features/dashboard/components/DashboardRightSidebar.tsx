import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, Clock, Download, LogOut, Crown, MessageCircle } from "lucide-react";

interface DashboardRightSidebarProps {
  clientName: string;
  activeOrder?: any;
  activeProjectTitle?: string;
  activeMilestone?: string | null;
  studioWhatsapp: string;
  handleLogout: () => void;
  isProUser?: boolean;
  proDaysRemaining?: number | null;
  userSubscription?: any;
  userTier?: string;
}

export function DashboardRightSidebar({
  clientName,
  activeOrder,
  activeProjectTitle,
  activeMilestone,
  studioWhatsapp,
  handleLogout,
  isProUser = false,
  proDaysRemaining = null,
  userSubscription,
  userTier = "free",
}: DashboardRightSidebarProps) {
  const planName =
    userSubscription?.plan_name ||
    (userTier === "yearly"
      ? "SlideBee Yearly Pro"
      : userTier === "lifetime"
      ? "SlideBee Lifetime VIP"
      : userTier === "monthly"
      ? "SlideBee Monthly Pro"
      : "Free Starter");

  return (
    <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-100 p-6 sm:p-7 shrink-0 bg-white flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Top Right Header Controls */}
        <div className="flex items-center justify-end gap-3.5">
          <Link
            to="/templates"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#111111] transition-colors cursor-pointer"
            title="Browse Catalog"
          >
            <HelpCircle size={16} />
          </Link>

          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-heading font-black text-xs text-primary-amber">
              {clientName[0]?.toUpperCase() || "S"}
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>

        {/* Card: Active Project OR VIP Membership Card OR Studio Brief */}
        {activeOrder ? (
          <div className="bg-[#FFF9EC] border border-[#F4DC9E] rounded-3xl p-5 space-y-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                {activeOrder?.status === "completed" || activeOrder?.status === "delivered"
                  ? "Delivered"
                  : "Active Brief"}
              </span>
              <h4 className="font-heading font-black text-sm sm:text-base text-[#111111]">
                {activeProjectTitle || "Executive Presentation Deck"}
              </h4>
              <p className="text-xs text-[#726F6D]">
                {activeOrder?.service_type || "Executive presentation design studio"}
              </p>
            </div>

            {/* Clock Timer */}
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111111]">
              <Clock size={13} className="text-[#111111]" />
              <span>
                {activeOrder?.rush_delivery ? "Rush 24h Turnaround" : "48h Standard Delivery"}
              </span>
            </div>

            {/* Dual Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const waUrl = `https://wa.me/${studioWhatsapp}?text=Hi%20SlideBee,%20requesting%20revision%20for%20${encodeURIComponent(
                    activeProjectTitle || "My Custom Deck"
                  )}`;
                  window.open(waUrl, "_blank");
                }}
                className="w-full bg-[#151515] hover:bg-black text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Request Revision / Chat
              </button>
              {activeOrder?.deliverable_url ? (
                <a
                  href={activeOrder?.deliverable_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#F5B921] hover:bg-[#E0A71B] text-[#111111] font-black text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Download size={13} /> Download Final Master (.pptx)
                </a>
              ) : (
                <div className="w-full bg-white/80 text-[#726F6D] border border-dashed border-[#ECCF87] font-bold text-[11px] py-2.5 rounded-xl text-center">
                  Milestone: {activeMilestone || "In Production"}
                </div>
              )}
            </div>
          </div>
        ) : isProUser ? (
          <div className="bg-[#FFF9EC] border border-[#F4DC9E] rounded-3xl p-5 space-y-3 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/50 px-2 py-0.5 rounded-md w-fit">
                <Crown size={12} className="text-amber-800" />
                <span>VIP Member Pass</span>
              </div>
              <h4 className="font-heading font-black text-sm sm:text-base text-[#111111]">
                {planName}
              </h4>
              <p className="text-xs text-[#726F6D]">
                Unlimited template catalog access and priority studio queue
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111111]">
              <Clock size={13} className="text-[#111111]" />
              <span>
                {proDaysRemaining !== null
                  ? `${proDaysRemaining} days remaining in cycle`
                  : "Active VIP Membership"}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                to="/ordernow"
                className="block w-full bg-[#151515] hover:bg-black text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Commission Bespoke Deck
              </Link>
              <a
                href={`https://wa.me/${studioWhatsapp}?text=Hi%20SlideBee,%20inquiring%20about%20my%20VIP%20Pro%20membership`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#F5B921] hover:bg-[#E0A71B] text-[#111111] font-black text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={13} /> VIP WhatsApp Hotline
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFF9EC] border border-[#F4DC9E] rounded-3xl p-5 space-y-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                Executive Studio
              </span>
              <h4 className="font-heading font-black text-sm sm:text-base text-[#111111]">
                Commission Custom Deck
              </h4>
              <p className="text-xs text-[#726F6D]">
                Bespoke slide decks crafted by senior McKinsey & ex-agency designers
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111111]">
              <Clock size={13} className="text-[#111111]" />
              <span>48h Standard Delivery Available</span>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                to="/ordernow"
                className="block w-full bg-[#151515] hover:bg-black text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
              >
                Start Design Brief
              </Link>
              <Link
                to="/pricing"
                className="block w-full bg-[#F5B921] hover:bg-[#E0A71B] text-[#111111] font-black text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Crown size={13} /> Upgrade to Pro
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2.5 px-4 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut size={14} /> Log Out of SlideBee
        </button>
      </div>
    </div>
  );
}
