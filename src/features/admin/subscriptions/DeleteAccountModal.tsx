import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle, Mail, Loader2 } from "lucide-react";
import { d1 } from "../../../lib/d1";
import { sendAccountDeletionEmail } from "../../../lib/email";
import { useAdmin } from "../context/AdminContext";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClient: any;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  targetClient,
}) => {
  const { session, fetchDashboardData } = useAdmin();
  const [deleteReason, setDeleteReason] = useState("Client requested account closure");
  const [customReason, setCustomReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [emailSender, setEmailSender] = useState("support@theslidebee.com");
  const [emailSubject, setEmailSubject] = useState(
    `Account Closure & Data Privacy Confirmation — SlideBee Studio`
  );
  const [emailBody, setEmailBody] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (targetClient) {
      const clientName = targetClient.name || targetClient.full_name || targetClient.email?.split("@")[0] || "Valued Client";
      const defaultReason = "Client requested account closure";
      setDeleteReason(defaultReason);
      setCustomReason("");
      setEmailSubject(`Account Closure & Data Privacy Confirmation — SlideBee Studio`);
      setEmailBody(
`Dear ${clientName},

This email confirms that your SlideBee client account associated with ${targetClient.email} has been closed and purged from our active platform.

Reason for Account Closure:
${defaultReason}

In compliance with our data governance standards and mutual NDA commitments, your profile data, session credentials, and associated subscriptions have been permanently removed.

If this action was taken in error or if you wish to commission executive presentations in the future, you may register a new account anytime at theslidebee.com.

Sincerely,
SlideBee Executive Operations Desk
support@theslidebee.com`
      );
    }
  }, [targetClient]);

  if (!isOpen || !targetClient) return null;

  const handleExecuteDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const finalReason = customReason.trim() || deleteReason;

      // 1. Call server function /api/delete-account
      try {
        await fetch("/api/delete-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
            ...(localStorage.getItem("slidebee_admin_key") ? { "x-slidebee-admin-key": localStorage.getItem("slidebee_admin_key")! } : {}),
          },
          body: JSON.stringify({
            targetEmail: targetClient.email,
            targetUserId: targetClient.id,
            reason: finalReason,
            sendNotice: sendEmail,
            subject: emailSubject,
            senderEmail: emailSender,
            clientName: targetClient.name || targetClient.full_name,
          }),
        });
      } catch (apiErr) {
        console.warn("Server delete-account call notice:", apiErr);
      }

      // 2. Direct D1 deletion guarantee
      await d1.from("subscriptions").delete().eq("user_email", targetClient.email);
      if (targetClient.id) {
        await d1.from("profiles").delete().eq("id", targetClient.id);
        await d1.from("users").delete().eq("id", targetClient.id);
      }
      await d1.from("users").delete().eq("email", targetClient.email);

      // 3. Fallback direct email dispatch if sendEmail is checked
      if (sendEmail) {
        try {
          await sendAccountDeletionEmail({
            clientEmail: targetClient.email,
            clientName: targetClient.name || targetClient.full_name || targetClient.email.split("@")[0],
            reason: finalReason,
            customNotes: emailBody,
            senderEmail: emailSender,
            subject: emailSubject,
          });
        } catch (mailErr) {
          console.warn("Direct deletion email notice:", mailErr);
        }
      }

      await fetchDashboardData();
      onClose();
    } catch (err: any) {
      console.error("Failed to delete account:", err);
      alert(`Failed to delete account: ${err?.message || err}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border-2 border-red-200 rounded-2xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-red-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-red-700">
                  Delete Client Account & Notice
                </h3>
                <p className="text-xs text-[#726F6D]">
                  Permanently purge client account from database with customized notice
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Column 1: Client Info & Reason */}
            <div className="space-y-4">
              <div className="bg-red-50/70 border border-red-200 rounded-lg p-3.5 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-red-900 block">
                    {targetClient.name || targetClient.full_name}
                  </span>
                  <span className="font-bold text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    {targetClient.isPro ? "Pro Member" : "Free Tier"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-red-700">
                  <span>{targetClient.email}</span>
                  <span className="font-bold">{targetClient.isPro ? "VIP Tier" : "Free Tier"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-1.5">
                    Select Deletion Reason *
                  </label>
                  <select
                    value={deleteReason}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setDeleteReason(selected);
                      const finalR = selected === "Other custom administrative reason" ? customReason : selected;
                      const clientName = targetClient.name || targetClient.full_name || "Valued Client";
                      setEmailBody(
`Dear ${clientName},

This email confirms that your SlideBee client account associated with ${targetClient.email} has been formally closed and purged from our active platform.

Reason for Account Closure:
${finalR || selected}

In compliance with our data governance standards and mutual NDA commitments, your profile records, session credentials, and associated subscriptions have been permanently removed.

If this action was taken in error or if you wish to commission executive presentations in the future, you may register a new account anytime at theslidebee.com.

Sincerely,
SlideBee Executive Operations Desk
support@theslidebee.com`
                      );
                    }}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#111111] font-bold focus:border-primary outline-none"
                  >
                    <option value="Client requested account closure">Client requested account closure</option>
                    <option value="Duplicate or test account purge">Duplicate or test account purge</option>
                    <option value="Inactivity & offboarding">Inactivity & client offboarding</option>
                    <option value="Terms of service violation / inappropriate use">Terms of service violation / inappropriate use</option>
                    <option value="GDPR / data erasure compliance request">GDPR / data erasure compliance request</option>
                    <option value="Other custom administrative reason">Other custom administrative reason</option>
                  </select>
                </div>

                {deleteReason === "Other custom administrative reason" && (
                  <div>
                    <label className="block text-xs font-extrabold text-[#111111] uppercase tracking-wider mb-1">
                      Specify Custom Reason:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Migration to corporate parent contract..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-lg px-3.5 py-2 text-xs text-[#111111] font-bold focus:border-primary outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="bg-red-50/50 border border-red-200/80 rounded-lg p-3 space-y-1.5 text-red-900">
                <span className="text-[11px] font-black uppercase tracking-wider block flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-red-600" /> Irreversible Action
                </span>
                <p className="text-[10px] text-red-700 leading-relaxed">
                  Purging this account will permanently delete the client's profile from the database, wipe all authentication sessions, and cancel any active subscription tier.
                </p>
              </div>
            </div>

            {/* Column 2: IN-BROWSER MAIL COMPOSER */}
            <div className="bg-[#FFF9E8] border-2 border-primary/40 rounded-lg p-4 space-y-3 shadow-inner flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-primary-amber" />
                    <span className="text-xs font-heading font-black text-[#111111]">
                      In-Browser Deletion Notice Email Composer
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-3.5 h-3.5 text-primary rounded accent-[#FCBF14] cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-[#111111]">
                      Dispatch Email
                    </span>
                  </label>
                </div>

                {sendEmail ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-[#726F6D] mb-1">
                          From (Studio Sender):
                        </label>
                        <select
                          value={emailSender}
                          onChange={(e) => setEmailSender(e.target.value)}
                          className="w-full bg-white border border-[#111111]/15 rounded-lg px-2.5 py-1.5 text-[11px] text-[#111111] font-bold focus:border-primary outline-none"
                        >
                          <option value="support@theslidebee.com">support@theslidebee.com (Privacy & Support)</option>
                          <option value="hello@theslidebee.com">hello@theslidebee.com (General Operations)</option>
                          <option value="design@theslidebee.com">design@theslidebee.com (Design Studio)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-[#726F6D] mb-1">
                          To (Client Recipient):
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={targetClient.email}
                          className="w-full bg-black/5 border border-[#111111]/15 rounded-lg px-2.5 py-1.5 text-[11px] text-[#111111] font-bold cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#726F6D] mb-1">
                        Email Subject:
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full bg-white border border-[#111111]/15 rounded-lg px-2.5 py-1.5 text-[11px] text-[#111111] font-bold focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-[#726F6D] mb-1">
                        Editable Message Body:
                      </label>
                      <textarea
                        rows={5}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full bg-white border border-[#111111]/15 rounded-lg p-2.5 text-xs text-[#111111] font-mono leading-relaxed focus:border-primary outline-none resize-y"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/70 border border-primary/20 rounded-lg text-center text-xs text-[#726F6D]">
                    Email notification disabled. The account will be deleted silently.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-red-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#726F6D] hover:text-[#111111] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleExecuteDeleteAccount}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-2.5 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Purging Account & Dispatching Notice...
                </>
              ) : (
                <>
                  <Trash2 size={14} /> Permanently Delete Account & Send Notice
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
