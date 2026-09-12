import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("slidebee_cookie_consent");
    if (!consent) {
      // Short delay for smooth slide-in
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: "all" | "essential") => {
    localStorage.setItem("slidebee_cookie_consent", level);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border-2 border-[#111111]/10 p-5 shadow-2xl hex-card animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 bg-[#FCBF14]/20 border border-[#FCBF14] text-[#111111] flex items-center justify-center shrink-0 rounded">
          <Cookie size={18} className="text-[#111111]" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-heading font-extrabold text-[#111111]">
            Cookie & Privacy Preferences
          </h4>
          <p className="text-xs text-[#726F6D] mt-1 leading-relaxed">
            We use functional session cookies to maintain your shopping cart, currency preferences, and anonymous performance analytics. Learn more in our{" "}
            <Link to="/privacy" className="text-[#111111] font-bold underline hover:text-[#FCBF14]">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <button
          onClick={() => handleConsent("essential")}
          className="text-[#726F6D] hover:text-[#111111] p-1"
          aria-label="Close cookie banner"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleConsent("all")}
          className="flex-1 px-3.5 py-2 bg-[#FCBF14] text-[#111111] text-xs font-bold hex-card hover:bg-[#E5AC10] transition-colors shadow-xs"
        >
          Accept All
        </button>
        <button
          onClick={() => handleConsent("essential")}
          className="px-3.5 py-2 bg-gray-100 text-[#111111] text-xs font-bold hex-card border border-[#111111]/10 hover:bg-gray-200 transition-colors"
        >
          Essential Only
        </button>
      </div>
    </aside>
  );
}
