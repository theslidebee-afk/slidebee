import { useState, useEffect } from "react";
import { 
  Truck, 
  Download, 
  Clock, 
  Mail, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { d1 } from "../lib/d1";
import { usePageSEO } from "../hooks/usePageSEO";

export default function ShippingPolicy() {
  usePageSEO({
    title: "Shipping & Digital Delivery Policy | SlideBee Studio",
    description: "SlideBee digital delivery turnaround times, zero shipping charges, automated template downloads, and executive presentation design delivery SLAs.",
  });

  const [contactConfig, setContactConfig] = useState<any>({
    address: "SlideBee Design Studio, Bengaluru, Karnataka 560001, India",
    generalEmail: "hello@theslidebee.com",
    supportEmail: "support@theslidebee.com",
    phone: "+91 98765 43210"
  });

  useEffect(() => {
    d1
      .from("site_config")
      .select("value")
      .eq("key", "contact_cms")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setContactConfig((prev: any) => ({
            ...prev,
            ...data.value
          }));
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="hex-pill inline-flex items-center gap-2 bg-[#111111] text-[#FCBF14] px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4 shadow-sm border border-primary/40">
            <Truck size={14} className="text-[#FCBF14]" />
            Digital Delivery & SLA Fulfillment
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] tracking-tight mb-3">
            Shipping & Delivery Policy
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto">
            Last Updated: October 2026. Instant digital fulfillment, turnaround timelines, and zero physical shipping fees.
          </p>
        </div>

        {/* 3 Core Delivery Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-[#111111] flex items-center justify-center mb-3">
              <Download size={20} className="text-[#111111]" />
            </div>
            <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
              Instant Download
            </h4>
            <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
              Storefront template purchases and free tier decks are delivered instantly upon checkout confirmation.
            </p>
          </div>

          <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-[#111111] flex items-center justify-center mb-3">
              <Clock size={20} className="text-[#111111]" />
            </div>
            <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
              24h–48h Custom SLA
            </h4>
            <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
              Bespoke presentation decks are delivered via client portal & encrypted email in 24h (Rush) or 48h (Standard).
            </p>
          </div>

          <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-[#111111] flex items-center justify-center mb-3">
              <Globe size={20} className="text-[#111111]" />
            </div>
            <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
              ₹0 Shipping Fees
            </h4>
            <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
              100% cloud-delivered digital assets. Zero customs, courier, or physical handling fees worldwide.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-sm text-[#111111] leading-relaxed">

          {/* Section 1: Nature of Products */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <FileText size={20} className="text-primary-amber" />
              1. Nature of Goods & Delivery Medium
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              SlideBee (<strong>theslidebee.com</strong>) provides exclusively <strong>digital goods and professional design services</strong>. We do not manufacture, warehouse, or ship physical goods.
            </p>
            <p className="text-[#726F6D] leading-relaxed">
              All deliverables—including Microsoft PowerPoint source decks (.pptx), Google Slides assets, master vector illustrations, and custom ecommerce codebases—are fulfilled electronically through our high-speed Cloudflare CDN infrastructure, authenticated client dashboard, and verified business email.
            </p>
          </section>

          {/* Section 2: Delivery Timelines */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <Clock size={20} className="text-primary-amber" />
              2. Delivery Timelines by Service Category
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-[#FFF9E8] rounded-xl border border-primary/30 flex items-start justify-between gap-4">
                <div>
                  <strong className="text-[#111111] block mb-0.5">Digital PowerPoint Templates (Storefront):</strong>
                  <p className="text-xs text-[#726F6D]">
                    Instant digital delivery upon successful payment verification. Download link generated immediately in browser and emailed to your billing email.
                  </p>
                </div>
                <span className="bg-[#111111] text-[#FCBF14] text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0">
                  Instant (0 mins)
                </span>
              </div>

              <div className="p-4 bg-[#FFF9E8] rounded-xl border border-primary/30 flex items-start justify-between gap-4">
                <div>
                  <strong className="text-[#111111] block mb-0.5">Bespoke Design — 24h Rush Priority:</strong>
                  <p className="text-xs text-[#726F6D]">
                    Delivered within 24 business hours of project brief approval and asset ingestion. Monitored through live SLA tracker in client portal.
                  </p>
                </div>
                <span className="bg-[#FCBF14] text-[#111111] text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0">
                  24 Hours
                </span>
              </div>

              <div className="p-4 bg-[#FFF9E8] rounded-xl border border-primary/30 flex items-start justify-between gap-4">
                <div>
                  <strong className="text-[#111111] block mb-0.5">Bespoke Design — Standard Executive Service:</strong>
                  <p className="text-xs text-[#726F6D]">
                    Delivered within 48 business hours. Includes initial storyboard proofs followed by full 16:9 widescreen presentation package.
                  </p>
                </div>
                <span className="bg-white text-[#111111] border border-[#111111]/20 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0">
                  48 Hours
                </span>
              </div>

              <div className="p-4 bg-[#FFF9E8] rounded-xl border border-primary/30 flex items-start justify-between gap-4">
                <div>
                  <strong className="text-[#111111] block mb-0.5">Ecommerce Website Development Package (₹25,000):</strong>
                  <p className="text-xs text-[#726F6D]">
                    Store architecture, UI/UX design, Razorpay gateway integration, and Cloudflare deployment completed and handed over within 7 to 10 business days.
                  </p>
                </div>
                <span className="bg-[#111111] text-[#FCBF14] text-[10px] font-black uppercase px-2.5 py-1 rounded-full shrink-0">
                  7–10 Days
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: Delivery Confirmation & Tracking */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary-amber" />
              3. Delivery Confirmation & SLA Tracking
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              Every custom order generates a unique reference ID (e.g. <code>SB-XXXXXX</code>). You can track real-time delivery milestones anytime:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D] mb-4">
              <li><strong className="text-[#111111]">Client Portal:</strong> Sign in at <Link to="/login" className="text-primary-amber font-bold underline">theslidebee.com/login</Link> to monitor draft reviews, revisions, and download finalized files.</li>
              <li><strong className="text-[#111111]">Email Notifications:</strong> Milestone alerts are automatically dispatched to your registered email from <code>design@theslidebee.com</code> and <code>hello@theslidebee.com</code>.</li>
            </ul>
          </section>

          {/* Section 4: Delivery Issues */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <Mail size={20} className="text-primary-amber" />
              4. Non-Receipt of Digital Deliverables
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              If you have placed an order and have not received your digital download link or presentation deliverable within the stipulated SLA timeframe:
            </p>
            <p className="text-[#726F6D] leading-relaxed mb-4">
              Please check your spam/junk email folder, verify your registered email in your client portal, or immediately contact our fulfillment desk:
            </p>
            <div className="p-4 bg-[#111111] text-white rounded-xl text-xs sm:text-sm space-y-2">
              <div>Fulfillment Email: <a href="mailto:support@theslidebee.com" className="text-primary font-bold underline">support@theslidebee.com</a> / <a href="mailto:design@theslidebee.com" className="text-primary underline">design@theslidebee.com</a></div>
              <div>Customer Care Phone: <span className="text-white font-medium">{contactConfig.phone || "+91 98765 43210"}</span></div>
              <div>Registered Office: <span className="text-gray-300">{contactConfig.address || "SlideBee Design Studio, Bengaluru, Karnataka 560001, India"}</span></div>
            </div>
          </section>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            to="/refund-policy"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#111111]/20 text-[#111111] font-bold hex-card hover:border-[#111111] transition-colors shadow-xs text-xs sm:text-sm"
          >
            Cancellation & Refund Policy
          </Link>
          <Link
            to="/ordernow"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-[#111111] font-extrabold hex-card hover:bg-primary-dark transition-colors shadow-sm text-xs sm:text-sm"
          >
            Start a Presentation Project <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
