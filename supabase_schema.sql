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
