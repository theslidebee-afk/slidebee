// Cloudflare Pages Function: /api/migrate
// One-time edge migration runner to initialize Cloudflare D1 schema and seed storefront catalog.

interface Env {
  DB?: any;
}

const MIGRATION_SECRET = "slidebee-d1-init-2026-secure-migration";

const STATEMENTS: string[] = [
  "CREATE TABLE IF NOT EXISTS users (\n    id TEXT PRIMARY KEY,\n    email TEXT UNIQUE NOT NULL COLLATE NOCASE,\n    password_hash TEXT NOT NULL,\n    salt TEXT NOT NULL,\n    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin')),\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)",
  "CREATE TABLE IF NOT EXISTS sessions (\n    id TEXT PRIMARY KEY,\n    user_id TEXT NOT NULL,\n    email TEXT NOT NULL COLLATE NOCASE,\n    role TEXT NOT NULL,\n    device_info TEXT DEFAULT 'Browser',\n    ip_address TEXT,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    expires_at DATETIME NOT NULL,\n    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE\n)",
  "CREATE TABLE IF NOT EXISTS profiles (\n    id TEXT PRIMARY KEY,\n    email TEXT UNIQUE NOT NULL COLLATE NOCASE,\n    full_name TEXT,\n    company TEXT,\n    phone TEXT,\n    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin')),\n    credits_total INTEGER DEFAULT 5,\n    credits_used INTEGER DEFAULT 0,\n    credits_balance INTEGER DEFAULT 5,\n    purchased_items TEXT DEFAULT '[]',\n    usage_history TEXT DEFAULT '[]',\n    last_sign_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n, tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'monthly', 'yearly', 'lifetime')), tier_expires_at DATETIME, downloads_today INTEGER DEFAULT 0, last_download_date TEXT, downloads_this_month INTEGER DEFAULT 0, month_cycle_start TEXT, is_bot_flagged INTEGER DEFAULT 0)",
  "CREATE TABLE IF NOT EXISTS templates (\n    id TEXT PRIMARY KEY,\n    slug TEXT UNIQUE NOT NULL,\n    code TEXT,\n    title TEXT NOT NULL,\n    category TEXT NOT NULL,\n    price_inr REAL NOT NULL,\n    price_usd REAL NOT NULL,\n    original_price_inr REAL,\n    image_url TEXT NOT NULL,\n    thumbnail_url TEXT,\n    slides_count INTEGER DEFAULT 30 NOT NULL,\n    rating REAL DEFAULT 4.9,\n    downloads INTEGER DEFAULT 0,\n    formats TEXT DEFAULT '[\"PPT\", \"Slides\", \"Canva\"]',\n    slides TEXT DEFAULT '[]',\n    description TEXT NOT NULL,\n    features TEXT DEFAULT '[]',\n    download_url TEXT,\n    file_name TEXT,\n    file_size TEXT,\n    is_credit_eligible INTEGER DEFAULT 0,\n    is_featured INTEGER DEFAULT 0,\n    is_published INTEGER DEFAULT 1,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n, is_premium INTEGER DEFAULT 1)",
  "INSERT OR REPLACE INTO templates VALUES('f8fd0ba9-e940-4f6f-aa0e-dca64dd3e9c4','slidebee-1-','SLD-301','SlideBEE (1)','Pitch Decks',499.0,9.0,998.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg',NULL,1,4.90000000000000035,0,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg\"]','Executive presentation deck layout.','[\"1+ High-Impact Slides\",\"16:9 Widescreen Layout\",\"Fully Editable Vector Elements\"]',NULL,'Master_Presentation.pptx','4.5 MB',1,0,1,'2026-09-11T06:53:14.029544+00:00',0)",
  "INSERT OR REPLACE INTO templates VALUES('9fbd17f2-8e94-47ca-917f-524e63121cbe','levis-marketing-retail-elevation','SLD-108','Levi''s Global Marketing & Retail Elevation Framework','Marketing',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-1.jpg',NULL,4,4.90000000000000035,1240,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-4.jpg\"]','Vibrant brand elevation deck synchronizing regional campaigns, omnichannel retail activations, and modern consumer positioning.','[\"Brand Campaign Guide\",\"Omnichannel Retail Deck\",\"100% Vector Geometry\"]',NULL,'Levis.pptx','6.9 MB',0,1,1,'2026-09-07T16:23:23.946464+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('35b988af-ffb5-4b5d-9ebe-8e60c31708c2','hsbc-global-banking-compliance','SLD-105','HSBC Global Banking & Compliance Modernization','Finance',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-1.jpg',NULL,4,4.90000000000000035,1560,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-4.jpg\"]','Comprehensive financial operations and compliance presentation visualizing cross-border footprint, cost optimization, and infrastructure modernization.','[\"Financial Delta Modeling\",\"Global Footprint Visualization\",\"Board-Level PowerPoint\"]',NULL,'HSBC.pptx','5.4 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('e06c7edb-1e2b-4eb8-b8c1-3994b626c3cb','nike-innovation-athlete-narrative','SLD-102','Nike Innovation & Athlete Narrative Keynote','Marketing',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg',NULL,4,4.90000000000000035,1120,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-4.jpg\"]','Stage-ready keynote presentation introducing high-contrast brand narrative, footwear innovation roadmap, and athlete partnership milestones.','[\"Dynamic Athletic Visuals\",\"Brand Typography System\",\"Ultra-Wide Keynote Deliverable\"]',NULL,'Nike.pptx','5.1 MB',1,1,1,'2026-09-07T16:23:23.946464+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('da4d8881-65c7-4446-b8ee-a1806bc0de39','volvo-electrification-mobility-keynote','SLD-109','Volvo Electrification & Autonomous Mobility Keynote','Strategy',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg',NULL,4,4.90000000000000035,1180,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-4.jpg\"]','Futuristic automotive engineering and sustainability narrative detailing EV platform architecture and global market roadmap.','[\"Executive Keynote\",\"Technical Powertrain Visuals\",\"Investor Roadshow Deck\"]',NULL,'Volvo.pptx','4.6 MB',0,1,1,'2026-09-07T21:06:06.61138+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('0f906b50-298f-4ec9-899c-fcf57947b5ae','tag-creative-production-rfp','SLD-109','Tag Global Creative Production & RFP Win Presentation','Business',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-1.jpg',NULL,4,4.79999999999999982,780,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-4.jpg\"]','End-to-end creative operations blueprint outlining omnichannel production capabilities, distributed workflow models, and enterprise SLA management.','[\"Capability Matrix\",\"Process Workflow Flowchart\",\"Enterprise RFP Deck\"]',NULL,'Tag.pptx','4.4 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00',0)",
  "INSERT OR REPLACE INTO templates VALUES('db4bb2fb-f295-440b-980e-b2af433e81db','british-american-market-expansion','SLD-107','British American Global Market Expansion Strategy','Strategy',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-1.jpg',NULL,4,4.90000000000000035,910,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-4.jpg\"]','International market dynamics, regional regulatory navigation, and sustainable supply chain governance presentation for executive directors.','[\"Market Expansion Framework\",\"Executive PPTX\",\"Regulatory Visualizer\"]',NULL,'British American.pptx','6.1 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('d108b060-df21-4ff1-9a64-30d9a4ee31aa','cvs-health-integrated-care','SLD-106','CVS Health Integrated Care & Omnichannel Ecosystem','Business',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg',NULL,4,4.79999999999999982,870,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-4.jpg\"]','Healthcare stakeholder ecosystem deck mapping clinical touchpoints, retail pharmacy integration, and patient wellness journey.','[\"Omnichannel Care Matrix\",\"Healthcare Visuals\",\"Executive Presentation\"]',NULL,'CVS Health.pptx','4.5 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('efc0c178-6e8f-4d89-9128-06a1448ccb0c','accenture-digital-transformation','SLD-101','Accenture Digital Transformation Master Deck','Business',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg',NULL,4,4.90000000000000035,1420,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-4.jpg\"]','Multi-cloud architecture, AI implementation frameworks, and digital modernizing strategy for enterprise transformations.','[\"Enterprise Cloud Frameworks\",\"16:9 Ultra-Wide Presentation\",\"100% Vector Shapes & Charts\"]',NULL,'Accenture.pptx','1.8 MB',1,1,1,'2026-09-07T16:23:23.946464+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('c130baaa-20e6-4805-b6f1-b7bd6a5fb87a','intel-silicon-compute-architecture','SLD-104','Intel Next-Gen Silicon & Enterprise Compute Architecture','Strategy',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-1.jpg',NULL,4,4.90000000000000035,1340,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-1.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-2.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-3.jpg\",\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-4.jpg\"]','Technical architecture presentation breaking down microarchitecture innovations, AI accelerator benchmarks, and enterprise data center roadmap.','[\"Data Center Infographics\",\"Developer Keynote Layouts\",\"Architecture Blueprints\"]',NULL,'Intel.pptx','5.8 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00',1)",
  "INSERT OR REPLACE INTO templates VALUES('b0987618-7db1-4a95-b790-c7a455c34724','company-profile-2024','SLD-B098','Company Profile 2024','Business',299.0,5.0,599.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg',NULL,30,4.79999999999999982,980,'[\"PPT\",\"Slides\",\"Canva\"]','[]','Complete corporate credentials, leadership, milestones, and portfolio presentation toolkit.','[\"30+ Clean Layouts\",\"Drag-and-Drop Image Placeholders\",\"Brand Guidelines Slide\"]',NULL,'Master_Presentation.pptx','4.5 MB',1,0,1,'2026-09-07T21:40:08.645751+00:00',0)",
  "INSERT OR REPLACE INTO templates VALUES('a145efba-9d36-458f-972f-b2257a53da19','investor-pitch-deck','SLD-954','Investor Pitch Deck','Pitch Decks',80.0,1.0,160.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg',NULL,45,4.90000000000000035,1420,'[\"PPT\",\"Slides\",\"Canva\"]','[\"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg\"]','Series A / Seed funding investor presentation deck with financial models, team layouts, and traction metrics.','[\"45+ High-Conversion Slides\",\"Light & Dark Theme Included\",\"Fully Editable Vector Charts\"]',NULL,'Master_Presentation.pptx','4.5 MB',1,0,1,'2026-09-07T21:40:08.645751+00:00',0)",
  "CREATE TABLE IF NOT EXISTS orders (\n    id TEXT PRIMARY KEY,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    order_reference TEXT UNIQUE NOT NULL,\n    service_type TEXT NOT NULL,\n    slide_count TEXT NOT NULL,\n    timeline TEXT NOT NULL,\n    formats TEXT DEFAULT '[]',\n    style_preference TEXT,\n    drive_url TEXT,\n    project_brief TEXT NOT NULL,\n    full_name TEXT NOT NULL,\n    email TEXT NOT NULL COLLATE NOCASE,\n    company TEXT,\n    phone TEXT,\n    payment_id TEXT UNIQUE,\n    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'in_progress', 'completed', 'cancelled'))\n)",
  "CREATE TABLE IF NOT EXISTS waitlist (\n    id TEXT PRIMARY KEY,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    email TEXT UNIQUE NOT NULL COLLATE NOCASE,\n    source TEXT DEFAULT 'coming_soon'\n)",
  "CREATE TABLE IF NOT EXISTS subscriptions (\n    id TEXT PRIMARY KEY,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    user_id TEXT,\n    user_email TEXT NOT NULL COLLATE NOCASE,\n    plan_name TEXT NOT NULL,\n    amount_usd REAL NOT NULL,\n    amount_inr REAL NOT NULL,\n    slides_used INTEGER DEFAULT 0,\n    slides_limit INTEGER DEFAULT 15,\n    current_period_end DATETIME,\n    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'paused')),\n    razorpay_subscription_id TEXT\n)",
  "CREATE TABLE IF NOT EXISTS site_config (\n    id TEXT PRIMARY KEY,\n    key TEXT UNIQUE NOT NULL,\n    value TEXT NOT NULL,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)",
  "INSERT OR REPLACE INTO site_config VALUES('cfg-active-sessions','active_sessions_ledger','{}','2026-09-25 09:48:41')",
  "INSERT OR REPLACE INTO site_config VALUES('cfg-trial-claims','trial_claims_ledger','{}','2026-09-25 09:48:41')",
  "INSERT OR REPLACE INTO site_config VALUES('cfg-general','general_settings','{\"siteName\": \"SlideBee\", \"contactEmail\": \"admin@theslidebee.com\"}','2026-09-25 09:48:41')",
  "CREATE TABLE IF NOT EXISTS auth_logs (\n    id TEXT PRIMARY KEY,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    user_email TEXT NOT NULL COLLATE NOCASE,\n    event TEXT NOT NULL,\n    metadata TEXT DEFAULT '{}'\n)",
  "CREATE TABLE IF NOT EXISTS assets (\n    id TEXT PRIMARY KEY,\n    key TEXT UNIQUE NOT NULL,\n    title TEXT,\n    category TEXT DEFAULT 'general',\n    url TEXT NOT NULL,\n    alt_text TEXT,\n    metadata TEXT DEFAULT '{}',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)",
  "CREATE TABLE IF NOT EXISTS download_logs (\n    id TEXT PRIMARY KEY,\n    user_email TEXT NOT NULL COLLATE NOCASE,\n    template_id TEXT NOT NULL,\n    template_title TEXT NOT NULL,\n    tier TEXT NOT NULL,\n    is_premium INTEGER DEFAULT 1,\n    download_url TEXT,\n    ip_address TEXT,\n    user_agent TEXT,\n    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP\n)",
  "CREATE INDEX IF NOT EXISTS idx_templates_slug ON templates(slug)",
  "CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)",
  "CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published, is_credit_eligible)",
  "CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)",
  "CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(order_reference)",
  "CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email)",
  "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
  "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)",
  "CREATE INDEX IF NOT EXISTS idx_download_logs_email ON download_logs(user_email, downloaded_at)",
  "CREATE INDEX IF NOT EXISTS idx_download_logs_template ON download_logs(template_id)",
  "CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON templates(is_premium, is_published)",
  "CREATE VIEW IF NOT EXISTS v_storefront_catalog AS\nSELECT id, slug, code, title, category, price_inr, price_usd, original_price_inr,\n       image_url, thumbnail_url, slides_count, rating, downloads, formats, slides,\n       description, features, is_credit_eligible, is_featured, is_published, created_at, is_premium\nFROM templates\nWHERE is_published = 1",
  "CREATE VIEW IF NOT EXISTS v_free_credit_library AS\nSELECT * FROM templates\nWHERE is_published = 1 AND is_premium = 0"
];

