import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, ArrowRight, Shield, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import SlideBeeLogo from "./SlideBeeLogo";
import { MagneticButton } from "./MagneticButton";
import { supabase } from "../lib/supabase";
import { performGlobalLogout, subscribeToAuthSync } from "../lib/authSync";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dynamic Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [clientUser, setClientUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<"free" | "monthly" | "yearly" | "lifetime">("free");

  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsAdmin(false);
      setClientUser(null);
      localStorage.removeItem("slidebee_admin_session");
      localStorage.removeItem("slidebee_admin_email");
      localStorage.removeItem("slidebee_client_user");
      return;
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const isSessionAdmin =
      email === "superadmin@theslidebee.com" ||
      email === "admin@theslidebee.com" ||
      email === "admin@slidebee.com" ||
      email.startsWith("admin@") ||
      email.startsWith("superadmin@") ||
      session.user.user_metadata?.role === "admin" ||
      session.user.user_metadata?.role === "super_admin";

    if (isSessionAdmin) {
      setIsAdmin(true);
      setClientUser(null);
      localStorage.setItem("slidebee_admin_session", "true");
      return;
    }

    // Client user
    setIsAdmin(false);
    localStorage.removeItem("slidebee_admin_session");
    localStorage.removeItem("slidebee_admin_email");
    setClientUser(session.user);

    if (email) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("tier, role")
          .eq("email", email)
          .maybeSingle();
        if (profile) {
          if (profile.role === "admin" || profile.role === "super_admin") {
            setIsAdmin(true);
            setClientUser(null);
            localStorage.setItem("slidebee_admin_session", "true");
            return;
          }
          if (profile.tier) {
            setUserTier(profile.tier);
          }
        }
      } catch (err) {
        // preserve current state
      }
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen to live Supabase auth state transitions
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAdmin(false);
        setClientUser(null);
        localStorage.removeItem("slidebee_admin_session");
        localStorage.removeItem("slidebee_admin_email");
        localStorage.removeItem("slidebee_client_user");
      } else {
        checkAuth();
      }
    });

    const unsubscribe = subscribeToAuthSync(
      (role) => {
        if (!role || role === "admin") {
          setIsAdmin(false);
          if (location.pathname.startsWith("/admin")) {
            navigate("/login");
          }
        }
        if (!role || role === "client") {
          setClientUser(null);
        }
        checkAuth();
      },
      (role) => {
        if (role === "client" && location.pathname.startsWith("/admin")) {
          navigate("/login");
        }
        checkAuth();
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
      unsubscribe();
    };
  }, [location.pathname]);

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

  const handleLogoutAdmin = async () => {
    await performGlobalLogout();
    setIsAdmin(false);
    setClientUser(null);
    navigate("/login");
  };

  const navLinks = [
    { name: "Templates", path: "/#templates", isHash: true },
    { name: "Services", path: "/services" },
    { name: "Pricing", path: "/pricing" },
    { name: "Portfolio", path: "/examples" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    if (link.isHash) {
      e.preventDefault();
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
        }, 120);
      }
    }
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
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="z-50 flex items-center cursor-pointer"
        >
          <SlideBeeLogo variant="dark" size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = link.isHash 
              ? location.hash === "#templates"
              : location.pathname === link.path;
            return (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => handleNavClick(e, link)}
                className={clsx(
                  "text-[15px] lg:text-base font-extrabold tracking-tight transition-all relative py-1 cursor-pointer",
                  isActive
                    ? "text-[#FCBF14]"
                    : "text-white/85 hover:text-[#FCBF14]"
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FCBF14] rounded-full"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-4">
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
                onClick={handleLogoutAdmin}
                className="rounded-full flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
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
                  {userTier === "lifetime" ? "Lifetime VIP" : (userTier === "yearly" ? "Yearly VIP" : (userTier === "monthly" ? "Monthly Pro" : "Free Member"))}
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

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden z-50 p-2 text-white hover:text-[#FCBF14] transition-colors"
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
            className="fixed inset-0 bg-[#111111]/98 backdrop-blur-xl z-40 md:hidden flex flex-col justify-center px-8 pt-20 pb-12"
          >
            <nav className="flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link);
                  }}
                  className="text-2xl font-heading font-extrabold text-white hover:text-[#FCBF14] transition-colors cursor-pointer"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      className="rounded-full text-base text-white font-black py-3 border border-[#FCBF14]/40 bg-white/10 gap-2 flex items-center justify-center transition-all"
                    >
                      <Shield size={18} className="text-[#FCBF14]" /> Admin Studio Hub
                    </Link>
                    <button
                      onClick={handleLogoutAdmin}
                      className="rounded-full text-sm text-red-400 font-bold py-2.5 bg-white/5 border border-white/10 transition-all"
                    >
                      Log Out Admin
                    </button>
                  </>
                ) : clientUser ? (
                  <Link
                    to="/login"
                    className="rounded-full text-base text-white font-black py-3 border border-white/20 bg-white/10 gap-2 flex items-center justify-center transition-all"
                  >
                    <User size={18} /> My Dashboard ({userTier.toUpperCase()})
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-full text-base text-white font-bold py-3 border border-white/20 bg-white/10 gap-2 flex items-center justify-center transition-all"
                  >
                    <User size={18} /> Login to Account
                  </Link>
                )}
                <Link
                  to="/ordernow"
                  className="rounded-full bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] text-base font-black py-3.5 shadow-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  Get a Quote <ArrowRight size={15} />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
