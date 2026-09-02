import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Examples", path: "/examples" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled ? "bg-background shadow-md py-4" : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-heading font-bold text-lg shadow-md shadow-primary/20">
            🐝
          </div>
          <span className={clsx("font-heading font-bold text-2xl tracking-tight", isScrolled ? "text-foreground" : "text-white")}>
            Slide<span className="text-primary">Bee</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={clsx(
                "text-sm font-semibold hover:text-primary transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}
            >
              {link.name}
            </Link>
          ))}

          {/* Media Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsMediaDropdownOpen(true)}
            onMouseLeave={() => setIsMediaDropdownOpen(false)}
          >
            <button
              className={clsx(
                "flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}
            >
              Media <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {isMediaDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-40 bg-background shadow-xl rounded-lg py-2 overflow-hidden border border-border"
                >
                  <Link to="/media/blog" className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors">
                    Blog
                  </Link>
                  <Link to="/media/videos" className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors">
                    Videos
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/contact"
            className={clsx(
              "text-sm font-semibold hover:text-primary transition-colors",
              isScrolled ? "text-foreground" : "text-white"
            )}
          >
            Contact
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link
            to="/contact"
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-full transition-all hover:shadow-lg inline-block"
          >
            Try Now
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={clsx("md:hidden z-50 p-2", (isScrolled || isMobileMenuOpen) ? "text-foreground" : "text-white")}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 bg-background z-40 md:hidden flex flex-col items-center justify-center pt-20"
          >
            <nav className="flex flex-col items-center gap-6 w-full px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-2xl font-heading font-bold text-foreground hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col items-center gap-4 border-t border-b border-border py-4 w-full text-center">
                <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Media</span>
                <Link to="/media/blog" className="text-xl font-heading font-bold text-foreground hover:text-primary">Blog</Link>
                <Link to="/media/videos" className="text-xl font-heading font-bold text-foreground hover:text-primary">Videos</Link>
              </div>
              <Link to="/contact" className="text-2xl font-heading font-bold text-foreground hover:text-primary">Contact</Link>
              <Link to="/contact" className="mt-4 bg-primary text-white text-xl font-bold py-3 px-12 rounded-full">
                Try Now
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