async function handleMigration(request: Request, env: Env) {
  const url = new URL(request.url);
  const authHeader = request.headers.get("x-migration-key") || url.searchParams.get("key");
  
  if (authHeader !== MIGRATION_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized migration request" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Cloudflare D1 binding (DB) is not available" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const executed: string[] = [];
  const errors: any[] = [];

  for (let i = 0; i < STATEMENTS.length; i++) {
    const stmt = STATEMENTS[i];
    try {
      await env.DB.prepare(stmt).run();
      executed.push(`Statement [${i}]: ${stmt.substring(0, 40).replace(/\s+/g, " ")}`);
    } catch (err: any) {
      errors.push({
        index: i,
        statement: stmt.substring(0, 60),
        error: err?.message || String(err)
      });
    }
  }

  try {
    const tables = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type=table ORDER BY name").all();
    const views = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type=view ORDER BY name").all();
    const templateCount = await env.DB.prepare("SELECT COUNT(*) as count FROM templates").first();
    const freeCount = await env.DB.prepare("SELECT COUNT(*) as count FROM templates WHERE is_premium = 0").first();
    const premiumCount = await env.DB.prepare("SELECT COUNT(*) as count FROM templates WHERE is_premium = 1").first();

    return new Response(JSON.stringify({
      success: errors.length === 0,
      message: errors.length === 0 
        ? "D1 database initialized and seeded successfully" 
        : "Migration completed with some statement warnings",
      totalStatements: STATEMENTS.length,
      executedCount: executed.length,
      errorsCount: errors.length,
      errors,
      tables: tables?.results?.map((r: any) => r.name) || [],
      views: views?.results?.map((r: any) => r.name) || [],
      templatesTotal: templateCount?.count || 0,
      freeTemplates: freeCount?.count || 0,
      premiumTemplates: premiumCount?.count || 0,
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: errors.length === 0 ? 200 : 207,
      headers: { "Content-Type": "application/json" }
    });
  } catch (diagErr: any) {
    return new Response(JSON.stringify({
      success: false,
      executedCount: executed.length,
      diagnosticError: diagErr?.message || String(diagErr),
      errors
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  return handleMigration(context.request, context.env);
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  return handleMigration(context.request, context.env);
}
