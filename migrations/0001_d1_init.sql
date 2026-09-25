PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    role TEXT NOT NULL,
    device_info TEXT DEFAULT 'Browser',
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    full_name TEXT,
    company TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin')),
    credits_total INTEGER DEFAULT 5,
    credits_used INTEGER DEFAULT 0,
    credits_balance INTEGER DEFAULT 5,
    purchased_items TEXT DEFAULT '[]',
    usage_history TEXT DEFAULT '[]',
    last_sign_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    code TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price_inr REAL NOT NULL,
    price_usd REAL NOT NULL,
    original_price_inr REAL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    slides_count INTEGER DEFAULT 30 NOT NULL,
    rating REAL DEFAULT 4.9,
    downloads INTEGER DEFAULT 0,
    formats TEXT DEFAULT '["PPT", "Slides", "Canva"]',
    slides TEXT DEFAULT '[]',
    description TEXT NOT NULL,
    features TEXT DEFAULT '[]',
    download_url TEXT,
    file_name TEXT,
    file_size TEXT,
    is_credit_eligible INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO templates VALUES('f8fd0ba9-e940-4f6f-aa0e-dca64dd3e9c4','slidebee-1-','SLD-301','SlideBEE (1)','Pitch Decks',499.0,9.0,998.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg',NULL,1,4.90000000000000035,0,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg"]','Executive presentation deck layout.','["1+ High-Impact Slides","16:9 Widescreen Layout","Fully Editable Vector Elements"]',NULL,'Master_Presentation.pptx','4.5 MB',1,0,1,'2026-09-11T06:53:14.029544+00:00');
