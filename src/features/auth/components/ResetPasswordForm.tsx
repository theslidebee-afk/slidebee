import type { FormEvent } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import SlideBeeLogo from "../../../components/SlideBeeLogo";

interface ResetPasswordFormProps {
  resetCompleted: boolean;
  resetError: string;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (show: boolean) => void;
  resetSubmitting: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function ResetPasswordForm({
  resetCompleted,
  resetError,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  resetSubmitting,
  onSubmit,
  onCancel,
}: ResetPasswordFormProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <SlideBeeLogo variant="light" size="lg" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-primary/40 rounded-full text-[11px] font-bold text-amber-900 mb-2">
          <ShieldCheck size={13} className="text-primary-amber" />
          Verified Password Reset Session
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#111111]">
          Create New Password
        </h2>
        <p className="text-xs text-[#726F6D] font-medium mt-1">
          Choose a strong new password for your account to restore portal access.
        </p>
      </div>

      {resetCompleted ? (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-medium space-y-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            Password Updated Successfully!
          </div>
          <p className="leading-relaxed">
            Your credentials have been securely refreshed. Redirecting you to your account...
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {resetError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{resetError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-11 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] p-1 cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[10px] text-[#726F6D] font-medium mt-1 pl-2">
              Minimum 8 characters with letters and numbers.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-11 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetSubmitting}
            className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {resetSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <ArrowRight size={15} />
                Set New Password & Continue
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-[#726F6D] hover:text-[#111111] transition-colors cursor-pointer"
            >
              Cancel and Return to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
