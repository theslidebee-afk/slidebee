import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import SlideBeeLogo from "./SlideBeeLogo";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Templates", path: "/templates" },
    { name: "Services", path: "/services" },
    { name: "Pricing", path: "/pricing" },
    { name: "Portfolio", path: "/examples" },
    { name: "About", path: "/about" },
  ];

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-[#FFF9E8]/95 backdrop-blur-md shadow-md border-b border-[#111111]/8 py-3.5"
          : "bg-[#FFF9E8]/80 backdrop-blur-sm py-4 border-b border-[#111111]/5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo (Dark Obsidian text on Light Background) */}
        <Link to="/" className="z-50 flex items-center">
          <SlideBeeLogo variant="light" size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "text-sm font-extrabold transition-colors",
                  isActive
                    ? "text-primary-amber underline decoration-2 underline-offset-8"
                    : "text-[#111111] hover:text-primary-amber"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-xs font-bold text-[#111111] hover:text-primary-amber transition-colors px-3 py-2 rounded-xl hover:bg-black/5"
          >
            <User size={15} /> Login
          </Link>

          <Link
            to="/ordernow"
            className="bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-primary/20 hover:scale-105 flex items-center gap-1.5"
          >
            Get a Quote <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden z-50 p-2 text-[#111111]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[#FFF9E8] z-40 md:hidden flex flex-col justify-center px-8 pt-20 pb-12"
          >
            <nav className="flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-2xl font-heading font-extrabold text-[#111111] hover:text-primary-amber transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-[#111111]/10 flex flex-col gap-4">
                <Link
                  to="/admin"
                  className="text-base text-[#111111] font-bold flex items-center justify-center gap-2"
                >
                  <User size={18} /> Login to Account
                </Link>
                <Link
                  to="/ordernow"
                  className="bg-primary text-[#111111] text-base font-black py-3.5 rounded-full shadow-lg"
                >
                  Get a Quote ➔
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
