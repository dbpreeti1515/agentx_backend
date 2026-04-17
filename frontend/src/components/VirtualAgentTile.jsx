import React from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Activity } from "lucide-react";

export function VirtualAgentTile({ copilotState = {}, isLoading = false }) {
  const isThinking = isLoading || copilotState.action === "processing";

  return (
    <div className="relative aspect-video bg-indigo-950 rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-900/40 group">
      {/* Neural Background Animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4">
        {/* AI Core Visualization */}
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: isThinking ? [1, 1.2, 1] : 1,
              opacity: isThinking ? [0.5, 0.8, 0.5] : 0.5 
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-indigo-500 blur-2xl rounded-full"
          />
          <div className="w-24 h-24 bg-indigo-600/30 backdrop-blur-md rounded-full border border-indigo-400/50 flex items-center justify-center text-indigo-100 shadow-[0_0_30px_rgba(79,70,229,0.3)] relative z-10">
            <Bot size={48} className={isThinking ? 'animate-bounce' : ''} />
          </div>
          
          {/* Animated Waveform Simulation */}
          <div className="absolute -bottom-2 inset-x-0 flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                animate={{ height: isThinking ? [8, 20, 8] : [4, 8, 4] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                className="w-1 bg-indigo-400 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="text-center space-y-1 relative z-10">
          <h4 className="text-white font-black tracking-tight text-sm flex items-center gap-2 justify-center">
            <Sparkles size={14} className="text-indigo-400" />
            AgentX AI Assistant
          </h4>
          <div className="flex items-center gap-1.5 justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
             <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none">
              {isThinking ? "Analyzing Conversation..." : "Unified Deal Intelligence Active"}
             </span>
          </div>
        </div>
      </div>

      {/* Overlay Label */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="px-3 py-1 bg-indigo-600/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white border border-indigo-400/50 uppercase tracking-widest flex items-center gap-2">
          <Activity size={12} />
          Participant: Virtual Agent
        </div>
      </div>

      {/* Grid Status Border */}
      <div className="absolute inset-0 border-2 border-indigo-400/20 group-hover:border-indigo-400/50 rounded-3xl transition-all" />
    </div>
  );
}
