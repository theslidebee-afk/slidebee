import { useState, type TouchEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, FileText } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { d1 } from "../lib/d1";
import { sendTemplatePurchaseReceiptEmail } from "../lib/email";
import { getTemplateDeliverableUrl, triggerPptxDownload } from "../lib/templates";
import { useTemplateCheckout } from "../modules/StudioStoreClient";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  TemplateSlideViewer,
  TemplateActionPanel,
  SimilarTemplatesGrid,
  useTemplateData,
} from "../features/templates";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();

  const {
    template,
    loading,
    similarTemplates,
    showStars,
    showDownloads,
    client,
    clientSub,
    userProfile,
    clientPurchases,
    setClientPurchases,
    freeDownloadsToday,
    setFreeDownloadsToday,
    refreshClientData,
  } = useTemplateData(id);

  usePageSEO({
    title: template ? `${template.title} | SlideBee PowerPoint Template` : "Presentation Template | SlideBee",
    description:
      template?.description ||
      "100% editable corporate PowerPoint deck with vector layouts, master slides, and custom typography.",
  });

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [creditNotice, setCreditNotice] = useState<string | null>(null);

  // Mobile swipe gesture state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 45;

  const {
    isProcessing,
    isPurchased,
    purchasedClientEmail,
    deliverableUrl,
    error: checkoutError,
    executeProTemplateDownload,
    executeRazorpayCheckout,
  } = useTemplateCheckout();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-[#726F6D] uppercase tracking-wider">
            Loading Presentation Deck...
          </p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center pt-24 pb-20">
        <div className="text-center hex-card bg-white p-8 max-w-md mx-auto border-2 border-primary/40">
          <FileText size={40} className="mx-auto text-primary-amber mb-3" />
          <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-2">
            Presentation Deck Not Found
          </h2>
          <p className="text-xs text-[#726F6D] mb-6">
            The presentation master deck you are looking for might have been moved or archived.
          </p>
          <Link to="/#templates" className="hex-pill bg-primary font-black px-6 py-2.5 text-xs text-[#111111]">
            Back to Templates Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const slides = template.slides && template.slides.length > 0 ? template.slides : [template.image_url];

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance && slides.length > 1) {
      setActiveSlideIdx((prev) => (prev + 1) % slides.length);
    } else if (distance < -minSwipeDistance && slides.length > 1) {
      setActiveSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isPro = Boolean(
    (clientSub &&
      clientSub.status === "active" &&
      (!clientSub.current_period_end || new Date(clientSub.current_period_end) > new Date())) ||
      (userProfile?.tier && ["monthly", "yearly", "lifetime"].includes(userProfile.tier)) ||
      (client?.tier && ["monthly", "yearly", "lifetime"].includes(client.tier))
  );

  const isMonthlyTier =
    clientSub?.plan_name?.toLowerCase().includes("monthly") ||
    userProfile?.tier === "monthly" ||
    client?.tier === "monthly";

  const quotaLimit = Number(
    clientSub?.slides_limit
      ? isMonthlyTier && Number(clientSub.slides_limit) < 30
        ? 30
        : Number(clientSub.slides_limit)
      : isMonthlyTier
      ? 30
      : userProfile?.tier === "yearly"
      ? 360
      : userProfile?.tier === "lifetime"
      ? 45
      : 30
  );

  const quotaUsed = Number(
    clientSub?.slides_used !== undefined && clientSub?.slides_used !== null
      ? clientSub.slides_used
      : userProfile?.downloads_this_month || 0
  );

  const quotaRemaining = isPro ? Math.max(0, quotaLimit - quotaUsed) : 0;

  const alreadyOwned = Boolean(
    clientPurchases.some(
      (item: any) =>
        String(item.id) === String(template?.id) ||
        (item.code &&
          template?.code &&
          String(item.code).toLowerCase() === String(template.code).toLowerCase())
    )
  );

  const handleProDownload = async () => {
    setCreditNotice(null);
    if (!client) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname));
      return;
    }
    if (!template) return;

    const result = await executeProTemplateDownload(template, client.email);
    if (!result.success && result.message) {
      setCreditNotice(result.message);
    } else if (result.success) {
      refreshClientData();
    }
  };

  const handleDirectFreeDownload = async () => {
    setCreditNotice(null);
    if (!client) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname));
      return;
    }

    if (template?.is_premium) {
      setCreditNotice(
        "This is a Premium Template. Free accounts can only download templates from the Free Community Library. Upgrade to Pro or purchase a commercial license."
      );
      return;
    }

    if (!isPro && freeDownloadsToday >= 3) {
      setCreditNotice(
        "Daily Free Limit Reached (3/3). Free tier accounts can download up to 3 community decks per day. Upgrade to Pro for unlimited downloads."
      );
      return;
    }

    const deliverable = getTemplateDeliverableUrl(template);
    if (!deliverable) {
      setCreditNotice(
        "The master PowerPoint file (.pptx) for this deck is currently being provisioned by the studio. Please contact support@theslidebee.com or check back shortly."
      );
      return;
    }

    triggerPptxDownload(deliverable, template?.file_name || `${(template as any)?.slug || template?.code || "slidebee-template"}.pptx`);

    sendTemplatePurchaseReceiptEmail({
      clientEmail: client.email,
      clientName: client.name || client.email.split("@")[0],
      templateTitle: template?.title || "SlideBee Presentation Template",
      templateCode: template?.code || template?.id || "SLIDEBEE-FREE",
      downloadUrl: deliverable.startsWith("http") ? deliverable : `https://theslidebee.com${deliverable}`,
      amountPaid: 0,
      currency: "INR",
    }).catch((err) => console.warn("Free template receipt email notice:", err));

    if (template) {
      const newItem = {
        id: template.id,
        code: template.code || template.id,
        title: template.title,
        template_title: template.title,
        download_url: deliverable,
        date: new Date().toISOString(),
        type: "free",
        slide_count: (template as any).slide_count || 24,
        file_size: (template as any).file_size || "18 MB",
      };
      const updatedPurchases = [
        ...clientPurchases.filter((p: any) => String(p.id) !== String(template.id)),
        newItem,
      ];
      setClientPurchases(updatedPurchases);

      const today = new Date().toISOString().split("T")[0];
      const nextCount = (freeDownloadsToday || 0) + 1;
      setFreeDownloadsToday(nextCount);

      try {
        await d1.from("profiles")
          .update({
            purchased_items: updatedPurchases,
            downloads_today: nextCount,
            last_download_date: today,
          })
          .eq("email", client.email);
      } catch (err) {
        console.warn("Failed to persist free download to profile:", err);
      }
    }

    setCreditNotice(
      `Free community template download initiated! (${(freeDownloadsToday || 0) + 1}/3 used today). A copy has been dispatched to your email.`
    );
  };

  const handleInstantDownload = async () => {
    setCreditNotice(null);
    if (!client) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname));
      return;
    }

    await executeRazorpayCheckout(
      template,
      currency === "USD" ? "USD" : "INR",
      client.email,
      client.name
    );
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
          <TemplateSlideViewer
            template={template}
            slides={slides}
            activeSlideIdx={activeSlideIdx}
            setActiveSlideIdx={setActiveSlideIdx}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
          />

          {/* Right Column: Details & Actions */}
          <TemplateActionPanel
            template={template}
            showStars={showStars}
            showDownloads={showDownloads}
            isPro={isPro}
            quotaLimit={quotaLimit}
            quotaUsed={quotaUsed}
            quotaRemaining={quotaRemaining}
            formatPrice={formatPrice}
            currency={currency}
            creditNotice={creditNotice}
            checkoutError={checkoutError}
            isPurchased={isPurchased}
            alreadyOwned={alreadyOwned}
            purchasedClientEmail={purchasedClientEmail}
            client={client}
            deliverableUrl={deliverableUrl}
            isProcessing={isProcessing}
            handleProDownload={handleProDownload}
            handleInstantDownload={handleInstantDownload}
            handleDirectFreeDownload={handleDirectFreeDownload}
            freeDownloadsToday={freeDownloadsToday}
          />
        </div>

        {/* Similar Presentation Templates Section */}
        <SimilarTemplatesGrid
          similarTemplates={similarTemplates}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
}
