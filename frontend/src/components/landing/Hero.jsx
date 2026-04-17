import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Play, ArrowRight, CheckCircle2 } from "lucide-react";

export const Hero = ({ onLaunchDashboard }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-mesh">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-template-columns-[1.2fr_1fr] gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div className="flex flex-col items-start">
              <motion.h1
                variants={itemVariants}
                className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1] mb-8"
              >
                Close deals with <br />
                <span className="text-indigo-600">AI-Powered</span> <br />
                confidence.
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl"
              >
                AgentX is the control room for your AI sales team. Track
                reasoning, orchestrate meetings, and generate structured
                insights in real-time.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 mb-12"
              >
                <button
                  onClick={onLaunchDashboard}
                  className="btn-primary flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </button>
                <button className="btn-secondary flex items-center gap-2">
                  <Play size={18} fill="currentColor" />
                  Watch Demo
                </button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-8 border-t border-slate-200 pt-8"
              >
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">98%</span>
                  <span className="text-sm text-slate-500 uppercase tracking-wider font-bold">
                    Accuracy
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">
                    2.4x
                  </span>
                  <span className="text-sm text-slate-500 uppercase tracking-wider font-bold">
                    Deal Velocity
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">
                    10k+
                  </span>
                  <span className="text-sm text-slate-500 uppercase tracking-wider font-bold">
                    Meetings Run
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div className="relative flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop"
                alt="AI dashboard"
                className="w-full max-w-[500px] rounded-3xl shadow-2xl object-cover"
              />

              {/* optional glow for premium look */}
              <div className="absolute -z-10 w-72 h-72 bg-indigo-400/20 blur-[120px] rounded-full top-10 right-10" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10 p-8 glass-panel rounded-[2.5rem] border-8 border-slate-100/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                  Live Reasoning Active
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Current Thought
                    </span>
                    <span className="text-[10px] font-black text-indigo-600">
                      94% Confidence
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full mb-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 2, delay: 1 }}
                      className="h-full bg-indigo-600"
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    "Analyzing customer's objection regarding budget. Preparing
                    value-based counter-argument..."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200">
                    <CheckCircle2 size={24} className="mb-3 opacity-60" />
                    <div className="text-[10px] font-bold opacity-60 uppercase mb-1">
                      Risk Found
                    </div>
                    <div className="text-sm font-bold">Dependency Lock-in</div>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <Sparkles size={24} className="mb-3 text-amber-500" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Suggestion
                    </div>
                    <div className="text-sm font-bold text-slate-800 italic">
                      "Offer Tier 2 trial"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-400/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-400/10 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
