export interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  slideCount: string;
  timeline: string;
  format: string;
  stylePreference: string;
  driveLink: string;
  projectNotes: string;
}

export const presentationServices = [
  'Presentation Redesign',
  'Investor Pitch Decks',
  'Executive & Board Keynotes',
  'Data & Financial Visualization',
  'Master Branded Template Systems',
  'Sales & Marketing Collateral'
];

export const ecommerceServices = [
  'Full-Stack Ecommerce Store (₹25,000 Package)',
  'Custom Headless Storefront & Edge API',
  'Shopify / WooCommerce to Cloudflare Migration',
  'Multi-Vendor Marketplace & Custom Backend'
];

export const slideRanges = [
  '1–10 Slides (Micro Deck)',
  '10–25 Slides (Standard Pitch / Keynote)',
  '25–50 Slides (Full Business Plan)',
  '50+ Slides (Enterprise Deck)'
];

export const ecommerceCatalogRanges = [
  '1–50 Products (Starter Catalog)',
  '50–200 Products (Standard Store)',
  '200–500 Products (Full-Scale Catalog)',
  '500+ Products (Enterprise Store)'
];

export const presentationTimelines = [
  'Urgent 24-Hour Rush',
  '48h Fast Turnaround',
  '3–5 Business Days',
  'Flexible / Milestone Based'
];

export const ecommerceTimelines = [
  '7-Day Fast Launch',
  '14-Day Standard Rollout',
  '3–4 Weeks Custom Build',
  'Flexible / Milestone Based'
];

export const presentationFormats = [
  'Master PowerPoint (.pptx)',
  'Master PowerPoint (.pptx) + High-Res PDF',
  'Enterprise Master Template (.potx)'
];

export const ecommerceDeliverables = [
  'Full-Stack Store + Razorpay Checkout + Admin Hub',
  'Headless Edge Storefront + Custom Domain + Zoho Mail',
  'Custom D1 SQLite / Postgres DB + Automated Invoicing'
];

export const presentationStyles = [
  'Modern & High-Impact (Clean & Bold)',
  'Executive & Formal (McKinsey / BCG Style)',
  'Tech & Minimalist (Dark/Glass/Sleek)',
  'Vibrant & Creative (Custom Vector / 3D)'
];

export const ecommerceStyles = [
  'Modern & High-Conversion (Clean & Bold)',
  'Luxury & Boutique (Minimalist Elegance)',
  'Vibrant Lifestyle & D2C (Rich Visuals)',
  'Wholesale / B2B Catalog (Structured & Clean)'
];
