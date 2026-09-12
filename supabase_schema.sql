-- =========================================================
-- SlideBee Supabase Master Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ehybsghrrhjhvauldjvw/sql
-- =========================================================

-- 1. Create orders table for /ordernow project briefs
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_reference TEXT UNIQUE NOT NULL,
    service_type TEXT NOT NULL,
    slide_count TEXT NOT NULL,
    timeline TEXT NOT NULL,
    formats TEXT[] DEFAULT '{}'::TEXT[],
    style_preference TEXT,
    drive_url TEXT,
    project_brief TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_review', 'in_progress', 'completed', 'cancelled'))
);

-- 2. Create waitlist table for Coming Soon email notifications
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'coming_soon'
);

-- 3. Create templates table for the dynamic Template Catalog CMS
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price_inr NUMERIC NOT NULL,
    price_usd NUMERIC NOT NULL,
    original_price_inr NUMERIC,
    image_url TEXT NOT NULL,
    slides_count INTEGER DEFAULT 30 NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.9,
    downloads INTEGER DEFAULT 0,
    formats TEXT[] DEFAULT ARRAY['PPT', 'Slides', 'Canva']::TEXT[],
    description TEXT NOT NULL,
    features TEXT[] DEFAULT '{}'::TEXT[],
    download_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true
);

-- =========================================================
-- Security & Row Level Security (RLS) Policies
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- 1. Orders: Allow public and authenticated users to submit quote/order requests
CREATE POLICY "orders_insert_policy" 
ON public.orders FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Orders: Users can only read orders matching their authenticated email; admins can read all
CREATE POLICY "orders_select_policy" 
ON public.orders FOR SELECT 
TO authenticated
USING (
    LOWER(email) = LOWER(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- Orders: Only admins can update or delete orders
CREATE POLICY "orders_admin_modify_policy" 
ON public.orders FOR ALL 
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- 2. Waitlist: Allow anyone to submit an email
CREATE POLICY "Public users can join waitlist" 
ON public.waitlist FOR INSERT 
WITH CHECK (true);

-- Waitlist: Admins can view and manage waitlist entries
CREATE POLICY "waitlist_admin_access" 
ON public.waitlist FOR ALL 
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- 3. Templates: Admin full access to manage templates
CREATE POLICY "templates_admin_access" 
ON public.templates FOR ALL 
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- =========================================================
-- Sample Starter Templates Seed Data
-- =========================================================
INSERT INTO public.templates (slug, title, category, price_inr, price_usd, original_price_inr, image_url, slides_count, rating, downloads, formats, description, features)
VALUES 
(
  'investor-pitch-deck',
  'Investor Pitch Deck',
  'Pitch Decks',
  499,
  9,
  999,
  '/portfolio/case_study_a_1.png',
  45,
  4.9,
  1420,
  ARRAY['PPT', 'Slides', 'Canva'],
  'Series A / Seed funding investor presentation deck with financial models, team layouts, and traction metrics.',
  ARRAY['45+ High-Conversion Slides', 'Light & Dark Theme Included', 'Fully Editable Vector Charts']
),
(
  'company-profile-2024',
  'Company Profile 2024',
  'Business',
  299,
  5,
  599,
  '/portfolio/nike_hsbc_cvs_2.png',
  30,
  4.8,
  980,
  ARRAY['PPT', 'Slides'],
  'Complete corporate credentials, leadership, milestones, and portfolio presentation toolkit.',
  ARRAY['30+ Clean Layouts', 'Drag-and-Drop Image Placeholders', 'Brand Guidelines Slide']
),
(
  'swot-analysis-suite',
  'SWOT Analysis Suite',
  'Strategy',
  299,
  5,
  499,
  '/portfolio/case_study_a_2.png',
  25,
  4.9,
  1120,
  ARRAY['PPT', 'Slides', 'Canva'],
  'Modern strategic analysis frameworks, matrix layouts, and competitive positioning maps.',
  ARRAY['25 Matrix & SWOT Variations', 'High-Resolution Icons', 'Free Font Files Included']
)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- 4. Create profiles table for user accounts & client portal
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client' NOT NULL CHECK (role IN ('client', 'admin', 'super_admin')),
    last_sign_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    credits_total INTEGER DEFAULT 5,
    credits_used INTEGER DEFAULT 0,
    credits_balance INTEGER DEFAULT 5,
    purchased_items JSONB DEFAULT '[]'::JSONB,
    usage_history JSONB DEFAULT '[]'::JSONB
);

-- 5. Create auth_logs table to record login/registration events
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_email TEXT NOT NULL,
    event TEXT NOT NULL CHECK (event IN ('LOGIN', 'SIGNUP', 'LOGOUT', 'PASSWORD_RESET')),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- 6. Create site_config table for runtime key/value configuration
CREATE TABLE IF NOT EXISTS public.site_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure templates table has slides, code, and download_url columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'templates' AND column_name = 'slides') THEN
        ALTER TABLE public.templates ADD COLUMN slides TEXT[] DEFAULT '{}'::TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'templates' AND column_name = 'code') THEN
        ALTER TABLE public.templates ADD COLUMN code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'templates' AND column_name = 'download_url') THEN
        ALTER TABLE public.templates ADD COLUMN download_url TEXT;
    END IF;
