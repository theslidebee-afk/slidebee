import type { OrderMilestone } from "./adminTypes";

export const ORDER_MILESTONES: OrderMilestone[] = [
  { 
    key: "draft_1", 
    step: 1,
    label: "Draft 1", 
    fullLabel: "Draft 1 (Blueprint & Intake)", 
    desc: "Initial slide architecture, story flow, and structural layout.",
    clientDesc: "Our presentation designers are reviewing your brief and building the structural blueprint and slide storyline.",
    color: "amber"
  },
  { 
    key: "client_review", 
    step: 2,
    label: "Client Review", 
    fullLabel: "Client Review & Feedback", 
    desc: "First draft shared with client for revisions and copy adjustments.",
    clientDesc: "First draft deck ready for your review. Check your email or shared drive for previews and provide your feedback.",
    color: "blue"
  },
  { 
    key: "final_polish", 
    step: 3,
    label: "Final Polish", 
    fullLabel: "Final Polish & Styling", 
    desc: "High-end bespoke typography, charts, visual consistency, and micro-finishes.",
    clientDesc: "Applying high-end bespoke typography, custom chart styling, brand tokens, and micro-animations.",
    color: "purple"
  },
  { 
    key: "delivered", 
    step: 4,
    label: "Delivered", 
    fullLabel: "Delivered & Completed", 
    desc: "Final PowerPoint (.pptx), Keynote, and PDF assets delivered to client.",
    clientDesc: "All final PowerPoint (.pptx), Keynote, and PDF presentation master files are ready for download.",
    color: "emerald"
  },
];

export function getMilestoneIndex(status: string | undefined): number {
  if (!status || status === "pending" || status === "draft_1") return 0;
  if (status === "client_review") return 1;
  if (status === "in_progress" || status === "final_polish") return 2;
  if (status === "completed" || status === "delivered") return 3;
  return 0;
}

export function getSafeExternalUrl(url?: string): string {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return "#";
}

export const DEFAULT_TESTIMONIALS = [
  {
    name: "Rohan Mehta",
    role: "Founder, FinEdge",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    quote: "SlideBee's templates saved us hours of work. The quality and typography are exceptional!"
  },
  {
    name: "Priya Sharma",
    role: "Marketing Head, Nexora",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    quote: "The design team understood our brand perfectly and delivered beyond expectations within 24h."
  },
  {
    name: "Arjun Patel",
    role: "CEO, InnovateX",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    quote: "Our investor deck looked stunning and helped us raise our $4.5M seed round effortlessly!"
  }
];
