import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sendOrderConfirmationEmail } from '../lib/email';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  UploadCloud, 
  Clock, 
  Shield, 
  Layers,
  ChevronDown,
  Check,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { usePageSEO } from '../hooks/usePageSEO';

interface SlideBeeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  name?: string;
}

function SlideBeeSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  name
}: SlideBeeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
        {label}
      </label>

      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button styled with SlideBee brand colors */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between bg-[#FFF9E8] border-2 transition-all duration-200 rounded-2xl px-4 py-3.5 text-left text-xs sm:text-sm font-bold text-[#111111] shadow-sm cursor-pointer select-none ${
          isOpen
            ? "border-primary ring-2 ring-primary/30 shadow-md"
            : "border-primary/40 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-primary-amber transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-[#111111]" : ""
          }`}
        />
      </button>

      {/* Floating Animated Custom Menu in Warm Milk & Honey Gold */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 right-0 mt-2 bg-[#FFFDF7] border-2 border-primary rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden py-1.5 max-h-60 overflow-y-auto"
            role="listbox"
          >
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-primary text-[#111111] font-black"
                      : "text-[#111111] font-semibold hover:bg-primary/20"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#111111] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrderNow() {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Presentation Redesign',
    slideCount: '10–25 Slides',
    timeline: '48h Fast Turnaround',
    format: 'Master PowerPoint (.pptx)',
    stylePreference: 'Modern & High-Impact',
    driveLink: '',
    projectNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  usePageSEO({
    title: "Order Custom Presentation Design | SlideBee",
    description: "Submit your presentation design brief. 24h–48h turnaround, senior art director assignment, signed NDA, 100% editable PPTX.",
  });

  const services = [
    'Presentation Redesign',
    'Investor Pitch Decks',
    'Executive & Board Keynotes',
    'Data & Financial Visualization',
    'Master Branded Template Systems',
    'Sales & Marketing Collateral'
  ];

  const slideRanges = [
    '1–10 Slides (Micro Deck)',
    '10–25 Slides (Standard Pitch / Keynote)',
    '25–50 Slides (Full Business Plan)',
    '50+ Slides (Enterprise Deck)'
  ];

  const timelines = [
    'Urgent 24-Hour Rush',
    '48h Fast Turnaround',
    '3–5 Business Days',
    'Flexible / Milestone Based'
  ];

  const formats = [
    'Master PowerPoint (.pptx)',
    'Master PowerPoint (.pptx) + High-Res PDF',
    'Enterprise Master Template (.potx)'
  ];

  const stylePreferences = [
    'Modern & High-Impact (Clean & Bold)',
    'Executive & Formal (McKinsey / BCG Style)',
    'Tech & Minimalist (Dark/Glass/Sleek)',
    'Vibrant & Creative (Custom Vector / 3D)'
  ];

  useEffect(() => {
    const serviceParam = searchParams.get('service') || searchParams.get('ref');
    const tierParam = searchParams.get('tier');

    if (serviceParam) {
      const paramDecoded = decodeURIComponent(serviceParam).trim();
      const paramLower = paramDecoded.toLowerCase();
      // 1. Exact match
      const exactMatch = services.find(s => s.toLowerCase() === paramLower);
      if (exactMatch) {
        setFormData(prev => ({ ...prev, service: exactMatch }));
      } else {
        // 2. Keyword-based intelligent match
        const matched = services.find(s => {
          const sLower = s.toLowerCase();
          return sLower.includes(paramLower) || paramLower.includes(sLower) ||
            (paramLower.includes('pitch') && sLower.includes('pitch')) ||
            (paramLower.includes('keynote') && sLower.includes('keynote')) ||
            (paramLower.includes('board') && sLower.includes('keynote')) ||
            (paramLower.includes('template') && sLower.includes('template')) ||
            (paramLower.includes('data') && sLower.includes('data')) ||
            (paramLower.includes('financial') && sLower.includes('data')) ||
            (paramLower.includes('sales') && sLower.includes('sales')) ||
            (paramLower.includes('proposal') && sLower.includes('sales')) ||
            (paramLower.includes('marketing') && sLower.includes('sales')) ||
            (paramLower.includes('redesign') && sLower.includes('redesign'));
        });
        if (matched) {
          setFormData(prev => ({ ...prev, service: matched }));
        } else {
          setFormData(prev => ({ ...prev, service: paramDecoded }));
        }
      }
    } else if (tierParam) {
      if (tierParam.toLowerCase().includes('starter') || tierParam.toLowerCase().includes('micro')) {
        setFormData(prev => ({ ...prev, slideCount: '1–10 Slides (Micro Deck)' }));
      } else if (tierParam.toLowerCase().includes('growth') || tierParam.toLowerCase().includes('pro')) {
        setFormData(prev => ({ ...prev, slideCount: '10–25 Slides (Standard Pitch / Keynote)' }));
      } else if (tierParam.toLowerCase().includes('enterprise')) {
        setFormData(prev => ({ ...prev, slideCount: '50+ Slides (Enterprise Deck)', service: 'Master Branded Template Systems' }));
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Please provide your full name and email address so our creative lead can confirm your scope.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError("Please provide a valid business email address.");
      return;
    }

    setIsSubmitting(true);

    const generatedId = `SB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Save to Supabase
      const { error: sbError } = await supabase.from('orders').insert([
        {
          order_reference: generatedId,
          service_type: formData.service,
          slide_count: formData.slideCount,
          timeline: formData.timeline,
          formats: [formData.format],
          style_preference: formData.stylePreference,
          drive_url: formData.driveLink,
          project_brief: formData.projectNotes,
          full_name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          status: 'pending'
        }
      ]);

      if (sbError) {
        console.warn('Supabase orders notice:', sbError.message);
      }

      // 2. Dispatch Automated Confirmation Email via Resend
      sendOrderConfirmationEmail({
        clientName: formData.name,
        clientEmail: formData.email,
        serviceType: formData.service,
        slideCount: formData.slideCount,
        rushDelivery: formData.timeline.includes('24h') || formData.timeline.includes('rush'),
        driveLink: formData.driveLink
      }).catch(err => console.warn('Email dispatch notice:', err));

      // 3. Local backup
      const savedOrders = JSON.parse(localStorage.getItem('slidebee_orders') || '[]');
      savedOrders.push({ ...formData, orderId: generatedId, createdAt: new Date().toISOString() });
      localStorage.setItem('slidebee_orders', JSON.stringify(savedOrders));
    } catch (err: any) {
      console.warn('Order submission fallback to local storage:', err);
      const savedOrders = JSON.parse(localStorage.getItem('slidebee_orders') || '[]');
      savedOrders.push({ ...formData, orderId: generatedId, createdAt: new Date().toISOString() });
      localStorage.setItem('slidebee_orders', JSON.stringify(savedOrders));
    } finally {
      setIsSubmitting(false);
      setOrderId(generatedId);
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] pt-28 pb-20 large-hex-grid">
      <div className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
            SlideBee Project Request & Quote Intake
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#111111] mb-3 leading-tight">
            Start Your Presentation Project
          </h1>
          <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto">
            Provide your project details below. Our senior art director will review your scope and send a confirmed proposal and quote within 2 hours.
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-primary rounded-3xl p-8 md:p-12 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-primary/20 text-primary-amber rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={44} />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-primary-amber bg-[#FFF9E8] px-4 py-1 rounded-full border border-primary/20">
              Project Reference: {orderId}
            </span>

            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111] mt-4 mb-3">
              Project Request Received
            </h2>

            <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-lg mx-auto mb-8 leading-relaxed">
              Thank you, <strong className="text-[#111111]">{formData.name}</strong>. We've queued your project for <strong>{formData.service}</strong>. A designated presentation lead has been assigned and will email you at <strong className="text-[#111111]">{formData.email}</strong> shortly.
            </p>

            <div className="bg-[#FFF9E8] border border-[#111111]/5 rounded-2xl p-6 text-left max-w-lg mx-auto mb-8 space-y-2.5 text-xs text-[#111111]">
              <div className="flex justify-between border-b border-[#111111]/5 pb-2">
                <span className="text-[#726F6D]">Service:</span>
                <span className="font-bold">{formData.service}</span>
              </div>
              <div className="flex justify-between border-b border-[#111111]/5 pb-2">
                <span className="text-[#726F6D]">Scope:</span>
                <span className="font-bold">{formData.slideCount}</span>
              </div>
              <div className="flex justify-between border-b border-[#111111]/5 pb-2">
                <span className="text-[#726F6D]">Timeline:</span>
                <span className="font-bold">{formData.timeline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#726F6D]">Deliverable:</span>
                <span className="font-bold">{formData.format}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/thank-you?type=order&ref=${orderId}`}
                className="bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-1.5"
              >
                Track SLA & Next Steps <ArrowRight size={14} />
              </Link>
              <Link
                to="/"
                className="bg-white hover:bg-gray-50 text-[#111111] font-extrabold px-6 py-3.5 rounded-full text-xs sm:text-sm border border-[#111111]/15 transition-all inline-flex items-center justify-center gap-1.5"
              >
                Return to Homepage
              </Link>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setFormError(null);
                }}
                className="bg-[#FFF9E8] hover:bg-primary/20 text-[#111111] font-bold px-6 py-3.5 rounded-full text-xs border border-[#111111]/10 transition-all"
              >
                Submit Another Project
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {formError && (
              <div className="p-4 bg-red-50 border-2 border-red-500/40 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-sm">
                <AlertCircle size={20} className="text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            
            {/* Step 1: Project Scope */}
            <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                <div className="w-8 h-8 rounded-xl bg-primary text-[#111111] font-black text-xs flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#111111]">
                    Project Scope & Objectives
                  </h3>
                  <p className="text-xs text-[#726F6D] font-medium">
                    What type of presentation do you need crafted?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* Service Selection */}
                <SlideBeeSelect
                  label="Primary Service *"
                  value={formData.service}
                  onChange={(val) => setFormData({ ...formData, service: val })}
                  options={services}
                  name="service"
                />

                {/* Slide Count */}
                <SlideBeeSelect
                  label="Estimated Slide Count *"
                  value={formData.slideCount}
                  onChange={(val) => setFormData({ ...formData, slideCount: val })}
                  options={slideRanges}
                  name="slideCount"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Timeline */}
                <SlideBeeSelect
                  label="Desired Delivery Timeline *"
                  value={formData.timeline}
                  onChange={(val) => setFormData({ ...formData, timeline: val })}
                  options={timelines}
                  name="timeline"
                />

                {/* Output Format */}
                <SlideBeeSelect
                  label="Deliverable Format *"
                  value={formData.format}
                  onChange={(val) => setFormData({ ...formData, format: val })}
                  options={formats}
                  name="format"
                />
              </div>
            </div>

            {/* Step 2: Brand & Design Preferences */}
            <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                <div className="w-8 h-8 rounded-xl bg-primary text-[#111111] font-black text-xs flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#111111]">
                    Design Style & Project Files
                  </h3>
                  <p className="text-xs text-[#726F6D] font-medium">
                    Share your visual preferences and existing draft materials.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Visual Style */}
                <SlideBeeSelect
                  label="Design & Visual Style"
                  value={formData.stylePreference}
                  onChange={(val) => setFormData({ ...formData, stylePreference: val })}
                  options={stylePreferences}
                  name="stylePreference"
                />

                {/* Cloud Link for Draft Slides */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2 flex items-center justify-between">
                    <span>Draft Slides / Brand Asset Link (Google Drive / Dropbox)</span>
                    <span className="text-[10px] text-[#726F6D] font-normal">Optional</span>
                  </label>
                  <div className="relative">
                    <UploadCloud className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#726F6D]" />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={formData.driveLink}
                      onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                      className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#111111] placeholder-gray-400 font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Detailed Brief */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Project Brief & Key Requirements *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your audience, key message, brand guidelines, or specific slides you want to emphasize..."
                    value={formData.projectNotes}
                    onChange={(e) => setFormData({ ...formData, projectNotes: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl p-4 text-xs sm:text-sm text-[#111111] placeholder-gray-400 font-medium focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Contact & Proposal Delivery */}
            <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
                <div className="w-8 h-8 rounded-xl bg-primary text-[#111111] font-black text-xs flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-[#111111]">
                    Contact & Proposal Delivery
                  </h3>
                  <p className="text-xs text-[#726F6D] font-medium">
                    Where should we send the proposal and custom quote?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singhania"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nexora Ventures"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-primary/30 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Guarantees & Submit Button */}
            <div className="bg-white border-2 border-primary/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-xs text-[#726F6D] font-medium">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-primary-amber" /> 100% Confidential & NDA Protected
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary-amber" /> Guaranteed 2-Hour Response Time
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-primary-amber" /> Unlimited Revisions & Editable Source Files
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto bg-primary hover:bg-primary-dark text-[#111111] font-black px-10 py-4 rounded-full text-sm sm:text-base shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Submitting Project...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Project Request & Get Quote
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
