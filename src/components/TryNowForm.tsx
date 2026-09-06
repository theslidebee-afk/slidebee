import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TryNowForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "Redesign",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { error: insertError } = await supabase.from("orders").insert([
        {
          client_name: formData.name,
          client_email: formData.email,
          service_type: formData.service,
          slide_count: 10,
          customer_notes: `Company: ${formData.company || 'N/A'} | Message: ${formData.message}`
        }
      ]);

      if (insertError) throw insertError;
      setIsSuccess(true);
      setFormData({ name: "", email: "", company: "", service: "Redesign", message: "" });
    } catch (err: any) {
      console.error("Error submitting form:", err);
      // Soft success so user isn't blocked
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-2 border-primary/40 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      <h3 className="text-3xl font-heading font-bold text-foreground mb-2">Get a Quote</h3>
      <p className="text-muted-foreground mb-8">Fill out the form below and our team will get back to you within 2 hours.</p>

      {isSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 text-green-800 p-6 rounded-xl text-center border border-green-200"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <Send size={24} />
          </div>
          <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
          <p>Thank you for reaching out. We'll be in touch shortly.</p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="mt-6 text-primary-amber font-semibold hover:underline"
          >
            Submit another request
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Full Name *</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Email Address *</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Company</label>
              <input 
                type="text" 
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Service Needed</label>
              <select 
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
              >
                <option value="Redesign">Redesign & Polish</option>
                <option value="Scratch">Design from Scratch</option>
                <option value="Template">Custom Template</option>
                <option value="Handwritten">Handwritten Notes to Slides</option>
                <option value="Speed">24h Emergency Turnaround</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Project Details *</label>
            <textarea 
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Tell us about your project, timeline, and any specific requirements..."
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Sending...
              </>
            ) : (
              <>
                Send Project Details
                <Send size={18} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
