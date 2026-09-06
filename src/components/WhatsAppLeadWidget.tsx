import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { WHATSAPP_CONFIG } from '../config/whatsapp';

export const WhatsAppLeadWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState('Presentation Redesign');
  const [slideCount, setSlideCount] = useState('10-20 Slides');
  const [customNote, setCustomNote] = useState('');

  const handleSendToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedText = `Hi SlideBee team! 🐝%0A%0A*Name:* ${encodeURIComponent(name || 'Client')}%0A*Service:* ${encodeURIComponent(serviceType)}%0A*Scope:* ${encodeURIComponent(slideCount)}%0A*Notes:* ${encodeURIComponent(customNote || 'Need a fast quote and turnaround.')}%0A%0ALooking forward to discussing!`;
    const url = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${formattedText}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleDirectWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodeURIComponent(WHATSAPP_CONFIG.defaultMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <aside aria-label="WhatsApp Chat Widget" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Quick Lead Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ duration: 0.25 }}
            className="mb-3 w-80 sm:w-96 bg-[#111111] text-white border border-[#FCBF14]/30 rounded-3xl shadow-2xl p-5 overflow-hidden relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-xs sm:text-sm text-white">
                    Chat with SlideBee
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Typically replies in under 15 mins
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Form */}
            <form onSubmit={handleSendToWhatsApp} className="space-y-3 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Service
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option>Pitch Deck Design</option>
                    <option>Presentation Redesign</option>
                    <option>Data Visualization</option>
                    <option>Branded Templates</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Estimated Slides
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option>1-10 Slides</option>
                    <option>10-25 Slides</option>
                    <option>25-50 Slides</option>
                    <option>50+ Slides</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Project Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your timeline or brand..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-102 transition-all"
              >
                <Send size={14} /> Send Project Details to WhatsApp
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="text-[11px] text-gray-400 hover:text-primary transition-colors underline"
                >
                  Or start instant direct WhatsApp chat ➔
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#25D366] text-white font-extrabold px-4 py-3 rounded-full shadow-2xl hover:shadow-[0_0_25px_rgba(37,211,102,0.45)] transition-all group border-2 border-white/20"
      >
        <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" />
        <span className="text-xs tracking-wide">
          {isOpen ? 'Close Chat' : 'Chat on WhatsApp'}
        </span>
      </motion.button>
    </aside>
  );
};
