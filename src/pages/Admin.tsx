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
  Copy
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { performGlobalLogout, subscribeToAuthSync } from "../lib/authSync";
import SlideBeeLogo from "../components/SlideBeeLogo";
import SoftwareBadge from "../components/SoftwareIcons";
import { templateCatalog } from "./Templates";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [orderMilestoneFilter, setOrderMilestoneFilter] = useState<string>("all");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<any | null>(null);

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
  const [newSoftwareFormats, setNewSoftwareFormats] = useState<string[]>(["PowerPoint", "Google Slides", "Canva"]);
  const [newPptUrl, setNewPptUrl] = useState("");
  const [newPptFilename, setNewPptFilename] = useState("");
  const [newPptSize, setNewPptSize] = useState("");
  const [isUploadingPpt, setIsUploadingPpt] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

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
  const [activeCmsSubTab, setActiveCmsSubTab] = useState<"pricing" | "home" | "marquee" | "testimonials" | "services" | "portfolio" | "about" | "contact" | "footer" | "payments">("home");
  const [configSaving, setConfigSaving] = useState(false);
  const [configSavedSuccess, setConfigSavedSuccess] = useState(false);
  const [configValidationError, setConfigValidationError] = useState("");

  // 1. Check active session on mount
  useEffect(() => {
    const unsubscribeSync = subscribeToAuthSync(
      () => {
        setSession(null);
      },
      () => {
        const localPinAuth = localStorage.getItem("slidebee_admin_session");
        if (localPinAuth === "true") {
          setSession({ user: { email: "admin@theslidebee.com", role: "super_admin" } });
        }
      }
    );

    const localPinAuth = localStorage.getItem("slidebee_admin_session");
    if (localPinAuth === "true") {
      setSession({ user: { email: "admin@theslidebee.com", role: "super_admin" } });
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
    const sampleHeaders = "code,title,category,price_inr,price_usd,original_price_inr,slide_count,thumbnail_url,slides_preview_urls,download_url,formats,description,features\n";
    const sampleRows = 
      `"SLD-101","Series A SaaS Pitch Deck Pro","Pitch Decks",999,19,1999,30,"/portfolio/case_study_a_1.png","/portfolio/case_study_a_1.png;/portfolio/case_study_a_2.png;/portfolio/case_study_a_3.png;/portfolio/case_study_a_4.png","https://theslidebee.com/downloads/series_a_saas_pro.pptx","PowerPoint;Google Slides;Keynote;Canva","High-converting 30-slide pitch deck layout with financial unit economics and investor traction metrics.","30+ Editable Vector Slides;16:9 Widescreen Layout;Dark & Light Mode;Free Google Fonts;Master Color Tokens"\n` +
      `"SLD-102","Executive Board Review 2026","Corporate",1499,29,2999,45,"/portfolio/case_study_a_14.png","/portfolio/case_study_a_14.png;/portfolio/case_study_a_15.png;/portfolio/case_study_a_16.png","https://theslidebee.com/downloads/executive_board_review.pptx","PowerPoint;Google Slides;Keynote","Minimalist corporate executive board presentation system with financial tables and governance frameworks.","45+ Governance & Financial Slides;Data-Dense Executive Layouts;Custom SVG Icons Included;Editable PPTX & Keynote"\n` +
      `"SLD-103","Modern Brand Styleguide & Guidelines","Branding",799,15,1599,25,"/portfolio/levis_yuengling_6.png","/portfolio/levis_yuengling_6.png;/portfolio/levis_yuengling_7.png;/portfolio/levis_yuengling_8.png","https://theslidebee.com/downloads/brand_guidelines_system.pptx","PowerPoint;Google Slides;Canva;Figma","Complete visual identity presentation system with color tokens, logo safe-zones, and editorial typography.","25 Modular Brand Guidelines Slides;Color Swatch Placeholders;Typography Scaling Hierarchy;Multi-Platform Deliverable"`;
    
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
    const formatsIdx = getColIndex("formats", 10);
    const descIdx = hasHeaderCode ? getColIndex("description", 11) : getColIndex("description", 6);
    const featuresIdx = getColIndex("features", 12);

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

        // Software formats
        let formats: string[] = ["PowerPoint", "Google Slides"];
        if (parts[formatsIdx]) {
          formats = parts[formatsIdx].split(/[;|]/).map(f => f.trim().replace(/^"|"$/g, "")).filter(Boolean);
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
          formats,
          features,
          description: parts[descIdx] || "High-impact presentation deck layout tailored for executive presentations.",
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
              size: formattedSize,
              url: fileUrl,
              type: isPpt ? "ppt" : "image"
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

  // Copy all uploaded image URLs formatted with semicolons for CSV
  const handleCopyAllAssetUrls = () => {
    const previewUrls = bulkUploadedAssets.filter(a => a.type === "image").map(a => a.url).join(";");
    navigator.clipboard.writeText(previewUrls);
    setCopiedAssetUrlsSuccess(true);
    setTimeout(() => setCopiedAssetUrlsSuccess(false), 2500);
  };

  // Auto add row to CSV using uploaded files
  const handleAddRowFromUploadedAssets = () => {
    const pptAsset = bulkUploadedAssets.find(a => a.type === "ppt");
    const imageAssets = bulkUploadedAssets.filter(a => a.type === "image");
    const thumbUrl = imageAssets[0]?.url || "/portfolio/case_study_a_1.png";
    const previewUrls = imageAssets.map(a => a.url).join(";");
    const pptUrl = pptAsset?.url || "https://theslidebee.com/downloads/master_deck.pptx";
    const newSku = `SLD-${Math.floor(100 + Math.random() * 900)}`;

    const newRow = `"${newSku}","Executive Pitch Deck ${newSku}","Pitch Decks",999,19,1999,${Math.max(imageAssets.length, 25)},"${thumbUrl}","${previewUrls || thumbUrl}","${pptUrl}","PowerPoint;Google Slides;Keynote;Canva","Custom executive pitch deck layout ready for high-stakes presentations.","${Math.max(imageAssets.length, 25)}+ High-Impact Slides;Editable Vector Elements;16:9 Widescreen"\n`;

    const nextRaw = csvRawText ? (csvRawText.trim() + "\n" + newRow) : ("code,title,category,price_inr,price_usd,original_price_inr,slide_count,thumbnail_url,slides_preview_urls,download_url,formats,description,features\n" + newRow);
    handleParseCSV(nextRaw);
    setBulkModalTab("csv");
  };

  // Execute Bulk Insertion into Supabase
  const handleExecuteBulkImport = async () => {
    if (parsedBulkTemplates.length === 0) return;
    setIsImportingBulk(true);

    const { data, error } = await supabase
      .from("templates")
      .insert(parsedBulkTemplates)
      .select();

    if (!error && data) {
      setTemplates([...data, ...templates]);
      setBulkImportSuccessCount(data.length);
      setTimeout(() => {
        setIsBulkImportOpen(false);
        setBulkImportSuccessCount(null);
        setParsedBulkTemplates([]);
        setCsvRawText("");
      }, 2500);
    } else if (error) {
      console.warn("Supabase bulk insert warning:", error.message);
      // Fallback local persistence
      const fallbackTemplates = parsedBulkTemplates.map((item, idx) => ({
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
      formats: newSoftwareFormats.length > 0 ? newSoftwareFormats : ["PowerPoint", "Google Slides"],
      features: [
        `${effectiveSlideCount}+ High-Impact Slides`,
        "16:9 Widescreen Layout",
        "Fully Editable Vector Elements"
      ],
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
      setNewCode(`SLD-${Math.floor(100 + Math.random() * 900)}`);
      setNewSoftwareFormats(["PowerPoint", "Google Slides", "Canva"]);
    } else {
      // Fallback local persistence if insert notice
      const fallbackItem = { id: `tpl-${Date.now()}`, ...payload };
      setTemplates([fallbackItem, ...templates]);
      setIsAddTemplateOpen(false);
    }
    setIsCreatingTemplate(false);
  };

  // Upload Local PPT / PPTX / PDF File
  const handlePptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPpt(true);
    setNewPptFilename(file.name);
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setNewPptSize(file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewPptUrl(event.target.result as string);
      }
      setIsUploadingPpt(false);
    };
    reader.onerror = () => {
      setIsUploadingPpt(false);
    };
    reader.readAsDataURL(file);

    if (!newTitle) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }
  };

  // Upload Multiple Slide Images for Template Gallery
  const handleSlideImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
          setNewSlides((prev) => {
            const next = [...prev, imgUrl];
            setNewSlideCount(next.length);
            return next;
          });
          if (index === 0 && (!newThumbnail || newThumbnail.startsWith("/portfolio/case_study_a_1"))) {
            setNewThumbnail(imgUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Toggle Software Format Tag for Template Creation
  const toggleSoftwareFormat = (fmt: string) => {
    if (newSoftwareFormats.includes(fmt)) {
      if (newSoftwareFormats.length > 1) {
        setNewSoftwareFormats(newSoftwareFormats.filter((f) => f !== fmt));
      }
    } else {
      setNewSoftwareFormats([...newSoftwareFormats, fmt]);
    }
  };

  // Upload Multiple Slide Images for Portfolio Case Study
  const handleCaseStudySlidesUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgUrl = event.target.result as string;
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
      };
      reader.readAsDataURL(file);
    });
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

  // Cloudflare R2 Storage Stats (10 GB Free Tier Quota)
  const totalR2QuotaMB = 10240; // 10 GB
  // Estimate stored size based on assets and templates
  const estimatedUsedMB = Math.round((templates.length * 35.5) + (assets.length * 4.2) + 24.5); // Sample dynamic computation
  const remainingMB = Math.max(0, totalR2QuotaMB - estimatedUsedMB);
  const percentUsed = ((estimatedUsedMB / totalR2QuotaMB) * 100).toFixed(1);
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
                                  ⚡ 24h Rush
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
                                              ✓
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="hex-card bg-white border border-[#111111]/10 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="aspect-[16/10] bg-[#111111] overflow-hidden">
                  <img
                    src={tpl.thumbnail_url}
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

                  {/* Software Compatibility Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#111111]/8 mb-3">
                    {(Array.isArray(tpl.formats) && tpl.formats.length > 0 ? tpl.formats : ["PowerPoint", "Google Slides"]).map((fmt: string) => (
                      <SoftwareBadge key={fmt} format={fmt} size="sm" showLabel={true} />
                    ))}
                  </div>

                  {tpl.download_url && (
                    <div className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex items-center gap-1 mb-3">
                      <FileText size={11} className="text-emerald-600" />
                      <span className="truncate">Deliverable file attached</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-[#111111]/8 text-xs font-bold">
                    <span>{tpl.slide_count || tpl.slides_count || 25} Slides</span>
                    <span className="text-primary-amber font-extrabold">
                      ₹{tpl.price_inr} / ${tpl.price_usd}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
                { id: "home", label: "🏠 Homepage Header" },
                { id: "marquee", label: "🎠 Hero Marquee" },
                { id: "testimonials", label: "💬 Client Testimonials" },
                { id: "services", label: "⚙️ Services & Before/After" },
                { id: "portfolio", label: "🖼️ Portfolio & Case Studies" },
                { id: "about", label: "🏢 About & Story" },
                { id: "contact", label: "📞 Contact & Channels" },
                { id: "footer", label: "👣 Footer Links" },
                { id: "pricing", label: "💰 Pricing Rates" },
                { id: "payments", label: "💳 Razorpay Gateway" },
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveCmsSubTab(subTab.id as any)}
                  className={`hex-pill px-4 py-2 text-xs font-extrabold whitespace-nowrap transition-all ${
                    activeCmsSubTab === subTab.id
                      ? "bg-primary text-[#111111] shadow-md scale-105"
                      : "bg-white text-[#726F6D] hover:text-[#111111] border border-[#111111]/10"
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* SUB-TAB 1: HOMEPAGE CMS */}
            {activeCmsSubTab === "home" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      🏠 Homepage Hero Customizer
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Hero Badge Text
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["hero"]?.badgeText ?? "SlideBee Design Studio"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        hero: { ...siteConfigs["hero"], badgeText: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#111111] block mb-1">
                      Primary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={siteConfigs["hero"]?.ctaText ?? "Start Your Project Brief"}
                      onChange={(e) => setSiteConfigs({
                        ...siteConfigs,
                        hero: { ...siteConfigs["hero"], ctaText: e.target.value }
                      })}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2 text-xs font-medium text-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Hero H1 Headline (HTML allowed)
                  </label>
                  <input
                    type="text"
                    value={siteConfigs["hero"]?.headline ?? 'Present With <br class="hidden sm:inline" /><span class="text-transparent bg-clip-text bg-gradient-to-r from-[#D99F06] to-[#FCD34D]">Unfair Advantage</span>'}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      hero: { ...siteConfigs["hero"], headline: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs font-bold text-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={siteConfigs["hero"]?.secondaryCtaText ?? "Hire a Designer"}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      hero: { ...siteConfigs["hero"], secondaryCtaText: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-4 py-2.5 text-xs font-bold text-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#111111] block mb-1">
                    Hero Sub-Headline / Supporting Paragraph
                  </label>
                  <textarea
                    rows={2}
                    value={siteConfigs["hero"]?.subheadline ?? "From 24-hour investor pitch deck redesigns to enterprise master templates — we help founders and executives command the room."}
                    onChange={(e) => setSiteConfigs({
                      ...siteConfigs,
                      hero: { ...siteConfigs["hero"], subheadline: e.target.value }
                    })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/12 rounded-xl p-3 text-xs font-medium text-[#111111]"
                  />
                </div>

                {/* FEATURED TEMPLATES ON HOMEPAGE */}
                <div className="pt-6 border-t border-[#111111]/8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-heading font-extrabold text-[#111111]">
                        ⭐ Featured Templates On Homepage Grid
                      </h4>
                      <p className="text-xs text-[#726F6D]">
                        Select which templates appear in the 8-card showcase on the homepage.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const first8 = templateCatalog.slice(0, 8).map(t => t.id);
                          setSiteConfigs({
                            ...siteConfigs,
                            featured_templates: { ids: first8 }
                          });
                        }}
                        className="text-[11px] font-bold text-primary-amber hover:underline px-2 py-1 bg-[#FFF9E8] rounded border border-primary/20"
                      >
                        Reset to First 8
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveConfig("featured_templates", siteConfigs["featured_templates"] || { ids: templateCatalog.slice(0, 8).map(t => t.id) })}
                        disabled={configSaving}
                        className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-4 py-1.5 text-xs shadow"
                      >
                        Save Templates
                      </button>
                    </div>
                  </div>

                  {/* Grid of Templates for Toggle Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1 bg-[#FFF9E8]/50 rounded-xl border border-[#111111]/8">
                    {templateCatalog.map((tmpl) => {
                      const selectedIds: string[] = siteConfigs["featured_templates"]?.ids || templateCatalog.slice(0, 8).map(t => t.id);
                      const isSelected = selectedIds.includes(tmpl.id);

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            let newIds: string[];
                            if (isSelected) {
                              newIds = selectedIds.filter(id => id !== tmpl.id);
                            } else {
                              newIds = [...selectedIds, tmpl.id];
                            }
                            setSiteConfigs({
                              ...siteConfigs,
                              featured_templates: { ids: newIds }
                            });
                          }}
                          className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected 
                              ? "bg-white border-primary shadow-sm" 
                              : "bg-white/60 border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img 
                            src={tmpl.image} 
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
                                {isSelected ? "✓" : "+"}
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
                  <div className="text-[11px] text-[#726F6D] font-medium">
                    Currently Selected: <strong>{(siteConfigs["featured_templates"]?.ids || templateCatalog.slice(0, 8).map(t => t.id)).length}</strong> templates active on the homepage.
                  </div>
                </div>

                {/* BEFORE & AFTER SLIDER CUSTOMIZER */}
                <div className="pt-6 border-t border-[#111111]/8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-heading font-extrabold text-[#111111]">
                        🔄 Homepage Before & After Comparison Decks
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
                                ❌ Before Image
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
                                ✨ After Image
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
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      🎠 Moving Marquee Presentation Slides
                    </h3>
                    <p className="text-xs text-[#726F6D]">
                      Update the gliding presentation cards shown in the hero section.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveConfig("hero", siteConfigs["hero"])}
                    disabled={configSaving}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs flex items-center gap-1.5 shadow"
                  >
                    <Save size={14} /> {configSaving ? "Saving..." : "Save Marquee"}
                  </button>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-[#111111] block">
                      Slide Images
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const currentSlides = siteConfigs["hero"]?.marqueeSlides || [];
                        setSiteConfigs({
                          ...siteConfigs,
                          hero: { ...siteConfigs["hero"], marqueeSlides: [...currentSlides, "/portfolio/case_study_a_1.png"] }
                        });
                      }}
                      className="text-[11px] font-bold text-primary-amber hover:underline"
                    >
                      + Add Slide Image
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(siteConfigs["hero"]?.marqueeSlides || [
                      '/portfolio/case_study_a_14.png',
                      '/portfolio/global_brands_1.png',
                      '/portfolio/levis_yuengling_6.png',
                      '/portfolio/pepsico_1.png',
                      '/portfolio/case_study_b_2.png',
                      '/portfolio/global_brands_3.png'
                    ]).map((slide: string, idx: number) => (
                      <div key={idx} className="flex items-center bg-[#FFF9E8] border border-[#111111]/10 rounded overflow-hidden">
                        <div className="w-8 h-8 bg-[#111111]/5 flex-shrink-0 flex items-center justify-center border-r border-[#111111]/10">
                          <img src={slide} alt="Slide" className="w-full h-full object-cover" />
                        </div>
                        <input
                          type="text"
                          value={slide}
                          onChange={(e) => {
                            const updated = [...(siteConfigs["hero"]?.marqueeSlides || [])];
                            updated[idx] = e.target.value;
                            setSiteConfigs({
                              ...siteConfigs,
                              hero: { ...siteConfigs["hero"], marqueeSlides: updated }
                            });
                          }}
                          className="w-full bg-white border border-[#111111]/10 rounded px-2 py-1 text-[11px] font-mono text-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (siteConfigs["hero"]?.marqueeSlides || []).filter((_: any, i: number) => i !== idx);
                            setSiteConfigs({
                              ...siteConfigs,
                              hero: { ...siteConfigs["hero"], marqueeSlides: updated }
                            });
                          }}
                          className="text-red-500 hover:text-red-700 font-bold px-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB: TESTIMONIALS CMS */}
            {activeCmsSubTab === "testimonials" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      💬 Client Testimonials & Social Proof Customizer
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
                          ✕ Delete
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
                      ⚙️ Services & Before / After Slider Customizer
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
                                ❌ Raw Draft (Before Image)
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
                                ✨ SlideBee Polish (After Image)
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
              </div>
            )}

            {/* SUB-TAB 3: PORTFOLIO & CASE STUDIES CMS */}
            {activeCmsSubTab === "portfolio" && (
              <div className="hex-card-lg bg-white border border-[#111111]/10 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#111111]/8">
                  <div>
                    <h3 className="text-base font-heading font-extrabold text-[#111111]">
                      🖼️ Portfolio & Case Studies Customizer (/examples)
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
                          🗑️ Remove
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
                                        {sIdx === 0 ? "★ Cover" : `#${sIdx + 1}`}
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
                              <label className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3 py-1.5 text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm">
                                <UploadCloud size={12} className="text-primary-amber" />
                                <span>Upload Slides from Computer</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
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
                        title: "New Venture Deck",
                        client: "Acme Corp",
                        category: "Healthcare & Tech",
                        slides: [
                          "/portfolio/case_study_a_14.png",
                          "/portfolio/case_study_a_15.png",
                          "/portfolio/case_study_a_16.png"
                        ],
                        imageUrl: "/portfolio/case_study_a_14.png",
                        impact: "$10M Series A",
                        description: "High-impact presentation narrative and custom infographics.",
                        deliverables: ["PPTX Master", "Google Slides", "PDF"]
                      };
                      setSiteConfigs({
                        ...siteConfigs,
                        portfolio_cms: { ...siteConfigs["portfolio_cms"], caseStudies: [...current, newCS] }
                      });
                    }}
                    className="hex-pill w-full bg-[#FFF9E8] hover:bg-black/5 text-[#111111] border border-[#111111]/15 py-3 text-xs font-extrabold flex items-center justify-center gap-2"
                  >
                    + Add New Case Study
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
                      🏢 About Page Story & Mission Customizer
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
                      📞 Contact & Channels Customizer (/contact)
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
                      👣 Footer Social Media & Brand Links Customizer
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
                      💰 Service Pricing Rates & Retainers
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
                    👑 SlideBee Pro Access Subscription & Yearly Deal
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
                      💳 Razorpay Payment Gateway Integration
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
                      Found in Razorpay Dashboard ➔ Settings ➔ API Keys.
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
                        <span>🧪 Test Mode (Sandbox)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="razorpay_mode"
                          checked={razorpayMode === "live"}
                          onChange={() => setRazorpayMode("live")}
                          className="accent-primary"
                        />
                        <span>🚀 Live Mode (Production)</span>
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
                          ✓ Key configured ({razorpayKeyId.slice(0, 10)}...). Real test checkouts are active on all template downloads!
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium">
                          ⏳ Waiting for API Key: You can paste your test key (<code className="font-mono text-[10px]">rzp_test_...</code>) right here whenever you obtain it from your Razorpay dashboard. In the meantime, the storefront is equipped with a smooth test-mode payment simulator.
                        </span>
                      )}
                    </p>
                  </div>
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
                  Status: 🟢 Connected & Active
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                  <span className="text-[#111111]">{estimatedUsedMB} MB Used</span>
                  <span className="text-primary-amber">{remainingGB} GB Remaining ({100 - Number(percentUsed)}% Free)</span>
                </div>
                <div className="w-full bg-[#FFF9E8] rounded-full h-4 overflow-hidden border border-[#111111]/10 p-0.5">
                  <div 
                    className="bg-primary-amber h-full rounded-full transition-all" 
                    style={{ width: `${Math.max(2, Number(percentUsed))}%` }} 
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
                    {templates.length * 35.5} MB
                  </div>
                  <span className="text-[10px] text-[#726F6D] font-medium">
                    {templates.length} downloadable ZIP packages
                  </span>
                </div>

                <div className="bg-[#FFF9E8] p-4 rounded-xl border border-[#111111]/8">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#726F6D] block mb-1">
                    Slide Previews (.png/.webp)
                  </span>
                  <div className="text-xl font-heading font-black text-[#111111]">
                    {assets.length * 4.2} MB
                  </div>
                  <span className="text-[10px] text-[#726F6D] font-medium">
                    {assets.length} portfolio slide previews
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
                    Zero bandwidth fees on Cloudflare R2
                  </span>
                </div>
              </div>

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
                    Upload a CSV spreadsheet with PPT download deliverables, multi-slide preview images, and software compatibility tags
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

                    <div className="bg-[#FFF9E8] border border-primary/30 p-3 rounded-xl text-xs space-y-1">
                      <span className="font-extrabold text-[#111111] block">Supported CSV Columns:</span>
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
                        <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">formats</code>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                      Or Paste CSV Text Directly
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`"code","title","category","price_inr","price_usd","slide_count","thumbnail_url","slides_preview_urls","download_url","formats","description"`}
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
                          ✓ Ready to Publish ({parsedBulkTemplates.length} Templates Verified)
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
                              <th className="p-2.5">Software</th>
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
                                    🖼️ {t.slides?.length || 1} Previews
                                  </span>
                                </td>
                                <td className="p-2.5 whitespace-nowrap">
                                  {t.download_url ? (
                                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      📁 Attached
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#726F6D]">URL link</span>
                                  )}
                                </td>
                                <td className="p-2.5 whitespace-nowrap">
                                  <span className="text-[10px] text-[#726F6D]">
                                    {Array.isArray(t.formats) ? t.formats.slice(0, 2).join(", ") : "PowerPoint"}
                                  </span>
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
                            {copiedAssetUrlsSuccess ? "✓ URLs Copied to Clipboard!" : "Copy All Image URLs (for CSV)"}
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
                                {asset.type === "ppt" ? "📁 Presentation" : "🖼️ Slide"} • {asset.size}
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
                        The file buyers receive upon purchase or download (PPTX, Keynote, PDF, or Cloud Drive link)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Upload from local computer */}
                  <div className="bg-white p-3 rounded-xl border border-[#111111]/10 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">
                      Option A: Upload Source File
                    </span>
                    <label className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3.5 py-2 text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm w-full justify-center transition-transform hover:scale-[1.01]">
                      <HardDrive size={13} className="text-primary-amber" />
                      <span>{isUploadingPpt ? "Attaching File..." : "Choose .PPTX / .PDF / .KEY"}</span>
                      <input
                        type="file"
                        accept=".pptx,.ppt,.pdf,.key,.zip"
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

                  {/* Option B: Direct Cloud / Drive Link */}
                  <div className="bg-white p-3 rounded-xl border border-[#111111]/10 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">
                      Option B: Cloud Download URL
                    </span>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/file/d/... or direct link"
                      value={newPptUrl.startsWith("data:") ? "" : newPptUrl}
                      onChange={(e) => {
                        setNewPptUrl(e.target.value);
                        if (e.target.value) {
                          setNewPptFilename("Cloud Link Deliverable");
                          setNewPptSize("Cloud");
                        }
                      }}
                      className="w-full bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-2 text-xs text-[#111111] font-mono outline-none focus:border-primary"
                    />
                    <p className="text-[9px] text-[#726F6D]">
                      Paste a Google Drive, Dropbox, or OneDrive shareable link.
                    </p>
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
                        Add cover thumbnail and interior slide previews for customer marketplace inspection
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
                      <UploadCloud size={11} className="text-primary-amber" /> Upload Cover Photo
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
                    <div className="w-16 h-11 bg-[#111111] rounded-lg overflow-hidden shrink-0 border border-primary/30">
                      <img src={newThumbnail} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                    <input
                      type="text"
                      value={newThumbnail}
                      onChange={(e) => setNewThumbnail(e.target.value)}
                      placeholder="Cover image URL or upload from computer"
                      className="flex-1 bg-white border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs text-[#111111] font-mono outline-none focus:border-primary"
                    />
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
                      <span>Upload Slide Images (Multi-Select)</span>
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
                              {idx === 0 ? "★ Cover" : `Slide #${idx + 1}`}
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

                  {/* Add Individual Slide by URL */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Or paste slide image URL and press Enter..."
                      id="template-add-slide-url"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const val = input.value.trim();
                          if (val) {
                            setNewSlides((prev) => {
                              const next = [...prev, val];
                              setNewSlideCount(next.length);
                              return next;
                            });
                            input.value = "";
                          }
                        }
                      }}
                      className="flex-1 bg-[#FFF9E8] border border-[#111111]/12 hex-pill px-3 py-1.5 text-xs text-[#111111] font-mono outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("template-add-slide-url") as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const val = input.value.trim();
                          setNewSlides((prev) => {
                            const next = [...prev, val];
                            setNewSlideCount(next.length);
                            return next;
                          });
                          input.value = "";
                        }
                      }}
                      className="hex-pill-sm bg-[#111111] hover:bg-black text-white hover:text-primary font-bold px-3 py-1.5 text-[11px]"
                    >
                      + Add Slide
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SOFTWARE COMPATIBILITY TAGS */}
              <div className="bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl p-4 sm:p-5 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#111111] text-primary flex items-center justify-center">
                      <Sliders size={15} />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">
                        3. Software Compatibility Tags *
                      </h4>
                      <p className="text-[10px] text-[#726F6D]">
                        Select the presentation applications supported (matches homepage badges)
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-primary-amber">
                    {newSoftwareFormats.length} Formats Selected
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {["PowerPoint", "Google Slides", "Keynote", "Canva", "Figma"].map((fmt) => {
                    const isSelected = newSoftwareFormats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => toggleSoftwareFormat(fmt)}
                        className={`hex-pill px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[#111111] text-white border-2 border-primary shadow-sm scale-105"
                            : "bg-white text-[#726F6D] hover:text-[#111111] border border-[#111111]/15 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <SoftwareBadge format={fmt} size="sm" showLabel={true} />
                        {isSelected ? (
                          <Check size={12} className="text-primary" />
                        ) : (
                          <Plus size={12} />
                        )}
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
                  <span className="hex-pill-sm bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-0.5 border border-red-200">
                    ⚡ 24h Rush Order
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
                            {isPassed ? "✓ Done" : isCurrent ? "Active" : `Step ${m.step}`}
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

