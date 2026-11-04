export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  phone?: string;
  role: "client" | "admin" | "super_admin";
  tier?: "free" | "monthly" | "yearly" | "lifetime";
  tier_expires_at?: string;
  downloads_today?: number;
  last_download_date?: string;
  downloads_this_month?: number;
  month_cycle_start?: string;
  is_bot_flagged?: number;
  credits_total?: number;
  credits_used?: number;
  credits_balance?: number;
  purchased_items: Array<{
    id: string;
    slug?: string;
    code?: string;
    title: string;
    category?: string;
    slides_count?: number;
    download_url: string;
    purchased_at?: string;
    is_premium?: boolean;
    is_credit_redemption?: boolean;
    amount?: number;
    currency?: string;
  }>;
  usage_history: Array<{
    item_title: string;
    credits_used?: number;
    action: string;
    date: string;
  }>;
  last_sign_in_at?: string;
}

export interface ClientAuthResult {
  success: boolean;
  message?: string;
  unregisteredPrompt?: string;
  isUnregistered?: boolean;
  isAdmin?: boolean;
}
