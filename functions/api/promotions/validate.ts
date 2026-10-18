// Cloudflare Pages Function: /api/promotions/validate
// Validates a promotion coupon or automatic campaign against server rules,
// evaluates user eligibility, and returns authoritative discount calculations.

import {
  getCorsHeaders,
  validatePromotion,
  type ValidationResult,
} from "../_promotions";

interface Env {
  DB?: any;
}

export async function onRequestOptions(context: { request: Request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    const body = await request.json().catch(() => ({}));
    const {
      code,
      orderType = "subscription",
      targetId = "monthly",
      currency = "INR",
      userEmail,
    } = body;

    if (!["subscription", "template"].includes(orderType)) {
      return new Response(
        JSON.stringify({ valid: false, errorCode: "INVALID_ORDER_TYPE", error: "Invalid order type specified." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["INR", "USD"].includes(currency)) {
      return new Response(
        JSON.stringify({ valid: false, errorCode: "INVALID_CURRENCY", error: "Currency must be INR or USD." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!targetId || typeof targetId !== "string") {
      return new Response(
        JSON.stringify({ valid: false, errorCode: "MISSING_TARGET_ID", error: "Target plan or template identifier is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: ValidationResult = await validatePromotion(env.DB, {
      code,
      orderType,
      targetId,
      currency,
      userEmail,
    });

    if (!result.valid) {
      return new Response(JSON.stringify(result), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Promotions validation error:", err);
    return new Response(
      JSON.stringify({ valid: false, errorCode: "INTERNAL_ERROR", error: "Unable to process promotional validation." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
