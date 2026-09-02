import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ehybsghrrhjhvauldjvw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoeWJzZ2hycmhqaHZhdWxkanZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjYyNTUsImV4cCI6MjEwMzk0MjI1NX0.9EAp34Pc_akj-AAYD83qW1qxLXRI1cZQnW7fuYKBHOA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface OrderRecord {
  id?: string;
  created_at?: string;
  order_reference: string;
  service_type: string;
  slide_count: string;
  timeline: string;
  formats: string[];
  style_preference: string;
  drive_url?: string;
  project_brief: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  status?: 'pending' | 'in_review' | 'in_progress' | 'completed' | 'cancelled';
}

export interface WaitlistRecord {
  id?: string;
  created_at?: string;
  email: string;
  source?: string;
}
