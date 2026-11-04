import React from "react";
import { 
  LogOut, 
  Plus, 
  FileSpreadsheet, 
  RefreshCw, 
  Check, 
  AlertCircle 
} from "lucide-react";
import SlideBeeLogo from "../../../components/SlideBeeLogo";
import { useAdmin } from "../context/AdminContext";

export const AdminHeader: React.FC = () => {
  const {
    session,
    setIsAddTemplateOpen,
    setIsBulkImportOpen,
    isRefreshingDashboard,
    refreshFeedback,
    lastRefreshedTime,
    fetchDashboardData,
    handleLogout
  } = useAdmin();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#111111]/10 p-5 rounded-3xl shadow-xs">
      <div className="flex items-center gap-4">
        <SlideBeeLogo variant="light" size="md" />
        <div className="border-l border-[#111111]/10 pl-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-amber">
              Studio Admin
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              D1 Live
            </span>
          </div>
          <h1 className="text-lg font-heading font-extrabold text-[#111111]">
            SlideBee Master Studio Hub
          </h1>
          <span className="text-xs text-[#726F6D] font-medium">
            Admin: <strong>{session?.user?.email}</strong>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsAddTemplateOpen(true)}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs py-2 px-4 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
        >
          <Plus size={14} /> Add Template
        </button>
        <button
          type="button"
          onClick={() => setIsBulkImportOpen(true)}
          className="hex-pill bg-[#FFF9E8] hover:bg-primary/20 text-[#111111] font-bold text-xs py-2 px-3 border border-primary/30 flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <FileSpreadsheet size={13} /> Bulk CSV Import
        </button>
        <button
          type="button"
          disabled={isRefreshingDashboard}
          onClick={fetchDashboardData}
          className={`hex-pill text-xs font-extrabold px-4 py-2 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            refreshFeedback === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : refreshFeedback === "error"
              ? "bg-red-50 text-red-800 border border-red-300"
              : "bg-[#FFF9E8] text-[#111111] border border-[#111111]/10 hover:bg-black/5 hover:border-primary/50"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
          title={lastRefreshedTime ? `Last synced at ${lastRefreshedTime}` : "Fetch latest live data from database"}
        >
          {isRefreshingDashboard ? (
            <>
              <RefreshCw size={12} className="animate-spin text-primary-amber" />
              <span>Refreshing...</span>
            </>
          ) : refreshFeedback === "success" ? (
            <>
              <Check size={12} className="text-emerald-600" />
              <span>Updated {lastRefreshedTime || "Just Now"}</span>
            </>
          ) : refreshFeedback === "error" ? (
            <>
              <AlertCircle size={12} className="text-red-600" />
              <span>Sync Failed</span>
            </>
          ) : (
            <>
              <RefreshCw size={12} />
              <span>Refresh Data</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="hex-pill bg-red-50 text-red-700 border border-red-200 px-4 py-2 text-xs font-extrabold hover:bg-red-100 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>
    </div>
  );
};
export default AdminHeader;