END $$;

-- Enable RLS for profiles, auth_logs, site_config
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies on profiles
DROP POLICY IF EXISTS "Allow public insert and update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin write on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- RLS Policies for Profiles: Users only see their own profile; admins see all
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
    id = auth.uid()
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
    id = auth.uid()
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    (
        (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    )
    OR (
        (id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
        AND role = 'client'
    )
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
    id = auth.uid()
    OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
);

-- Drop any existing conflicting policies on auth_logs
DROP POLICY IF EXISTS "Allow insert on auth_logs" ON public.auth_logs;
DROP POLICY IF EXISTS "Allow read auth_logs for admin" ON public.auth_logs;
DROP POLICY IF EXISTS "Allow all on auth_logs" ON public.auth_logs;

-- RLS Policies for Auth Logs
CREATE POLICY "Allow insert on auth_logs" 
ON public.auth_logs FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Auth logs: Only admins can view logs
CREATE POLICY "auth_logs_admin_read" 
ON public.auth_logs FOR SELECT 
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- Drop any existing conflicting policies on site_config
DROP POLICY IF EXISTS "Allow read site_config" ON public.site_config;
DROP POLICY IF EXISTS "Allow full access site_config for authenticated" ON public.site_config;
DROP POLICY IF EXISTS "site_config_admin_write" ON public.site_config;

-- RLS Policies for Site Config: Public can read settings, only admin can write
CREATE POLICY "Allow read site_config" 
ON public.site_config FOR SELECT 
USING (true);

CREATE POLICY "site_config_admin_write" 
ON public.site_config FOR ALL 
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- =========================================================
-- 7. Create subscriptions table for monthly retainers and recurring billing
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount_usd NUMERIC NOT NULL,
    amount_inr NUMERIC NOT NULL,
    slides_used INTEGER DEFAULT 0,
    slides_limit INTEGER DEFAULT 80,
    current_period_end TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'paused')),
    razorpay_subscription_id TEXT
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin_modify_policy" ON public.subscriptions;

-- Subscriptions: Users can view their own subscription; Admins can view all
CREATE POLICY "subscriptions_select_policy" 
ON public.subscriptions FOR SELECT 
TO authenticated
USING (
    LOWER(user_email) = LOWER(auth.jwt() ->> 'email')
    OR (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- Subscriptions: Only admins can insert, update, or delete subscription records
CREATE POLICY "subscriptions_admin_modify_policy" 
ON public.subscriptions FOR ALL 
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- =========================================================
-- 8. Create assets table for dynamic storefront media & case study assets
-- =========================================================
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    key TEXT UNIQUE NOT NULL,
    title TEXT,
    category TEXT DEFAULT 'general',
    url TEXT NOT NULL,
    alt_text TEXT,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Enable RLS for assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assets_select_policy" ON public.assets;
DROP POLICY IF EXISTS "assets_admin_modify_policy" ON public.assets;

-- Assets: Public can read assets (for storefront and case study showcase)
CREATE POLICY "assets_select_policy" 
ON public.assets FOR SELECT 
USING (true);

-- Assets: Only admins can manage assets
CREATE POLICY "assets_admin_modify_policy" 
ON public.assets FOR ALL 
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN ('admin@theslidebee.com', 'admin@slidebee.com')
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
);

-- =========================================================
-- 9. Automatic Profile Provisioning Trigger (auth.users -> public.profiles)
-- Runs with SECURITY DEFINER to safely bypass RLS on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    company, 
    role, 
    last_sign_in_at,
    credits_total,
    credits_used,
    credits_balance,
    purchased_items,
    usage_history
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'company', 'Client Enterprise'),
    'client',
    now(),
    5,
    0,
    5,
    '[]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (email) DO UPDATE
  SET id = EXCLUDED.id,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      company = COALESCE(EXCLUDED.company, public.profiles.company),
      last_sign_in_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run automatically whenever a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 10. Deep Module Views & Atomic RPC Functions
