import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  Mail, 
  Search, 
  Smartphone, 
  Headphones, 
  HelpCircle,
  Sparkles,
  Server,
  Lock
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export default function EcommerceDevelopment() {
  usePageSEO({
    title: "Ecommerce Website Development Package (₹25,000) | SlideBee",
    description: "Complete full-stack ecommerce website development for small and medium businesses at ₹25,000 one-time. 500 products, Razorpay checkout, customer accounts, Cloudflare hosting, Zoho email, and 30-day support.",
  });

  const [activeTab, setActiveTab] = useState<"features" | "pages" | "process" | "faq">("features");

  const coreFeatures = [
    {
      icon: <ShoppingBag className="w-6 h-6 text-[#111111]" />,
      title: "500 Products & Catalog Architecture",
      description: "Structured catalog supporting up to 500 products with categories, subcategories, variants (size, color, material), SKUs, and stock availability."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-[#111111]" />,
      title: "Razorpay Certified Payment Gateway",
      description: "Seamless integration with Razorpay supporting UPI, credit/debit cards, net banking, and wallets with instant automated order generation."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-[#111111]" />,
      title: "100% Mobile & Tablet Responsive",
      description: "Engineered mobile-first. Thumb-friendly navigation, instant cart drawers, and frictionless 2-step mobile checkout flow."
    },
    {
      icon: <Lock className="w-6 h-6 text-[#111111]" />,
      title: "Customer Accounts & Google Sign-In",
      description: "Self-service customer portal with one-click Google OAuth, order tracking, address book, and purchase history."
    },
    {
      icon: <Server className="w-6 h-6 text-[#111111]" />,
      title: "Cloudflare Edge Deployment & Free SSL",
      description: "Hosted on ultra-fast global Cloudflare CDN infrastructure with automatic SSL/TLS certificate, DDoS shielding, and 99.9% uptime."
    },
    {
      icon: <Mail className="w-6 h-6 text-[#111111]" />,
      title: "Business Email Setup via Zoho Mail",
      description: "Professional domain email configuration (hello@, support@, orders@) with verified DNS SPF, DKIM, and DMARC deliverability."
    },
    {
      icon: <Search className="w-6 h-6 text-[#111111]" />,
      title: "Foundational SEO & Structured Data",
      description: "Optimized page titles, meta descriptions, XML sitemap, robots.txt, and Schema.org Product & Store rich snippets for Google search indexing."
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#111111]" />,
      title: "30-Day Post-Launch Support & Warranty",
      description: "Comprehensive 30-day post-launch technical assistance covering configuration, bug fixes, and deployment verification."
    }
  ];

  const standardPages = [
    { name: "Homepage", type: "Core", desc: "High-converting hero, curated product carousels, category badges, and social proof." },
    { name: "Shop / Product Listing", type: "Core", desc: "Faceted category filtering, price sliders, in-stock badges, and dynamic sorting." },
    { name: "Product Details (PDP)", type: "Core", desc: "High-res zoomable gallery, variant selector, pricing, stock counter, and add-to-cart." },
    { name: "Shopping Cart", type: "Core", desc: "Real-time subtotal, quantity updates, coupon redemption, and delivery fee calculator." },
    { name: "Checkout & Payment", type: "Core", desc: "Streamlined single-page checkout collecting shipping, billing, and Razorpay gateway trigger." },
    { name: "Customer Portal & Login", type: "Core", desc: "Secure authentication with Google Sign-In, order tracking, and profile management." },
    { name: "Order History & Status", type: "Core", desc: "Real-time fulfillment milestone tracker (Pending → Processing → Shipped → Delivered)." },
    { name: "Admin Management Hub", type: "Admin", desc: "Storefront command center to manage products, categories, stock, orders, and customer data." },
    { name: "About Us & Brand Story", type: "Trust", desc: "Founder mission, brand heritage, executive credentials, and trust metrics." },
    { name: "Contact Us & Inquiry Form", type: "Trust", desc: "Direct customer service form, Google Maps embedding, phone, and official email links." },
    { name: "Privacy Policy", type: "Legal", desc: "GDPR, DPDP, and payment gateway compliant privacy terms." },
    { name: "Terms & Conditions", type: "Legal", desc: "Master commercial terms governing storefront transactions." },
    { name: "Cancellation & Refund Policy", type: "Legal", desc: "Explicit 100% Razorpay compliance policy outlining refund processing timelines." },
    { name: "Shipping & Delivery Policy", type: "Legal", desc: "Delivery timeframes, courier tracking details, and fulfillment SLAs." }
  ];

  const launchWorkflow = [
    { step: "01", title: "Discovery & Requirements", desc: "We review your product catalog, branding assets, target audience, and domain preferences." },
    { step: "02", title: "UI/UX Storefront Design", desc: "Crafting a bespoke, modern ecommerce interface aligned with your brand identity." },
    { step: "03", title: "Full-Stack Development", desc: "Building responsive frontends, product catalog logic, cart mechanics, and database architecture." },
    { step: "04", title: "Razorpay Gateway Integration", desc: "Connecting your merchant keys for secure UPI, card, and net banking payment processing." },
    { step: "05", title: "Cloudflare Deploy & Email Setup", desc: "Connecting custom domain, provisioning SSL, and configuring Zoho professional business mailboxes." },
    { step: "06", title: "QA Testing & Store Launch", desc: "End-to-end checkout verification, mobile testing, and handing over the administrative store keys." }
  ];

  const faqs = [
    {
      q: "What is included in the ₹25,000 package price?",
      a: "The ₹25,000 one-time investment covers complete end-to-end design, development, product catalog configuration (up to 500 products), Razorpay payment integration, Cloudflare deployment, SSL setup, Zoho business email configuration, foundational SEO, and 30 days of post-launch technical support."
    },
    {
      q: "Are payment gateway transaction fees included?",
      a: "No. Payment gateway per-transaction fees (typically ~2% for Razorpay) are standard provider fees charged directly by the gateway to your business merchant account."
    },
    {
      q: "Who owns the domain and accounts?",
      a: "You retain 100% full ownership of your domain, Cloudflare account, Razorpay merchant account, Zoho email account, and codebase. SlideBee sets everything up under your credentials with zero vendor lock-in."
    },
    {
      q: "Can I add more than 500 products later?",
      a: "Yes! The system architecture does not artificially limit your growth. The 500-product figure represents the setup and data-entry scope included in the launch package. You can easily add unlimited additional products through your admin dashboard."
    },
    {
      q: "How long does it take to launch the store?",
      a: "Once we receive your branding assets, product catalog information, and gateway keys, our standard turnaround is 7 to 10 business days."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="hex-pill inline-flex items-center gap-2 bg-[#111111] text-[#FCBF14] px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-5 shadow-sm border border-primary/40">
            <Sparkles size={14} className="text-[#FCBF14]" />
            SlideBee Ecommerce Launch Package
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] tracking-tight leading-tight mb-4">
            A Complete Online Store.<br />
            <span className="text-primary-amber">₹25,000 One-Time.</span> Zero Hassle.
          </h1>

          <p className="text-sm sm:text-lg text-[#726F6D] font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            Stop juggling multiple freelance agencies, theme subscriptions, and separate developers. We design, build, integrate payments, and deploy your complete ecommerce store ready to sell.
          </p>

          {/* Pricing Highlight Pill */}
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 p-3 sm:p-4 bg-white border-2 border-primary/40 rounded-3xl shadow-lg mb-8">
            <div className="text-left px-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block">
                Standard Launch Package
              </span>
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
                ₹25,000 <span className="text-xs sm:text-sm font-bold text-[#726F6D]">all-inclusive development</span>
              </span>
            </div>
            <Link
              to="/ordernow?service=ecommerce"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              Commission Your Store <ArrowRight size={14} />
            </Link>
          </div>

          {/* Fast Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center">
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">500</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">Products Supported</span>
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">Razorpay</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">UPI & Cards Ready</span>
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">7–10 Days</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">Rapid Turnaround</span>
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">30 Days</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">Post-Launch Support</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border-2 border-primary/30 p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("features")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "features" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Included Features
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "pages" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Website Pages (14 Included)
            </button>
            <button
              onClick={() => setActiveTab("process")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "process" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Launch Process
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "faq" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Pricing & Scope FAQ
            </button>
          </div>
        </div>

        {/* TAB 1: Core Features */}
        {activeTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {coreFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hex-card bg-white border-2 border-primary/30 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="font-heading font-black text-base text-[#111111] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* TAB 2: Website Pages */}
        {activeTab === "pages" && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white border-2 border-primary/30 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-heading font-black text-[#111111] mb-2">
                14 Production-Ready Store Pages
              </h3>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium mb-6">
                Your store launches with full consumer-grade shopping flows, compliance policies, and executive brand pages:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {standardPages.map((pg, idx) => (
                  <div key={idx} className="p-4 bg-[#FFF9E8] rounded-2xl border border-primary/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-black text-sm text-[#111111]">{pg.name}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#111111] text-[#FCBF14]">
                          {pg.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#726F6D] leading-relaxed">
                        {pg.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Launch Process */}
        {activeTab === "process" && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {launchWorkflow.map((item, idx) => (
                <div key={idx} className="hex-card bg-white border-2 border-primary/30 p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#FCBF14] font-mono font-black text-xs flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-heading font-black text-sm text-[#111111] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#726F6D] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FAQ */}
        {activeTab === "faq" && (
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            {faqs.map((f, idx) => (
              <div key={idx} className="bg-white border-2 border-primary/30 p-6 rounded-2xl shadow-sm">
                <h4 className="font-heading font-black text-sm sm:text-base text-[#111111] mb-2 flex items-start gap-2">
                  <HelpCircle size={18} className="text-primary-amber shrink-0 mt-0.5" />
                  <span>{f.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed pl-6">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Transparent Third-Party Policy Banner */}
        <div className="max-w-4xl mx-auto bg-[#111111] text-white p-8 rounded-3xl shadow-xl mb-16 border-2 border-[#FCBF14]/40">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} className="text-[#FCBF14]" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white mb-2">
                100% Transparent Third-Party Infrastructure Policy
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium mb-3">
                SlideBee’s ₹25,000 fee covers design, full-stack development, Razorpay payment integration, and initial deployment. You own all your accounts directly with zero markups:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Domain registration (~₹800/yr on Cloudflare/GoDaddy)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Razorpay gateway per-transaction fees (~2%)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Free Cloudflare hosting & SSL included ($0/mo)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Free Zoho business email tier setup included ($0/mo)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final CTA Strip */}
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#111111] mb-3">
            Ready to Launch Your Ecommerce Store?
          </h2>
          <p className="text-xs sm:text-sm text-[#726F6D] font-medium mb-6">
            Tell us about your brand and catalog. Our lead engineer will contact you within 2 hours with an onboarding blueprint.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/ordernow?service=ecommerce"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              Get Started for ₹25,000 <ArrowRight size={14} />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#111111] font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm border border-[#111111]/20 transition-all"
            >
              Talk to Our Engineering Desk
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
