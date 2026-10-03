import React, { useState } from "react";
import { 
  Home, 
  Settings, 
  ImageIcon, 
  MessageSquare, 
  FileText, 
  Building2, 
  Phone, 
  Compass,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { CmsHomepagePanel } from "./CmsHomepagePanel";
import { CmsServicesPanel } from "./CmsServicesPanel";
import { CmsPortfolioPanel } from "./CmsPortfolioPanel";
import { CmsTestimonialsPanel } from "./CmsTestimonialsPanel";
import { CmsBlogPanel } from "./CmsBlogPanel";
import { CmsAboutPanel } from "./CmsAboutPanel";
import { CmsContactPanel } from "./CmsContactPanel";
import { CmsFooterPanel } from "./CmsFooterPanel";

export const AdminCMS: React.FC = () => {
  const { configSavedSuccess, configValidationError } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState<
    "home" | "services" | "portfolio" | "testimonials" | "blog" | "about" | "contact" | "footer"
  >("home");

  const subTabs = [
    { id: "home", label: "Homepage", icon: Home },
    { id: "services", label: "Services Page", icon: Settings },
    { id: "portfolio", label: "Portfolio & Case Studies", icon: ImageIcon },
    { id: "testimonials", label: "Client Testimonials", icon: MessageSquare },
    { id: "blog", label: "Blog & Playbook", icon: FileText },
    { id: "about", label: "About Page", icon: Building2 },
    { id: "contact", label: "Contact & Channels", icon: Phone },
    { id: "footer", label: "Footer Links", icon: Compass },
  ] as const;

  return (
    <div className="space-y-8">
      {configSavedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
          <CheckCircle2 size={16} /> Changes saved successfully to live website database!
        </div>
      )}

      {configValidationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-shake">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" /> {configValidationError}
        </div>
      )}

      {/* Sub-Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#111111]/10">
        {subTabs.map((subTab) => {
          const IconComponent = subTab.icon;
          const isActive = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={`hex-pill px-4 py-2 text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-primary text-[#111111] shadow-md scale-105"
                  : "bg-white text-[#726F6D] hover:text-[#111111] border border-[#111111]/10"
              }`}
            >
              <IconComponent size={13} />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      {activeSubTab === "home" && <CmsHomepagePanel />}
      {activeSubTab === "services" && <CmsServicesPanel />}
      {activeSubTab === "portfolio" && <CmsPortfolioPanel />}
      {activeSubTab === "testimonials" && <CmsTestimonialsPanel />}
      {activeSubTab === "blog" && <CmsBlogPanel />}
      {activeSubTab === "about" && <CmsAboutPanel />}
      {activeSubTab === "contact" && <CmsContactPanel />}
      {activeSubTab === "footer" && <CmsFooterPanel />}
    </div>
  );
};
