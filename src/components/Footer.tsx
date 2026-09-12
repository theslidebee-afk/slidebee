import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";
import SlideBeeLogo from "./SlideBeeLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerConfig, setFooterConfig] = useState<any>({
    tagline: "Elevating presentations for world-class brands. We transform complex data and ideas into compelling visual stories that drive results.",
    linkedinUrl: "https://linkedin.com/company/theslidebee",
    twitterUrl: "https://twitter.com/theslidebee",
    instagramUrl: "https://instagram.com/theslidebee",
    dribbbleUrl: "https://dribbble.com/theslidebee",
    copyrightText: "SlideBee. All rights reserved.",
    address: "123 Design Avenue, Suite 400, New York, NY 10001",
    phone: "+1 (555) 123-4567",
    email: "hello@theslidebee.com"
  });

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "footer_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) setFooterConfig(data.value);
      });
  }, []);

  return (
    <footer className="bg-foreground text-white pt-20 pb-24 md:pb-10 border-t border-white/10 relative z-10">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <SlideBeeLogo variant="dark" size="lg" />
            </Link>
            <p className="text-gray-400 font-light leading-relaxed text-xs sm:text-sm">
              {footerConfig.tagline}
            </p>
            <div className="flex gap-3 pt-1">
              {footerConfig.linkedinUrl && (
                <a
                  href={footerConfig.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-black flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="LinkedIn"
                >
                  in
                </a>
              )}
              {footerConfig.twitterUrl && (
                <a
                  href={footerConfig.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-black flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="Twitter / X"
                >
                  X
                </a>
              )}
              {footerConfig.instagramUrl && (
                <a
                  href={footerConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-black flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="Instagram"
                >
                  ig
                </a>
              )}
              {footerConfig.dribbbleUrl && (
                <a
                  href={footerConfig.dribbbleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary hover:text-black flex items-center justify-center text-xs font-bold transition-all"
                  aria-label="Dribbble"
                >
                  dr
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link to="/examples" className="hover:text-primary transition-colors">Portfolio & Examples</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog & Insights</Link></li>
              <li><Link to="/videos" className="hover:text-primary transition-colors">Video Masterclasses</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/services" className="hover:text-primary transition-colors">Redesign & Visuals</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Handwritten Conversions</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Quick Scrub & Cleanup</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Data Visualization</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Custom Templates</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary shrink-0 mt-1" size={20} />
                <span>{footerConfig.address || "SlideBee Design Studio, Bengaluru, Karnataka 560001, India (Hubs: Singapore & San Francisco)"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={20} />
                <span>{footerConfig.phone || "+91 98765 43210"}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={20} />
                <span>{footerConfig.email || "hello@theslidebee.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {currentYear} {footerConfig.copyrightText || "SlideBee. All rights reserved."}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-white transition-colors">Admin & Client Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
