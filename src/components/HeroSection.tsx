import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#0b0f19] overflow-hidden pt-20">
      {/* Background Graphic Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path fill="#ed6c25" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,97.4,-2.4C98.1,13.2,93.4,29,84.1,41.9C74.8,54.8,60.9,64.8,45.8,71.5C30.7,78.2,14.4,81.6,-1.3,83.9C-17,86.2,-34,87.4,-48.5,80.8C-63,74.2,-75,59.8,-82.9,43.9C-90.8,28,-94.6,10.6,-92.9,-6C-91.2,-22.6,-84,-38.4,-73.4,-51C-62.8,-63.6,-48.8,-73,-34.2,-78.9C-19.6,-84.8,-4.2,-87.3,10.8,-86.2C25.8,-85.1,40.6,-80.4,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-heading font-extrabold text-white leading-tight mb-6"
          >
            Transform Your <br />
            <span className="text-primary">Presentations</span> Into <br />
            Visual Masterpieces.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-light"
          >
            Top ex-McKinsey presentation designers helping you deliver your message with clarity, impact, and stunning visual design.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/contact" className="bg-primary hover:bg-primary-dark text-foreground font-extrabold py-4 px-8 rounded-full transition-all hover:-translate-y-1 shadow-[0_10px_25px_rgba(252,191,20,0.35)]">
              Try Now
            </Link>
            <Link to="/examples" className="bg-transparent border-2 border-white/20 hover:border-primary hover:text-primary text-white font-bold py-4 px-8 rounded-full transition-all">
              View Our Work
            </Link>
          </motion.div>
        </div>

        {/* Counters / Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10"
        >
          <div>
            <h3 className="text-4xl font-heading font-bold text-primary mb-2">10K+</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Presentations Designed</p>
          </div>
          <div>
            <h3 className="text-4xl font-heading font-bold text-primary mb-2">500+</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Happy Clients</p>
          </div>
          <div>
            <h3 className="text-4xl font-heading font-bold text-primary mb-2">24/7</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Dedicated Support</p>
          </div>
          <div>
            <h3 className="text-4xl font-heading font-bold text-primary mb-2">100%</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Confidentiality</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
