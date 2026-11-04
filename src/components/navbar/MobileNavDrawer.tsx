import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Shield, ArrowRight, Layers, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks, type NavLinkItem } from "./navLinks";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  clientUser: any;
  userTier: "free" | "monthly" | "yearly" | "lifetime";
  onLogoutAdmin: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  isAdmin,
  clientUser,
  userTier,
  onLogoutAdmin
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent, link: NavLinkItem) => {
    e.preventDefault();
    onClose();
    if (link.isHash) {
      if (location.pathname === "/" || location.pathname === "/home") {
        const el = document.getElementById("templates");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 750, behavior: "smooth" });
        }
      } else {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById("templates");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 750, behavior: "smooth" });
          }
        }, 300);
      }
      return;
    }

    navigate(link.path);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 h-[100dvh] bg-[#111111]/98 backdrop-blur-xl z-40 lg:hidden flex flex-col justify-start px-6 pt-24 pb-safe overflow-y-auto no-scrollbar"
        >
          <nav className="flex flex-col gap-3 text-center my-auto pb-6">
            {navLinks.map((link) => {
              if (link.isHash) {
                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={(e) => handleNavClick(e, link)}
                    className="min-h-[48px] flex items-center justify-center text-xl font-heading font-extrabold text-white hover:text-[#FCBF14] transition-colors cursor-pointer bg-transparent border-none py-2"
                  >
                    {link.name}
                  </button>
                );
              }

              if (link.hasDropdown) {
                return (
                  <div key={link.name} className="flex flex-col items-center py-1">
                    <Link
                      to="/services"
                      onClick={onClose}
                      className="min-h-[44px] flex items-center justify-center text-xl font-heading font-extrabold text-white hover:text-[#FCBF14] transition-colors cursor-pointer"
                    >
                      {link.name}
                    </Link>
                    <div className="flex flex-col gap-1.5 w-full max-w-xs text-center pb-2 pt-1">
                      <Link
                        to="/services?type=presentation"
                        onClick={onClose}
                        className="text-xs font-bold text-gray-200 hover:text-white py-2 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2"
                      >
                        <Layers size={14} className="text-[#FCBF14]" /> PPT Designing Services
                      </Link>
                      <Link
                        to="/services?type=ecommerce"
                        onClick={onClose}
                        className="text-xs font-bold text-gray-200 hover:text-white py-2 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={14} className="text-[#FCBF14]" /> E-Commerce Website Development
                      </Link>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={onClose}
                  className="min-h-[48px] flex items-center justify-center text-xl font-heading font-extrabold text-white hover:text-[#FCBF14] transition-colors cursor-pointer py-2"
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="rounded-full text-sm text-white font-black py-3.5 border border-[#FCBF14]/40 bg-white/10 gap-2 flex items-center justify-center transition-all min-h-[48px]"
                  >
                    <Shield size={18} className="text-[#FCBF14]" /> Admin Studio Hub
                  </Link>
                  <button
                    onClick={() => {
                      onClose();
                      onLogoutAdmin();
                    }}
                    className="rounded-full text-xs text-red-400 font-bold py-3 bg-white/5 border border-white/10 transition-all min-h-[44px] cursor-pointer"
                  >
                    Log Out Admin
                  </button>
                </>
              ) : clientUser ? (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="rounded-full text-sm text-white font-black py-3.5 border border-white/20 bg-white/10 gap-2 flex items-center justify-center transition-all min-h-[48px]"
                >
                  <User size={18} /> My Dashboard ({userTier.toUpperCase()})
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="rounded-full text-sm text-white font-bold py-3.5 border border-white/20 bg-white/10 gap-2 flex items-center justify-center transition-all min-h-[48px]"
                >
                  <User size={18} /> Login to Account
                </Link>
              )}

              <Link
                to="/ordernow"
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] text-sm font-black py-3.5 shadow-lg flex items-center justify-center gap-1.5 transition-all min-h-[48px]"
              >
                Get a Quote <ArrowRight size={15} />
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
