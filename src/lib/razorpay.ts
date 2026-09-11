/**
 * SlideBee Razorpay Payment Gateway Integration
 * Supports Razorpay Test & Live modes with dynamic script loading and admin config.
 */

import { supabase } from "./supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

let razorpayScriptLoadingPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (razorpayScriptLoadingPromise) {
    return razorpayScriptLoadingPromise;
  }

  razorpayScriptLoadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptLoadingPromise;
}

export async function getRazorpayKey(): Promise<string> {
  // 1. Local Storage override (set via Admin panel)
  const localKey = localStorage.getItem("slidebee_razorpay_key");
  if (localKey && localKey.trim()) return localKey.trim();

  // 2. Vite Environment Variable
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim()) return envKey.trim();

  // 3. Supabase site_config
  try {
    const { data } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "razorpay_settings")
      .single();
    if (data?.value?.key_id) {
      return data.value.key_id.trim();
    }
  } catch (err) {
    // ignore
  }

  // 4. Default official test key
  return "rzp_test_TZARWG8iLkM589";
}

export interface CheckoutParams {
  amount: number; // in whole currency units (e.g. 499 INR or 9 USD)
  currency?: "INR" | "USD";
  title: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    isTestSimulation?: boolean;
  }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Trigger Razorpay payment modal or fallback test simulator
 */
export async function openRazorpayCheckout({
  amount,
  currency = "INR",
  title,
  description,
  prefill,
  onSuccess,
  onFailure,
  onDismiss,
}: CheckoutParams) {
  const isLoaded = await loadRazorpayScript();
  const key = await getRazorpayKey();

  // If Razorpay test key is provided and script is loaded, launch official Razorpay checkout!
  if (isLoaded && key && window.Razorpay) {
    const options = {
      key,
      amount: Math.round(amount * 100), // amount in lowest currency subunit (paise or cents)
      currency,
      name: "SlideBee Studio",
      description: `${title} — ${description}`,
      image: "https://theslidebee.com/logos/Slidebee_BlackBG.svg",
      prefill: {
        name: prefill?.name || "SlideBee Client",
        email: prefill?.email || "hello@theslidebee.com",
        contact: prefill?.contact || "",
      },
      theme: {
        color: "#FCBF14", // SlideBee Honey Gold
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      handler: function (response: any) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      if (onFailure) {
        onFailure(response.error);
      } else {
        alert(`Payment failed: ${response.error?.description || "Transaction cancelled"}`);
      }
    });
    rzp.open();
    return;
  }

  // Graceful Test Simulation when waiting for Razorpay API Test Key
  const confirmSimulation = window.confirm(
    `[Razorpay Test Mode Ready]\n\n` +
    `Item: ${title}\n` +
    `Amount: ${currency === "USD" ? "$" : "₹"}${amount}\n\n` +
    `Waiting for Razorpay API Test Key (rzp_test_...).\n` +
    `You can configure your Razorpay Key in Admin Dashboard -> Config tab at any time.\n\n` +
    `Would you like to simulate a SUCCESSFUL test payment now to verify instant delivery and email dispatch?`
  );

  if (confirmSimulation) {
    onSuccess({
      razorpay_payment_id: `pay_sim_${Date.now()}`,
      isTestSimulation: true,
    });
  } else {
    if (onDismiss) onDismiss();
  }
}
