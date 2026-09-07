import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  FileText,
  Download,
  AlertCircle,
  Lock
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { supabase } from "../lib/supabase";
import { normalizeR2Url } from "../lib/r2";
import { useTemplateCheckout, type StoreTemplate } from "../modules/StudioStoreClient";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();

  const [template, setTemplate] = useState<StoreTemplate | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [creditNotice, setCreditNotice] = useState<string | null>(null);

  // Similar templates state
  const [similarTemplates, setSimilarTemplates] = useState<StoreTemplate[]>([]);

  // Admin toggles for star rating & downloads visibility
  const [showStars, setShowStars] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);

  // Deep Module: useTemplateCheckout
  const {
    isProcessing,
    isPurchased,
    purchasedClientEmail,
    deliverableUrl,
    error: checkoutError,
    executeCreditRedemption,
    executeRazorpayCheckout
  } = useTemplateCheckout();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);

    // 1. Fetch site_config metrics toggle
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "show_template_metrics")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setShowStars(Boolean(data.value.show_stars));
          setShowDownloads(Boolean(data.value.show_downloads));
        }
      });

    // 2. Fetch Template from Deep Module view or table
    supabase
      .from("v_storefront_catalog")
      .select("*")
      .or(`id.eq.${id},code.eq.${id}`)
      .maybeSingle()
      .then(({ data, error }) => {
        if (data && !error) {
          const coverImg = normalizeR2Url(data.thumbnail_url || data.image_url, "slides");
          const slideUrls = Array.isArray(data.slides) && data.slides.length > 0
            ? data.slides.map((s: string) => normalizeR2Url(s, "slides"))
            : [coverImg];
          const pptxUrl = data.download_url ? normalizeR2Url(data.download_url, "decks") : undefined;

          setTemplate({
            id: data.id,
            code: data.code || `SLD-${data.id.slice(0, 4).toUpperCase()}`,
            title: data.title,
            category: data.category || "Business",
            price_inr: Number(data.price_inr) || 499,
            price_usd: Number(data.price_usd) || 9,
            original_price_inr: Number(data.original_price_inr) || 999,
            image_url: coverImg,
            slides: slideUrls,
            slides_count: Number(data.slides_count || data.slide_count) || slideUrls.length || 30,
            rating: Number(data.rating) || 4.9,
            downloads: Number(data.downloads) || 120,
            download_url: pptxUrl,
            file_name: data.file_name || (pptxUrl ? pptxUrl.split("/").pop() || "Master_Deck.pptx" : "Master_Deck.pptx"),
            file_size: data.file_size || "4.5 MB",
            description: data.description || "Executive presentation deck tailored for high-stakes business meetings.",
            features: Array.isArray(data.features) && data.features.length > 0
              ? data.features
              : [
                  `${data.slides_count || 30}+ High-Impact Master Slides`,
                  "16:9 Ultra-Wide Presentation Format",
                  "100% Fully Editable Vector Elements",
                  "Commercial Royalty-Free License"
                ],
            is_credit_eligible: Boolean(data.is_credit_eligible),
            is_featured: Boolean(data.is_featured),
            is_published: true
          });
        } else {
          // Fallback to raw table
          supabase
            .from("templates")
            .select("*")
            .or(`id.eq.${id},code.eq.${id},slug.eq.${id}`)
            .maybeSingle()
            .then(({ data: rawData }) => {
              if (rawData) {
                const coverImg = normalizeR2Url(rawData.thumbnail_url || rawData.image_url, "slides");
                const slideUrls = Array.isArray(rawData.slides) && rawData.slides.length > 0
                  ? rawData.slides.map((s: string) => normalizeR2Url(s, "slides"))
                  : [coverImg];
                const pptxUrl = rawData.download_url ? normalizeR2Url(rawData.download_url, "decks") : undefined;

                setTemplate({
                  id: rawData.id,
                  code: rawData.code || `SLD-${rawData.id.slice(0, 4).toUpperCase()}`,
                  title: rawData.title,
                  category: rawData.category || "Business",
                  price_inr: Number(rawData.price_inr) || 499,
                  price_usd: Number(rawData.price_usd) || 9,
                  original_price_inr: Number(rawData.original_price_inr) || 999,
                  image_url: coverImg,
                  slides: slideUrls,
                  slides_count: Number(rawData.slides_count || rawData.slide_count) || slideUrls.length || 30,
                  rating: Number(rawData.rating) || 4.9,
                  downloads: Number(rawData.downloads) || 120,
                  download_url: pptxUrl,
                  file_name: rawData.file_name || (pptxUrl ? pptxUrl.split("/").pop() || "Master_Deck.pptx" : "Master_Deck.pptx"),
                  file_size: rawData.file_size || "4.5 MB",
                  description: rawData.description || "Executive presentation deck layout.",
                  features: Array.isArray(rawData.features) ? rawData.features : ["30+ High-Impact Slides"],
                  is_credit_eligible: Boolean(rawData.is_credit_eligible),
                  is_featured: Boolean(rawData.is_featured),
                  is_published: true
                });
              }
            });
        }
        setLoading(false);
      });
  }, [id]);

  // 2. Fetch similar / related templates from v_storefront_catalog
  useEffect(() => {
    if (!template?.id) return;
    supabase
      .from("v_storefront_catalog")
      .select("*")
      .neq("id", template.id)
      .limit(4)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped: StoreTemplate[] = data.map((t: any) => {
            const coverImg = normalizeR2Url(t.thumbnail_url || t.image_url, "slides");
            const slideUrls = Array.isArray(t.slides) && t.slides.length > 0
              ? t.slides.map((s: string) => normalizeR2Url(s, "slides"))
              : [coverImg];
            const pptxUrl = t.download_url ? normalizeR2Url(t.download_url, "decks") : undefined;

            return {
              id: t.id,
              code: t.code || `SLD-${t.id.slice(0, 4).toUpperCase()}`,
              title: t.title,
              category: t.category || "Business",
              price_inr: Number(t.price_inr) || 499,
              price_usd: Number(t.price_usd) || 9,
              original_price_inr: Number(t.original_price_inr) || 999,
              image_url: coverImg,
              slides: slideUrls,
              slides_count: Number(t.slides_count || t.slide_count) || slideUrls.length || 30,
              rating: Number(t.rating) || 4.9,
              downloads: Number(t.downloads) || 120,
              download_url: pptxUrl,
              file_name: t.file_name || (pptxUrl ? pptxUrl.split("/").pop() || "Master_Deck.pptx" : "Master_Deck.pptx"),
              file_size: t.file_size || "4.5 MB",
              description: t.description || "Executive presentation deck layout.",
              features: Array.isArray(t.features) ? t.features : ["30+ High-Impact Slides"],
              is_credit_eligible: Boolean(t.is_credit_eligible),
              is_featured: Boolean(t.is_featured),
              is_published: true
            };
          });
          setSimilarTemplates(mapped);
        }
      });
  }, [template?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-[#726F6D] uppercase tracking-wider">Loading Presentation Deck...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24 pb-20">
        <div className="text-center hex-card bg-white p-8 max-w-md mx-auto border-2 border-primary/40">
          <FileText size={40} className="mx-auto text-primary-amber mb-3" />
          <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-2">Presentation Deck Not Found</h2>
          <p className="text-xs text-[#726F6D] mb-6">The presentation master deck you are looking for might have been moved or archived.</p>
          <Link to="/templates" className="hex-pill bg-primary font-black px-6 py-2.5 text-xs text-[#111111]">
            Back to Templates Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const slides = template.slides && template.slides.length > 0 ? template.slides : [template.image_url];
  const currentSlideImg = slides[activeSlideIdx] || template.image_url;
  const templateCode = template.code;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getClientInfo = () => {
    const local = localStorage.getItem("slidebee_client_user");
    if (local) {
      try {
        const u = JSON.parse(local);
        return { email: u.email, name: u.user_metadata?.full_name || u.email.split("@")[0] };
      } catch (e) {}
    }
    return null;
  };

  // Redeem with Starter Credits
  const handleRedeemWithCredits = async () => {
    setCreditNotice(null);
    const client = getClientInfo();
    if (!client) {
      // Direct user to login/signup where they get 5 starter credits
      navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname));
      return;
    }

    const result = await executeCreditRedemption(template, client.email);
    if (!result.success && result.message) {
      setCreditNotice(result.message);
    }
  };

  // Standard Instant Purchase via Razorpay (Requires Login)
  const handleInstantDownload = async () => {
    setCreditNotice(null);
    const client = getClientInfo();

    if (!client) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname));
      return;
    }

    await executeRazorpayCheckout(template, currency === "USD" ? "USD" : "INR", client.email, client.name);
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
            <div className="hex-pill-sm bg-[#111111] text-primary border border-primary/50 text-[11px] font-black px-3.5 py-1 shadow-sm tracking-wider">
              CODE: {templateCode}
            </div>

            <button
              onClick={handleShare}
              className="hex-pill-sm bg-white border border-primary/40 text-[#111111] hover:border-primary text-xs font-bold px-3 py-1 shadow-sm cursor-pointer inline-flex items-center gap-1"
            >
              {isCopied ? (
                <>
                  <Check size={11} className="text-emerald-600" /> Link Copied
                </>
              ) : (
                "Share"
              )}
            </button>
          </div>
        </div>

        {/* Main 2-Column Template Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Left Column: Interactive Full HD Multi-Slide Previewer */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="hex-card-dark bg-[#FFF9E8] border-2 border-primary/50 overflow-hidden shadow-2xl relative w-full flex items-center justify-center group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlideIdx}
                  src={currentSlideImg}
                  alt={`${template.title} - Slide ${activeSlideIdx + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full h-auto block select-none rounded-xl"
                />
              </AnimatePresence>

              {/* Prev / Next Slide Navigation Arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveSlideIdx((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111]/85 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-70 hover:opacity-100 hover:scale-105"
                    title="Previous Slide"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlideIdx((prev) => (prev + 1) % slides.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111]/85 hover:bg-[#111111] text-white hover:text-primary border border-primary/40 flex items-center justify-center transition-all shadow-lg cursor-pointer z-10 opacity-70 hover:opacity-100 hover:scale-105"
                    title="Next Slide"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <div className="hex-pill-sm absolute top-3 left-3 bg-[#111111]/90 text-primary border border-primary/40 text-[10px] font-black px-3 py-1 backdrop-blur-md shadow flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Slide {activeSlideIdx + 1} of {slides.length} • {templateCode}
              </div>

              {template.is_credit_eligible && (
                <div className="hex-pill-sm absolute top-3 right-3 bg-primary text-[#111111] font-black text-[10px] px-3 py-1 shadow-md flex items-center gap-1 z-10 border border-[#111111]/20">
                  <Sparkles size={11} /> 5 Free Credits Tag
                </div>
              )}
            </div>

            {/* Slide Navigation Thumbnails */}
            {slides.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIdx(idx)}
                    className={`relative w-28 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-[#FFF9E8] ${
                      activeSlideIdx === idx
                        ? "border-primary shadow-md scale-105"
                        : "border-[#111111]/15 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={s} alt={`Slide ${idx + 1}`} className="w-full h-auto block object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-5 space-y-5">
            <div className="hex-card-lg bg-white border-2 border-primary/40 p-6 sm:p-7 shadow-lg space-y-5">
              
              <div className="flex items-center justify-between gap-2">
                <span className="hex-pill-sm bg-[#FFF9E8] text-primary-amber border border-primary/30 text-[10px] font-black px-3 py-1 uppercase tracking-wider">
                  {template.category} • {template.slides_count} Master Slides
                </span>

                {showStars && template.rating && (
                  <div className="flex items-center gap-1 text-xs font-extrabold text-[#111111]">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {template.rating}
                    {showDownloads && template.downloads ? ` (${template.downloads}+ downloads)` : ""}
                  </div>
                )}
              </div>

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
                  <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">
                    Perpetual Commercial License
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
                      {formatPrice(currency === "USD" ? template.price_usd : template.price_inr)}
                    </span>
                    {template.original_price_inr && (
                      <span className="text-xs text-[#726F6D] line-through font-medium">
                        {formatPrice(template.original_price_inr)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-primary/50 px-3 py-1.5 rounded-xl text-xs font-black text-[#111111]">
                  <FileText size={15} className="text-primary-amber" />
                  <span>Master PowerPoint (.pptx)</span>
                </div>
              </div>

              {/* Notice / Feedback Banner */}
              {creditNotice && (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-900 font-medium">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{creditNotice}</span>
                </div>
              )}

              {checkoutError && (
                <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-900 font-medium">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Purchase & Credit Action Buttons */}
              <div className="space-y-3 pt-2">
                {isPurchased ? (
                  <div className="bg-emerald-50 border-2 border-emerald-400/60 p-5 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <span>Order Confirmed & Deliverables Ready</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      Your editable Master PowerPoint presentation (.pptx) has been dispatched to:
                    </p>
                    <div className="bg-white border border-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-black text-[#111111] flex items-center justify-between shadow-xs">
                      <span className="truncate">{purchasedClientEmail}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded uppercase shrink-0">
                        Direct Deliverable
                      </span>
                    </div>

                    {deliverableUrl && (
                      <a
                        href={deliverableUrl}
                        download={template.file_name || `${template.code}_Master.pptx`}
                        target="_blank"
                        rel="noreferrer"
                        className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
                      >
                        <Download size={14} /> Download Master PowerPoint (.pptx)
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Free Starter Credit Claim Button if Template is Credit Eligible */}
                    {template.is_credit_eligible ? (
                      <div className="p-4 bg-[#FFFDF5] border-2 border-primary rounded-2xl space-y-2.5 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-black text-[#111111]">
                          <Sparkles size={15} className="text-primary-amber" />
                          <span>Design Credits Eligible Template</span>
                        </div>
                        <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed">
                          Registered clients can claim this master presentation for free using their 5 starter design credits.
                        </p>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={handleRedeemWithCredits}
                          className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3 text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                        >
                          <Sparkles size={15} />
                          {isProcessing ? "Redeeming Credits..." : "Claim with 5 Free Starter Credits"}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-[#726F6D] font-medium flex items-center justify-between gap-2">
                        <span>Premium Master Deck (Not in Free Credits Library)</span>
                        <Link to="/templates?freeCredits=true" className="text-primary-amber font-bold underline shrink-0">
                          View Free Library
                        </Link>
                      </div>
                    )}

                    {/* Commercial Purchase Button (Requires Login) */}
                    {!getClientInfo() ? (
                      <button
                        type="button"
                        onClick={() => navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname))}
                        className="hex-pill w-full bg-[#111111] hover:bg-black text-white hover:text-primary font-black py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <Lock size={15} className="text-primary-amber" />
                        Sign In to Buy Master PPTX ({formatPrice(currency === "USD" ? template.price_usd : template.price_inr)})
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleInstantDownload}
                        className="hex-pill w-full bg-[#111111] hover:bg-black text-white hover:text-primary font-black py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                      >
                        <Download size={16} />
                        {isProcessing ? "Processing..." : `Instant Commercial PPTX License (${formatPrice(currency === "USD" ? template.price_usd : template.price_inr)})`}
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726F6D] font-bold text-center">
                      <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                      <span>Instant Automatic Download • Perpetual Commercial License</span>
                    </div>
                  </>
                )}

                <Link
                  to={`/ordernow?ref=${encodeURIComponent(template.title)}&code=${encodeURIComponent(templateCode)}`}
                  className="hex-pill w-full bg-white border border-primary/40 hover:bg-primary/10 text-[#111111] font-extrabold py-3 text-xs transition-all flex items-center justify-center gap-2 shadow-xs text-center"
                >
                  <Sparkles size={14} className="text-primary-amber" /> Have Studio Customize This Deck <ArrowRight size={13} />
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
                  <span>Deliverable Format:</span>
                  <strong className="text-[#111111]">Master PowerPoint Presentation (.pptx)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Free Credits Library:</span>
                  <strong className={template.is_credit_eligible ? "text-emerald-600 font-bold" : "text-[#111111]"}>
                    {template.is_credit_eligible ? "Yes (5 Starter Credits)" : "No (Premium Collection)"}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Aspect Ratio:</span>
                  <strong className="text-[#111111]">16:9 Full HD Widescreen (1920x1080)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Vector Geometry:</span>
                  <strong className="text-[#111111]">100% Fully Editable Shapes & Colors</strong>
                </div>
                <div className="flex justify-between">
                  <span>License:</span>
                  <strong className="text-[#111111]">Perpetual Commercial Royalty-Free</strong>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Similar Presentation Templates Section */}
        {similarTemplates.length > 0 && (
          <section className="pt-10 border-t border-[#111111]/10 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <span className="text-primary-amber text-xs font-black uppercase tracking-widest block mb-1">
                  Related Master Decks
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#111111]">
                  Similar Presentation Templates
                </h2>
              </div>
              <Link
                to="/templates"
                className="hex-pill-sm inline-flex items-center gap-1.5 bg-white border border-primary/40 px-3.5 py-1.5 text-xs font-bold text-[#111111] hover:border-primary transition-all shadow-sm"
              >
                Browse Full Library <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarTemplates.map((sim) => (
                <Link
                  key={sim.id}
                  to={`/template/${sim.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hex-card group bg-white border-2 border-primary/30 hover:border-primary overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between text-left"
                >
                  <div className="relative aspect-video overflow-hidden bg-black/5 border-b border-primary/20">
                    <img
                      src={sim.image_url}
                      alt={sim.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="hex-pill-sm absolute top-2.5 left-2.5 bg-[#111111]/85 backdrop-blur-md text-white border border-primary/30 text-[10px] font-extrabold px-2.5 py-0.5">
                      {sim.category}
                    </div>
                    <div className="hex-pill-sm absolute bottom-2.5 left-2.5 bg-[#111111]/90 backdrop-blur-md text-primary text-[10px] font-black px-2 py-0.5 shadow border border-primary/40">
                      {sim.code}
                    </div>
                    {sim.is_credit_eligible && (
                      <div className="hex-pill-sm absolute top-2.5 right-2.5 bg-primary text-[#111111] text-[9px] font-black px-2 py-0.5 shadow">
                        Free Tag
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 flex flex-col justify-between flex-grow">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="font-heading font-extrabold text-xs text-[#111111] group-hover:text-primary-amber transition-colors line-clamp-1">
                        {sim.title}
                      </h3>
                      <span className="text-xs font-heading font-black text-[#111111] ml-2 shrink-0">
                        {formatPrice(currency === "USD" ? sim.price_usd : sim.price_inr)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-primary/15 text-[10px] font-bold text-[#726F6D]">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                      <span>{sim.slides_count} Master Slides (.pptx)</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