INSERT INTO templates VALUES('9fbd17f2-8e94-47ca-917f-524e63121cbe','levis-marketing-retail-elevation','SLD-108','Levi''s Global Marketing & Retail Elevation Framework','Marketing',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-1.jpg',NULL,4,4.90000000000000035,1240,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/levis_slide-4.jpg"]','Vibrant brand elevation deck synchronizing regional campaigns, omnichannel retail activations, and modern consumer positioning.','["Brand Campaign Guide","Omnichannel Retail Deck","100% Vector Geometry"]',NULL,'Levis.pptx','6.9 MB',0,1,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('35b988af-ffb5-4b5d-9ebe-8e60c31708c2','hsbc-global-banking-compliance','SLD-105','HSBC Global Banking & Compliance Modernization','Finance',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-1.jpg',NULL,4,4.90000000000000035,1560,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/hsbc_slide-4.jpg"]','Comprehensive financial operations and compliance presentation visualizing cross-border footprint, cost optimization, and infrastructure modernization.','["Financial Delta Modeling","Global Footprint Visualization","Board-Level PowerPoint"]',NULL,'HSBC.pptx','5.4 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('e06c7edb-1e2b-4eb8-b8c1-3994b626c3cb','nike-innovation-athlete-narrative','SLD-102','Nike Innovation & Athlete Narrative Keynote','Marketing',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg',NULL,4,4.90000000000000035,1120,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-4.jpg"]','Stage-ready keynote presentation introducing high-contrast brand narrative, footwear innovation roadmap, and athlete partnership milestones.','["Dynamic Athletic Visuals","Brand Typography System","Ultra-Wide Keynote Deliverable"]',NULL,'Nike.pptx','5.1 MB',1,1,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('da4d8881-65c7-4446-b8ee-a1806bc0de39','volvo-electrification-mobility-keynote','SLD-109','Volvo Electrification & Autonomous Mobility Keynote','Strategy',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg',NULL,4,4.90000000000000035,1180,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-4.jpg"]','Futuristic automotive engineering and sustainability narrative detailing EV platform architecture and global market roadmap.','["Executive Keynote","Technical Powertrain Visuals","Investor Roadshow Deck"]',NULL,'Volvo.pptx','4.6 MB',0,1,1,'2026-09-07T21:06:06.61138+00:00');
INSERT INTO templates VALUES('0f906b50-298f-4ec9-899c-fcf57947b5ae','tag-creative-production-rfp','SLD-109','Tag Global Creative Production & RFP Win Presentation','Business',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-1.jpg',NULL,4,4.79999999999999982,780,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/tag_slide-4.jpg"]','End-to-end creative operations blueprint outlining omnichannel production capabilities, distributed workflow models, and enterprise SLA management.','["Capability Matrix","Process Workflow Flowchart","Enterprise RFP Deck"]',NULL,'Tag.pptx','4.4 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('db4bb2fb-f295-440b-980e-b2af433e81db','british-american-market-expansion','SLD-107','British American Global Market Expansion Strategy','Strategy',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-1.jpg',NULL,4,4.90000000000000035,910,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/british_american_slide-4.jpg"]','International market dynamics, regional regulatory navigation, and sustainable supply chain governance presentation for executive directors.','["Market Expansion Framework","Executive PPTX","Regulatory Visualizer"]',NULL,'British American.pptx','6.1 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('d108b060-df21-4ff1-9a64-30d9a4ee31aa','cvs-health-integrated-care','SLD-106','CVS Health Integrated Care & Omnichannel Ecosystem','Business',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg',NULL,4,4.79999999999999982,870,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-4.jpg"]','Healthcare stakeholder ecosystem deck mapping clinical touchpoints, retail pharmacy integration, and patient wellness journey.','["Omnichannel Care Matrix","Healthcare Visuals","Executive Presentation"]',NULL,'CVS Health.pptx','4.5 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('efc0c178-6e8f-4d89-9128-06a1448ccb0c','accenture-digital-transformation','SLD-101','Accenture Digital Transformation Master Deck','Business',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg',NULL,4,4.90000000000000035,1420,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-4.jpg"]','Multi-cloud architecture, AI implementation frameworks, and digital modernizing strategy for enterprise transformations.','["Enterprise Cloud Frameworks","16:9 Ultra-Wide Presentation","100% Vector Shapes & Charts"]',NULL,'Accenture.pptx','1.8 MB',1,1,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('c130baaa-20e6-4805-b6f1-b7bd6a5fb87a','intel-silicon-compute-architecture','SLD-104','Intel Next-Gen Silicon & Enterprise Compute Architecture','Strategy',499.0,9.0,999.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-1.jpg',NULL,4,4.90000000000000035,1340,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-2.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-3.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/intel_slide-4.jpg"]','Technical architecture presentation breaking down microarchitecture innovations, AI accelerator benchmarks, and enterprise data center roadmap.','["Data Center Infographics","Developer Keynote Layouts","Architecture Blueprints"]',NULL,'Intel.pptx','5.8 MB',0,0,1,'2026-09-07T16:23:23.946464+00:00');
INSERT INTO templates VALUES('b0987618-7db1-4a95-b790-c7a455c34724','company-profile-2024','SLD-B098','Company Profile 2024','Business',299.0,5.0,599.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/volvo_slide-1.jpg',NULL,30,4.79999999999999982,980,'["PPT","Slides","Canva"]','[]','Complete corporate credentials, leadership, milestones, and portfolio presentation toolkit.','["30+ Clean Layouts","Drag-and-Drop Image Placeholders","Brand Guidelines Slide"]',NULL,'Master_Presentation.pptx','4.5 MB',1,0,1,'2026-09-07T21:40:08.645751+00:00');
INSERT INTO templates VALUES('a145efba-9d36-458f-972f-b2257a53da19','investor-pitch-deck','SLD-954','Investor Pitch Deck','Pitch Decks',80.0,1.0,160.0,'https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg',NULL,45,4.90000000000000035,1420,'["PPT","Slides","Canva"]','["https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg"]','Series A / Seed funding investor presentation deck with financial models, team layouts, and traction metrics.','["45+ High-Conversion Slides","Light & Dark Theme Included","Fully Editable Vector Charts"]',NULL,'Master_Presentation.pptx','4.5 MB',1,0,1,'2026-09-07T21:40:08.645751+00:00');
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    order_reference TEXT UNIQUE NOT NULL,
    service_type TEXT NOT NULL,
    slide_count TEXT NOT NULL,
    timeline TEXT NOT NULL,
    formats TEXT DEFAULT '[]',
    style_preference TEXT,
    drive_url TEXT,
    project_brief TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    company TEXT,
    phone TEXT,
    payment_id TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'in_progress', 'completed', 'cancelled'))
);
CREATE TABLE waitlist (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    source TEXT DEFAULT 'coming_soon'
);
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT,
    user_email TEXT NOT NULL COLLATE NOCASE,
    plan_name TEXT NOT NULL,
    amount_usd REAL NOT NULL,
    amount_inr REAL NOT NULL,
    slides_used INTEGER DEFAULT 0,
    slides_limit INTEGER DEFAULT 15,
    current_period_end DATETIME,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'paused')),
    razorpay_subscription_id TEXT
);
CREATE TABLE site_config (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO site_config VALUES('cfg-active-sessions','active_sessions_ledger','{}','2026-09-25 09:48:41');
INSERT INTO site_config VALUES('cfg-trial-claims','trial_claims_ledger','{}','2026-09-25 09:48:41');
INSERT INTO site_config VALUES('cfg-general','general_settings','{"siteName": "SlideBee", "contactEmail": "admin@theslidebee.com"}','2026-09-25 09:48:41');
CREATE TABLE auth_logs (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_email TEXT NOT NULL COLLATE NOCASE,
    event TEXT NOT NULL,
    metadata TEXT DEFAULT '{}'
);
CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    title TEXT,
    category TEXT DEFAULT 'general',
    url TEXT NOT NULL,
    alt_text TEXT,
    metadata TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_published ON templates(is_published, is_credit_eligible);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_reference ON orders(order_reference);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
COMMIT;
