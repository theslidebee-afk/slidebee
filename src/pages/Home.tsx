import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServicesSection";
import TryNowForm from "../components/TryNowForm";
import CountdownSection from "../components/CountdownSection";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Clock, Layers, Headphones } from "lucide-react";

const featuredWork = [
  {
    client: "Nike x WLT",
    title: "Executive Keynote Agenda",
    category: "Brand & Keynotes",
    image: "/portfolio/nike_hsbc_cvs_1.png"
  },
  {
    client: "HSBC",
    title: "Cost Savings & Headcount Matrix",
    category: "Corporate & Finance",
    image: "/portfolio/nike_hsbc_cvs_8.png"
  },
  {
    client: "CVS Health",
    title: "Digital Platform Ecosystem",
    category: "Healthcare & Tech",
    image: "/portfolio/nike_hsbc_cvs_10.png"
  },
  {
    client: "Levi's",
    title: "Global Marketing Framework",
    category: "Brand Strategy",
    image: "/portfolio/levis_yuengling_3.png"
  }
];

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <ServicesSection />
      
      {/* Before / After Transformation Section */}
      <section className="py-24 bg-[#fffdfa] overflow-hidden border-t border-b border-black/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={14} className="text-primary-dark" />
              Real Presentation Redesign
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              See The <span className="text-primary-amber">Difference</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Drag the slider to see how we transform cluttered raw bullet points into an executive visual story.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto rounded-3xl aspect-[16/9] border border-gray-200 shadow-2xl relative overflow-hidden group">
            {/* After Image (SlideBee Polished Deck) */}
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: "url('/portfolio/nike_hsbc_cvs_1.png')" }}
            >
              <div className="absolute bottom-4 right-4 bg-primary text-foreground font-extrabold px-4 py-1.5 rounded-full text-xs shadow-lg uppercase tracking-wider">
                ✨ After (SlideBee Polish)
              </div>
            </div>
            
            {/* Before Image (Raw Unstyled Slide) */}
            <div 
              className="absolute inset-0 bg-cover bg-center border-r-4 border-primary" 
              style={{ 
                backgroundImage: "url('/portfolio/nike_hsbc_cvs_8.png')",
                clipPath: `inset(0 calc(100% - var(--slider-pos, 50%)) 0 0)`
              }}
            >
              <div className="absolute bottom-4 left-4 bg-black/80 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-lg uppercase tracking-wider">
                📄 Before (Raw Draft)
              </div>
            </div>
            
            {/* Hidden Range Input for dragging */}
            <input 
              type="range" 
              min="0" max="100" defaultValue="50"
              onChange={(e) => {
                e.currentTarget.parentElement?.style.setProperty('--slider-pos', `${e.target.value}%`);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
            
            {/* Custom Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 pointer-events-none z-10"
              style={{ left: `var(--slider-pos, 50%)`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary text-foreground rounded-full shadow-2xl border-2 border-white flex items-center justify-center font-bold text-xs">
                ↔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose SlideBee Section (From Slide 1 & 2) */}
      <section className="py-24 bg-[#0b0f19] text-white relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-4">
              Why Choose <span className="text-primary">SlideBee?</span>
            </h2>
            <p className="text-gray-400 font-light text-lg">
              Enterprise-grade slide design tailored for founders, executives, and marketing leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Confidential</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Strict NDA protection and secure storage for all your private corporate financials and pitch materials.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">24–48h Turnaround</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                High-speed execution without sacrificing quality. Receive your initial deck draft in as fast as 24 hours.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">Fully Editable Slides</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Native PowerPoint, Google Slides, and Keynote formatting. Edit any text, chart, or color with ease.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Headphones size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">Dedicated Art Director</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Direct one-on-one collaboration with experienced presentation designers for seamless revisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Client Decks Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-primary-amber text-xs font-bold uppercase tracking-widest block mb-2">
                Proven Track Record
              </span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-foreground">
                Featured Client Decks
              </h2>
            </div>
            <Link
              to="/examples"
              className="inline-flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors border-b-2 border-primary pb-1 shrink-0"
            >
              View All 18+ Case Studies <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWork.map((item, idx) => (
              <Link
                key={idx}
                to="/examples"
                className="group bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all block"
              >
                <div className="aspect-[16/9] overflow-hidden bg-black/5 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {item.client}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[11px] text-primary-amber font-bold uppercase tracking-wider mb-1">
                    {item.category}
                  </div>
                  <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown + Waitlist */}
      <CountdownSection />

      {/* CTA / Contact Section */}
      <section className="py-24 bg-[#0b0f19] relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary-amber/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                Ready to elevate your next presentation?
              </h2>
              <p className="text-xl text-gray-300 mb-8 font-light">
                Whether you need a quick polish or a complete ground-up redesign, our expert team is ready to bring your vision to life.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary text-xl">1</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Submit your request</h4>
                    <p className="text-gray-400">Fill out the form with your project details and attach your draft.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary text-xl">2</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Get a free quote & timeline</h4>
                    <p className="text-gray-400">We'll review your needs and provide a custom proposal within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary text-xl">3</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Receive your masterpiece</h4>
                    <p className="text-gray-400">Review the initial concepts, provide feedback, and get the final polished deck.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <TryNowForm />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
