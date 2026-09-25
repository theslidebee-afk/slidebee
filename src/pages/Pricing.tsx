import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ChevronDown,
  Flame,
  LayoutGrid,
  Paintbrush
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { openRazorpayCheckout } from "../lib/razorpay";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Pricing() {
  usePageSEO({
    title: "Pricing — Template Marketplace & Custom Presentation Design | SlideBee",
    description: "SlideBee pricing: download presentation templates free with 3 daily downloads or choose Monthly, Yearly, or Lifetime access. Also view transparent per-slide pricing for custom pitch decks and executive keynotes.",
  });

  const location = useLocation();
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
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

  const handleSubscribeTier = async (tier: "monthly" | "yearly" | "lifetime") => {
    let amount = 5;
    let title = "SlideBee Monthly Pro";
    let desc = "30 Premium Presentation Templates per month";

    if (currency === "USD") {
      if (tier === "monthly") {
        amount = 5;
        title = "SlideBee Monthly Pro ($5/mo)";
        desc = "30 Premium Presentation Templates per month";
      } else if (tier === "yearly") {
        amount = 45;
        title = "SlideBee Yearly Pro ($45/yr)";
        desc = "30 Premium Templates/mo + Free 10-Slide Bespoke Design Service";
      } else if (tier === "lifetime") {
        amount = 75;
        title = "SlideBee Lifetime VIP ($75 one-time)";
        desc = "Unlimited Premium Presentation Downloads Forever";
      }
    } else {
      if (tier === "monthly") {
        amount = 399;
        title = "SlideBee Monthly Pro (₹399/mo)";
        desc = "30 Premium Presentation Templates per month";
      } else if (tier === "yearly") {
        amount = 3499;
        title = "SlideBee Yearly Pro (₹3,499/yr)";
        desc = "30 Premium Templates/mo + Free 10-Slide Bespoke Design Service";
      } else if (tier === "lifetime") {
        amount = 5999;
        title = "SlideBee Lifetime VIP (₹5,999 one-time)";
        desc = "Unlimited Premium Presentation Downloads Forever";
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      window.location.href = `/#/login?redirect=pricing&tier=${tier}`;
      return;
    }

    await openRazorpayCheckout({
      amount,
      currency: currency === "USD" ? "USD" : "INR",
      title,
      description: desc,
      prefill: {
        email: session.user.email || "",
        name: session.user.user_metadata?.full_name || "SlideBee Member",
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
              tier,
              amount,
              currency,
              planName: title,
              billingPeriod: tier,
            }),
          });
        } catch (subErr) {
          console.warn("Subscription provisioning error:", subErr);
        }
        window.location.href = "/#/login?tier_upgraded=" + tier;
      },
      onFailure: (err: any) => {
        console.error("Checkout failed:", err);
      },
    });
  };

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
      q: "How do template downloads and tiers work?",
      a: "SlideBee offers four membership tiers: Basic Free gives you 3 daily downloads from our Free templates library. Monthly Pro ($5/mo or ₹399/mo) unlocks 30 Premium template downloads per month. Yearly Pro ($45/yr or ₹3,499/yr) includes 30 Premium templates/mo plus an exclusive free design service for up to 10 slides. Lifetime VIP ($75 or ₹5,999 one-time) gives you unlimited premium downloads forever without any renewal fees."
    },
    {
      q: "What is the Lifetime Plan safety limit?",
      a: "Our Lifetime VIP plan grants unlimited downloads for legitimate human presentation use. An automated fair-use safety threshold of 45 downloads per month is maintained solely to detect web scrapers and unauthorized bots. If you hit this threshold during an active project, simply reach out to support for immediate verification."
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
          <Link
            to="/templates"
            className="hex-pill px-4 py-1.5 text-xs font-black text-[#111111] hover:bg-primary/30 transition-all flex items-center gap-1.5"
          >
            <LayoutGrid size={13} className="text-primary-amber" /> Template Marketplace <ArrowRight size={12} />
          </Link>
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
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 hex-pill bg-white border border-primary/40 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-primary-amber shadow-sm mb-4">
            <LayoutGrid size={14} /> Template Marketplace Plans
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] leading-tight mb-3">
            Download Premium Templates.<br />
            <span className="text-primary-amber">Pick Your Plan.</span>
          </h1>
          <p className="text-[#726F6D] text-sm font-medium max-w-xl mx-auto mb-6">
            Start with 3 free downloads per day, or unlock our complete 30-slide executive presentation library with Monthly, Yearly, or Lifetime access.
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

        {/* 4-Card Responsive Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto mb-12">

          {/* CARD 1: Basic Free */}
          <div className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="hex-pill bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                  START HERE
                </span>
                <span className="text-[10px] text-[#726F6D] font-bold uppercase tracking-wider">Basic</span>
              </div>
              
              <div className="text-4xl font-heading font-black text-[#111111] mb-1">
                {currency === "USD" ? "$0" : "₹0"}
              </div>
              <p className="text-xs text-[#726F6D] font-medium mb-6">
                Explore template quality with daily starter downloads — no card required.
              </p>

              <div className="space-y-3 border-t border-primary/20 pt-5">
                {[
                  "3 Downloads Per Day",
                  "Access to Free Templates Library",
                  "Master PowerPoint (.pptx) download export",
                  "16:9 Ultra-Wide Presentation Format",
                  "Preview full executive slide catalog",
                  "Standard community email support",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300 mt-0.5">
                      <Check size={11} className="text-emerald-800 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/templates?tier=free"
              className="mt-8 hex-pill w-full block text-center bg-[#111111] hover:bg-black text-white font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-sm"
            >
              Browse Free Templates <ArrowRight size={14} />
            </Link>
          </div>

          {/* CARD 2: Monthly */}
          <div className="hex-card-lg bg-white border-2 border-primary/50 hover:border-primary p-7 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="hex-pill bg-primary/20 text-[#111111] border border-primary/40 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                  FLEXIBLE
                </span>
                <span className="text-[10px] text-primary-amber font-bold uppercase tracking-wider">Monthly</span>
              </div>

              <div className="text-4xl font-heading font-black text-[#111111] mb-1">
                {currency === "USD" ? "$5" : "₹399"}
                <span className="text-xs font-normal text-[#726F6D] ml-1">/month</span>
              </div>
              <p className="text-xs text-[#726F6D] font-medium mb-6">
                For active presenters needing regular access to fresh executive decks.
              </p>

              <div className="space-y-3 border-t border-primary/20 pt-5">
                {[
                  "30 Premium Templates Per Month",
                  "Full access to all Premium & Executive decks",
                  "100% Editable Master PowerPoint (.pptx)",
                  "Commercial royalty-free presentation license",
                  "New slide decks added weekly",
                  "Standard customer support",
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
              onClick={() => handleSubscribeTier("monthly")}
              className="mt-8 hex-pill w-full block text-center bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-md"
            >
              Subscribe Monthly <ArrowRight size={14} />
            </button>
          </div>

          {/* CARD 3: Yearly (Dark VIP Highlighted Card) */}
          <div className="hex-card-lg bg-[#111111] text-white border-2 border-primary ring-4 ring-primary/25 p-7 flex flex-col justify-between shadow-2xl relative lg:-translate-y-2 transition-all">
            <div className="hex-pill absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-[#111111] font-black text-[11px] px-5 py-1 uppercase tracking-wider shadow-xl inline-flex items-center gap-1.5 border border-black/20">
              <Flame size={12} className="text-[#111111]" /> BEST VALUE
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider">
                  ANNUAL PASS
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Save 25%
                </span>
              </div>

              <div className="text-4xl font-heading font-black text-white mb-0.5">
                {currency === "USD" ? "$45" : "₹3,499"}
                <span className="text-xs font-normal text-[#888888] ml-1">/year</span>
              </div>
              <p className="text-[11px] text-primary font-bold mb-2">
                Equivalent to {currency === "USD" ? "$3.75/month" : "₹291/month"}
              </p>
              <p className="text-xs text-[#AAAAAA] font-medium mb-6">
                Everything in Monthly plus our exclusive bespoke 10-slide design bonus.
              </p>

              <div className="space-y-3 border-t border-white/10 pt-5">
                {[
                  "30 Premium Templates Per Month",
                  "Bonus: Free design service for up to 10 slides",
                  "Full access to all Premium & Executive decks",
                  "100% Editable Master PowerPoint (.pptx)",
                  "Commercial royalty-free presentation license",
                  "Priority WhatsApp & Slack direct support",
                  "Immediate access to new weekly deck releases",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white/90 font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/60 mt-0.5">
                      <Check size={11} className="text-primary stroke-[3]" />
                    </div>
                    <span className={i === 1 ? "text-primary font-bold" : ""}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubscribeTier("yearly")}
              className="mt-8 hex-pill w-full block text-center bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs transition-all hover:scale-[1.03] flex items-center justify-center gap-1.5 shadow-xl"
            >
              Get Yearly Plan <ArrowRight size={14} />
            </button>
          </div>

          {/* CARD 4: Lifetime */}
          <div className="hex-card-lg bg-white border-2 border-primary/50 hover:border-primary p-7 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="hex-pill bg-[#111111] text-[#FCBF14] border border-[#FCBF14]/40 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                  ONE-TIME PAYMENT
                </span>
                <span className="text-[10px] text-[#726F6D] font-bold uppercase tracking-wider">Lifetime</span>
              </div>

              <div className="text-4xl font-heading font-black text-[#111111] mb-1">
                {currency === "USD" ? "$75" : "₹5,999"}
                <span className="text-xs font-normal text-[#726F6D] ml-1">one-time</span>
              </div>
              <p className="text-xs text-[#726F6D] font-medium mb-6">
                Pay once, access forever. Never worry about another monthly or annual renewal.
              </p>

              <div className="space-y-3 border-t border-primary/20 pt-5">
                {[
                  "Unlimited Premium Templates & Downloads*",
                  "Never pay another monthly or yearly renewal",
                  "All current & future templates included forever",
                  "100% Editable Master PowerPoint (.pptx)",
                  "Full commercial license for all client projects",
                  "VIP priority support & custom deck requests",
                  "*Fair-use limit of 45/mo to prevent bot crawling",
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 mt-0.5">
                      <Check size={11} className="text-primary-amber stroke-[3]" />
                    </div>
                    <span className={i === 6 ? "text-[#726F6D] text-[11px]" : ""}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleSubscribeTier("lifetime")}
              className="mt-8 hex-pill w-full block text-center bg-[#111111] hover:bg-black text-[#FCBF14] border border-primary/40 font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-md"
            >
              Get Lifetime Access <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* Full-width Honey Gold Bonus Showcase Banner */}
        <div className="hex-card-lg bg-gradient-to-r from-[#FCBF14] via-[#F5B301] to-[#FCBF14] text-[#111111] p-8 sm:p-10 shadow-xl border-2 border-black/10 max-w-7xl mx-auto relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-3xl">
              <span className="hex-pill inline-block bg-[#111111] text-[#FCBF14] text-[10px] font-black px-3.5 py-1 uppercase tracking-wider mb-3">
                Exclusive Annual Member Perk
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-[#111111] mb-2">
                YEARLY PLAN BONUS: Free Design Service for Up to 10 Slides
              </h3>
              <p className="text-sm font-medium text-[#111111]/85 leading-relaxed">
                When you subscribe to the SlideBee Yearly Plan ({currency === "USD" ? "$45" : "₹3,499"}), our senior presentation studio designers will personally build or redesign up to 10 custom slides for your next investor pitch, keynote, or board meeting for free ({currency === "USD" ? "$190+" : "₹14,990+"} value).
              </p>
            </div>
            <button
              onClick={() => handleSubscribeTier("yearly")}
              className="hex-pill px-8 py-4 bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-sm transition-all hover:scale-105 shadow-2xl flex items-center gap-2 shrink-0 border border-primary"
            >
              <span>Claim 10-Slide Bonus</span>
              <ArrowRight size={16} />
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
                  <Flame size={12} className="text-[#FCBF14]" /> {plan.badge}
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
