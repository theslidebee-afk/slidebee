import { motion } from "framer-motion";
import { Star } from "lucide-react";

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

interface HomeTestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

export function HomeTestimonialsSection({ testimonials }: HomeTestimonialsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 bg-[#FFF9E8] pt-12 pb-20"
    >
      <div className="w-[92%] max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="hex-pill inline-block bg-white border border-primary/40 text-primary-amber px-6 py-2 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-sm">
            Client Reviews
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#111111]">
            Trusted by Founders & Executives
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mx-auto">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="hex-card bg-[#FFF9E8] border-2 border-primary/35 p-5 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1 text-primary mb-2.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={13} fill="#FCBF14" />
                  ))}
                </div>
                <p className="text-[#111111] text-xs font-medium leading-relaxed mb-4 italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-3 border-t border-primary/20">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="hex-pill w-8 h-8 object-cover border border-primary/30"
                />
                <div>
                  <h5 className="font-heading font-extrabold text-xs text-[#111111]">
                    {t.name}
                  </h5>
                  <p className="text-[10px] text-[#726F6D] font-medium">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
