import React from "react";
import {
  Paintbrush,
  PenTool,
  Sparkles,
  BarChart3,
  LayoutGrid,
  Palette,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Lock,
  Server,
  Mail,
  Search,
  Headphones
} from "lucide-react";

export const STORAGE_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides";

export interface ServiceDetail {
  id: string;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  beforeImg: string;
  afterImg: string;
  beforeTitle: string;
  afterTitle: string;
  turnaround: string;
  idealFor: string;
}

export const defaultServicesData: Record<string, ServiceDetail> = {
  redesign: {
    id: "redesign",
    title: "Redesign and Visual Enhancement",
    tagline: "We uplift your slides with creativity",
    icon: React.createElement(Paintbrush, { className: "w-5 h-5" }),
    beforeImg: `${STORAGE_BASE}/hsbc_slide-2.jpg`,
    afterImg: `${STORAGE_BASE}/accenture_slide-1.jpg`,
    beforeTitle: "Raw Draft / Before",
    afterTitle: "SlideBee Redesign / After",
    turnaround: "24h – 48h",
    idealFor: "Corporate decks, weekly business reviews, conference presentations"
  },
  handwritten: {
    id: "handwritten",
    title: "Handwritten Conversions",
    tagline: "Deciphering handwritten text to marvelous-looking presentations",
    icon: React.createElement(PenTool, { className: "w-5 h-5" }),
    beforeImg: `${STORAGE_BASE}/british_american_slide-3.jpg`,
    afterImg: `${STORAGE_BASE}/nike_slide-1.jpg`,
    beforeTitle: "Handwritten Notes / Sketches",
    afterTitle: "Marvelous Presentation / After",
    turnaround: "24h – 48h",
    idealFor: "Whiteboard concepts, handwritten brainstorms, napkin sketches"
  },
  cleanup: {
    id: "cleanup",
    title: "Quick Scrub and Clean Up",
    tagline: "Fixing presentation as swiftly as a kite",
    icon: React.createElement(Sparkles, { className: "w-5 h-5" }),
    beforeImg: `${STORAGE_BASE}/cvs_health_slide-3.jpg`,
    afterImg: `${STORAGE_BASE}/volvo_slide-1.jpg`,
    beforeTitle: "Rough Draft & Misalignments",
    afterTitle: "Cleaned & Aligned Presentation",
    turnaround: "12h – 24h Rush",
    idealFor: "Emergency board meetings, rapid cleanup, formatting alignment"
  },
  data: {
    id: "data",
    title: "Data Visualization",
    tagline: "Blending numbers with our marvelous design",
    icon: React.createElement(BarChart3, { className: "w-5 h-5" }),
    beforeImg: `${STORAGE_BASE}/tag_slide-3.jpg`,
    afterImg: `${STORAGE_BASE}/intel_slide-1.jpg`,
    beforeTitle: "Raw Spreadsheet Data",
    afterTitle: "Marvelous Visual Dashboard",
    turnaround: "24h – 48h",
    idealFor: "Financial reports, quarterly investor reviews, SaaS metrics"
  },
  template: {
    id: "template",
    title: "Template Creation",
    tagline: "Highly stylized presentation templates",
    icon: React.createElement(LayoutGrid, { className: "w-5 h-5" }),
    beforeImg: `${STORAGE_BASE}/hsbc_slide-4.jpg`,
    afterImg: `${STORAGE_BASE}/levis_slide-1.jpg`,
    beforeTitle: "Standard Plain Template",
    afterTitle: "Highly Stylized Master System",
    turnaround: "2 – 4 Days",
    idealFor: "Company brand systems, sales organizations, agency templates"
  },
  graphic: {
    id: "graphic",
    title: "Graphic Design",
    tagline: "Designing your visual story",
    icon: React.createElement(Palette, { className: "w-5 h-5" }),
    beforeImg: `${STORAGE_BASE}/intel_slide-3.jpg`,
    afterImg: `${STORAGE_BASE}/tag_slide-1.jpg`,
    beforeTitle: "Text-Heavy Concept",
    afterTitle: "Designed Visual Story",
    turnaround: "24h – 48h",
    idealFor: "Custom infographics, product storyboards, marketing collateral"
  }
};

