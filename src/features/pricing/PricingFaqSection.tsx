import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { PricingConfig } from "./usePricing";

interface FaqItem { q: string; a: string; }

interface PricingFaqSectionProps {
  pricingConfig: PricingConfig;
  currency: string;
}

export function PricingFaqSection({ pricingConfig, currency }: PricingFaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const defaultFaqs: FaqItem[] = [
    {
      q: "How do template downloads and tiers work?",
      a: currency === "INR"
        ? `SlideBee offers four membership tiers: Basic Free gives you 3 daily downloads from our Free templates library. Monthly Pro (₹${pricingConfig.tier_monthly_inr ?? 399}/mo) unlocks 30 Premium template downloads per month. Yearly Pro (₹${(Number(pricingConfig.tier_yearly_inr) || 3499).toLocaleString()}/yr) includes 30 Premium templates/mo plus an exclusive free design service for up to 10 slides. Lifetime VIP (₹${(Number(pricingConfig.tier_lifetime_inr) || 5999).toLocaleString()} one-time) gives you unlimited premium downloads forever without any renewal fees.`
        : `SlideBee offers four membership tiers: Basic Free gives you 3 daily downloads from our Free templates library. Monthly Pro ($${pricingConfig.tier_monthly_usd ?? 5}/mo) unlocks 30 Premium template downloads per month. Yearly Pro ($${pricingConfig.tier_yearly_usd ?? 45}/yr) includes 30 Premium templates/mo plus an exclusive free design service for up to 10 slides. Lifetime VIP ($${pricingConfig.tier_lifetime_usd ?? 75} one-time) gives you unlimited premium downloads forever without any renewal fees.`
    },
    {
      q: "What files do I receive with my downloads?",
      a: "Every template download includes 100% editable Master PowerPoint (.pptx) presentation files with embedded vector graphics, typography palettes, master slide layouts, and 16:9 widescreen format."
    },
    {
      q: "Can I use downloaded templates for commercial and client presentations?",
      a: "Yes, 100%. All paid plans include a full commercial royalty-free presentation license. You can use SlideBee decks for internal executive meetings, client presentations, sales pitches, and investor roadshows."
    },
    {
      q: "How does the Yearly Plan 10-slide design bonus work?",
      a: "When you subscribe to the SlideBee Yearly Plan, our senior presentation studio designers will personally build or redesign up to 10 custom slides for your next investor pitch, keynote, or board meeting for free."
    },
    {
      q: "Can I upgrade or cancel my plan anytime?",
      a: "Yes. You have full control from your account dashboard. You can upgrade from Free to Monthly or Yearly at any time, or cancel renewals with a single click."
    },
    {
      q: "Is my payment information secure?",
      a: "Yes, 100%. All transactions are processed through encrypted payment gateways with 256-bit SSL encryption. We never store your card details."
    }
  ];

  const faqs: FaqItem[] = (pricingConfig as any).faqs && Array.isArray((pricingConfig as any).faqs) && (pricingConfig as any).faqs.length > 0
    ? (pricingConfig as any).faqs
    : defaultFaqs;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-primary-amber text-xs font-extrabold uppercase tracking-wider block mb-2">
          Got Questions?
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
    </div>
  );
}
