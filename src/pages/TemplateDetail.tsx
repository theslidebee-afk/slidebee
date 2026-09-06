import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Mail,
  ShieldCheck,
  Star, 
  Sparkles, 
  CheckCircle2
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import SoftwareBadge from "../components/SoftwareIcons";
import { supabase } from "../lib/supabase";
import { openRazorpayCheckout } from "../lib/razorpay";
import { sendTemplatePurchaseReceiptEmail } from "../lib/email";
import { templateCatalog, type TemplateItem } from "./Templates";

// Fallback slide sets for catalog items if not explicitly provided
function getTemplateSlides(item: TemplateItem): string[] {
  if ((item as any).slides && (item as any).slides.length > 0) {
    return (item as any).slides;
  }
  const match = item.image.match(/\/portfolio\/([a-zA-Z0-9_]+)_(\d+)\.png/);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10);
    const num2 = (num % 16) + 1;
    const num3 = ((num + 1) % 16) + 1;
    const num4 = ((num + 2) % 16) + 1;
    const num5 = ((num + 3) % 16) + 1;
    return [
      `/portfolio/${prefix}_${num}.png`,
      `/portfolio/${prefix}_${num2}.png`,
      `/portfolio/${prefix}_${num3}.png`,
      `/portfolio/${prefix}_${num4}.png`,
      `/portfolio/${prefix}_${num5}.png`,
    ];
  }
  return [item.image, item.image, item.image];
}

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();

  const [template, setTemplate] = useState<TemplateItem | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasedClientEmail, setPurchasedClientEmail] = useState("");
  const [purchasedDeliverableUrl, setPurchasedDeliverableUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailResentSuccess, setEmailResentSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);

    // 1. Try finding in default static catalog
    const foundStatic = templateCatalog.find(
      (t) => t.id.toLowerCase() === id?.toLowerCase() || (t as any).code?.toLowerCase() === id?.toLowerCase()
    );

    if (foundStatic) {
      setTemplate(foundStatic);
      setLoading(false);
      return;
    }

    // 2. Try finding from Supabase DB
    supabase
      .from("templates")
      .select("*")
      .or(`id.eq.${id},code.eq.${id},slug.eq.${id}`)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          setTemplate({
            id: data.id,
            title: data.title,
            category: data.category,
            price: data.price_inr || 499,
            originalPrice: data.original_price_inr || (data.price_inr ? data.price_inr * 2 : 999),
            image: data.thumbnail_url || "/portfolio/case_study_a_1.png",
            slidesCount: data.slide_count || 25,
            rating: 4.9,
            downloads: 120,
            formats: Array.isArray(data.formats) && data.formats.length > 0 ? data.formats : ["PowerPoint", "Google Slides", "Canva"],
            description: data.description || "Executive presentation deck tailored for high-stakes business meetings.",
            features: [
              `${data.slide_count || 25}+ High-Impact Slides`,
              "16:9 Widescreen Layout",
              "Fully Editable Vector Elements",
              "Free Typography Included"
            ],
            ...(data.code ? { code: data.code } : {}),
            ...(data.slides ? { slides: data.slides } : {}),
            ...(data.download_url ? { download_url: data.download_url } : {})
          } as TemplateItem);
        } else {
          // Fallback to first static template if not found
          setTemplate(templateCatalog[0]);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-[#726F6D] uppercase tracking-wider">Loading Template Details...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24 pb-20">
        <div className="text-center hex-card bg-white p-8 max-w-md mx-auto border-2 border-primary/40">
          <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-2">Template Not Found</h2>
          <p className="text-xs text-[#726F6D] mb-6">The template you are looking for might have been moved or archived.</p>
          <Link to="/templates" className="hex-pill bg-primary font-black px-6 py-2.5 text-xs text-[#111111]">
            Back to Templates Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const slides = getTemplateSlides(template);
  const currentSlideImg = slides[activeSlideIdx] || template.image;
  const templateCode = (template as any).code || `SLD-${template.id.slice(0, 4).toUpperCase()}`;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResendEmail = async () => {
    if (!purchasedClientEmail || !template) return;
    setIsResendingEmail(true);
    try {
      const deliverable = purchasedDeliverableUrl || (template as any).download_url || (template as any).downloadUrl || template.image;
      const priceNum = currency === "USD" ? ((template as any).priceUSD || template.price) : ((template as any).priceINR || template.price);
      await sendTemplatePurchaseReceiptEmail({
        clientEmail: purchasedClientEmail,
        clientName: purchasedClientEmail.split("@")[0],
        templateTitle: template.title,
        templateCode,
        downloadUrl: deliverable.startsWith("http") ? deliverable : `https://theslidebee.com${deliverable}`,
        amountPaid: priceNum,
        currency: currency === "USD" ? "USD" : "INR"
      });
      setEmailResentSuccess(true);
      setTimeout(() => setEmailResentSuccess(false), 4000);
    } catch (e) {
      console.warn("Resend email notice:", e);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleInstantDownload = async () => {
    setIsProcessingPayment(true);
    const clientUser = JSON.parse(localStorage.getItem("slidebee_client_user") || "{}");
    const clientEmail = clientUser.email || prompt("Enter your email address to receive download receipt and license:") || "client@theslidebee.com";
    const clientName = clientUser.user_metadata?.full_name || clientEmail.split("@")[0];

    const priceNum = currency === "USD" ? ((template as any).priceUSD || template.price) : ((template as any).priceINR || template.price);

    await openRazorpayCheckout({
      amount: priceNum,
      currency: currency === "USD" ? "USD" : "INR",
      title: template.title,
      description: `Commercial Template License — ${templateCode}`,
      prefill: {
        email: clientEmail,
        name: clientName
      },
      onSuccess: async (payment) => {
        setIsProcessingPayment(false);
        setIsPurchased(true);
        setPurchasedClientEmail(clientEmail);

        const deliverable = (template as any).download_url || (template as any).downloadUrl || template.image;
        setPurchasedDeliverableUrl(deliverable);

        // Record in Supabase orders & update user's profile record
        try {
          await supabase.from("orders").insert([
            {
              order_reference: `TPL-${templateCode}-${Date.now().toString().slice(-4)}`,
              service_type: `Template Purchase: ${template.title}`,
              slide_count: `${template.slidesCount || 30}`,
              timeline: "Instant Delivery via Email",
              formats: template.formats,
              project_brief: `Payment ID: ${payment.razorpay_payment_id}. Deliverable dispatched securely to: ${clientEmail}`,
              full_name: clientName,
              email: clientEmail,
              status: "completed"
            }
          ]);

          // Sync into client's public.profiles record (purchased_items, usage_history, credits)
          const { data: prof } = await supabase
            .from("profiles")
            .select("purchased_items, usage_history, credits_used, credits_balance")
            .eq("email", clientEmail)
            .maybeSingle();

          const newItem = {
            id: template.id || templateCode,
            slug: templateCode,
            title: template.title,
            category: template.category || "Templates",
            slides_count: template.slidesCount || 30,
            formats: template.formats || ["PPT", "Slides"],
            amount: priceNum,
            currency: currency === "USD" ? "USD" : "INR",
            download_url: deliverable,
            purchased_at: new Date().toISOString()
          };

          const newUsage = {
            item_title: template.title,
            credits_used: 1,
            action: "Template Purchase & PPTX License",
            date: new Date().toISOString()
          };

          if (prof) {
            const currentItems = Array.isArray(prof.purchased_items) ? prof.purchased_items : [];
            const currentUsage = Array.isArray(prof.usage_history) ? prof.usage_history : [];
            await supabase
              .from("profiles")
              .update({
                purchased_items: [newItem, ...currentItems],
                usage_history: [newUsage, ...currentUsage],
                credits_used: (prof.credits_used || 0) + 1,
                credits_balance: Math.max(0, (prof.credits_balance || 10) - 1)
              })
              .eq("email", clientEmail);
          } else {
            await supabase.from("profiles").upsert([
              {
                email: clientEmail,
                full_name: clientName,
                role: "client",
                credits_total: 10,
                credits_used: 1,
                credits_balance: 9,
                purchased_items: [newItem],
                usage_history: [newUsage]
              }
            ], { onConflict: "email" });
          }
        } catch (e) {
          console.warn("Order record notice:", e);
        }

        // Send confirmation receipt & master files exclusively via Zoho Mail (design@theslidebee.com)
        sendTemplatePurchaseReceiptEmail({
          clientEmail,
          clientName,
          templateTitle: template.title,
          templateCode,
          downloadUrl: deliverable.startsWith("http") ? deliverable : `https://theslidebee.com${deliverable}`,
          amountPaid: priceNum,
          currency: currency === "USD" ? "USD" : "INR"
        }).catch(err => console.warn("Receipt email notice:", err));
      },
      onFailure: (err) => {
        setIsProcessingPayment(false);
        console.warn("Payment error:", err);
      },
      onDismiss: () => {
        setIsProcessingPayment(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate("/templates")}
            className="hex-pill-sm inline-flex items-center gap-1.5 bg-white border border-primary/40 px-3.5 py-1.5 text-xs font-bold text-[#111111] hover:border-primary transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Templates
          </button>

          <div className="flex items-center gap-2">
            {/* Template Code SKU */}
            <div className="hex-pill-sm bg-[#111111] text-primary border border-primary/50 text-[11px] font-black px-3.5 py-1 shadow-sm tracking-wider">
              CODE: {templateCode}
            </div>

            <button
              onClick={handleShare}
              className="hex-pill-sm bg-white border border-primary/40 text-[#111111] hover:border-primary text-xs font-bold px-3 py-1 shadow-sm cursor-pointer"
            >
              {isCopied ? "✓ Link Copied" : "Share"}
            </button>
          </div>
        </div>

        {/* Main 2-Column Template Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Interactive Multi-Slide Previewer (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Active Slide Display */}
            <div className="hex-card-dark bg-[#111111] border-2 border-primary/50 overflow-hidden shadow-2xl relative aspect-[16/10] flex items-center justify-center group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlideIdx}
                  src={currentSlideImg}
                  alt={`${template.title} - Slide ${activeSlideIdx + 1}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain select-none"
                />
              </AnimatePresence>

              {/* Slide Number & Code Overlay */}
              <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/90 text-primary border border-primary/40 text-[10px] font-black px-3 py-1 backdrop-blur-md shadow flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Slide {activeSlideIdx + 1} of {slides.length} • {templateCode}
              </div>

              {/* Prev / Next Slide Navigation Controls */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveSlideIdx((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 hex-pill bg-black/70 hover:bg-black text-white p-2.5 backdrop-blur-sm transition-all shadow-md opacity-80 hover:opacity-100 z-10 cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlideIdx((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hex-pill bg-black/70 hover:bg-black text-white p-2.5 backdrop-blur-sm transition-all shadow-md opacity-80 hover:opacity-100 z-10 cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ArrowRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Filmstrip Thumbnail Strip with Slide Numbers */}
            {slides.length > 1 && (
              <div className="bg-white border-2 border-primary/40 p-3 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#726F6D]">
                    Click to Inspect Slide ({slides.length} Preview Layouts)
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Use ← → keys to browse</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlideIdx(idx)}
                      className={`relative rounded-xl overflow-hidden text-left border transition-all cursor-pointer ${
                        activeSlideIdx === idx
                          ? "border-primary ring-2 ring-primary/40 shadow-md bg-[#FFF9E8]"
                          : "border-primary/20 hover:border-primary/60 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="aspect-[16/10] bg-[#111111] overflow-hidden">
                        <img src={s} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-1 bg-white flex items-center justify-between">
                        <span className={`text-[9px] font-black ${
                          activeSlideIdx === idx ? "text-primary-amber" : "text-[#111111]"
                        }`}>
                          Slide #{idx + 1}
                        </span>
                        {idx === 0 && (
                          <span className="text-[8px] bg-primary/20 text-[#111111] font-extrabold px-1 rounded">
                            Cover
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Template Info, Pricing & Purchase CTAs (5 Columns) */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="hex-card-lg bg-white border-2 border-primary/40 p-6 sm:p-7 shadow-lg space-y-5">
              
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2">
                <span className="hex-pill-sm bg-[#FFF9E8] text-primary-amber border border-primary/30 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                  {template.category} • {template.slidesCount} Slides
                </span>
                <div className="flex items-center gap-1 text-xs font-extrabold text-[#111111]">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {template.rating} ({template.downloads}+ downloads)
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111111] leading-tight mb-2">
                  {template.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Price Display */}
              <div className="p-4 bg-[#FFF9E8] rounded-2xl border-2 border-primary/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">Single Commercial License</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
                      {formatPrice(template.price)}
                    </span>
                    {template.originalPrice && (
                      <span className="text-xs text-[#726F6D] line-through font-medium">
                        {formatPrice(template.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {template.formats.map((fmt) => (
                    <SoftwareBadge key={fmt} format={fmt} size="sm" showLabel={true} />
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {isPurchased ? (
                  <div className="bg-emerald-50 border-2 border-emerald-400/60 p-5 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <span>Order Confirmed & Deliverables Dispatched! 🎉</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      To protect master templates from automated scrapers and bots, files are delivered exclusively to verified purchasers. Your editable PowerPoint deck and perpetual license have been sent to:
                    </p>
                    <div className="bg-white border border-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-black text-[#111111] flex items-center justify-between shadow-xs">
                      <span className="truncate">{purchasedClientEmail || "your email inbox"}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded uppercase shrink-0">
                        Dispatched via Zoho
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Sent from <strong>design@theslidebee.com</strong>. Please check your inbox (and spam or promotions folder if not visible within 2 minutes).
                    </p>
                    <button
                      type="button"
                      disabled={isResendingEmail}
                      onClick={handleResendEmail}
                      className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      <Mail size={14} />
                      {isResendingEmail ? "Resending to Inbox..." : (emailResentSuccess ? "✓ Dispatched to Inbox Again!" : "Resend Files to My Email")}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleInstantDownload}
                      className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] cursor-pointer disabled:opacity-60"
                    >
                      <Mail size={16} />
                      {isProcessingPayment ? "Opening Checkout..." : `Instant Delivery via Email (${formatPrice(template.price)})`}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726F6D] font-bold text-center">
                      <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                      <span>Direct Inbox Delivery • Protected from Bot Scraping</span>
                    </div>
                  </>
                )}

                <Link
                  to={`/ordernow?ref=${encodeURIComponent(template.title)}&code=${encodeURIComponent(templateCode)}`}
                  className="hex-pill w-full bg-[#111111] hover:bg-black text-white hover:text-primary font-extrabold py-3 text-xs transition-all flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <Sparkles size={14} className="text-primary" /> Have Studio Customize This Deck ➔
                </Link>
              </div>

              {/* What's Included Checklist */}
              <div className="pt-4 border-t border-[#111111]/8 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]">
                  What Is Included in {templateCode}:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {template.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#111111] font-medium">
                      <CheckCircle2 size={14} className="text-primary-amber shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="pt-4 border-t border-[#111111]/8 text-[11px] space-y-1.5 text-[#726F6D]">
                <div className="flex justify-between">
                  <span>Template Code / SKU:</span>
                  <strong className="text-[#111111]">{templateCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <strong className="text-[#111111]">16:9 Widescreen (1920x1080)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Software Compatibility:</span>
                  <strong className="text-[#111111]">PowerPoint, Google Slides, Keynote</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fonts Used:</span>
                  <strong className="text-[#111111]">Free Google Fonts (included)</strong>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
