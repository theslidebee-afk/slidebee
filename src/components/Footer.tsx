import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white pt-20 pb-24 md:pb-10 border-t border-white/10 relative z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 inline-block">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-heading font-bold text-lg shadow-md shadow-primary/20">
                🐝
              </div>
              <span className="font-heading font-bold text-2xl text-white tracking-tight">
                Slide<span className="text-primary">Bee</span>
              </span>
            </Link>
            <p className="text-gray-400 font-light leading-relaxed">
              Elevating presentations for world-class brands. We transform complex data and ideas into compelling visual stories that drive results.
            </p>
            <div className="flex gap-4">
              {/* Add social links later */}
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
              <li><Link to="/media/blog" className="hover:text-primary transition-colors">Blog</Link></li>
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
                <span>123 Design Avenue, Suite 400<br/>New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={20} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={20} />
                <span>hello@slidebeestudio.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {currentYear} SlideBee. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/admin" className="hover:text-white transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
