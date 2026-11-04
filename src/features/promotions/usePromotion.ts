import { useState, useCallback } from "react";

export interface AppliedPromotion {
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

interface UsePromotionProps {
  orderType: "subscription" | "template";
  targetId: string;
  currency: "INR" | "USD";
  userEmail?: string;
}

export function usePromotion({
  orderType,
  targetId,
  currency,
  userEmail,
}: UsePromotionProps) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromotion | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const applyCoupon = useCallback(
    async (customCode?: string): Promise<boolean> => {
      const codeToValidate = (customCode !== undefined ? customCode : couponInput).trim();
      if (!codeToValidate) {
        setValidationError("Please enter a promotional code.");
        return false;
      }

      setIsValidating(true);
      setValidationError(null);

      try {
        const res = await fetch("/api/promotions/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: codeToValidate.toUpperCase(),
            orderType,
            targetId,
            currency,
            userEmail,
          }),
        });

        const data = await res.json();

        if (res.ok && data.valid) {
          setAppliedPromo({
            promotionId: data.promotionId,
            code: data.code,
            name: data.name,
            description: data.description,
            discountType: data.discountType,
            discountValue: data.discountValue,
            originalAmount: data.originalAmount,
            discountAmount: data.discountAmount,
            finalAmount: data.finalAmount,
            currency: data.currency,
            savingsText: data.savingsText,
          });
          setCouponInput(data.code || codeToValidate.toUpperCase());
          setValidationError(null);
          return true;
        } else {
          setAppliedPromo(null);
          setValidationError(data.error || "Invalid promotional code.");
          return false;
        }
      } catch (err: any) {
        console.warn("Promotion validation network error:", err);
        setAppliedPromo(null);
        setValidationError("Network error validating code. Please try again.");
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [couponInput, orderType, targetId, currency, userEmail]
  );

  const removeCoupon = useCallback(() => {
    setAppliedPromo(null);
    setCouponInput("");
    setValidationError(null);
  }, []);

  return {
    couponInput,
    setCouponInput,
    appliedPromo,
    isValidating,
    validationError,
    applyCoupon,
    removeCoupon,
  };
}
