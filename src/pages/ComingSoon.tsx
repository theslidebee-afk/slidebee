import { useState } from "react";
import { motion } from "framer-motion";
import SlideBeeLogo from "../components/SlideBeeLogo";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Save to Supabase
      const { error } = await supabase.from("waitlist").insert([
        { email: email.trim().toLowerCase(), source: "coming_soon" }
      ]);
      
      if (error && error.code !== "23505") { // Ignore duplicate key errors gracefully
        console.warn("Supabase waitlist error:", error.message);
      }

      // 2. Local fallback backup
      const list = JSON.parse(localStorage.getItem("slidebee_waitlist") || "[]");
      list.push({ email, date: new Date().toISOString() });
      localStorage.setItem("slidebee_waitlist", JSON.stringify(list));

      setSubmitted(true);
    } catch (err) {
      console.error("Waitlist submit error:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9E8] text-[#111111] flex flex-col justify-between relative overflow-hidden px-6 py-12 large-hex-grid">
      
      {/* Soft Ambient Golden Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FCBF14]/12 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="container mx-auto flex items-center justify-between z-10 max-w-4xl">
        <SlideBeeLogo variant="light" size="lg" />
        <span className="hex-pill text-primary-amber font-extrabold text-xs bg-white border border-[#111111]/10 px-5 py-2 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          Coming Soon
        </span>
      </header>

      {/* Minimalist Center Hero */}
      <main className="container mx-auto max-w-2xl text-center my-auto z-10 py-12">
        
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl font-heading font-extrabold text-[#111111] leading-[1.12] mb-6 tracking-tight"
        >
          We Are Crafting <br />
          <span className="text-primary-amber">Something Better.</span>
        </motion.h1>

        {/* Minimal Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[#726F6D] text-base sm:text-lg font-medium max-w-lg mx-auto mb-10 leading-relaxed"
        >
          Premium PowerPoint templates and expert presentation design services — launching soon.
        </motion.p>

        {/* Clean Notification Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          {submitted ? (
            <div className="hex-card bg-white border border-[#111111]/10 p-5 text-center shadow-md flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary-amber shrink-0" />
              <p className="text-xs sm:text-sm font-extrabold text-[#111111]">
                Thank you! We'll notify you when we go live.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="hex-card bg-white border border-[#111111]/15 shadow-md p-2 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email to get notified..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 text-[#111111] placeholder-gray-400 text-xs sm:text-sm focus:outline-none font-medium"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="hex-pill bg-primary hover:bg-primary-dark disabled:opacity-50 text-[#111111] font-extrabold px-6 py-3 text-xs sm:text-sm transition-all shadow-sm hover:scale-105 shrink-0 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Notify Me <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>

      </main>

      {/* Clean Footer (No public preview button) */}
      <footer className="container mx-auto max-w-4xl z-10 pt-8 border-t border-[#111111]/5 flex items-center justify-center text-xs text-[#726F6D] font-medium">
        <p>© 2026 SlideBee. All rights reserved.</p>
      </footer>

    </div>
  );
}
