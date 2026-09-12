import { useState, useEffect } from "react";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck,
  Phone,
  MapPin
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { sendContactNotificationEmail } from "../lib/email";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [contactConfig, setContactConfig] = useState<any>({
    headline: "Let’s Talk About Your Next Presentation.",
    subheadline: "Have an upcoming investor pitch, board keynote, or custom template project? Send us a message and our team will get back to you within 2 hours.",
    generalEmail: "hello@theslidebee.com",
    supportEmail: "support@theslidebee.com",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    responseGuarantee: "2-Hour Response Time",
    availabilityNotice: "Our design studio operates 24/7 with dedicated shifts across North America, Europe, and Asia to guarantee fast turns.",
    address: "SlideBee Design Studio, Bengaluru, Karnataka 560001, India (Hubs: Singapore & San Francisco)"
  });

  usePageSEO({
    title: "Contact SlideBee | 2-Hour Response Time | Presentation Studio",
    description: "Connect with SlideBee executive presentation design studio. Submit pitch deck briefs, get bespoke quotes, or message our directors directly.",
  });

  useEffect(() => {
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "contact_cms")
      .single()
      .then(({ data }) => {
        if (data?.value) setContactConfig(data.value);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !message) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          email: cleanEmail,
          source: `contact_form: ${name || "Anonymous"} | Sub: ${subject || "General Inquiry"} | Msg: ${message}`
        }
      ]);

      if (error) throw error;

      // Dispatch confirmation email to client & notification to studio
      sendContactNotificationEmail({
        name,
        email: cleanEmail,
        subject: subject || "General Inquiry",
        message
      }).catch(err => console.warn("Contact email notice:", err));

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Contact error:", err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] overflow-hidden pt-28 pb-20 large-hex-grid">
      
      {/* 1. HERO SECTION */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/12 rounded-full blur-[140px] pointer-events-none" />

        <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          {contactConfig.responseGuarantee || "2-Hour Response Time"}
        </span>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-[#111111] leading-[1.12] mb-4 tracking-tight">
          {contactConfig.headline}
        </h1>

        <p className="text-[#726F6D] text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
          {contactConfig.subheadline}
        </p>
      </section>

      {/* 2. CONTACT GRID (Direct Details + Form) */}
      <section className="w-[90%] max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Info & Guarantees */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="hex-card-lg bg-white border-2 border-primary/40 p-6 sm:p-8 shadow-md">
              <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-4">
                Direct Channels
              </h3>

              <div className="space-y-4">
                <a
                  href={`mailto:${contactConfig.generalEmail || "hello@theslidebee.com"}`}
                  className="flex items-center gap-3.5 p-3.5 hex-card bg-[#FFF9E8] border border-primary/30 hover:border-primary transition-all group"
                >
                  <div className="hex-pure w-10 h-10 bg-primary/20 text-primary-amber flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#111111] group-hover:text-primary-amber transition-colors">
                      General Inquiries
                    </div>
                    <div className="text-xs text-[#726F6D] font-medium">
                      {contactConfig.generalEmail || "hello@theslidebee.com"}
                    </div>
                  </div>
                </a>

                <a
                  href={`mailto:${contactConfig.supportEmail || "support@theslidebee.com"}`}
                  className="flex items-center gap-3.5 p-3.5 hex-card bg-[#FFF9E8] border border-primary/30 hover:border-primary transition-all group"
                >
                  <div className="hex-pure w-10 h-10 bg-primary/20 text-primary-amber flex items-center justify-center shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#111111] group-hover:text-primary-amber transition-colors">
                      Active Orders & Support
                    </div>
                    <div className="text-xs text-[#726F6D] font-medium">
                      {contactConfig.supportEmail || "support@theslidebee.com"}
                    </div>
                  </div>
                </a>

                {contactConfig.whatsapp && (
                  <a
                    href={`https://wa.me/${contactConfig.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3.5 hex-card bg-[#FFF9E8] border border-primary/30 hover:border-primary transition-all group"
                  >
                    <div className="hex-pure w-10 h-10 bg-primary/20 text-primary-amber flex items-center justify-center shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#111111] group-hover:text-primary-amber transition-colors">
                        WhatsApp Fast Hotline
                      </div>
                      <div className="text-xs text-[#726F6D] font-medium">
                        {contactConfig.whatsapp}
                      </div>
                    </div>
                  </a>
                )}

                <div className="flex items-start gap-3.5 p-3.5 hex-card bg-[#FFF9E8] border border-primary/30">
                  <div className="hex-pure w-10 h-10 bg-primary/20 text-primary-amber flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#111111]">
                      Studio Locations
                    </div>
                    <div className="text-xs text-[#726F6D] font-medium leading-relaxed">
                      {contactConfig.address || "SlideBee Design Studio, Bengaluru, Karnataka 560001, India"}
                    </div>
                    <div className="text-[11px] text-[#FCBF14] font-bold mt-0.5">
                      Global Delivery Hubs: Singapore & San Francisco
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Hours & Response Guarantee */}
            <div className="hex-card-dark bg-[#111111] border-2 border-primary text-white p-6 shadow-xl">
              <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-2">
                <Clock size={15} /> Studio Availability
              </div>
              <p className="text-xs text-gray-300 font-medium leading-relaxed mb-4">
                Our design studio operates 24/7 with dedicated shifts across North America, Europe, and Asia to guarantee fast turns.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 border-t border-primary/30 pt-3">
                <ShieldCheck size={14} className="text-primary" /> Strict NDA & data confidentiality protected
              </div>
            </div>

          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="hex-card-lg bg-white border-2 border-primary/40 p-6 sm:p-10 shadow-xl">
              
              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="hex-pure w-16 h-16 bg-primary/20 text-primary-amber mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold text-[#111111] mb-2">
                    Message Received!
                  </h3>
                  <p className="text-[#726F6D] text-xs sm:text-sm font-medium max-w-md mx-auto mb-6">
                    Thank you for reaching out. A senior design director will review your message and reply to <strong>{email}</strong> within 2 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-2">
                    Send Us a Project Note
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="Sarah Jenkins"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                      Subject / Project Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Series A Pitch Deck / 24h Keynote Redesign"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                      Tell Us About Your Project *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Share details about your deck, number of slides, target presentation date, and any link to draft slides..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-primary/30 hex-card p-4 text-xs text-[#111111] font-medium outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-600 font-bold">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="hex-pill w-full bg-primary hover:bg-primary-dark text-[#111111] font-black py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:scale-105 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Submit Project Inquiry"} <Send size={15} />
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
