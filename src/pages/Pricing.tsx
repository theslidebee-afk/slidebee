import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  Paintbrush
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { openRazorpayCheckout } from "../lib/razorpay";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Pricing() {
  usePageSEO({
    title: "Pricing — Template Marketplace & Custom Presentation Design | SlideBee",
    description: "SlideBee pricing: download presentation templates free with starter credits or go Pro for 80 downloads/month. Also view transparent per-slide pricing for custom pitch decks and executive keynotes.",
  });

  const location = useLocation();
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [pricingConfig, setPricingConfig] = useState<any>({
    rate_usd_redesign: 19,
    rate_usd_pitch: 29,
    rate_usd_executive: 49,
    rate_inr_redesign: 1499,
    rate_inr_pitch: 2299,
    rate_inr_executive: 3899,
    monthly_retainer_usd: 1490,
    monthly_retainer_inr: 119000,
    pro_monthly_inr: 199,
    pro_discount_percent: 50
  });

  useEffect(() => {
    async function loadPricing() {
      try {
        const { data } = await supabase
          .from("site_config")
          .select("value")
          .eq("key", "pricing")
          .single();
        if (data?.value) setPricingConfig((prev: any) => ({ ...prev, ...data.value }));
      } catch (err) {
        console.warn("Could not load dynamic pricing:", err);
      }
    }
    loadPricing();
  }, []);

  // Handle auto-scroll if hash is present (#marketplace or #services)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, [location.hash]);

  const handleGoPro = async () => {
    const monthlyPrice = pricingConfig?.pro_monthly_inr ?? 199;
    const discount = pricingConfig?.pro_discount_percent ?? 50;
    const yearlyPrice = Math.round((monthlyPrice * 12) * (1 - discount / 100));
    const amount = billingPeriod === "yearly" ? yearlyPrice : monthlyPrice;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      window.location.href = "/#/login?redirect=pro&billing=" + billingPeriod;
      return;
    }

    await openRazorpayCheckout({
      amount,
      currency: "INR",
      title: "SlideBee Pro Membership",
      description: `80 template downloads / month (${billingPeriod === "yearly" ? "Annual" : "Monthly"} billing)`,
      prefill: {
        email: session.user.email || "",
        name: session.user.user_metadata?.full_name || "SlideBee Pro Member",
      },
      onSuccess: async (rzpRes: any) => {
        try {
          await fetch("/api/subscribe-pro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: rzpRes.razorpay_payment_id || "rzp_direct",
              userId: session.user.id,
              userEmail: session.user.email,
              planName: billingPeriod === "yearly" ? "Pro Yearly" : "Pro Monthly",
              amount,
              billingPeriod
            })
          });
        } catch (subErr) {
          console.warn("Subscription provisioning error:", subErr);
        }
        window.location.href = "/#/login";
      },
      onFailure: (err: any) => {
        console.error("Pro checkout failed:", err);
      }
    });
  };

  const proMonthly = pricingConfig?.pro_monthly_inr ?? 199;
  const proDiscount = pricingConfig?.pro_discount_percent ?? 50;
  const proYearly = Math.round((proMonthly * 12) * (1 - proDiscount / 100));

  const servicePlans = [
    {
      id: "redesign",
      name: "Presentation Redesign",
      badge: "Standard Polish",
      desc: "For existing rough drafts, internal corporate reviews, and unformatted decks.",
      pricePerSlide: currency === "USD"
        ? `$${pricingConfig.rate_usd_redesign}`
        : `₹${pricingConfig.rate_inr_redesign.toLocaleString()}`,
      turnaround: "24h – 48h",
      features: [
        "Complete visual hierarchy overhaul",
        "Brand typography & color harmony",
        "Clean table & data alignment",
        "High-resolution vector icons",
        "100% editable Master PowerPoint (.pptx)",
        "1 Round of revisions included"
      ],
      cta: "Order Redesign",
      popular: false
    },
    {
      id: "pitch",
      name: "Venture Pitch Deck",
      badge: "Most Popular",
      desc: "Engineered for high-growth startups raising Pre-seed, Seed, or Series A/B capital.",
      pricePerSlide: currency === "USD"
        ? `$${pricingConfig.rate_usd_pitch}`
        : `₹${pricingConfig.rate_inr_pitch.toLocaleString()}`,
      turnaround: "48h – 72h",
      features: [
        "Proven 12-slide VC narrative structure",
        "Investor-grade unit economics & cap-table visualizers",
        "Custom bespoke vector illustrations & charts",
        "TAM / SAM / SOM market sizing diagrams",
        "Fully editable Master PowerPoint (.pptx) presentation",
        "Unlimited revisions until final sign-off",
        "Signed Non-Disclosure Agreement (NDA)"
      ],
      cta: "Order Pitch Deck",
      popular: true
    },
    {
      id: "executive",
      name: "Executive & Stage Keynote",
      badge: "C-Suite Standard",
      desc: "High-stakes keynotes for board meetings, global conferences, and C-suite stages.",
      pricePerSlide: currency === "USD"
        ? `$${pricingConfig.rate_usd_executive}`
        : `₹${pricingConfig.rate_inr_executive.toLocaleString()}`,
      turnaround: "24h Priority Available",
      features: [
        "Ex-McKinsey strategic storytelling & executive summaries",
        "Stage-optimized ultra-high contrast visual layouts",
        "Custom 3D isometric systems & architecture graphics",
        "Dedicated senior art director on direct WhatsApp/Slack",
        "Master PowerPoint (.pptx) + High-Res Vector PDF export",
        "Full Master Template & Brand Style Guide included",
        "Priority 24-hour turnaround guarantee"
      ],
      cta: "Order Executive Keynote",
      popular: false
    }
  ];

  interface FaqItem { q: string; a: string; }

  const defaultFaqs: FaqItem[] = [
    {
      q: "How does the template credits system work?",
      a: "Every new registered account receives 5 free teaser credits to explore and download starter templates. When you need more downloads, you can upgrade directly to SlideBee Pro for 80 monthly template downloads."
    },
    {
      q: "How does the per-slide custom design pricing work?",
      a: "Our custom presentation services are priced on a transparent per-slide basis with no hidden fees. You only pay for the exact slide count in your deck. Submit your draft or brief via Get a Quote to receive instant delivery estimates."
    },
    {
      q: "What files do I receive upon completion?",
      a: "For both template downloads and custom design deliverables, you receive 100% editable Master PowerPoint (.pptx) presentation files with embedded vector graphics, master layout themes, and print-ready PDFs."
    },
    {
      q: "How fast can you deliver a custom presentation?",
      a: "Standard bespoke delivery is 24 to 48 hours depending on deck scope. We also provide dedicated rush turnaround for board meetings and investor pitch emergencies."
    },
    {
      q: "Is my corporate data and intellectual property protected?",
      a: "Yes, 100%. We execute mutual Non-Disclosure Agreements (NDAs) prior to onboarding. Files are kept in secure encrypted storage and are never disclosed or published without explicit consent."
    }
  ];

  const faqs: FaqItem[] = (pricingConfig as any).faqs && Array.isArray((pricingConfig as any).faqs) && (pricingConfig as any).faqs.length > 0
    ? (pricingConfig as any).faqs
    : defaultFaqs;

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden pt-28 pb-20 large-hex-grid">

      {/* Quick Jump Navigation Pill */}
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex justify-center">
        <div className="hex-pill inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border-2 border-primary/40 p-1.5 shadow-sm">
          <a
            href="#marketplace"
            className="hex-pill px-4 py-1.5 text-xs font-black text-[#111111] hover:bg-primary/30 transition-all flex items-center gap-1.5"
          >
            <LayoutGrid size={13} className="text-primary-amber" /> Template Marketplace
          </a>
          <span className="text-[#726F6D] text-xs">|</span>
          <a
            href="#services"
            className="hex-pill px-4 py-1.5 text-xs font-black text-[#111111] hover:bg-primary/30 transition-all flex items-center gap-1.5"
          >
            <Paintbrush size={13} className="text-primary-amber" /> Custom Design Services
          </a>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION A: TEMPLATE MARKETPLACE PLANS                     */}
      {/* ======================================================== */}
      <section id="marketplace" className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-32">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 hex-pill bg-white border border-primary/40 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-primary-amber shadow-sm mb-4">
            <LayoutGrid size={14} /> Template Marketplace
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] leading-tight mb-3">
            Download Premium Templates.<br />
            <span className="text-primary-amber">Start Free. Go Pro.</span>
          </h1>
          <p className="text-[#726F6D] text-sm font-medium max-w-lg mx-auto">
            Every account gets 5 free credits on sign-up as a teaser to explore our library. Once finished, upgrade to Pro for 80 downloads per month.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="hex-pill inline-flex items-center gap-1.5 bg-white p-1 border-2 border-primary/40 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`hex-pill px-5 py-2 text-xs font-bold transition-all ${
                billingPeriod === "monthly" ? "bg-primary text-[#111111] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`hex-pill px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === "yearly" ? "bg-primary text-[#111111] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Yearly
              <span className="bg-green-500/20 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {proDiscount}% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Two Plan Cards: Free Teaser vs Pro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">

          {/* Free / Starter */}
          <div className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary p-8 flex flex-col justify-between shadow-sm transition-all">
            <div>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase tracking-widest block mb-2">Starter Tier</span>
              <div className="text-4xl font-heading font-black text-[#111111] mb-1">Free</div>
              <p className="text-xs text-[#726F6D] font-medium mb-6">
                Teaser package for exploring template quality — no card required.
              </p>
              <div className="space-y-3 border-t border-primary/20 pt-5">
                <div className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 mt-0.5">
                    <Check size={11} className="text-primary-amber stroke-[3]" />
                  </div>
                  <span>5 Free Template Credits on Sign-up</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 mt-0.5">
                    <Check size={11} className="text-primary-amber stroke-[3]" />
                  </div>
                  <span>Preview full executive slide catalog</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 mt-0.5">
                    <Check size={11} className="text-primary-amber stroke-[3]" />
                  </div>
                  <span>Standard PowerPoint (.pptx) download export</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#726F6D] font-medium">
                  <div className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#726F6D]">x</span>
                  </div>
                  <span>Non-renewable once credits are depleted</span>
                </div>
              </div>
            </div>
            <Link
              to="/templates"
              className="mt-8 hex-pill w-full block text-center bg-[#111111] hover:bg-black text-white font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-sm"
            >
              Browse Templates <ArrowRight size={14} />
            </Link>
          </div>

          {/* Pro */}
          <div className="hex-card-lg bg-white border-2 border-primary ring-4 ring-primary/20 p-8 flex flex-col justify-between shadow-xl relative">
            <div className="hex-pill absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#111111] text-[#FCBF14] border border-primary font-black text-[11px] px-5 py-1.5 uppercase tracking-wider shadow-md inline-flex items-center gap-1.5">
              <Sparkles size={11} /> Most Popular
            </div>

            <div>
              <span className="text-[10px] text-primary-amber font-bold uppercase tracking-widest block mb-2">Pro Access</span>
              <div className="text-4xl font-heading font-black text-[#111111] mb-0.5">
                {billingPeriod === "yearly"
                  ? `₹${proYearly.toLocaleString()}`
                  : `₹${proMonthly.toLocaleString()}`}
                <span className="text-sm font-normal text-[#726F6D] ml-1">
                  /{billingPeriod === "yearly" ? "year" : "month"}
                </span>
              </div>
              {billingPeriod === "yearly" && (
                <p className="text-[11px] text-green-600 font-bold mb-1">
                  Save {proDiscount}% vs monthly — billed annually
                </p>
              )}
              <p className="text-xs text-[#726F6D] font-medium mb-6">
                Unlimited marketplace flexibility with 80 monthly slide deck downloads.
              </p>
              <div className="space-y-3 border-t border-primary/20 pt-5">
                {[
                  "80 Template Downloads Every Month",
                  "All premium & executive master templates",
                  "100% Editable Master PowerPoint (.pptx)",
                  "Commercial license on all deliverables",
                  "Priority customer support & asset requests",
                  "Instant access to new weekly deck releases"
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 mt-0.5">
                      <Check size={11} className="text-primary-amber stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGoPro}
              className="mt-8 hex-pill w-full block text-center bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-md"
            >
              Go Pro Now <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* DIVIDER BANNER                                            */}
      {/* ======================================================== */}
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 mb-20">
        <div className="relative flex items-center gap-6">
          <div className="flex-1 border-t-2 border-dashed border-primary/30" />
          <div className="hex-pill bg-white border-2 border-primary/40 px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest text-[#111111] shadow-sm flex items-center gap-2 shrink-0">
            <Paintbrush size={13} className="text-primary-amber" /> Custom Design Services
          </div>
          <div className="flex-1 border-t-2 border-dashed border-primary/30" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION B: CUSTOM DESIGN SERVICE PRICING                  */}
      {/* ======================================================== */}
      <section id="services" className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 scroll-mt-32">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 hex-pill bg-white border border-primary/40 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-primary-amber shadow-sm mb-4">
            <Paintbrush size={14} /> Bespoke Design Services
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] leading-tight mb-3">
            Executive Presentation Design,<br />
            <span className="text-primary-amber">Transparent Per-Slide Pricing.</span>
          </h2>
          <p className="text-[#726F6D] text-sm font-medium max-w-lg mx-auto mb-6">
            Pay per slide or book dedicated designer capacity. Clear turnaround, signed NDAs, and 100% editable files.
          </p>

          {/* Currency Switcher */}
          <div className="inline-flex items-center hex-pill bg-white border-2 border-primary/40 p-1 shadow-sm">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-6 py-2 hex-pill text-xs font-black transition-all ${
                currency === "USD" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("INR")}
              className={`px-6 py-2 hex-pill text-xs font-black transition-all ${
                currency === "INR" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* 3 Service Tier Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {servicePlans.map((plan) => (
            <div
              key={plan.id}
              className={`hex-card-lg bg-white p-7 sm:p-9 transition-all relative flex flex-col justify-between shadow-md hover:shadow-2xl ${
                plan.popular
                  ? "border-2 border-primary ring-4 ring-primary/20 lg:-translate-y-3 z-10"
                  : "border-2 border-primary/40 hover:border-primary"
              }`}
            >
              {plan.popular && (
                <div className="hex-pill absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#111111] text-[#FCBF14] border border-primary font-black text-[11px] px-5 py-1.5 uppercase tracking-wider shadow-md inline-flex items-center gap-1.5">
                  <Sparkles size={11} className="text-[#FCBF14]" /> {plan.badge}
                </div>
              )}

              <div>
                <div className="mb-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-primary-amber block mb-1">
                    {plan.turnaround}
                  </span>
                  <h3 className="text-2xl font-heading font-extrabold text-[#111111]">{plan.name}</h3>
                  <p className="text-[#726F6D] text-xs font-medium mt-1 leading-relaxed">{plan.desc}</p>
                </div>

                <div className="py-5 border-y border-primary/20 my-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-heading font-black text-[#111111]">
                      {plan.pricePerSlide}
                    </span>
                    <span className="text-xs font-bold text-[#726F6D]">/ slide</span>
                  </div>
                  <span className="text-[11px] text-[#726F6D] font-medium block mt-1">
                    No minimum slide requirement
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-[#111111] font-medium">
                      <div className="w-5 h-5 rounded-full bg-primary/20 text-primary-amber flex items-center justify-center shrink-0 mt-0.5 border border-primary/40">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={`/ordernow?tier=${plan.id}`}
                className={`hex-pill w-full text-center py-3.5 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-primary hover:bg-primary-dark text-[#111111] shadow-md hover:scale-[1.02]"
                    : "bg-[#111111] hover:bg-black text-white hover:text-primary shadow-sm hover:scale-[1.02]"
                }`}
              >
                {plan.cta} <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise Retainer Banner */}
        <div className="hex-card-dark p-8 sm:p-12 relative overflow-hidden border-2 border-primary shadow-2xl mb-16">
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#FCBF14]/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8">
              <span className="hex-pill inline-block bg-primary text-[#111111] font-black px-4 py-1 text-xs uppercase tracking-wider mb-4">
                Enterprise Retainer
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-extrabold text-white mb-3 leading-tight">
                Dedicated Senior Slide Designer On-Demand
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mb-6">
                For VC firms, private equity funds, corporate strategy teams, and agencies needing 40+ decks per month with guaranteed 24-hour turnaround.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold text-gray-300">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span>Unlimited Queue</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span>24h Turnaround</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span>Direct Slack/WhatsApp</span></div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <div className="text-3xl sm:text-4xl font-heading font-black text-primary mb-1">
                {currency === "USD"
                  ? `$${pricingConfig.monthly_retainer_usd.toLocaleString()}`
                  : `₹${pricingConfig.monthly_retainer_inr.toLocaleString()}`}
                <span className="text-sm font-bold text-gray-400">/mo</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium mb-5">
                Pause or cancel anytime • NDA signed
              </span>
              <Link
                to="/contact?type=retainer"
                className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-8 py-3.5 text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg hover:scale-105"
              >
                Inquire Enterprise Retainer <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center mb-12">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-wider block mb-2">
            Pricing Questions
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="hex-card bg-white border-2 border-primary/40 hover:border-primary overflow-hidden shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-heading font-extrabold text-sm text-[#111111] flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-primary-amber transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-xs text-[#726F6D] font-medium leading-relaxed border-t border-primary/20 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}
