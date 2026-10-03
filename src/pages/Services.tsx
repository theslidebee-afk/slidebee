import { useState, useEffect, useMemo, createElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { d1 } from "../lib/d1";
import { HexProcessInfographic } from "../components/HexProcessInfographic";
import { Suspended3DCarousel } from "../components/Suspended3DCarousel";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  STORAGE_BASE,
  defaultServicesData,
  PresentationServicesSection,
  EcommercePackageSection,
  type ServiceDetail
} from "../features/services";

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type") || searchParams.get("category");
  const serviceParam = searchParams.get("service");

  // Top-Level Service Category: Presentation Design vs E-Commerce Website Development
  const [activeCategory, setActiveCategory] = useState<"presentation" | "ecommerce">(() => {
    const initialParam =
      new URLSearchParams(window.location.hash.split("?")[1] || window.location.search).get("type") ||
      new URLSearchParams(window.location.hash.split("?")[1] || window.location.search).get("category");
    return initialParam === "ecommerce" ? "ecommerce" : "presentation";
  });

  // Sync category with URL query param
  useEffect(() => {
    if (typeParam === "ecommerce") {
      setActiveCategory("ecommerce");
    } else if (typeParam === "presentation") {
      setActiveCategory("presentation");
    }
  }, [typeParam]);

  // Dynamic SEO metadata
  usePageSEO(
    activeCategory === "ecommerce"
      ? {
          title: "Ecommerce Website Development Package (₹25,000) | SlideBee",
          description:
            "Complete full-stack ecommerce website development for small and medium businesses at ₹25,000 one-time. 500 products, Razorpay checkout, customer accounts, Cloudflare hosting, Zoho email, and 30-day support."
        }
      : {
          title: "Executive Presentation Design Services | SlideBee Studio",
          description:
            "Full-service presentation design studio: pitch deck design, keynote polish, board decks, financial data visualization, and master template design."
        }
  );

  const [selectedService, setSelectedService] = useState<string>(() => {
    const initialParam = new URLSearchParams(window.location.hash.split("?")[1] || window.location.search).get("service");
    return initialParam || "redesign";
  });
  const [customServices, setCustomServices] = useState<Record<string, any>>({});

  useEffect(() => {
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, [serviceParam]);

  useEffect(() => {
    d1
      .from("site_config")
      .select("value")
      .eq("key", "services_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) setCustomServices(data.value);
      });
  }, []);

  const mergedServices = useMemo(() => {
    const base: Record<string, ServiceDetail> = { ...defaultServicesData };
    if (customServices && typeof customServices === "object") {
      Object.keys(customServices).forEach((key) => {
        if (base[key]) {
          base[key] = {
            ...base[key],
            ...customServices[key],
            icon: base[key].icon
          };
        } else {
          const item = customServices[key];
          base[key] = {
            id: key,
            title: item.title || "Custom Capability",
            tagline: item.tagline || "Bespoke executive presentation design",
            icon: createElement(Sparkles, { className: "w-5 h-5" }),
            beforeImg: item.beforeImg || `${STORAGE_BASE}/hsbc_slide-2.jpg`,
            afterImg: item.afterImg || `${STORAGE_BASE}/accenture_slide-1.jpg`,
            beforeTitle: item.beforeTitle || "Draft / Before",
            afterTitle: item.afterTitle || "SlideBee Redesign / After",
            turnaround: item.turnaround || "24h – 48h",
            idealFor: item.idealFor || "Venture pitches, corporate decks"
          };
        }
      });
    }
    return base;
  }, [customServices]);

  const activeServiceData = mergedServices[selectedService] || Object.values(mergedServices)[0] || defaultServicesData.redesign;

  const handleSelectCategory = (category: "presentation" | "ecommerce") => {
    setActiveCategory(category);
    setSearchParams({ type: category });
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden">
      {/* OPTION A: PRESENTATION DESIGN STUDIO SERVICES VIEW */}
      {activeCategory === "presentation" && (
        <>
          {/* 1. HERO SECTION WITH 3D SUSPENDED PERSPECTIVE CAROUSEL */}
          <section className="relative bg-[#FFF9E8] pt-24 sm:pt-28 pb-16 border-b border-primary/20 large-hex-grid overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FCBF14]/12 rounded-full blur-[160px] pointer-events-none" />
            <div className="w-full z-10 relative">
              <Suspended3DCarousel
                onSelectService={(svcId) => {
                  setSelectedService(svcId);
                  document.getElementById("services-grid")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          </section>

          {/* 2. THE 6 CORE SERVICES WITH INTERACTIVE BEFORE/AFTER SHOWCASE */}
          <PresentationServicesSection
            mergedServices={mergedServices}
            activeServiceData={activeServiceData}
            onSelectService={(svcId) => setSelectedService(svcId)}
          />

          {/* 3. HOW SLIDEBEE WORKS (4-Step Infographic Pipeline) */}
          <section className="py-16 bg-[#FFF9E8] border-t border-primary/20">
            <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/85 backdrop-blur-md rounded-3xl border-2 border-primary/40 p-6 sm:p-10 lg:p-12 shadow-lg">
                <HexProcessInfographic />
              </div>
            </div>
          </section>

          {/* 3.5 ECOMMERCE LAUNCH SPECIAL FEATURE CALLOUT */}
          <section className="py-12 bg-[#FFFDF5] border-t border-primary/20">
            <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#111111] text-white rounded-3xl border-2 border-[#FCBF14]/40 p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="space-y-3 max-w-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FCBF14] bg-[#FCBF14]/15 px-3 py-1 rounded-full border border-[#FCBF14]/30 inline-block">
                    ADDITIONAL STUDIO CAPABILITY
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                    Need a Complete Ecommerce Website for Your Brand?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                    Get an all-inclusive online store for <strong>₹25,000 one-time</strong>. Includes up to 500 products, Razorpay checkout, customer accounts with Google Sign-In, Cloudflare hosting, Zoho email, and 30-day post-launch support.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("ecommerce")}
                    className="bg-[#FCBF14] hover:bg-[#FFE270] text-[#111111] font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-md hover:scale-105 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Switch to Ecommerce Package (₹25K) <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 4. BOTTOM ACTION BANNER */}
          <section className="py-16 bg-[#111111] text-white text-center px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto max-w-2xl z-10 relative">
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white mb-3">
                Have a Presentation Due Soon?
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-medium mb-8 max-w-lg mx-auto">
                Upload your rough outline, draft slides, or bullet points. We'll send you a custom proposal and quote within 2 hours.
              </p>
              <Link
                to="/ordernow"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FCBF14] via-[#FFE270] to-[#FCBF14] bg-[length:200%_auto] animate-gradient-flow text-[#111111] font-black px-8 py-4 rounded-full text-xs sm:text-sm transition-all shadow-xl shadow-[#FCBF14]/25 hover:scale-105"
              >
                Start Your Project Brief <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </>
      )}

      {/* OPTION B: E-COMMERCE WEBSITE DEVELOPMENT SERVICE VIEW */}
      {activeCategory === "ecommerce" && (
        <EcommercePackageSection
          onSwitchToPresentation={() => handleSelectCategory("presentation")}
        />
      )}
    </div>
  );
}
