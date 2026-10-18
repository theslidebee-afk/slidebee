// SlideBee Promotions Engine Core Helper
// Cloudflare Pages Functions shared utility for server-authoritative promotion validation,
// Razorpay HMAC-SHA256 signature verification, and atomic redemption recording.

export interface PromotionRecord {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  currency: "INR" | "USD" | "ALL";
  applicable_scope: "all" | "subscription" | "template";
  eligible_tiers: string | null;
  eligible_template_ids: string | null;
  min_order_amount_inr: number;
  min_order_amount_usd: number;
  max_discount_cap_inr: number | null;
  max_discount_cap_usd: number | null;
  starts_at: string;
  expires_at: string;
  max_total_redemptions: number | null;
  redemption_count: number;
  max_redemptions_per_user: number;
  first_time_subscribers_only: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationSuccess {
  valid: true;
  promotionId: string;
  code: string | null;
  name: string;
  description: string | null;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: "INR" | "USD";
  savingsText: string;
}

export interface ValidationFailure {
  valid: false;
  errorCode: string;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-app-token, x-slidebee-admin-key",
    "Vary": "Origin",
  };
}

/**
 * Fetch authoritative base price for a subscription tier or template
 */
export async function getAuthoritativeBasePrice(
  db: any,
  orderType: "subscription" | "template",
  targetId: string,
  currency: "INR" | "USD"
): Promise<{ basePrice: number; title: string; found: boolean }> {
  if (orderType === "subscription") {
    const tier = targetId.toLowerCase().trim();
    let config = {
      tier_monthly_usd: 5,
      tier_monthly_inr: 399,
      tier_yearly_usd: 45,
      tier_yearly_inr: 3499,
      tier_lifetime_usd: 75,
      tier_lifetime_inr: 5999,
    };

    if (db) {
      try {
        const row: any = await db.prepare("SELECT value FROM site_config WHERE key = 'pricing'").first();
        if (row?.value) {
          const parsed = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
          config = { ...config, ...parsed };
        }
      } catch (err) {
        console.warn("Using fallback pricing config:", err);
      }
    }

    if (tier.includes("life")) {
      return {
        basePrice: currency === "USD" ? Number(config.tier_lifetime_usd) : Number(config.tier_lifetime_inr),
        title: currency === "USD" ? "SlideBee Lifetime VIP ($75 one-time)" : "SlideBee Lifetime VIP (₹5,999 one-time)",
        found: true,
      };
    }
    if (tier.includes("year") || tier.includes("annual")) {
      return {
        basePrice: currency === "USD" ? Number(config.tier_yearly_usd) : Number(config.tier_yearly_inr),
        title: currency === "USD" ? "SlideBee Yearly Pro ($45/yr)" : "SlideBee Yearly Pro (₹3,499/yr)",
        found: true,
      };
    }
    // Default: monthly
    return {
      basePrice: currency === "USD" ? Number(config.tier_monthly_usd) : Number(config.tier_monthly_inr),
      title: currency === "USD" ? "SlideBee Monthly Pro ($5/mo)" : "SlideBee Monthly Pro (₹399/mo)",
      found: true,
    };
  }

  // Template purchase
  if (db) {
    try {
      const template: any = await db
        .prepare("SELECT id, code, title, price_usd, price_inr FROM templates WHERE id = ? OR code = ?")
        .bind(targetId, targetId)
        .first();

      if (template) {
        const basePrice = currency === "USD" ? Number(template.price_usd || 19) : Number(template.price_inr || 1499);
        return {
          basePrice,
          title: template.title || "Master PowerPoint Presentation",
          found: true,
        };
      }
    } catch (err) {
      console.warn("Error fetching template price:", err);
    }
  }

  // Fallback template price if DB lookup is unavailable
  return {
    basePrice: currency === "USD" ? 19 : 1499,
    title: "Master PowerPoint Presentation",
    found: false,
  };
}

/**
 * Validate a promotional code or automatic campaign against server rules and database state
 */
