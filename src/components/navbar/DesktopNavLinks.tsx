import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Layers, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { navLinks, type NavLinkItem } from "./navLinks";

export const DesktopNavLinks: React.FC = () => {
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent, link: NavLinkItem) => {
    e.preventDefault();
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
    <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
      {navLinks.map((link) => {
        const isActive = link.isHash
          ? location.hash === "#templates"
          : location.pathname === link.path || (link.path === "/portfolio" && location.pathname === "/examples");

        if (link.isHash) {
          return (
            <button
              key={link.name}
              type="button"
              onClick={(e) => handleNavClick(e, link)}
              className={clsx(
                "text-sm xl:text-base font-extrabold tracking-tight transition-all relative py-1 cursor-pointer bg-transparent border-none whitespace-nowrap",
                isActive ? "text-[#FCBF14]" : "text-white/85 hover:text-[#FCBF14]"
              )}
            >
              {link.name}
              {isActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FCBF14] rounded-full"
                />
              )}
            </button>
          );
        }

        if (link.hasDropdown) {
          const isServicesActive = location.pathname.startsWith("/services");
          return (
            <div
              key={link.name}
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  navigate("/services");
                  setServicesDropdownOpen(false);
                }}
                className={clsx(
                  "text-sm xl:text-base font-extrabold tracking-tight transition-all relative py-1 cursor-pointer whitespace-nowrap flex items-center gap-1.5 bg-transparent border-none",
                  isServicesActive ? "text-[#FCBF14]" : "text-white/85 hover:text-[#FCBF14]"
                )}
              >
                {link.name}
                <ChevronDown
                  size={14}
                  className={clsx(
                    "transition-transform duration-200",
                    servicesDropdownOpen && "rotate-180 text-[#FCBF14]"
                  )}
                />
                {isServicesActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FCBF14] rounded-full"
                  />
                )}
              </button>

              <AnimatePresence>
                {servicesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-[#161616]/98 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 shadow-2xl z-50 text-left"
                  >
                    <Link
                      to="/services?type=presentation"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#FCBF14]/15 border border-[#FCBF14]/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FCBF14] transition-colors">
                        <Layers size={18} className="text-[#FCBF14] group-hover:text-[#111111]" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white group-hover:text-[#FCBF14] transition-colors">
                          Presentation Design Services
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">
                          Investor pitch decks, keynotes, board decks & polish
                        </div>
                      </div>
                    </Link>

                    <div className="my-1 border-t border-white/10" />

                    <Link
                      to="/services?type=ecommerce"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#FCBF14]/15 border border-[#FCBF14]/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FCBF14] transition-colors">
                        <ShoppingBag size={18} className="text-[#FCBF14] group-hover:text-[#111111]" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white group-hover:text-[#FCBF14] transition-colors">
                          E-Commerce Development
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">
                          Full-stack store, 500 products, Razorpay & accounts
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <Link
            key={link.name}
            to={link.path}
            className={clsx(
              "text-sm xl:text-base font-extrabold tracking-tight transition-all relative py-1 cursor-pointer whitespace-nowrap",
              isActive ? "text-[#FCBF14]" : "text-white/85 hover:text-[#FCBF14]"
            )}
          >
            {link.name}
            {isActive && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FCBF14] rounded-full"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
