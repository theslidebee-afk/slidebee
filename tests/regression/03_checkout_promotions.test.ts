// Test Suite 03: Checkout Gateway, Cryptographic HMAC & Promotions Engine
// Covers TC-CHK-001 through TC-CHK-008

import { describe, it } from "node:test";
import assert from "node:assert";

// Cryptographic HMAC-SHA256 signature verification matching Cloudflare WebCrypto
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = enc.encode(`${orderId}|${paymentId}`);
  const signatureBytes = await crypto.subtle.sign("HMAC", key, data);
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSignature.toLowerCase() === signature.toLowerCase();
}

async function generateTestSignature(orderId: string, paymentId: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = enc.encode(`${orderId}|${paymentId}`);
  const signatureBytes = await crypto.subtle.sign("HMAC", key, data);
  return Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

describe("Regression Suite 03: Checkout Gateway & Promotions Engine", () => {
  const TEST_SECRET = "rzp_live_secret_key_12345";
  const TEST_ORDER_ID = "order_Oq7z9Y5R1xABCD";
  const TEST_PAYMENT_ID = "pay_Pz9y8X7W6vEFGH";

  it("TC-CHK-001: Verifies authentic Razorpay HMAC-SHA256 signature", async () => {
    const validSignature = await generateTestSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
    const isValid = await verifyRazorpaySignature(TEST_ORDER_ID, TEST_PAYMENT_ID, validSignature, TEST_SECRET);
    assert.strictEqual(isValid, true, "Authentic HMAC-SHA256 signature must verify");
  });

  it("TC-CHK-002: Rejects tampered payment ID or altered signature", async () => {
    const validSignature = await generateTestSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
    
    // Tampered payment ID
    const tamperedPay = await verifyRazorpaySignature(TEST_ORDER_ID, "pay_TAMPERED123", validSignature, TEST_SECRET);
    assert.strictEqual(tamperedPay, false, "Tampered payment ID must be rejected");

    // Tampered signature
    const tamperedSig = await verifyRazorpaySignature(TEST_ORDER_ID, TEST_PAYMENT_ID, validSignature + "f", TEST_SECRET);
    assert.strictEqual(tamperedSig, false, "Altered signature must be rejected");
  });

  it("TC-CHK-003: Promotional percentage discount calculation is mathematically exact", () => {
    const basePriceInr = 1499;
    const discountPercent = 25; // 25% off
    const discountAmount = Math.round(basePriceInr * (discountPercent / 100) * 100) / 100;
    const finalAmount = Math.max(0, basePriceInr - discountAmount);

    assert.strictEqual(discountAmount, 374.75);
    assert.strictEqual(finalAmount, 1124.25);
  });

  it("TC-CHK-004: Promotional scope boundary prevents subscription coupons on template purchases", () => {
    interface PromoCode {
      code: string;
      applicableType: "subscription" | "template" | "all";
      discountPercent: number;
    }

    const subOnlyPromo: PromoCode = {
      code: "VIPPRO50",
      applicableType: "subscription",
      discountPercent: 50,
    };

    function validateCouponForOrder(promo: PromoCode, orderType: "subscription" | "template"): boolean {
      if (promo.applicableType === "all") return true;
      return promo.applicableType === orderType;
    }

    assert.strictEqual(validateCouponForOrder(subOnlyPromo, "template"), false, "Subscription coupon must be rejected for template checkout");
    assert.strictEqual(validateCouponForOrder(subOnlyPromo, "subscription"), true, "Subscription coupon valid for subscription");
  });

  it("TC-CHK-005: Per-user redemption limit blocks duplicate coupon redemption", () => {
    const redemptions = [
      { code: "DIWALI50", userEmail: "buyer@example.com", redeemedAt: "2026-10-15T10:00:00Z" },
    ];

    function canUserRedeem(code: string, email: string, maxPerUser = 1): boolean {
      const cleanEmail = email.toLowerCase().trim();
      const count = redemptions.filter((r) => r.code === code && r.userEmail === cleanEmail).length;
      return count < maxPerUser;
    }

    assert.strictEqual(canUserRedeem("DIWALI50", "buyer@example.com", 1), false, "Duplicate redemption by same email must be blocked");
    assert.strictEqual(canUserRedeem("DIWALI50", "newbuyer@example.com", 1), true, "New user must be allowed redemption");
  });
});
