/**
 * SlideBee Razorpay Payment Gateway Integration
 * Supports Razorpay Test & Live modes with dynamic script loading and admin config.
 */

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
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim()) return envKey.trim();
  return "rzp_test_TZARWG8iLkM589";
}

export interface CheckoutParams {
  amount: number; // in whole currency units (e.g. 499 INR or 9 USD)
  orderId?: string; // Optional server-created Razorpay order_id
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
 * Display a branded pre-checkout modal informing the client or reviewer that the gateway
 * is currently undergoing Razorpay merchant verification and operating in sandbox test mode.
 */
function promptSandboxNotice(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(true);
      return;
    }

    const existing = document.getElementById("slidebee-sandbox-modal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "slidebee-sandbox-modal";
    overlay.style.cssText = [
      "position: fixed",
      "inset: 0",
      "z-index: 999999",
      "display: flex",
      "align-items: center",
      "justify-content: center",
      "background: rgba(10, 10, 10, 0.78)",
      "backdrop-filter: blur(8px)",
      "-webkit-backdrop-filter: blur(8px)",
      "padding: 16px",
      "font-family: 'Manrope', system-ui, -apple-system, sans-serif",
    ].join(";");

    const card = document.createElement("div");
    card.style.cssText = [
      "background: #111111",
      "border: 1px solid rgba(252, 191, 20, 0.4)",
      "border-radius: 16px",
      "max-width: 460px",
      "width: 100%",
      "padding: 24px",
      "color: #FFFFFF",
      "box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 24px rgba(252, 191, 20, 0.12)",
    ].join(";");

    card.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px;">
        <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(252, 191, 20, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(252, 191, 20, 0.25);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FCBF14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #FCBF14; margin-bottom: 2px;">
            Merchant Verification Notice
          </div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #FFFFFF;">
            Payment Gateway Under Review
          </h3>
        </div>
      </div>

      <p style="margin: 0 0 14px 0; font-size: 13px; line-height: 1.55; color: #A1A1AA;">
        SlideBee is currently undergoing merchant compliance review with Razorpay. Live card transactions will be activated upon final compliance sign-off.
      </p>

      <div style="background: rgba(252, 191, 20, 0.06); border: 1px dashed rgba(252, 191, 20, 0.35); border-radius: 8px; padding: 12px 14px; margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 600; color: #FCBF14; margin-bottom: 2px;">
          Sandbox Demonstration Mode
        </div>
        <div style="font-size: 12px; line-height: 1.45; color: #D4D4D8;">
          This checkout runs in sandbox test mode. No real money or cards will be charged. Please do not enter real credit card numbers or sensitive credentials.
        </div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center;">
        <button id="sb-sandbox-cancel" type="button" style="padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; background: #1A1A1A; border: 1px solid #333333; color: #D4D4D8; cursor: pointer;">
          Cancel
        </button>
        <button id="sb-sandbox-proceed" type="button" style="padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; background: #FCBF14; border: none; color: #111111; cursor: pointer;">
          Proceed in Test Mode
        </button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const cleanup = () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    const cancelBtn = document.getElementById("sb-sandbox-cancel");
    const proceedBtn = document.getElementById("sb-sandbox-proceed");

    cancelBtn?.addEventListener("click", () => {
      cleanup();
      resolve(false);
    });

    proceedBtn?.addEventListener("click", () => {
      cleanup();
      resolve(true);
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
  });
}

/**
 * Trigger Razorpay payment modal or fallback test simulator
 */
export async function openRazorpayCheckout({
  amount,
  orderId,
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
    const isTestKey = key.startsWith("rzp_test_");

    // In sandbox test mode, inform the user with a pre-checkout compliance notice
    if (isTestKey) {
      const shouldProceed = await promptSandboxNotice();
      if (!shouldProceed) {
        if (onDismiss) onDismiss();
        return;
      }
    }

    const options: any = {
      key,
      amount: Math.round(amount * 100), // amount in lowest currency subunit (paise or cents)
      currency,
      name: "SlideBee Studio",
      description: isTestKey
        ? `[Sandbox Review Mode] ${title} — ${description}`
        : `${title} — ${description}`,
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
          razorpay_order_id: response.razorpay_order_id || orderId,
          razorpay_signature: response.razorpay_signature,
        });
      },
    };

    // Only attach order_id if it is an authentic Razorpay Order ID created via official Orders API
    // Internal fallback/simulation IDs (e.g. "order_sim_...") must be omitted so Razorpay opens standard checkout
    if (orderId && orderId.startsWith("order_") && !orderId.startsWith("order_sim_")) {
      options.order_id = orderId;
    }

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

  // If Razorpay could not be loaded or key is missing, report error cleanly
  const errMsg = !isLoaded
    ? "Payment gateway script failed to load. Please check your internet connection or ad-blocker."
    : "Payment gateway configuration is missing. Please contact support.";

  if (onFailure) {
    onFailure(new Error(errMsg));
  } else {
    alert(errMsg);
  }
}
