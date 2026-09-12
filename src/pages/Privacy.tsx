import { Shield, Lock, Eye, Database, Globe, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Privacy() {
  usePageSEO({
    title: "Privacy Policy & Client Data Protection | SlideBee",
    description: "SlideBee client privacy policy, strict NDA confidentiality guarantees, secure Cloudflare infrastructure, and data protection practices.",
  });

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 large-hex-grid">
      <div className="w-[90%] max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-14">
          <div className="hex-pill inline-flex items-center gap-2 bg-white border border-[#FCBF14]/40 text-[#111111] px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Shield size={14} className="text-[#FCBF14]" />
            Client Trust & Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto">
            Last Updated: September 2026. How we protect your business ideas, pitch materials, and personal data.
          </p>
        </div>

        {/* NDA Assurance Card */}
        <div className="hex-card-lg bg-white border-2 border-[#FCBF14] p-6 sm:p-8 mb-10 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#FCBF14]/20 border border-[#FCBF14] text-[#111111] flex items-center justify-center shrink-0">
              <Lock size={22} className="text-[#111111]" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-2">
                Executive Non-Disclosure Guarantee
              </h3>
              <p className="text-sm text-[#726F6D] leading-relaxed">
                At SlideBee, we understand that presentation decks frequently contain confidential business strategies, unannounced product launches, proprietary financial metrics, and investor cap tables. Every project uploaded or shared with SlideBee is governed by strict confidentiality protocols. We sign formal mutual Non-Disclosure Agreements (NDAs) upon request before reviewing proprietary assets.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-10 text-sm sm:text-base text-[#111111] leading-relaxed">
          
          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Eye size={20} className="text-[#FCBF14]" />
              1. Information We Collect
            </h2>
            <p className="text-[#726F6D] mb-3">
              We collect only the minimum necessary information required to deliver high-impact presentation design and digital assets:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D]">
              <li><strong className="text-[#111111]">Account & Contact Information:</strong> Name, professional email address, company name, and phone or WhatsApp number for project communications.</li>
              <li><strong className="text-[#111111]">Project Materials:</strong> Draft slides, outlines, branding kits, logos, typography specs, and executive notes uploaded via our ordering platform.</li>
              <li><strong className="text-[#111111]">Billing & Transaction Metadata:</strong> Payment reference IDs, currency preference, and transaction timestamps. We do not store raw credit card numbers or banking passwords on our servers.</li>
              <li><strong className="text-[#111111]">Technical Logs:</strong> Anonymous browser user-agent, IP geolocation (country-level), and operational access timestamps required for security monitoring and edge delivery.</li>
            </ul>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Database size={20} className="text-[#FCBF14]" />
              2. How We Store & Secure Your Data
            </h2>
            <p className="text-[#726F6D] mb-3">
              SlideBee leverages modern cloud and serverless infrastructure with bank-level encryption standards:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D]">
              <li><strong className="text-[#111111]">Serverless Cloudflare Architecture:</strong> All requests are served over encrypted TLS 1.3 connections across Cloudflare global edge infrastructure.</li>
              <li><strong className="text-[#111111]">Encrypted Object Storage:</strong> Presentation assets and source files are stored in private, cryptographically scoped Cloudflare R2 object storage with automatic server-side encryption (AES-256).</li>
              <li><strong className="text-[#111111]">Strict Access Control:</strong> Only vetted Art Directors and design specialists directly assigned to your engagement are granted access to your project files.</li>
              <li><strong className="text-[#111111]">Data Retention & Archival:</strong> Completed presentation source files are retained for 30 days to facilitate revision requests, after which client raw uploads are permanently purged upon written request.</li>
            </ul>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Globe size={20} className="text-[#FCBF14]" />
              3. Payment Processing & Third-Party Services
            </h2>
            <p className="text-[#726F6D] mb-3">
              We partner with trusted enterprise service providers to ensure seamless and secure platform operations:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D]">
              <li><strong className="text-[#111111]">Razorpay Gateway:</strong> Card processing, UPI, and international wire transfers are handled by PCI-DSS Level 1 certified processors. Payment information is tokenized and never touches our internal application servers.</li>
              <li><strong className="text-[#111111]">Supabase Authentication & Database:</strong> User accounts, orders, and authentication states are protected by PostgreSQL Row-Level Security (RLS) policies.</li>
              <li><strong className="text-[#111111]">No Third-Party Ad Selling:</strong> We never sell, rent, monetize, or disclose client email addresses or deck contents to advertising networks or third-party data brokers.</li>
            </ul>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Shield size={20} className="text-[#FCBF14]" />
              4. Cookies & Web Analytics
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-3">
              We employ privacy-preserving, first-party cookie mechanisms strictly necessary to maintain active authenticated sessions, remember currency preferences (USD / INR), and retain user consent settings.
            </p>
            <p className="text-[#726F6D] leading-relaxed">
              We utilize privacy-first web telemetry (such as Cloudflare Web Analytics) that does not employ cross-site tracking cookies, fingerprinting, or personal identifiable tracking. You may manage cookie preferences at any time via your browser settings or our platform consent banner.
            </p>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <Lock size={20} className="text-[#FCBF14]" />
              5. Your Rights & Data Erasure
            </h2>
            <p className="text-[#726F6D] mb-3">
              Regardless of your jurisdiction (including under GDPR, CCPA, and applicable Indian IT laws), you retain complete control over your information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#726F6D]">
              <li>Right to inspect and receive a copy of all personal records and files held by SlideBee.</li>
              <li>Right to request immediate and permanent deletion of uploaded pitch decks, contact profiles, and billing logs.</li>
              <li>Right to withdraw consent and opt out of project updates or marketing notifications at any time.</li>
            </ul>
          </section>

          <section className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 hex-card border border-[#111111]/10">
            <h2 className="text-xl font-heading font-bold text-[#111111] mb-3 flex items-center gap-2">
              <MapPin size={20} className="text-[#FCBF14]" />
              6. Contact Our Data Protection Officer
            </h2>
            <p className="text-[#726F6D] leading-relaxed mb-4">
              For privacy inquiries, NDA execution requests, or data deletion instructions, contact our team directly:
            </p>
            <div className="p-4 bg-[#FFF9E8] border border-[#FCBF14]/30 rounded space-y-2 text-sm">
              <div className="font-bold text-[#111111]">SlideBee Design Studio</div>
              <div className="text-[#726F6D]">Registered Studio: Bengaluru, Karnataka 560001, India</div>
              <div className="text-[#726F6D]">Global Delivery Hubs: Singapore & San Francisco</div>
              <div className="text-[#726F6D] flex items-center gap-2 pt-1">
                <Mail size={14} className="text-[#FCBF14]" />
                <a href="mailto:privacy@theslidebee.com" className="text-[#111111] font-semibold underline hover:text-[#FCBF14]">
                  privacy@theslidebee.com
                </a>
              </div>
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
