import {
  verifyRazorpaySignature,
  validatePromotion,
  getAuthoritativeBasePrice,
  recordPromotionRedemption,
} from "../functions/api/_promotions";
import { onRequestPost as handleDataPost } from "../functions/api/data";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail: string) {
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${testName}: ${detail}`);
  } else {
    failedCount++;
    console.error(`[FAIL] ${testName}: ${detail}`);
  }
}

// In-memory mock D1 database helper for promotions suite
function createMockD1Database(initialData: {
  promotions?: any[];
  promotion_redemptions?: any[];
  subscriptions?: any[];
  templates?: any[];
  site_config?: any[];
  sessions?: any[];
  profiles?: any[];
}) {
  const promotions = [...(initialData.promotions || [])];
  const promotion_redemptions = [...(initialData.promotion_redemptions || [])];
  const subscriptions = [...(initialData.subscriptions || [])];
  const templates = [...(initialData.templates || [])];
  const site_config = [...(initialData.site_config || [])];
  const sessions = [...(initialData.sessions || [])];
  const profiles = [...(initialData.profiles || [])];

  return {
    _data: {
      promotions,
      promotion_redemptions,
      subscriptions,
      templates,
      site_config,
      sessions,
      profiles,
    },
    prepare(query: string) {
      const q = query.replace(/\s+/g, " ").trim();
      return {
        _params: [] as any[],
        bind(...args: any[]) {
          this._params = args;
          return this;
        },
        async first() {
          if (q.includes("FROM promotions WHERE code = ?")) {
            const code = String(this._params[0] || "").toLowerCase();
            return (
              promotions.find(
                (p) => String(p.code || "").toLowerCase() === code && p.is_active === 1
              ) || null
            );
          }
          if (q.includes("FROM promotions WHERE code IS NULL")) {
            return (
              promotions.find((p) => p.code === null && p.is_active === 1) || null
            );
          }
          if (q.includes("FROM site_config WHERE key = 'pricing'")) {
            return site_config.find((c) => c.key === "pricing") || null;
          }
          if (q.includes("FROM templates WHERE id = ? OR code = ?")) {
            const id = this._params[0];
            return templates.find((t) => t.id === id || t.code === id) || null;
          }
          if (q.includes("FROM promotion_redemptions WHERE promotion_id = ? AND user_email = ?")) {
            const promoId = this._params[0];
            const email = String(this._params[1] || "").toLowerCase();
            const count = promotion_redemptions.filter(
              (r) => r.promotion_id === promoId && r.user_email.toLowerCase() === email
            ).length;
            return { count };
          }
          if (q.includes("FROM subscriptions WHERE user_email = ?")) {
            const email = String(this._params[0] || "").toLowerCase();
            return subscriptions.find((s) => s.user_email.toLowerCase() === email) || null;
          }
          if (q.includes("FROM sessions WHERE id = ?")) {
            const sid = this._params[0];
            return sessions.find((s) => s.id === sid) || null;
          }
          return null;
        },
        async all() {
          return { results: [] };
        },
        async run() {
          if (q.includes("INSERT INTO promotion_redemptions")) {
            promotion_redemptions.push({
              id: this._params[0],
              promotion_id: this._params[1],
              promotion_code: this._params[2],
              user_email: this._params[3],
              user_id: this._params[4],
              order_type: this._params[5],
              target_id: this._params[6],
              original_amount: this._params[7],
              discount_amount: this._params[8],
              final_amount: this._params[9],
              currency: this._params[10],
              payment_id: this._params[11],
              order_reference: this._params[12],
            });
            return { success: true };
          }
          if (q.includes("UPDATE promotions SET redemption_count = redemption_count + 1")) {
            const promoId = this._params[0];
            const p = promotions.find((item) => item.id === promoId);
            if (p) p.redemption_count = (p.redemption_count || 0) + 1;
            return { success: true };
          }
          return { success: true };
        },
      };
    },
  };
}

// Generate valid HMAC signature helper using Web Crypto API for test verification
async function generateTestSignature(orderId: string, paymentId: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(`${orderId}|${paymentId}`));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function runPromotionsSecuritySuite() {
  console.log("\n=== SLIDEBEE PROMOTIONS & DISCOUNT SECURITY TEST SUITE ===\n");

  const TEST_SECRET = "super_secure_razorpay_secret_key_12345";
  const TEST_ORDER_ID = "order_Oq7J1aBc987";
  const TEST_PAYMENT_ID = "pay_Pq1L2mNo456";

  // --- 1. Razorpay HMAC-SHA256 Signature Verification ---
  console.log("--- 1. Cryptographic Payment Verification (HMAC-SHA256) ---");

  const validSig = await generateTestSignature(TEST_ORDER_ID, TEST_PAYMENT_ID, TEST_SECRET);
  const isValid = await verifyRazorpaySignature(TEST_ORDER_ID, TEST_PAYMENT_ID, validSig, TEST_SECRET);
  assert(isValid, "Legitimate Signature Verification", "Valid Razorpay HMAC signature successfully authenticated.");

  const tamperedSig = validSig.slice(0, -4) + "0000";
  const isTamperedValid = await verifyRazorpaySignature(TEST_ORDER_ID, TEST_PAYMENT_ID, tamperedSig, TEST_SECRET);
  assert(!isTamperedValid, "Tampered Signature Defense", "Manipulated cryptographic signature rejected with false.");

  const isCrossPaymentValid = await verifyRazorpaySignature(TEST_ORDER_ID, "pay_TAMPERED999", validSig, TEST_SECRET);
  assert(!isCrossPaymentValid, "Payment Identifier Binding", "Signature bound to different payment ID rejected.");

  // --- 2. Authoritative Base Price Calculation ---
  console.log("\n--- 2. Server-Authoritative Base Pricing Resolution ---");

  const mockDb = createMockD1Database({
    promotions: [
      {
        id: "prm_diwali50_2026",
        code: "DIWALI50",
        name: "Diwali Festival Studio Special",
        description: "Flat 50% discount",
        discount_type: "percentage",
        discount_value: 50,
        currency: "ALL",
        applicable_scope: "all",
        eligible_tiers: '["monthly","yearly","lifetime"]',
        eligible_template_ids: null,
        min_order_amount_inr: 0,
        min_order_amount_usd: 0,
        starts_at: "2026-01-01 00:00:00",
        expires_at: "2027-12-31 23:59:59",
        max_total_redemptions: 1000,
        redemption_count: 0,
        max_redemptions_per_user: 1,
        first_time_subscribers_only: 0,
        is_active: 1,
      },
      {
        id: "prm_welcome20_sub_only",
        code: "SUB20",
        name: "Subscribers Only 20%",
        description: "20% off Pro subscriptions",
        discount_type: "percentage",
        discount_value: 20,
        currency: "INR",
        applicable_scope: "subscription",
        eligible_tiers: '["yearly","lifetime"]',
        starts_at: "2026-01-01 00:00:00",
        expires_at: "2027-12-31 23:59:59",
        max_total_redemptions: 500,
        redemption_count: 0,
        max_redemptions_per_user: 1,
        first_time_subscribers_only: 0,
        is_active: 1,
      },
      {
        id: "prm_expired_campaign",
        code: "EXPIRED50",
        name: "Past Offer",
        discount_type: "percentage",
        discount_value: 50,
        currency: "ALL",
        applicable_scope: "all",
        starts_at: "2025-01-01 00:00:00",
        expires_at: "2025-06-01 00:00:00",
        max_total_redemptions: 100,
        redemption_count: 10,
        max_redemptions_per_user: 1,
        is_active: 1,
      },
    ],
    templates: [
      {
        id: "tpl-executive-pitch",
        code: "SLD-PITCH-01",
        title: "Executive Pitch Deck",
        price_usd: 29,
        price_inr: 2299,
      },
    ],
    promotion_redemptions: [
      {
        id: "rdm-existing-user",
        promotion_id: "prm_diwali50_2026",
        user_email: "alreadyredeemed@acme.com",
      },
    ],
  });

  const subPriceInr = await getAuthoritativeBasePrice(mockDb, "subscription", "yearly", "INR");
  assert(subPriceInr.basePrice === 3499, "Yearly Sub Base INR", "Authoritative yearly price resolved to 3499 INR.");

  const subPriceUsd = await getAuthoritativeBasePrice(mockDb, "subscription", "lifetime", "USD");
  assert(subPriceUsd.basePrice === 75, "Lifetime Sub Base USD", "Authoritative lifetime price resolved to 75 USD.");

  const tplPrice = await getAuthoritativeBasePrice(mockDb, "template", "tpl-executive-pitch", "INR");
  assert(tplPrice.basePrice === 2299, "Template Base Price INR", "Authoritative template price resolved to 2299 INR.");

  // --- 3. Discount Math & Validation ---
  console.log("\n--- 3. Server-Authoritative Promotion Math ---");

  const diwaliYearly = await validatePromotion(mockDb, {
    code: "DIWALI50",
    orderType: "subscription",
    targetId: "yearly",
    currency: "INR",
    userEmail: "client@test.com",
  });

  assert(diwaliYearly.valid, "DIWALI50 Validation", "Valid promo DIWALI50 passes all checks.");
  if (diwaliYearly.valid) {
    assert(diwaliYearly.discountAmount === 1749.5, "Percentage Discount Calc", "50% of ₹3,499 calculated as ₹1,749.50.");
    assert(diwaliYearly.finalAmount === 1749.5, "Final Amount Calc", "Final charged amount calculated as ₹1,749.50.");
  }

  // --- 4. Eligibility & Security Rules ---
  console.log("\n--- 4. Eligibility, Scope, and Expiration Defense ---");

  // Ineligible scope
  const invalidScopeRes = await validatePromotion(mockDb, {
    code: "SUB20",
    orderType: "template",
    targetId: "tpl-executive-pitch",
    currency: "INR",
  });
  assert(!invalidScopeRes.valid && invalidScopeRes.errorCode === "INELIGIBLE_SCOPE", "Scope Boundary Enforcement", "Subscription-only coupon rejected on template purchase.");

  // Ineligible tier (monthly not in ['yearly', 'lifetime'])
  const invalidTierRes = await validatePromotion(mockDb, {
    code: "SUB20",
    orderType: "subscription",
    targetId: "monthly",
    currency: "INR",
  });
  assert(!invalidTierRes.valid && invalidTierRes.errorCode === "INELIGIBLE_TIER", "Tier Whitelist Enforcement", "Tier-restricted coupon rejected on excluded tier.");

  // Expired coupon
  const expiredRes = await validatePromotion(mockDb, {
    code: "EXPIRED50",
    orderType: "subscription",
    targetId: "yearly",
    currency: "INR",
  });
  assert(!expiredRes.valid && expiredRes.errorCode === "EXPIRED", "Expiration Enforcement", "Expired promotional campaign rejected.");

  // Per-user redemption limit
  const userLimitRes = await validatePromotion(mockDb, {
    code: "DIWALI50",
    orderType: "subscription",
    targetId: "yearly",
    currency: "INR",
    userEmail: "alreadyredeemed@acme.com",
  });
  assert(!userLimitRes.valid && userLimitRes.errorCode === "USER_LIMIT_REACHED", "Per-User Limit Enforcement", "Repeat redemption attempt by same email rejected.");

  // --- 5. Atomic Redemption Recording ---
  console.log("\n--- 5. Atomic Promotion Redemption Recording ---");

  const recorded = await recordPromotionRedemption(mockDb, {
    promotionId: "prm_diwali50_2026",
    promotionCode: "DIWALI50",
    userEmail: "freshuser@acme.com",
    orderType: "subscription",
    targetId: "yearly",
    originalAmount: 3499,
    discountAmount: 1749.5,
    finalAmount: 1749.5,
    currency: "INR",
    paymentId: "pay_test_atomic_123",
  });

  assert(recorded, "Redemption Recorded", "Redemption logged atomically in promotion_redemptions.");
  const promoRecord = mockDb._data.promotions.find((p) => p.id === "prm_diwali50_2026");
  assert(promoRecord?.redemption_count === 1, "Counter Increment", "Global redemption count incremented to 1.");

  // --- 6. Table Gatekeeper Non-Admin Mutation Protection ---
  console.log("\n--- 6. D1 Access Control & Anti-Tampering ---");

  const fakeNonAdminContext = {
    request: new Request("http://localhost/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "insert",
        table: "promotions",
        values: { code: "HACK99", discount_value: 99 },
      }),
    }),
    env: { DB: mockDb },
  };

  const gatekeeperRes = await handleDataPost(fakeNonAdminContext as any);
  assert(
    gatekeeperRes.status === 403,
    "Promotions Mutation RBAC",
    "Direct mutation of 'promotions' blocked with HTTP 403 for non-admin."
  );

  const fakeRedemptionsContext = {
    request: new Request("http://localhost/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete",
        table: "promotion_redemptions",
        filters: [],
      }),
    }),
    env: { DB: mockDb },
  };

  const redemptionsGatekeeperRes = await handleDataPost(fakeRedemptionsContext as any);
  assert(
    redemptionsGatekeeperRes.status === 403,
    "Promotion Redemptions RBAC",
    "Direct deletion of 'promotion_redemptions' blocked with HTTP 403 for non-admin."
  );

  console.log("\n==================================================");
  console.log(`RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPromotionsSecuritySuite().catch((err) => {
  console.error("Test execution exception:", err);
  process.exit(1);
});
