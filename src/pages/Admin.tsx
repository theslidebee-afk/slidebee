import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  LogOut, 
  ShoppingBag, 
  Users, 
  Layers, 
  ExternalLink, 
  Download, 
  Plus, 
  AlertCircle,
  Search,
  Image as ImageIcon,
  Sliders,
  Save,
  CheckCircle2,
  HardDrive,
  FileSpreadsheet,
  UploadCloud,
  CreditCard,
  ArrowRight,
  X,
  Sparkles,
  Check,
  FileText,
  Trash2,
  Copy,
  Edit3,
  Send,
  Zap,
  Home,
  MessageSquare,
  Settings,
  Building2,
  Phone,
  Compass,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  LayoutTemplate,
  ShieldCheck
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { performGlobalLogout, subscribeToAuthSync } from "../lib/authSync";
import { uploadToR2, fetchR2Telemetry, deleteFromR2, R2_PUBLIC_BASE_URL } from "../lib/r2";
import SlideBeeLogo from "../components/SlideBeeLogo";

export const ORDER_MILESTONES = [
  { 
    key: "draft_1", 
    step: 1,
    label: "Draft 1", 
    fullLabel: "Draft 1 (Blueprint & Intake)", 
    desc: "Initial slide architecture, story flow, and structural layout.",
    color: "amber"
  },
  { 
    key: "client_review", 
    step: 2,
    label: "Client Review", 
    fullLabel: "Client Review & Feedback", 
    desc: "First draft shared with client for revisions and copy adjustments.",
    color: "blue"
  },
  { 
    key: "final_polish", 
    step: 3,
    label: "Final Polish", 
    fullLabel: "Final Polish & Styling", 
    desc: "High-end bespoke typography, charts, visual consistency, and micro-finishes.",
    color: "purple"
  },
  { 
    key: "delivered", 
    step: 4,
    label: "Delivered", 
    fullLabel: "Delivered & Completed", 
    desc: "Final PowerPoint (.pptx), Keynote, and PDF assets delivered to client.",
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

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<"orders" | "waitlist" | "templates" | "assets" | "config" | "storage" | "subscriptions">("orders");

  // Live Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [siteConfigs, setSiteConfigs] = useState<Record<string, any>>({});
  const [templateMetricsSettings, setTemplateMetricsSettings] = useState<{ show_stars: boolean; show_downloads: boolean }>({
    show_stars: false,
    show_downloads: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [orderMilestoneFilter, setOrderMilestoneFilter] = useState<string>("all");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any | null>(null);
  const [storageSearchTerm, setStorageSearchTerm] = useState("");
  const [storageFolderFilter, setStorageFolderFilter] = useState<string>("all");
  const [copiedUrlKey, setCopiedUrlKey] = useState<string | null>(null);

  // Single Template Modal State
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState(`SLD-${Math.floor(100 + Math.random() * 900)}`);
  const [newCategory, setNewCategory] = useState("Pitch Decks");
  const [newPriceINR, setNewPriceINR] = useState(499);
  const [newPriceUSD, setNewPriceUSD] = useState(9);
  const [newSlideCount, setNewSlideCount] = useState(25);
  const [newDesc, setNewDesc] = useState("");
  const [newThumbnail, setNewThumbnail] = useState("/portfolio/case_study_a_1.png");
  const [newSlides, setNewSlides] = useState<string[]>([]);
  const [newPptUrl, setNewPptUrl] = useState("");
  const [newPptFilename, setNewPptFilename] = useState("");
  const [newPptSize, setNewPptSize] = useState("");
  const [isUploadingPpt, setIsUploadingPpt] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const AVAILABLE_FORMAT_TAGS = ["PowerPoint", "Google Slides", "Keynote", "Canva", "Figma"];
  const [newFormats, setNewFormats] = useState<string[]>([]);
  const [newIsCreditEligible, setNewIsCreditEligible] = useState(false);
  const [adminTemplateFilter, setAdminTemplateFilter] = useState<"all" | "published" | "draft" | "free">("all");

  // Edit Template Modal State
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isSavingEditTemplate, setIsSavingEditTemplate] = useState(false);
  const [editTemplateSuccess, setEditTemplateSuccess] = useState(false);
  const [isUploadingEditPpt, setIsUploadingEditPpt] = useState(false);

  // Zoho Mail Sender Configuration State
  const [zohoDeliverableEmail, setZohoDeliverableEmail] = useState(
    localStorage.getItem("slidebee_zoho_deliverable_email") || "design@theslidebee.com"
  );
  const [zohoInquiriesEmail, setZohoInquiriesEmail] = useState(
    localStorage.getItem("slidebee_zoho_inquiries_email") || "hello@theslidebee.com"
  );
  const [zohoBillingEmail, setZohoBillingEmail] = useState(
    localStorage.getItem("slidebee_zoho_billing_email") || "billing@theslidebee.com"
  );
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [testEmailSenderType, setTestEmailSenderType] = useState<"design" | "hello" | "billing">("design");
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  // Bulk Spreadsheet Template Import State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkModalTab, setBulkModalTab] = useState<"csv" | "assets">("csv");
  const [bulkUploadedAssets, setBulkUploadedAssets] = useState<Array<{ id: string; name: string; size: string; url: string; type: "ppt" | "image" }>>([]);
  const [isUploadingBulkAssets, setIsUploadingBulkAssets] = useState(false);
  const [copiedAssetUrlsSuccess, setCopiedAssetUrlsSuccess] = useState(false);
  const [csvRawText, setCsvRawText] = useState("");
  const [parsedBulkTemplates, setParsedBulkTemplates] = useState<any[]>([]);
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const [bulkImportSuccessCount, setBulkImportSuccessCount] = useState<number | null>(null);
  const [shouldMirrorAssets, setShouldMirrorAssets] = useState(true);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  // Live Cloudflare R2 Object Storage Quota & Inventory State
  const [storageStats, setStorageStats] = useState({
    pptxMB: 44.48,
    pptxCount: 9,
    imagesMB: 6.57,
    imagesCount: 37,
    totalUsedMB: 51.05,
    remainingGB: 9.95,
    percentUsed: 0.5,
    totalFiles: 47,
    objects: [] as any[],
    loading: false
  });

  // Razorpay Gateway Config State
  const [razorpayKeyId, setRazorpayKeyId] = useState(localStorage.getItem("slidebee_razorpay_key") || "");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(localStorage.getItem("slidebee_razorpay_secret") || "");
  const [razorpayMode, setRazorpayMode] = useState<"test" | "live">((localStorage.getItem("slidebee_razorpay_mode") as any) || "test");

  // New Asset Modal State
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [assetKey, setAssetKey] = useState("");
  const [assetTitle, setAssetTitle] = useState("");
  const [assetCategory, setAssetCategory] = useState("portfolio");
  const [assetUrl, setAssetUrl] = useState("");
  const [isSavingAsset, setIsSavingAsset] = useState(false);

  // Site Config Edit State
  const [activeCmsSubTab, setActiveCmsSubTab] = useState<"pricing" | "home" | "marquee" | "testimonials" | "services" | "portfolio" | "about" | "contact" | "footer" | "payments" | "emails">("home");
  const [configSaving, setConfigSaving] = useState(false);
  const [configSavedSuccess, setConfigSavedSuccess] = useState(false);
  const [configValidationError, setConfigValidationError] = useState("");
  const [activeMarqueeTarget, setActiveMarqueeTarget] = useState<"services_top" | "services_bottom" | "hero">("services_top");
  const [isUploadingMarquee, setIsUploadingMarquee] = useState(false);
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
  const [marqueeManualUrl, setMarqueeManualUrl] = useState("");
  const [newWorkedCompanyName, setNewWorkedCompanyName] = useState("");
  const [newWorkedCompanyCategory, setNewWorkedCompanyCategory] = useState("");

  // 1. Check active session on mount
  useEffect(() => {
    const unsubscribeSync = subscribeToAuthSync(
      () => {
        setSession(null);
      },
      () => {
        const localPinAuth = localStorage.getItem("slidebee_admin_session");
        if (localPinAuth === "true") {
          const email = localStorage.getItem("slidebee_admin_email") || "admin@theslidebee.com";
          setSession({ user: { email, role: "super_admin" } });
        }
      }
    );

    const localPinAuth = localStorage.getItem("slidebee_admin_session");
    if (localPinAuth === "true") {
      const email = localStorage.getItem("slidebee_admin_email") || "admin@theslidebee.com";
      setSession({ user: { email, role: "super_admin" } });
      setLoading(false);
      return () => unsubscribeSync();
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      unsubscribeSync();
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch data when session is active
  useEffect(() => {
    if (!session) return;
    fetchDashboardData();
  }, [session]);

  const fetchDashboardData = async () => {
    // Fetch Orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (ordersData) setOrders(ordersData);

    // Fetch Waitlist
    const { data: waitlistData } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });
    if (waitlistData) setWaitlist(waitlistData);

    // Fetch Templates
    const { data: templatesData } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (templatesData) setTemplates(templatesData);

    // Fetch Assets
    const { data: assetsData } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (assetsData) setAssets(assetsData);

    // Fetch Profiles & Subscriptions
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (profilesData) setProfiles(profilesData);

    const { data: subsData } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    if (subsData) setSubscriptions(subsData);

    // Fetch Site Configurations
    const { data: configData } = await supabase
      .from("site_config")
      .select("*");
    if (configData) {
      const configMap: Record<string, any> = {};
      configData.forEach((c) => {
        configMap[c.key] = c.value;
      });
      setSiteConfigs(configMap);
      if (configMap["show_template_metrics"]) {
        setTemplateMetricsSettings({
          show_stars: Boolean(configMap["show_template_metrics"].show_stars),
          show_downloads: Boolean(configMap["show_template_metrics"].show_downloads)
        });
      }
    }

    // Fetch Live Storage Telemetry from Cloudflare R2 bucket (slidebee)
    try {
      const r2Data = await fetchR2Telemetry();
      if (r2Data && r2Data.success) {
        setStorageStats({
          pptxMB: r2Data.pptxMB,
          pptxCount: r2Data.pptxCount,
          imagesMB: r2Data.imagesMB,
          imagesCount: r2Data.imagesCount,
          totalUsedMB: r2Data.totalUsedMB,
          remainingGB: r2Data.remainingGB,
          percentUsed: r2Data.percentUsed,
          totalFiles: r2Data.totalFiles,
          objects: r2Data.objects || [],
          loading: false,
        });
      }
    } catch (err) {
      console.warn("Cloudflare R2 telemetry fetch error:", err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await performGlobalLogout();
    setSession(null);
  };

  // Handle Status Update on Order
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  // Export Waitlist to CSV
  const handleExportWaitlistCSV = () => {
    if (waitlist.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Email,Source,Joined At", ...waitlist.map(w => `"${w.email}","${w.source || ''}","${w.created_at}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `slidebee_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Comprehensive Sample Bulk Template CSV
  const handleDownloadSampleCSV = () => {
    const sampleHeaders = "code,title,category,price_inr,price_usd,original_price_inr,slide_count,thumbnail_url,slides_preview_urls,download_url,is_credit_eligible,formats,description,features\n";
    const sampleRows = 
      `"SLD-101","Series A SaaS Pitch Deck Pro","Pitch Decks",999,19,1999,20,"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-2.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-3.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-4.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/accenture.pptx","true","PowerPoint;Google Slides","High-converting 20-slide pitch deck layout with financial unit economics and investor traction metrics.","20+ Editable Vector Slides;16:9 Widescreen Layout;Dark & Light Mode;Free Google Fonts;Master Color Tokens"\n` +
      `"SLD-102","Executive Board Review 2026","Corporate",1499,29,2999,45,"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-1.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-2.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-3.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/cvs_health_slide-4.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/cvs_health.pptx","false","PowerPoint;Keynote","Minimalist corporate executive board presentation system with financial tables and governance frameworks.","45+ Governance & Financial Slides;Data-Dense Executive Layouts;Custom SVG Icons Included;Editable Master PPTX"\n` +
      `"SLD-103","Modern Brand Styleguide & Guidelines","Branding",799,15,1599,25,"https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-1.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-2.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-3.jpg;https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/nike_slide-4.jpg","https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/decks/nike.pptx","false","PowerPoint;Canva","Complete visual identity presentation system with color tokens, logo safe-zones, and editorial typography.","25 Modular Brand Guidelines Slides;Color Swatch Placeholders;Typography Scaling Hierarchy;Master PowerPoint (.pptx)"`;
    
    const blob = new Blob([sampleHeaders + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "slidebee_templates_bulk_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV Line Tokenizer supporting quoted strings and commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Parse CSV text into rich Template objects
  const handleParseCSV = (raw: string) => {
    setCsvRawText(raw);
    const lines = raw.trim().split("\n");
    if (lines.length < 2) {
      setParsedBulkTemplates([]);
      return;
    }

    // Inspect header line
    const rawHeaders = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ""));
    const hasHeaderCode = rawHeaders.includes("code") || rawHeaders.includes("sku");

    const getColIndex = (name: string, fallbackIdx: number): number => {
      const idx = rawHeaders.indexOf(name);
      return idx !== -1 ? idx : fallbackIdx;
    };

    const codeIdx = getColIndex("code", 0);
    const titleIdx = hasHeaderCode ? getColIndex("title", 1) : getColIndex("title", 0);
    const catIdx = hasHeaderCode ? getColIndex("category", 2) : getColIndex("category", 1);
    const inrIdx = hasHeaderCode ? getColIndex("price_inr", 3) : getColIndex("price_inr", 2);
    const usdIdx = hasHeaderCode ? getColIndex("price_usd", 4) : getColIndex("price_usd", 3);
    const origInrIdx = getColIndex("original_price_inr", 5);
    const slidesCountIdx = hasHeaderCode ? getColIndex("slide_count", 6) : getColIndex("slide_count", 4);
    const thumbIdx = hasHeaderCode ? getColIndex("thumbnail_url", 7) : getColIndex("thumbnail_url", 5);
    const previewUrlsIdx = getColIndex("slides_preview_urls", 8);
    const downloadUrlIdx = getColIndex("download_url", 9);
    const descIdx = hasHeaderCode ? getColIndex("description", 11) : getColIndex("description", 6);
    const featuresIdx = getColIndex("features", 12);
    const creditEligibleIdx = getColIndex("is_credit_eligible", -1);

    const items: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = parseCSVLine(line);
      if (parts.length >= 3) {
        const title = parts[titleIdx] || `Executive Template ${i}`;
        const code = parts[codeIdx]?.startsWith("SLD-") ? parts[codeIdx] : (parts[codeIdx] || `SLD-${Math.floor(100 + Math.random() * 900)}`);
        const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${code.toLowerCase()}`;
        const thumbnail_url = parts[thumbIdx] || "/portfolio/case_study_a_1.png";
        
        // Multi slide preview URLs
        let slides: string[] = [];
        if (parts[previewUrlsIdx]) {
          slides = parts[previewUrlsIdx].split(/[;|]/).map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
        }
        if (slides.length === 0) {
          slides = [thumbnail_url];
        }

        const slide_count = Number(parts[slidesCountIdx]) || slides.length || 25;

        // Features list
        let features: string[] = [
          `${slide_count}+ High-Impact Slides`,
          "16:9 Widescreen Layout",
          "Fully Editable Vector Elements"
        ];
        if (parts[featuresIdx]) {
          const parsedFeats = parts[featuresIdx].split(/[;|]/).map(f => f.trim().replace(/^"|"$/g, "")).filter(Boolean);
          if (parsedFeats.length > 0) features = parsedFeats;
        }

        const download_url = parts[downloadUrlIdx] || thumbnail_url;
        const is_credit_eligible = creditEligibleIdx !== -1
          ? (parts[creditEligibleIdx]?.toLowerCase() === "true" || parts[creditEligibleIdx] === "1")
          : false;

        const formatsIdx = getColIndex("formats", -1);
        const parsedFormats = formatsIdx !== -1 && parts[formatsIdx]
          ? parts[formatsIdx].split(/[;|]/).map(f => f.trim()).filter(Boolean)
          : [];

        items.push({
          title,
          slug,
          code,
          category: parts[catIdx] || "Pitch Decks",
          price_inr: Number(parts[inrIdx]) || 499,
          price_usd: Number(parts[usdIdx]) || 9,
          original_price_inr: Number(parts[origInrIdx]) || (Number(parts[inrIdx]) ? Number(parts[inrIdx]) * 2 : 999),
          slide_count,
          slides_count: slide_count,
          thumbnail_url,
          image_url: thumbnail_url,
          slides,
          download_url,
          file_name: "Master Presentation.pptx",
          file_size: "18.5 MB",
          formats: parsedFormats,
          features,
          description: parts[descIdx] || "High-impact presentation deck layout tailored for executive presentations.",
          is_credit_eligible,
          is_published: true
        });
      }
    }
    setParsedBulkTemplates(items);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseCSV(text);
    };
    reader.readAsText(file);
  };

  // Handle Asset & Slide Images Quick Upload in Bulk Modal
  const handleBulkAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingBulkAssets(true);
    let loadedCount = 0;

    files.forEach((file) => {
      const isPpt = file.name.endsWith(".pptx") || file.name.endsWith(".key") || file.name.endsWith(".zip") || file.name.endsWith(".pdf");
      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const formattedSize = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileUrl = event.target.result as string;
          setBulkUploadedAssets((prev) => [
            ...prev,
            {
              id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              url: fileUrl,
              type: isPpt ? "ppt" : "image",
              size: formattedSize
            }
          ]);
        }
        loadedCount++;
        if (loadedCount === files.length) {
          setIsUploadingBulkAssets(false);
        }
      };
      reader.onerror = () => {
        loadedCount++;
        if (loadedCount === files.length) {
          setIsUploadingBulkAssets(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Copy all uploaded asset URLs to clipboard
  const handleCopyAllAssetUrls = () => {
    const urls = bulkUploadedAssets.map(a => a.url).join("\n");
    navigator.clipboard.writeText(urls);
    setCopiedAssetUrlsSuccess(true);
    setTimeout(() => setCopiedAssetUrlsSuccess(false), 3000);
  };

  // Auto add template row from bulk assets
  const handleAddRowFromUploadedAssets = () => {
    const pptAsset = bulkUploadedAssets.find(a => a.type === "ppt");
    const imageAssets = bulkUploadedAssets.filter(a => a.type === "image");

    if (imageAssets.length === 0 && !pptAsset) {
      alert("Please upload at least 1 image or PPT file first!");
      return;
    }

    const newSku = `SB-${Math.floor(100 + Math.random() * 900)}`;
    const thumbUrl = imageAssets[0]?.url || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80";
    const previewUrls = imageAssets.map(a => a.url).join(";");
    const pptUrl = pptAsset?.url || "";

    const newRow = `"${newSku}","Executive Pitch Deck ${newSku}","Pitch Decks",999,19,1999,${Math.max(imageAssets.length, 25)},"${thumbUrl}","${previewUrls || thumbUrl}","${pptUrl}","PowerPoint (.pptx)","Custom executive pitch deck layout ready for high-stakes presentations.","${Math.max(imageAssets.length, 25)}+ High-Impact Slides;Editable Vector Elements;16:9 Widescreen"\n`;

    const nextRaw = csvRawText ? (csvRawText.trim() + "\n" + newRow) : ("code,title,category,price_inr,price_usd,original_price_inr,slide_count,thumbnail_url,slides_preview_urls,download_url,formats,description,features\n" + newRow);
    handleParseCSV(nextRaw);
    setBulkModalTab("csv");
  };

  // Execute Bulk Insertion into Supabase with Automated Asset Ingestion
  const handleExecuteBulkImport = async () => {
    if (parsedBulkTemplates.length === 0) return;
    setIsImportingBulk(true);
    setIngestStatus("Initializing template import...");

    let templatesToInsert = [...parsedBulkTemplates];

    if (shouldMirrorAssets) {
      setIngestStatus("Scanning for external image assets to mirror to Cloudflare R2 CDN...");
      let ingestedCount = 0;
      const totalSlides = templatesToInsert.reduce((sum, t) => sum + (Array.isArray(t.slides) ? t.slides.length : 1), 0);

      const processed = await Promise.all(
        templatesToInsert.map(async (tpl, tplIdx) => {
          let updatedThumb = tpl.thumbnail_url;
          let updatedSlides: string[] = Array.isArray(tpl.slides) ? [...tpl.slides] : [tpl.thumbnail_url];

          // Mirror thumbnail if external
          if (updatedThumb && updatedThumb.startsWith("http") && !updatedThumb.includes("r2.dev")) {
            try {
              const res = await fetch(updatedThumb);
              if (res.ok) {
                const blob = await res.blob();
                const ext = updatedThumb.split(".").pop()?.split(/[?#]/)[0] || "jpg";
                const fileName = `ingest_${tpl.code || Date.now()}_thumb_${tplIdx}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
                const r2Res = await uploadToR2(blob, { folder: "bulk-ingest", fileName });
                if (r2Res.success && r2Res.publicUrl) {
                  updatedThumb = r2Res.publicUrl;
                  ingestedCount++;
                  setIngestStatus(`Mirroring assets to Cloudflare R2 CDN: ${ingestedCount} / ${totalSlides}...`);
                }
              }
            } catch (e) {
              console.warn("Could not mirror external thumbnail:", e);
            }
          }

          // Mirror interior slides if external
          const newSlidesArray = await Promise.all(
            updatedSlides.map(async (slideUrl, sIdx) => {
              if (slideUrl && slideUrl.startsWith("http") && !slideUrl.includes("r2.dev")) {
                try {
                  const res = await fetch(slideUrl);
                  if (res.ok) {
                    const blob = await res.blob();
                    const ext = slideUrl.split(".").pop()?.split(/[?#]/)[0] || "jpg";
                    const fileName = `ingest_${tpl.code || Date.now()}_slide_${sIdx + 1}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
                    const r2Res = await uploadToR2(blob, { folder: "bulk-ingest", fileName });
                    if (r2Res.success && r2Res.publicUrl) {
                      ingestedCount++;
                      setIngestStatus(`Mirroring assets to Cloudflare R2 CDN: ${ingestedCount} / ${totalSlides}...`);
                      return r2Res.publicUrl;
                    }
                  }
                } catch (e) {
                  console.warn("Could not mirror external slide:", e);
                }
              }
              return slideUrl;
            })
          );

          return {
            ...tpl,
            thumbnail_url: updatedThumb,
            image_url: updatedThumb,
            slides: newSlidesArray
          };
        })
      );
      templatesToInsert = processed;
    }

    setIngestStatus("Saving templates to storefront catalog...");
    const { data, error } = await supabase
      .from("templates")
      .insert(templatesToInsert)
      .select();

    if (!error && data) {
      setTemplates([...data, ...templates]);
      setBulkImportSuccessCount(data.length);
      await fetchDashboardData();
      setTimeout(() => {
        setIsBulkImportOpen(false);
        setBulkImportSuccessCount(null);
        setParsedBulkTemplates([]);
        setCsvRawText("");
        setIngestStatus(null);
      }, 2500);
    } else if (error) {
      console.warn("Supabase bulk insert warning:", error.message);
      const fallbackTemplates = templatesToInsert.map((item, idx) => ({
        id: `bulk-${Date.now()}-${idx}`,
        ...item
      }));
      setTemplates([...fallbackTemplates, ...templates]);
      setBulkImportSuccessCount(fallbackTemplates.length);
      setTimeout(() => {
        setIsBulkImportOpen(false);
        setBulkImportSuccessCount(null);
        setParsedBulkTemplates([]);
        setCsvRawText("");
        setIngestStatus(null);
      }, 2500);
    }
    setIsImportingBulk(false);
  };

  // Create Single Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    setIsCreatingTemplate(true);
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const templateCode = newCode || `SLD-${Math.floor(100 + Math.random() * 900)}`;

    const effectiveSlides = newSlides.length > 0 ? newSlides : [newThumbnail];
    const effectiveSlideCount = Number(newSlideCount) || effectiveSlides.length;

    const payload = {
      title: newTitle,
      slug,
      code: templateCode,
      description: newDesc || "Executive presentation deck layout.",
      category: newCategory,
      price_inr: Number(newPriceINR),
      price_usd: Number(newPriceUSD),
      original_price_inr: Number(newPriceINR) * 2,
      slide_count: effectiveSlideCount,
      slides_count: effectiveSlideCount,
      thumbnail_url: newThumbnail,
      image_url: newThumbnail,
      slides: effectiveSlides,
      download_url: newPptUrl || newThumbnail,
      formats: newFormats,
      features: [
        `${effectiveSlideCount}+ High-Impact Slides`,
        "16:9 Widescreen Layout",
        "Fully Editable Vector Elements"
      ],
      is_credit_eligible: Boolean(newIsCreditEligible),
      is_published: true
    };

    const { data, error } = await supabase
      .from("templates")
      .insert([payload])
      .select();

    if (!error && data) {
      setTemplates([data[0], ...templates]);
      setIsAddTemplateOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewThumbnail("/portfolio/case_study_a_1.png");
      setNewSlides([]);
      setNewPptUrl("");
      setNewPptFilename("");
      setNewPptSize("");
      setNewFormats([]);
      setNewIsCreditEligible(false);
      setNewCode(`SLD-${Math.floor(100 + Math.random() * 900)}`);
    } else {
      // Fallback local persistence if insert notice
      const fallbackItem = { id: `tpl-${Date.now()}`, ...payload };
      setTemplates([fallbackItem, ...templates]);
      setIsAddTemplateOpen(false);
    }
    setIsCreatingTemplate(false);
  };

  // Open Edit Template Modal with existing template values
  const openEditTemplateModal = (tpl: any) => {
    const rawSlides = Array.isArray(tpl.slides) && tpl.slides.length > 0 
      ? tpl.slides 
      : (tpl.thumbnail_url || tpl.image_url || tpl.image ? [tpl.thumbnail_url || tpl.image_url || tpl.image] : []);
    const rawFormats = Array.isArray(tpl.formats) ? tpl.formats : [];
    const rawFeatures = Array.isArray(tpl.features) && tpl.features.length > 0
      ? tpl.features
      : [`${tpl.slide_count || tpl.slides_count || 25}+ High-Impact Slides`, "16:9 Widescreen Layout", "Fully Editable Vector Elements"];

    setEditingTemplate({
      id: tpl.id,
      title: tpl.title || "",
      code: tpl.code || `SLD-${Math.floor(100 + Math.random() * 900)}`,
      category: tpl.category || "Pitch Decks",
      price_inr: tpl.price_inr ?? 499,
      price_usd: tpl.price_usd ?? 9,
      slide_count: tpl.slide_count || tpl.slides_count || rawSlides.length || 25,
      description: tpl.description || "",
      thumbnail_url: tpl.thumbnail_url || tpl.image_url || tpl.image || "/portfolio/case_study_a_1.png",
      slides: rawSlides,
      download_url: tpl.download_url || "",
      formats: rawFormats,
      features: rawFeatures,
      is_published: tpl.is_published !== false,
      is_credit_eligible: Boolean(tpl.is_credit_eligible)
    });
    setIsEditTemplateOpen(true);
  };

  // Save Template Edits to Supabase
  const handleSaveEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate || !editingTemplate.title) return;

    setIsSavingEditTemplate(true);
    const effectiveSlides = editingTemplate.slides.length > 0 ? editingTemplate.slides : [editingTemplate.thumbnail_url];
    const effectiveSlideCount = Number(editingTemplate.slide_count) || effectiveSlides.length;

    const payload = {
      title: editingTemplate.title,
      code: editingTemplate.code,
      category: editingTemplate.category,
      price_inr: Number(editingTemplate.price_inr),
      price_usd: Number(editingTemplate.price_usd),
      original_price_inr: Number(editingTemplate.price_inr) * 2,
      slide_count: effectiveSlideCount,
      slides_count: effectiveSlideCount,
      thumbnail_url: editingTemplate.thumbnail_url,
      image_url: editingTemplate.thumbnail_url,
      slides: effectiveSlides,
      download_url: editingTemplate.download_url,
      formats: editingTemplate.formats,
      description: editingTemplate.description,
      features: editingTemplate.features,
      is_published: Boolean(editingTemplate.is_published),
      is_credit_eligible: Boolean(editingTemplate.is_credit_eligible)
    };

    try {
      const { data, error } = await supabase
        .from("templates")
        .update(payload)
        .eq("id", editingTemplate.id)
        .select();

      if (!error && data && data.length > 0) {
        setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? { ...t, ...data[0] } : t)));
      } else {
        // Fallback update local state
        setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? { ...t, ...payload } : t)));
      }
      setEditTemplateSuccess(true);
      setTimeout(() => {
        setEditTemplateSuccess(false);
        setIsEditTemplateOpen(false);
        setEditingTemplate(null);
      }, 1000);
    } catch (err) {
      console.warn("Template edit notice:", err);
      setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? { ...t, ...payload } : t)));
      setIsEditTemplateOpen(false);
      setEditingTemplate(null);
    } finally {
      setIsSavingEditTemplate(false);
    }
  };

  // Delete Template from Supabase
  const handleDeleteTemplate = async (tplId: string | number, tplTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete template "${tplTitle}"? This will remove it from the online store.`)) {
      return;
    }

    try {
      await supabase.from("templates").delete().eq("id", tplId);
    } catch (err) {
      console.warn("Delete template notice:", err);
    }

    setTemplates((prev) => prev.filter((t) => t.id !== tplId));
    if (editingTemplate && editingTemplate.id === tplId) {
      setIsEditTemplateOpen(false);
      setEditingTemplate(null);
    }
  };

  // Dispatch Live Test Email via Zoho
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      setTestEmailStatus("Please enter a valid recipient email address.");
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailStatus("Dispatching test email via Zoho Mail router...");

    let senderEmail = zohoDeliverableEmail;
    let senderName = "SlideBee Design Studio";
    let subject = "SlideBee Deliverables Test: Master File Dispatch";

    if (testEmailSenderType === "hello") {
      senderEmail = zohoInquiriesEmail;
      senderName = "SlideBee Studio";
      subject = "SlideBee Inquiry Test: General Desk Routing";
    } else if (testEmailSenderType === "billing") {
      senderEmail = zohoBillingEmail;
      senderName = "SlideBee Billing";
      subject = "SlideBee Billing Test: Invoice & Payment Receipt";
    }

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailRecipient.trim(),
          fromEmail: senderEmail,
          fromName: senderName,
          replyTo: senderEmail,
          subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background-color: #FFF9E8; padding: 28px; border-radius: 14px; color: #111111;">
              <h2 style="color: #936610; margin-top: 0;">SlideBee Zoho Mail Test Dispatch</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #374151;">
                This diagnostic test confirms that your custom domain Zoho email routing is operational on <strong>theslidebee.com</strong>.
              </p>
              <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #FCBF14; font-size: 13px;">
                <p style="margin: 4px 0;"><strong>Sender Mailbox:</strong> ${senderEmail}</p>
                <p style="margin: 4px 0;"><strong>Display Name:</strong> ${senderName}</p>
                <p style="margin: 4px 0;"><strong>Recipient:</strong> ${testEmailRecipient.trim()}</p>
                <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTestEmailStatus(`Success: Test email dispatched from ${senderEmail} to ${testEmailRecipient.trim()}.`);
      } else {
        setTestEmailStatus(`Notice: ${data?.error || data?.message || "Delivery queued via mail router."}`);
      }
    } catch (e: any) {
      setTestEmailStatus(`Dispatcher notice: ${e.message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Upload Local PPT / PPTX / PDF File
  const handlePptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPpt(true);
    setNewPptFilename(file.name);
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setNewPptSize(file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`);

    try {
      const r2Res = await uploadToR2(file, { folder: "templates/decks", fileName: file.name });
      if (r2Res.success && r2Res.publicUrl) {
        setNewPptUrl(r2Res.publicUrl);
      } else {
        throw new Error(r2Res.error || "Upload failed");
      }
    } catch (err: any) {
      alert("Failed to upload Master PPTX to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingPpt(false);
    }

    if (!newTitle) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }
  };

  // Upload Multiple Slide Images for Template Gallery to Cloudflare R2
  const handleSlideImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingSlide(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const r2Res = await uploadToR2(file, { folder: "templates/slides", fileName: file.name });
        if (r2Res.success && r2Res.publicUrl) {
          uploadedUrls.push(r2Res.publicUrl);
        }
      }
      setNewSlides((prev) => {
        const next = [...prev, ...uploadedUrls];
        setNewSlideCount(next.length);
        return next;
      });
      if (!newThumbnail || newThumbnail.startsWith("/portfolio/case_study_a_1")) {
        if (uploadedUrls.length > 0) setNewThumbnail(uploadedUrls[0]);
      }
    } catch (err: any) {
      alert("Failed to upload slide images to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingSlide(false);
    }
  };

  // Upload Multiple Slide Images for Portfolio Case Study directly to Cloudflare R2
  const handleCaseStudySlidesUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingSlide(true);

    try {
      for (const file of files) {
        const r2Res = await uploadToR2(file, { folder: "portfolio", fileName: file.name });
        if (!r2Res.success || !r2Res.publicUrl) continue;
        const imgUrl = r2Res.publicUrl;

        setSiteConfigs((prevConfigs) => {
          const currentStudies = [...(prevConfigs["portfolio_cms"]?.caseStudies || [])];
          if (!currentStudies[idx]) return prevConfigs;
          const existingSlides: string[] = Array.isArray(currentStudies[idx].slides) && currentStudies[idx].slides.length > 0
            ? [...currentStudies[idx].slides]
            : (currentStudies[idx].imageUrl ? [currentStudies[idx].imageUrl] : []);
          existingSlides.push(imgUrl);
          currentStudies[idx] = {
            ...currentStudies[idx],
            slides: existingSlides,
            imageUrl: currentStudies[idx].imageUrl || existingSlides[0]
          };
          return {
            ...prevConfigs,
            portfolio_cms: {
              ...prevConfigs["portfolio_cms"],
              caseStudies: currentStudies
            }
          };
        });
      }
    } catch (err: any) {
      alert("Failed to upload slide to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingSlide(false);
      e.target.value = "";
    }
  };

  // Upload Custom Image for Services / Hero Marquee to Cloudflare R2
  const handleUploadMarqueeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMarquee(true);

    try {
      const r2Res = await uploadToR2(file, { folder: "marquee", fileName: file.name });
      if (!r2Res.success || !r2Res.publicUrl) throw new Error(r2Res.error || "Upload failed");
      const imgUrl = r2Res.publicUrl;

      if (activeMarqueeTarget === "hero") {
        const current = siteConfigs["hero"]?.marqueeSlides || [];
        setSiteConfigs({
          ...siteConfigs,
          hero: { ...siteConfigs["hero"], marqueeSlides: [...current, imgUrl] }
        });
      } else if (activeMarqueeTarget === "services_top") {
        const current = siteConfigs["services_marquee_cms"]?.topSlides || [];
        setSiteConfigs({
          ...siteConfigs,
          services_marquee_cms: {
            ...(siteConfigs["services_marquee_cms"] || {}),
            topSlides: [...current, imgUrl]
          }
        });
      } else {
        const current = siteConfigs["services_marquee_cms"]?.bottomSlides || [];
        setSiteConfigs({
          ...siteConfigs,
          services_marquee_cms: {
            ...(siteConfigs["services_marquee_cms"] || {}),
            bottomSlides: [...current, imgUrl]
          }
        });
      }
    } catch (err: any) {
      alert("Failed to upload marquee image to Cloudflare R2: " + (err.message || err));
    } finally {
      setIsUploadingMarquee(false);
      e.target.value = "";
    }
  };


  // Delete an object from Cloudflare R2
  const handleDeleteR2Object = async (key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}" from Cloudflare R2?`)) return;
    const ok = await deleteFromR2(key);
    if (ok) {
      setStorageStats((prev) => ({
        ...prev,
        objects: prev.objects.filter((o) => o.key !== key),
        totalFiles: Math.max(0, prev.totalFiles - 1),
      }));
    } else {
      alert("Failed to delete object from Cloudflare R2");
    }
  };

  // Save / Update Asset
  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetKey || !assetUrl) return;

    setIsSavingAsset(true);
    const { data, error } = await supabase
      .from("assets")
      .upsert([
        {
          key: assetKey,
          title: assetTitle || assetKey,
          category: assetCategory,
          url: assetUrl,
          alt_text: assetTitle || assetKey,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: "key" })
      .select();

    if (!error && data) {
      setAssets([data[0], ...assets.filter(a => a.key !== assetKey)]);
      setIsAddAssetOpen(false);
      setAssetKey("");
      setAssetTitle("");
      setAssetUrl("");
    }
    setIsSavingAsset(false);
  };

  // Upload Local Image File to Data URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        callback(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Site Configuration
  const handleSaveConfig = async (key: string, value: any) => {
    setConfigValidationError("");

    // Validate that no string field in the payload is blank / empty
    const checkEmpty = (data: any): boolean => {
      if (typeof data === "string") return data.trim() === "";
      if (Array.isArray(data)) return data.some(item => checkEmpty(item));
      if (typeof data === "object" && data !== null) {
        return Object.values(data).some(val => checkEmpty(val));
      }
      return false;
    };

    if (value && checkEmpty(value)) {
      setConfigValidationError("Cannot save with empty text fields. Please enter text before saving.");
      setTimeout(() => setConfigValidationError(""), 5000);
      return;
    }

    setConfigSaving(true);
    setConfigSavedSuccess(false);

    const { error } = await supabase
      .from("site_config")
      .upsert([
        {
          key,
          value,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: "key" });

    if (!error) {
      setSiteConfigs({ ...siteConfigs, [key]: value });
      setConfigSavedSuccess(true);
      setTimeout(() => setConfigSavedSuccess(false), 3000);
    }
    setConfigSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center text-[#111111]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#726F6D]">
            Loading SlideBee Admin...
          </p>
        </div>
      </div>
    );
  }

  // --- 1. REDIRECT UNAUTHENTICATED USERS TO UNIFIED LOGIN PAGE ---
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // --- 2. AUTHENTICATED FULL SITE CONTROL CENTER ---
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (orderMilestoneFilter === "all") return matchesSearch;
    const currentIdx = getMilestoneIndex(o.status);
    const targetIdx = ORDER_MILESTONES.findIndex(m => m.key === orderMilestoneFilter);
    return matchesSearch && currentIdx === targetIdx;
  });

  const filteredWaitlist = waitlist.filter(w => 
    w.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssets = assets.filter(a => 
    a.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Storage Stats (10 GB Free Tier Quota - Live Supabase Bucket Telemetry)
  const totalR2QuotaMB = 10240; // 10 GB
  const actualUsedMB = storageStats.totalUsedMB;
  const remainingMB = Math.max(0, totalR2QuotaMB - actualUsedMB);
  const percentUsed = ((actualUsedMB / totalR2QuotaMB) * 100).toFixed(1);
  const remainingGB = (remainingMB / 1024).toFixed(2);

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-24 pb-20">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#111111]/10 p-6 hex-card-lg shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <SlideBeeLogo variant="light" size="md" />
            <div className="border-l border-[#111111]/10 pl-4">
              <h1 className="text-lg font-heading font-extrabold text-[#111111]">
                SlideBee Master Studio Hub
              </h1>
              <span className="text-xs text-[#726F6D] font-medium">
                Admin: <strong>{session.user.email}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="hex-pill bg-[#FFF9E8] text-[#111111] border border-[#111111]/10 px-4 py-2 text-xs font-extrabold hover:bg-black/5 transition-all"
            >
              ↻ Refresh Data
            </button>
            <button
              onClick={handleLogout}
              className="hex-pill bg-red-50 text-red-700 border border-red-200 px-4 py-2 text-xs font-extrabold hover:bg-red-100 transition-all flex items-center gap-1.5"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>

        {/* 5 Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="hex-card bg-white border border-[#111111]/8 p-4 shadow-sm">
            <div className="flex items-center justify-between text-primary-amber mb-1.5">
              <ShoppingBag size={18} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                Briefs
              </span>
            </div>
            <div className="text-2xl font-heading font-black text-[#111111]">
              {orders.length}
            </div>
            <span className="text-[10px] text-[#726F6D] font-medium block">
              {orders.filter(o => o.status === 'pending').length} pending
            </span>
          </div>

          <div className="hex-card bg-white border border-[#111111]/8 p-4 shadow-sm">
            <div className="flex items-center justify-between text-primary-amber mb-1.5">
              <Users size={18} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                Waitlist
              </span>
            </div>
            <div className="text-2xl font-heading font-black text-[#111111]">
              {waitlist.length}
            </div>
            <span className="text-[10px] text-[#726F6D] font-medium block">
              Subscribers
            </span>
          </div>

          <div className="hex-card bg-white border border-[#111111]/8 p-4 shadow-sm">
            <div className="flex items-center justify-between text-primary-amber mb-1.5">
              <Layers size={18} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                Templates
              </span>
            </div>
            <div className="text-2xl font-heading font-black text-[#111111]">
              {templates.length}
            </div>
            <span className="text-[10px] text-[#726F6D] font-medium block">
              In Store CMS
            </span>
          </div>

          <div className="hex-card bg-white border border-[#111111]/8 p-4 shadow-sm">
            <div className="flex items-center justify-between text-primary-amber mb-1.5">
              <ImageIcon size={18} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                Media CMS
              </span>
            </div>
            <div className="text-2xl font-heading font-black text-[#111111]">
              {assets.length}
            </div>
            <span className="text-[10px] text-[#726F6D] font-medium block">
              Visual Assets
            </span>
          </div>

          {/* R2 Storage Live Monitor Card */}
          <div 
            onClick={() => setActiveTab("storage")}
            className="hex-card bg-white border border-[#111111]/8 p-4 shadow-sm cursor-pointer hover:border-primary transition-all col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-primary-amber mb-1.5">
              <HardDrive size={18} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                Cloudflare R2
              </span>
            </div>
            <div className="text-2xl font-heading font-black text-[#111111]">
              {remainingGB} <span className="text-xs font-bold text-[#726F6D]">GB Free</span>
            </div>
            <div className="w-full bg-[#FFF9E8] rounded-full h-1.5 mt-2 overflow-hidden border border-[#111111]/10">
              <div 
                className="bg-primary-amber h-full rounded-full transition-all" 
                style={{ width: `${Math.max(3, Number(percentUsed))}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Tab Selector & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          
          <div className="inline-flex bg-white border border-[#111111]/10 p-1 hex-pill shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 hex-pill text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-[#111111] text-[#FCBF14] shadow"
                  : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              <ShoppingBag size={14} /> Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("waitlist")}
              className={`px-4 py-2 hex-pill text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "waitlist"
                  ? "bg-[#111111] text-[#FCBF14] shadow"
                  : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              <Users size={14} /> Waitlist ({waitlist.length})
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 hex-pill text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "templates"
                  ? "bg-[#111111] text-[#FCBF14] shadow"
                  : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              <Layers size={14} /> Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`px-4 py-2 hex-pill text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "assets"
                  ? "bg-[#111111] text-[#FCBF14] shadow"
                  : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              <ImageIcon size={14} /> Media Assets ({assets.length})
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-4 py-2 hex-pill text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "config"
                  ? "bg-[#111111] text-[#FCBF14] shadow"
                  : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              <Sliders size={14} /> Pricing & Copy
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-4 py-2 hex-pill text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "subscriptions"
                  ? "bg-[#111111] text-[#FCBF14] shadow"
                  : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              <CreditCard size={14} /> Subscriptions & Users ({subscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("storage")}
              className={`px-4 py-2 hex-pill text-xs font-extrabold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "storage"
                  ? "bg-[#111111] text-[#FCBF14] shadow"
                  : "text-[#111111] hover:text-primary-amber"
              }`}
            >
              <HardDrive size={14} /> R2 10 GB Storage
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== "config" && activeTab !== "storage" && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-[#111111]/12 hex-pill pl-9 pr-4 py-2 text-xs text-[#111111] font-medium outline-none focus:border-primary shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              </div>
            )}

            {activeTab === "waitlist" && (
              <button
                onClick={handleExportWaitlistCSV}
                className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <Download size={14} /> Export CSV
              </button>
            )}

            {activeTab === "templates" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkImportOpen(true)}
                  className="hex-pill bg-[#111111] hover:bg-black text-[#FCBF14] font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <FileSpreadsheet size={14} /> Bulk CSV Import
                </button>
                <button
                  onClick={() => setIsAddTemplateOpen(true)}
                  className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <Plus size={14} /> Add Single
                </button>
              </div>
            )}

            {activeTab === "assets" && (
              <button
                onClick={() => setIsAddAssetOpen(true)}
                className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <Plus size={14} /> Add Asset
              </button>
            )}
          </div>

        </div>

        {/* TAB 1: ORDERS WITH INTERACTIVE MILESTONE TIMELINE STEPPER */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            
            {/* 1. Milestone Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {ORDER_MILESTONES.map((m, idx) => {
                const count = orders.filter(o => getMilestoneIndex(o.status) === idx).length;
                const isFilterActive = orderMilestoneFilter === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setOrderMilestoneFilter(isFilterActive ? "all" : m.key)}
                    className={`hex-card text-left p-4 border transition-all ${
                      isFilterActive 
                        ? "bg-[#111111] text-white border-[#111111] shadow-lg scale-[1.02]"
                        : "bg-white border-[#111111]/10 hover:border-primary/60 hover:bg-[#FFF9E8] shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        isFilterActive ? "bg-primary text-[#111111]" : "bg-[#FFF9E8] text-[#111111] border border-primary/30"
                      }`}>
                        Stage {m.step}
                      </span>
                      <span className={`text-xs font-black ${isFilterActive ? "text-primary" : "text-[#726F6D]"}`}>
                        {count} {count === 1 ? "order" : "orders"}
                      </span>
                    </div>
                    <div className="font-heading font-extrabold text-sm sm:text-base leading-tight mb-1">
                      {m.label}
                    </div>
                    <div className={`text-[11px] font-medium leading-relaxed truncate ${
                      isFilterActive ? "text-white/70" : "text-[#726F6D]"
                    }`}>
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 2. Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#111111]/10 p-4 hex-card shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#726F6D] mr-1">Filter by Stage:</span>
                <button
                  type="button"
                  onClick={() => setOrderMilestoneFilter("all")}
                  className={`hex-pill-sm px-3 py-1 text-xs font-extrabold transition-all border ${
                    orderMilestoneFilter === "all"
                      ? "bg-[#111111] text-primary border-[#111111] shadow-sm"
                      : "bg-[#FFF9E8] text-[#111111] border-[#111111]/10 hover:border-primary"
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                {ORDER_MILESTONES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setOrderMilestoneFilter(m.key)}
                    className={`hex-pill-sm px-3 py-1 text-xs font-extrabold transition-all border ${
                      orderMilestoneFilter === m.key
                        ? "bg-[#111111] text-primary border-[#111111] shadow-sm"
                        : "bg-[#FFF9E8] text-[#111111] border-[#111111]/10 hover:border-primary"
                    }`}
                  >
                    {m.label} ({orders.filter(o => getMilestoneIndex(o.status) === m.step - 1).length})
                  </button>
                ))}
              </div>

              {orderMilestoneFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setOrderMilestoneFilter("all")}
                  className="text-xs text-primary-amber font-extrabold hover:underline"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* 3. Orders Table with Interactive Milestone Stepper */}
            <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-md">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-[#726F6D]">
                  <ShoppingBag size={36} className="mx-auto text-gray-300 mb-2" />
                  <h4 className="font-heading font-extrabold text-sm text-[#111111]">No Orders Matching Filter</h4>
                  <p className="text-xs font-medium mt-1">Try switching stage filters or clearing the search query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] font-extrabold uppercase tracking-wider">
                        <th className="p-4">Date & Client</th>
                        <th className="p-4">Service & Scope</th>
                        <th className="p-4">Rush / Target</th>
                        <th className="p-4 min-w-[380px]">Milestone Timeline Stepper (1-Click Advance)</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111111]/6 font-medium text-[#111111]">
                      {filteredOrders.map((ord) => {
                        const currentIdx = getMilestoneIndex(ord.status);
                        const nextMilestone = currentIdx < ORDER_MILESTONES.length - 1 ? ORDER_MILESTONES[currentIdx + 1] : null;

                        return (
                          <tr key={ord.id} className="hover:bg-primary/5 transition-colors">
                            
                            {/* Date & Client Column */}
                            <td className="p-4">
                              <div className="font-extrabold text-[#111111] text-sm flex items-center gap-1.5">
                                {ord.client_name || "Client"}
                                {ord.target_date && (
                                  <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                    Due: {ord.target_date}
                                  </span>
                                )}
                              </div>
                              <div className="text-[#726F6D] text-[11px] font-medium">{ord.client_email}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                Submitted {new Date(ord.created_at).toLocaleDateString()}
                              </div>
                            </td>

                            {/* Service & Scope Column */}
                            <td className="p-4">
                              <div className="font-extrabold text-[#111111]">{ord.service_type || "Presentation Design"}</div>
                              <div className="text-[11px] text-[#726F6D]">{ord.slide_count || "Custom"} slides</div>
                              {ord.budget && (
                                <div className="text-[10px] font-bold text-primary-amber">Budget: {ord.budget}</div>
                              )}
                            </td>

                            {/* Rush Delivery Column */}
                            <td className="p-4 whitespace-nowrap">
                              {ord.rush_delivery ? (
                                <span className="hex-pill-sm bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 border border-red-200 shadow-sm flex items-center gap-1 w-fit">
                                  <Zap size={11} className="inline" /> 24h Rush
                                </span>
                              ) : (
                                <span className="hex-pill-sm bg-gray-100 text-[#726F6D] text-[10px] font-bold px-2.5 py-0.5 border border-gray-200">
                                  Standard 48h
                                </span>
                              )}
                            </td>

                            {/* Milestone Timeline Stepper (Interactive) */}
                            <td className="p-4">
                              <div className="bg-[#FFF9E8]/70 border border-primary/25 rounded-xl p-3 shadow-inner">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-extrabold text-[#726F6D] uppercase tracking-wider">
                                    Current Phase: <strong className="text-[#111111]">{ORDER_MILESTONES[currentIdx].label}</strong>
                                  </span>
                                  {nextMilestone && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateOrderStatus(ord.id, nextMilestone.key)}
                                      className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black text-[10px] px-2.5 py-0.5 flex items-center gap-1 transition-all shadow-sm"
                                    >
                                      Advance to {nextMilestone.label} <ArrowRight size={10} />
                                    </button>
                                  )}
                                </div>

                                {/* 4-Step Interactive Horizontal Stepper */}
                                <div className="grid grid-cols-4 gap-1.5 relative">
                                  {ORDER_MILESTONES.map((m, idx) => {
                                    const isPassed = idx < currentIdx;
                                    const isCurrent = idx === currentIdx;

                                    return (
                                      <button
                                        key={m.key}
                                        type="button"
                                        title={`Set status to ${m.fullLabel}`}
                                        onClick={() => handleUpdateOrderStatus(ord.id, m.key)}
                                        className={`group relative text-center py-2 px-1 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${
                                          isCurrent
                                            ? "bg-[#111111] text-white border-[#111111] shadow-md ring-2 ring-primary/50"
                                            : isPassed
                                            ? "bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200"
                                            : "bg-white text-gray-400 border-gray-200 hover:border-primary/50 hover:text-[#111111]"
                                        }`}
                                      >
                                        <div className="flex items-center justify-center">
                                          {isPassed ? (
                                            <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-black">
                                              <Check size={9} strokeWidth={3} />
                                            </div>
                                          ) : isCurrent ? (
                                            <div className="w-4 h-4 rounded-full bg-primary text-[#111111] flex items-center justify-center text-[9px] font-black animate-pulse">
                                              {m.step}
                                            </div>
                                          ) : (
                                            <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[9px] font-bold border border-gray-300 group-hover:border-primary">
                                              {m.step}
                                            </div>
                                          )}
                                        </div>
                                        <span className={`text-[10px] font-extrabold truncate w-full px-0.5 ${
                                          isCurrent ? "text-primary font-black" : isPassed ? "text-amber-900" : "text-gray-500"
                                        }`}>
                                          {m.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {ord.drive_link && (
                                  <a
                                    href={ord.drive_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hex-pill-sm bg-white border border-[#111111]/12 hover:border-primary text-[#111111] font-bold px-2.5 py-1.5 inline-flex items-center gap-1 text-[11px] shadow-sm"
                                  >
                                    <ExternalLink size={11} className="text-primary-amber" /> Drive
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForModal(ord)}
                                  className="hex-pill-sm bg-[#111111] text-white hover:text-primary font-bold px-3 py-1.5 inline-flex items-center gap-1 text-[11px] transition-colors shadow-sm"
                                >
                                  Inspect Brief
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: WAITLIST */}
        {activeTab === "waitlist" && (
          <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-md">
            {filteredWaitlist.length === 0 ? (
              <div className="p-12 text-center text-[#726F6D]">
                <Users size={36} className="mx-auto text-gray-300 mb-2" />
                <h4 className="font-heading font-extrabold text-sm text-[#111111]">No Waitlist Leads</h4>
                <p className="text-xs font-medium mt-1">Signups from the Coming Soon page will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] font-extrabold uppercase tracking-wider">
                      <th className="p-4">Date Joined</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Source / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111111]/6 font-medium text-[#111111]">
                    {filteredWaitlist.map((w) => (
                      <tr key={w.id} className="hover:bg-primary/5 transition-colors">
                        <td className="p-4 whitespace-nowrap text-[#726F6D]">
                          {new Date(w.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 font-extrabold text-[#111111]">
                          {w.email}
                        </td>
                        <td className="p-4 text-[#726F6D]">
                          {w.source || "Coming Soon Hero"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEMPLATES */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            {/* Storefront Metrics Visibility Controls */}
            <div className="hex-card bg-white border-2 border-primary/40 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-heading font-extrabold text-sm text-[#111111] flex items-center gap-2">
                  <Sliders size={16} className="text-primary-amber" />
                  Storefront Star Ratings & Download Metrics Controls
                </h4>
                <p className="text-xs text-[#726F6D]">
                  Control whether clients see star ratings and download counts on public template cards and detail pages.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Star Ratings Toggle */}
                <button
                  type="button"
                  onClick={async () => {
                    const next = { ...templateMetricsSettings, show_stars: !templateMetricsSettings.show_stars };
                    setTemplateMetricsSettings(next);
                    await handleSaveConfig("show_template_metrics", next);
                  }}
                  className={`hex-pill px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    templateMetricsSettings.show_stars
                      ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-sm"
                      : "bg-[#FFF9E8] text-[#726F6D] border border-primary/30"
                  }`}
                >
                  <Star size={13} className={templateMetricsSettings.show_stars ? "fill-amber-500 text-amber-500" : ""} />
                  <span>Star Ratings: {templateMetricsSettings.show_stars ? "Visible on Site" : "Hidden from Clients"}</span>
                </button>

                {/* Downloads Count Toggle */}
                <button
                  type="button"
                  onClick={async () => {
                    const next = { ...templateMetricsSettings, show_downloads: !templateMetricsSettings.show_downloads };
                    setTemplateMetricsSettings(next);
                    await handleSaveConfig("show_template_metrics", next);
                  }}
                  className={`hex-pill px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    templateMetricsSettings.show_downloads
                      ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-sm"
                      : "bg-[#FFF9E8] text-[#726F6D] border border-primary/30"
                  }`}
                >
                  <Download size={13} />
                  <span>Downloads Count: {templateMetricsSettings.show_downloads ? "Visible on Site" : "Hidden from Clients"}</span>
                </button>
              </div>
            </div>

            {/* Template Status Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-[#111111]/10 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTemplateFilter("all")}
                  className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                    adminTemplateFilter === "all"
                      ? "bg-[#111111] text-[#FCBF14]"
                      : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  All Templates ({templates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTemplateFilter("published")}
                  className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTemplateFilter === "published"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <Eye size={12} />
                  <span>Enabled on Storefront ({templates.filter(t => t.is_published !== false).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTemplateFilter("draft")}
                  className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTemplateFilter === "draft"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <EyeOff size={12} />
                  <span>Hidden / Draft ({templates.filter(t => t.is_published === false).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTemplateFilter("free")}
                  className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTemplateFilter === "free"
                      ? "bg-primary text-[#111111]"
                      : "bg-primary/20 text-[#111111] hover:bg-primary/30"
                  }`}
                >
                  <Sparkles size={12} />
                  <span>5 Free Credits Tag ({templates.filter(t => t.is_credit_eligible).length})</span>
                </button>
              </div>

              <div className="text-xs text-[#726F6D] font-bold">
                Showing {templates.filter(t => {
                  if (adminTemplateFilter === "published") return t.is_published !== false;
                  if (adminTemplateFilter === "draft") return t.is_published === false;
                  if (adminTemplateFilter === "free") return Boolean(t.is_credit_eligible);
                  return true;
                }).length} Decks
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates
                .filter(t => {
                  if (adminTemplateFilter === "published") return t.is_published !== false;
                  if (adminTemplateFilter === "draft") return t.is_published === false;
                  if (adminTemplateFilter === "free") return Boolean(t.is_credit_eligible);
                  return true;
                })
                .map((tpl) => (
                <div
                  key={tpl.id}
                  className="hex-card bg-white border border-[#111111]/10 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] bg-[#111111] overflow-hidden">
                    <img
                      src={tpl.image_url || tpl.thumbnail_url || "/portfolio/case_study_a_1.png"}
                      alt={tpl.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="hex-pill inline-block bg-[#FFF9E8] text-primary-amber border border-primary/20 text-[10px] font-extrabold px-3 py-0.5 uppercase tracking-wider">
                        {tpl.category}
                      </div>
                      {tpl.code && (
                        <span className="text-[10px] font-black text-[#726F6D] uppercase">
                          {tpl.code}
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading font-extrabold text-base text-[#111111] mb-1">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-[#726F6D] font-medium line-clamp-2 mb-3">
                      {tpl.description}
                    </p>

                    {/* Master Deliverable Format Badge */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-[#111111]/8 mb-3 text-[11px] font-bold text-[#111111]">
                      <FileText size={13} className="text-primary-amber" />
                      <span>Deliverable: Master PowerPoint (.pptx)</span>
                    </div>

                    {tpl.download_url && (
                      <div className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex items-center gap-1 mb-3">
                        <Check size={11} className="text-emerald-600" />
                        <span className="truncate">{tpl.file_name || "Direct PPTX Deliverable Attached"}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#111111]/8 text-xs font-bold">
                      <span>{tpl.slide_count || tpl.slides_count || 25} Slides</span>
                      <span className="text-primary-amber font-extrabold">
                        ₹{tpl.price_inr} / ${tpl.price_usd}
                      </span>
                    </div>

                    {/* Storefront Marketplace Visibility Toggle */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#111111]/8 text-[11px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${tpl.is_published !== false ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                        <span className="text-[10px] font-extrabold text-[#726F6D]">
                          {tpl.is_published !== false ? "Storefront: Visible" : "Storefront: Hidden"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const nextVal = tpl.is_published === false ? true : false;
                          await supabase.from("templates").update({ is_published: nextVal }).eq("id", tpl.id);
                          setTemplates(templates.map(t => t.id === tpl.id ? { ...t, is_published: nextVal } : t));
                        }}
                        className={`hex-pill text-[10px] font-black px-3 py-1 transition-all flex items-center gap-1 cursor-pointer ${
                          tpl.is_published !== false
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {tpl.is_published !== false ? (
                          <>
                            <Eye size={12} className="text-emerald-700" />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="text-gray-500" />
                            <span>Disabled</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Free Starter Credits Tag & Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#111111]/8 text-[11px] font-bold">
                      <span className="text-[10px] font-extrabold text-[#726F6D]">5 Free Credits Tag:</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const nextVal = !tpl.is_credit_eligible;
                          await supabase.from("templates").update({ is_credit_eligible: nextVal }).eq("id", tpl.id);
                          setTemplates(templates.map(t => t.id === tpl.id ? { ...t, is_credit_eligible: nextVal } : t));
                        }}
                        className={`hex-pill text-[9px] font-black px-2.5 py-1 transition-all cursor-pointer ${
                          tpl.is_credit_eligible
                            ? "bg-primary text-[#111111] border border-[#111111]/20 shadow-xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                        }`}
                      >
                        {tpl.is_credit_eligible ? "Eligible (Free Tag)" : "+ Tag as Free"}
                      </button>
                    </div>

                    {/* Template Card Controls: Edit & Delete */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#111111]/8 mt-3">
                      <button
                        type="button"
                        onClick={() => openEditTemplateModal(tpl)}
                        className="hex-pill-sm flex-1 bg-primary hover:bg-primary-dark text-[#111111] font-black py-1.5 text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Edit3 size={13} /> Edit Template
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                        className="hex-pill-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ASSETS CMS */}
        {activeTab === "assets" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((ast) => (
              <div
                key={ast.id}
                className="hex-card bg-white border border-[#111111]/10 overflow-hidden shadow-sm p-4 flex flex-col justify-between"
              >
                <div className="aspect-[16/10] bg-[#111111] rounded-xl overflow-hidden mb-3">
                  <img
                    src={ast.url}
                    alt={ast.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="hex-pill-sm bg-[#FFF9E8] text-primary-amber font-extrabold text-[10px] px-2 py-0.5 uppercase">
                      {ast.category}
                    </span>
                    <code className="text-[10px] bg-black/5 px-2 py-0.5 rounded text-[#726F6D]">
                      {ast.key}
                    </code>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                    {ast.title}
                  </h4>
                  <p className="text-[11px] text-[#726F6D] font-medium truncate">
                    {ast.url}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: GLOBAL SITE COPY & PRICING CONFIGURATION */}
        {activeTab === "config" && (
          <div className="space-y-8">
            {configSavedSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse">
                <CheckCircle2 size={16} /> Changes saved successfully to live website database!
              </div>
            )}

            {configValidationError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-shake">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" /> {configValidationError}
              </div>
            )}

            {/* Page Customizer Sub-Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#111111]/10">
              {[
                { id: "home", label: "Homepage Header", icon: Home },
                { id: "marquee", label: "Hero Marquee", icon: Layers },
                { id: "testimonials", label: "Client Testimonials", icon: MessageSquare },
                { id: "services", label: "Services & Before/After", icon: Settings },
                { id: "portfolio", label: "Portfolio & Case Studies", icon: ImageIcon },
                { id: "about", label: "About & Story", icon: Building2 },
                { id: "contact", label: "Contact & Channels", icon: Phone },
                { id: "footer", label: "Footer Links", icon: Compass },
                { id: "pricing", label: "Pricing Rates", icon: DollarSign },
                { id: "payments", label: "Razorpay Gateway", icon: CreditCard },
                { id: "emails", label: "Zoho Mail Senders", icon: Mail },
              ].map((subTab) => {
                const IconComponent = subTab.icon;
                return (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveCmsSubTab(subTab.id as any)}
                    className={`hex-pill px-4 py-2 text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      activeCmsSubTab === subTab.id
                        ? "bg-primary text-[#111111] shadow-md scale-105"
                        : "bg-white text-[#726F6D] hover:text-[#111111] border border-[#111111]/10"
                    }`}
                  >
                    <IconComponent size={13} />
                    {subTab.label}
                  </button>
                );
              })}
            </div>

            {/* SUB-TAB 1: HOMEPAGE CMS */}
            {activeCmsSubTab === "home" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Homepage Hero Customizer
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Update the hero headlines and call-to-action buttons.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("hero", siteConfigs["hero"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save Homepage"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Hero Badge Text
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["hero"]?.badge || ""}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        hero: { ...(siteConfigs["hero"] || {}), badge: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/15 hex-pill px-4 py-2 text-xs font-bold text-[#111111]"
                      placeholder="e.g. SLIDEBEE PRESENTATION ATELIER"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Delivery Guarantee Headline
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["hero"]?.guarantee || ""}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        hero: { ...(siteConfigs["hero"] || {}), guarantee: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/15 hex-pill px-4 py-2 text-xs font-bold text-[#111111]"
                      placeholder="e.g. 24–48hr turnaround · Venture-grade polish"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Main Hero Headline (Title)
                  </label>
                  <input
                    type="text"
                    value={siteConfigs["hero"]?.title || ""}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      hero: { ...(siteConfigs["hero"] || {}), title: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/15 hex-pill px-4 py-2 text-xs font-bold text-[#111111]"
                    placeholder="e.g. Decks That Win Deals & Capital"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Supporting Subtitle Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={siteConfigs["hero"]?.subtitle || ""}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      hero: { ...(siteConfigs["hero"] || {}), subtitle: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/15 rounded-xl p-3 text-xs font-medium text-[#111111]"
                    placeholder="Description paragraph appearing below the headline..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Primary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["hero"]?.ctaPrimary || ""}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        hero: { ...(siteConfigs["hero"] || {}), ctaPrimary: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/15 hex-pill px-4 py-2 text-xs font-bold text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Secondary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["hero"]?.ctaSecondary || ""}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        hero: { ...(siteConfigs["hero"] || {}), ctaSecondary: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/15 hex-pill px-4 py-2 text-xs font-bold text-[#111111]"
                    />
                  </div>
                </div>

                {/* FEATURED TEMPLATES PICKER ON HOMEPAGE */}
                <div className="pt-6 border-t border-[#111111]/8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-heading font-extrabold text-[#111111]">
                        Featured Templates on Homepage
                      </h4>
                      <p className="text-xs text-[#726F6D]">
                        Choose which presentation templates appear in the curated storefront showcase on the landing page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveConfig("featured_templates", siteConfigs["featured_templates"] || { ids: templates.slice(0, 8).map(t => t.id) })}
                      disabled={configSaving}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-1.5 text-xs shadow"
                    >
                      Save Featured Picks
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-2 bg-[#FFF9E8] rounded-xl border border-[#111111]/10">
                    {templates.map((tmpl) => {
                      const selectedIds: string[] = siteConfigs["featured_templates"]?.ids || templates.slice(0, 8).map(t => t.id);
                      const isSelected = selectedIds.includes(tmpl.id);

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            let updated: string[];
                            if (isSelected) {
                              updated = selectedIds.filter(id => id !== tmpl.id);
                            } else {
                              updated = [...selectedIds, tmpl.id];
                            }
                            setSiteConfigs({
                              ...siteConfigs,
                              featured_templates: { ids: updated }
                            });
                          }}
                          className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected 
                              ? "bg-white border-primary shadow-sm" 
                              : "bg-white/60 border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img 
                            src={tmpl.image_url || tmpl.thumbnail_url || tmpl.image || "/portfolio/case_study_a_1.png"} 
                            alt={tmpl.title} 
                            className="w-12 h-9 object-cover rounded-md border border-[#111111]/10 flex-shrink-0" 
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-primary-amber tracking-wider truncate">
                                {tmpl.category}
                              </span>
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                                isSelected ? "bg-primary text-[#111111]" : "bg-gray-200 text-gray-500"
                              }`}>
                                {isSelected ? <Check size={8} strokeWidth={3} /> : <Plus size={8} strokeWidth={3} />}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-[#111111] truncate">
                              {tmpl.title}
                            </h5>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BEFORE & AFTER SLIDER CUSTOMIZER */}
                <div className="pt-6 border-t border-[#111111]/8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-heading font-extrabold text-[#111111]">
                        Homepage Before & After Comparison Decks
                      </h4>
                      <p className="text-xs text-[#726F6D]">
                        Configure the slide images, titles, and critique descriptions for the comparison slider.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveConfig("home_before_after", siteConfigs["home_before_after"] || {
                        sales: {
                          title: "Q2 Sales Performance",
                          beforeImg: "/portfolio/nike_hsbc_cvs_8.png",
                          afterImg: "/portfolio/case_study_a_1.png",
                          beforeDesc: "Dense unformatted text, standard table layout, no visual hierarchy.",
                          afterDesc: "High-contrast KPI cards, structured revenue bar chart, clear key takeaways."
                        },
                        executive: {
                          title: "Executive Strategic Keynote",
                          beforeImg: "/portfolio/nike_hsbc_cvs_1.png",
                          afterImg: "/portfolio/case_study_a_14.png",
                          beforeDesc: "Mismatched brand colors, generic bullet points.",
                          afterDesc: "Ex-McKinsey strategic alignment, bespoke typography, focal points."
                        },
                        financial: {
                          title: "Series A Investment Deck",
                          beforeImg: "/portfolio/nike_hsbc_cvs_10.png",
                          afterImg: "/portfolio/global_brands_1.png",
                          beforeDesc: "Complex raw spreadsheets and unpolished diagrams.",
                          afterDesc: "Investor-ready cap tables, burn rate charts, and traction milestones."
                        }
                      })}
                      disabled={configSaving}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-1.5 text-xs shadow"
                    >
                      Save Before & After Decks
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["sales", "executive", "financial"] as const).map((tabKey) => {
                      const currentComp = (siteConfigs["home_before_after"] && siteConfigs["home_before_after"][tabKey]) || {
                        sales: {
                          title: "Q2 Sales Performance",
                          beforeImg: "/portfolio/nike_hsbc_cvs_8.png",
                          afterImg: "/portfolio/case_study_a_1.png",
                          beforeDesc: "Dense unformatted text, standard table layout, no visual hierarchy.",
                          afterDesc: "High-contrast KPI cards, structured revenue bar chart, clear key takeaways."
                        },
                        executive: {
                          title: "Executive Strategic Keynote",
                          beforeImg: "/portfolio/nike_hsbc_cvs_1.png",
                          afterImg: "/portfolio/case_study_a_14.png",
                          beforeDesc: "Mismatched brand colors, generic bullet points.",
                          afterDesc: "Ex-McKinsey strategic alignment, bespoke typography, focal points."
                        },
                        financial: {
                          title: "Series A Investment Deck",
                          beforeImg: "/portfolio/nike_hsbc_cvs_10.png",
                          afterImg: "/portfolio/global_brands_1.png",
                          beforeDesc: "Complex raw spreadsheets and unpolished diagrams.",
                          afterDesc: "Investor-ready cap tables, burn rate charts, and traction milestones."
                        }
                      }[tabKey];

                      return (
                        <div key={tabKey} className="bg-[#FFF9E8] p-4 rounded-2xl border border-[#111111]/10 space-y-3">
                          <div className="flex items-center justify-between border-b border-[#111111]/8 pb-2">
                            <span className="text-xs font-black uppercase text-primary-amber">
                              Tab: {tabKey.toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#111111] block mb-1">
                              Deck Title
                            </label>
                            <input
                              type="text"
                              value={currentComp.title}
                              onChange={(e) => {
                                const prev = siteConfigs["home_before_after"] || {};
                                setSiteConfigs({
                                  ...siteConfigs,
                                  home_before_after: {
                                    ...prev,
                                    [tabKey]: { ...currentComp, title: e.target.value }
                                  }
                                });
                              }}
                              className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-[#111111]"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-extrabold text-red-700">
                                Before Image (Raw Draft)
                              </label>
                              <label className="cursor-pointer text-[9px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                <UploadCloud size={11} /> Choose File
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                    const prev = siteConfigs["home_before_after"] || {};
                                    setSiteConfigs({
                                      ...siteConfigs,
                                      home_before_after: {
                                        ...prev,
                                        [tabKey]: { ...currentComp, beforeImg: dataUrl }
                                      }
                                    });
                                  })}
                                />
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              {currentComp.beforeImg && (
                                <img src={currentComp.beforeImg} alt="Before" className="w-10 h-7 object-cover rounded border border-red-300 flex-shrink-0" />
                              )}
                              <input
                                type="text"
                                value={currentComp.beforeImg}
                                onChange={(e) => {
                                  const prev = siteConfigs["home_before_after"] || {};
                                  setSiteConfigs({
                                    ...siteConfigs,
                                    home_before_after: {
                                      ...prev,
                                      [tabKey]: { ...currentComp, beforeImg: e.target.value }
                                    }
                                  });
                                }}
                                placeholder="URL or uploaded file"
                                className="w-full bg-white border border-red-200 rounded px-2.5 py-1 text-[11px] font-mono text-[#111111]"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-extrabold text-green-700">
                                After Image (SlideBee Polish)
                              </label>
                              <label className="cursor-pointer text-[9px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                <UploadCloud size={11} /> Choose File
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                    const prev = siteConfigs["home_before_after"] || {};
                                    setSiteConfigs({
                                      ...siteConfigs,
                                      home_before_after: {
                                        ...prev,
                                        [tabKey]: { ...currentComp, afterImg: dataUrl }
                                      }
                                    });
                                  })}
                                />
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              {currentComp.afterImg && (
                                <img src={currentComp.afterImg} alt="After" className="w-10 h-7 object-cover rounded border border-green-300 flex-shrink-0" />
                              )}
                              <input
                                type="text"
                                value={currentComp.afterImg}
                                onChange={(e) => {
                                  const prev = siteConfigs["home_before_after"] || {};
                                  setSiteConfigs({
                                    ...siteConfigs,
                                    home_before_after: {
                                      ...prev,
                                      [tabKey]: { ...currentComp, afterImg: e.target.value }
                                    }
                                  });
                                }}
                                placeholder="URL or uploaded file"
                                className="w-full bg-white border border-green-200 rounded px-2.5 py-1 text-[11px] font-mono text-[#111111]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                              Before Description
                            </label>
                            <textarea
                              rows={2}
                              value={currentComp.beforeDesc}
                              onChange={(e) => {
                                const prev = siteConfigs["home_before_after"] || {};
                                setSiteConfigs({
                                  ...siteConfigs,
                                  home_before_after: {
                                    ...prev,
                                    [tabKey]: { ...currentComp, beforeDesc: e.target.value }
                                  }
                                });
                              }}
                              className="w-full bg-white border border-[#111111]/12 rounded p-2 text-[10px] font-medium text-[#111111]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                              After Description
                            </label>
                            <textarea
                              rows={2}
                              value={currentComp.afterDesc}
                              onChange={(e) => {
                                const prev = siteConfigs["home_before_after"] || {};
                                setSiteConfigs({
                                  ...siteConfigs,
                                  home_before_after: {
                                    ...prev,
                                    [tabKey]: { ...currentComp, afterDesc: e.target.value }
                                  }
                                });
                              }}
                              className="w-full bg-white border border-[#111111]/12 rounded p-2 text-[10px] font-medium text-[#111111]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB: MARQUEE CMS */}
            {activeCmsSubTab === "marquee" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Services & Hero Marquee Customizer
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Select slides from existing presentation examples or upload custom images to feature in the gliding marquees.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (siteConfigs["services_marquee_cms"]) {
                        await handleSaveConfig("services_marquee_cms", siteConfigs["services_marquee_cms"]);
                      }
                      if (siteConfigs["hero"]) {
                        await handleSaveConfig("hero", siteConfigs["hero"]);
                      }
                    }}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save Marquees"}
                  </button>
                </div>

                {/* 1. Target Selector Tabs */}
                <div>
                  <label className="text-xs font-extrabold text-[#111111] block mb-2">
                    Select Marquee to Configure:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { 
                        id: "services_top", 
                        label: "Services Page — Top Marquee", 
                        count: (siteConfigs["services_marquee_cms"]?.topSlides || []).length 
                      },
                      { 
                        id: "services_bottom", 
                        label: "Services Page — Bottom Marquee", 
                        count: (siteConfigs["services_marquee_cms"]?.bottomSlides || []).length 
                      },
                      { 
                        id: "hero", 
                        label: "Homepage Hero Marquee", 
                        count: (siteConfigs["hero"]?.marqueeSlides || []).length 
                      },
                    ].map((target) => (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => setActiveMarqueeTarget(target.id as any)}
                        className={`hex-pill px-4 py-2 text-xs font-black transition-all border ${
                          activeMarqueeTarget === target.id
                            ? "bg-[#111111] text-[#FCBF14] border-primary shadow-md scale-105"
                            : "bg-white text-[#111111] border-primary/30 hover:border-primary hover:bg-[#FFF9E8]"
                        }`}
                      >
                        {target.label} ({target.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Active Slides in Selected Marquee */}
                {(() => {
                  const getActiveList = (): string[] => {
                    if (activeMarqueeTarget === "hero") return siteConfigs["hero"]?.marqueeSlides || [];
                    if (activeMarqueeTarget === "services_top") return siteConfigs["services_marquee_cms"]?.topSlides || [];
                    return siteConfigs["services_marquee_cms"]?.bottomSlides || [];
                  };

                  const updateActiveList = (newList: string[]) => {
                    if (activeMarqueeTarget === "hero") {
                      setSiteConfigs({
                        ...siteConfigs,
                        hero: { ...siteConfigs["hero"], marqueeSlides: newList }
                      });
                    } else if (activeMarqueeTarget === "services_top") {
                      setSiteConfigs({
                        ...siteConfigs,
                        services_marquee_cms: {
                          ...(siteConfigs["services_marquee_cms"] || {}),
                          topSlides: newList
                        }
                      });
                    } else {
                      setSiteConfigs({
                        ...siteConfigs,
                        services_marquee_cms: {
                          ...(siteConfigs["services_marquee_cms"] || {}),
                          bottomSlides: newList
                        }
                      });
                    }
                  };

                  const activeSlides = getActiveList();

                  return (
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                            Currently Active Slides ({activeSlides.length})
                          </h4>
                          <p className="text-[11px] text-[#726F6D]">
                            These slides glide continuously on the page.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm">
                            <UploadCloud size={14} />
                            <span>{isUploadingMarquee ? "Uploading..." : "Upload New Image"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadMarqueeImage}
                              disabled={isUploadingMarquee}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Visual Slides Grid */}
                      {activeSlides.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-primary/30 rounded-xl bg-[#FFF9E8]/50">
                          <p className="text-xs font-bold text-[#726F6D]">No slides in this marquee yet. Select from examples below or upload an image.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {activeSlides.map((slideUrl: string, idx: number) => (
                            <div key={idx} className="hex-card bg-white border border-primary/40 rounded-lg overflow-hidden shadow-sm relative group flex flex-col">
                              <div className="aspect-[16/10] bg-[#FFF9E8] overflow-hidden relative">
                                <img src={slideUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => updateActiveList(activeSlides.filter((_: any, i: number) => i !== idx))}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity shadow"
                                  title="Remove from marquee"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              <div className="p-1.5 text-[10px] font-bold text-[#111111] truncate bg-white">
                                #{idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Manual Image URL Adder */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Or paste any custom image URL to add..."
                          value={marqueeManualUrl}
                          onChange={(e) => setMarqueeManualUrl(e.target.value)}
                          className="flex-1 bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (marqueeManualUrl.trim()) {
                              updateActiveList([...activeSlides, marqueeManualUrl.trim()]);
                              setMarqueeManualUrl("");
                            }
                          }}
                          className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs"
                        >
                          + Add URL
                        </button>
                      </div>

                      {/* 3. Mapped Selection from Portfolio Examples */}
                      <div className="pt-6 border-t border-[#111111]/10 space-y-4">
                        <div>
                          <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} className="text-primary-amber" />
                            Select Directly from Example Decks (Mapped to Portfolio)
                          </h4>
                          <p className="text-[11px] text-[#726F6D]">
                            Click on any presentation slide to toggle it in/out of the currently selected marquee ({activeMarqueeTarget.replace("_", " ")}).
                          </p>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {(siteConfigs["portfolio_cms"]?.caseStudies || []).map((cs: any) => {
                            const csSlides: string[] = Array.isArray(cs.slides) && cs.slides.length > 0
                              ? cs.slides
                              : (cs.imageUrl ? [cs.imageUrl] : []);

                            return (
                              <div key={cs.id} className="bg-[#FFF9E8]/70 border border-primary/30 p-3.5 rounded-xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="hex-pill-sm bg-[#111111] text-[#FCBF14] text-[10px] font-black px-2.5 py-0.5">
                                      {cs.client}
                                    </span>
                                    <span className="text-xs font-extrabold text-[#111111]">
                                      {cs.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#726F6D]">
                                    {cs.category} • {csSlides.length} slides
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  {csSlides.map((slideUrl: string, sIdx: number) => {
                                    const isSelected = activeSlides.includes(slideUrl);

                                    return (
                                      <div
                                        key={sIdx}
                                        onClick={() => {
                                          if (isSelected) {
                                            updateActiveList(activeSlides.filter((s: string) => s !== slideUrl));
                                          } else {
                                            updateActiveList([...activeSlides, slideUrl]);
                                          }
                                        }}
                                        className={`hex-card rounded-lg overflow-hidden border-2 cursor-pointer transition-all p-1 group ${
                                          isSelected
                                            ? "border-green-600 bg-green-50/50 ring-2 ring-green-400"
                                            : "border-primary/30 bg-white hover:border-primary"
                                        }`}
                                      >
                                        <div className="aspect-[16/10] bg-[#FFF9E8] rounded overflow-hidden mb-1 relative">
                                          <img src={slideUrl} alt={`Slide ${sIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                          {isSelected && (
                                            <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-0.5 shadow">
                                              <Check size={12} />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] px-1">
                                          <span className="font-extrabold text-[#111111]">
                                            Slide {sIdx + 1}
                                          </span>
                                          <span className={`font-black ${isSelected ? "text-green-700" : "text-primary-amber"}`}>
                                            {isSelected ? "Active" : "+ Add"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. Mapped Selection from Storefront Templates (Cover & Interior Slides) */}
                      <div className="pt-6 border-t border-[#111111]/10 space-y-4">
                        <div>
                          <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-2">
                            <Layers size={14} className="text-primary-amber" />
                            Select Directly from Storefront Templates (Cover & Slide Previews)
                          </h4>
                          <p className="text-[11px] text-[#726F6D]">
                            Click any presentation template cover or interior preview slide to toggle it in/out of the {activeMarqueeTarget.replace("_", " ")} marquee.
                          </p>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {templates.map((tpl: any) => {
                            const tplSlides: string[] = Array.isArray(tpl.slides) && tpl.slides.length > 0
                              ? tpl.slides
                              : [tpl.thumbnail_url || tpl.image_url || "/portfolio/case_study_a_1.png"];

                            return (
                              <div key={tpl.id} className="bg-[#FFF9E8]/70 border border-primary/30 p-3.5 rounded-xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="hex-pill-sm bg-primary text-[#111111] text-[10px] font-black px-2.5 py-0.5">
                                      {tpl.code || "SLD"}
                                    </span>
                                    <span className="text-xs font-extrabold text-[#111111]">
                                      {tpl.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#726F6D]">
                                    {tpl.category} • {tplSlides.length} slide{tplSlides.length > 1 ? "s" : ""}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                                  {tplSlides.map((slideUrl: string, sIdx: number) => {
                                    const isSelected = activeSlides.includes(slideUrl);

                                    return (
                                      <div
                                        key={sIdx}
                                        onClick={() => {
                                          if (isSelected) {
                                            updateActiveList(activeSlides.filter((s: string) => s !== slideUrl));
                                          } else {
                                            updateActiveList([...activeSlides, slideUrl]);
                                          }
                                        }}
                                        className={`hex-card rounded-lg overflow-hidden border-2 cursor-pointer transition-all p-1 group ${
                                          isSelected
                                            ? "border-green-600 bg-green-50/50 ring-2 ring-green-400"
                                            : "border-primary/30 bg-white hover:border-primary"
                                        }`}
                                      >
                                        <div className="aspect-[16/10] bg-[#FFF9E8] rounded overflow-hidden mb-1 relative">
                                          <img src={slideUrl} alt={`Slide ${sIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                          {isSelected && (
                                            <div className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-0.5 shadow">
                                              <Check size={12} />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] px-1">
                                          <span className="font-extrabold text-[#111111]">
                                            {sIdx === 0 ? "Cover" : `Slide ${sIdx + 1}`}
                                          </span>
                                          <span className={`font-black ${isSelected ? "text-green-700" : "text-primary-amber"}`}>
                                            {isSelected ? "Active" : "+ Add"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>
            )}

            {/* SUB-TAB: TESTIMONIALS CMS */}
            {activeCmsSubTab === "testimonials" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Client Testimonials & Social Proof Customizer
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Add, edit, or remove executive reviews, star ratings, quotes, names, roles, and avatar photos.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS;
                        setSiteConfigs({
                          ...siteConfigs,
                          testimonials: [
                            ...current,
                            {
                              name: "New Client",
                              role: "VP of Product, Apex",
                              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                              rating: 5,
                              quote: "Outstanding visual quality and fast turnaround time on our board slides."
                            }
                          ]
                        });
                      }}
                      className="text-xs font-bold text-primary-amber hover:underline px-3 py-1.5 bg-[#FFF9E8] rounded-lg border border-primary/30"
                    >
                      + Add New Testimonial
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveConfig("testimonials", siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)}
                      disabled={configSaving}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2 text-xs flex items-center gap-1.5 shadow"
                    >
                      <Save size={14} /> {configSaving ? "Saving..." : "Save Testimonials"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS).map((t: any, idx: number) => (
                    <div key={idx} className="bg-[#FFF9E8] p-4 rounded-2xl border border-[#111111]/10 space-y-3 relative">
                      <div className="flex items-center justify-between border-b border-[#111111]/8 pb-2">
                        <span className="text-xs font-black uppercase text-primary-amber">
                          Review #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = [...(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)];
                            current.splice(idx, 1);
                            setSiteConfigs({
                              ...siteConfigs,
                              testimonials: current
                            });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">
                            Client Name
                          </label>
                          <input
                            type="text"
                            value={t.name ?? ""}
                            onChange={(e) => {
                              const current = [...(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)];
                              current[idx] = { ...current[idx], name: e.target.value };
                              setSiteConfigs({ ...siteConfigs, testimonials: current });
                            }}
                            className="w-full bg-white border border-[#111111]/12 hex-pill px-2.5 py-1 text-xs font-bold text-[#111111]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">
                            Star Rating (1-5)
                          </label>
                          <select
                            value={t.rating || 5}
                            onChange={(e) => {
                              const current = [...(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)];
                              current[idx] = { ...current[idx], rating: Number(e.target.value) };
                              setSiteConfigs({ ...siteConfigs, testimonials: current });
                            }}
                            className="w-full bg-white border border-[#111111]/12 hex-pill px-2.5 py-1 text-xs font-bold text-[#111111]"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                            <option value={3}>⭐⭐⭐ (3 Stars)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#111111] block mb-1">
                          Role / Title & Company
                        </label>
                        <input
                          type="text"
                          value={t.role ?? ""}
                          onChange={(e) => {
                            const current = [...(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)];
                            current[idx] = { ...current[idx], role: e.target.value };
                            setSiteConfigs({ ...siteConfigs, testimonials: current });
                          }}
                          className="w-full bg-white border border-[#111111]/12 hex-pill px-2.5 py-1 text-xs font-medium text-[#111111]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-[#111111]">
                            Avatar Photo
                          </label>
                          <label className="cursor-pointer text-[9px] font-bold text-primary-amber bg-white hover:bg-amber-50 border border-primary/30 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                            <UploadCloud size={11} /> Choose Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                const current = [...(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)];
                                current[idx] = { ...current[idx], avatar: dataUrl };
                                setSiteConfigs({ ...siteConfigs, testimonials: current });
                              })}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <img 
                            src={t.avatar} 
                            alt="Avatar" 
                            className="w-7 h-7 rounded-full object-cover border border-[#111111]/20 flex-shrink-0" 
                          />
                          <input
                            type="text"
                            value={t.avatar ?? ""}
                            onChange={(e) => {
                              const current = [...(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)];
                              current[idx] = { ...current[idx], avatar: e.target.value };
                              setSiteConfigs({ ...siteConfigs, testimonials: current });
                            }}
                            placeholder="Image URL or upload"
                            className="w-full bg-white border border-[#111111]/12 rounded px-2 py-1 text-[10px] font-mono text-[#111111]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                          Quote / Client Feedback
                        </label>
                        <textarea
                          rows={2}
                          value={t.quote ?? ""}
                          onChange={(e) => {
                            const current = [...(siteConfigs["testimonials"] || DEFAULT_TESTIMONIALS)];
                            current[idx] = { ...current[idx], quote: e.target.value };
                            setSiteConfigs({ ...siteConfigs, testimonials: current });
                          }}
                          className="w-full bg-white border border-[#111111]/12 rounded p-2 text-xs font-medium text-[#111111]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 2: SERVICES & BEFORE/AFTER CMS */}
            {activeCmsSubTab === "services" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Services & Before / After Slider Customizer
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Update the 6 service tiers, turnaround times, and before/after comparison decks
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("services_cms", siteConfigs["services_cms"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save All Services"}
                  </button>
                </div>

                <div className="space-y-8">
                  {Object.keys(siteConfigs["services_cms"] || {}).map((serviceKey) => {
                    const svc = siteConfigs["services_cms"][serviceKey];
                    return (
                      <div key={serviceKey} className="bg-[#FFF9E8] p-5 rounded-2xl border border-[#111111]/10 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#111111]/8 pb-3">
                          <span className="text-xs font-black uppercase tracking-wider text-primary-amber">
                            Service: {svc.title}
                          </span>
                          <span className="text-[11px] font-bold text-[#726F6D]">
                            ID: {serviceKey}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-[#111111] block mb-1">
                              Service Title
                            </label>
                            <input
                              type="text"
                              value={svc.title || ""}
                              onChange={(e) => setSiteConfigs({
                                ...siteConfigs,
                                services_cms: {
                                  ...siteConfigs["services_cms"],
                                  [serviceKey]: { ...svc, title: e.target.value }
                                }
                              })}
                              className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-bold text-[#111111]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#111111] block mb-1">
                              Turnaround Time Badge
                            </label>
                            <input
                              type="text"
                              value={svc.turnaround || ""}
                              onChange={(e) => setSiteConfigs({
                                ...siteConfigs,
                                services_cms: {
                                  ...siteConfigs["services_cms"],
                                  [serviceKey]: { ...svc, turnaround: e.target.value }
                                }
                              })}
                              className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-medium text-[#111111]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-[#111111] block mb-1">
                              Ideal For Audience
                            </label>
                            <input
                              type="text"
                              value={svc.idealFor || ""}
                              onChange={(e) => setSiteConfigs({
                                ...siteConfigs,
                                services_cms: {
                                  ...siteConfigs["services_cms"],
                                  [serviceKey]: { ...svc, idealFor: e.target.value }
                                }
                              })}
                              className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-medium text-[#111111]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-[#111111] block mb-1">
                            Service Description / Tagline
                          </label>
                          <input
                            type="text"
                            value={svc.tagline || ""}
                            onChange={(e) => setSiteConfigs({
                              ...siteConfigs,
                              services_cms: {
                                ...siteConfigs["services_cms"],
                                [serviceKey]: { ...svc, tagline: e.target.value }
                              }
                            })}
                            className="w-full bg-white border border-[#111111]/12 rounded-xl px-3 py-1.5 text-xs font-medium text-[#111111]"
                          />
                        </div>

                        {/* Before / After Images */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#111111]/6">
                          <div className="bg-white p-3 rounded-xl border border-red-200">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-extrabold text-red-700 block">
                                Raw Draft (Before Image)
                              </label>
                              <label className="cursor-pointer text-[9px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                <UploadCloud size={11} /> Upload Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                    setSiteConfigs({
                                      ...siteConfigs,
                                      services_cms: {
                                        ...siteConfigs["services_cms"],
                                        [serviceKey]: { ...svc, beforeImg: dataUrl }
                                      }
                                    });
                                  })}
                                />
                              </label>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {svc.beforeImg && (
                                <img
                                  src={svc.beforeImg}
                                  alt="Before Preview"
                                  className="w-12 h-8 object-cover rounded border border-red-200 flex-shrink-0"
                                />
                              )}
                              <input
                                type="text"
                                value={svc.beforeImg || ""}
                                onChange={(e) => setSiteConfigs({
                                  ...siteConfigs,
                                  services_cms: {
                                    ...siteConfigs["services_cms"],
                                    [serviceKey]: { ...svc, beforeImg: e.target.value }
                                  }
                                })}
                                placeholder="Image URL or upload"
                                className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded px-2.5 py-1 text-[11px] font-mono"
                              />
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              Label: {svc.beforeTitle}
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-extrabold text-green-700 block">
                                SlideBee Polish (After Image)
                              </label>
                              <label className="cursor-pointer text-[9px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                <UploadCloud size={11} /> Upload Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                    setSiteConfigs({
                                      ...siteConfigs,
                                      services_cms: {
                                        ...siteConfigs["services_cms"],
                                        [serviceKey]: { ...svc, afterImg: dataUrl }
                                      }
                                    });
                                  })}
                                />
                              </label>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {svc.afterImg && (
                                <img
                                  src={svc.afterImg}
                                  alt="After Preview"
                                  className="w-12 h-8 object-cover rounded border border-green-200 flex-shrink-0"
                                />
                              )}
                              <input
                                type="text"
                                value={svc.afterImg || ""}
                                onChange={(e) => setSiteConfigs({
                                  ...siteConfigs,
                                  services_cms: {
                                    ...siteConfigs["services_cms"],
                                    [serviceKey]: { ...svc, afterImg: e.target.value }
                                  }
                                })}
                                placeholder="Image URL or upload"
                                className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded px-2.5 py-1 text-[11px] font-mono"
                              />
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              Label: {svc.afterTitle}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PREVIOUS WORKED COMPANIES MARQUEE CUSTOMIZER */}
                <div className="pt-6 border-t border-[#111111]/8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/10">
                    <div>
                      <h4 className="text-sm font-heading font-black text-[#111111] uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={15} className="text-primary-amber" />
                        Previous Worked Companies Brand Marquee (/services)
                      </h4>
                      <p className="text-xs text-[#726F6D]">
                        Manage the continuous scrolling brand marquee of enterprise clients and partners.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const caseStudies = siteConfigs["portfolio_cms"]?.caseStudies || [];
                          const existingNames = new Set((siteConfigs["worked_companies"]?.companies || []).map((c: any) => c.name.toLowerCase()));
                          const newCompanies = [...(siteConfigs["worked_companies"]?.companies || [])];
                          
                          caseStudies.forEach((cs: any) => {
                            const rawClient = cs.client || cs.title.split(" ")[0];
                            if (rawClient && !existingNames.has(rawClient.toLowerCase())) {
                              existingNames.add(rawClient.toLowerCase());
                              newCompanies.push({
                                name: rawClient,
                                category: cs.category || "Enterprise Partner"
                              });
                            }
                          });
                          
                          setSiteConfigs({
                            ...siteConfigs,
                            worked_companies: { companies: newCompanies }
                          });
                        }}
                        className="hex-pill bg-white hover:bg-primary/10 text-[#111111] border border-primary/40 font-black px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <RefreshCw size={13} className="text-primary-amber" /> Sync from Portfolio Case Studies
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig("worked_companies", siteConfigs["worked_companies"] || { companies: [] })}
                        disabled={configSaving}
                        className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-1.5 text-xs flex items-center gap-1.5 shadow cursor-pointer"
                      >
                        <Save size={13} /> {configSaving ? "Saving..." : "Save Companies"}
                      </button>
                    </div>
                  </div>

                  {/* Current Companies Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(siteConfigs["worked_companies"]?.companies || []).map((comp: any, cIdx: number) => (
                      <div key={cIdx} className="hex-card bg-white p-3 rounded-xl border border-primary/30 flex items-center justify-between shadow-xs">
                        <div>
                          <div className="font-heading font-extrabold text-xs text-[#111111]">
                            {comp.name}
                          </div>
                          <div className="text-[10px] text-[#726F6D] font-medium">
                            {comp.category || "Enterprise Partner"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (siteConfigs["worked_companies"]?.companies || []).filter((_: any, i: number) => i !== cIdx);
                            setSiteConfigs({
                              ...siteConfigs,
                              worked_companies: { companies: updated }
                            });
                          }}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Remove company"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Company Form */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-[#111111]/8">
                    <input
                      type="text"
                      placeholder="Company Name (e.g. Goldman Sachs)"
                      value={newWorkedCompanyName}
                      onChange={(e) => setNewWorkedCompanyName(e.target.value)}
                      className="flex-1 bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Industry Category (e.g. Investment Banking)"
                      value={newWorkedCompanyCategory}
                      onChange={(e) => setNewWorkedCompanyCategory(e.target.value)}
                      className="flex-1 bg-white border border-[#111111]/15 rounded-lg px-3 py-2 text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newWorkedCompanyName.trim()) {
                          const updated = [
                            ...(siteConfigs["worked_companies"]?.companies || []),
                            {
                              name: newWorkedCompanyName.trim(),
                              category: newWorkedCompanyCategory.trim() || "Enterprise Client"
                            }
                          ];
                          setSiteConfigs({
                            ...siteConfigs,
                            worked_companies: { companies: updated }
                          });
                          setNewWorkedCompanyName("");
                          setNewWorkedCompanyCategory("");
                        }
                      }}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-2 text-xs whitespace-nowrap cursor-pointer shadow-sm"
                    >
                      + Add Company
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: PORTFOLIO & CASE STUDIES CMS */}
            {activeCmsSubTab === "portfolio" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Portfolio & Case Studies Customizer (/examples)
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Add, edit, or remove client presentation showcase items and impact statistics
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("portfolio_cms", siteConfigs["portfolio_cms"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save Portfolio"}
                  </button>
                </div>

                <div className="space-y-4">
                  {(siteConfigs["portfolio_cms"]?.caseStudies || []).map((cs: any, idx: number) => (
                    <div key={idx} className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/10 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-primary-amber uppercase tracking-wider">
                          Case Study #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = siteConfigs["portfolio_cms"].caseStudies.filter((_: any, i: number) => i !== idx);
                            setSiteConfigs({
                              ...siteConfigs,
                              portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated }
                            });
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">Project Title</label>
                          <input
                            type="text"
                            value={cs.title || ""}
                            onChange={(e) => {
                              const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                              updated[idx].title = e.target.value;
                              setSiteConfigs({ ...siteConfigs, portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated } });
                            }}
                            className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">Client Name</label>
                          <input
                            type="text"
                            value={cs.client || ""}
                            onChange={(e) => {
                              const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                              updated[idx].client = e.target.value;
                              setSiteConfigs({ ...siteConfigs, portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated } });
                            }}
                            className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">Category Filter</label>
                          <input
                            type="text"
                            value={cs.category || ""}
                            onChange={(e) => {
                              const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                              updated[idx].category = e.target.value;
                              setSiteConfigs({ ...siteConfigs, portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated } });
                            }}
                            className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">Impact Stat (e.g. $14M Raised)</label>
                          <input
                            type="text"
                            value={cs.impact || ""}
                            onChange={(e) => {
                              const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                              updated[idx].impact = e.target.value;
                              setSiteConfigs({ ...siteConfigs, portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated } });
                            }}
                            className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1 text-xs font-extrabold text-primary-amber"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-[#111111]">Primary Cover / Thumbnail</label>
                            <label className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-2 py-0.5 text-[9px] inline-flex items-center gap-1 cursor-pointer">
                              <UploadCloud size={10} className="text-primary-amber" /> Upload Cover
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                  const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                                  const existingSlides = Array.isArray(updated[idx].slides) && updated[idx].slides.length > 0
                                    ? [...updated[idx].slides]
                                    : [dataUrl];
                                  existingSlides[0] = dataUrl;
                                  updated[idx] = {
                                    ...updated[idx],
                                    imageUrl: dataUrl,
                                    slides: existingSlides
                                  };
                                  setSiteConfigs({ ...siteConfigs, portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated } });
                                })}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={cs.imageUrl || ""}
                            onChange={(e) => {
                              const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                              const newCover = e.target.value;
                              const existingSlides = Array.isArray(updated[idx].slides) && updated[idx].slides.length > 0
                                ? [...updated[idx].slides]
                                : [newCover];
                              existingSlides[0] = newCover;
                              updated[idx] = {
                                ...updated[idx],
                                imageUrl: newCover,
                                slides: existingSlides
                              };
                              setSiteConfigs({ ...siteConfigs, portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated } });
                            }}
                            className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#111111] block mb-1">Brief Description</label>
                          <input
                            type="text"
                            value={cs.description || ""}
                            onChange={(e) => {
                              const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                              updated[idx].description = e.target.value;
                              setSiteConfigs({ ...siteConfigs, portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated } });
                            }}
                            className="w-full bg-white border border-[#111111]/12 rounded px-2.5 py-1 text-xs"
                          />
                        </div>
                      </div>

                      {/* Multi-Slide Series Showcase Gallery */}
                      {(() => {
                        const currentSlides: string[] = Array.isArray(cs.slides) && cs.slides.length > 0
                          ? cs.slides
                          : (cs.imageUrl ? [cs.imageUrl] : []);

                        return (
                          <div className="bg-white/90 rounded-xl p-3 border border-[#111111]/10 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Layers size={13} className="text-primary-amber" />
                                <span className="text-[11px] font-heading font-extrabold text-[#111111]">
                                  Slide Showcase Series ({currentSlides.length} Slides)
                                </span>
                              </div>
                              <span className="text-[10px] text-[#726F6D] font-medium">
                                Flip through with Prev/Next buttons & thumbnails on /examples
                              </span>
                            </div>

                            {/* Thumbnails strip */}
                            {currentSlides.length > 0 && (
                              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {currentSlides.map((slideImg: string, sIdx: number) => (
                                  <div
                                    key={sIdx}
                                    className={`relative group shrink-0 w-24 rounded-lg overflow-hidden border p-1 bg-[#FFF9E8] ${
                                      sIdx === 0 ? "border-primary ring-2 ring-primary/40" : "border-[#111111]/15"
                                    }`}
                                  >
                                    <div className="aspect-[16/10] bg-[#111111] rounded overflow-hidden mb-1">
                                      <img src={slideImg} alt={`Slide ${sIdx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex items-center justify-between text-[9px]">
                                      <span className="font-extrabold text-[#111111]">
                                        {sIdx === 0 ? "Cover" : `#${sIdx + 1}`}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {sIdx > 0 && (
                                          <button
                                            type="button"
                                            title="Make Cover"
                                            onClick={() => {
                                              const nextSlides = [...currentSlides];
                                              const [moved] = nextSlides.splice(sIdx, 1);
                                              nextSlides.unshift(moved);
                                              const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                                              updated[idx] = {
                                                ...updated[idx],
                                                slides: nextSlides,
                                                imageUrl: nextSlides[0]
                                              };
                                              setSiteConfigs({
                                                ...siteConfigs,
                                                portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated }
                                              });
                                            }}
                                            className="text-[9px] text-primary-amber hover:underline font-extrabold"
                                          >
                                            Top
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          title="Remove slide"
                                          onClick={() => {
                                            const nextSlides = currentSlides.filter((_, i) => i !== sIdx);
                                            const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                                            updated[idx] = {
                                              ...updated[idx],
                                              slides: nextSlides,
                                              imageUrl: nextSlides[0] || ""
                                            };
                                            setSiteConfigs({
                                              ...siteConfigs,
                                              portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated }
                                            });
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Slides Action Bar */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#111111]/8">
                              <label className={`hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${isUploadingSlide ? "opacity-60 cursor-not-allowed" : ""}`}>
                                <UploadCloud size={12} className="text-primary-amber" />
                                <span>{isUploadingSlide ? "Uploading to Storage..." : "Upload Slides to Cloud Storage"}</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  disabled={isUploadingSlide}
                                  onChange={(e) => handleCaseStudySlidesUpload(idx, e)}
                                  className="hidden"
                                />
                              </label>

                              <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Or paste slide image URL and press Enter..."
                                  id={`cs-slide-input-${idx}`}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const input = e.currentTarget;
                                      const val = input.value.trim();
                                      if (val) {
                                        const nextSlides = [...currentSlides, val];
                                        const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                                        updated[idx] = {
                                          ...updated[idx],
                                          slides: nextSlides,
                                          imageUrl: updated[idx].imageUrl || nextSlides[0]
                                        };
                                        setSiteConfigs({
                                          ...siteConfigs,
                                          portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated }
                                        });
                                        input.value = "";
                                      }
                                    }
                                  }}
                                  className="flex-1 bg-white border border-[#111111]/12 rounded px-2 py-1 text-xs font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`cs-slide-input-${idx}`) as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                      const val = input.value.trim();
                                      const nextSlides = [...currentSlides, val];
                                      const updated = [...siteConfigs["portfolio_cms"].caseStudies];
                                      updated[idx] = {
                                        ...updated[idx],
                                        slides: nextSlides,
                                        imageUrl: updated[idx].imageUrl || nextSlides[0]
                                      };
                                      setSiteConfigs({
                                        ...siteConfigs,
                                        portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: updated }
                                      });
                                      input.value = "";
                                    }
                                  }}
                                  className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-bold px-2.5 py-1 text-[11px]"
                                >
                                  + Add Slide
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const current = siteConfigs["portfolio_cms"]?.caseStudies || [];
                      const newCS = {
                        id: Date.now(),
                        title: "Enterprise Strategy & Digital Keynote",
                        client: "New Enterprise Brand",
                        category: "Strategy & Operations",
                        slides: [
                          "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg",
                          "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-2.jpg"
                        ],
                        imageUrl: "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev/templates/slides/accenture_slide-1.jpg",
                        impact: "Executive Alignment",
                        description: "High-impact presentation deck crafted for leadership and strategic alignment.",
                        deliverables: ["PowerPoint Master Deck", "Executive Keynote", "Custom Vector Icons"]
                      };
                      setSiteConfigs({
                        ...siteConfigs,
                        portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: [...current, newCS] }
                      });
                    }}
                    className="hex-pill w-full bg-[#FFF9E8] hover:bg-black/5 text-[#111111] border border-[#111111]/15 py-3 text-xs font-extrabold flex items-center justify-center gap-2"
                  >
                    + Add New Case Study (Maps to Examples & Services Marquee)
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: ABOUT PAGE CMS */}
            {activeCmsSubTab === "about" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      About Page Story & Mission Customizer
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Update brand story, mission, and company background (/about)
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("about_cms", siteConfigs["about_cms"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save About Page"}
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Story Section Heading
                  </label>
                  <input
                    type="text"
                    value={siteConfigs["about_cms"]?.storyHeading || "Most Great Ideas Get Lost in Bad PowerPoint Slides."}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      about_cms: { ...siteConfigs["about_cms"], storyHeading: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-bold text-[#111111]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Story Paragraph 1
                    </label>
                    <textarea
                      rows={3}
                      value={siteConfigs["about_cms"]?.storyParagraph1 || ""}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        about_cms: { ...siteConfigs["about_cms"], storyParagraph1: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-xl p-3 text-xs font-medium text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Story Paragraph 2
                    </label>
                    <textarea
                      rows={3}
                      value={siteConfigs["about_cms"]?.storyParagraph2 || ""}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        about_cms: { ...siteConfigs["about_cms"], storyParagraph2: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-xl p-3 text-xs font-medium text-[#111111]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: CONTACT & CHANNELS CMS */}
            {activeCmsSubTab === "contact" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Contact & Channels Customizer (/contact)
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Update studio support emails, WhatsApp hotline, and response time guarantee
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("contact_cms", siteConfigs["contact_cms"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save Contact Info"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Primary Client Email
                    </label>
                    <input
                      type="email"
                      value={siteConfigs["contact_cms"]?.generalEmail || "hello@theslidebee.com"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        contact_cms: { ...siteConfigs["contact_cms"], generalEmail: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Support / Intake Email
                    </label>
                    <input
                      type="email"
                      value={siteConfigs["contact_cms"]?.supportEmail || "support@theslidebee.com"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        contact_cms: { ...siteConfigs["contact_cms"], supportEmail: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      WhatsApp Hotline / Phone
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["contact_cms"]?.whatsapp || "+1 (555) 123-4567"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        contact_cms: { ...siteConfigs["contact_cms"], whatsapp: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Response Guarantee Badge
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["contact_cms"]?.responseGuarantee || "2-Hour Response Time"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        contact_cms: { ...siteConfigs["contact_cms"], responseGuarantee: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-bold text-primary-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Studio Physical Address
                  </label>
                  <input
                    type="text"
                    value={siteConfigs["contact_cms"]?.address || "123 Design Avenue, Suite 400, New York, NY 10001"}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      contact_cms: { ...siteConfigs["contact_cms"], address: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 6: FOOTER LINKS CMS */}
            {activeCmsSubTab === "footer" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Footer Social Media & Brand Links Customizer
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Update LinkedIn, Twitter/X, Instagram, and Dribbble channels
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("footer_cms", siteConfigs["footer_cms"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save Footer Links"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={siteConfigs["footer_cms"]?.linkedinUrl || "https://linkedin.com/company/theslidebee"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        footer_cms: { ...siteConfigs["footer_cms"], linkedinUrl: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Twitter / X URL
                    </label>
                    <input
                      type="url"
                      value={siteConfigs["footer_cms"]?.twitterUrl || "https://twitter.com/theslidebee"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        footer_cms: { ...siteConfigs["footer_cms"], twitterUrl: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={siteConfigs["footer_cms"]?.instagramUrl || "https://instagram.com/theslidebee"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        footer_cms: { ...siteConfigs["footer_cms"], instagramUrl: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Dribbble Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={siteConfigs["footer_cms"]?.dribbbleUrl || "https://dribbble.com/theslidebee"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        footer_cms: { ...siteConfigs["footer_cms"], dribbbleUrl: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-mono text-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={siteConfigs["footer_cms"]?.tagline || "Elevating presentations for world-class brands."}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      footer_cms: { ...siteConfigs["footer_cms"], tagline: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 7: PRICING CMS */}
            {activeCmsSubTab === "pricing" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8 mb-6">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      Service Pricing Rates & Retainers
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Control per-slide prices for all tiers in USD ($) and INR (₹)
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("pricing", siteConfigs["pricing"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-5 py-2 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save Pricing"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-3">
                      1. Presentation Redesign
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                          USD Rate / slide ($)
                        </label>
                        <input
                          type="number"
                          value={siteConfigs["pricing"]?.rate_usd_redesign || 19}
                          onChange={(e) => setSiteConfigs({
                            ...siteConfigs,
                            pricing: { ...siteConfigs["pricing"], rate_usd_redesign: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                          INR Rate / slide (₹)
                        </label>
                        <input
                          type="number"
                          value={siteConfigs["pricing"]?.rate_inr_redesign || 1499}
                          onChange={(e) => setSiteConfigs({
                            ...siteConfigs,
                            pricing: { ...siteConfigs["pricing"], rate_inr_redesign: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-3">
                      2. Venture Pitch Deck
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                          USD Rate / slide ($)
                        </label>
                        <input
                          type="number"
                          value={siteConfigs["pricing"]?.rate_usd_pitch || 29}
                          onChange={(e) => setSiteConfigs({
                            ...siteConfigs,
                            pricing: { ...siteConfigs["pricing"], rate_usd_pitch: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                          INR Rate / slide (₹)
                        </label>
                        <input
                          type="number"
                          value={siteConfigs["pricing"]?.rate_inr_pitch || 2299}
                          onChange={(e) => setSiteConfigs({
                            ...siteConfigs,
                            pricing: { ...siteConfigs["pricing"], rate_inr_pitch: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-amber mb-3">
                      3. Executive Keynote
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                          USD Rate / slide ($)
                        </label>
                        <input
                          type="number"
                          value={siteConfigs["pricing"]?.rate_usd_executive || 49}
                          onChange={(e) => setSiteConfigs({
                            ...siteConfigs,
                            pricing: { ...siteConfigs["pricing"], rate_usd_executive: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#726F6D] block mb-1">
                          INR Rate / slide (₹)
                        </label>
                        <input
                          type="number"
                          value={siteConfigs["pricing"]?.rate_inr_executive || 3899}
                          onChange={(e) => setSiteConfigs({
                            ...siteConfigs,
                            pricing: { ...siteConfigs["pricing"], rate_inr_executive: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs font-extrabold text-[#111111]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Access Subscription & Yearly 50% Off Config */}
                <div className="mt-8 pt-6 border-t border-[#111111]/8">
                  <h4 className="text-sm font-heading font-extrabold text-[#111111] mb-1">
                    SlideBee Pro Access Subscription & Yearly Deal
                  </h4>
                  <p className="text-xs text-[#726F6D] mb-4">
                    Set monthly base price and yearly discount percentage (automatically calculates 50% off yearly billing).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#FFF9E8] p-5 rounded-2xl border border-[#111111]/8">
                    <div>
                      <label className="text-xs font-bold text-[#111111] block mb-1">
                        Monthly Base Price (₹ INR)
                      </label>
                      <input
                        type="number"
                        value={siteConfigs["pricing"]?.pro_monthly_inr ?? 199}
                        onChange={(e) => setSiteConfigs({
                          ...siteConfigs,
                          pricing: { 
                            ...siteConfigs["pricing"], 
                            pro_monthly_inr: Number(e.target.value) 
                          }
                        })}
                        className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-2 text-xs font-black text-[#111111]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#111111] block mb-1">
                        Yearly Discount Percentage (%)
                      </label>
                      <input
                        type="number"
                        value={siteConfigs["pricing"]?.pro_discount_percent ?? 50}
                        onChange={(e) => setSiteConfigs({
                          ...siteConfigs,
                          pricing: { 
                            ...siteConfigs["pricing"], 
                            pro_discount_percent: Number(e.target.value) 
                          }
                        })}
                        className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-2 text-xs font-black text-[#111111]"
                      />
                    </div>

                    <div className="flex flex-col justify-between bg-white p-3.5 rounded-xl border border-primary/40">
                      <span className="text-[10px] font-extrabold uppercase text-primary-amber tracking-wider">
                        Auto-Calculated Yearly Price
                      </span>
                      <div className="text-xl font-heading font-black text-[#111111]">
                        ₹{Math.round(
                          ((siteConfigs["pricing"]?.pro_monthly_inr ?? 199) * 12) * 
                          (1 - (siteConfigs["pricing"]?.pro_discount_percent ?? 50) / 100)
                        ).toLocaleString()} <span className="text-xs font-medium text-[#726F6D]">/year</span>
                      </div>
                      <span className="text-[10px] text-green-700 font-bold">
                        Saves {(siteConfigs["pricing"]?.pro_discount_percent ?? 50)}% compared to 12 monthly payments
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 10: RAZORPAY PAYMENT GATEWAY SETTINGS */}
            {activeCmsSubTab === "payments" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
                      Razorpay Payment Gateway Integration
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Configure your Razorpay API Test or Live keys for template checkouts and payments.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        localStorage.setItem("slidebee_razorpay_key", razorpayKeyId);
                        localStorage.setItem("slidebee_razorpay_secret", razorpayKeySecret);
                        localStorage.setItem("slidebee_razorpay_mode", razorpayMode);
                        try {
                          await supabase.from("site_config").upsert([
                            {
                              key: "razorpay_settings",
                              value: {
                                key_id: razorpayKeyId,
                                mode: razorpayMode,
                                updated_at: new Date().toISOString()
                              }
                            }
                          ], { onConflict: "key" });
                        } catch (e) {
                          console.warn("Supabase config save notice:", e);
                        }
                        setConfigSavedSuccess(true);
                        setTimeout(() => setConfigSavedSuccess(false), 3000);
                      }}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2 text-xs flex items-center gap-1.5 shadow"
                    >
                      <Save size={14} /> Save Gateway Keys
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1.5">
                      Razorpay Key ID (Public Key)
                    </label>
                    <input
                      type="text"
                      placeholder="rzp_test_... or rzp_live_..."
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value.trim())}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs font-mono font-bold text-[#111111] outline-none"
                    />
                    <span className="text-[10px] text-[#726F6D] mt-1 block">
                      Found in Razorpay Dashboard &gt; Settings &gt; API Keys.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1.5">
                      Razorpay Key Secret (Private Key)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter secret key..."
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value.trim())}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs font-mono font-bold text-[#111111] outline-none"
                    />
                    <span className="text-[10px] text-[#726F6D] mt-1 block">
                      Used for backend webhook verification & automated billing.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1.5">
                      Environment Mode
                    </label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="razorpay_mode"
                          checked={razorpayMode === "test"}
                          onChange={() => setRazorpayMode("test")}
                          className="accent-primary"
                        />
                        <span>Test Mode (Sandbox)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="razorpay_mode"
                          checked={razorpayMode === "live"}
                          onChange={() => setRazorpayMode("live")}
                          className="accent-primary"
                        />
                        <span>Live Mode (Production)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-amber shrink-0 mt-0.5">
                    <CreditCard size={16} />
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="font-extrabold text-[#111111] block">Integration Status:</span>
                    <p className="text-[#726F6D] leading-relaxed">
                      {razorpayKeyId ? (
                        <span className="text-emerald-800 font-bold">
                          Key configured ({razorpayKeyId.slice(0, 10)}...). Real test checkouts are active on all template downloads!
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium">
                          Waiting for API Key: You can paste your test key (<code className="font-mono text-[10px]">rzp_test_...</code>) right here whenever you obtain it from your Razorpay dashboard. In the meantime, the storefront is equipped with a smooth test-mode payment simulator.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 11: ZOHO MAIL SENDER ROUTING */}
            {activeCmsSubTab === "emails" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
                      Zoho Mail Senders & Deliverable Dispatcher
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Configure which Zoho custom domain address dispatches templates, inquiry replies, and invoices.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      localStorage.setItem("slidebee_zoho_deliverable_email", zohoDeliverableEmail);
                      localStorage.setItem("slidebee_zoho_inquiries_email", zohoInquiriesEmail);
                      localStorage.setItem("slidebee_zoho_billing_email", zohoBillingEmail);
                      try {
                        await supabase.from("site_config").upsert([
                          {
                            key: "zoho_mail_settings",
                            value: {
                              deliverables: zohoDeliverableEmail,
                              inquiries: zohoInquiriesEmail,
                              billing: zohoBillingEmail,
                              updated_at: new Date().toISOString()
                            }
                          }
                        ], { onConflict: "key" });
                      } catch (e) {
                        console.warn("Supabase config save notice:", e);
                      }
                      setConfigSavedSuccess(true);
                      setTimeout(() => setConfigSavedSuccess(false), 3000);
                    }}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2 text-xs flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Save size={14} /> Save Mailbox Routing
                  </button>
                </div>

                {/* Sender Accounts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Account 1: Deliverables */}
                  <div className="bg-[#FFF9E8] border-2 border-primary/40 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="hex-pill-sm bg-[#111111] text-primary text-[10px] font-black px-2.5 py-0.5 uppercase">
                        Template Deliverables
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-[#111111]">
                        Design & Production Studio
                      </h4>
                      <p className="text-[11px] text-[#726F6D] mt-0.5">
                        Dispatches master .pptx template files and commercial licenses to paying clients.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                        Zoho Sender Mailbox:
                      </label>
                      <input
                        type="email"
                        value={zohoDeliverableEmail}
                        onChange={(e) => setZohoDeliverableEmail(e.target.value.trim())}
                        className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-2 text-xs font-mono font-bold text-[#111111] outline-none"
                      />
                    </div>
                    <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                      <span>Anti-Bot Shield: Direct email delivery only</span>
                    </div>
                  </div>

                  {/* Account 2: Inquiries & Welcome */}
                  <div className="bg-[#FFF9E8] border border-primary/20 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="hex-pill-sm bg-primary/20 text-[#111111] text-[10px] font-black px-2.5 py-0.5 uppercase">
                        General Inquiries
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-[#111111]">
                        Client Relations & Desk
                      </h4>
                      <p className="text-[11px] text-[#726F6D] mt-0.5">
                        Sends new account welcome emails, waitlist confirmations, and contact form replies.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                        Zoho Sender Mailbox:
                      </label>
                      <input
                        type="email"
                        value={zohoInquiriesEmail}
                        onChange={(e) => setZohoInquiriesEmail(e.target.value.trim())}
                        className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-2 text-xs font-mono font-bold text-[#111111] outline-none"
                      />
                    </div>
                    <div className="text-[10px] text-[#726F6D] font-medium bg-white px-2.5 py-1.5 rounded-lg border border-[#111111]/8">
                      Default Reply-To: <code className="font-mono text-[9px] text-[#111111]">hello@theslidebee.com</code>
                    </div>
                  </div>

                  {/* Account 3: Billing & Receipts */}
                  <div className="bg-[#FFF9E8] border border-primary/20 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="hex-pill-sm bg-primary/20 text-[#111111] text-[10px] font-black px-2.5 py-0.5 uppercase">
                        Finance & Receipts
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-[#111111]">
                        Billing & Accounts
                      </h4>
                      <p className="text-[11px] text-[#726F6D] mt-0.5">
                        Handles subscription receipts, Razorpay payment confirmations, and invoices.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                        Zoho Sender Mailbox:
                      </label>
                      <input
                        type="email"
                        value={zohoBillingEmail}
                        onChange={(e) => setZohoBillingEmail(e.target.value.trim())}
                        className="w-full bg-white border border-[#111111]/12 hex-pill px-3 py-2 text-xs font-mono font-bold text-[#111111] outline-none"
                      />
                    </div>
                    <div className="text-[10px] text-[#726F6D] font-medium bg-white px-2.5 py-1.5 rounded-lg border border-[#111111]/8">
                      Default Reply-To: <code className="font-mono text-[9px] text-[#111111]">billing@theslidebee.com</code>
                    </div>
                  </div>
                </div>

                {/* Live Diagnostic Test Dispatcher */}
                <div className="border border-primary/30 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={14} className="text-primary-amber" /> Send Real Live Test Dispatch via Zoho
                      </h4>
                      <p className="text-[11px] text-[#726F6D]">
                        Test the Cloudflare Pages edge function and Zoho Mail router in real time.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                        Choose Sender Mailbox:
                      </label>
                      <select
                        value={testEmailSenderType}
                        onChange={(e) => setTestEmailSenderType(e.target.value as any)}
                        className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-2 text-xs font-bold text-[#111111] outline-none cursor-pointer"
                      >
                        <option value="design">design@theslidebee.com (Deliverables)</option>
                        <option value="hello">hello@theslidebee.com (General / Welcome)</option>
                        <option value="billing">billing@theslidebee.com (Billing)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-bold text-[#726F6D] block mb-1">
                        Recipient Test Email Address:
                      </label>
                      <input
                        type="email"
                        placeholder="your-personal-email@gmail.com"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-2 text-xs font-medium text-[#111111] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        disabled={isSendingTestEmail || !testEmailRecipient}
                        onClick={handleSendTestEmail}
                        className="hex-pill w-full bg-[#111111] hover:bg-black text-white hover:text-primary font-black py-2 text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <Send size={13} className="text-primary" />
                        {isSendingTestEmail ? "Dispatching..." : "Send Test Email"}
                      </button>
                    </div>
                  </div>

                  {testEmailStatus && (
                    <div className={`p-3 rounded-xl text-xs font-bold ${
                      testEmailStatus.toLowerCase().includes("success") 
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border border-amber-200 text-amber-800"
                    }`}>
                      {testEmailStatus}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CLOUDFLARE R2 10 GB STORAGE MONITOR */}
        {activeTab === "storage" && (
          <div className="space-y-8">
            <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#111111]/8 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary-amber">
                    <HardDrive size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-extrabold text-[#111111]">
                      Cloudflare R2 Object Storage
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Free Tier Quota: <strong>10.00 GB Available</strong> • $0.00 Egress Bandwidth Fees
                    </p>
                  </div>
                </div>

                <div className="hex-pill bg-[#FFF9E8] border border-primary/30 px-4 py-2 text-xs font-extrabold text-[#111111]">
                  Status: Connected & Active
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                  <span className="text-[#111111]">{actualUsedMB} MB Used</span>
                  <span className="text-primary-amber">{remainingGB} GB Remaining ({100 - Number(percentUsed)}% Free)</span>
                </div>
                <div className="w-full bg-[#FFF9E8] rounded-full h-4 overflow-hidden border border-[#111111]/10 p-0.5">
                  <div 
                    className="bg-primary-amber h-full rounded-full transition-all" 
                    style={{ width: `${Math.max(1, Number(percentUsed))}%` }} 
                  />
                </div>
              </div>

              {/* Storage Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
                    PowerPoint Decks (.pptx)
                  </span>
                  <div className="text-xl font-heading font-black text-[#111111]">
                    {storageStats.pptxMB} MB
                  </div>
                  <span className="text-[10px] text-[#726F6D] font-medium">
                    {storageStats.pptxCount} Master PowerPoint (.pptx) Decks
                  </span>
                </div>

                <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Slide Previews (.jpg/.png)
                  </span>
                  <div className="text-xl font-heading font-black text-[#111111]">
                    {storageStats.imagesMB} MB
                  </div>
                  <span className="text-[10px] text-[#726F6D] font-medium">
                    {storageStats.imagesCount} portfolio & interior slide previews
                  </span>
                </div>

                <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Monthly Egress Bandwidth
                  </span>
                  <div className="text-xl font-heading font-black text-green-700">
                    $0.00 / FREE
                  </div>
                  <span className="text-[10px] text-green-800 font-medium">
                    Zero bandwidth fees on Cloudflare CDN
                  </span>
                </div>
              </div>

              {/* Zero-Billing Safety & Hard Caps Banner */}
              <div className="mt-6 bg-[#111111] text-white p-5 rounded-2xl border border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-sm text-white">Strict Zero-Cost Billing Policy</span>
                      <span className="hex-pill-sm bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">
                        Active & Enforced
                      </span>
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">
                      Hard storage ceiling at 10.00 GB (9.90 GB cutoff). Over-quota uploads automatically blocked to guarantee $0.00 zero billing.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span className="hex-pill-sm bg-white/10 text-white/90 border border-white/10 px-2.5 py-1">
                    Storage Cap: 10.00 GB
                  </span>
                  <span className="hex-pill-sm bg-white/10 text-white/90 border border-white/10 px-2.5 py-1">
                    Max PPTX: 50 MB
                  </span>
                  <span className="hex-pill-sm bg-white/10 text-white/90 border border-white/10 px-2.5 py-1">
                    Max Image: 10 MB
                  </span>
                  <span className="hex-pill-sm bg-green-500/20 text-green-300 border border-green-500/30 px-2.5 py-1">
                    Supabase Storage: 0 MB (Purged)
                  </span>
                </div>
              </div>

            </div>

            {/* SECTION 1: TEMPLATES TABLE DATABASE AUDIT */}
            <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#111111]/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary-amber" />
                    <span>Storefront Templates & Master PPTX Inventory (Database Audit)</span>
                  </h3>
                  <p className="text-xs text-[#726F6D]">
                    Cross-referenced with live Supabase database. All presentation deliverables & previews are hosted on Cloudflare R2 CDN.
                  </p>
                </div>
                <div className="hex-pill bg-[#FFF9E8] border border-primary/20 text-[#111111] px-3.5 py-1.5 text-xs font-bold">
                  {templates.length} Storefront Templates Registered
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFF9E8] text-[#726F6D] font-extrabold text-[10px] uppercase tracking-wider border-b border-[#111111]/8">
                    <tr>
                      <th className="px-5 py-3">Template / SKU</th>
                      <th className="px-5 py-3">Master PPTX Deliverable</th>
                      <th className="px-5 py-3">Slide Previews</th>
                      <th className="px-5 py-3">Pricing & Credits</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111111]/5">
                    {templates.map((tpl) => {
                      const pptxUrl = tpl.download_url || "";
                      const slides = Array.isArray(tpl.slides) ? tpl.slides : [tpl.thumbnail_url || tpl.image_url];
                      const fileName = tpl.file_name || (pptxUrl.split("/").pop() || "presentation.pptx");
                      const fileSize = tpl.file_size || "4.5 MB";

                      return (
                        <tr key={tpl.id} className="hover:bg-black/[0.01] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-[#111111]/10">
                                <img
                                  src={tpl.thumbnail_url || tpl.image_url || "/portfolio/case_study_a_1.png"}
                                  alt={tpl.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-extrabold text-[#111111] text-xs flex items-center gap-2">
                                  <span>{tpl.title}</span>
                                  <span className="hex-pill-sm bg-black/5 text-[#726F6D] text-[9px] font-mono px-1.5 py-0.5">
                                    {tpl.code || "SLD"}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#726F6D]">{tpl.category || "General"}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                                <FileText size={13} className="text-primary-amber shrink-0" />
                                <span className="truncate max-w-[180px]">{fileName}</span>
                                <span className="hex-pill-sm bg-primary/20 text-[#111111] text-[9px] font-bold px-1.5 py-0.5">
                                  {fileSize}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#726F6D] font-mono block truncate max-w-[220px]">
                                {pptxUrl.replace("https://", "")}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[#111111]">
                                {tpl.slide_count || tpl.slides_count || slides.length} Slides
                              </span>
                              <div className="flex -space-x-1.5 overflow-hidden py-1">
                                {slides.slice(0, 3).map((s: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={s}
                                    alt={`Slide ${idx + 1}`}
                                    className="w-5 h-5 rounded-full object-cover border border-white shadow-xs"
                                  />
                                ))}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[11px] font-extrabold text-[#111111]">
                              ₹{tpl.price_inr} / ${tpl.price_usd}
                            </div>
                            <span className="text-[10px] text-[#726F6D]">
                              {tpl.is_credit_eligible ? "Eligible for 5 Credits" : "Standard Direct Purchase"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {pptxUrl && (
                                <a
                                  href={pptxUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black text-[10px] px-2.5 py-1.5 flex items-center gap-1 shadow-xs transition-all"
                                  title="Test download from Cloudflare R2"
                                >
                                  <Download size={11} /> Test PPTX
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditTemplateModal(tpl)}
                                className="hex-pill-sm bg-black/5 hover:bg-black/10 text-[#111111] font-bold text-[10px] px-2.5 py-1.5 flex items-center gap-1"
                              >
                                <Edit3 size={11} /> Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: LIVE CLOUDFLARE R2 BUCKET EXPLORER */}
            <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#111111]/8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111] flex items-center gap-2">
                      <HardDrive size={18} className="text-primary-amber" />
                      <span>Live Cloudflare R2 Bucket Explorer (slidebee)</span>
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Public Edge CDN: <code className="bg-black/5 px-1 py-0.5 rounded text-[11px] font-mono">{R2_PUBLIC_BASE_URL}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-48 sm:w-64">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#726F6D]" />
                      <input
                        type="text"
                        placeholder="Search R2 files..."
                        value={storageSearchTerm}
                        onChange={(e) => setStorageSearchTerm(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const data = await fetchR2Telemetry();
                        if (data?.success) {
                          setStorageStats((prev) => ({
                            ...prev,
                            ...data,
                            objects: data.objects || [],
                          }));
                        }
                      }}
                      className="hex-pill-sm bg-black/5 hover:bg-black/10 text-[#111111] font-bold text-xs p-2"
                      title="Refresh telemetry from Cloudflare R2"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                {/* Folder Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#111111]/6">
                  <span className="text-[10px] font-extrabold text-[#726F6D] uppercase tracking-wider mr-1">
                    Folder:
                  </span>
                  {[
                    { id: "all", label: "All Objects", count: (storageStats.objects || []).length },
                    { id: "templates/decks", label: "templates/decks/", count: (storageStats.objects || []).filter(o => o.key.startsWith("templates/decks/")).length },
                    { id: "templates/slides", label: "templates/slides/", count: (storageStats.objects || []).filter(o => o.key.startsWith("templates/slides/")).length },
                    { id: "marquee", label: "marquee/", count: (storageStats.objects || []).filter(o => o.key.startsWith("marquee/")).length },
                    { id: "bulk-ingest", label: "bulk-ingest/", count: (storageStats.objects || []).filter(o => o.key.startsWith("bulk-ingest/")).length },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStorageFolderFilter(f.id)}
                      className={`hex-pill-sm text-[11px] font-bold px-3 py-1 transition-all ${
                        storageFolderFilter === f.id
                          ? "bg-primary text-[#111111] shadow-xs"
                          : "bg-black/5 hover:bg-black/10 text-[#726F6D]"
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              </div>

              {storageStats.objects && storageStats.objects.length > 0 ? (
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF9E8] text-[#726F6D] font-extrabold text-[10px] uppercase tracking-wider border-b border-[#111111]/8 sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-3">Object Key / File Name</th>
                        <th className="px-5 py-3">Storage Class</th>
                        <th className="px-5 py-3">Size</th>
                        <th className="px-5 py-3">Last Modified</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111111]/5">
                      {storageStats.objects
                        .filter((o) => {
                          const matchesSearch = !storageSearchTerm || o.key.toLowerCase().includes(storageSearchTerm.toLowerCase());
                          const matchesFolder = storageFolderFilter === "all" || o.key.startsWith(`${storageFolderFilter}/`);
                          return matchesSearch && matchesFolder;
                        })
                        .map((obj) => {
                          const folder = obj.key.includes("/") ? obj.key.split("/").slice(0, -1).join("/") : "root";
                          const isPpt = obj.key.endsWith(".pptx") || obj.key.endsWith(".ppt");
                          const isImg = obj.key.match(/\.(jpg|jpeg|png|webp|svg)$/i);

                          return (
                            <tr key={obj.key} className="hover:bg-black/[0.01] transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  {isPpt ? (
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-bold text-[9px]">
                                      PPT
                                    </div>
                                  ) : isImg ? (
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-center shrink-0">
                                      <ImageIcon size={13} />
                                    </div>
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center shrink-0">
                                      <FileText size={13} />
                                    </div>
                                  )}

                                  <div>
                                    <div className="font-bold text-[#111111] text-xs font-mono break-all">
                                      {obj.key}
                                    </div>
                                    <span className="hex-pill-sm bg-black/5 text-[#726F6D] text-[9px] font-mono px-1.5 py-0.5">
                                      folder: {folder}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className="hex-pill-sm bg-green-50 text-green-800 border border-green-200 text-[10px] font-bold px-2 py-0.5">
                                  Standard R2
                                </span>
                              </td>

                              <td className="px-5 py-3.5 font-bold text-[#111111]">
                                {obj.sizeMB} MB
                                <span className="text-[10px] text-[#726F6D] font-normal block">
                                  {(obj.size / 1024).toFixed(0)} KB
                                </span>
                              </td>

                              <td className="px-5 py-3.5 text-[#726F6D] text-[11px]">
                                {obj.uploaded ? new Date(obj.uploaded).toLocaleDateString() : "Active"}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(obj.publicUrl);
                                      setCopiedUrlKey(obj.key);
                                      setTimeout(() => setCopiedUrlKey(null), 2000);
                                    }}
                                    className="hex-pill-sm bg-black/5 hover:bg-black/10 text-[#111111] font-bold text-[10px] px-2.5 py-1.5 flex items-center gap-1"
                                    title="Copy Cloudflare R2 Public CDN URL"
                                  >
                                    {copiedUrlKey === obj.key ? (
                                      <>
                                        <Check size={11} className="text-green-700" /> Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={11} /> Copy URL
                                      </>
                                    )}
                                  </button>

                                  <a
                                    href={obj.publicUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black text-[10px] px-2.5 py-1.5 flex items-center gap-1 shadow-xs"
                                  >
                                    <ExternalLink size={11} /> Open
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteR2Object(obj.key)}
                                    className="hex-pill-sm bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[10px] p-1.5"
                                    title="Delete from R2"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-[#726F6D]">
                  <HardDrive size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-extrabold text-xs text-[#111111]">Loading live objects from Cloudflare R2...</p>
                  <p className="text-[11px] mt-1">Bucket: slidebee • Region: APAC • 10.00 GB Free Storage</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: SUBSCRIPTIONS & CLIENT PROFILES */}
        {activeTab === "subscriptions" && (
          <div className="space-y-8">
            
            {/* Top Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="hex-card bg-white border border-[#111111]/8 p-5 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
                  Monthly Recurring Revenue (MRR)
                </span>
                <div className="text-3xl font-heading font-black text-primary-amber">
                  ${subscriptions.reduce((acc, s) => acc + (Number(s.amount_usd) || 1490), 0).toLocaleString()}
                </div>
                <span className="text-[11px] text-[#726F6D] font-medium mt-0.5 block">
                  From {subscriptions.filter(s => s.status === 'active').length} active enterprise retainers
                </span>
              </div>

              <div className="hex-card bg-white border border-[#111111]/8 p-5 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
                  Total Client Accounts
                </span>
                <div className="text-3xl font-heading font-black text-[#111111]">
                  {profiles.length}
                </div>
                <span className="text-[11px] text-[#726F6D] font-medium mt-0.5 block">
                  Registered founders & brand executives
                </span>
              </div>

              <div className="hex-card bg-white border border-[#111111]/8 p-5 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
                  Slide Capacity Used This Month
                </span>
                <div className="text-3xl font-heading font-black text-[#111111]">
                  {subscriptions.reduce((acc, s) => acc + (s.slides_used || 0), 0)} / {subscriptions.reduce((acc, s) => acc + (s.slides_limit || 80), 0)}
                </div>
                <span className="text-[11px] text-[#726F6D] font-medium mt-0.5 block">
                  Across all active designer retainers
                </span>
              </div>
            </div>

            {/* 1. Subscriptions Table */}
            <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-md">
              <div className="p-6 border-b border-[#111111]/8 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-extrabold text-[#111111]">
                    Active Monthly Retainer Subscriptions
                  </h3>
                  <p className="text-xs text-[#726F6D]">
                    Real-time monitoring of client slide quotas, billing tiers, and renewals
                  </p>
                </div>
              </div>

              {subscriptions.length === 0 ? (
                <div className="p-10 text-center text-[#726F6D]">
                  <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
                  <h4 className="font-heading font-extrabold text-sm text-[#111111]">No Active Subscriptions</h4>
                  <p className="text-xs font-medium mt-1">Client retainers will be tracked here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] font-extrabold uppercase tracking-wider">
                        <th className="p-4">Subscriber</th>
                        <th className="p-4">Plan Name</th>
                        <th className="p-4">Rate / Month</th>
                        <th className="p-4">Monthly Slide Quota</th>
                        <th className="p-4">Renewal Cycle</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#111111]/6 font-medium text-[#111111]">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-primary/5 transition-colors">
                          <td className="p-4">
                            <div className="font-extrabold text-[#111111]">{sub.user_email}</div>
                          </td>
                          <td className="p-4 font-bold text-[#111111]">
                            {sub.plan_name}
                          </td>
                          <td className="p-4 font-black text-primary-amber">
                            ${sub.amount_usd} / ₹{sub.amount_inr?.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="font-bold mb-1">
                              {sub.slides_used || 0} / {sub.slides_limit || 80} Slides
                            </div>
                            <div className="w-32 bg-[#FFF9E8] rounded-full h-1.5 overflow-hidden border border-[#111111]/10">
                              <div 
                                className="bg-primary-amber h-full rounded-full" 
                                style={{ width: `${((sub.slides_used || 0) / (sub.slides_limit || 80)) * 100}%` }} 
                              />
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap text-[#726F6D]">
                            {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "Every 30 Days"}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="hex-pill-sm bg-green-100 text-green-800 text-[10px] font-black px-2.5 py-0.5">
                              ● {sub.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. Registered Client Accounts Table */}
            <div className="hex-card-lg bg-white border border-[#111111]/10 overflow-hidden shadow-md">
              <div className="p-6 border-b border-[#111111]/8">
                <h3 className="text-base font-heading font-extrabold text-[#111111]">
                  Registered Client Profiles ({profiles.length})
                </h3>
                <p className="text-xs text-[#726F6D]">
                  All clients who registered an account or submitted a presentation brief
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FFF9E8] border-b border-[#111111]/10 text-[#726F6D] font-extrabold uppercase tracking-wider">
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Work Email</th>
                      <th className="p-4">Company / Organization</th>
                      <th className="p-4">Account Role</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4">Last Active / Sign In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111111]/6 font-medium text-[#111111]">
                    {profiles.map((p) => (
                      <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                        <td className="p-4 font-extrabold text-[#111111]">
                          {p.full_name || "N/A"}
                        </td>
                        <td className="p-4 font-bold text-[#111111]">
                          {p.email}
                        </td>
                        <td className="p-4 text-[#726F6D]">
                          {p.company || "Enterprise Client"}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="hex-pill-sm bg-[#FFF9E8] text-primary-amber font-extrabold text-[10px] px-2.5 py-0.5">
                            {p.role || "Client"}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap text-[#726F6D]">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {p.last_sign_in_at ? (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              {new Date(p.last_sign_in_at).toLocaleDateString()} {new Date(p.last_sign_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-[#726F6D] text-[11px]">Recent</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: BULK SPREADSHEET TEMPLATES IMPORT */}
      <AnimatePresence>
        {isBulkImportOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#111111]/10 mb-4 gap-3">
                <div>
                  <h3 className="text-xl font-heading font-extrabold text-[#111111] flex items-center gap-2">
                    <UploadCloud className="text-primary-amber" size={22} /> Bulk Import Presentation Templates
                  </h3>
                  <p className="text-xs text-[#726F6D]">
                    Upload a CSV spreadsheet with Master PowerPoint (.pptx) deliverables and multi-slide preview images
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSampleCSV}
                    className="hex-pill bg-[#FFF9E8] hover:bg-[#111111] hover:text-[#FCBF14] border border-[#111111]/10 px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={13} /> Download Sample CSV
                  </button>
                </div>
              </div>

              {/* Sub-Tab Switcher inside Modal */}
              <div className="flex items-center gap-2 mb-5 border-b border-[#111111]/8 pb-2">
                <button
                  type="button"
                  onClick={() => setBulkModalTab("csv")}
                  className={`hex-pill px-4 py-1.5 text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    bulkModalTab === "csv"
                      ? "bg-[#111111] text-primary shadow"
                      : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  <FileText size={13} /> 1. Spreadsheet CSV ({parsedBulkTemplates.length} Ready)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkModalTab("assets")}
                  className={`hex-pill px-4 py-1.5 text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    bulkModalTab === "assets"
                      ? "bg-[#111111] text-primary shadow"
                      : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111]"
                  }`}
                >
                  <ImageIcon size={13} /> 2. Slide Previews & PPT Uploader ({bulkUploadedAssets.length})
                </button>
              </div>

              {/* TAB 1: CSV IMPORT & PASTE */}
              {bulkModalTab === "csv" && (
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                        Upload .CSV / Spreadsheet File
                      </label>
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none cursor-pointer"
                      />
                      <span className="text-[10px] text-[#726F6D] mt-1 block">
                        Supports standard CSV from Microsoft Excel, Google Sheets, or Numbers.
                      </span>
                    </div>

                    <div className="bg-[#FFF9E8] border border-primary/30 p-3.5 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#111111]">Supported CSV Columns:</span>
                        <span className="text-[10px] font-bold text-primary-amber bg-[#111111] px-2 py-0.5 rounded">20+ Slides Supported</span>
                      </div>
                      <p className="text-[11px] text-[#726F6D] leading-relaxed">
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">code</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">title</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">category</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">price_inr</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">price_usd</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">slide_count</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">thumbnail_url</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">slides_preview_urls</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">download_url</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">is_credit_eligible</code>,{" "}
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">formats</code>
                      </p>
                      <div className="text-[10px] text-[#111111] font-medium bg-white p-2 rounded border border-[#111111]/10">
                        <strong>Multi-Slide Previews:</strong> To provide 20+ slide previews in your spreadsheet, separate each slide URL with a semicolon (<code>;</code>) in the <code>slides_preview_urls</code> column (e.g. <code>url1; url2; url3; ... url20</code>).
                      </div>
                    </div>
                  </div>

                  {/* Asset Ingestion / Mirroring Option */}
                  <div className="bg-[#FFF9E8] border border-primary/40 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-black text-[#111111] flex items-center gap-1.5">
                        <Sparkles size={14} className="text-primary-amber" /> Ingest & Mirror External Image URLs to Supabase CDN
                      </span>
                      <p className="text-[10px] text-[#726F6D] mt-0.5">
                        Automatically downloads images from external URLs in your spreadsheet and uploads them to our high-speed Supabase Storage bucket so you own the assets and slide previews never break.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShouldMirrorAssets(!shouldMirrorAssets)}
                      className={`hex-pill px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shrink-0 ${
                        shouldMirrorAssets
                          ? "bg-[#111111] text-[#FCBF14] border border-[#111111]"
                          : "bg-white text-[#726F6D] border border-[#111111]/20"
                      }`}
                    >
                      {shouldMirrorAssets ? "Mirror to CDN: ON" : "Keep Raw URLs: OFF"}
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                      Or Paste CSV Text Directly
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`"code","title","category","price_inr","price_usd","slide_count","thumbnail_url","slides_preview_urls","download_url","is_credit_eligible","description"`}
                      value={csvRawText}
                      onChange={(e) => handleParseCSV(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-card p-3 text-xs text-[#111111] font-mono outline-none focus:border-primary resize-none"
                    />
                  </div>

                  {/* Parsed Preview Table */}
                  {parsedBulkTemplates.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Ready to Publish ({parsedBulkTemplates.length} Templates Verified)
                        </span>
                      </div>

                      <div className="max-h-56 overflow-y-auto border border-[#111111]/10 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-[#FFF9E8] text-[#726F6D] font-extrabold border-b border-[#111111]/10">
                            <tr>
                              <th className="p-2.5">Cover</th>
                              <th className="p-2.5">SKU / Title</th>
                              <th className="p-2.5">Category</th>
                              <th className="p-2.5">Price</th>
                              <th className="p-2.5">Slide Previews</th>
                              <th className="p-2.5">Deliverable</th>
                              <th className="p-2.5">Free Tag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#111111]/8 font-medium">
                            {parsedBulkTemplates.map((t, idx) => (
                              <tr key={idx} className="hover:bg-primary/5">
                                <td className="p-2">
                                  <img
                                    src={t.thumbnail_url}
                                    alt={t.title}
                                    className="w-12 h-7 object-cover rounded border border-[#111111]/10 bg-gray-100"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                </td>
                                <td className="p-2.5">
                                  <span className="font-mono text-[10px] text-primary-amber font-extrabold block">
                                    {t.code}
                                  </span>
                                  <span className="font-bold text-[#111111]">{t.title}</span>
                                </td>
                                <td className="p-2.5">
                                  <span className="hex-pill-sm bg-[#FFF9E8] px-2 py-0.5 text-[10px] font-bold">
                                    {t.category}
                                  </span>
                                </td>
                                <td className="p-2.5 font-bold whitespace-nowrap">
                                  ₹{t.price_inr} / ${t.price_usd}
                                </td>
                                <td className="p-2.5 whitespace-nowrap">
                                  <span className="text-[11px] font-bold text-[#111111] bg-gray-100 px-2 py-0.5 rounded">
                                    {t.slides?.length || 1} Previews
                                  </span>
                                </td>
                                <td className="p-2.5 whitespace-nowrap">
                                  {t.download_url ? (
                                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      Attached (.pptx)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#726F6D]">URL link</span>
                                  )}
                                </td>
                                <td className="p-2.5 whitespace-nowrap">
                                  {t.is_credit_eligible ? (
                                    <span className="text-[10px] font-black text-[#111111] bg-primary px-2 py-0.5 rounded shadow-xs">
                                      Eligible (Free Tag)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#726F6D] bg-gray-100 px-2 py-0.5 rounded">
                                      Standard
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SLIDE PREVIEWS & PPT ASSET UPLOADER */}
              {bulkModalTab === "assets" && (
                <div className="space-y-4 mb-6">
                  <div className="bg-[#FFF9E8] border border-[#111111]/12 p-4 rounded-2xl">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                      Batch Upload Slide Preview Images & Master PPT Deliverables
                    </h4>
                    <p className="text-xs text-[#726F6D] mb-3">
                      Select multiple slide PNG/JPG images or PPTX deliverables from your computer. Once uploaded, you can copy the URLs directly into your spreadsheet or auto-generate a template row!
                    </p>

                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.webp,.pptx,.key,.pdf,.zip"
                      onChange={handleBulkAssetUpload}
                      className="w-full bg-white border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none cursor-pointer"
                    />

                    {isUploadingBulkAssets && (
                      <div className="text-xs font-bold text-primary-amber flex items-center gap-2 mt-2">
                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Processing and generating assets...
                      </div>
                    )}
                  </div>

                  {bulkUploadedAssets.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#111111]">
                          Uploaded Assets ({bulkUploadedAssets.length})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyAllAssetUrls}
                            className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black px-3 py-1.5 text-xs flex items-center gap-1 shadow-sm"
                          >
                            <Copy size={12} />
                            {copiedAssetUrlsSuccess ? "URLs Copied to Clipboard!" : "Copy All Image URLs (for CSV)"}
                          </button>
                          <button
                            type="button"
                            onClick={handleAddRowFromUploadedAssets}
                            className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-black px-3 py-1.5 text-xs flex items-center gap-1 shadow-sm"
                          >
                            <Plus size={12} /> Auto-Add Row to CSV
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                        {bulkUploadedAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-[#FFF9E8] border border-[#111111]/10 rounded-xl p-2.5 flex flex-col justify-between text-left space-y-1.5"
                          >
                            {asset.type === "image" ? (
                              <img
                                src={asset.url}
                                alt={asset.name}
                                className="w-full h-20 object-cover rounded-lg border border-[#111111]/8 bg-white"
                              />
                            ) : (
                              <div className="w-full h-20 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
                                <FileText size={28} className="text-[#111111]" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <span className="text-[11px] font-bold text-[#111111] block truncate">
                                {asset.name}
                              </span>
                              <span className="text-[10px] text-[#726F6D]">
                                {asset.type === "ppt" ? "Presentation (.pptx)" : "Slide Preview"} • {asset.size}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(asset.url);
                                alert(`Copied URL for ${asset.name}!`);
                              }}
                              className="hex-pill-sm bg-white border border-[#111111]/10 text-[10px] font-bold py-1 text-center hover:bg-primary"
                            >
                              Copy URL
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {ingestStatus && (
                <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mb-4">
                  <RefreshCw size={14} className="animate-spin text-blue-700 shrink-0" />
                  <span>{ingestStatus}</span>
                </div>
              )}

              {bulkImportSuccessCount !== null && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} /> Successfully imported {bulkImportSuccessCount} templates into store!
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#111111]/10">
                <button
                  type="button"
                  onClick={() => setIsBulkImportOpen(false)}
                  className="hex-pill px-4 py-2.5 text-xs font-extrabold text-[#726F6D] hover:bg-black/5"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={parsedBulkTemplates.length === 0 || isImportingBulk}
                  onClick={handleExecuteBulkImport}
                  className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50 shadow-md"
                >
                  <UploadCloud size={15} />
                  {isImportingBulk ? "Importing to Database..." : `Import ${parsedBulkTemplates.length} Templates to Store`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD SINGLE TEMPLATE WITH AUTOMATED SLIDE CONVERSION */}
      <AnimatePresence>
        {isAddTemplateOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#111111]/10 mb-4">
                <div>
                  <h3 className="text-xl font-heading font-extrabold text-[#111111]">
                    Add New Presentation Template
                  </h3>
                  <p className="text-xs text-[#726F6D]">
                    Upload a local PPTX/PDF file for automated slide-to-JPEG conversion, or create manually.
                  </p>
                </div>
                <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-3 py-1">
                  SKU: {newCode}
                </span>
              </div>

              {/* SECTION 1: PRESENTATION DELIVERABLE FILE (.pptx / Cloud Link) */}
              <div className="bg-[#FFF9E8] border border-primary/30 rounded-2xl p-4 sm:p-5 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#111111] text-primary flex items-center justify-center">
                      <FileText size={15} />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">
                        1. Presentation Deliverable File (.pptx / Download Link)
                      </h4>
                      <p className="text-[10px] text-[#726F6D]">
                        The Master PowerPoint (.pptx) file buyers receive upon checkout or instant download
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Upload from local computer */}
                  <div className="bg-white p-3 rounded-xl border border-[#111111]/10 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">
                      Option A: Upload Source File (.pptx)
                    </span>
                    <label className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3.5 py-2 text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm w-full justify-center transition-transform hover:scale-[1.01]">
                      <HardDrive size={13} className="text-primary-amber" />
                      <span>{isUploadingPpt ? "Attaching File..." : "Choose Master PowerPoint (.pptx)"}</span>
                      <input
                        type="file"
                        accept=".pptx,.ppt"
                        disabled={isUploadingPpt}
                        onChange={handlePptFileUpload}
                        className="hidden"
                      />
                    </label>

                    {newPptFilename && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-lg text-[11px] font-bold flex items-center justify-between">
                        <div className="truncate flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{newPptFilename} ({newPptSize})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPptUrl("");
                            setNewPptFilename("");
                            setNewPptSize("");
                          }}
                          className="text-red-500 hover:text-red-700 ml-2 text-[10px] underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: TEMPLATE PREVIEWS & SLIDE DECK GALLERY */}
              <div className="bg-white border border-[#111111]/10 rounded-2xl p-4 sm:p-5 mb-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary text-[#111111] flex items-center justify-center font-bold">
                      <ImageIcon size={15} />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">
                        2. Template Previews & Slide Deck Gallery
                      </h4>
                      <p className="text-[10px] text-[#726F6D]">
                        Upload local image files from your computer (Cover thumbnail and interior slides)
                      </p>
                    </div>
                  </div>
                  {newSlides.length > 0 && (
                    <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-2.5 py-0.5">
                      {newSlides.length} Slide Previews
                    </span>
                  )}
                </div>

                {/* Primary Cover Thumbnail */}
                <div className="bg-[#FFF9E8] p-3 rounded-xl border border-[#111111]/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold text-[#111111]">
                      Primary Cover / Thumbnail Image *
                    </label>
                    <label className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-2.5 py-1 text-[10px] inline-flex items-center gap-1 cursor-pointer shadow-sm">
                      <UploadCloud size={11} className="text-primary-amber" /> Choose Local Cover Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                          setNewThumbnail(dataUrl);
                          if (newSlides.length === 0) {
                            setNewSlides([dataUrl]);
                            setNewSlideCount(1);
                          } else {
                            const updated = [...newSlides];
                            updated[0] = dataUrl;
                            setNewSlides(updated);
                          }
                        })}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 bg-[#111111] rounded-lg overflow-hidden shrink-0 border border-primary/30">
                      <img src={newThumbnail} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-[#726F6D] font-medium">
                      Cover image selected. Appears as primary storefront display card.
                    </span>
                  </div>
                </div>

                {/* Multi-Slide Interior Previews Gallery */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-[#111111] flex items-center gap-1.5">
                      <Layers size={13} className="text-primary-amber" /> Interior Slide Images ({newSlides.length} Slides)
                    </span>
                    <label className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <UploadCloud size={12} />
                      <span>Upload Local Slides (Multi-Select)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleSlideImagesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Visual Slide Thumbnails Strip */}
                  {newSlides.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 border border-[#111111]/10 rounded-xl bg-[#FFF9E8]/50">
                      {newSlides.map((s, idx) => (
                        <div
                          key={idx}
                          className="hex-card overflow-hidden bg-white border border-[#111111]/10 text-left p-1.5 shadow-sm relative group"
                        >
                          <div className="aspect-[16/10] bg-[#111111] rounded overflow-hidden mb-1">
                            <img src={s} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[9px] font-black text-[#111111]">
                              {idx === 0 ? "Cover" : `Slide #${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...newSlides];
                                    const [moved] = next.splice(idx, 1);
                                    next.unshift(moved);
                                    setNewSlides(next);
                                    setNewThumbnail(moved);
                                  }}
                                  className="text-[8px] text-primary-amber font-extrabold hover:underline"
                                  title="Make Cover"
                                >
                                  Top
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const next = newSlides.filter((_, i) => i !== idx);
                                  setNewSlides(next);
                                  setNewSlideCount(next.length || 1);
                                  if (idx === 0 && next.length > 0) {
                                    setNewThumbnail(next[0]);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Remove"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: SOFTWARE COMPATIBILITY TAGS (OPTIONAL) */}
              <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/10 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <LayoutTemplate size={13} className="text-primary-amber" />
                    <span>3. Software Compatibility Tags</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#726F6D]">
                    {newFormats.length === 0 ? "0 Formats Selected (Optional)" : `${newFormats.length} Format${newFormats.length > 1 ? "s" : ""} Selected`}
                  </span>
                </div>
                <p className="text-[10px] text-[#726F6D]">
                  Select presentation software supported by this template. Click any format pill to toggle on or off.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_FORMAT_TAGS.map((fmt) => {
                    const isSelected = newFormats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewFormats(newFormats.filter(f => f !== fmt));
                          } else {
                            setNewFormats([...newFormats, fmt]);
                          }
                        }}
                        className={`hex-pill-sm px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isSelected
                            ? "bg-[#111111] text-[#FCBF14] border border-[#111111]"
                            : "bg-white text-[#111111] border border-[#111111]/15 hover:border-primary"
                        }`}
                      >
                        {isSelected ? <Check size={12} className="text-[#FCBF14]" /> : <Plus size={12} className="text-[#726F6D]" />}
                        <span>{fmt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: TEMPLATE METADATA FORM */}
              <form onSubmit={handleCreateTemplate} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Template Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Series A Pitch Deck Pro"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Template Code (SKU) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SLD-201"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-black uppercase outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Pitch Decks">Pitch Decks</option>
                      <option value="Business">Business</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Infographics">Infographics</option>
                      <option value="Timelines">Timelines</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Total Slides Count
                    </label>
                    <input
                      type="number"
                      value={newSlideCount}
                      onChange={(e) => setNewSlideCount(Number(e.target.value))}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Price INR (₹)
                    </label>
                    <input
                      type="number"
                      value={newPriceINR}
                      onChange={(e) => setNewPriceINR(Number(e.target.value))}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Price USD ($)
                    </label>
                    <input
                      type="number"
                      value={newPriceUSD}
                      onChange={(e) => setNewPriceUSD(Number(e.target.value))}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Description & Features
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Short summary of the template features and layout styles..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-card p-3 text-xs text-[#111111] font-medium outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Prominent Free Template Tag Toggle */}
                <div className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  newIsCreditEligible 
                    ? "bg-primary/20 border-primary shadow-sm" 
                    : "bg-[#FFF9E8] border-primary/30"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#111111] text-primary flex items-center justify-center font-bold">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#111111] uppercase tracking-wider">
                          Free Template Tag (Free for Normal Users / 5 Starter Credits)
                        </span>
                        {newIsCreditEligible && (
                          <span className="hex-pill-sm bg-primary text-[#111111] text-[9px] font-black px-2 py-0.5">
                            FREE TAG ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#726F6D] font-medium">
                        Eligible for registered users to redeem for 0 rupees using their 5 free starter credits.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewIsCreditEligible(!Boolean(newIsCreditEligible))}
                    className={`hex-pill px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-xs ${
                      newIsCreditEligible
                        ? "bg-[#111111] text-primary border border-primary"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {newIsCreditEligible ? "Tagged as Free" : "+ Tag as Free Template"}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#111111]/10">
                  <button
                    type="button"
                    onClick={() => setIsAddTemplateOpen(false)}
                    className="hex-pill px-4 py-2.5 text-xs font-extrabold text-[#726F6D] hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingTemplate || isUploadingPpt}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs shadow-md disabled:opacity-50"
                  >
                    {isCreatingTemplate ? "Publishing to Database..." : "Publish Template to Marketplace"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT TEMPLATE */}
      <AnimatePresence>
        {isEditTemplateOpen && editingTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#111111]/10 mb-4">
                <div>
                  <h3 className="text-xl font-heading font-extrabold text-[#111111] flex items-center gap-2">
                    <Edit3 size={18} className="text-primary-amber" />
                    Edit Presentation Template
                  </h3>
                  <p className="text-xs text-[#726F6D]">
                    Modify template title, pricing, previews, attached deliverable, and categories.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-3 py-1">
                    SKU: {editingTemplate.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditTemplateOpen(false);
                      setEditingTemplate(null);
                    }}
                    className="text-[#726F6D] hover:text-[#111111] p-1 rounded-full hover:bg-black/5 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {editTemplateSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 mb-4 shadow-sm">
                  <CheckCircle2 size={16} /> Template updated successfully in database!
                </div>
              )}

              {/* SECTION 1: PRESENTATION DELIVERABLE FILE */}
              <div className="bg-[#FFF9E8] border border-primary/30 rounded-2xl p-4 sm:p-5 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#111111] text-primary flex items-center justify-center">
                      <FileText size={15} />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">
                        1. Presentation Deliverable File (.pptx / Download Link)
                      </h4>
                      <p className="text-[10px] text-[#726F6D]">
                        Dispatched securely directly to client's email with instant browser download upon checkout
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Upload from local computer */}
                  <div className="bg-white p-3 rounded-xl border border-[#111111]/10 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">
                      Replace Source File (.pptx)
                    </span>
                    <label className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3.5 py-2 text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm w-full justify-center transition-transform hover:scale-[1.01]">
                      <HardDrive size={13} className="text-primary-amber" />
                      <span>{isUploadingEditPpt ? "Attaching File..." : "Choose Master PowerPoint (.pptx)"}</span>
                      <input
                        type="file"
                        accept=".pptx,.ppt"
                        disabled={isUploadingEditPpt}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingEditPpt(true);
                          try {
                            const r2Res = await uploadToR2(file, { folder: "templates/decks", fileName: file.name });
                            if (r2Res.success && r2Res.publicUrl) {
                              setEditingTemplate({
                                ...editingTemplate,
                                download_url: r2Res.publicUrl
                              });
                            } else {
                              throw new Error(r2Res.error || "Upload failed");
                            }
                          } catch (err: any) {
                            alert("Failed to upload Master PPTX to Cloudflare R2: " + (err.message || err));
                          } finally {
                            setIsUploadingEditPpt(false);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: TEMPLATE PREVIEWS & SLIDES */}
              <div className="bg-white border border-[#111111]/10 rounded-2xl p-4 sm:p-5 mb-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary text-[#111111] flex items-center justify-center font-bold">
                      <ImageIcon size={15} />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">
                        2. Cover Thumbnail & Slide Gallery Previews
                      </h4>
                      <p className="text-[10px] text-[#726F6D]">
                        Upload local image files from computer to update slide previews
                      </p>
                    </div>
                  </div>
                  {Array.isArray(editingTemplate.slides) && editingTemplate.slides.length > 0 && (
                    <span className="hex-pill-sm bg-primary/20 text-[#111111] font-black text-[10px] px-2.5 py-0.5">
                      {editingTemplate.slides.length} Slides
                    </span>
                  )}
                </div>

                {/* Primary Cover Thumbnail */}
                <div className="bg-[#FFF9E8] p-3 rounded-xl border border-[#111111]/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold text-[#111111]">
                      Primary Cover / Thumbnail Image *
                    </label>
                    <label className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-2.5 py-1 text-[10px] inline-flex items-center gap-1 cursor-pointer shadow-sm">
                      <UploadCloud size={11} className="text-primary-amber" /> Choose Local Cover Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                          setEditingTemplate({
                            ...editingTemplate,
                            thumbnail_url: dataUrl
                          });
                        })}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 bg-[#111111] rounded-lg overflow-hidden shrink-0 border border-primary/30">
                      <img src={editingTemplate.thumbnail_url} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-[#726F6D] font-medium">
                      Cover image selected.
                    </span>
                  </div>
                </div>

                {/* Multi-Slide Interior Previews Gallery */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-[#111111] flex items-center gap-1.5">
                      <Layers size={13} className="text-primary-amber" /> Interior Slide Images ({editingTemplate.slides?.length || 0} Slides)
                    </span>
                    <label className="hex-pill-sm bg-primary hover:bg-primary-dark text-[#111111] font-black px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <UploadCloud size={12} />
                      <span>Upload Local Slides (Multi-Select)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          try {
                            const uploadedUrls: string[] = [];
                            for (const file of files) {
                              const r2Res = await uploadToR2(file, { folder: "templates/slides", fileName: file.name });
                              if (r2Res.success && r2Res.publicUrl) {
                                uploadedUrls.push(r2Res.publicUrl);
                              }
                            }
                            setEditingTemplate((prev: any) => {
                              const curSlides = Array.isArray(prev.slides) ? prev.slides : [];
                              const nextSlides = [...curSlides, ...uploadedUrls];
                              return {
                                ...prev,
                                slides: nextSlides,
                                slide_count: nextSlides.length
                              };
                            });
                          } catch (err: any) {
                            alert("Failed to upload slide images to Cloudflare R2: " + (err.message || err));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Visual Slide Thumbnails Strip */}
                  {Array.isArray(editingTemplate.slides) && editingTemplate.slides.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 border border-[#111111]/10 rounded-xl bg-[#FFF9E8]/50">
                      {editingTemplate.slides.map((s: string, idx: number) => (
                        <div
                          key={idx}
                          className="hex-card overflow-hidden bg-white border border-[#111111]/10 text-left p-1.5 shadow-sm relative group"
                        >
                          <div className="aspect-[16/10] bg-[#111111] rounded overflow-hidden mb-1">
                            <img src={s} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[9px] font-black text-[#111111]">
                              {idx === 0 ? "Cover" : `Slide #${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...editingTemplate.slides];
                                    const [moved] = next.splice(idx, 1);
                                    next.unshift(moved);
                                    setEditingTemplate({
                                      ...editingTemplate,
                                      slides: next,
                                      thumbnail_url: moved
                                    });
                                  }}
                                  className="text-[8px] text-primary-amber font-extrabold hover:underline cursor-pointer"
                                  title="Make Cover"
                                >
                                  Top
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const next = editingTemplate.slides.filter((_: any, i: number) => i !== idx);
                                  setEditingTemplate({
                                    ...editingTemplate,
                                    slides: next,
                                    slide_count: next.length || 1,
                                    thumbnail_url: idx === 0 && next.length > 0 ? next[0] : editingTemplate.thumbnail_url
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: SOFTWARE COMPATIBILITY TAGS (OPTIONAL) */}
              <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/10 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <LayoutTemplate size={13} className="text-primary-amber" />
                    <span>3. Software Compatibility Tags</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#726F6D]">
                    {(!Array.isArray(editingTemplate.formats) || editingTemplate.formats.length === 0)
                      ? "0 Formats Selected (Optional)"
                      : `${editingTemplate.formats.length} Format${editingTemplate.formats.length > 1 ? "s" : ""} Selected`}
                  </span>
                </div>
                <p className="text-[10px] text-[#726F6D]">
                  Select presentation software supported by this template. Click any format pill to toggle on or off.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_FORMAT_TAGS.map((fmt) => {
                    const currentFormats: string[] = Array.isArray(editingTemplate.formats) ? editingTemplate.formats : [];
                    const isSelected = currentFormats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? currentFormats.filter(f => f !== fmt)
                            : [...currentFormats, fmt];
                          setEditingTemplate({
                            ...editingTemplate,
                            formats: next
                          });
                        }}
                        className={`hex-pill-sm px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isSelected
                            ? "bg-[#111111] text-[#FCBF14] border border-[#111111]"
                            : "bg-white text-[#111111] border border-[#111111]/15 hover:border-primary"
                        }`}
                      >
                        {isSelected ? <Check size={12} className="text-[#FCBF14]" /> : <Plus size={12} className="text-[#726F6D]" />}
                        <span>{fmt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: METADATA FORM */}
              <form onSubmit={handleSaveEditTemplate} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Template Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTemplate.title}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Template Code (SKU) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTemplate.code}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value.toUpperCase() })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-black uppercase outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Category
                    </label>
                    <select
                      value={editingTemplate.category}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Pitch Decks">Pitch Decks</option>
                      <option value="Business">Business</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Finance">Finance</option>
                      <option value="Infographics">Infographics</option>
                      <option value="Timelines">Timelines</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Total Slides Count
                    </label>
                    <input
                      type="number"
                      value={editingTemplate.slide_count}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, slide_count: Number(e.target.value) })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Price INR (₹)
                    </label>
                    <input
                      type="number"
                      value={editingTemplate.price_inr}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, price_inr: Number(e.target.value) })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Price USD ($)
                    </label>
                    <input
                      type="number"
                      value={editingTemplate.price_usd}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, price_usd: Number(e.target.value) })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-card p-3 text-xs text-[#111111] font-medium outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Storefront Marketplace Visibility Toggle */}
                <div className="bg-[#FFF9E8] border border-primary/40 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-black text-[#111111] block">Storefront Marketplace Visibility</span>
                    <span className="text-[10px] text-[#726F6D] font-medium">Show or hide this presentation deck on the public client catalog</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingTemplate({ ...editingTemplate, is_published: editingTemplate.is_published === false ? true : false })}
                    className={`hex-pill text-[10px] font-black px-3 py-1 transition-all flex items-center gap-1 cursor-pointer ${
                      editingTemplate.is_published !== false
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {editingTemplate.is_published !== false ? (
                      <>
                        <Eye size={12} className="text-emerald-700" />
                        <span>Enabled on Storefront</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} className="text-gray-500" />
                        <span>Hidden (Draft)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Free Starter Credits Library Tag */}
                <div className="bg-[#FFF9E8] border border-primary/40 p-3.5 rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-black text-[#111111] block">5 Free Starter Credits Tag</span>
                    <span className="text-[10px] text-[#726F6D] font-medium">Allow registered clients to claim this template using their 5 free starter credits</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingTemplate({ ...editingTemplate, is_credit_eligible: !editingTemplate.is_credit_eligible })}
                    className={`hex-pill text-[10px] font-black px-3 py-1 transition-all flex items-center gap-1 cursor-pointer ${
                      editingTemplate.is_credit_eligible
                        ? "bg-primary text-[#111111] border border-[#111111]/20 shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    {editingTemplate.is_credit_eligible ? (
                      <>
                        <Sparkles size={12} className="text-[#111111]" />
                        <span>Tagged (Eligible)</span>
                      </>
                    ) : (
                      <span>+ Tag as Free</span>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#111111]/10">
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(editingTemplate.id, editingTemplate.title)}
                    className="hex-pill px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete Template
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditTemplateOpen(false);
                        setEditingTemplate(null);
                      }}
                      className="hex-pill px-4 py-2.5 text-xs font-extrabold text-[#726F6D] hover:bg-black/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEditTemplate || isUploadingEditPpt}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={14} />
                      {isSavingEditTemplate ? "Saving Changes..." : "Save Template Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD ASSET */}
      <AnimatePresence>
        {isAddAssetOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 max-w-lg w-full shadow-2xl"
            >
              <h3 className="text-xl font-heading font-extrabold text-[#111111] mb-4">
                Add / Update Dynamic Asset
              </h3>

              <form onSubmit={handleSaveAsset} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Asset Unique Key *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hero_slide_banner_1"
                    value={assetKey}
                    onChange={(e) => setAssetKey(e.target.value)}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Executive Keynote Sample"
                      value={assetTitle}
                      onChange={(e) => setAssetTitle(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                      Category
                    </label>
                    <select
                      value={assetCategory}
                      onChange={(e) => setAssetCategory(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                    >
                      <option value="portfolio">portfolio</option>
                      <option value="marquee">marquee</option>
                      <option value="comparison">comparison</option>
                      <option value="logo">logo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Asset Image URL * (Cloudflare R2 / Local path / URL)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/portfolio/case_study_a_1.png or https://..."
                    value={assetUrl}
                    onChange={(e) => setAssetUrl(e.target.value)}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs text-[#111111] font-medium outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#111111]/10">
                  <button
                    type="button"
                    onClick={() => setIsAddAssetOpen(false)}
                    className="hex-pill px-4 py-2.5 text-xs font-extrabold text-[#726F6D] hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAsset}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs"
                  >
                    {isSavingAsset ? "Saving..." : "Save Asset"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ORDER DETAILS & MILESTONE STEPPER */}
      <AnimatePresence>
        {selectedOrderForModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setSelectedOrderForModal(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111111] transition-colors hex-pill bg-black/5 hover:bg-black/10"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="hex-pill-sm bg-[#FFF9E8] text-primary-amber border border-primary/30 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                  Order #{selectedOrderForModal.id?.slice(0, 8) || "N/A"}
                </span>
                {selectedOrderForModal.rush_delivery && (
                  <span className="hex-pill-sm bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-0.5 border border-red-200 flex items-center gap-1">
                    <Zap size={10} /> 24h Rush Order
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111] mb-1">
                {selectedOrderForModal.service_type || "Presentation Design"}
              </h3>
              <p className="text-xs text-[#726F6D] font-medium mb-6">
                Client: <strong className="text-[#111111]">{selectedOrderForModal.client_name || "N/A"}</strong> ({selectedOrderForModal.client_email})
              </p>

              {/* Milestone Timeline Stepper in Modal */}
              <div className="bg-[#FFF9E8] border border-primary/30 rounded-2xl p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary-amber" /> Live Milestone Progress
                  </h4>
                  <span className="text-xs font-extrabold text-primary-amber">
                    Stage {getMilestoneIndex(selectedOrderForModal.status) + 1} of 4: {ORDER_MILESTONES[getMilestoneIndex(selectedOrderForModal.status)].label}
                  </span>
                </div>

                {/* 4-Step Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {ORDER_MILESTONES.map((m, idx) => {
                    const currentIdx = getMilestoneIndex(selectedOrderForModal.status);
                    const isPassed = idx < currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrderForModal.id, m.key);
                          setSelectedOrderForModal({ ...selectedOrderForModal, status: m.key });
                        }}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? "bg-[#111111] text-white border-[#111111] shadow-md ring-2 ring-primary/40"
                            : isPassed
                            ? "bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200"
                            : "bg-white text-gray-500 border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isCurrent ? "bg-primary text-[#111111]" : isPassed ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            {isPassed ? "Done" : isCurrent ? "Active" : `Step ${m.step}`}
                          </span>
                        </div>
                        <div className={`font-extrabold text-xs mb-0.5 ${isCurrent ? "text-primary" : "text-[#111111]"}`}>
                          {m.label}
                        </div>
                        <div className={`text-[10px] font-medium leading-tight ${isCurrent ? "text-white/70" : "text-[#726F6D]"}`}>
                          {m.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#111111]/10">
                  <span className="text-[#726F6D]">
                    Click any stage above to update status instantly.
                  </span>
                  {getMilestoneIndex(selectedOrderForModal.status) < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextKey = ORDER_MILESTONES[getMilestoneIndex(selectedOrderForModal.status) + 1].key;
                        handleUpdateOrderStatus(selectedOrderForModal.id, nextKey);
                        setSelectedOrderForModal({ ...selectedOrderForModal, status: nextKey });
                      }}
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      Advance to {ORDER_MILESTONES[getMilestoneIndex(selectedOrderForModal.status) + 1].label} <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Order Scope & Requirements */}
              <div className="space-y-4 text-xs mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-[#111111]/8">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">Slide Scope</span>
                    <span className="font-extrabold text-[#111111] text-sm">{selectedOrderForModal.slide_count || "Custom"} Slides</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">Target Deadline</span>
                    <span className="font-extrabold text-[#111111] text-sm">{selectedOrderForModal.target_date || "Standard (48h)"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">Contact Phone</span>
                    <span className="font-extrabold text-[#111111] text-sm">{selectedOrderForModal.phone || "Not provided"}</span>
                  </div>
                </div>

                {selectedOrderForModal.notes && (
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#111111] block mb-1">
                      Client Project Brief & Notes:
                    </span>
                    <div className="p-3.5 bg-[#FFF9E8] rounded-xl border border-primary/20 text-[#111111] font-medium leading-relaxed whitespace-pre-wrap">
                      {selectedOrderForModal.notes}
                    </div>
                  </div>
                )}

                {selectedOrderForModal.drive_link && (
                  <div className="flex items-center justify-between p-3.5 bg-primary/10 border border-primary/30 rounded-xl">
                    <div>
                      <span className="font-extrabold text-[#111111] block">Google Drive / Cloud Assets</span>
                      <span className="text-[11px] text-[#726F6D] truncate max-w-xs sm:max-w-md block">
                        {selectedOrderForModal.drive_link}
                      </span>
                    </div>
                    <a
                      href={selectedOrderForModal.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs px-4 py-2 flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      Open Link <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#111111]/10">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedOrderForModal.client_email}?subject=SlideBee Order Update: ${encodeURIComponent(selectedOrderForModal.service_type || 'Your Presentation')}`}
                    className="hex-pill border border-[#111111]/20 hover:border-primary text-[#111111] font-extrabold text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <Mail size={13} /> Email Client
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForModal(null)}
                  className="hex-pill bg-[#111111] text-white hover:text-primary font-black text-xs px-6 py-2.5 shadow-md"
                >
                  Done
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

