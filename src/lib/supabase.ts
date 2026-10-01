// Backward Compatibility Bridge: Redirects all legacy imports to Cloudflare D1 Native Client
// SlideBee is 100% serverless on Cloudflare Edge & Cloudflare D1.

export * from "./d1";
export { d1 as default, d1 as supabase, d1 as rawSupabase } from "./d1";
