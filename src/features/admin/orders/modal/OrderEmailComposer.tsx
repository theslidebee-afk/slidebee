import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, FileText, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

interface OrderEmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  clientEmail: string;
  sender: string;
  onSenderChange: (s: string) => void;
  subject: string;
  onSubjectChange: (s: string) => void;
  body: string;
  onBodyChange: (b: string) => void;
  orderDeliverableFile: { name: string; size: string; base64: string } | null;
  status: { type: "success" | "error"; message: string } | null;
  isSending: boolean;
  onApplyTemplate: (type: "milestone" | "assets" | "ready" | "deliverable") => void;
  onSendEmail: () => void;
}

export const OrderEmailComposer: React.FC<OrderEmailComposerProps> = ({
  isOpen,
  onClose,
  clientEmail,
  sender,
  onSenderChange,
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  orderDeliverableFile,
  status,
  isSending,
  onApplyTemplate,
  onSendEmail
}) => {
  const [copiedEmailSuccess, setCopiedEmailSuccess] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden text-left"
        >
          <div className="bg-[#FFF9E8] border-2 border-primary/40 rounded-xl p-4 sm:p-5 shadow-inner space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/30 flex items-center justify-center text-[#111111]">
                  <Mail size={15} />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xs text-[#111111]">
                    Studio Email Dispatcher
                  </h4>
                  <p className="text-[10px] text-[#726F6D] font-medium">
                    Direct Resend/Zoho mail router with 0 browser redirects
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-gray-500 hover:text-[#111111] hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* 1-Click Templates */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block mb-1">
                1-Click Studio Templates:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onApplyTemplate("deliverable")}
                  className="rounded-lg text-[11px] font-extrabold px-3 py-1 bg-amber-100/90 border border-primary/60 hover:bg-primary text-[#111111] transition-all cursor-pointer flex items-center gap-1"
                >
                  <FileText size={11} /> Master Deliverable
                </button>
                <button
                  type="button"
                  onClick={() => onApplyTemplate("milestone")}
                  className="rounded-lg text-[11px] font-extrabold px-3 py-1 bg-white border border-primary/40 hover:bg-primary/20 text-[#111111] transition-all cursor-pointer"
                >
                  Milestone Update
                </button>
                <button
                  type="button"
                  onClick={() => onApplyTemplate("assets")}
                  className="rounded-lg text-[11px] font-extrabold px-3 py-1 bg-white border border-primary/40 hover:bg-primary/20 text-[#111111] transition-all cursor-pointer"
                >
                  Request Assets
                </button>
                <button
                  type="button"
                  onClick={() => onApplyTemplate("ready")}
                  className="rounded-lg text-[11px] font-extrabold px-3 py-1 bg-white border border-primary/40 hover:bg-primary/20 text-[#111111] transition-all cursor-pointer"
                >
                  Draft Ready
                </button>
              </div>
            </div>

            {/* Sender & Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block mb-1">
                  From (Studio Sender):
                </label>
                <select
                  value={sender}
                  onChange={(e) => onSenderChange(e.target.value)}
                  className="w-full bg-white border border-[#111111]/20 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#111111] focus:outline-none focus:border-primary"
                >
                  <option value="design@theslidebee.com">design@theslidebee.com (Design Studio)</option>
                  <option value="support@theslidebee.com">support@theslidebee.com (Client Support)</option>
                  <option value="hello@theslidebee.com">hello@theslidebee.com (General Desk)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block mb-1">
                  To (Client Recipient):
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={clientEmail}
                    readOnly
                    className="w-full bg-black/5 border border-[#111111]/15 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#111111] cursor-not-allowed pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(clientEmail);
                      setCopiedEmailSuccess(true);
                      setTimeout(() => setCopiedEmailSuccess(false), 2000);
                    }}
                    className="absolute right-1 top-1 rounded px-2 py-0.5 text-[10px] font-black bg-white border border-gray-200 hover:border-[#111111] text-[#111111] cursor-pointer"
                  >
                    {copiedEmailSuccess ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block mb-1">
                Email Subject:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder="e.g. SlideBee Milestone Update: Executive Pitch Deck"
                className="w-full bg-white border border-[#111111]/20 rounded-lg px-3 py-1.5 text-xs font-bold text-[#111111] focus:outline-none focus:border-primary"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block mb-1">
                Message Body:
              </label>
              <textarea
                rows={4}
                value={body}
                onChange={(e) => onBodyChange(e.target.value)}
                placeholder="Type your message to the client..."
                className="w-full bg-white border border-[#111111]/20 rounded-lg p-2.5 text-xs font-medium text-[#111111] focus:outline-none focus:border-primary leading-relaxed resize-y"
              />
            </div>

            {/* Attached Deliverable Notice */}
            {orderDeliverableFile && (
              <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-primary/30 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary-amber" />
                  <span className="font-extrabold text-[#111111]">
                    Attached Master File: {orderDeliverableFile.name} ({orderDeliverableFile.size})
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Attached
                </span>
              </div>
            )}

            {/* Feedback status banner */}
            {status && (
              <div
                className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle size={15} className="text-red-600 shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            {/* Dispatch Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-primary/20">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg text-xs font-bold px-3.5 py-1.5 border border-[#111111]/20 hover:border-[#111111] text-[#111111] cursor-pointer"
              >
                Close Composer
              </button>

              <button
                type="button"
                disabled={isSending || !subject.trim() || !body.trim()}
                onClick={onSendEmail}
                className="rounded-lg bg-[#111111] hover:bg-primary text-white hover:text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Dispatched...
                  </>
                ) : (
                  <>
                    <Send size={13} /> Send Official Dispatch
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
