import { useNavigate } from "react-router-dom";
import { Heart, LogIn, X, BookmarkCheck } from "lucide-react";

interface WishlistAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistAuthModal({ isOpen, onClose }: WishlistAuthModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProceedLogin = () => {
    onClose();
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    navigate(`/login?redirect=${returnUrl}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-[#FFF9E8] rounded-3xl border-2 border-[#FCBF14] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 sm:p-8 text-center overflow-hidden"
      >
        {/* Subtle hex background ornament */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FCBF14]/15 rounded-full pointer-events-none blur-xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#726F6D] hover:text-[#111111] hover:bg-[#111111]/5 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Heart Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FCBF14] to-[#D99B00] flex items-center justify-center shadow-md mb-4 text-[#111111]">
          <Heart size={26} className="fill-[#111111]" />
        </div>

        {/* Modal Heading & Description */}
        <h3 className="text-xl sm:text-2xl font-heading font-black text-[#111111] mb-2">
          Save to Your Wishlist
        </h3>
        <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed mb-6">
          Sign in or create a free SlideBee account to bookmark this executive presentation deck and access your saved templates anytime.
        </p>

        {/* Benefits List */}
        <div className="bg-white/80 border border-[#FCBF14]/30 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#111111]">
            <BookmarkCheck size={16} className="text-[#D99B00] shrink-0" />
            <span>Instant sync across mobile and desktop</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#111111]">
            <BookmarkCheck size={16} className="text-[#D99B00] shrink-0" />
            <span>Receive updates when slides are updated</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleProceedLogin}
            className="w-full hex-pill bg-[#FCBF14] hover:bg-[#D99B00] text-[#111111] font-heading font-black text-xs sm:text-sm py-3 px-5 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn size={16} />
            <span>Sign In / Create Account</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-bold text-[#726F6D] hover:text-[#111111] py-3 px-4 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
