import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import type { ServiceDetail } from "./servicesData";

interface PresentationServicesSectionProps {
  mergedServices: Record<string, ServiceDetail>;
  activeServiceData: ServiceDetail;
  onSelectService: (serviceId: string) => void;
}

export const PresentationServicesSection: React.FC<PresentationServicesSectionProps> = ({
  mergedServices,
  activeServiceData,
  onSelectService
}) => {
  return (
    <section id="services-grid" className="py-20 bg-[#FFF9E8] large-hex-grid">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
            Our 6 Specialized Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] mb-3">
            Select a Service to See the Transformation
          </h2>
          <p className="text-[#726F6D] text-xs sm:text-sm font-medium">
            Click any service below to inspect the before-and-after redesign slider and exact deliverables.
          </p>
        </div>

        {/* Service Selector Modern Rounded Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-10 max-w-5xl mx-auto">
          {Object.values(mergedServices).map((svc) => {
            const isSelected = activeServiceData?.id === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => onSelectService(svc.id)}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? "bg-[#111111] text-[#FCBF14] border-[#FCBF14] shadow-lg shadow-[#FCBF14]/20 scale-103"
                    : "bg-white/95 hover:bg-white text-[#111111] border-primary/25 hover:border-primary/60 shadow-xs hover:shadow-md"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                    isSelected
                      ? "bg-[#FCBF14] text-[#111111]"
                      : "bg-[#FFF9E8] text-primary-amber"
                  }`}
                >
                  {svc.icon}
                </div>
                <span className="font-heading font-extrabold text-xs leading-tight">
                  {svc.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE SERVICE BEFORE/AFTER SHOWCASE CONTAINER */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeServiceData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-2 border-primary/40 rounded-3xl p-6 sm:p-10 shadow-xl max-w-5xl mx-auto"
          >
            {/* Header Details */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-primary/20 mb-8">
              <div>
                <div className="inline-block bg-[#FFF9E8] text-primary-amber border border-primary/30 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider mb-2">
                  Turnaround: {activeServiceData.turnaround}
                </div>
                <h3 className="text-xl sm:text-3xl font-heading font-extrabold text-[#111111] mb-1">
                  {activeServiceData.title}
                </h3>
                <p className="text-sm sm:text-base text-[#726F6D] font-medium">
                  {activeServiceData.tagline}
                </p>
              </div>

              <Link
                to={`/ordernow?service=${activeServiceData.id}`}
                className="inline-flex items-center justify-center gap-2 bg-[#FCBF14] hover:bg-[#FFE270] text-[#111111] font-black px-6 py-3 rounded-full text-xs sm:text-sm transition-all shadow-md hover:scale-105 shrink-0"
              >
                Commission This Service <ArrowRight size={14} />
              </Link>
            </div>

            {/* Before/After Interactive Comparison Slider */}
            <BeforeAfterSlider
              beforeImg={activeServiceData.beforeImg}
              afterImg={activeServiceData.afterImg}
              beforeTitle={activeServiceData.beforeTitle}
              afterTitle={activeServiceData.afterTitle}
              idealFor={activeServiceData.idealFor}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
