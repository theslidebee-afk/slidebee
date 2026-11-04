import { normalizeR2Url, R2_PUBLIC_BASE_URL } from "../../lib/r2";

export interface PortfolioItem {
  id: number;
  title: string;
  client: string;
  category: "All" | "Brand & Marketing" | "Corporate & Finance" | "Healthcare & Tech" | "Strategy & Operations" | string;
  image: string;
  slides?: string[];
  description: string;
  highlights: string[];
}

export const STORAGE_BASE = `${R2_PUBLIC_BASE_URL}/templates/slides`;

export const DEFAULT_PORTFOLIO_CASE_STUDIES = [
  {
    id: 1,
    title: "Global Marketing & Brand Strategy",
    client: "Nike",
    category: "Brand & Marketing",
    storageFolder: "portfolio",
    imageUrl: "/portfolio/nike_hsbc_cvs_8.png",
    slides: ["/portfolio/nike_hsbc_cvs_8.png", "/portfolio/case_study_a_1.png"],
    impact: "$24M Campaign Launch",
    description: "Multi-channel global marketing playbook delivered for executive leadership alignment.",
    deliverables: ["Master PowerPoint (.pptx)", "Executive Keynote"]
  },
  {
    id: 2,
    title: "Private Banking & Wealth Management Keynote",
    client: "HSBC",
    category: "Corporate & Finance",
    storageFolder: "portfolio",
    imageUrl: "/portfolio/nike_hsbc_cvs_1.png",
    slides: ["/portfolio/nike_hsbc_cvs_1.png", "/portfolio/case_study_a_14.png"],
    impact: "$1.2B AUM Allocation",
    description: "High-net-worth investor deck outlining European wealth management positioning.",
    deliverables: ["Investor Deck", "Board Keynote"]
  },
  {
    id: 3,
    title: "Healthcare Digital Transformation",
    client: "CVS Health",
    category: "Healthcare & Tech",
    storageFolder: "portfolio",
    imageUrl: "/portfolio/nike_hsbc_cvs_10.png",
    slides: ["/portfolio/nike_hsbc_cvs_10.png", "/portfolio/global_brands_1.png"],
    impact: "Omnichannel Rollout",
    description: "Strategic telehealth adoption roadmap and patient engagement architecture.",
    deliverables: ["Operational Playbook", "C-Suite Presentation"]
  },
  {
    id: 4,
    title: "Enterprise Strategy & Digital Keynote",
    client: "Accenture",
    category: "Strategy & Operations",
    storageFolder: "use_cases",
    imageUrl: "/portfolio/case_study_a_1.png",
    slides: ["/portfolio/case_study_a_1.png", "/portfolio/case_study_a_14.png"],
    impact: "$18M Client Deal",
    description: "Digital transformation transformation deck for Fortune 50 enterprise client pitch.",
    deliverables: ["Pitch Deck", "Vector Diagram Kit"]
  },
  {
    id: 5,
    title: "Brand Architecture & Licensing Review",
    client: "Levi's",
    category: "Brand & Marketing",
    storageFolder: "use_cases",
    imageUrl: "/portfolio/levis_yuengling_3.png",
    slides: ["/portfolio/levis_yuengling_3.png", "/portfolio/levis_yuengling_4.png"],
    impact: "Global Alignment",
    description: "Three-pillar brand framework, cost optimization metrics, and visual design system.",
    deliverables: ["Brand Playbook", "Executive Summary"]
  },
  {
    id: 6,
    title: "Supply Chain Operations & Media Ecosystem",
    client: "Yuengling",
    category: "Strategy & Operations",
    storageFolder: "use_cases",
    imageUrl: "/portfolio/levis_yuengling_6.png",
    slides: ["/portfolio/levis_yuengling_6.png", "/portfolio/levis_yuengling_7.png", "/portfolio/levis_yuengling_8.png"],
    impact: "Fulfillment Scaled",
    description: "Supply chain fulfillment flowchart and multi-tier operational staffing matrix.",
    deliverables: ["Operations Framework", "Process Flowchart"]
  }
];

export const DEFAULT_MAPPED_ITEMS: PortfolioItem[] = DEFAULT_PORTFOLIO_CASE_STUDIES.map((cs) => ({
  id: cs.id,
  title: cs.title,
  client: cs.client,
  category: cs.category,
  image: cs.imageUrl,
  slides: cs.slides,
  description: cs.description,
  highlights: cs.deliverables
}));

export function normalizeSlideUrl(url: string): string {
  if (!url) return `${STORAGE_BASE}/accenture_slide-1.jpg`;
  return normalizeR2Url(url, "slides");
}

export function getSlideSet(item: PortfolioItem): string[] {
  if (item.slides && item.slides.length > 0) return item.slides.map(normalizeSlideUrl);
  if (item.image) return [normalizeSlideUrl(item.image)];
  return [`${STORAGE_BASE}/accenture_slide-1.jpg`];
}
