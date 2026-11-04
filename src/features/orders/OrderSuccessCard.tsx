import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { OrderFormData } from "./types";

interface OrderSuccessCardProps {
  orderId: string;
  formData: OrderFormData;
  isEcommerce: boolean;
  onReset: () => void;
}

export const OrderSuccessCard: React.FC<OrderSuccessCardProps> = ({
  orderId,
  formData,
  isEcommerce,
  onReset
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border-2 border-primary rounded-3xl p-8 md:p-12 shadow-2xl text-center"
    >
      <div className="w-20 h-20 bg-primary/20 text-primary-amber rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={44} />
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-primary-amber bg-[#FFF9E8] px-4 py-1 rounded-full border border-primary/20">
        Project Reference: {orderId}
      </span>

      <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] mt-4 mb-3">
        {isEcommerce ? "Ecommerce Project Scope Received" : "Project Request Received"}
      </h2>

      <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-lg mx-auto mb-8 leading-relaxed">
        {isEcommerce ? (
          <>
            Thank you, <strong className="text-[#111111]">{formData.name}</strong>. We've queued your store development for <strong>{formData.service}</strong>. A dedicated full-stack engineering lead has been assigned and will email you at <strong className="text-[#111111]">{formData.email}</strong> with your architecture roadmap shortly.
          </>
        ) : (
          <>
            Thank you, <strong className="text-[#111111]">{formData.name}</strong>. We've queued your project for <strong>{formData.service}</strong>. A designated presentation lead has been assigned and will email you at <strong className="text-[#111111]">{formData.email}</strong> shortly.
          </>
        )}
      </p>

      <div className="bg-[#FFF9E8] border border-[#111111]/5 rounded-2xl p-6 text-left max-w-lg mx-auto mb-8 space-y-2.5 text-xs text-[#111111]">
        <div className="flex justify-between border-b border-[#111111]/5 pb-2">
          <span className="text-[#726F6D]">Service:</span>
          <span className="font-bold">{formData.service}</span>
        </div>
        <div className="flex justify-between border-b border-[#111111]/5 pb-2">
          <span className="text-[#726F6D]">{isEcommerce ? "Catalog Scale:" : "Scope:"}</span>
          <span className="font-bold">{formData.slideCount}</span>
        </div>
        <div className="flex justify-between border-b border-[#111111]/5 pb-2">
          <span className="text-[#726F6D]">Timeline:</span>
          <span className="font-bold">{formData.timeline}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#726F6D]">Deliverable:</span>
          <span className="font-bold">{formData.format}</span>
        </div>
      </div>

      <div className="bg-[#FCBF14]/15 border-2 border-[#FCBF14] rounded-2xl p-4 text-center max-w-lg mx-auto mb-6">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#111111] block mb-1">
          {isEcommerce ? "Live Sprint & Deployment Tracking Active" : "Live SLA & Milestone Tracking Active"}
        </span>
        <p className="text-xs text-[#111111]/85 font-medium">
          {isEcommerce
            ? "Your order is linked to your email. Sign in to your client portal to monitor development sprint milestones, preview staging builds, and manage DNS/payment keys."
            : "Your order is linked to your email. Sign in to your client portal to monitor design milestones, request revisions, and download your deliverables."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/login?email=${encodeURIComponent(formData.email.trim())}&orderRef=${orderId}&name=${encodeURIComponent(formData.name.trim())}&action=track_sla`}
          className="bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-1.5"
        >
          Track Live SLA in Client Portal <ArrowRight size={14} />
        </Link>
        <Link
          to="/"
          className="bg-white hover:bg-gray-50 text-[#111111] font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm border border-[#111111]/15 transition-all inline-flex items-center justify-center gap-1.5"
        >
          Return to Homepage
        </Link>
        <button
          onClick={onReset}
          className="bg-[#FFF9E8] hover:bg-primary/20 text-[#111111] font-bold px-6 py-3.5 rounded-full text-xs border border-[#111111]/10 transition-all cursor-pointer"
        >
          Submit Another Project
        </button>
      </div>
    </motion.div>
  );
};
