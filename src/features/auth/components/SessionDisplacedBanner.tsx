import { ShieldAlert, X } from "lucide-react";

interface SessionDisplacedBannerProps {
  displaced: boolean;
  newDevice: string;
  onDismiss: () => void;
}

export function SessionDisplacedBanner({
  displaced,
  newDevice,
  onDismiss,
}: SessionDisplacedBannerProps) {
  if (!displaced) return null;

  return (
    <div className="mb-6 bg-[#111111] border-2 border-[#FCBF14] text-white p-4 rounded-2xl shadow-xl relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert size={18} className="text-[#FCBF14]" />
        </div>
        <div className="flex-1 pr-6">
          <h4 className="text-xs font-heading font-black text-[#FCBF14] uppercase tracking-wider mb-1">
            Security Alert: Active Session Displaced
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed font-medium">
            Your account was logged in on another device ({newDevice}). To enforce strict single-session security, this device was safely logged out. Sign in below if you wish to reactivate this device.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white transition-colors"
          title="Dismiss alert"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
