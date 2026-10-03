import React from "react";
import { Save } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export const CmsContactPanel: React.FC = () => {
  const { siteConfigs, setSiteConfigs, handleSaveConfig, configSaving } = useAdmin();

  const contactConfig = siteConfigs["contact_cms"] || {};

  return (
    <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
        <div>
          <h3 className="text-base font-heading font-extrabold text-[#111111]">
            Contact & Channels Customizer (/contact)
          </h3>
          <p className="text-xs text-[#726F6D]">
            Update studio support emails, WhatsApp hotline, and response time guarantee
          </p>
        </div>
        <button
          onClick={() => handleSaveConfig("contact_cms", contactConfig)}
          disabled={configSaving}
          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save size={14} /> {configSaving ? "Saving..." : "Save Contact Info"}
        </button>
      </div>

      <div>
        <label className="text-xs font-bold text-[#111111] block mb-1">
          Contact Page Main Headline
        </label>
        <input
          type="text"
          value={contactConfig.headline || "Let's Build Something Exceptional."}
          onChange={(e) => setSiteConfigs({
            ...siteConfigs,
            contact_cms: { ...contactConfig, headline: e.target.value }
          })}
          className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-bold text-[#111111]"
          placeholder="e.g. Let's Build Something Exceptional."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-[#111111] block mb-1">
          Contact Page Subheadline
        </label>
        <textarea
          rows={2}
          value={contactConfig.subheadline || "Have an urgent pitch deck, board presentation, or enterprise template system to design? Reach our senior design directors directly."}
          onChange={(e) => setSiteConfigs({
            ...siteConfigs,
            contact_cms: { ...contactConfig, subheadline: e.target.value }
          })}
          className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-xl p-3 text-xs font-medium text-[#111111]"
          placeholder="Supporting contact description paragraph..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Primary Client Email
          </label>
          <input
            type="email"
            value={contactConfig.generalEmail || "hello@theslidebee.com"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              contact_cms: { ...contactConfig, generalEmail: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Support / Intake Email
          </label>
          <input
            type="email"
            value={contactConfig.supportEmail || "support@theslidebee.com"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              contact_cms: { ...contactConfig, supportEmail: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            WhatsApp Hotline / Phone
          </label>
          <input
            type="text"
            value={contactConfig.whatsapp || "+1 (555) 123-4567"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              contact_cms: { ...contactConfig, whatsapp: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#111111] block mb-1">
            Response Guarantee Badge
          </label>
          <input
            type="text"
            value={contactConfig.responseGuarantee || "2-Hour Response Time"}
            onChange={(e) => setSiteConfigs({
              ...siteConfigs,
              contact_cms: { ...contactConfig, responseGuarantee: e.target.value }
            })}
            className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-bold text-primary-amber"
          />
        </div>
      </div>
    </div>
  );
};