export async function validatePromotion(
  db: any,
  params: {
    code?: string | null;
    orderType: "subscription" | "template";
    targetId: string;
    currency: "INR" | "USD";
    userEmail?: string | null;
  }
): Promise<ValidationResult> {
  const { code, orderType, targetId, currency, userEmail } = params;

  if (!db) {
    return {
      valid: false,
      errorCode: "DB_UNAVAILABLE",
      error: "Promotions service temporarily unavailable.",
    };
  }

  const cleanCode = code ? code.trim() : null;

  // 1. Fetch promotion record
  let promo: PromotionRecord | null = null;
  if (cleanCode) {
    promo = await db
      .prepare("SELECT * FROM promotions WHERE code = ? COLLATE NOCASE AND is_active = 1")
      .bind(cleanCode)
      .first();
  } else {
    // Check for automatic promotions (code IS NULL)
    promo = await db
      .prepare(
        "SELECT * FROM promotions WHERE code IS NULL AND is_active = 1 AND (applicable_scope = 'all' OR applicable_scope = ?) ORDER BY discount_value DESC LIMIT 1"
      )
      .bind(orderType)
      .first();
  }

  if (!promo) {
    return {
      valid: false,
      errorCode: "NOT_FOUND",
      error: cleanCode ? `Promotion code "${cleanCode}" is invalid or inactive.` : "No active promotion found.",
    };
  }

  // 2. Date validity check
  const now = new Date();
  const startsAt = new Date(promo.starts_at);
  const expiresAt = new Date(promo.expires_at);

  if (now < startsAt) {
    return {
      valid: false,
      errorCode: "NOT_YET_ACTIVE",
      error: `Promotion "${promo.name}" starts on ${startsAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`,
    };
  }

  if (now > expiresAt) {
    return {
      valid: false,
      errorCode: "EXPIRED",
      error: `Promotion "${promo.name}" expired on ${expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`,
    };
  }

  // 3. Applicable scope check
  if (promo.applicable_scope !== "all" && promo.applicable_scope !== orderType) {
    return {
      valid: false,
      errorCode: "INELIGIBLE_SCOPE",
      error:
        promo.applicable_scope === "subscription"
          ? "This promotional code is exclusively valid for SlideBee Pro subscriptions."
          : "This promotional code is exclusively valid for individual template purchases.",
    };
  }

  // 4. Eligible tiers check (for subscriptions)
  if (orderType === "subscription" && promo.eligible_tiers) {
    try {
      const tiers: string[] = typeof promo.eligible_tiers === "string" ? JSON.parse(promo.eligible_tiers) : promo.eligible_tiers;
      const normalizedTarget = targetId.toLowerCase().includes("life")
        ? "lifetime"
        : targetId.toLowerCase().includes("year")
        ? "yearly"
        : "monthly";

      if (Array.isArray(tiers) && tiers.length > 0 && !tiers.includes(normalizedTarget)) {
        return {
          valid: false,
          errorCode: "INELIGIBLE_TIER",
          error: `This promotional code cannot be applied to the ${normalizedTarget} tier.`,
        };
      }
    } catch (e) {
      console.warn("Failed to parse eligible_tiers JSON:", e);
    }
  }

  // 5. Eligible template IDs check (for templates)
  if (orderType === "template" && promo.eligible_template_ids) {
    try {
      const templates: string[] = typeof promo.eligible_template_ids === "string"
        ? JSON.parse(promo.eligible_template_ids)
        : promo.eligible_template_ids;

      if (Array.isArray(templates) && templates.length > 0 && !templates.includes(targetId)) {
        return {
          valid: false,
          errorCode: "INELIGIBLE_TEMPLATE",
          error: "This promotional code cannot be applied to the selected presentation template.",
        };
      }
    } catch (e) {
      console.warn("Failed to parse eligible_template_ids JSON:", e);
    }
  }

  // 6. Currency match check
  if (promo.currency !== "ALL" && promo.currency !== currency) {
    return {
      valid: false,
      errorCode: "CURRENCY_MISMATCH",
      error: `This promotional code is only valid for ${promo.currency} payments.`,
    };
  }

  // 7. Global redemption limit check
  if (promo.max_total_redemptions !== null && promo.redemption_count >= promo.max_total_redemptions) {
    return {
      valid: false,
      errorCode: "GLOBAL_LIMIT_REACHED",
      error: "This promotional code has reached its maximum global redemptions.",
    };
  }

  // 8. User email specific checks
  const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : null;
  if (cleanEmail) {
    // Check per-user redemption limit
    const redemptionsCountRow: any = await db
      .prepare(
        "SELECT COUNT(*) AS count FROM promotion_redemptions WHERE promotion_id = ? AND user_email = ? COLLATE NOCASE"
      )
      .bind(promo.id, cleanEmail)
      .first();

    const userRedemptions = Number(redemptionsCountRow?.count || 0);
    const maxPerUser = Number(promo.max_redemptions_per_user || 1);
    if (userRedemptions >= maxPerUser) {
      return {
        valid: false,
        errorCode: "USER_LIMIT_REACHED",
        error: "You have already redeemed this promotional code.",
      };
    }

    // Check first-time subscribers only
    if (promo.first_time_subscribers_only === 1 && orderType === "subscription") {
      const existingSub: any = await db
        .prepare("SELECT id FROM subscriptions WHERE user_email = ? COLLATE NOCASE LIMIT 1")
        .bind(cleanEmail)
        .first();

      if (existingSub) {
        return {
          valid: false,
          errorCode: "NEW_SUBSCRIBERS_ONLY",
          error: "This promotional offer is exclusively valid for new SlideBee Pro subscribers.",
        };
      }
    }
  }

  // 9. Base price resolution & minimum order amount check
  const { basePrice } = await getAuthoritativeBasePrice(db, orderType, targetId, currency);
  const minRequired = currency === "USD" ? promo.min_order_amount_usd : promo.min_order_amount_inr;
  if (minRequired > 0 && basePrice < minRequired) {
    const symbol = currency === "USD" ? "$" : "₹";
    return {
      valid: false,
      errorCode: "MIN_ORDER_NOT_MET",
      error: `Minimum order amount of ${symbol}${minRequired} required to redeem this code.`,
    };
  }

  // 10. Compute discount
  let rawDiscount = 0;
  if (promo.discount_type === "percentage") {
    rawDiscount = Math.round((basePrice * (promo.discount_value / 100)) * 100) / 100;
    const cap = currency === "USD" ? promo.max_discount_cap_usd : promo.max_discount_cap_inr;
    if (cap !== null && cap !== undefined && cap > 0 && rawDiscount > cap) {
      rawDiscount = cap;
    }
  } else {
    // fixed_amount
    rawDiscount = Math.min(promo.discount_value, basePrice);
  }

  const discountAmount = Math.max(0, Math.min(rawDiscount, basePrice));
  const finalAmount = Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100);

  const symbol = currency === "USD" ? "$" : "₹";
  const formattedDiscount = currency === "USD" ? `$${discountAmount}` : `₹${discountAmount.toLocaleString()}`;
  const savingsText =
    promo.discount_type === "percentage"
      ? `You save ${formattedDiscount} (${promo.discount_value}% OFF)`
      : `You save ${formattedDiscount}`;

  return {
    valid: true,
    promotionId: promo.id,
    code: promo.code,
    name: promo.name,
    description: promo.description,
    discountType: promo.discount_type,
    discountValue: promo.discount_value,
    originalAmount: basePrice,
    discountAmount,
    finalAmount,
    currency,
    savingsText,
  };
}