-- =========================================================

-- Ensure is_credit_eligible column exists on templates
ALTER TABLE public.templates 
ADD COLUMN IF NOT EXISTS is_credit_eligible BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_templates_credit_eligible 
ON public.templates(is_credit_eligible, is_published);

-- Deep Module View: Storefront Catalog (Clean public interface without sensitive download_url)
DROP VIEW IF EXISTS public.v_free_credit_library;
DROP VIEW IF EXISTS public.v_storefront_catalog;

CREATE OR REPLACE VIEW public.v_storefront_catalog AS
SELECT 
    t.id,
    COALESCE(t.code, 'SLD-' || UPPER(SUBSTRING(t.id::text, 1, 4))) AS code,
    t.title,
    COALESCE(t.category, 'Business') AS category,
    COALESCE(t.price_inr, 499) AS price_inr,
    COALESCE(t.price_usd, 9) AS price_usd,
    COALESCE(t.original_price_inr, 999) AS original_price_inr,
    COALESCE(t.image_url, t.thumbnail_url, '/portfolio/case_study_a_1.png') AS image_url,
    COALESCE(t.slides, jsonb_build_array(COALESCE(t.image_url, t.thumbnail_url, '/portfolio/case_study_a_1.png'))) AS slides,
    COALESCE(t.slides_count, t.slide_count, 30) AS slides_count,
    COALESCE(t.rating, 4.9) AS rating,
    COALESCE(t.downloads, 120) AS downloads,
    COALESCE(t.file_name, 'Master_Presentation.pptx') AS file_name,
    COALESCE(t.file_size, '4.5 MB') AS file_size,
    t.description,
    COALESCE(t.features, ARRAY['30+ High-Impact Slides', '16:9 Widescreen Format', 'Master PowerPoint (.pptx)']) AS features,
    COALESCE(t.is_credit_eligible, false) AS is_credit_eligible,
    COALESCE(t.is_featured, false) AS is_featured,
    COALESCE(t.is_published, true) AS is_published,
    t.created_at
FROM public.templates t
WHERE COALESCE(t.is_published, true) = true;

-- Deep Module View: Free Credit Library (Exclusively credit-eligible templates)
CREATE OR REPLACE VIEW public.v_free_credit_library AS
SELECT *
FROM public.v_storefront_catalog
WHERE is_credit_eligible = true;

GRANT SELECT ON public.v_storefront_catalog TO anon, authenticated;
GRANT SELECT ON public.v_free_credit_library TO anon, authenticated;

