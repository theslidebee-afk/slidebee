import { motion } from "framer-motion";
import { PenTool, Edit3, Wand2, PieChart, LayoutTemplate, Palette } from "lucide-react";

const services = [
  {
    title: "Redesign and Visual Enhancement",
    description: "We take your existing slides and transform them into a visually stunning masterpiece that aligns with your brand guidelines.",
    icon: <Wand2 className="w-10 h-10 text-primary" />
  },
  {
    title: "Handwritten Conversions",
    description: "Send us your sketches or whiteboard notes, and we'll convert them into clean, professional PowerPoint slides.",
    icon: <PenTool className="w-10 h-10 text-primary" />
  },
  {
    title: "Quick Scrub and Clean Up",
    description: "Need a fast polish? We'll fix alignment, fonts, colors, and formatting to make your deck look cohesive instantly.",
    icon: <Edit3 className="w-10 h-10 text-primary" />
  },
  {
    title: "Data Visualization",
    description: "We turn complex data and boring spreadsheets into engaging charts, infographics, and easily digestible visuals.",
    icon: <PieChart className="w-10 h-10 text-primary" />
  },
  {
    title: "Template Creation",
    description: "Custom-built, robust PowerPoint templates with master slides that your entire team can easily use.",
    icon: <LayoutTemplate className="w-10 h-10 text-primary" />
  },
  {
    title: "Graphic Design",
    description: "Custom illustrations, bespoke icons, and high-end graphic assets tailored specifically for your presentations.",
    icon: <Palette className="w-10 h-10 text-primary" />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function ServicesSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-bold tracking-wider uppercase text-sm"
          >
            Our Expertise
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold text-foreground mt-4 mb-6"
          >
            Presentation Design Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            We offer a comprehensive suite of presentation design services to ensure your message is delivered beautifully and effectively.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="bg-orange-50 w-20 h-20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
