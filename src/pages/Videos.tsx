import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

export default function Videos() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6"
          >
            Video <span className="text-primary">Library</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Tutorials, case studies, and insights in motion.
          </motion.p>
        </div>

        <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
          <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No videos yet!</h3>
          <p className="text-gray-500">We're currently producing high-quality video content. Check back soon.</p>
        </div>
      </div>
    </div>
  );
}
