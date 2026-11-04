export interface AdminOrderRecord {
  id: string;
  order_reference?: string;
  created_at?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  service_type?: string;
  slide_count?: number | string;
  timeline?: string;
  formats?: string[];
  style_preference?: string;
  drive_url?: string;
  project_brief?: string;
  status?: string;
  amount_inr?: number;
  amount_usd?: number;
  payment_status?: string;
  deliverable_url?: string;
  deliverable_file_name?: string;
  deliverable_file_size?: string;
  deliverable_sent_at?: string;
  [key: string]: any;
}

export interface AdminTemplateRecord {
  id: string;
  template_code?: string;
  code?: string;
  title: string;
  description?: string;
  category?: string;
  price_inr?: number;
  price_usd?: number;
  slide_count?: number;
  slides_count?: number;
  thumbnail_url?: string;
  slide_images?: string[];
  slides?: string[];
  file_url?: string;
  file_size?: string;
  ppt_url?: string;
  ppt_filename?: string;
  ppt_filesize?: string;
  downloads?: number;
  created_at?: string;
  formats?: string[];
  is_credit_eligible?: boolean;
  is_published?: boolean;
  is_trending?: boolean;
  before_after_enabled?: boolean;
  [key: string]: any;
}

export interface AdminProfileRecord {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
  role?: string;
  credits?: number;
  is_pro?: boolean;
  pro_tier?: string;
  pro_expires_at?: string | null;
  downloads_count?: number;
  [key: string]: any;
}

export interface AdminSubscriptionRecord {
  id: string;
  user_id?: string;
  client_email?: string;
  email?: string;
  tier?: string;
  plan_name?: string;
  status?: string;
  slides_limit?: number;
  slides_used?: number;
  created_at?: string;
  expires_at?: string | null;
  [key: string]: any;
}

export interface AdminStorageStats {
  pptxMB: number;
  pptxCount: number;
  imagesMB: number;
  imagesCount: number;
  totalUsedMB: number;
  remainingGB: number;
  percentUsed: number;
  totalFiles: number;
  objects: any[];
  loading: boolean;
}

export interface OrderMilestone {
  key: string;
  step: number;
  label: string;
  fullLabel: string;
  desc: string;
  clientDesc: string;
  color: string;
}
