import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Check, 
  ArrowRight, 
  ChevronDown,
  Sparkles
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Pricing() {
  usePageSEO({
    title: "Transparent Presentation Design Pricing | SlideBee",
    description: "Clear, predictable presentation design pricing: from $19 per slide for redesign to bespoke venture pitch decks and unlimited monthly design retainers.",
  });

  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Dynamic Pricing State loaded from Supabase site_config
  const [pricingConfig, setPricingConfig] = useState({
    rate_usd_redesign: 19,
    rate_usd_pitch: 29,
    rate_usd_executive: 49,
    rate_inr_redesign: 1499,
    rate_inr_pitch: 2299,
    rate_inr_executive: 3899,
    monthly_retainer_usd: 1490,
    monthly_retainer_inr: 119000
  });

  useEffect(() => {
    async function loadPricing() {
      try {
        const { data } = await supabase
          .from("site_config")
          .select("value")
          .eq("key", "pricing")
          .single();
        if (data && data.value) {
          setPricingConfig(data.value);
        }
      } catch (err) {
        console.warn("Could not load dynamic pricing:", err);
      }
    }
    loadPricing();
  }, []);

  const plans = [
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

interface FaqItem {
  q: string;
  a: string;
}

  const defaultFaqs: FaqItem[] = [
    {
      q: "How does the pricing per slide work?",
      a: "Our pricing is transparent and per-slide with no hidden fees. You only pay for the exact number of slides in your deck. If you have an existing 12-slide draft, you simply select 12 slides and choose your desired service tier."
    },
    {
      q: "What files do I receive upon completion?",
      a: "You receive 100% fully editable Master PowerPoint (.pptx) presentation files with all embedded vector assets and fonts, plus a print-ready PDF."
    },
    {
      q: "How fast can you deliver my presentation?",
      a: "Standard delivery is 24 to 48 hours depending on deck size. We also offer 24-hour priority rush delivery for urgent investor pitches or emergency board meetings."
    },
    {
      q: "Is my business data and financial information secure?",
      a: "Yes, 100%. We sign strict mutual Non-Disclosure Agreements (NDAs) before starting any project. Your files are stored in private encrypted drives and are never shared or published without your explicit written consent."
    },
    {
      q: "What if I need changes after the initial delivery?",
      a: "All our plans include revisions to ensure you are 100% satisfied with the typography, colors, and layout before your presentation."
    }
  ];

  const faqs: FaqItem[] = (pricingConfig as any).faqs && Array.isArray((pricingConfig as any).faqs) && (pricingConfig as any).faqs.length > 0
    ? (pricingConfig as any).faqs
    : defaultFaqs;

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden pt-28 pb-20 large-hex-grid">
      
      {/* 1. HERO SECTION */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/12 rounded-full blur-[140px] pointer-events-none" />

        <div className="inline-block hex-pill bg-white border border-[#111111]/12 px-7 py-2.5 shadow-sm mb-4">
          <span className="text-primary-amber text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            Transparent & Predictable Pricing
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#111111] leading-[1.12] mb-4 tracking-tight">
          Executive Presentation Design, <br />
          <span className="text-primary-amber">No Hidden Retainers.</span>
        </h1>

        <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto mb-8 leading-relaxed">
          Pay per slide or book dedicated designer capacity. Clear turnaround, signed NDAs, and 100% editable files.
        </p>

        {/* Hexagonal Currency Switcher */}
        <div className="inline-flex items-center hex-pill bg-white border-2 border-primary/40 p-1 shadow-sm">
          <button
            onClick={() => setCurrency("USD")}
            className={`px-6 py-2 hex-pill text-xs font-black transition-all ${
              currency === "USD"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:text-primary-amber"
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setCurrency("INR")}
            className={`px-6 py-2 hex-pill text-xs font-black transition-all ${
              currency === "INR"
                ? "bg-[#111111] text-[#FCBF14] shadow"
                : "text-[#111111] hover:text-primary-amber"
            }`}
          >
            INR (₹)
          </button>
        </div>
      </section>

      {/* 2. 3 MAIN TIER PRICING CARDS */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
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
                  <h3 className="text-2xl font-heading font-extrabold text-[#111111]">
                    {plan.name}
                  </h3>
                  <p className="text-[#726F6D] text-xs font-medium mt-1 leading-relaxed">
                    {plan.desc}
                  </p>
                </div>

                <div className="py-5 border-y border-primary/20 my-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-heading font-black text-[#111111]">
                      {plan.pricePerSlide}
                    </span>
                    <span className="text-xs font-bold text-[#726F6D]">
                      / slide
                    </span>
                  </div>
                  <span className="text-[11px] text-[#726F6D] font-medium block mt-1">
                    No minimum slide requirement
                  </span>
                </div>

                {/* Features List */}
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
      </section>

      {/* 3. DEDICATED DESIGNER MONTHLY RETAINER BANNER */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="hex-card-dark p-8 sm:p-12 relative overflow-hidden border-2 border-primary shadow-2xl">
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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Unlimited Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>24h Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Direct Slack/WhatsApp</span>
                </div>
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
      </section>

      {/* 4. TRANSPARENT PRICING FAQ (Hex Accordions) */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
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
                  className={`shrink-0 text-primary-amber transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
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
