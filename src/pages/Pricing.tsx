import { Link } from "react-router-dom";
import { Check, ArrowRight, Flame } from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";
import { usePricing } from "../features/pricing/usePricing";
import { PricingFaqSection } from "../features/pricing/PricingFaqSection";

export default function Pricing() {
  usePageSEO({
    title: "Pricing — Template Marketplace Plans | SlideBee",
    description: "SlideBee pricing: download presentation templates free with 3 daily downloads or choose Monthly, Yearly, or Lifetime access with 100% editable slides.",
  });

  const { pricingConfig, currency, handleSubscribeTier } = usePricing();
  const { tier_monthly_usd, tier_monthly_inr, tier_yearly_usd, tier_yearly_inr, tier_lifetime_usd, tier_lifetime_inr, rate_usd_redesign, rate_inr_redesign } = pricingConfig;

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden pt-28 pb-20 large-hex-grid">

      <section id="marketplace" className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 mb-24 scroll-mt-32">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] leading-tight mb-3">
            Download Premium Templates <br className="hidden sm:inline" />
            <span className="text-primary-amber">for Your Plan.</span>
          </h1>
          <p className="text-[#726F6D] text-sm font-medium max-w-xl mx-auto mb-6">
            Start with 3 free downloads per day, or unlock our complete 30-slide executive presentation library with Monthly, Yearly, or Lifetime access.
          </p>
        </div>

        {/* 4-Card Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto mb-12">

          {/* CARD 1: Basic Free */}
          <div className="hex-card-lg bg-white border-2 border-primary/40 hover:border-primary p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="hex-pill bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-3 py-1 uppercase tracking-wider">START HERE</span>
                <span className="text-[10px] text-[#726F6D] font-bold uppercase tracking-wider">Basic</span>
              </div>
              <div className="text-4xl font-heading font-black text-[#111111] mb-1">{currency === "USD" ? "$0" : "₹0"}</div>
              <p className="text-xs text-[#726F6D] font-medium mb-6">Explore template quality with daily starter downloads — no card required.</p>
              <div className="space-y-3 border-t border-primary/20 pt-5">
                {["3 Downloads Per Day", "Access to Free Templates Library", "Master PowerPoint (.pptx) download export", "16:9 Ultra-Wide Presentation Format", "Preview full executive slide catalog", "Standard community email support"].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300 mt-0.5"><Check size={11} className="text-emerald-800 stroke-[3]" /></div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/templates?tier=free" className="mt-8 hex-pill w-full block text-center bg-[#111111] hover:bg-black text-white font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-sm">
              Browse Free Templates <ArrowRight size={14} />
            </Link>
          </div>

          {/* CARD 2: Monthly */}
          <div className="hex-card-lg bg-white border-2 border-primary/50 hover:border-primary p-7 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="hex-pill bg-primary/20 text-[#111111] border border-primary/40 text-[10px] font-black px-3 py-1 uppercase tracking-wider">FLEXIBLE</span>
                <span className="text-[10px] text-primary-amber font-bold uppercase tracking-wider">Monthly</span>
              </div>
              <div className="text-4xl font-heading font-black text-[#111111] mb-1">
                {currency === "USD" ? `$${tier_monthly_usd ?? 5}` : `₹${tier_monthly_inr ?? 399}`}
                <span className="text-xs font-normal text-[#726F6D] ml-1">/month</span>
              </div>
              <p className="text-xs text-[#726F6D] font-medium mb-6">For active presenters needing regular access to fresh executive decks.</p>
              <div className="space-y-3 border-t border-primary/20 pt-5">
                {["30 Premium Templates Per Month", "Full access to all Premium & Executive decks", "100% Editable Master PowerPoint (.pptx)", "Commercial royalty-free presentation license", "New slide decks added weekly", "Standard customer support"].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 mt-0.5"><Check size={11} className="text-primary-amber stroke-[3]" /></div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => handleSubscribeTier("monthly")} className="mt-8 hex-pill w-full block text-center bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-md">
              Subscribe Monthly <ArrowRight size={14} />
            </button>
          </div>

          {/* CARD 3: Yearly — Best Value (dark highlight) */}
          <div className="hex-card-lg bg-[#111111] text-white border-2 border-primary ring-4 ring-primary/25 p-7 flex flex-col justify-between shadow-2xl relative lg:-translate-y-2 transition-all">
            <div className="hex-pill absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-[#111111] font-black text-[11px] px-5 py-1 uppercase tracking-wider shadow-xl inline-flex items-center gap-1.5 border border-black/20">
              <Flame size={12} className="text-[#111111]" /> BEST VALUE
            </div>
            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider">ANNUAL PASS</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Save 25%</span>
              </div>
              <div className="text-4xl font-heading font-black text-white mb-0.5">
                {currency === "USD" ? `$${tier_yearly_usd ?? 45}` : `₹${(Number(tier_yearly_inr) || 3499).toLocaleString()}`}
                <span className="text-xs font-normal text-[#888888] ml-1">/year</span>
              </div>
              <p className="text-[11px] text-primary font-bold mb-2">
                Equivalent to {currency === "USD" ? `$${((Number(tier_yearly_usd) || 45) / 12).toFixed(2)}/month` : `₹${Math.round((Number(tier_yearly_inr) || 3499) / 12)}/month`}
              </p>
              <p className="text-xs text-[#AAAAAA] font-medium mb-6">Everything in Monthly plus our exclusive bespoke 10-slide design bonus.</p>
              <div className="space-y-3 border-t border-white/10 pt-5">
                {["30 Premium Templates Per Month", "Bonus: Free design service for up to 10 slides", "Full access to all Premium & Executive decks", "100% Editable Master PowerPoint (.pptx)", "Commercial royalty-free presentation license", "Priority WhatsApp & Slack direct support", "Immediate access to new weekly deck releases"].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white/90 font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/60 mt-0.5"><Check size={11} className="text-primary stroke-[3]" /></div>
                    <span className={i === 1 ? "text-primary font-bold" : ""}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => handleSubscribeTier("yearly")} className="mt-8 hex-pill w-full block text-center bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black py-3.5 text-xs transition-all hover:scale-[1.03] flex items-center justify-center gap-1.5 shadow-xl">
              Get Yearly Plan <ArrowRight size={14} />
            </button>
          </div>

          {/* CARD 4: Lifetime */}
          <div className="hex-card-lg bg-white border-2 border-primary/50 hover:border-primary p-7 flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="hex-pill bg-[#111111] text-[#FCBF14] border border-[#FCBF14]/40 text-[10px] font-black px-3 py-1 uppercase tracking-wider">ONE-TIME PAYMENT</span>
                <span className="text-[10px] text-[#726F6D] font-bold uppercase tracking-wider">Lifetime</span>
              </div>
              <div className="text-4xl font-heading font-black text-[#111111] mb-1">
                {currency === "USD" ? `$${tier_lifetime_usd ?? 75}` : `₹${(Number(tier_lifetime_inr) || 5999).toLocaleString()}`}
                <span className="text-xs font-normal text-[#726F6D] ml-1">one-time</span>
              </div>
              <p className="text-xs text-[#726F6D] font-medium mb-6">Pay once, access forever. Never worry about another monthly or annual renewal.</p>
              <div className="space-y-3 border-t border-primary/20 pt-5">
                {["Unlimited Premium Templates & Downloads", "Never pay another monthly or yearly renewal", "All current & future templates included forever", "100% Editable Master PowerPoint (.pptx)", "Full commercial license for all client projects", "VIP priority support & custom deck requests"].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#111111] font-medium">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40 mt-0.5"><Check size={11} className="text-primary-amber stroke-[3]" /></div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => handleSubscribeTier("lifetime")} className="mt-8 hex-pill w-full block text-center bg-[#111111] hover:bg-black text-[#FCBF14] border border-primary/40 font-black py-3.5 text-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-md">
              Get Lifetime Access <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* Yearly Bonus Banner */}
        <div className="hex-card-lg bg-gradient-to-r from-[#FCBF14] via-[#F5B301] to-[#FCBF14] text-[#111111] p-8 sm:p-10 shadow-xl border-2 border-black/10 max-w-7xl mx-auto relative overflow-hidden mb-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-3xl">
              <span className="hex-pill inline-block bg-[#111111] text-[#FCBF14] text-[10px] font-black px-3.5 py-1 uppercase tracking-wider mb-3">
                Exclusive Annual Member Perk
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-[#111111] mb-2">
                YEARLY PLAN BONUS: Free Design Service for Up to 10 Slides
              </h3>
              <p className="text-sm font-medium text-[#111111]/85 leading-relaxed">
                When you subscribe to the SlideBee Yearly Plan ({currency === "USD" ? `$${tier_yearly_usd ?? 45}` : `₹${(Number(tier_yearly_inr) || 3499).toLocaleString()}`}), our senior presentation studio designers will personally build or redesign up to 10 custom slides for your next investor pitch, keynote, or board meeting for free ({currency === "USD" ? `$${(Number(rate_usd_redesign) || 19) * 10}+` : `₹${((Number(rate_inr_redesign) || 1499) * 10).toLocaleString()}+`} value).
              </p>
            </div>
            <button onClick={() => handleSubscribeTier("yearly")} className="hex-pill px-8 py-4 bg-[#111111] hover:bg-black text-[#FCBF14] font-black text-sm transition-all hover:scale-105 shadow-2xl flex items-center gap-2 shrink-0 border border-primary">
              <span>Claim 10-Slide Bonus</span><ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* FAQ */}
        <PricingFaqSection pricingConfig={pricingConfig} currency={currency} />

      </section>

    </div>
  );
}
