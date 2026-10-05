import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Building, MessageSquare, ExternalLink, Trash2 } from "lucide-react";

export interface InquiryItem {
  id: string | number;
  orderReference?: string;
  sourceType: "order_inquiry" | "contact_message" | "waitlist";
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  serviceType: string;
  subject?: string;
  projectBrief: string;
  stylePreference?: string;
  createdAt: string;
  status: "new" | "quoted" | "followed_up" | "converted" | "archived";
}

interface InquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryItem | null;
  onUpdateStatus: (id: string | number, nextStatus: InquiryItem["status"]) => Promise<void>;
  onDeleteInquiry: (id: string | number, sourceType: string) => Promise<void>;
}

export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onUpdateStatus,
  onDeleteInquiry
}) => {
  if (!isOpen || !inquiry) return null;

  const mailtoSubject = encodeURIComponent(`Re: [SlideBee Quote Inquiry] ${inquiry.subject || inquiry.serviceType}`);
  const mailtoBody = encodeURIComponent(
    `Hi ${inquiry.fullName},\n\nThank you for reaching out to SlideBee Studio regarding your ${inquiry.serviceType} project.\n\n`
  );
  const mailtoHref = `mailto:${inquiry.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border-2 border-[#111111]/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-6 text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#111111]/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#FCBF14] text-[#111111] px-2.5 py-0.5 rounded-full">
                  {inquiry.orderReference || "INBOUND LEAD"}
                </span>
                <span className="text-xs text-[#726F6D] font-mono">
                  {new Date(inquiry.createdAt).toLocaleString()}
                </span>
              </div>
              <h3 className="text-xl font-heading font-extrabold text-[#111111]">
                {inquiry.fullName}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-[#111111] transition-colors cursor-pointer rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Contact Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FFF9E8] p-4 rounded-2xl border border-primary/25">
            <div className="flex items-center gap-2.5 text-xs text-[#111111]">
              <Mail size={15} className="text-primary-amber shrink-0" />
              <a href={`mailto:${inquiry.email}`} className="font-bold hover:underline truncate">
                {inquiry.email}
              </a>
            </div>
            {inquiry.phone && (
              <div className="flex items-center gap-2.5 text-xs text-[#111111]">
                <Phone size={15} className="text-primary-amber shrink-0" />
                <a href={`tel:${inquiry.phone}`} className="font-bold hover:underline">
                  {inquiry.phone}
                </a>
              </div>
            )}
            {inquiry.company && (
              <div className="flex items-center gap-2.5 text-xs text-[#111111]">
                <Building size={15} className="text-primary-amber shrink-0" />
                <span className="font-bold">{inquiry.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-xs text-[#111111]">
              <MessageSquare size={15} className="text-primary-amber shrink-0" />
              <span className="font-bold">{inquiry.serviceType}</span>
            </div>
          </div>

          {/* Message Brief */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[#726F6D] block">
              Inbound Project Brief & Message
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm text-[#111111] leading-relaxed whitespace-pre-wrap font-medium">
              {inquiry.projectBrief || "No brief details provided."}
            </div>
          </div>

          {/* Status Switcher & Pipeline */}
          <div className="space-y-2 pt-2 border-t border-[#111111]/10">
            <label className="text-xs font-black uppercase tracking-wider text-[#726F6D] block">
              Lead Pipeline Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {(["new", "quoted", "followed_up", "converted", "archived"] as const).map((st) => {
                const isActive = inquiry.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(inquiry.id, st)}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#111111] text-[#FCBF14] border-[#111111] shadow-xs"
                        : "bg-white text-[#726F6D] border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {st === "new" && "New Lead"}
                    {st === "quoted" && "Quote Sent"}
                    {st === "followed_up" && "Followed Up"}
                    {st === "converted" && "Converted / Won"}
                    {st === "archived" && "Archived"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#111111]/10">
            <button
              type="button"
              onClick={() => onDeleteInquiry(inquiry.id, inquiry.sourceType)}
              className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} /> Discard Lead
            </button>

            <a
              href={mailtoHref}
              className="hex-pill bg-[#FCBF14] hover:bg-[#FFE270] text-[#111111] font-black px-5 py-2.5 text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Mail size={14} /> Reply via Email <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
