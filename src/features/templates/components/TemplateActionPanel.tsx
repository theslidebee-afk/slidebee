import { Link, useNavigate } from "react-router-dom";
import {
  Star,
  FileText,
  AlertCircle,
  CheckCircle2,
  Download,
  Crown,
  ShieldCheck,
  ShoppingBag,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { StoreTemplate } from "../../../modules/StudioStoreClient";
import { getTemplateDeliverableUrl } from "../../../lib/templates";
import { TemplateSpecs } from "./TemplateSpecs";

interface TemplateActionPanelProps {
  template: StoreTemplate;
  showStars: boolean;
  showDownloads: boolean;
  isPro: boolean;
  quotaLimit: number;
  quotaUsed: number;
  quotaRemaining: number;
  formatPrice: (inr: number, usd?: number) => string;
  currency: string;
  creditNotice: string | null;
  checkoutError: string | null;
  isPurchased: boolean;
  alreadyOwned: boolean;
  purchasedClientEmail: string | null;
  client: any;
  deliverableUrl: string | null;
  isProcessing: boolean;
  handleProDownload: () => Promise<void>;
  handleInstantDownload: () => Promise<void>;
  handleDirectFreeDownload: () => Promise<void>;
  freeDownloadsToday: number;
}

export function TemplateActionPanel({
  template,
  showStars,
  showDownloads,
  isPro,
  quotaLimit,
  quotaUsed,
  quotaRemaining,
  formatPrice,
  currency,
  creditNotice,
  checkoutError,
  isPurchased,
  alreadyOwned,
  purchasedClientEmail,
  client,
  deliverableUrl,
  isProcessing,
  handleProDownload,
  handleInstantDownload,
  handleDirectFreeDownload,
  freeDownloadsToday,
}: TemplateActionPanelProps) {
  const navigate = useNavigate();
  const templateCode = template.code;

  return (
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
        <div className="p-4 bg-[#FFF9E8] rounded-2xl border-2 border-primary/30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#726F6D] block">
              {!template.is_premium
                ? "Community Library • Free to Download"
                : isPro && quotaRemaining > 0
                ? "Included with Pro Membership"
                : isPro && quotaRemaining <= 0
                ? "Pro Quota Limit Reached (Commercial License Required)"
                : "Perpetual Commercial License"}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              {!template.is_premium ? (
                <span className="text-2xl sm:text-3xl font-heading font-black text-emerald-700">
                  100% Free
                </span>
              ) : isPro && quotaRemaining > 0 ? (
                <>
                  <span className="text-2xl sm:text-3xl font-heading font-black text-emerald-800">
                    Free with Pro
                  </span>
                  <span className="text-xs text-[#726F6D] line-through font-bold">
                    {formatPrice(template.price_inr, template.price_usd)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
                    {formatPrice(template.price_inr, template.price_usd)}
                  </span>
                  {template.original_price_inr && (
                    <span className="text-xs text-[#726F6D] line-through font-medium">
                      {formatPrice(template.original_price_inr, (template.price_usd || 5) * 2)}
                    </span>
                  )}
                </>
              )}
            </div>
            {!template.is_premium && (
              <span className="text-[11px] text-emerald-800 font-semibold block mt-1">
                Complimentary community deck. Free registered accounts get 3 daily downloads.
              </span>
            )}
            {template.is_premium && isPro && quotaRemaining > 0 && (
              <span className="text-[11px] text-[#726F6D] font-medium block mt-1">
                Deducts 1 template from your {quotaLimit} monthly quota ({quotaRemaining} downloads remaining)
              </span>
            )}
            {template.is_premium && isPro && quotaRemaining <= 0 && (
              <span className="text-[11px] text-amber-800 font-semibold block mt-1">
                Your {quotaLimit} templates for this month are used ({quotaUsed}/{quotaLimit}). Buy a standalone license to continue downloading immediately.
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-primary/50 px-3 py-1.5 rounded-xl text-xs font-black text-[#111111] shadow-xs">
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
          {!template.is_premium ? (
            <div className="p-4 bg-[#FFFDF5] border-2 border-emerald-500/40 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-[#111111]">
                  <Download size={15} className="text-emerald-600" />
                  <span>Free Community Library Deck</span>
                </div>
                <span className="hex-pill-sm bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 border border-emerald-300">
                  Free Account (3/Day)
                </span>
              </div>
              <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed">
                Free registered accounts receive 3 complimentary template downloads per day from our community library. No payment or Pro quota required.
              </p>
              {!client ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname))
                  }
                  className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-[1.01]"
                >
                  <Lock size={16} />
                  Login to get free templates for free (.pptx)
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isProcessing || freeDownloadsToday >= 3}
                  onClick={handleDirectFreeDownload}
                  className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Download size={16} />
                  {isProcessing
                    ? "Preparing Download..."
                    : freeDownloadsToday >= 3
                    ? "Daily Free Limit Reached (3/3 Used)"
                    : `Download Free Community Deck (.pptx) • ${Math.max(0, 3 - freeDownloadsToday)} Left Today`}
                </button>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726F6D] font-bold text-center">
                <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                <span>Free Community License • Single Project Use</span>
              </div>
            </div>
          ) : isPurchased || alreadyOwned ? (
            <div className="bg-emerald-50 border-2 border-emerald-400/60 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Master Presentation Deck Ready in Library</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                Your editable Master PowerPoint presentation (.pptx) is unlocked with perpetual commercial rights.
              </p>
              <div className="bg-white border border-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-black text-[#111111] flex items-center justify-between shadow-xs">
                <span className="truncate">{purchasedClientEmail || client?.email || "Account Library"}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded uppercase shrink-0">
                  {isPro ? "Pro Quota" : "Commercial License"}
                </span>
              </div>

              {(() => {
                const hasDeliverable = Boolean(deliverableUrl || getTemplateDeliverableUrl(template));
                const secureDownloadHref = `/api/download?id=${encodeURIComponent(template.id || template.code)}`;
                return hasDeliverable ? (
                  <a
                    href={secureDownloadHref}
                    download={template.file_name || `${template.code}_Master.pptx`}
                    className="hex-pill w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
                  >
                    <Download size={14} /> Download Master PowerPoint (.pptx)
                  </a>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl font-bold text-center">
                    Master PowerPoint deck (.pptx) is being provisioned by the studio.
                  </div>
                );
              })()}
            </div>
          ) : isPro ? (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-primary rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-[#111111]">
                  <Crown size={15} className="text-amber-500" />
                  <span>Pro VIP Membership Access</span>
                </div>
                <span className="hex-pill-sm bg-primary text-[#111111] text-[10px] font-black px-2 py-0.5 border border-[#111111]/20">
                  {quotaRemaining} of {quotaLimit} Left
                </span>
              </div>

              {quotaRemaining > 0 ? (
                <>
                  <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed">
                    This complete presentation deck is fully covered by your active Pro membership quota. Instant delivery with zero payment.
                  </p>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleProDownload}
                    className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-4 text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-60"
                  >
                    <Download size={17} />
                    {isProcessing
                      ? "Unlocking Presentation..."
                      : `Use Pro Quota • Download Master PPTX (${quotaRemaining} Left)`}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726F6D] font-bold text-center">
                    <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                    <span>Perpetual Commercial Rights • Deducts 1 from {quotaLimit}-Deck Monthly Quota</span>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-100/80 border border-amber-300 p-3.5 rounded-xl text-xs text-amber-900 font-medium space-y-1">
                    <p className="font-extrabold text-[#111111] text-xs">
                      Monthly Template Quota Reached ({quotaLimit}/{quotaLimit} Used)
                    </p>
                    <p className="text-[11px] text-[#726F6D] leading-relaxed">
                      You have consumed all {quotaLimit} included template downloads for your current billing cycle. Your quota resets on your next renewal. You can purchase a standalone commercial license for this template below to download it immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleInstantDownload}
                    className="hex-pill w-full bg-[#111111] hover:bg-black text-[#FCBF14] font-black py-4 text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer disabled:opacity-60"
                  >
                    <ShoppingBag size={17} className="text-[#FCBF14]" />
                    {isProcessing
                      ? "Opening Checkout..."
                      : `Buy Standalone Commercial License (${formatPrice(template.price_inr, template.price_usd)})`}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726F6D] font-bold text-center">
                    <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                    <span>Perpetual Commercial Rights • Instant Master PPTX Unlock</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!client ? (
                /* Unauthenticated Guest Flow for Premium Deck */
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/login?redirect=" + encodeURIComponent(window.location.hash || window.location.pathname))
                    }
                    className="hex-pill w-full bg-[#111111] hover:bg-black text-white hover:text-primary font-black py-4 text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer hover:scale-[1.01]"
                  >
                    <Lock size={16} className="text-[#FCBF14]" />
                    Sign In to Buy Master PPTX ({formatPrice(template.price_inr, template.price_usd)})
                  </button>

                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-primary/50 rounded-2xl flex items-center justify-between gap-3 text-left">
                    <div>
                      <span className="text-xs font-black text-[#111111] flex items-center gap-1.5">
                        <Crown size={14} className="text-amber-500 fill-amber-400" /> Need Multiple Presentations?
                      </span>
                      <span className="text-[11px] text-[#726F6D] font-medium block mt-0.5">
                        Get unlimited downloads with Pro VIP Membership ({currency === "INR" ? "₹399/mo" : "$5/mo"}).
                      </span>
                    </div>
                    <Link
                      to="/pricing"
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-3.5 py-1.5 text-xs whitespace-nowrap shrink-0 shadow-xs"
                    >
                      Join Pro
                    </Link>
                  </div>
                </div>
              ) : (
                /* Logged-In Client Flow for Premium Deck */
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleInstantDownload}
                    className="hex-pill w-full bg-[#111111] hover:bg-black text-white hover:text-primary font-black py-4 text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                  >
                    <ShoppingBag size={16} className="text-primary-amber" />
                    {isProcessing ? "Processing..." : `Buy Standalone Commercial License (${formatPrice(template.price_inr, template.price_usd)})`}
                  </button>

                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-primary/50 rounded-2xl flex items-center justify-between gap-3 text-left">
                    <div>
                      <span className="text-xs font-black text-[#111111] flex items-center gap-1.5">
                        <Crown size={14} className="text-amber-500 fill-amber-400" /> Unlock with Pro VIP Membership
                      </span>
                      <span className="text-[11px] text-[#726F6D] font-medium block mt-0.5">
                        Unlock this deck and our entire presentation library for {currency === "INR" ? "₹399/mo" : "$5/mo"}.
                      </span>
                    </div>
                    <Link
                      to="/pricing"
                      className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-3.5 py-1.5 text-xs whitespace-nowrap shrink-0 shadow-xs"
                    >
                      Upgrade
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#726F6D] font-bold text-center">
                <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                <span>Instant Automatic Download • Perpetual Commercial License</span>
              </div>
            </div>
          )}

          {/* Agency Custom Polish Bridge */}
          <div className="p-4 bg-[#FFF9E8] border border-primary/50 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber">
                Custom Studio Service
              </span>
              {isPro && (
                <span className="text-[10px] bg-primary/20 text-[#111111] font-black px-2 py-0.5 rounded-full">
                  15% Pro Member Discount
                </span>
              )}
            </div>
            <h4 className="text-xs font-black text-[#111111] leading-snug">
              Need this exact deck customized with your startup's content?
            </h4>
            <p className="text-[11px] text-[#726F6D] font-medium leading-relaxed">
              Have our executive designers customize this layout to your exact brand, copy, and financials in 24-48h.
            </p>
            <Link
              to={`/ordernow?ref=${encodeURIComponent(template.title)}&code=${encodeURIComponent(templateCode)}`}
              className="hex-pill w-full bg-[#111111] hover:bg-black text-[#FCBF14] font-black py-2.5 text-xs transition-all flex items-center justify-center gap-2 shadow-xs text-center"
            >
              <Layers size={13} className="text-[#FCBF14]" /> Order Custom Polish <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Technical Specs & Inclusions */}
        <TemplateSpecs template={template} />
      </div>
    </div>
  );
}
