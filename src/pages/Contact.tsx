import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ShieldCheck,
  Phone
} from "lucide-react";
import { d1 } from "../lib/d1";
import { sendContactNotificationEmail } from "../lib/email";
import { usePageSEO } from "../hooks/usePageSEO";

export default function Contact() {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get("service") || searchParams.get("type");
  const isEcommerce = !!(
    serviceParam?.toLowerCase().includes("ecommerce") ||
    serviceParam?.toLowerCase().includes("engineering")
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [serviceCategory, setServiceCategory] = useState(isEcommerce ? "ecommerce" : "presentation");
  const [subject, setSubject] = useState(
    isEcommerce ? "Ecommerce Store Development (₹25,000) Inquiry" : ""
  );
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

  usePageSEO(
    isEcommerce
      ? {
          title: "Talk to Engineering Desk | Ecommerce Store Development | SlideBee",
          description: "Connect with SlideBee lead engineering desk. Inquire about our ₹25,000 full-stack ecommerce website development package, payment gateways, and custom store architecture.",
        }
      : {
          title: "Contact SlideBee | 2-Hour Response Time | Presentation Studio",
          description: "Connect with SlideBee executive presentation design studio. Submit pitch deck briefs, get bespoke quotes, or message our directors directly.",
        }
  );

  useEffect(() => {
    d1
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
    const cleanPhone = phone.trim();

    if (!cleanEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid phone number (mandatory field to receive brief estimate).");
      return;
    }

    if (!message.trim()) {
      setErrorMsg("Please describe your project or store requirements.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Structured inquiry persistence in orders table with phone & company
      const randomArray = new Uint32Array(1);
      crypto.getRandomValues(randomArray);
      const inqRef = `INQ-${100000 + (randomArray[0] % 900000)}`;

      try {
        await d1.from("orders").insert([
          {
            order_reference: inqRef,
            service_type: serviceCategory === "ecommerce" ? "Ecommerce Development Inquiry" : "Inbound Quote Request",
            status: "inquiry",
            full_name: name || "Prospective Client",
            email: cleanEmail,
            phone: cleanPhone,
            company: company || "",
            project_brief: `[Subject: ${subject || "General Inquiry"}]\n[Category: ${serviceCategory}]\n[Phone: ${cleanPhone}]\n[Company: ${company}]\n\n${message}`,
            style_preference: "Direct Website Inquiry"
          }
        ]);
      } catch (inqErr: any) {
        console.warn("Orders inquiry insert notice:", inqErr);
      }

      // 2. Secondary backup in waitlist
      const { error } = await d1.from("waitlist").insert([
        {
          email: cleanEmail,
          source: `contact_form: ${name || "Anonymous"} | Tel: ${cleanPhone} | Sub: ${subject || "General Inquiry"} | Msg: ${message}`
        }
      ]);

      if (error) throw error;

      // Dispatch confirmation email to client & routed notification to studio
      sendContactNotificationEmail({
        name,
        email: cleanEmail,
        phone: cleanPhone,
        company,
        serviceCategory,
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

              </div>
            </div>

            {/* Client NDA & Confidentiality Guarantee */}
            <div className="hex-card-dark bg-[#111111] border-2 border-primary text-white p-6 shadow-xl">
              <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck size={16} className="text-primary" /> {isEcommerce ? "Mutual NDA & IP Protection" : "Mutual NDA & Confidentiality"}
              </div>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                {isEcommerce
                  ? "All client product data, catalog CSVs, source code, and commercial specifications are protected under strict non-disclosure terms with enterprise-grade privacy."
                  : "All client presentations, briefs, and commercial assets are protected under strict non-disclosure terms with enterprise-grade data privacy."}
              </p>
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
                    {isEcommerce
                      ? <>Thank you for reaching out. Our lead engineer will review your store requirements and reply to <strong>{email}</strong> within 2 hours.</>
                      : <>Thank you for reaching out. A senior design director will review your message and reply to <strong>{email}</strong> within 2 hours.</>}
                  </p>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setName("");
                      setEmail("");
                      setPhone("");
                      setCompany("");
                      setSubject(isEcommerce ? "Ecommerce Store Development (₹25,000) Inquiry" : "");
                      setMessage("");
                    }}
                    className="hex-pill bg-primary hover:bg-primary-dark text-[#111111] font-black px-6 py-2.5 text-xs cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-heading font-extrabold text-[#111111] mb-2">
                    {isEcommerce ? "Send Us a Store Engineering Note" : "Send Us a Project Note"}
                  </h3>

                  {/* Row 1: Name & Email */}
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
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-hidden focus:border-primary transition-colors"
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
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-hidden focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone (Mandatory) & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                        Phone Number * (Mandatory)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-hidden focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="Acme Corp / Brand Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-hidden focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 3: Service Category & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                        Service Category *
                      </label>
                      <select
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 rounded-full px-4 py-3 text-xs text-[#111111] font-bold outline-hidden focus:border-primary transition-colors cursor-pointer"
                      >
                        <option value="presentation">Executive Presentation Design</option>
                        <option value="ecommerce">Ecommerce Store Development (₹25,000)</option>
                        <option value="templates">Custom Template System</option>
                        <option value="redesign">24-Hour Keynote Redesign</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                        Subject / Project Title
                      </label>
                      <input
                        type="text"
                        placeholder={
                          isEcommerce
                            ? "e.g. 500-Product Storefront / Razorpay Integration"
                            : "e.g. Series A Pitch Deck / 24h Keynote Redesign"
                        }
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-[#FFF9E8] border border-primary/30 hex-pill px-4 py-3 text-xs text-[#111111] font-medium outline-hidden focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* 50% Advance Notice Badge */}
                  <div className="bg-[#FFF4D9] border-l-4 border-[#FCBF14] p-3.5 rounded-xl flex items-start gap-3 text-left shadow-xs">
                    <ShieldCheck size={18} className="text-[#111111] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-extrabold text-[#111111] block mb-0.5">
                        50% Advance Deposit Required to Initiate Work
                      </span>
                      <span className="text-[#555555]">
                        To guarantee dedicated senior design & engineering capacity, all custom briefs require a 50% advance deposit upon scope confirmation.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#726F6D] block mb-1.5">
                      {isEcommerce ? "Tell Us About Your Store Requirements *" : "Tell Us About Your Project *"}
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder={
                        isEcommerce
                          ? "Tell us about your brand, product categories, payment requirements (Razorpay, Stripe, Cashfree, COD), target launch date, or any existing website URL..."
                          : "Share details about your deck, number of slides, target presentation date, and any link to draft slides..."
                      }
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#FFF9E8] border border-primary/30 hex-card p-4 text-xs text-[#111111] font-medium outline-hidden focus:border-primary transition-colors resize-none"
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
                    {isSubmitting ? "Sending..." : isEcommerce ? "Submit Engineering Inquiry" : "Submit Project Inquiry"} <Send size={15} />
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