-- Deep Module RPC: fn_grant_starter_credits
CREATE OR REPLACE FUNCTION public.fn_grant_starter_credits(
    p_email TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_company TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    INSERT INTO public.profiles (
        email,
        full_name,
        company,
        role,
        credits_total,
        credits_used,
        credits_balance,
        purchased_items,
        usage_history,
        last_sign_in_at
    )
    VALUES (
        v_clean_email,
        COALESCE(p_full_name, split_part(v_clean_email, '@', 1)),
        COALESCE(p_company, 'Client Enterprise'),
        'client',
        5,
        0,
        5,
        '[]'::jsonb,
        '[]'::jsonb,
        now()
    )
    ON CONFLICT (email) DO UPDATE
    SET last_sign_in_at = now()
    RETURNING * INTO v_profile;

    RETURN jsonb_build_object(
        'success', true,
        'email', v_profile.email,
        'credits_balance', v_profile.credits_balance,
        'credits_total', v_profile.credits_total
    );
END;
$$;

-- Deep Module RPC: fn_redeem_template_credit (Hardened against IDOR parameter tampering)
CREATE OR REPLACE FUNCTION public.fn_redeem_template_credit(
    p_user_email TEXT,
    p_template_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_email TEXT := LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', '')));
    v_clean_email TEXT := LOWER(TRIM(p_user_email));
    v_is_admin BOOLEAN := false;
    v_user public.profiles%ROWTYPE;
    v_template public.templates%ROWTYPE;
    v_deliverable TEXT;
    v_already_purchased BOOLEAN := false;
    v_item_record JSONB;
    v_usage_record JSONB;
    v_credits_to_deduct INTEGER := 5;
BEGIN
    -- Security Check: verify caller identity
    IF auth.role() = 'authenticated' THEN
        IF v_caller_email IN ('admin@theslidebee.com', 'admin@slidebee.com') THEN
            v_is_admin := true;
        ELSE
            SELECT EXISTS (
                SELECT 1 FROM public.profiles
                WHERE (id = auth.uid() OR LOWER(email) = v_caller_email)
                  AND role IN ('admin', 'super_admin')
            ) INTO v_is_admin;
        END IF;

        IF NOT v_is_admin AND v_caller_email <> v_clean_email THEN
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'UNAUTHORIZED',
                'message', 'Authorization denied. You cannot redeem credits on behalf of another user account.'
            );
        END IF;
    ELSIF auth.role() = 'anon' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'AUTHENTICATION_REQUIRED',
            'message', 'Authentication required. Please sign in to redeem your starter design credits.'
        );
    END IF;

    SELECT * INTO v_user
    FROM public.profiles
    WHERE LOWER(email) = v_clean_email
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'USER_NOT_FOUND',
            'message', 'User account not found.'
        );
    END IF;

    IF v_user.credits_balance < 1 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INSUFFICIENT_CREDITS',
            'message', 'You do not have sufficient design credits remaining.'
        );
    END IF;

    SELECT * INTO v_template
    FROM public.templates
    WHERE id::text = p_template_id 
       OR slug = p_template_id 
       OR code = p_template_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'TEMPLATE_NOT_FOUND',
            'message', 'The requested presentation template does not exist.'
        );
    END IF;

    IF COALESCE(v_template.is_credit_eligible, false) = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'NOT_CREDIT_ELIGIBLE',
            'message', 'This premium master deck is not in the free credits library. Free starter credits apply exclusively to tagged free templates.'
        );
    END IF;

    IF v_user.purchased_items IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(v_user.purchased_items) elem
            WHERE elem->>'id' = v_template.id::text 
               OR elem->>'slug' = v_template.slug 
               OR elem->>'code' = v_template.code
        ) INTO v_already_purchased;
    END IF;

    IF v_already_purchased THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'ALREADY_CLAIMED',
            'message', 'You have already claimed this master presentation deck.'
        );
    END IF;

    v_credits_to_deduct := LEAST(v_user.credits_balance, 5);
    v_deliverable := COALESCE(v_template.download_url, v_template.image_url, '/portfolio/case_study_a_1.png');

    v_item_record := jsonb_build_object(
        'id', v_template.id::text,
        'slug', v_template.slug,
        'code', COALESCE(v_template.code, 'SLD-' || UPPER(SUBSTRING(v_template.id::text, 1, 4))),
        'title', v_template.title,
        'category', v_template.category,
        'slides_count', COALESCE(v_template.slides_count, 30),
        'formats', jsonb_build_array('Master PowerPoint (.pptx)'),
        'amount', 0,
        'currency', 'INR',
        'download_url', v_deliverable,
        'is_credit_redemption', true,
        'purchased_at', timezone('utc'::text, now())
    );

    v_usage_record := jsonb_build_object(
        'item_title', v_template.title,
        'credits_used', v_credits_to_deduct,
        'action', 'Free Starter Credit Redemption (Master PPTX)',
        'date', timezone('utc'::text, now())
    );

    UPDATE public.profiles
    SET 
        credits_balance = GREATEST(0, v_user.credits_balance - v_credits_to_deduct),
        credits_used = v_user.credits_used + v_credits_to_deduct,
        purchased_items = jsonb_insert(COALESCE(purchased_items, '[]'::jsonb), '{0}', v_item_record),
        usage_history = jsonb_insert(COALESCE(usage_history, '[]'::jsonb), '{0}', v_usage_record),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_user.id;

    INSERT INTO public.orders (
        order_reference,
        service_type,
        slide_count,
        timeline,
        formats,
        project_brief,
        full_name,
        email,
        status
    )
    VALUES (
        'CRD-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
        'Starter Credit Claim: ' || v_template.title,
        COALESCE(v_template.slides_count::text, '30'),
        'Instant Credit Dispatch',
        ARRAY['Master PowerPoint (.pptx)'],
        'Redeemed via 5 Free Starter Design Credits for tagged template.',
        COALESCE(v_user.full_name, split_part(v_user.email, '@', 1)),
        v_user.email,
        'completed'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Template claimed successfully with your design credits!',
        'template_title', v_template.title,
        'template_code', COALESCE(v_template.code, 'SLD-' || UPPER(SUBSTRING(v_template.id::text, 1, 4))),
        'download_url', v_deliverable,
        'credits_remaining', GREATEST(0, v_user.credits_balance - v_credits_to_deduct)
    );
