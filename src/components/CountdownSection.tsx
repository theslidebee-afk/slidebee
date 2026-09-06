import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { Mail, CheckCircle2, Sparkles } from "lucide-react";

// Launch date: 30 days from October 1, 2026
const LAUNCH_DATE = new Date("2026-10-01T00:00:00Z").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <motion.div
          key={display}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-20 h-20 md:w-28 md:h-28 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
        >
          <span className="text-4xl md:text-5xl font-heading font-bold text-white tabular-nums">
            {display}
          </span>
        </motion.div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-black/20 pointer-events-none" />
      </div>
      <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-white/60 font-medium">
        {label}
      </span>
    </div>
  );
}

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          email,
          source: "countdown_section"
        }
      ]);
      if (error) throw error;
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("done"); // Soft success
    }
  }

  return (
    <section className="relative py-28 bg-[#0b0f19] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]"
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-8"
        >
          <Sparkles size={14} />
          Template Library — Coming Soon
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 leading-tight"
        >
          Downloadable Templates
          <br />
          <span className="text-primary">Launching In</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-white/60 mb-14 max-w-xl mx-auto"
        >
          Professional, ready-to-use presentation templates crafted by our expert designers.
          Join the waitlist to get early access.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-end justify-center gap-4 md:gap-8 mb-16"
        >
          <CountdownBox value={timeLeft.days} label="Days" />
          <span className="text-4xl md:text-5xl font-bold text-white/30 mb-8">:</span>
          <CountdownBox value={timeLeft.hours} label="Hours" />
          <span className="text-4xl md:text-5xl font-bold text-white/30 mb-8">:</span>
          <CountdownBox value={timeLeft.minutes} label="Minutes" />
          <span className="text-4xl md:text-5xl font-bold text-white/30 mb-8">:</span>
          <CountdownBox value={timeLeft.seconds} label="Seconds" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto"
        >
          <AnimatePresence mode="wait">
            {status === "done" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 text-white"
              >
                <CheckCircle2 className="w-14 h-14 text-green-400" />
                <p className="text-xl font-semibold">You're on the list!</p>
                <p className="text-white/60 text-sm">We'll email you the moment templates go live.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-7 py-4 bg-primary hover:bg-primary-dark text-foreground font-extrabold rounded-xl transition-all duration-200 disabled:opacity-50 shrink-0 shadow-lg shadow-primary/30"
                >
                  {status === "loading" ? "Joining..." : "Notify Me"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === "error" && (
            <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>
          )}

          {status !== "done" && (
            <p className="text-white/30 text-xs mt-4">
              No spam. Unsubscribe anytime. We respect your inbox.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
