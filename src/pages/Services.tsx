import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { d1 } from "../lib/d1";
import { HexProcessInfographic } from "../components/HexProcessInfographic";
import { Suspended3DCarousel } from "../components/Suspended3DCarousel";
import { 
  Sliders, 
  Paintbrush, 
  PenTool, 
  Sparkles, 
  BarChart3, 
  LayoutGrid, 
  Palette,
  ArrowRight,
  Layers,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Lock,
  Server,
  Mail,
  Search,
  Headphones,
  Check,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

const STORAGE_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides";

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || searchParams.get("category");
  const serviceParam = searchParams.get("service");

  // Top-Level Service Category: Presentation Design vs E-Commerce Website Development
  const [activeCategory, setActiveCategory] = useState<"presentation" | "ecommerce">(() => {
    const initialParam = new URLSearchParams(window.location.hash.split("?")[1] || window.location.search).get("type") || 
      new URLSearchParams(window.location.hash.split("?")[1] || window.location.search).get("category");
    return initialParam === "ecommerce" ? "ecommerce" : "presentation";
  });

  // Sync category with URL query param
  useEffect(() => {
    if (typeParam === "ecommerce") {
      setActiveCategory("ecommerce");
    } else if (typeParam === "presentation") {
      setActiveCategory("presentation");
    }
  }, [typeParam]);

  // Dynamic SEO metadata
  usePageSEO(
    activeCategory === "ecommerce"
      ? {
          title: "Ecommerce Website Development Package (₹25,000) | SlideBee",
          description: "Complete full-stack ecommerce website development for small and medium businesses at ₹25,000 one-time. 500 products, Razorpay checkout, customer accounts, Cloudflare hosting, Zoho email, and 30-day support.",
        }
      : {
          title: "Executive Presentation Design Services | SlideBee Studio",
          description: "Full-service presentation design studio: pitch deck design, keynote polish, board decks, financial data visualization, and master template design.",
        }
  );

  // State for Presentation Design service comparisons
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedService, setSelectedService] = useState<string>(() => {
    const initialParam = new URLSearchParams(window.location.hash.split("?")[1] || window.location.search).get("service");
    return initialParam || "redesign";
  });
  const [customServices, setCustomServices] = useState<Record<string, any>>({});

  useEffect(() => {
    if (serviceParam) {
      setSelectedService(serviceParam);
      setSliderPosition(50);
    }
  }, [serviceParam]);

  useEffect(() => {
    d1
      .from("site_config")
      .select("value")
      .eq("key", "services_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) setCustomServices(data.value);
      });
  }, []);

  // 6 Core Presentation Design Services
  const servicesData = {
    redesign: {
      id: "redesign",
      title: "Redesign and Visual Enhancement",
      tagline: "We uplift your slides with creativity",
      icon: <Paintbrush className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/hsbc_slide-2.jpg`,
      afterImg: `${STORAGE_BASE}/accenture_slide-1.jpg`,
      beforeTitle: "Raw Draft / Before",
      afterTitle: "SlideBee Redesign / After",
      turnaround: "24h – 48h",
      idealFor: "Corporate decks, weekly business reviews, conference presentations"
    },
    handwritten: {
      id: "handwritten",
      title: "Handwritten Conversions",
      tagline: "Deciphering handwritten text to marvelous-looking presentations",
      icon: <PenTool className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/british_american_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/nike_slide-1.jpg`,
      beforeTitle: "Handwritten Notes / Sketches",
      afterTitle: "Marvelous Presentation / After",
      turnaround: "24h – 48h",
      idealFor: "Whiteboard concepts, handwritten brainstorms, napkin sketches"
    },
    cleanup: {
      id: "cleanup",
      title: "Quick Scrub and Clean Up",
      tagline: "Fixing presentation as swiftly as a kite",
      icon: <Sparkles className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/cvs_health_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/volvo_slide-1.jpg`,
      beforeTitle: "Rough Draft & Misalignments",
      afterTitle: "Cleaned & Aligned Presentation",
      turnaround: "12h – 24h Rush",
      idealFor: "Emergency board meetings, rapid cleanup, formatting alignment"
    },
    data: {
      id: "data",
      title: "Data Visualization",
      tagline: "Blending numbers with our marvelous design",
      icon: <BarChart3 className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/tag_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/intel_slide-1.jpg`,
      beforeTitle: "Raw Spreadsheet Data",
      afterTitle: "Marvelous Visual Dashboard",
      turnaround: "24h – 48h",
      idealFor: "Financial reports, quarterly investor reviews, SaaS metrics"
    },
    template: {
      id: "template",
      title: "Template Creation",
      tagline: "Highly stylized presentation templates",
      icon: <LayoutGrid className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/hsbc_slide-4.jpg`,
      afterImg: `${STORAGE_BASE}/levis_slide-1.jpg`,
      beforeTitle: "Standard Plain Template",
      afterTitle: "Highly Stylized Master System",
      turnaround: "2 – 4 Days",
      idealFor: "Company brand systems, sales organizations, agency templates"
    },
    graphic: {
      id: "graphic",
      title: "Graphic Design",
      tagline: "Designing your visual story",
      icon: <Palette className="w-5 h-5" />,
      beforeImg: `${STORAGE_BASE}/intel_slide-3.jpg`,
      afterImg: `${STORAGE_BASE}/tag_slide-1.jpg`,
      beforeTitle: "Text-Heavy Concept",
      afterTitle: "Designed Visual Story",
      turnaround: "24h – 48h",
      idealFor: "Custom infographics, product storyboards, marketing collateral"
    }
  };

  const mergedServices = useMemo(() => {
    const base: Record<string, any> = { ...servicesData };
    if (customServices && typeof customServices === "object") {
      Object.keys(customServices).forEach((key) => {
        if (base[key]) {
          base[key] = {
            ...base[key],
            ...customServices[key],
            icon: base[key].icon
          };
        } else {
          const item = customServices[key];
          base[key] = {
            id: key,
            title: item.title || "Custom Capability",
            tagline: item.tagline || "Bespoke executive presentation design",
            icon: <Sparkles className="w-5 h-5" />,
            beforeImg: item.beforeImg || `${STORAGE_BASE}/hsbc_slide-2.jpg`,
            afterImg: item.afterImg || `${STORAGE_BASE}/accenture_slide-1.jpg`,
            beforeTitle: item.beforeTitle || "Draft / Before",
            afterTitle: item.afterTitle || "SlideBee Redesign / After",
            turnaround: item.turnaround || "24h – 48h",
            idealFor: item.idealFor || "Venture pitches, corporate decks"
          };
        }
      });
    }
    return base;
  }, [customServices]);

  const activeServiceData = mergedServices[selectedService] || Object.values(mergedServices)[0] || servicesData.redesign;

  // E-Commerce Package Specification Data (from SRS)
  const [ecommerceTab, setEcommerceTab] = useState<"features" | "pages" | "process" | "faq">("features");

  const coreEcommerceFeatures = [
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

  const ecommerceFaqs = [
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

  const handleSelectCategory = (category: "presentation" | "ecommerce") => {
    setActiveCategory(category);
    setSearchParams({ type: category });
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden">
      
      {/* ========================================================================= */}
      {/* OPTION A: PRESENTATION DESIGN STUDIO SERVICES VIEW */}
      {/* ========================================================================= */}
      {activeCategory === "presentation" && (
        <>
          {/* 1. HERO SECTION WITH TWO-LINED 3D SUSPENDED PERSPECTIVE CAROUSEL */}
          <section className="relative bg-[#FFF9E8] pt-24 sm:pt-28 pb-16 border-b border-primary/20 large-hex-grid overflow-hidden">
            {/* Soft Golden Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FCBF14]/12 rounded-full blur-[160px] pointer-events-none" />

            {/* Edge-to-edge Suspended Carousel Container */}
            <div className="w-full z-10 relative">
              <Suspended3DCarousel
                onSelectService={(svcId) => {
                  setSelectedService(svcId);
                  setSliderPosition(50);
                  document.getElementById("services-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          </section>

          {/* 2. THE 6 CORE SERVICES WITH INTERACTIVE BEFORE/AFTER SHOWCASE */}
          <section id="services-grid" className="py-20 bg-[#FFF9E8] large-hex-grid">
            <div className="container mx-auto px-4 md:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
                  Our 6 Specialized Capabilities
                </span>
                <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] mb-3">
                  Select a Service to See the Transformation
                </h2>
                <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
                  Click any service below to inspect the before-and-after redesign slider and exact deliverables.
                </p>
              </div>

              {/* Service Selector Modern Rounded Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-10 max-w-5xl mx-auto">
                {Object.values(mergedServices).map((svc: any) => {
                  const isSelected = activeServiceData?.id === svc.id;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => {
                        setSelectedService(svc.id);
                        setSliderPosition(50);
                      }}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer border ${
                        isSelected
                          ? "bg-[#111111] text-[#FCBF14] border-[#FCBF14] shadow-lg shadow-[#FCBF14]/20 scale-103"
                          : "bg-white/95 hover:bg-white text-[#111111] border-primary/25 hover:border-primary/60 shadow-xs hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                          isSelected
                            ? "bg-[#FCBF14] text-[#111111]"
                            : "bg-[#FFF9E8] text-primary-amber"
                        }`}
                      >
                        {svc.icon}
                      </div>
                      <span className="font-heading font-extrabold text-xs leading-tight">
                        {svc.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE SERVICE BEFORE/AFTER SHOWCASE CONTAINER */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeServiceData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border-2 border-primary/40 rounded-3xl p-6 sm:p-10 shadow-xl max-w-5xl mx-auto"
                >
                  
                  {/* Header Details */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-primary/20 mb-8">
                    <div>
                      <div className="inline-block bg-[#FFF9E8] text-primary-amber border border-primary/30 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider mb-2">
                        Turnaround: {activeServiceData.turnaround}
                      </div>
                      <h3 className="text-xl sm:text-3xl font-heading font-extrabold text-[#111111] mb-1">
                        {activeServiceData.title}
                      </h3>
                      <p className="text-sm sm:text-base text-[#726F6D] font-medium">
                        {activeServiceData.tagline}
                      </p>
                    </div>

                    <Link
                      to={`/ordernow?service=${activeServiceData.id}`}
                      className="inline-flex items-center justify-center gap-2 bg-[#FCBF14] hover:bg-[#FFE270] text-[#111111] font-black px-6 py-3 rounded-full text-xs sm:text-sm transition-all shadow-md hover:scale-105 shrink-0"
                    >
                      Commission This Service <ArrowRight size={14} />
                    </Link>
                  </div>

                  {/* Interactive Before/After Comparison Slider */}
                  <div className="relative aspect-[16/9] w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30 select-none mb-6">
                    {/* Background: After Image */}
                    <img
                      src={activeServiceData.afterImg}
                      alt={activeServiceData.afterTitle}
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute top-4 right-4 bg-[#111111]/85 backdrop-blur-md text-[#FCBF14] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#FCBF14]/30 pointer-events-none shadow-sm z-10">
                      {activeServiceData.afterTitle}
                    </div>

                    {/* Foreground: Before Image Clipped */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={activeServiceData.beforeImg}
                        alt={activeServiceData.beforeTitle}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#111111] text-xs font-extrabold px-3 py-1.5 rounded-lg border border-primary/40 pointer-events-none shadow-sm z-10">
                        {activeServiceData.beforeTitle}
                      </div>
                    </div>

                    {/* Draggable Vertical Divider */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[#FCBF14] shadow-[0_0_15px_rgba(252,191,20,0.8)] cursor-ew-resize z-20"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111] border-2 border-[#FCBF14] flex items-center justify-center text-[#FCBF14] shadow-lg pointer-events-none">
                        <Sliders size={16} />
                      </div>
                    </div>

                    {/* Full Slider Input Controller */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
                      aria-label="Before and After visual slider"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#726F6D] font-medium pt-2">
                    <span className="mb-2 sm:mb-0">
                      <strong>Best suited for:</strong> {activeServiceData.idealFor}
                    </span>
                    <span className="italic">
                      Drag slider left or right to inspect slide improvements
                    </span>
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>
          </section>

          {/* 3. HOW SLIDEBEE WORKS (4-Step Infographic Pipeline) */}
          <section className="py-16 bg-[#FFF9E8] border-t border-primary/20">
            <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/85 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 sm:p-10 lg:p-12 shadow-lg">
                <HexProcessInfographic />
              </div>
            </div>
          </section>

          {/* 3.5 ECOMMERCE LAUNCH SPECIAL FEATURE CALLOUT */}
          <section className="py-12 bg-[#FFFDF5] border-t border-primary/20">
            <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#111111] text-white rounded-3xl border-2 border-[#FCBF14]/40 p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="space-y-3 max-w-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FCBF14] bg-[#FCBF14]/15 px-3 py-1 rounded-full border border-[#FCBF14]/30 inline-block">
                    ADDITIONAL STUDIO CAPABILITY
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                    Need a Complete Ecommerce Website for Your Brand?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                    Get an all-inclusive online store for <strong>₹25,000 one-time</strong>. Includes up to 500 products, Razorpay checkout, customer accounts with Google Sign-In, Cloudflare hosting, Zoho email, and 30-day post-launch support.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("ecommerce")}
                    className="bg-[#FCBF14] hover:bg-[#FFE270] text-[#111111] font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-md hover:scale-105 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Switch to Ecommerce Package (₹25K) <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. BOTTOM ACTION BANNER */}
          <section className="py-16 bg-[#111111] text-white text-center px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto max-w-2xl z-10 relative">
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white mb-3">
                Have a Presentation Due Soon?
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-medium mb-8 max-w-lg mx-auto">
                Upload your rough outline, draft slides, or bullet points. We'll send you a custom proposal and quote within 2 hours.
              </p>
              <Link
                to="/ordernow"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black px-8 py-4 rounded-full text-xs sm:text-sm transition-all shadow-xl shadow-[#FCBF14]/25 hover:scale-105"
              >
                Start Your Project Brief <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </>
      )}

      {/* ========================================================================= */}
      {/* OPTION B: E-COMMERCE WEBSITE DEVELOPMENT SERVICE VIEW */}
      {/* ========================================================================= */}
      {activeCategory === "ecommerce" && (
        <section className="pt-28 pb-16 bg-[#FFF9E8] large-hex-grid">
          <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">

            {/* Hero Banner */}
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="hex-pill inline-flex items-center gap-2 bg-[#111111] text-[#FCBF14] px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-5 shadow-sm border border-primary/40">
                <Sparkles size={14} className="text-[#FCBF14]" />
                SlideBee Ecommerce Launch Package
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] tracking-tight leading-tight mb-4">
                A Complete Online Store.<br />
                <span className="text-primary-amber">₹25,000 One-Time.</span> Zero Hassle.
              </h2>

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

            {/* Tab Navigation for Ecommerce Sections */}
            <div className="flex justify-center mb-12">
              <div className="bg-white border-2 border-primary/30 p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1">
                <button
                  onClick={() => setEcommerceTab("features")}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    ecommerceTab === "features" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  Included Features
                </button>
                <button
                  onClick={() => setEcommerceTab("pages")}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    ecommerceTab === "pages" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  Website Pages (14 Included)
                </button>
                <button
                  onClick={() => setEcommerceTab("process")}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    ecommerceTab === "process" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  Launch Process
                </button>
                <button
                  onClick={() => setEcommerceTab("faq")}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    ecommerceTab === "faq" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  Pricing & Scope FAQ
                </button>
              </div>
            </div>

            {/* TAB 1: Core Features */}
            {ecommerceTab === "features" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {coreEcommerceFeatures.map((feat, idx) => (
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
            {ecommerceTab === "pages" && (
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
            {ecommerceTab === "process" && (
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
            {ecommerceTab === "faq" && (
              <div className="max-w-3xl mx-auto mb-16 space-y-4">
                {ecommerceFaqs.map((f, idx) => (
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

            {/* Switch to Presentation Design Banner */}
            <div className="max-w-4xl mx-auto bg-white border-2 border-primary/40 rounded-3xl p-6 sm:p-8 shadow-md mb-16 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber block mb-1">
                  Presentation Design Agency
                </span>
                <h4 className="font-heading font-black text-lg sm:text-xl text-[#111111] mb-1">
                  Need Pitch Decks, Conference Keynotes, or Slide Redesigns?
                </h4>
                <p className="text-xs sm:text-sm text-[#726F6D] font-medium">
                  Inspect our 6 executive presentation design capabilities with interactive before-and-after sliders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectCategory("presentation")}
                className="bg-[#111111] hover:bg-black text-[#FCBF14] font-extrabold px-6 py-3 rounded-full text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <Layers size={14} /> View PPT Design Services
              </button>
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
                  to="/contact?service=ecommerce"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#111111] font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm border border-[#111111]/20 transition-all"
                >
                  Talk to Our Engineering Desk
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

    </div>
  );
}
