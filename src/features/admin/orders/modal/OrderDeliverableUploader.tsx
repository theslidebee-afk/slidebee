import React from "react";
import { FileText, CheckCircle2, UploadCloud, Check, Trash2, Mail, Send, Loader2 } from "lucide-react";

interface OrderDeliverableUploaderProps {
  deliverableSentAt?: string;
  status: string;
  deliverableName?: string;
  clientEmail: string;
  orderDeliverableFile: { name: string; size: string; base64: string } | null;
  onDeliverableFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveDeliverableFile: () => void;
  deliverableSuccessMsg: string;
  isSendingDeliverableEmail: boolean;
  onOpenEmailComposer: () => void;
  onSendDeliverableEmail: () => void;
}

export const OrderDeliverableUploader: React.FC<OrderDeliverableUploaderProps> = ({
  deliverableSentAt,
  status,
  deliverableName,
  clientEmail,
  orderDeliverableFile,
  onDeliverableFileChange,
  onRemoveDeliverableFile,
  deliverableSuccessMsg,
  isSendingDeliverableEmail,
  onOpenEmailComposer,
  onSendDeliverableEmail
}) => {
  const isDispatched = deliverableSentAt || (status === "completed" && deliverableName);

  return (
    <div className="bg-[#FFFDF5] border-2 border-primary/40 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary-amber" />
          <h4 className="font-heading font-extrabold text-xs text-[#111111]">
            Master Presentation Deliverable (.pptx / .zip)
          </h4>
        </div>
        {isDispatched ? (
          <span className="hex-pill-sm bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-600" /> Dispatched to Client Email
          </span>
        ) : (
          <span className="hex-pill-sm bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 border border-amber-300">
            Confidential • Email Delivery Only
          </span>
        )}
      </div>

      <p className="text-[11px] text-[#726F6D] leading-relaxed">
        Commissioned presentations are confidential and are never uploaded to public cloud storage (R2). Attach the final PowerPoint presentation file directly below to securely deliver it to <strong>{clientEmail}</strong> via verified studio email.
      </p>

      {/* File Attachment Dropzone / Card */}
      {!orderDeliverableFile ? (
        <div className="border-2 border-dashed border-primary/40 hover:border-primary rounded-xl p-4 bg-white/70 hover:bg-white transition-all text-center">
          <input
            type="file"
            id="deliverable-file-input"
            accept=".pptx,.ppt,.zip,.pdf,.key"
            onChange={onDeliverableFileChange}
            className="hidden"
          />
          <label
            htmlFor="deliverable-file-input"
            className="flex flex-col items-center justify-center gap-1.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary-dark">
              <UploadCloud size={20} />
            </div>
            <span className="text-xs font-black text-[#111111]">
              Attach Master Presentation (.pptx, .ppt, .zip)
            </span>
            <span className="text-[10px] text-[#726F6D]">
              Maximum 40MB • Encrypted direct email attachment
            </span>
          </label>

          {deliverableName && (
            <div className="mt-3 pt-2.5 border-t border-primary/20 text-[11px] text-[#726F6D] flex items-center justify-center gap-1.5">
              <Check size={12} className="text-emerald-600" />
              <span>Last dispatched deck: <strong className="text-[#111111]">{deliverableName}</strong></span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-primary/50 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#FCBF14] flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-xs font-black text-[#111111] break-all">
                {orderDeliverableFile.name}
              </div>
              <div className="text-[10px] text-[#726F6D] font-bold flex items-center gap-2">
                <span>{orderDeliverableFile.size}</span>
                <span>•</span>
                <span className="text-emerald-700 font-black">Ready to dispatch via email</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoveDeliverableFile}
            className="hex-pill-sm self-end sm:self-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-1 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={11} /> Remove
          </button>
        </div>
      )}

      {deliverableSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{deliverableSuccessMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-primary/20">
        <button
          type="button"
          onClick={onOpenEmailComposer}
          className="hex-pill-sm bg-white border border-[#111111]/20 hover:border-primary text-[#111111] font-bold text-xs px-3.5 py-1.5 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Mail size={12} />
          <span>Review & Customize Email</span>
        </button>

        <button
          type="button"
          disabled={isSendingDeliverableEmail || !orderDeliverableFile}
          onClick={onSendDeliverableEmail}
          className="hex-pill bg-[#111111] hover:bg-primary text-white hover:text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingDeliverableEmail ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Sending Deliverable Email...</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>Send Deliverable via Email & Mark Completed</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
