import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserX, X, Mail, Send, Loader2 } from "lucide-react";
import { d1 } from "../../../lib/d1";
import { sendProExpiredEmail, sendProExpiringSoonEmail } from "../../../lib/email";
import { useAdmin } from "../context/AdminContext";

interface RevokeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSub: any;
}

export const RevokeProModal: React.FC<RevokeProModalProps> = ({
  isOpen,
  onClose,
  targetSub,
}) => {
  const { fetchDashboardData } = useAdmin();
  const [revokeNoticeType, setRevokeNoticeType] = useState<"immediate" | "one_week_warning">("immediate");
  const [sendEmail, setSendEmail] = useState(true);
  const [emailSender, setEmailSender] = useState("design@theslidebee.com");
  const [emailSubject, setEmailSubject] = useState("Your SlideBee Pro Membership Has Concluded");
  const [emailCustomMessage, setEmailCustomMessage] = useState(
    "We are writing to inform you that your SlideBee Pro Studio Membership has concluded and your account has safely transitioned to our standard Free Tier. All master presentation templates you previously downloaded remain available in your account library with perpetual commercial rights."
  );
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (targetSub) {
      setRevokeNoticeType("immediate");
      setSendEmail(true);
      setEmailSubject("Your SlideBee Pro Membership Has Concluded");
      setEmailCustomMessage(
        "We are writing to inform you that your SlideBee Pro Studio Membership has concluded and your account has safely transitioned to our standard Free Tier. All master presentation templates you previously downloaded remain available in your account library with perpetual commercial rights."
      );
    }
  }, [targetSub]);

  if (!isOpen || !targetSub) return null;

  const handleExecuteRevokePro = async () => {
    setIsProcessing(true);
    try {
      if (revokeNoticeType === "immediate") {
        const { error } = await d1.from("subscriptions").update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("id", targetSub.subId || targetSub.id);

        if (error) throw error;

        if (sendEmail) {
          try {
            await sendProExpiredEmail({
              clientEmail: targetSub.clientEmail || targetSub.user_email,
              clientName: targetSub.clientName || targetSub.user_email?.split("@")[0],
              expiryDate: new Date().toISOString(),
              senderEmail: emailSender,
              subject: emailSubject,
              customMessage: emailCustomMessage,
            });
          } catch (mErr) {
            console.warn("Revocation notice dispatch note:", mErr);
          }
        }
      } else {
        // 1-Week courtesy reminder
        if (sendEmail) {
          try {
            const daysRemaining = 7;
            const remainingQuota = Math.max(0, (targetSub.slidesLimit || 30) - (targetSub.slidesUsed || 0));
            await sendProExpiringSoonEmail({
              clientEmail: targetSub.clientEmail || targetSub.user_email,
              clientName: targetSub.clientName || targetSub.user_email?.split("@")[0],
              daysRemaining,
              expiryDate: targetSub.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              remainingQuota,
              senderEmail: emailSender,
              subject: emailSubject,
              customMessage: emailCustomMessage,
            });
          } catch (mErr) {
            console.warn("1-week reminder notice dispatch note:", mErr);
          }
        }
      }

      await fetchDashboardData();
      onClose();
    } catch (err: any) {
      console.error("Failed to process Pro revocation action:", err);
      alert(`Failed to process Pro revocation: ${err?.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#111111]/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-800">
                <UserX size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-[#111111]">
                  Revoke Pro Membership & Notice
                </h3>
                <p className="text-xs text-[#726F6D]">
                  Transition client account to standard Free Tier with customized email dispatch
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2-Column Square Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Column 1: Target Account Info & Action Mode */}
            <div className="space-y-4">
              <div className="bg-[#FFF9E8] border border-amber-300/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#111111]">
                    {targetSub.clientName || targetSub.user_email}
                  </span>
                  <span className="hex-pill-sm bg-amber-200/80 text-amber-950 font-black text-[10px] px-2 py-0.5">
                    Pro Active
                  </span>
                </div>
                <div className="text-[11px] text-[#726F6D] flex items-center justify-between">
                  <span>{targetSub.clientEmail || targetSub.user_email}</span>
                  <span className="font-bold text-[#111111]">
                    {Math.max(0, (targetSub.slidesLimit || 30) - (targetSub.slidesUsed || 0))} Quota Left
                  </span>
                </div>
                {targetSub.expiryDate && (
                  <div className="text-[10px] text-amber-900 font-medium pt-1 border-t border-amber-200">
                    Cycle Ends: {new Date(targetSub.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </div>

              {/* Action Mode Radio */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#111111] uppercase tracking-wider">
                  Revocation Timing & Mode
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      revokeNoticeType === "immediate"
                        ? "bg-amber-50/80 border-amber-400 shadow-xs"
                        : "bg-white border-[#111111]/12 hover:border-[#111111]/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="revokeMode"
                      checked={revokeNoticeType === "immediate"}
                      onChange={() => {
                        setRevokeNoticeType("immediate");
                        setEmailSubject("Your SlideBee Pro Membership Has Concluded");
                        setEmailCustomMessage(
                          "We are writing to inform you that your SlideBee Pro Studio Membership has concluded and your account has safely transitioned to our standard Free Tier. All master presentation templates you previously downloaded remain available in your account library with perpetual commercial rights."
                        );
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-black text-xs text-[#111111] block">
                        Revoke Immediately
                      </span>
                      <span className="text-[11px] text-[#726F6D]">
                        Cancels Pro access right now and sends the "Subscription Ended" notice.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      revokeNoticeType === "one_week_warning"
                        ? "bg-amber-50/80 border-amber-400 shadow-xs"
                        : "bg-white border-[#111111]/12 hover:border-[#111111]/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="revokeMode"
                      checked={revokeNoticeType === "one_week_warning"}
                      onChange={() => {
                        setRevokeNoticeType("one_week_warning");
                        setEmailSubject("Reminder: Your SlideBee Pro Membership Expires in 7 Days");
                        setEmailCustomMessage(
                          "This is a courtesy notification that your SlideBee Pro Studio Membership is concluding in 7 days. Be sure to download any remaining templates from your monthly quota before your cycle ends."
                        );
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-black text-xs text-[#111111] block">
                        Send 1-Week Warning Notice First
                      </span>
                      <span className="text-[11px] text-[#726F6D]">
                        Keeps Pro active and sends a 7-day expiration reminder notice to allow final downloads.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Toggle Dispatch Email */}
              <div className="pt-2 border-t border-[#111111]/10">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-xs font-bold text-[#111111]">
                    Send In-Browser Email Notice to Client
                  </span>
                </label>
                <p className="text-[10px] text-[#726F6D] mt-1 pl-6">
                  Dispatches official notification directly to {targetSub.clientEmail || targetSub.user_email} via Resend.
                </p>
              </div>
            </div>

            {/* Column 2: In-Browser Email Notice Customization */}
            <div className="space-y-3.5 bg-gray-50/80 p-4 rounded-xl border border-[#111111]/10 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#111111]/8 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <Mail size={13} className="text-primary-amber" /> In-Browser Mail Composer
                  </span>
                  <span className="text-[10px] font-extrabold text-[#726F6D]">
                    {revokeNoticeType === "immediate" ? "Subscription Ended" : "1-Week Reminder"}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1">
                    From (Sender)
                  </label>
                  <select
                    value={emailSender}
                    onChange={(e) => setEmailSender(e.target.value)}
                    disabled={!sendEmail}
                    className="w-full bg-white border border-[#111111]/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111] font-bold outline-none disabled:opacity-50"
                  >
                    <option value="design@theslidebee.com">design@theslidebee.com (Design Studio)</option>
                    <option value="support@theslidebee.com">support@theslidebee.com (Studio Support)</option>
                    <option value="billing@theslidebee.com">billing@theslidebee.com (Accounts & Billing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    disabled={!sendEmail}
                    className="w-full bg-white border border-[#111111]/15 rounded-lg px-3 py-1.5 text-xs text-[#111111] font-medium outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#111111] uppercase tracking-wider mb-1">
                    Personal Note / Explanation (Appears in Email)
                  </label>
                  <textarea
                    rows={4}
                    value={emailCustomMessage}
                    onChange={(e) => setEmailCustomMessage(e.target.value)}
                    disabled={!sendEmail}
                    placeholder="Add an optional personal message from the studio desk..."
                    className="w-full bg-white border border-[#111111]/15 rounded-lg p-2.5 text-xs text-[#111111] font-medium outline-none resize-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="text-[10px] text-[#726F6D] bg-white p-2 rounded border border-[#111111]/8">
                Wrapped inside SlideBee's luxury cream HTML email layout with official studio branding and direct renewal link.
              </div>
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#111111]/10">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="hex-pill px-4 py-2.5 text-xs font-bold text-[#726F6D] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecuteRevokePro}
              className="hex-pill bg-amber-500 hover:bg-amber-600 text-black font-black px-5 py-2.5 text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Processing Action...
                </>
              ) : revokeNoticeType === "immediate" ? (
                <>
                  <UserX size={14} /> Revoke Pro & Dispatch Notice
                </>
              ) : (
                <>
                  <Send size={14} /> Dispatch 1-Week Notice
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