export const coreEcommerceFeatures = [
  {
    icon: React.createElement(ShoppingBag, { className: "w-6 h-6 text-[#111111]" }),
    title: "500 Products & Catalog Architecture",
    description: "Structured catalog supporting up to 500 products with categories, subcategories, variants (size, color, material), SKUs, and stock availability."
  },
  {
    icon: React.createElement(CreditCard, { className: "w-6 h-6 text-[#111111]" }),
    title: "Razorpay Certified Payment Gateway",
    description: "Seamless integration with Razorpay supporting UPI, credit/debit cards, net banking, and wallets with instant automated order generation."
  },
  {
    icon: React.createElement(Smartphone, { className: "w-6 h-6 text-[#111111]" }),
    title: "100% Mobile & Tablet Responsive",
    description: "Engineered mobile-first. Thumb-friendly navigation, instant cart drawers, and frictionless 2-step mobile checkout flow."
  },
  {
    icon: React.createElement(Lock, { className: "w-6 h-6 text-[#111111]" }),
    title: "Customer Accounts & Google Sign-In",
    description: "Self-service customer portal with one-click Google OAuth, order tracking, address book, and purchase history."
  },
  {
    icon: React.createElement(Server, { className: "w-6 h-6 text-[#111111]" }),
    title: "Cloudflare Edge Deployment & Free SSL",
    description: "Hosted on ultra-fast global Cloudflare CDN infrastructure with automatic SSL/TLS certificate, DDoS shielding, and 99.9% uptime."
  },
  {
    icon: React.createElement(Mail, { className: "w-6 h-6 text-[#111111]" }),
    title: "Business Email Setup via Zoho Mail",
    description: "Professional domain email configuration (hello@, support@, orders@) with verified DNS SPF, DKIM, and DMARC deliverability."
  },
  {
    icon: React.createElement(Search, { className: "w-6 h-6 text-[#111111]" }),
    title: "Foundational SEO & Structured Data",
    description: "Optimized page titles, meta descriptions, XML sitemap, robots.txt, and Schema.org Product & Store rich snippets for Google search indexing."
  },
  {
    icon: React.createElement(Headphones, { className: "w-6 h-6 text-[#111111]" }),
    title: "30-Day Post-Launch Support & Warranty",
    description: "Comprehensive 30-day post-launch technical assistance covering configuration, bug fixes, and deployment verification."
  }
];

export const standardPages = [
  { name: "Homepage", type: "Core", desc: "High-converting hero, curated product carousels, category badges, and social proof." },
  { name: "Shop / Product Listing", type: "Core", desc: "Faceted category filtering, price sliders, in-stock badges, and dynamic sorting." },
  { name: "Product Details (PDP)", type: "Core", desc: "High-res zoomable gallery, variant selector, pricing, stock counter, and add-to-cart." },
  { name: "Shopping Cart", type: "Core", desc: "Real-time subtotal, quantity updates, coupon redemption, and delivery fee calculator." },
  { name: "Checkout & Payment", type: "Core", desc: "Streamlined single-page checkout collecting shipping, billing, and Razorpay gateway trigger." },
  { name: "Customer Portal & Login", type: "Core", desc: "Secure authentication with Google Sign-In, order tracking, and profile management." },
  { name: "Order History & Status", type: "Core", desc: "Real-time fulfillment milestone tracker (Pending → Processing → Shipped → Delivered)." },
  { name: "Admin Management Hub", type: "Admin", desc: "Storefront command center to manage products, categories, stock, orders, and customer data." },
  { name: "About Us & Brand Story", type: "Trust", desc: "Founder mission, brand heritage, executive credentials, and trust metrics." },
  { name: "Contact Us & Inquiry Form", type: "Trust", desc: "Direct customer service form, Google Maps embedding, phone, and official email links." },
  { name: "Privacy Policy", type: "Legal", desc: "GDPR, DPDP, and payment gateway compliant privacy terms." },
  { name: "Terms & Conditions", type: "Legal", desc: "Master commercial terms governing storefront transactions." },
  { name: "Cancellation & Refund Policy", type: "Legal", desc: "Explicit 100% Razorpay compliance policy outlining refund processing timelines." },
  { name: "Shipping & Delivery Policy", type: "Legal", desc: "Delivery timeframes, courier tracking details, and fulfillment SLAs." }
];

export const launchWorkflow = [
  { step: "01", title: "Discovery & Requirements", desc: "We review your product catalog, branding assets, target audience, and domain preferences." },
  { step: "02", title: "UI/UX Storefront Design", desc: "Crafting a bespoke, modern ecommerce interface aligned with your brand identity." },
  { step: "03", title: "Full-Stack Development", desc: "Building responsive frontends, product catalog logic, cart mechanics, and database architecture." },
  { step: "04", title: "Razorpay Gateway Integration", desc: "Connecting your merchant keys for secure UPI, card, and net banking payment processing." },
  { step: "05", title: "Cloudflare Deploy & Email Setup", desc: "Connecting custom domain, provisioning SSL, and configuring Zoho professional business mailboxes." },
  { step: "06", title: "QA Testing & Store Launch", desc: "End-to-end checkout verification, mobile testing, and handing over the administrative store keys." }
];

export const ecommerceFaqs = [
  {
    q: "What is included in the ₹25,000 package price?",
    a: "The ₹25,000 one-time investment covers complete end-to-end design, development, product catalog configuration (up to 500 products), Razorpay payment integration, Cloudflare deployment, SSL setup, Zoho business email configuration, foundational SEO, and 30 days of post-launch technical support."
  },
  {
    q: "Are payment gateway transaction fees included?",
    a: "No. Payment gateway per-transaction fees (typically ~2% for Razorpay) are standard provider fees charged directly by the gateway to your business merchant account."
  },
  {
    q: "Who owns the domain and accounts?",
    a: "You retain 100% full ownership of your domain, Cloudflare account, Razorpay merchant account, Zoho email account, and codebase. SlideBee sets everything up under your credentials with zero vendor lock-in."
  },
  {
    q: "Can I add more than 500 products later?",
    a: "Yes! The system architecture does not artificially limit your growth. The 500-product figure represents the setup and data-entry scope included in the launch package. You can easily add unlimited additional products through your admin dashboard."
  },
  {
    q: "How long does it take to launch the store?",
    a: "Once we receive your branding assets, product catalog information, and gateway keys, our standard turnaround is 7 to 10 business days."
  }
];
