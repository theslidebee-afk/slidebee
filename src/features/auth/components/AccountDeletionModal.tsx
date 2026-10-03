import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2, Trash2 } from "lucide-react";

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  clientDeleteReason: string;
  setClientDeleteReason: (reason: string) => void;
  clientDeleteCustomReason: string;
  setClientDeleteCustomReason: (reason: string) => void;
  clientDeleteComments: string;
  setClientDeleteComments: (comments: string) => void;
  clientDeleteConfirmation: string;
  setClientDeleteConfirmation: (val: string) => void;
  isDeleting: boolean;
  onConfirmDelete: () => Promise<void>;
}

export function AccountDeletionModal({
  isOpen,
  onClose,
  currentUserEmail,
  clientDeleteReason,
  setClientDeleteReason,
  clientDeleteCustomReason,
  setClientDeleteCustomReason,
  clientDeleteComments,
  setClientDeleteComments,
  clientDeleteConfirmation,
  setClientDeleteConfirmation,
  isDeleting,
  onConfirmDelete,
}: AccountDeletionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="hex-card-lg bg-white border border-red-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm text-red-700">
                    Delete SlideBee Account
                  </h3>
                  <p className="text-[11px] text-[#726F6D]">
                    Permanent removal of account and download entitlements
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-[#111111] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 leading-relaxed">
              <strong>Warning:</strong> Deleting your account will immediately forfeit your account tier benefits, template download quotas, and revoke portal access. An official confirmation will be dispatched to <strong>{currentUserEmail}</strong>.
            </div>

            {/* Reason for Deletion */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Why are you deleting your account? *
                </label>
                <select
                  value={clientDeleteReason}
                  onChange={(e) => setClientDeleteReason(e.target.value)}
                  className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl px-3 py-2 text-xs text-[#111111] font-bold focus:border-primary outline-none"
                >
                  <option value="My presentation project is complete">My presentation project is complete</option>
                  <option value="Switching to alternative design workflow">Switching to alternative design workflow</option>
                  <option value="Need to change or update primary email">Need to change or update primary email</option>
                  <option value="Privacy / GDPR data erasure request">Privacy / GDPR data erasure request</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              {clientDeleteReason === "Other reason" && (
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">
                    Specify Reason:
                  </label>
                  <input
                    type="text"
                    value={clientDeleteCustomReason}
                    onChange={(e) => setClientDeleteCustomReason(e.target.value)}
                    placeholder="Briefly describe..."
                    className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl px-3 py-2 text-xs text-[#111111] font-medium focus:border-primary outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1">
                  Optional Feedback / Notes for our Team:
                </label>
                <textarea
                  rows={2}
                  value={clientDeleteComments}
                  onChange={(e) => setClientDeleteComments(e.target.value)}
                  placeholder="Any suggestions or feedback on your experience?"
                  className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl p-2.5 text-xs text-[#111111] font-medium focus:border-primary outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 mb-1">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={clientDeleteConfirmation}
                  onChange={(e) => setClientDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-red-900 focus:border-red-600 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-bold text-[#726F6D] hover:text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || clientDeleteConfirmation.trim().toUpperCase() !== "DELETE"}
                onClick={onConfirmDelete}
                className="hex-pill bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Purging Account...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} /> Confirm Permanent Deletion
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
