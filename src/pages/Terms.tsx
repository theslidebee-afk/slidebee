import { FileText, Award, Clock, DollarSign, ShieldAlert, CheckCircle, Scale, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Terms() {
  usePageSEO({
    title: "Terms of Service & Commercial Licensing | SlideBee",
    description: "SlideBee master terms of service, commercial PowerPoint template licensing rights, bespoke presentation design SLAs, and revision guarantees.",
  });

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-14">
          <div className="hex-pill inline-flex items-center gap-2 bg-white border border-[#FCBF14]/40 text-[#111111] px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Scale size={14} className="text-[#FCBF14]" />
            Legal Terms & Guarantees
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto">
            Last Updated: September 2026. Clear rules, commercial rights, and turnaround service level agreements.
          </p>
        </div>

        {/* Commercial License Highlight */}
        <div className="hex-card-lg bg-white border-2 border-[#FCBF14] p-6 sm:p-8 mb-10 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#FCBF14]/20 border border-[#FCBF14] text-[#111111] flex items-center justify-center shrink-0">
              <Award size={22} className="text-[#111111]" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-2">
                100% Commercial Rights Granted
              </h3>
              <p className="text-sm text-[#726F6D] leading-relaxed">
                When you purchase a PowerPoint template or commission custom presentation design from SlideBee, you receive full commercial rights to edit, adapt, present, and distribute your finalized presentations worldwide for any internal or external business purpose.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-10 text-sm sm:text-base text-[#111111] leading-relaxed">

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <FileText size={20} className="text-[#FCBF14]" />
              1. Acceptance of Terms
            </h2>
            <p className="text-[#726F6D]">
              By accessing SlideBee (theslidebee.com), purchasing digital PowerPoint templates, or engaging our bespoke presentation design services, you agree to be bound by these Terms of Service, our Privacy Policy, and any executed Statement of Work (SOW). If you are contracting on behalf of a legal entity, you represent and warrant that you possess the authority to bind that entity.
            </p>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-[#FCBF14]" />
              2. Commercial Template License Terms
            </h2>
            <p className="text-[#726F6D] mb-3">
              Digital template products provided on SlideBee are governed by our master single-seat or enterprise license:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D]">
              <li><strong className="text-[#111111]">Permitted Uses:</strong> You may edit, customize, rebrand, and present the slides for commercial client presentations, investor pitch decks, internal corporate webinars, marketing keynotes, and sales meetings.</li>
              <li><strong className="text-[#111111]">Prohibited Distribution:</strong> You may not sublicense, resell, share in open source repositories, or distribute the raw template files, layouts, or design kits as standalone stock templates or digital products.</li>
              <li><strong className="text-[#111111]">Delivery Format:</strong> Templates are delivered as 100% editable Microsoft PowerPoint (.pptx) files with embedded vector graphics and typography guidance.</li>
            </ul>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Clock size={20} className="text-[#FCBF14]" />
              3. Bespoke Design Services & Turnaround SLA
            </h2>
            <p className="text-[#726F6D] mb-3">
              For custom presentation design engagements submitted through our studio ordering portal:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D]">
              <li><strong className="text-[#111111]">Service Level Agreement (SLA):</strong> Standard engagements are delivered within 24 to 48 business hours from receipt of complete source materials and client brief confirmation.</li>
              <li><strong className="text-[#111111]">Dedicated Art Director:</strong> Every project is supervised by a senior presentation designer to guarantee narrative coherence, data visualization accuracy, and typography polish.</li>
              <li><strong className="text-[#111111]">Structured Revisions:</strong> Custom orders include up to two comprehensive rounds of revisions to fine-tune layout, color accents, and copy alignment.</li>
            </ul>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <DollarSign size={20} className="text-[#FCBF14]" />
              4. Pricing, Currency & Payments
            </h2>
            <p className="text-[#726F6D] mb-3">
              Pricing transparency is central to our studio model:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D]">
              <li>All prices are quoted in USD or INR and displayed dynamically according to your localized currency toggle.</li>
              <li>Payments are processed securely through certified gateway partners (Razorpay). Full payment or upfront deposit is required prior to project commencement.</li>
              <li>In the event of cancellation prior to initial design draft submission, a partial refund may be issued minus studio setup and review expenses. Once work has commenced, fees are non-refundable due to the custom labor-intensive nature of executive presentation design.</li>
            </ul>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <ShieldAlert size={20} className="text-[#FCBF14]" />
              5. Client Warranties & Content Ownership
            </h2>
            <p className="text-[#726F6D]">
              The client warrants that all text, logos, imagery, and proprietary data supplied to SlideBee do not infringe upon any third-party intellectual property or copyright. The client maintains complete ownership of all pre-existing trade secrets, trademarks, and content supplied to our team.
            </p>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Scale size={20} className="text-[#FCBF14]" />
              6. Limitation of Liability & Governing Law
            </h2>
            <p className="text-[#726F6D] mb-3">
              To the maximum extent permitted by applicable law, SlideBee shall not be liable for indirect, incidental, or consequential damages arising out of slide delivery delays caused by incomplete client briefs or third-party communications failure. SlideBee total cumulative liability shall not exceed the amount paid for the specific design service in question.
            </p>
            <p className="text-[#726F6D]">
              These terms are governed by and construed in accordance with the laws of India, with exclusive jurisdiction resting in the courts of Bengaluru, Karnataka, India.
            </p>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Mail size={20} className="text-[#FCBF14]" />
              7. Legal Notices & Studio Office
            </h2>
            <div className="p-4 bg-[#FFF9E8] border border-[#FCBF14]/30 rounded space-y-2 text-sm">
              <div className="font-bold text-[#111111]">SlideBee Design Studio</div>
              <div className="text-[#726F6D]">Registered Studio: Bengaluru, Karnataka 560001, India</div>
              <div className="text-[#726F6D]">Global Delivery Hubs: Singapore & San Francisco</div>
              <div className="text-[#726F6D]">Inquiries: legal@theslidebee.com | support@theslidebee.com</div>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FCBF14] text-[#111111] font-bold hex-card hover:bg-[#E5AC10] transition-colors shadow-sm"
          >
            Return to SlideBee Home
          </Link>
        </div>

      </div>
    </div>
  );
}
