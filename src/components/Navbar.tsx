import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import clsx from "clsx";
import SlideBeeLogo from "./SlideBeeLogo";
import { d1 } from "../lib/d1";
import {
  useNavbarAuth,
  DesktopNavLinks,
  NavbarAuthActions,
  MobileNavDrawer
} from "./navbar";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [topBarConfig, setTopBarConfig] = useState<{
    enabled?: boolean;
    imageUrl?: string;
    ctaLink?: string;
  } | null>(null);

  const { isAdmin, clientUser, userTier, handleLogoutAdmin } = useNavbarAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/" || location.pathname === "/home";

  useEffect(() => {
    d1.from("site_config")
      .select("value")
      .eq("key", "home_top_bar")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          let val = data.value;
          if (typeof val === "string") {
            try { val = JSON.parse(val); } catch {}
          }
          if (typeof val === "string") {
            try { val = JSON.parse(val); } catch {}
          }
          if (val && typeof val === "object") {
            setTopBarConfig(val);
          }
        }
      })
      .catch(() => {});
  }, []);

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
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/10",
        isScrolled
          ? "bg-[#111111]/95 backdrop-blur-md shadow-xl"
          : "bg-[#111111]/90 backdrop-blur-sm"
      )}
    >
      <div
        className={clsx(
          "w-[92%] max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300",
          isScrolled ? "py-3 sm:py-3.5" : "py-3.5 sm:py-4"
        )}
      >
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

      {/* Homepage Attached Promotional Image Banner Strip (Option A - Full Bleed) */}
      {isHome && topBarConfig?.enabled !== false && (
        <div className="w-full border-t border-white/10 overflow-hidden transition-all duration-300">
          {topBarConfig?.imageUrl ? (
            topBarConfig.ctaLink && topBarConfig.ctaLink !== "#" ? (
              <Link
                to={topBarConfig.ctaLink.startsWith("#") ? "/" : topBarConfig.ctaLink}
                onClick={(e) => {
                  if (topBarConfig.ctaLink?.startsWith("#")) {
                    e.preventDefault();
                    const targetId = topBarConfig.ctaLink.replace("#", "");
                    const el = document.getElementById(targetId);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full block transition-transform duration-200"
              >
                <img
                  src={topBarConfig.imageUrl}
                  alt="Promotional Banner"
                  className="w-full h-11 sm:h-12 object-cover object-center block select-none rounded-none shadow-xs"
                />
              </Link>
            ) : (
              <div className="w-full block">
                <img
                  src={topBarConfig.imageUrl}
                  alt="Promotional Banner"
                  className="w-full h-11 sm:h-12 object-cover object-center block select-none rounded-none shadow-xs"
                />
              </div>
            )
          ) : (
            /* High-End Branded Placeholder Graphic when no image is uploaded */
            <div className="w-full py-2 bg-[#161616]/95 flex items-center justify-center">
              <div className="h-8 sm:h-9 w-[92%] max-w-2xl rounded-lg border border-dashed border-[#FCBF14]/40 bg-[#FCBF14]/5 flex items-center justify-center text-[#FCBF14] text-[11px] sm:text-xs font-heading font-extrabold tracking-wider gap-2 select-none px-4">
                <Sparkles size={13} className="text-[#FCBF14] shrink-0" />
                <span className="truncate">SLIDEBEE EXECUTIVE PRESENTATION STUDIO &middot; CURATED TEMPLATES & BESPOKE DECKS</span>
              </div>
            </div>
          )}
        </div>
      )}

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
