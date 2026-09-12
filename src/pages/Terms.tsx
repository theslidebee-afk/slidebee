import { useState, useEffect } from "react";
import { 
  FileText, 
  Award, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle, 
  Scale, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Terms() {
  usePageSEO({
    title: "Terms of Service & Commercial Licensing | SlideBee",
    description: "SlideBee master terms of service, commercial PowerPoint template licensing rights, bespoke presentation design SLAs, and revision guarantees.",
  });

  const [activeSection, setActiveSection] = useState<string>("acceptance");
  const [contactConfig, setContactConfig] = useState<any>({
    address: "SlideBee Design Studio, Bengaluru, Karnataka 560001, India",
    generalEmail: "hello@theslidebee.com",
    supportEmail: "support@theslidebee.com",
    whatsapp: "+1 (555) 123-4567",
    responseGuarantee: "2-Hour Response Time"
  });

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "contact_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setContactConfig((prev: any) => ({
            ...prev,
            ...data.value
          }));
        }
      });
  }, []);

  const sections = [
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "licensing", label: "2. Commercial Template License" },
    { id: "services", label: "3. Bespoke Design SLAs" },
    { id: "pricing", label: "4. Pricing & Refunds" },
    { id: "warranties", label: "5. Client Warranties & NDA" },
    { id: "liability", label: "6. Limitation of Liability" },
    { id: "notices", label: "7. Studio Office & Notices" }
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="hex-pill inline-flex items-center gap-2 bg-[#111111] text-[#FCBF14] px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4 shadow-sm border border-primary/40">
            <Scale size={14} className="text-[#FCBF14]" />
            Legal Terms & Guarantees
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto">
            Last Updated: September 2026. Commercial rights, turnaround SLAs, and transparent studio guarantees.
          </p>
        </div>

        {/* 4 Core Legal Assurance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="hex-card bg-white border-2 border-primary/40 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-amber flex items-center justify-center mb-3">
                <Award size={20} className="text-[#111111]" />
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                100% Commercial Rights
              </h4>
              <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
                Full perpetual rights to present, adapt, and distribute finalized decks worldwide.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber mt-3 block">
              Worldwide Ownership
            </span>
          </div>

          <div className="hex-card bg-white border-2 border-primary/40 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-amber flex items-center justify-center mb-3">
                <Clock size={20} className="text-[#111111]" />
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                24h–48h Turnaround SLA
              </h4>
              <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
                Strict delivery deadlines with live milestone progress tracking in your client ledger.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber mt-3 block">
              Guaranteed Delivery
            </span>
          </div>

          <div className="hex-card bg-white border-2 border-primary/40 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-amber flex items-center justify-center mb-3">
                <ShieldCheck size={20} className="text-[#111111]" />
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                Strict Executive NDA
              </h4>
              <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
                Client pitch decks, financial data, and assets are encrypted in Cloudflare R2 storage.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber mt-3 block">
              Confidentiality First
            </span>
          </div>

          <div className="hex-card bg-white border-2 border-primary/40 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-amber flex items-center justify-center mb-3">
                <RefreshCw size={20} className="text-[#111111]" />
              </div>
              <h4 className="font-heading font-extrabold text-sm text-[#111111] mb-1">
                2 Full Revision Rounds
              </h4>
              <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
                Every custom deck includes 2 rounds of refinement with a dedicated senior art director.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber mt-3 block">
              Polish Guarantee
            </span>
          </div>
        </div>

        {/* Interactive Quick-Jump Navigation Bar */}
        <div className="sticky top-20 z-20 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-primary/30 p-2 sm:p-3 mb-8 shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={`hex-pill px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeSection === sec.id
                    ? "bg-[#111111] text-[#FCBF14] shadow-sm"
                    : "bg-[#FFF9E8] text-[#726F6D] hover:text-[#111111] hover:bg-primary/20"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Legal Clauses */}
        <div className="space-y-6 text-sm text-[#111111] leading-relaxed">

          {/* Section 1 */}
          <section id="acceptance" className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <FileText size={20} className="text-primary-amber" />
              1. Acceptance of Terms & Statement of Work
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              By accessing SlideBee (theslidebee.com), purchasing digital PowerPoint templates, or commissioning custom executive presentation design services, you enter into a legally binding agreement governed by these Terms of Service, our Privacy Policy, and any executed Statement of Work (SOW).
            </p>
            <p className="text-[#726F6D] leading-relaxed">
              If you are engaging our studio on behalf of a corporation, venture capital firm, or startup, you represent and warrant that you possess full corporate authority to bind that entity to these commitments.
            </p>
          </section>

          {/* Section 2 */}
          <section id="licensing" className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-primary-amber" />
              2. Commercial Template Licensing & Starter Credits
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              All digital presentation templates available in the SlideBee storefront are engineered in native Microsoft PowerPoint (.pptx) and licensed under transparent commercial terms:
            </p>
            <div className="space-y-3 mb-4">
              <div className="p-3.5 bg-[#FFF9E8] rounded-xl border border-primary/30">
                <strong className="text-[#111111] block mb-1">Permitted Commercial Uses:</strong>
                <p className="text-xs text-[#726F6D]">
                  You receive perpetual worldwide rights to edit, brand, adapt, and present the slides for commercial client proposals, venture investor pitch decks, internal board reviews, webinars, marketing keynotes, and sales meetings.
                </p>
              </div>
              <div className="p-3.5 bg-[#FFF9E8] rounded-xl border border-primary/30">
                <strong className="text-[#111111] block mb-1">Starter Credits Program:</strong>
                <p className="text-xs text-[#726F6D]">
                  New registered clients receive 5 Free Starter Credits upon creating an account. Designated templates in our catalog labeled "5 Free Credits" may be redeemed instantly at zero cost, conferring the exact same perpetual commercial license as a direct purchase.
                </p>
              </div>
              <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-200">
                <strong className="text-red-900 block mb-1">Prohibited Redistribution:</strong>
                <p className="text-xs text-red-700">
                  You may not sublicense, resell, open-source, or distribute the raw template files, layout frameworks, or graphics as standalone stock templates, digital downloads, or competing design products.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="services" className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <Clock size={20} className="text-primary-amber" />
              3. Bespoke Design Services & Turnaround SLA
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              For custom presentation design engagements submitted through our studio ordering portal:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D] mb-4">
              <li><strong className="text-[#111111]">Service Level Agreement (SLA):</strong> Standard presentations are delivered within 48 business hours. 24-hour rush turnaround is guaranteed when the rush delivery option is selected. Turnaround time begins upon receipt of all necessary briefing assets and client brief confirmation.</li>
              <li><strong className="text-[#111111]">Dedicated Senior Art Director:</strong> Every project is supervised by a senior presentation designer to ensure executive typography polish, visual hierarchy, and precise chart styling.</li>
              <li><strong className="text-[#111111]">Structured Revision Process:</strong> Custom orders include two comprehensive rounds of revisions to fine-tune copy alignment, color accents, and diagram layouts. Revisions must be requested within 14 calendar days of draft delivery.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="pricing" className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <DollarSign size={20} className="text-primary-amber" />
              4. Transparent Pricing, Currency & Refund Policy
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              We operate on transparent pricing with no hidden studio surcharges:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D] mb-4">
              <li><strong className="text-[#111111]">Currency & Checkout:</strong> All prices are displayed in USD ($) or INR (₹) according to your localized currency toggle. Payments are processed securely via certified gateway partners (Razorpay).</li>
              <li><strong className="text-[#111111]">Digital Template Purchases:</strong> Due to the immediate download delivery of proprietary Microsoft PowerPoint (.pptx) source files, template sales are final and non-refundable once the download link has been generated.</li>
              <li><strong className="text-[#111111]">Custom Design Services:</strong> Cancellations made prior to initial draft production will receive a full refund minus a 10% administrative onboarding fee. Once design drafting has commenced, fees are non-refundable due to dedicated studio labor, but are fully protected by our 2-round revision guarantee until satisfaction.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="warranties" className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <ShieldAlert size={20} className="text-primary-amber" />
              5. Client Warranties & Confidentiality (NDA)
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              The client warrants that all copy, statistics, brand logos, and media files provided to SlideBee do not infringe upon third-party copyrights, patents, or trade secrets. The client retains 100% intellectual property ownership of all submitted materials.
            </p>
            <p className="text-[#726F6D] leading-relaxed">
              SlideBee treats all client materials with strict confidentiality under our standard executive non-disclosure commitments. Project files uploaded through our portal are stored in dedicated encrypted Cloudflare R2 storage buckets and never shared with unauthorized external parties.
            </p>
          </section>

          {/* Section 6 */}
          <section id="liability" className="hex-card-lg bg-white border-2 border-primary/30 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-heading font-extrabold text-[#111111] mb-3 flex items-center gap-2">
              <Scale size={20} className="text-primary-amber" />
              6. Limitation of Liability & Governing Law
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              To the maximum extent permitted under applicable law, SlideBee shall not be liable for indirect, punitive, or consequential damages resulting from project brief delivery delays caused by third-party communication failures. SlideBee's aggregate cumulative liability for any claim shall not exceed the total fees paid by the client for the specific service in dispute.
            </p>
            <p className="text-[#726F6D] leading-relaxed">
              These terms shall be governed by and construed under the laws of India, with exclusive jurisdiction resting in the courts of Bengaluru, Karnataka, India.
            </p>
          </section>

          {/* Section 7 - Connected Directly to Admin Studio Physical Address */}
          <section id="notices" className="hex-card-lg bg-white border-2 border-primary p-6 sm:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-primary/20">
              <div>
                <h2 className="text-xl font-heading font-extrabold text-[#111111] flex items-center gap-2">
                  <MapPin size={20} className="text-primary-amber" />
                  7. Official Studio Office & Legal Notices
                </h2>
                <p className="text-xs text-[#726F6D] mt-0.5">
                  Official registered studio address synchronized with SlideBee Admin records.
                </p>
              </div>
              <div className="hex-pill-sm bg-primary/20 text-[#111111] border border-primary/40 text-[10px] font-black px-3 py-1 self-start sm:self-auto">
                Live Studio Registry
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-[#FFF9E8] border border-primary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary-amber">
                  <MapPin size={14} /> Registered Studio Address
                </div>
                <div className="font-extrabold text-sm text-[#111111]">
                  SlideBee Executive Design Studio
                </div>
                <div className="text-[#726F6D] leading-relaxed font-medium">
                  {contactConfig.address || "SlideBee Design Studio, Bengaluru, Karnataka 560001, India"}
                </div>
                <div className="text-[11px] text-primary-amber font-bold pt-1">
                  Global Delivery Hubs: Singapore & San Francisco
                </div>
              </div>

              <div className="p-4 bg-[#FFF9E8] border border-primary/30 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary-amber">
                  <Mail size={14} /> Studio Contact & Notice Dispatch
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-[#726F6D] font-medium">Legal Notices: </span>
                    <a href={`mailto:${contactConfig.generalEmail || "legal@theslidebee.com"}`} className="font-bold text-[#111111] hover:text-primary-amber underline">
                      {contactConfig.generalEmail || "legal@theslidebee.com"}
                    </a>
                  </div>
                  <div>
                    <span className="text-[#726F6D] font-medium">Order Inquiries & Support: </span>
                    <a href={`mailto:${contactConfig.supportEmail || "support@theslidebee.com"}`} className="font-bold text-[#111111] hover:text-primary-amber underline">
                      {contactConfig.supportEmail || "support@theslidebee.com"}
                    </a>
                  </div>
                  {contactConfig.whatsapp && (
                    <div>
                      <span className="text-[#726F6D] font-medium">Studio WhatsApp: </span>
                      <span className="font-bold text-[#111111]">{contactConfig.whatsapp}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#726F6D] font-medium">Response SLA: </span>
                    <span className="font-bold text-emerald-700">{contactConfig.responseGuarantee || "2-Hour Response Time"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#111111]/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-[#726F6D] font-medium">
                Need to execute a custom corporate NDA or discuss a bespoke enterprise design contract?
              </span>
              <Link
                to="/contact"
                className="hex-pill bg-[#111111] hover:bg-black text-white hover:text-primary font-bold text-xs px-4 py-2 flex items-center gap-1.5 transition-all shrink-0"
              >
                <span>Contact Legal & Studio Directors</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <Link
            to="/home"
            className="hex-pill inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-[#111111] font-black text-xs transition-colors shadow-sm"
          >
            Return to SlideBee Home
          </Link>
        </div>

      </div>
    </div>
  );
}
