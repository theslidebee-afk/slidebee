import type { FormEvent } from "react";
import {
  Lock,
  Mail,
  User,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import SlideBeeLogo from "../../../components/SlideBeeLogo";
import { SessionDisplacedBanner } from "./SessionDisplacedBanner";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

interface AuthCardProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  company: string;
  setCompany: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  formLoading: boolean;
  formError: string;
  setFormError: (val: string) => void;
  signUpSuccessMessage: string;
  setSignUpSuccessMessage: (val: string) => void;
  accountDeletedNotice: string;
  incomingParams: { orderRef: string; email: string; name: string; action: string };
  sessionDisplacedInfo: { displaced: boolean; newDevice: string };
  dismissDisplacedNotice: () => void;
  failedAttempts: number;
  cooldownRemaining: number;
  googleLoading: boolean;
  handleGoogleSignIn: () => Promise<void>;
  handleSubmitAuth: (e: FormEvent) => Promise<void>;
  showForgotModal: boolean;
  setShowForgotModal: (val: boolean) => void;
  resetEmail: string;
  setResetEmail: (val: string) => void;
  resetLoading: boolean;
  resetFeedback: string;
  setResetFeedback: (val: string) => void;
  handleForgotPassword: (e: FormEvent) => Promise<void>;
}

export function AuthCard({
  isSignUp,
  setIsSignUp,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  company,
  setCompany,
  showPassword,
  setShowPassword,
  formLoading,
  formError,
  setFormError,
  signUpSuccessMessage,
  setSignUpSuccessMessage,
  accountDeletedNotice,
  incomingParams,
  sessionDisplacedInfo,
  dismissDisplacedNotice,
  cooldownRemaining,
  googleLoading,
  handleGoogleSignIn,
  handleSubmitAuth,
  showForgotModal,
  setShowForgotModal,
  resetEmail,
  setResetEmail,
  resetLoading,
  resetFeedback,
  setResetFeedback,
  handleForgotPassword,
}: AuthCardProps) {
  const isAdminInput = email.toLowerCase().trim() === "admin@theslidebee.com";

  return (
    <div className="hex-card-lg bg-white border-2 border-primary/40 p-8 sm:p-10 shadow-2xl max-w-md w-full relative z-10">
      {accountDeletedNotice && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>{accountDeletedNotice}</span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <SlideBeeLogo variant="light" size="lg" />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#111111]">
          {isSignUp ? "Create Client Account" : "Sign In to Client Portal"}
        </h2>
        <p className="text-xs text-[#726F6D] font-medium mt-1">
          {isSignUp
            ? "Access deck briefs, pro template quotas, and deliverables"
            : "Manage your active presentation projects & templates"}
        </p>
      </div>

      {/* Live SLA Project Tracker Welcome Banner */}
      {incomingParams.orderRef && (
        <div className="mb-6 bg-gradient-to-r from-[#FCBF14]/20 via-[#FFE270]/25 to-[#FCBF14]/15 border-2 border-[#FCBF14] p-4 sm:p-5 rounded-2xl shadow-sm text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#111111] text-[#FCBF14] px-2.5 py-0.5 rounded-full">
              Reference: {incomingParams.orderRef}
            </span>
            <span className="text-xs font-black text-[#111111] flex items-center gap-1">
              <CheckCircle2 size={13} className="text-[#111111]" /> Project Brief Linked
            </span>
          </div>
          <p className="text-xs text-[#111111]/85 font-medium leading-relaxed">
            Your presentation request is queued.{" "}
            {isSignUp
              ? "Set your password below to create your client account,"
              : "Sign in below to"}{" "}
            monitor live SLA turnaround milestones, preview presentation drafts, and download deliverables.
          </p>
        </div>
      )}

      {/* Session Displacement Security Notice */}
      <SessionDisplacedBanner
        displaced={sessionDisplacedInfo.displaced}
        newDevice={sessionDisplacedInfo.newDevice}
        onDismiss={dismissDisplacedNotice}
      />

      {/* Tab Selector */}
      <div className="flex bg-[#FFF9E8] border border-primary/30 p-1 hex-pill mb-6">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setFormError("");
            setSignUpSuccessMessage("");
          }}
          className={`w-1/2 py-2 hex-pill text-xs font-black transition-all cursor-pointer ${
            !isSignUp ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setFormError("");
            setSignUpSuccessMessage("");
          }}
          className={`w-1/2 py-2 hex-pill text-xs font-black transition-all cursor-pointer ${
            isSignUp ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D]"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* One-Click Google OAuth Sign In */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || formLoading}
          className="w-full bg-white hover:bg-[#F8F9FA] text-[#111111] border-2 border-[#111111]/15 hover:border-[#111111]/35 font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 text-xs sm:text-sm cursor-pointer hover:shadow-sm disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-amber" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{isSignUp ? "Sign up with Google" : "Continue with Google"}</span>
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-[#111111]/10 w-full" />
          <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-[#726F6D] absolute">
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmitAuth} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                Company / Organization
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="HyperGrowth Capital"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
            Work Email *
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="sarah@hypergrowth.vc"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block">
              {isAdminInput ? "Admin Password *" : "Password *"}
            </label>
            {!isSignUp && !isAdminInput && (
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetFeedback("");
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-bold text-primary-amber hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill pl-10 pr-11 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary"
            />
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {isSignUp && (
            <p className="text-[10px] text-[#726F6D] font-medium mt-1 pl-2">
              Minimum 8 characters with at least 1 uppercase letter and 1 digit.
            </p>
          )}
        </div>

        {signUpSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-relaxed">{signUpSuccessMessage}</div>
          </div>
        )}

        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={formLoading || (!isSignUp && cooldownRemaining > 0)}
          className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 disabled:opacity-50 mt-2 cursor-pointer"
        >
          <ArrowRight size={15} />
          {formLoading
            ? "Processing..."
            : !isSignUp && cooldownRemaining > 0
            ? `Cooldown Active (${cooldownRemaining}s)`
            : isSignUp
            ? "Create Client Account"
            : "Sign In to Portal"}
        </button>
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => {
          setShowForgotModal(false);
          setResetFeedback("");
        }}
        resetEmail={resetEmail}
        setResetEmail={setResetEmail}
        resetLoading={resetLoading}
        resetFeedback={resetFeedback}
        onSubmit={handleForgotPassword}
      />

      <div className="mt-6 pt-4 border-t border-primary/20 text-center space-y-2">
        <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed">
          By signing in or creating an account, you agree to SlideBee's{" "}
          <span className="text-[#111111] font-bold underline cursor-pointer">Terms of Service</span>{" "}
          and{" "}
          <span className="text-[#111111] font-bold underline cursor-pointer">Privacy Policy</span>.
        </p>
        <div className="flex items-center justify-center gap-2 text-[10px] text-[#726F6D] font-semibold">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={12} className="text-primary-amber" />
            256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Lock size={11} className="text-primary-amber" />
            Strict NDA Protection
          </span>
        </div>
      </div>
    </div>
  );
}
