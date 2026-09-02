import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://whwyfqtvuubkfypmgosi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3lmcXR2dXVia2Z5cG1nb3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjcyMzQsImV4cCI6MjEwMzk0MzIzNH0.cDUR7AhCc_5NGgO_iYHAka7wpk0cKTR0GsofBLw-taE';

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
