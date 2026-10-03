import React from "react";
import { Link } from "react-router-dom";
import { User, Shield, LogOut, ArrowRight } from "lucide-react";
import { MagneticButton } from "../MagneticButton";

interface NavbarAuthActionsProps {
  isAdmin: boolean;
  clientUser: any;
  userTier: "free" | "monthly" | "yearly" | "lifetime";
  onLogoutAdmin: () => void;
}

export const NavbarAuthActions: React.FC<NavbarAuthActionsProps> = ({
  isAdmin,
  clientUser,
  userTier,
  onLogoutAdmin
}) => {
  return (
    <div className="hidden lg:flex items-center gap-3 xl:gap-4">
      {isAdmin ? (
        /* Admin Logged-in State */
        <div className="flex items-center gap-3">
          <MagneticButton>
            <Link
              to="/admin"
              className="rounded-full flex items-center gap-1.5 text-xs font-black text-white px-5 py-2 bg-white/10 border border-[#FCBF14]/40 hover:bg-white/20 transition-all"
            >
              <Shield size={14} className="text-[#FCBF14]" /> Admin Studio
            </Link>
          </MagneticButton>
          <button
            onClick={onLogoutAdmin}
            className="rounded-full flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            title="Log out from Admin"
          >
            <LogOut size={13} />
          </button>
        </div>
      ) : clientUser ? (
        /* Client User Logged-in State */
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-[#FCBF14]/30 px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FCBF14] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              {userTier === "lifetime"
                ? "Lifetime VIP"
                : userTier === "yearly"
                ? "Yearly VIP"
                : userTier === "monthly"
                ? "Monthly Pro"
                : "Free Member"}
            </span>
          </div>
          <MagneticButton>
            <Link
              to="/login"
              className="rounded-full flex items-center gap-1.5 text-xs font-extrabold text-white hover:text-[#FCBF14] transition-colors px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#FCBF14]"
            >
              <User size={15} /> Dashboard
            </Link>
          </MagneticButton>
        </div>
      ) : (
        /* Guest / Logged-out State */
        <MagneticButton>
          <Link
            to="/login"
            className="rounded-full flex items-center gap-1.5 text-xs font-extrabold text-white hover:text-[#FCBF14] transition-colors px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#FCBF14]"
          >
            <User size={15} /> Login
          </Link>
        </MagneticButton>
      )}

      <MagneticButton>
        <Link
          to="/ordernow"
          className="rounded-full bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black text-xs sm:text-sm px-6 py-2.5 transition-all shadow-md shadow-[#FCBF14]/25 hover:scale-105 flex items-center gap-1.5"
        >
          Get a Quote <ArrowRight size={14} />
        </Link>
      </MagneticButton>
    </div>
  );
};
