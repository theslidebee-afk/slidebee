import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServicesSection";
import TryNowForm from "../components/TryNowForm";
import CountdownSection from "../components/CountdownSection";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <ServicesSection />
      
      {/* Before / After Placeholder Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              See The Difference
            </h2>
            <p className="text-lg text-muted-foreground">
              Drag the slider to see how we transform ordinary slides into captivating visual stories.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto rounded-3xl aspect-[16/9] border border-gray-200 shadow-xl relative overflow-hidden group">
            {/* After Image (Background) */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')" }}>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">After</div>
            </div>
            
            {/* Before Image (Foreground, clipped) */}
            <div 
              className="absolute inset-0 bg-cover bg-center border-r-4 border-white" 
              style={{ 
                backgroundImage: "url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')",
                clipPath: `inset(0 calc(100% - var(--slider-pos, 50%)) 0 0)`
              }}
            >
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">Before</div>
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
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
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
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
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