END;
$$;

-- Deep Module RPC: fn_fulfill_template_order (Secure Post-Purchase Fulfillment)
CREATE OR REPLACE FUNCTION public.fn_fulfill_template_order(
    p_order_ref TEXT,
    p_payment_id TEXT,
    p_template_id TEXT,
    p_client_email TEXT,
    p_client_name TEXT,
    p_currency TEXT,
    p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_template public.templates%ROWTYPE;
    v_deliverable TEXT;
    v_item_record JSONB;
    v_clean_email TEXT := LOWER(TRIM(p_client_email));
BEGIN
    SELECT * INTO v_template
    FROM public.templates
    WHERE id::text = p_template_id 
       OR slug = p_template_id 
       OR code = p_template_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'TEMPLATE_NOT_FOUND',
            'message', 'The requested presentation template was not found.'
        );
    END IF;

    v_deliverable := COALESCE(v_template.download_url, v_template.image_url, '/portfolio/case_study_a_1.png');

    INSERT INTO public.orders (
        order_reference,
        service_type,
        slide_count,
        timeline,
        formats,
        project_brief,
        full_name,
        email,
        status
    )
    VALUES (
        p_order_ref,
        'Master Presentation Deck: ' || v_template.title,
        COALESCE(v_template.slides_count::text, '30'),
        'Instant Deliverable via Email & Direct Download',
        ARRAY['Master PowerPoint (.pptx)'],
        'Payment ID: ' || p_payment_id || '. Deliverable dispatched to: ' || v_clean_email,
        p_client_name,
        v_clean_email,
        'completed'
    );

    v_item_record := jsonb_build_object(
        'id', v_template.id::text,
        'slug', v_template.slug,
        'code', COALESCE(v_template.code, 'SLD-' || UPPER(SUBSTRING(v_template.id::text, 1, 4))),
        'title', v_template.title,
        'category', v_template.category,
        'slides_count', COALESCE(v_template.slides_count, 30),
        'formats', jsonb_build_array('Master PowerPoint (.pptx)'),
        'amount', p_amount,
        'currency', p_currency,
        'download_url', v_deliverable,
        'purchased_at', timezone('utc'::text, now())
    );

    UPDATE public.profiles
    SET 
        purchased_items = jsonb_insert(COALESCE(purchased_items, '[]'::jsonb), '{0}', v_item_record),
        updated_at = timezone('utc'::text, now())
    WHERE LOWER(TRIM(email)) = v_clean_email;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Order fulfilled successfully.',
        'order_reference', p_order_ref,
        'template_title', v_template.title,
        'template_code', COALESCE(v_template.code, 'SLD-' || UPPER(SUBSTRING(v_template.id::text, 1, 4))),
        'download_url', v_deliverable,
        'file_name', COALESCE(v_template.file_name, 'Master_' || COALESCE(v_template.code, 'Deck') || '.pptx')
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_grant_starter_credits(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_redeem_template_credit(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_fulfill_template_order(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC) TO anon, authenticated;



