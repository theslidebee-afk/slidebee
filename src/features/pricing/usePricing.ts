import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { d1 } from "../../lib/d1";
import { openRazorpayCheckout } from "../../lib/razorpay";
import { useCurrency } from "../../context/CurrencyContext";

export interface PricingConfig {
  rate_usd_redesign: number;
  rate_usd_pitch: number;
  rate_usd_executive: number;
  rate_inr_redesign: number;
  rate_inr_pitch: number;
  rate_inr_executive: number;
  monthly_retainer_usd: number;
  monthly_retainer_inr: number;
  tier_monthly_usd: number;
  tier_monthly_inr: number;
  tier_yearly_usd: number;
  tier_yearly_inr: number;
  tier_lifetime_usd: number;
  tier_lifetime_inr: number;
  pro_monthly_inr: number;
  pro_discount_percent: number;
  faqs?: any[];
}

const DEFAULTS: PricingConfig = {
  rate_usd_redesign: 19,
  rate_usd_pitch: 29,
  rate_usd_executive: 49,
  rate_inr_redesign: 1499,
  rate_inr_pitch: 2299,
  rate_inr_executive: 3899,
  monthly_retainer_usd: 1490,
  monthly_retainer_inr: 119000,
  tier_monthly_usd: 5,
  tier_monthly_inr: 399,
  tier_yearly_usd: 45,
  tier_yearly_inr: 3499,
  tier_lifetime_usd: 75,
  tier_lifetime_inr: 5999,
  pro_monthly_inr: 199,
  pro_discount_percent: 50,
};

export function usePricing() {
  const location = useLocation();
  const { currency } = useCurrency();
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULTS);

  useEffect(() => {
    async function loadPricing() {
      try {
        const { data } = await d1.from("site_config").select("value").eq("key", "pricing").single();
        if (data?.value) setPricingConfig((prev) => ({ ...prev, ...data.value }));
      } catch (err) {
        console.warn("Could not load dynamic pricing:", err);
      }
    }
    loadPricing();
  }, []);

  // Auto-scroll to hash anchor
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }, [location.hash]);

  const handleSubscribeTier = async (tier: "monthly" | "yearly" | "lifetime") => {
    const monthlyUsd = Number(pricingConfig.tier_monthly_usd) || 5;
    const yearlyUsd = Number(pricingConfig.tier_yearly_usd) || 45;
    const lifetimeUsd = Number(pricingConfig.tier_lifetime_usd) || 75;
    const monthlyInr = Number(pricingConfig.tier_monthly_inr) || 399;
    const yearlyInr = Number(pricingConfig.tier_yearly_inr) || 3499;
    const lifetimeInr = Number(pricingConfig.tier_lifetime_inr) || 5999;

    let amount = 5;
    let title = "SlideBee Monthly Pro";
    let desc = "30 Premium Presentation Templates per month";

    if (currency === "USD") {
      if (tier === "monthly") { amount = monthlyUsd; title = `SlideBee Monthly Pro ($${monthlyUsd}/mo)`; }
      else if (tier === "yearly") { amount = yearlyUsd; title = `SlideBee Yearly Pro ($${yearlyUsd}/yr)`; desc = "30 Premium Templates/mo + Free 10-Slide Bespoke Design Service"; }
      else if (tier === "lifetime") { amount = lifetimeUsd; title = `SlideBee Lifetime VIP ($${lifetimeUsd} one-time)`; desc = "Unlimited Premium Presentation Downloads Forever"; }
    } else {
      if (tier === "monthly") { amount = monthlyInr; title = `SlideBee Monthly Pro (₹${monthlyInr}/mo)`; }
      else if (tier === "yearly") { amount = yearlyInr; title = `SlideBee Yearly Pro (₹${yearlyInr.toLocaleString()}/yr)`; desc = "30 Premium Templates/mo + Free 10-Slide Bespoke Design Service"; }
      else if (tier === "lifetime") { amount = lifetimeInr; title = `SlideBee Lifetime VIP (₹${lifetimeInr.toLocaleString()} one-time)`; desc = "Unlimited Premium Presentation Downloads Forever"; }
    }

    const { data: { session } } = await d1.auth.getSession();
    if (!session?.user) {
      window.location.href = `/login?redirect=pricing&tier=${tier}`;
      return;
    }

    await openRazorpayCheckout({
      amount,
      currency: currency === "USD" ? "USD" : "INR",
      title,
      description: desc,
      prefill: { email: session.user.email || "", name: session.user.user_metadata?.full_name || "SlideBee Member" },
      onSuccess: async (rzpRes: any) => {
        try {
          await fetch("/api/subscribe-pro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: rzpRes.razorpay_payment_id || "rzp_direct",
              userId: session.user.id,
              userEmail: session.user.email,
              tier, amount, currency, planName: title, billingPeriod: tier,
            }),
          });
        } catch (subErr) {
          console.warn("Subscription provisioning error:", subErr);
        }
        window.location.href = "/login?tier_upgraded=" + tier;
      },
      onFailure: (err: any) => { console.error("Checkout failed:", err); },
    });
  };

  return { pricingConfig, currency, handleSubscribeTier };
}
