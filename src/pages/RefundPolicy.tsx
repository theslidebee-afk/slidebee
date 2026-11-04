import { useState, useEffect } from "react";
import { 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { d1 } from "../lib/d1";
import { usePageSEO } from "../hooks/usePageSEO";

export default function RefundPolicy() {
  usePageSEO({
    title: "Cancellation & Refund Policy | SlideBee Studio",
    description: "SlideBee transparent cancellation and refund policy for digital PowerPoint templates, ecommerce services, and bespoke presentation design engagements.",
  });

  const [contactConfig, setContactConfig] = useState<any>({
    address: "SlideBee Design Studio, Bengaluru, Karnataka 560001, India",
    generalEmail: "hello@theslidebee.com",
    supportEmail: "support@theslidebee.com",
    phone: "+91 98765 43210",
    operatingHours: "Monday to Saturday, 9:00 AM – 7:00 PM IST"
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
            <RotateCcw size={14} className="text-[#FCBF14]" />
            Razorpay Compliance & Consumer Protection
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] tracking-tight mb-3">
            Cancellation & Refund Policy
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto">
            Last Updated: October 2026. Plain-language cancellation windows, refund processing timelines, and banking settlement terms.
          </p>
        </div>

        {/* 3 Core Highlights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-[#111111] flex items-center justify-center mb-3">
              <Clock size={20} className="text-[#111111]" />
            </div>
            <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
              5–7 Working Days
            </h4>
            <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
              Approved refunds are credited back to the original source bank account, credit card, or UPI ID.
            </p>
          </div>

          <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-[#111111] flex items-center justify-center mb-3">
              <ShieldCheck size={20} className="text-[#111111]" />
            </div>
            <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
              2-Round Revision SLA
            </h4>
            <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
              Custom presentation briefs include two complete rounds of revisions to guarantee design satisfaction.
            </p>
          </div>

          <div className="hex-card bg-white border-2 border-primary/40 p-5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-[#111111] flex items-center justify-center mb-3">
              <CreditCard size={20} className="text-[#111111]" />
            </div>
            <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
              Zero Hidden Charges
            </h4>
            <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
              No processing surcharges. All transactions are securely routed via certified gateways (Razorpay).
            </p>
          </div>
        </div>

        {/* Detailed Policy Content */}
        <div className="space-y-6 text-sm text-[#111111] leading-relaxed">

          {/* Section 1: Overview */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-primary-amber" />
              1. Overview & Policy Scope
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              At SlideBee (operated at <strong>theslidebee.com</strong>), we deliver executive-grade presentation design services, digital PowerPoint (.pptx) master templates, and custom website development packages. We believe in complete transparency and customer satisfaction.
            </p>
            <p className="text-[#726F6D] leading-relaxed">
              This Cancellation and Refund Policy outlines the exact terms and circumstances under which orders can be cancelled and payments refunded in compliance with the Consumer Protection Act and payment aggregator guidelines (including Razorpay).
            </p>
          </section>

          {/* Section 2: Digital Templates */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <AlertCircle size={20} className="text-primary-amber" />
              2. Digital Template Purchases & Subscriptions
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-[#FFF9E8] rounded-xl border border-primary/30">
                <strong className="text-[#111111] block mb-1">Digital Template Downloads:</strong>
                <p className="text-xs text-[#726F6D] leading-relaxed">
                  Due to the immediate digital delivery and non-returnable nature of proprietary Microsoft PowerPoint source files (.pptx), individual template purchases are generally non-refundable once the file download link has been generated and accessed. If a file is corrupted or technically defective, our engineering desk will supply a verified replacement or issue a full refund within 24 hours.
                </p>
              </div>
              <div className="p-4 bg-[#FFF9E8] rounded-xl border border-primary/30">
                <strong className="text-[#111111] block mb-1">Subscription Memberships (Pro Plans):</strong>
                <p className="text-xs text-[#726F6D] leading-relaxed">
                  Subscriptions may be cancelled at any time through your client portal. Cancellations take effect at the end of the current billing cycle with no further recurring charges. If you were billed for a recurring cycle in error and have not downloaded any templates during that cycle, you may request a 100% refund within <strong>7 days</strong> of the renewal charge.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Custom Design Services */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <RotateCcw size={20} className="text-primary-amber" />
              3. Bespoke Presentation Design Services
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              For custom presentation design orders (including Pitch Decks, Executive Keynotes, and Redesign engagements) submitted through our studio ordering portal:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D] mb-4">
              <li>
                <strong className="text-[#111111]">Cancellation Before Work Begins:</strong> You may cancel your project within <strong>4 hours</strong> of submission or before our art directors commence preliminary drafting for a <strong>100% full refund</strong>.
              </li>
              <li>
                <strong className="text-[#111111]">Cancellation During Drafting:</strong> If cancellation is requested after initial research and concept storyboarding has commenced but before final draft delivery, a partial refund of 50% will be issued to cover allocated studio design labor.
              </li>
              <li>
                <strong className="text-[#111111]">After Delivery of Initial Draft:</strong> Once the complete draft presentation has been delivered, refunds are not available. However, every project includes <strong>two comprehensive rounds of revisions</strong> within 14 calendar days to ensure complete satisfaction.
              </li>
            </ul>
          </section>

          {/* Section 4: Ecommerce Website Development Package */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <CreditCard size={20} className="text-primary-amber" />
              4. Ecommerce Website Development Package (₹25,000)
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              For client engagements under our SlideBee Ecommerce Launch Package:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D] mb-4">
              <li>
                <strong className="text-[#111111]">Pre-Development Cancellation:</strong> If cancelled prior to wireframing and design kickoff, a 100% full refund is issued.
              </li>
              <li>
                <strong className="text-[#111111]">Post-Design Approval:</strong> Once the UI/UX store architecture has been approved and backend coding commences, payments become non-refundable, backed by our <strong>30-day post-launch support and warranty</strong>.
              </li>
            </ul>
          </section>

          {/* Section 5: Refund Method & Timelines */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <Clock size={20} className="text-primary-amber" />
              5. Refund Method & Processing Timelines
            </h2>
            <div className="p-4 bg-[#FFF9E8] rounded-2xl border border-primary/40 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-primary-amber shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111111] text-xs sm:text-sm block">Mode of Refund:</strong>
                  <p className="text-xs text-[#726F6D]">
                    All refunds are issued exclusively to the <strong>original payment method</strong> used during checkout (Credit/Debit Card, Net Banking, or UPI) via our payment gateway partner (Razorpay). Cash or third-party transfer refunds are not permitted.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-primary-amber shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#111111] text-xs sm:text-sm block">Settlement Timeline:</strong>
                  <p className="text-xs text-[#726F6D]">
                    Once an authorized refund is approved by SlideBee, the funds are initiated within <strong>24–48 business hours</strong>. Depending on your issuing bank or payment provider, the refunded amount will reflect in your account within <strong>5 to 7 business days</strong>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Grievance & Support */}
          <section className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <HelpCircle size={20} className="text-primary-amber" />
              6. How to Request a Refund / Grievance Redressal
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-4">
              To request a cancellation or refund, email our dedicated compliance desk with your order reference number, registered email, and reason for the request:
            </p>
            
            <div className="bg-[#111111] text-white p-6 rounded-2xl space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <span>Support Email: <a href="mailto:support@theslidebee.com" className="text-primary underline font-bold">support@theslidebee.com</a> / <a href="mailto:hello@theslidebee.com" className="text-primary underline">hello@theslidebee.com</a></span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <span>Customer Care / WhatsApp: {contactConfig.phone || "+91 98765 43210"}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-primary shrink-0 mt-1" />
                <span>Registered Office: {contactConfig.address || "SlideBee Design Studio, Bengaluru, Karnataka 560001, India"}</span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-gray-400 text-xs">
                <Clock size={14} className="text-primary" />
                <span>Operating Hours: {contactConfig.operatingHours || "Monday to Saturday, 9:00 AM – 7:00 PM IST (Response guaranteed within 2 hours)"}</span>
              </div>
            </div>
          </section>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            to="/terms"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#111111]/20 text-[#111111] font-bold hex-card hover:border-[#111111] transition-colors shadow-xs text-xs sm:text-sm"
          >
            View Master Terms of Service
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-[#111111] font-extrabold hex-card hover:bg-primary-dark transition-colors shadow-sm text-xs sm:text-sm"
          >
            Contact Compliance Desk <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
