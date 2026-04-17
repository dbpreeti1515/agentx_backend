import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Users, Zap, Shield, BarChart3 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, className = "", delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`group p-8 glass-panel rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300 ${className}`}
  >
    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
      <Icon size={28} />
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-600 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter"
          >
            A brain for every <br />
            <span className="text-indigo-600 text-6xl">conversation.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-medium"
          >
            A complete suite of tools to help you manage, track, and optimize your AI sales interactions from a single powerful interface.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <FeatureCard 
            icon={Brain}
            title="Real-time Reasoning"
            description="Peel back the curtain on AI logic. Watch your agent think through objections and strategize response paths as the conversation unfolds."
            className="md:col-span-8 md:row-span-1"
            delay={0.1}
          />
          <FeatureCard 
            icon={Zap}
            title="Instant Insights"
            description="Automatic extraction of customer needs, risks, and missing data."
            className="md:col-span-4"
            delay={0.2}
          />
          <FeatureCard 
            icon={Users}
            title="Shared Meetings"
            description="Launch collaborative sales environments where human agents and AI work together to close the gap."
            className="md:col-span-4"
            delay={0.3}
          />
          <FeatureCard 
            icon={MessageSquare}
            title="Full Context History"
            description="Synchronize every touchpoint. Never lose track of a thread, even across months of complex sales cycles."
            className="md:col-span-8"
            delay={0.4}
          />
          <FeatureCard 
            icon={Shield}
            title="Enterprise Security"
            description="Built with SOC2 compliance in mind. Your sales data is encrypted, private, and yours to keep."
            className="md:col-span-6"
            delay={0.5}
          />
          <FeatureCard 
            icon={BarChart3}
            title="Sales Analytics"
            description="Advanced metrics on sentiment, conversion probability, and agent performance."
            className="md:col-span-6"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
};
