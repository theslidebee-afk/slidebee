import React from "react";
import {
  Send,
  Loader2,
  UploadCloud,
  Clock,
  Shield,
  ShieldCheck,
  Layers,
  AlertCircle
} from "lucide-react";
import { SlideBeeSelect } from "./SlideBeeSelect";
import {
  presentationServices,
  ecommerceServices,
  slideRanges,
  ecommerceCatalogRanges,
  presentationTimelines,
  ecommerceTimelines,
  presentationFormats,
  ecommerceDeliverables,
  presentationStyles,
  ecommerceStyles,
  type OrderFormData
} from "./types";

interface OrderFormStepsProps {
  formData: OrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<OrderFormData>>;
  isEcommerce: boolean;
  isSubmitting: boolean;
  formError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const OrderFormSteps: React.FC<OrderFormStepsProps> = ({
  formData,
  setFormData,
  isEcommerce,
  isSubmitting,
  formError,
  onSubmit
}) => {
  const services = isEcommerce ? ecommerceServices : presentationServices;
  const activeScopeOptions = isEcommerce ? ecommerceCatalogRanges : slideRanges;
  const activeTimelineOptions = isEcommerce ? ecommerceTimelines : presentationTimelines;
  const activeFormatOptions = isEcommerce ? ecommerceDeliverables : presentationFormats;
  const activeStyleOptions = isEcommerce ? ecommerceStyles : presentationStyles;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {formError && (
        <div className="p-4 bg-red-50 border-2 border-red-500/40 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-sm">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Step 1: Project Scope */}
      <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
          <div className="w-8 h-8 rounded-xl bg-primary text-[#111111] font-black text-xs flex items-center justify-center">
            1
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#111111]">
              {isEcommerce ? "Store Scope & Catalog Specifications" : "Project Scope & Objectives"}
            </h3>
            <p className="text-xs text-[#726F6D] font-medium">
              {isEcommerce ? "What scale and architecture do you envision for your online store?" : "What type of presentation do you need crafted?"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <SlideBeeSelect
            label={isEcommerce ? "Ecommerce Package *" : "Primary Service *"}
            value={formData.service}
            onChange={(val) => setFormData({ ...formData, service: val })}
            options={services}
            name="service"
          />

          <SlideBeeSelect
            label={isEcommerce ? "Catalog Size / Estimated Products *" : "Estimated Slide Count *"}
            value={formData.slideCount}
            onChange={(val) => setFormData({ ...formData, slideCount: val })}
            options={activeScopeOptions}
            name="slideCount"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SlideBeeSelect
            label={isEcommerce ? "Target Launch Timeline *" : "Desired Delivery Timeline *"}
            value={formData.timeline}
            onChange={(val) => setFormData({ ...formData, timeline: val })}
            options={activeTimelineOptions}
            name="timeline"
          />

          <SlideBeeSelect
            label={isEcommerce ? "Architecture & Deliverables *" : "Deliverable Format *"}
            value={formData.format}
            onChange={(val) => setFormData({ ...formData, format: val })}
            options={activeFormatOptions}
            name="format"
          />
        </div>
      </div>

      {/* Step 2: Brand & Design Preferences */}
      <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
          <div className="w-8 h-8 rounded-xl bg-primary text-[#111111] font-black text-xs flex items-center justify-center">
            2
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#111111]">
              {isEcommerce ? "Storefront Aesthetics & Catalog Files" : "Design Style & Project Files"}
            </h3>
            <p className="text-xs text-[#726F6D] font-medium">
              {isEcommerce ? "Share your brand identity, visual style, and product catalog files." : "Share your visual preferences and existing draft materials."}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <SlideBeeSelect
            label={isEcommerce ? "Storefront Visual Aesthetic" : "Design & Visual Style"}
            value={formData.stylePreference}
            onChange={(val) => setFormData({ ...formData, stylePreference: val })}
            options={activeStyleOptions}
            name="stylePreference"
          />

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2 flex items-center justify-between">
              <span>{isEcommerce ? "Product Catalog & Brand Assets (Drive / Dropbox / Notion / CSV)" : "Draft Slides / Brand Asset Link (Google Drive / Dropbox)"}</span>
              <span className="text-[10px] text-[#726F6D] font-normal">Optional</span>
            </label>
            <div className="relative">
              <UploadCloud className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#726F6D]" />
              <input
                type="url"
                placeholder={isEcommerce ? "https://drive.google.com/drive/folders/... or Notion URL" : "https://drive.google.com/drive/folders/..."}
                value={formData.driveLink}
                onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#111111] placeholder-gray-400 font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
              {isEcommerce ? "Store Requirements, Payment Gateway & Target Audience *" : "Project Brief & Key Requirements *"}
            </label>
            <textarea
              required
              rows={4}
              placeholder={isEcommerce ? "Describe your product niche, payment gateways needed (Razorpay/Stripe), custom shipping rules, or reference stores you admire..." : "Describe your audience, key message, brand guidelines, or specific slides you want to emphasize..."}
              value={formData.projectNotes}
              onChange={(e) => setFormData({ ...formData, projectNotes: e.target.value })}
              className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl p-4 text-xs sm:text-sm text-[#111111] placeholder-gray-400 font-medium focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Contact & Proposal Delivery */}
      <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
          <div className="w-8 h-8 rounded-xl bg-primary text-[#111111] font-black text-xs flex items-center justify-center">
            3
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#111111]">
              {isEcommerce ? "Founder / Contact & Architecture Delivery" : "Contact & Proposal Delivery"}
            </h3>
            <p className="text-xs text-[#726F6D] font-medium">
              {isEcommerce ? "Where should we send your full-stack deployment plan and onboarding blueprint?" : "Where should we send the proposal and custom quote?"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2 text-left">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Singhania"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 min-h-[44px] text-base sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2 text-left">
              Work Email *
            </label>
            <input
              type="email"
              required
              placeholder="vikram@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 min-h-[44px] text-base sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2 text-left">
              Company / Organization
            </label>
            <input
              type="text"
              placeholder="e.g. Nexora Ventures"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 min-h-[44px] text-base sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2 text-left">
              Phone / WhatsApp Number * (Mandatory)
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 min-h-[44px] text-base sm:text-sm text-[#111111] font-medium focus:outline-hidden focus:border-primary"
            />
          </div>
        </div>

        {/* 50% Advance Notice Badge */}
        <div className="bg-[#FFF4D9] border-l-4 border-[#FCBF14] p-3.5 rounded-xl flex items-start gap-3 text-left shadow-xs mt-5">
          <ShieldCheck size={18} className="text-[#111111] shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-[#111111] block mb-0.5">
              50% Advance Deposit Required to Initiate Work
            </span>
            <span className="text-[#555555]">
              To allocate dedicated senior designers and full-stack engineers to your sprint, an initial 50% advance deposit is required upon scope approval.
            </span>
          </div>
        </div>
      </div>

      {/* Guarantees & Submit Button */}
      <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-xs text-[#726F6D] font-medium w-full md:w-auto text-left">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary-amber shrink-0" /> 100% Confidential & NDA Protected
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary-amber shrink-0" /> Guaranteed 2-Hour Response Time
          </div>
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-primary-amber shrink-0" /> {isEcommerce ? "Full Source Code Ownership & Edge Deployment" : "Unlimited Revisions & Editable Source Files"}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto min-h-[48px] bg-primary hover:bg-primary-dark text-[#111111] font-black px-10 py-4 rounded-full text-sm sm:text-base shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-70 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} /> {isEcommerce ? "Submitting Store Brief..." : "Submitting Project..."}
            </>
          ) : (
            <>
              <Send size={18} /> {isEcommerce ? "Submit Store Brief & Get Blueprint" : "Submit Project Request & Get Quote"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
