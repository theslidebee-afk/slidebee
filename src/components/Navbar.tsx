import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import SlideBeeLogo from "./SlideBeeLogo";
import {
  useNavbarAuth,
  DesktopNavLinks,
  NavbarAuthActions,
  MobileNavDrawer
} from "./navbar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAdmin, clientUser, userTier, handleLogoutAdmin } = useNavbarAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-[#111111]/95 backdrop-blur-md shadow-xl border-b border-white/10 py-3.5"
          : "bg-[#111111]/90 backdrop-blur-sm py-4 border-b border-white/10"
      )}
    >
      <div className="w-[92%] max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#/"
          onClick={handleLogoClick}
          className="z-50 flex items-center cursor-pointer"
        >
          <SlideBeeLogo variant="dark" size="md" />
        </a>

        {/* Desktop Navigation Links */}
        <DesktopNavLinks />

        {/* Right CTA */}
        <NavbarAuthActions
          isAdmin={isAdmin}
          clientUser={clientUser}
          userTier={userTier}
          onLogoutAdmin={handleLogoutAdmin}
        />

        {/* Mobile Hamburger Button (44px Minimum Touch Target) */}
        <button
          className="lg:hidden z-50 min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-white hover:text-[#FCBF14] transition-colors rounded-xl cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAdmin={isAdmin}
        clientUser={clientUser}
        userTier={userTier}
        onLogoutAdmin={handleLogoutAdmin}
      />
    </header>
  );
}
