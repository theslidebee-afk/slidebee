// Test Fixtures & In-Memory Mocks for SlideBee Regression Test Suite
// Provides isolated, zero-network mock environments for testing Cloudflare D1 & Pages Functions

export interface MockTemplate {
  id: string;
  code: string;
  slug: string;
  title: string;
  category: string;
  slides_count: number;
  is_premium: number;
  price_inr: number;
  price_usd: number;
  original_price_inr?: number;
  original_price_usd?: number;
  file_name: string;
  download_url: string;
}

export const MOCK_TEMPLATES: MockTemplate[] = [
  {
    id: "tpl_free_001",
    code: "SLD-FREE-01",
    slug: "minimal-pitch-deck-free",
    title: "Minimal Executive Pitch Deck",
    category: "Pitch Decks",
    slides_count: 24,
    is_premium: 0,
    price_inr: 0,
    price_usd: 0,
    file_name: "Minimal_Executive_Pitch_Deck.pptx",
    download_url: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/minimal_pitch.pptx",
  },
  {
    id: "tpl_prem_001",
    code: "SLD-949",
    slug: "employee-relations-infographics",
    title: "Employee Relations Infographics",
    category: "Infographics",
    slides_count: 30,
    is_premium: 1,
    price_inr: 499,
    price_usd: 9,
    original_price_inr: 999,
    original_price_usd: 19,
    file_name: "Employee_Relations_Infographics.pptx",
    download_url: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/employee_relations_infographics_1791624066903.pptx",
  },
  {
    id: "tpl_prem_002",
    code: "SLD-POTX-002",
    slug: "corporate-strategy-master-template",
    title: "Corporate Strategy Master Template",
    category: "Strategy",
    slides_count: 45,
    is_premium: 1,
    price_inr: 999,
    price_usd: 19,
    file_name: "Corporate_Strategy_Master.potx",
    download_url: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/corporate_strategy.potx",
  },
];

export class MockRegressionD1 {
  public singleUseTokens: any[] = [];
  public downloadLogs: any[] = [];
  public orders: any[] = [];
  public profiles: any[] = [];
  public sessions: any[] = [];
  public promotions: any[] = [];
  public promotionRedemptions: any[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.singleUseTokens = [];
    this.downloadLogs = [];
    this.orders = [];
    this.profiles = [
      {
        id: "usr_pro_01",
        email: "pro_subscriber@example.com",
        tier: "monthly",
        tier_expires_at: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
        purchased_items: "[]",
      },
      {
        id: "usr_free_01",
        email: "free_member@example.com",
        tier: "free",
        tier_expires_at: null,
        purchased_items: "[]",
        downloads_today: 1,
      },
    ];
    this.sessions = [
      {
        id: "sess_pro_valid",
        email: "pro_subscriber@example.com",
        role: "client",
        expires_at: new Date(Date.now() + 86400 * 1000).toISOString(),
      },
      {
        id: "sess_admin_valid",
        email: "admin@theslidebee.com",
        role: "super_admin",
        expires_at: new Date(Date.now() + 86400 * 1000).toISOString(),
      },
    ];
  }

  prepare(query: string) {
    const self = this;
    return {
      bind(...params: any[]) {
        return {
          async first() {
            if (query.includes("FROM single_use_download_tokens WHERE token = ?")) {
              const token = params[0];
              const record = self.singleUseTokens.find((r) => r.token === token);
              return record ? { ...record } : null;
            }
            if (query.includes("FROM sessions WHERE id = ?")) {
              const sessId = params[0];
              const record = self.sessions.find((s) => s.id === sessId);
              return record ? { ...record } : null;
            }
            if (query.includes("FROM profiles WHERE email = ?")) {
              const email = params[0];
              const record = self.profiles.find((p) => p.email === email);
              return record ? { ...record } : null;
            }
            if (query.includes("FROM templates WHERE id = ? OR code = ? OR slug = ?")) {
              const id = params[0];
              const record = MOCK_TEMPLATES.find(
                (t) => t.id === id || t.code === id || t.slug === id
              );
              return record ? { ...record } : null;
            }
            return null;
          },
          async run() {
            if (query.includes("INSERT INTO single_use_download_tokens")) {
              const [token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed] = params;
              self.singleUseTokens.push({
                token,
                order_reference,
                payment_id,
                template_id,
                client_email,
                expires_at: typeof expires_at === "string" && expires_at.includes("now")
                  ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
                  : expires_at,
                is_consumed: is_consumed ?? 0,
                consumed_at: null,
              });
              return { success: true, changes: 1 };
            }
            if (query.includes("UPDATE single_use_download_tokens SET is_consumed = 1")) {
              const token = params[0];
              const record = self.singleUseTokens.find((r) => r.token === token && r.is_consumed === 0);
              if (record) {
                record.is_consumed = 1;
                record.consumed_at = new Date().toISOString();
                return { success: true, changes: 1 };
              }
              return { success: true, changes: 0 };
            }
            if (query.includes("INSERT INTO download_logs")) {
              self.downloadLogs.push({
                id: params[0],
                user_email: params[1],
                template_id: params[2],
                template_title: params[3],
                tier: params[4],
                is_premium: params[5],
                ip_address: params[6],
                user_agent: params[7],
              });
              return { success: true, changes: 1 };
            }
            if (query.includes("INSERT INTO orders")) {
              self.orders.push({ id: params[0], order_reference: params[1], service_type: params[2] });
              return { success: true, changes: 1 };
            }
            return { success: true, changes: 0 };
          },
        };
      },
    };
  }
}
