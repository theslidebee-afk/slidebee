import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Check,
  Layers
} from "lucide-react";
import {
  coreEcommerceFeatures,
  standardPages,
  launchWorkflow,
  ecommerceFaqs
} from "./servicesData";

interface EcommercePackageSectionProps {
  onSwitchToPresentation: () => void;
}

export const EcommercePackageSection: React.FC<EcommercePackageSectionProps> = ({
  onSwitchToPresentation
}) => {
  const [ecommerceTab, setEcommerceTab] = useState<"features" | "pages" | "process" | "faq">("features");

  return (
    <section className="pt-28 pb-16 bg-[#FFF9E8] large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="hex-pill inline-flex items-center gap-2 bg-[#111111] text-[#FCBF14] px-4 py-1.5 text-xs font-black uppercase tracking-wider mb-5 shadow-sm border border-primary/40">
            <Sparkles size={14} className="text-[#FCBF14]" />
            SlideBee Ecommerce Launch Package
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-[#111111] tracking-tight leading-tight mb-4">
            A Complete Online Store.<br />
            <span className="text-primary-amber">₹25,000 One-Time.</span> Zero Hassle.
          </h2>

          <p className="text-sm sm:text-lg text-[#726F6D] font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            Stop juggling multiple freelance agencies, theme subscriptions, and separate developers. We design, build, integrate payments, and deploy your complete ecommerce store ready to sell.
          </p>

          {/* Pricing Highlight Pill */}
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 p-3 sm:p-4 bg-white border-2 border-primary/40 rounded-3xl shadow-lg mb-8">
            <div className="text-left px-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#726F6D] block">
                Standard Launch Package
              </span>
              <span className="text-2xl sm:text-3xl font-heading font-black text-[#111111]">
                ₹25,000 <span className="text-xs sm:text-sm font-bold text-[#726F6D]">all-inclusive development</span>
              </span>
            </div>
            <Link
              to="/ordernow?service=ecommerce"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              Commission Your Store <ArrowRight size={14} />
            </Link>
          </div>

          {/* Fast Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center">
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">500</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">Products Supported</span>
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">Razorpay</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">UPI & Cards Ready</span>
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">7–10 Days</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">Rapid Turnaround</span>
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-[#111111]/10">
              <span className="text-base sm:text-lg font-black text-[#111111] block">30 Days</span>
              <span className="text-[10px] text-[#726F6D] font-bold uppercase">Post-Launch Support</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Ecommerce Sections */}
        <div className="flex justify-center mb-12">
          <div className="bg-white border-2 border-primary/30 p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1">
            <button
              onClick={() => setEcommerceTab("features")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                ecommerceTab === "features" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Included Features
            </button>
            <button
              onClick={() => setEcommerceTab("pages")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                ecommerceTab === "pages" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Website Pages (14 Included)
            </button>
            <button
              onClick={() => setEcommerceTab("process")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                ecommerceTab === "process" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Launch Process
            </button>
            <button
              onClick={() => setEcommerceTab("faq")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                ecommerceTab === "faq" ? "bg-[#111111] text-[#FCBF14] shadow" : "text-[#726F6D] hover:text-[#111111]"
              }`}
            >
              Pricing & Scope FAQ
            </button>
          </div>
        </div>

        {/* TAB 1: Core Features */}
        {ecommerceTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {coreEcommerceFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hex-card bg-white border-2 border-primary/30 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="font-heading font-black text-base text-[#111111] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#726F6D] font-medium leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* TAB 2: Website Pages */}
        {ecommerceTab === "pages" && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white border-2 border-primary/30 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-heading font-black text-[#111111] mb-2">
                14 Production-Ready Store Pages
              </h3>
              <p className="text-xs sm:text-sm text-[#726F6D] font-medium mb-6">
                Your store launches with full consumer-grade shopping flows, compliance policies, and executive brand pages:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {standardPages.map((pg, idx) => (
                  <div key={idx} className="p-4 bg-[#FFF9E8] rounded-2xl border border-primary/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-black text-sm text-[#111111]">{pg.name}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#111111] text-[#FCBF14]">
                          {pg.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#726F6D] leading-relaxed">
                        {pg.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Launch Process */}
        {ecommerceTab === "process" && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {launchWorkflow.map((item, idx) => (
                <div key={idx} className="hex-card bg-white border-2 border-primary/30 p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] text-[#FCBF14] font-mono font-black text-xs flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h4 className="font-heading font-black text-sm text-[#111111] mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#726F6D] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FAQ */}
        {ecommerceTab === "faq" && (
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            {ecommerceFaqs.map((f, idx) => (
              <div key={idx} className="bg-white border-2 border-primary/30 p-6 rounded-2xl shadow-sm">
                <h4 className="font-heading font-black text-sm sm:text-base text-[#111111] mb-2 flex items-start gap-2">
                  <HelpCircle size={18} className="text-primary-amber shrink-0 mt-0.5" />
                  <span>{f.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#726F6D] font-medium leading-relaxed pl-6">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Transparent Third-Party Policy Banner */}
        <div className="max-w-4xl mx-auto bg-[#111111] text-white p-8 rounded-3xl shadow-xl mb-16 border-2 border-[#FCBF14]/40">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCBF14]/20 border border-[#FCBF14]/40 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} className="text-[#FCBF14]" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white mb-2">
                100% Transparent Third-Party Infrastructure Policy
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium mb-3">
                SlideBee’s ₹25,000 fee covers design, full-stack development, Razorpay payment integration, and initial deployment. You own all your accounts directly with zero markups:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Domain registration (~₹800/yr on Cloudflare/GoDaddy)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Razorpay gateway per-transaction fees (~2%)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Free Cloudflare hosting & SSL included ($0/mo)
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#FCBF14]" /> Free Zoho business email tier setup included ($0/mo)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Switch to Presentation Design Banner */}
        <div className="max-w-4xl mx-auto bg-white border-2 border-primary/40 rounded-3xl p-6 sm:p-8 shadow-md mb-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary-amber block mb-1">
              Presentation Design Agency
            </span>
            <h4 className="font-heading font-black text-lg sm:text-xl text-[#111111] mb-1">
              Need Pitch Decks, Conference Keynotes, or Slide Redesigns?
            </h4>
            <p className="text-xs sm:text-sm text-[#726F6D] font-medium">
              Inspect our 6 executive presentation design capabilities with interactive before-and-after sliders.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchToPresentation}
            className="bg-[#111111] hover:bg-black text-[#FCBF14] font-extrabold px-6 py-3 rounded-full text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Layers size={14} /> View PPT Design Services
          </button>
        </div>

        {/* Final CTA Strip */}
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#111111] mb-3">
            Ready to Launch Your Ecommerce Store?
          </h2>
          <p className="text-xs sm:text-sm text-[#726F6D] font-medium mb-6">
            Tell us about your brand and catalog. Our lead engineer will contact you within 2 hours with an onboarding blueprint.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/ordernow?service=ecommerce"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              Get Started for ₹25,000 <ArrowRight size={14} />
            </Link>
            <Link
              to="/contact?service=ecommerce"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#111111] font-bold px-6 py-3.5 rounded-full text-xs sm:text-sm border border-[#111111]/20 transition-all"
            >
              Talk to Our Engineering Desk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
