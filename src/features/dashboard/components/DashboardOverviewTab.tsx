import { FileText, Download } from "lucide-react";

interface DeliverableItem {
  id: string;
  title: string;
  subtitle: string;
  downloadUrl: string;
  thumbnailBg: string;
}

interface DashboardOverviewTabProps {
  clientName: string;
  activeProjectTitle: string;
  activeMilestone: string;
  quotaTotal: number;
  quotaRemaining: number;
  userTier: string;
  creditStrokeDashoffset: number;
  milestoneStrokeDashoffset: number;
  radius: number;
  circumference: number;
  deliverablesToDisplay: DeliverableItem[];
  onViewAllPurchased: () => void;
}

export function DashboardOverviewTab({
  clientName,
  activeProjectTitle,
  activeMilestone,
  quotaTotal,
  quotaRemaining,
  userTier,
  creditStrokeDashoffset,
  milestoneStrokeDashoffset,
  radius,
  circumference,
  deliverablesToDisplay,
  onViewAllPurchased,
}: DashboardOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="bg-[#151515] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-white/5">
        <div className="relative z-10 max-w-md space-y-1.5">
          <p className="text-gray-400 text-xs sm:text-sm font-medium tracking-wide">
            Welcome back, {clientName}
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-heading font-black text-white leading-snug tracking-tight">
            Your {activeProjectTitle} is in{" "}
            <span className="text-[#FCBF14]">{activeMilestone}</span> milestone
          </h2>
        </div>

        <div className="relative z-10 hidden md:flex items-center -mr-2 shrink-0">
          <div className="relative w-48 sm:w-56 h-32 rounded-2xl bg-white p-3.5 shadow-2xl rotate-2 border border-white/20 flex flex-col justify-between transform hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary-amber bg-primary/20 px-2 py-0.5 rounded">
                Master Slide
              </span>
              <span className="text-[9px] font-mono text-gray-400">16:9 HD</span>
            </div>
            <div className="space-y-1 my-1">
              <div className="text-[11px] font-heading font-black text-[#111111] line-clamp-1">
                {activeProjectTitle}
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-16 h-1.5 bg-[#FCBF14] rounded-full" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
              </div>
            </div>
            <div className="text-[9px] text-gray-500 font-bold flex items-center justify-between border-t border-gray-100 pt-1.5">
              <span>Enterprise Deck</span>
              <span className="text-emerald-700 font-black">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Metric goal */}
        <div className="bg-gradient-to-b from-white to-[#FFFDF7] border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[220px]">
          <h4 className="text-xs sm:text-sm font-heading font-black text-[#111111]">
            Metric goal
          </h4>

          <div className="relative w-28 h-28 my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke="#F3F4F6"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke="#E5A817"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={creditStrokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-heading font-black text-[#111111]">
                {quotaRemaining} <span className="text-xs text-[#726F6D]">/ {quotaTotal}</span>
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-[#726F6D]">
              {userTier === "free" ? "Free Community Downloads Today" : "Available Pro Quota"}
            </p>
            {userTier === "free" && (
              <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                Free templates only • Premium requires Pro
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Project Milestone */}
        <div className="bg-gradient-to-b from-white to-[#FFFDF7] border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between text-center min-h-[220px]">
          <h4 className="text-xs sm:text-sm font-heading font-black text-[#111111]">
            Project Milestone:
          </h4>

          <div className="relative w-28 h-28 my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke="#F3F4F6"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke="#E5A817"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={milestoneStrokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-heading font-black text-[#111111]">
                75%
              </span>
              <span className="text-[10px] font-bold text-[#726F6D]">
                Polished
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#726F6D]">
            (Draft 2 Ready)
          </p>
        </div>

        {/* Card 3: Presentation formats */}
        <div className="bg-gradient-to-b from-white to-[#FFFDF7] border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[220px]">
          <h4 className="text-xs sm:text-sm font-heading font-black text-[#111111] text-center">
            Presentation formats
          </h4>

          <div className="space-y-3.5 my-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                <span>PowerPoint (.pptx)</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#E5A817] h-full rounded-full transition-all duration-500" style={{ width: "85%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                <span>Keynote (.key)</span>
                <span>50%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#E5A817] h-full rounded-full transition-all duration-500" style={{ width: "50%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#111111] mb-1">
                <span>Google Slides</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#E5A817] h-full rounded-full transition-all duration-500" style={{ width: "40%" }} />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-center text-[#726F6D] font-medium pt-1">
            Multi-software deliverables enabled
          </div>
        </div>
      </div>

      {/* Recent Presentation Deliverables */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#111111]">
            Recent Presentation Deliverables
          </h3>
          <button
            type="button"
            onClick={onViewAllPurchased}
            className="text-xs font-bold text-[#726F6D] hover:text-[#111111] transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {deliverablesToDisplay.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200/90 rounded-2xl p-4 flex items-center justify-between hover:border-primary/60 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl ${item.thumbnailBg} border border-gray-200 flex items-center justify-center shrink-0`}>
                  <FileText size={18} className={item.thumbnailBg.includes("181818") ? "text-amber-400" : "text-[#111111]"} />
                </div>
                <div>
                  <h4 className="font-heading font-black text-xs sm:text-sm text-[#111111]">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#726F6D] font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hex-pill bg-white hover:bg-gray-50 text-[#111111] border border-gray-300 px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
