import { d1 } from "../../lib/d1";
import type { UserProfile } from "./types";

export async function fetchClientProfileAndOrders(cleanEmail: string) {
  if (!cleanEmail) {
    return { profile: null, orders: [], subscription: null };
  }

  // 1. Fetch Profile ledger
  const { data: profile } = await d1
    .from("profiles")
    .select("*")
    .ilike("email", cleanEmail)
    .maybeSingle();

  // 2. Fetch Orders
  const { data: ords } = await d1
    .from("orders")
    .select("*")
    .ilike("email", cleanEmail)
    .order("created_at", { ascending: false });

  // Check local client order backup if present
  let localSaved: any[] = [];
  try {
    const raw = localStorage.getItem("slidebee_orders");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        localSaved = parsed.filter(
          (o: any) => o.email && o.email.trim().toLowerCase() === cleanEmail.toLowerCase()
        );
      }
    }
  } catch {
    // ignore json parse error
  }

  const mergedOrders = [...(ords || [])];
  localSaved.forEach((lo) => {
    const exists = mergedOrders.some(
      (mo) => (mo.order_reference && mo.order_reference === lo.order_reference) || (mo.id && mo.id === lo.id)
    );
    if (!exists) {
      mergedOrders.push(lo);
    }
  });

  // 3. Fetch Subscription
  const { data: sub } = await d1
    .from("subscriptions")
    .select("*")
    .ilike("user_email", cleanEmail)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    profile: (profile as UserProfile) || null,
    orders: mergedOrders,
    subscription: sub || null,
  };
}

export async function recordAuthEvent(
  userEmail: string,
  event: "LOGIN" | "SIGNUP" | "LOGOUT" | "PASSWORD_RESET",
  meta: any = {}
) {
  try {
    await d1
      .from("profiles")
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq("email", userEmail);

    await d1.from("auth_logs").insert([
      {
        user_email: userEmail,
        event,
        metadata: {
          ...meta,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "browser",
        },
      },
    ]);
  } catch (e) {
    console.warn("Auth event logging error:", e);
  }
}
