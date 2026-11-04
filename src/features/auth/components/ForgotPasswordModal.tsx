import type { FormEvent } from "react";
import { X, Mail, CheckCircle2, ArrowRight } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  resetEmail: string;
  setResetEmail: (email: string) => void;
  resetLoading: boolean;
  resetFeedback: string;
  onSubmit: (e: FormEvent) => Promise<void>;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  resetEmail,
  setResetEmail,
  resetLoading,
  resetFeedback,
  onSubmit,
}: ForgotPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-primary/40 p-6 sm:p-8 rounded-2xl max-w-sm w-full shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#111111] p-1 cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-1">
          Password Recovery
        </h3>
        <p className="text-xs text-[#726F6D] mb-4">
          Enter your registered work email. If an account exists, a secure password reset link will be sent to your inbox.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="sarah@hypergrowth.vc or admin@theslidebee.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {resetFeedback && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs font-medium flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
              <div className="leading-relaxed">{resetFeedback}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={resetLoading}
            className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-2.5 text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <ArrowRight size={14} />
            {resetLoading ? "Sending Recovery Link..." : "Send Reset Instructions"}
          </button>
        </form>
      </div>
    </div>
  );
}
