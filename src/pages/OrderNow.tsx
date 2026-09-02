import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  UploadCloud, 
  Clock, 
  Shield, 
  Layers
} from 'lucide-react';

export default function OrderNow() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Presentation Redesign',
    slideCount: '10–25 Slides',
    timeline: '48h Fast Turnaround',
    format: 'PowerPoint (.pptx) + Google Slides',
    stylePreference: 'Modern & High-Impact',
    driveLink: '',
    projectNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const services = [
    'Presentation Redesign',
    'Investor Pitch Deck',
    'Data & Financial Visualization',
    'Enterprise Master Templates',
    'Keynote & Summit Presentation'
  ];

  const slideRanges = [
    '1–10 Slides (Micro Deck)',
    '10–25 Slides (Standard Pitch / Keynote)',
    '25–50 Slides (Full Business Plan)',
    '50+ Slides (Enterprise Deck)'
  ];

  const timelines = [
    '⚡ Urgent 24-Hour Rush',
    '48h Fast Turnaround',
    '3–5 Business Days',
    'Flexible / Milestone Based'
  ];

  const formats = [
    'PowerPoint (.pptx)',
    'Google Slides',
    'PowerPoint + Google Slides',
    'Canva Editable',
    'Apple Keynote (.key)'
  ];

  const stylePreferences = [
    'Modern & High-Impact (Clean & Bold)',
    'Executive & Formal (McKinsey / BCG Style)',
    'Tech & Minimalist (Dark/Glass/Sleek)',
    'Vibrant & Creative (Custom Vector / 3D)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // 2. Local backup
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
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <span className="text-primary-amber text-xs font-extrabold uppercase tracking-widest block mb-2">
            SlideBee Project Request & Quote Intake 🐝
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
              Project Request Received! 🎉
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
                to="/"
                className="bg-primary hover:bg-primary-dark text-[#111111] font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm shadow-lg hover:scale-105 transition-all"
              >
                Return to Homepage ➔
              </Link>
              <button
                onClick={() => setIsSuccess(false)}
                className="bg-[#FFF9E8] hover:bg-primary/20 text-[#111111] font-bold px-6 py-3.5 rounded-full text-xs border border-[#111111]/10 transition-all"
              >
                Submit Another Project
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Project Scope */}
            <div className="bg-white border border-[#111111]/8 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#111111]/5">
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
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Primary Service *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  >
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Slide Count */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Estimated Slide Count *
                  </label>
                  <select
                    value={formData.slideCount}
                    onChange={(e) => setFormData({ ...formData, slideCount: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  >
                    {slideRanges.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Timeline */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Desired Delivery Timeline *
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  >
                    {timelines.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Deliverable Format *
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  >
                    {formats.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Brand & Design Preferences */}
            <div className="bg-white border border-[#111111]/8 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#111111]/5">
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
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#111111] mb-2">
                    Design & Visual Style
                  </label>
                  <select
                    value={formData.stylePreference}
                    onChange={(e) => setFormData({ ...formData, stylePreference: e.target.value })}
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  >
                    {stylePreferences.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

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
                      className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#111111] placeholder-gray-400 font-medium focus:outline-none focus:border-primary"
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
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl p-4 text-xs sm:text-sm text-[#111111] placeholder-gray-400 font-medium focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Contact & Proposal Delivery */}
            <div className="bg-white border border-[#111111]/8 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#111111]/5">
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
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
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
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
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
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
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
                    className="w-full bg-[#FFF9E8] border border-[#111111]/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#111111] font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Guarantees & Submit Button */}
            <div className="bg-white border border-[#111111]/8 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
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
