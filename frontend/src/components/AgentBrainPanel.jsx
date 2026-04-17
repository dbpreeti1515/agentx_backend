import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, Terminal, Activity, Zap, CheckCircle2 } from 'lucide-react';

export function AgentBrainPanel({
  thought,
  action,
  reasoning,
  confidence,
  status,
  steps = [],
  isLoading
}) {
  return (
    <section className="flex flex-col h-[700px] bg-indigo-950 rounded-3xl shadow-2xl border border-white/5 overflow-hidden relative group">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
      
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Agent Brain</h3>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Context Processing</p>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">v4.2-NEURAL</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{status || 'Operational'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide relative z-10">
        {/* Confidence Meter */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-indigo-300">
              <Activity size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Reasoning Confidence</span>
            </div>
            <span className="text-2xl font-black text-white leading-none">{confidence || 0}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${confidence || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            />
          </div>
        </div>

        {/* Current Thought Box */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Terminal size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Current Internal Thought</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl italic text-indigo-100 text-sm leading-relaxed font-medium">
            "{thought || 'Awaiting input from discovery center...'}"
          </div>
        </div>

        {/* Action Taken */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Neural Action</span>
          </div>
          <div className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl inline-block">
            <span className="text-indigo-400 font-bold text-xs uppercase tracking-tight">{action || 'Idle'}</span>
          </div>
        </div>

        {/* Execution Steps */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Search size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Processing Pipeline</span>
          </div>
          <div className="space-y-3">
            {(steps.length > 0 ? steps : ['Awaiting data input', 'Context vectorization', 'Reasoning expansion']).map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  idx === 0 ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-600'
                }`}>
                  <CheckCircle2 size={12} />
                </div>
                <span className={`text-xs font-bold font-mono ${idx === 0 ? 'text-white' : 'text-slate-500'}`}>
                  {typeof step === 'object' ? step.label : step}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
    </section>
  );
}
