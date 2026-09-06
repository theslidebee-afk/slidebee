-- =========================================================
-- 🐝 SlideBee Supabase Master Database Schema
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

-- 1. Orders: Allow anyone to insert/submit a new quote request
CREATE POLICY "Public users can submit orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- Allow read access to orders
CREATE POLICY "Allow read orders" 
ON public.orders FOR SELECT 
USING (true);

-- 2. Waitlist: Allow anyone to submit an email
CREATE POLICY "Public users can join waitlist" 
ON public.waitlist FOR INSERT 
WITH CHECK (true);

-- 3. Templates: Allow public to view published templates
CREATE POLICY "Public can view published templates" 
ON public.templates FOR SELECT 
USING (is_published = true);

-- Allow authenticated/admin users full access to manage templates
CREATE POLICY "Full access to templates for authenticated" 
ON public.templates FOR ALL 
USING (true);

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
    credits_total INTEGER DEFAULT 10,
    credits_used INTEGER DEFAULT 0,
    credits_balance INTEGER DEFAULT 10,
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
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles" ON public.profiles;

-- RLS Policies for Profiles (Full accessibility for authenticated & anon clients)
CREATE POLICY "Allow public read profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update profiles" 
ON public.profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Drop any existing conflicting policies on auth_logs
DROP POLICY IF EXISTS "Allow insert on auth_logs" ON public.auth_logs;
DROP POLICY IF EXISTS "Allow read auth_logs for admin" ON public.auth_logs;
DROP POLICY IF EXISTS "Allow all on auth_logs" ON public.auth_logs;

-- RLS Policies for Auth Logs
CREATE POLICY "Allow insert on auth_logs" 
ON public.auth_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow read auth_logs for admin" 
ON public.auth_logs FOR SELECT 
USING (true);

-- Drop any existing conflicting policies on site_config
DROP POLICY IF EXISTS "Allow read site_config" ON public.site_config;
DROP POLICY IF EXISTS "Allow full access site_config for authenticated" ON public.site_config;

-- RLS Policies for Site Config
CREATE POLICY "Allow read site_config" 
ON public.site_config FOR SELECT 
USING (true);

CREATE POLICY "Allow full access site_config for authenticated" 
ON public.site_config FOR ALL 
USING (true);

-- =========================================================
-- 7. Automatic Profile Provisioning Trigger (auth.users -> public.profiles)
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
    10,
    0,
    10,
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

