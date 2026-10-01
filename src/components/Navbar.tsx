import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, ArrowRight, Shield, LogOut, ChevronDown, Layers, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import SlideBeeLogo from "./SlideBeeLogo";
import { MagneticButton } from "./MagneticButton";
import { d1 as supabase } from "../lib/d1";
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

  const handleLogoutAdmin = async () => {
    await performGlobalLogout();
    setIsAdmin(false);
    setClientUser(null);
    navigate("/login");
  };

  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Templates", path: "/#templates", isHash: true },
    { name: "Services", path: "/services", hasDropdown: true },
    { name: "Pricing", path: "/pricing" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleNavClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
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

    // Direct routing for all pages
    navigate(link.path);
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
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#/"
          onClick={handleLogoClick}
          className="z-50 flex items-center cursor-pointer"
        >
          <SlideBeeLogo variant="dark" size="md" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
          {navLinks.map((link) => {
            const isActive = link.isHash 
              ? location.hash === "#templates"
              : (location.pathname === link.path || (link.path === "/portfolio" && location.pathname === "/examples"));
            
            if (link.isHash) {
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={(e) => handleNavClick(e, link)}
                  className={clsx(
                    "text-sm xl:text-base font-extrabold tracking-tight transition-all relative py-1 cursor-pointer bg-transparent border-none whitespace-nowrap",
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
                </button>
              );
            }

            if ((link as any).hasDropdown) {
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
                      isServicesActive
                        ? "text-[#FCBF14]"
                        : "text-white/85 hover:text-[#FCBF14]"
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
                            <div className="text-sm font-extrabold text-white group-hover:text-[#FCBF14] transition-colors flex items-center gap-2">
                              E-Commerce Development
                              <span className="text-[9px] font-black uppercase bg-[#FCBF14] text-[#111111] px-1.5 py-0.5 rounded">
                                ₹25K
                              </span>
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
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
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

        {/* Mobile Hamburger Button (44px Minimum Touch Target) */}
        <button
          className="lg:hidden z-50 min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-white hover:text-[#FCBF14] transition-colors rounded-xl cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown (Touch & Viewport Optimized) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
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
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        handleNavClick(e, link);
                      }}
                      className="min-h-[48px] flex items-center justify-center text-xl font-heading font-extrabold text-white hover:text-[#FCBF14] transition-colors cursor-pointer bg-transparent border-none py-2"
                    >
                      {link.name}
                    </button>
                  );
                }
                if ((link as any).hasDropdown) {
                  return (
                    <div key={link.name} className="flex flex-col items-center py-1">
                      <Link
                        to="/services"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="min-h-[44px] flex items-center justify-center text-xl font-heading font-extrabold text-white hover:text-[#FCBF14] transition-colors cursor-pointer"
                      >
                        {link.name}
                      </Link>
                      <div className="flex flex-col gap-1.5 w-full max-w-xs text-center pb-2 pt-1">
                        <Link
                          to="/services?type=presentation"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xs font-bold text-gray-200 hover:text-white py-2 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2"
                        >
                          <Layers size={14} className="text-[#FCBF14]" /> PPT Designing Services
                        </Link>
                        <Link
                          to="/services?type=ecommerce"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xs font-bold text-gray-200 hover:text-white py-2 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={14} className="text-[#FCBF14]" /> E-Commerce Website Dev <span className="text-[9px] bg-[#FCBF14] text-[#111111] font-black px-1.5 rounded">₹25K</span>
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                      className="rounded-full text-sm text-white font-black py-3.5 border border-[#FCBF14]/40 bg-white/10 gap-2 flex items-center justify-center transition-all min-h-[48px]"
                    >
                      <Shield size={18} className="text-[#FCBF14]" /> Admin Studio Hub
                    </Link>
                    <button
                      onClick={handleLogoutAdmin}
                      className="rounded-full text-xs text-red-400 font-bold py-3 bg-white/5 border border-white/10 transition-all min-h-[44px]"
                    >
                      Log Out Admin
                    </button>
                  </>
                ) : clientUser ? (
                  <Link
                    to="/login"
                    className="rounded-full text-sm text-white font-black py-3.5 border border-white/20 bg-white/10 gap-2 flex items-center justify-center transition-all min-h-[48px]"
                  >
                    <User size={18} /> My Dashboard ({userTier.toUpperCase()})
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-full text-sm text-white font-bold py-3.5 border border-white/20 bg-white/10 gap-2 flex items-center justify-center transition-all min-h-[48px]"
                  >
                    <User size={18} /> Login to Account
                  </Link>
                )}
                <Link
                  to="/ordernow"
                  className="rounded-full bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] text-sm font-black py-3.5 shadow-lg flex items-center justify-center gap-1.5 transition-all min-h-[48px]"
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
