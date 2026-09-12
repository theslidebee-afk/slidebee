import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Home, Layers, ShieldCheck } from "lucide-react";
import { usePageSEO } from "../hooks/usePageSEO";

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "order";
  const ref = searchParams.get("ref") || "";

  usePageSEO({
    title: type === "contact" ? "Message Received | SlideBee" : "Thank You For Your Order | SlideBee",
    description: "Thank you for partnering with SlideBee. Our presentation design team is already reviewing your project brief.",
  });

  const isContact = type === "contact";

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-24 relative overflow-hidden large-hex-grid">
      {/* Glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FCBF14]/15 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-[90%] max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Success Card */}
        <div className="hex-card-lg bg-white border-2 border-[#FCBF14] p-8 sm:p-12 shadow-xl text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FCBF14]/20 border-2 border-[#FCBF14] rounded-full text-[#111111] mb-6 shadow-sm">
            <CheckCircle2 size={44} className="text-[#FCBF14]" />
          </div>

          <div className="hex-pill inline-block bg-[#111111] text-[#FCBF14] px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4">
            {isContact ? "Inquiry Dispatched" : "Order Confirmed"}
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] tracking-tight mb-4">
            {isContact ? "We Received Your Message" : "Your Deck is in Motion"}
          </h1>

          <p className="text-[#726F6D] text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-6">
            {isContact
              ? "Thank you for reaching out. An Art Director from our executive team will review your specifications and reply within 2 business hours."
              : "Thank you for entrusting your presentation to SlideBee. Your project brief has been assigned to our senior presentation design squad."}
          </p>

          {ref && (
            <div className="inline-block bg-[#FFF9E8] border border-[#FCBF14]/40 px-4 py-2 text-xs font-mono font-bold text-[#111111] mb-8">
              Reference ID: {ref}
            </div>
          )}

          {/* SLA & Timeline Visualizer */}
          <div className="border-t border-[#111111]/10 pt-8 mt-4 text-left">
            <h3 className="text-sm font-heading font-bold uppercase tracking-wider text-[#111111] mb-5 text-center">
              What Happens Next
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FFF9E8] border border-[#111111]/10 hex-card">
                <div className="w-8 h-8 bg-white border border-[#FCBF14] text-[#111111] font-extrabold flex items-center justify-center text-xs mb-3 shadow-xs">
                  01
                </div>
                <div className="text-xs font-bold text-[#111111] mb-1">Brief Review</div>
                <div className="text-xs text-[#726F6D]">
                  Our creative director audits your narrative, logos, and structure within 2 hours.
                </div>
              </div>

              <div className="p-4 bg-[#FFF9E8] border border-[#111111]/10 hex-card">
                <div className="w-8 h-8 bg-white border border-[#FCBF14] text-[#111111] font-extrabold flex items-center justify-center text-xs mb-3 shadow-xs">
                  02
                </div>
                <div className="text-xs font-bold text-[#111111] mb-1">Storyboard Draft</div>
                <div className="text-xs text-[#726F6D]">
                  You receive initial concept slides and hierarchy proofs for quick alignment.
                </div>
              </div>

              <div className="p-4 bg-[#FFF9E8] border border-[#111111]/10 hex-card">
                <div className="w-8 h-8 bg-white border border-[#FCBF14] text-[#111111] font-extrabold flex items-center justify-center text-xs mb-3 shadow-xs">
                  03
                </div>
                <div className="text-xs font-bold text-[#111111] mb-1">Final Delivery</div>
                <div className="text-xs text-[#726F6D]">
                  100% editable PPTX delivered within 24h-48h with two complete revision rounds.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-[#111111]/10">
            <Link
              to="/home"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FCBF14] text-[#111111] font-bold hex-card hover:bg-[#E5AC10] transition-colors shadow-sm"
            >
              <Home size={18} />
              Return to Hive
            </Link>

            <Link
              to="/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#111111] font-bold hex-card border-2 border-[#111111]/20 hover:border-[#111111] transition-colors shadow-sm"
            >
              <Layers size={18} className="text-[#FCBF14]" />
              Explore Template Catalog
            </Link>
          </div>
        </div>

        {/* NDA & Support Guarantee Bar */}
        <div className="hex-card bg-white/80 backdrop-blur-sm border border-[#111111]/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#726F6D]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#FCBF14] shrink-0" />
            <span>Strict Client NDA enforced. All project files encrypted in Cloudflare R2 storage.</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span>Need immediate clarification?</span>
            <a
              href="mailto:support@theslidebee.com"
              className="text-[#111111] font-bold underline hover:text-[#FCBF14] transition-colors"
            >
              support@theslidebee.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
