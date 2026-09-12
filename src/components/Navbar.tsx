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
  const [credits, setCredits] = useState(5);

  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    // Check localStorage admin flag but only trust it if a live Supabase session exists
    const adminFlag = localStorage.getItem("slidebee_admin_session") === "true";
    if (adminFlag && session?.user) {
      setIsAdmin(true);
      setClientUser(null);
      return;
    }

    // If flag is set but no live session, it is stale — clean it up
    if (adminFlag && !session?.user) {
      localStorage.removeItem("slidebee_admin_session");
      localStorage.removeItem("slidebee_admin_email");
    }

    setIsAdmin(false);

    let activeEmail = "";

    if (session?.user) {
      const isSessionAdmin =
        session.user.email === "admin@theslidebee.com" ||
        session.user.email === "admin@slidebee.com" ||
        session.user.email?.startsWith("admin@") ||
        session.user.user_metadata?.role === "admin";

      if (isSessionAdmin) {
        setIsAdmin(true);
        setClientUser(null);
        localStorage.setItem("slidebee_admin_session", "true");
        return;
      }

      setClientUser(session.user);
      activeEmail = session.user.email || "";
    } else {
      // No live session — also clear any stale client user
      localStorage.removeItem("slidebee_client_user");
      setClientUser(null);
    }

    if (activeEmail) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits_balance")
          .eq("email", activeEmail)
          .single();
        if (profile && profile.credits_balance !== undefined) {
          setCredits(Number(profile.credits_balance));
        }
      } catch (err) {
        // preserve current state
      }
    }
  };

  useEffect(() => {
    checkAuth();

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
      },
      (role) => {
        if (role === "client" && location.pathname.startsWith("/admin")) {
          navigate("/login");
        }
        checkAuth();
      }
    );

    return () => unsubscribe();
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
    navigate("/login");
  };

  const navLinks = [
    { name: "Templates", path: "/templates" },
    { name: "Services", path: "/services" },
    { name: "Pricing", path: "/pricing" },
    { name: "Portfolio", path: "/examples" },
    { name: "Blog", path: "/blog" },
    { name: "Videos", path: "/videos" },
    { name: "About", path: "/about" },
  ];

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled
          ? "bg-[#FFF9E8]/95 backdrop-blur-md shadow-md border-b border-primary/20 py-3.5"
          : "bg-[#FFF9E8]/85 backdrop-blur-sm py-4 border-b border-primary/10"
      )}
    >
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="z-50 flex items-center">
          <SlideBeeLogo variant="light" size="md" />
        </Link>

        {/* Desktop Navigation Links (Increased Font Size & Crisp Weight) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "text-[15px] lg:text-base font-extrabold tracking-tight transition-all relative py-1",
                  isActive
                    ? "text-primary-amber"
                    : "text-[#111111] hover:text-primary-amber"
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary-amber rounded-full"
                  />
                )}
              </Link>
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
                  className="hex-cut-btn flex items-center gap-1.5 text-xs font-black text-[#111111] px-4 py-2 bg-primary/20 border border-primary/40 hover:bg-primary/40"
                >
                  <Shield size={14} className="text-[#111111]" /> Admin Studio
                </Link>
              </MagneticButton>
              <button
                onClick={handleLogoutAdmin}
                className="hex-cut-btn light-btn flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2"
                title="Log out from Admin"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : clientUser ? (
            /* Client User Logged-in State */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-primary/40 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-extrabold text-[#111111]">{credits} Credits</span>
              </div>
              <MagneticButton>
                <Link
                  to="/login"
                  className="hex-cut-btn flex items-center gap-1.5 text-xs font-extrabold text-[#111111] hover:text-primary-amber transition-colors px-4 py-2 hover:bg-black/5 border border-primary/30 hover:border-primary"
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
                className="hex-cut-btn flex items-center gap-1.5 text-xs font-extrabold text-[#111111] hover:text-primary-amber transition-colors px-4 py-2 hover:bg-black/5 border border-primary/30 hover:border-primary"
              >
                <User size={15} /> Login
              </Link>
            </MagneticButton>
          )}

          <MagneticButton>
            <Link
              to="/ordernow"
              className="hex-cut-btn bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs sm:text-sm px-6 py-2.5 transition-all shadow-md shadow-primary/20 hover:scale-105 flex items-center gap-1.5"
            >
              Get a Quote <ArrowRight size={14} />
            </Link>
          </MagneticButton>
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
              <div className="pt-6 border-t border-primary/20 flex flex-col gap-4">
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      className="hex-cut-btn text-base text-[#111111] font-black py-3 border border-primary/40 gap-2"
                    >
                      <Shield size={18} /> Admin Studio Hub
                    </Link>
                    <button
                      onClick={handleLogoutAdmin}
                      className="hex-cut-btn light-btn text-sm text-red-600 font-bold py-2.5"
                    >
                      Log Out Admin
                    </button>
                  </>
                ) : clientUser ? (
                  <Link
                    to="/login"
                    className="hex-cut-btn text-base text-[#111111] font-black py-3 border border-primary/40 gap-2"
                  >
                    <User size={18} /> My Dashboard ({credits} Credits)
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="hex-cut-btn light-btn text-base text-[#111111] font-bold py-3 border border-primary/40 gap-2"
                  >
                    <User size={18} /> Login to Account
                  </Link>
                )}
                <Link
                  to="/ordernow"
                  className="hex-cut-btn text-[#111111] text-base font-black py-3.5 shadow-lg flex items-center justify-center gap-1.5"
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