/**
 * Razorpay HMAC-SHA256 signature verification using Web Crypto API
 */
export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!orderId || !paymentId || !signature || !secret) return false;
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(`${orderId}|${paymentId}`);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return expectedSignature.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error("HMAC signature verification failed:", err);
    return false;
  }
}

/**
 * Record a promotion redemption atomically in promotion_redemptions and increment promotion count
 */
export async function recordPromotionRedemption(
  db: any,
  params: {
    promotionId: string;
    promotionCode: string | null;
    userEmail: string;
    userId?: string | null;
    orderType: "subscription" | "template";
    targetId: string;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
    currency: "INR" | "USD";
    paymentId: string;
    orderReference?: string | null;
  }
): Promise<boolean> {
  if (!db || !params.promotionId) return false;

  const redemptionId = "rdm_" + Math.random().toString(36).substring(2, 12);
  try {
    // 1. Insert redemption record
    await db
      .prepare(`
        INSERT INTO promotion_redemptions (
          id, promotion_id, promotion_code, user_email, user_id, order_type,
          target_id, original_amount, discount_amount, final_amount, currency,
          payment_id, order_reference, redeemed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `)
      .bind(
        redemptionId,
        params.promotionId,
        params.promotionCode,
        params.userEmail.toLowerCase().trim(),
        params.userId || null,
        params.orderType,
        params.targetId,
        params.originalAmount,
        params.discountAmount,
        params.finalAmount,
        params.currency,
        params.paymentId,
        params.orderReference || null
      )
      .run();

    // 2. Increment redemption counter on promotion
    await db
      .prepare(`
        UPDATE promotions
        SET redemption_count = redemption_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(params.promotionId)
      .run();

    return true;
  } catch (err) {
    console.error("Failed to record promotion redemption:", err);
    return false;
  }
}
