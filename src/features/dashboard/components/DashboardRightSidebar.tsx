import { HelpCircle, ChevronDown, Clock, Download, LogOut } from "lucide-react";

interface DashboardRightSidebarProps {
  clientName: string;
  activeOrder: any;
  activeProjectTitle: string;
  activeMilestone: string;
  studioWhatsapp: string;
  handleLogout: () => void;
}

export function DashboardRightSidebar({
  clientName,
  activeOrder,
  activeProjectTitle,
  activeMilestone,
  studioWhatsapp,
  handleLogout,
}: DashboardRightSidebarProps) {
  return (
    <div className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-gray-100 p-6 sm:p-7 shrink-0 bg-white flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Top Right Header Controls */}
        <div className="flex items-center justify-end gap-3.5">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#111111] transition-colors cursor-pointer"
            title="Help and Documentation"
          >
            <HelpCircle size={16} />
          </button>

          <div className="flex items-center gap-1.5 pl-1 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-heading font-black text-xs text-primary-amber">
              {clientName[0]?.toUpperCase() || "S"}
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>

        {/* Active Project Highlight Card */}
        <div className="bg-[#FFF9EC] border border-[#F4DC9E] rounded-3xl p-5 space-y-3 shadow-2xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
              {activeOrder?.status === "completed" || activeOrder?.status === "delivered"
                ? "Delivered"
                : "Active Brief"}
            </span>
            <h4 className="font-heading font-black text-sm sm:text-base text-[#111111]">
              {activeProjectTitle}
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
                  activeProjectTitle
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
                Milestone: {activeMilestone}
              </div>
            )}
          </div>
        </div>
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
