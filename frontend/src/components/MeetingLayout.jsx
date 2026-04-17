import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Shield, 
  Users, 
  MessageSquare, 
  Settings,
  Share,
  Info
} from 'lucide-react';

export const MeetingLayout = ({ 
  children, 
  title, 
  participantCount, 
  onLeave, 
  isMuted, 
  setIsMuted, 
  isCameraOn, 
  setIsCameraOn,
  showChat,
  setShowChat,
  showIntelligence,
  setShowIntelligence
}) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 font-sans overflow-hidden text-white">
      {/* Top Header */}
      <header className="h-16 px-6 flex items-center justify-between bg-black/20 backdrop-blur-md absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold tracking-tight">{title || "AgentX Meeting Room"}</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
            <Users size={14} />
            <span>{participantCount || 0} participants</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
            <Shield size={12} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AgentX Protected</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex relative">
        <div className="flex-1 p-6 flex items-center justify-center pt-20 pb-28">
          {children}
        </div>

        {/* Collapsible Intelligence Sidebar */}
        {showIntelligence && (
          <motion.aside 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-96 bg-slate-900 border-l border-white/5 m-4 rounded-3xl overflow-hidden shadow-2xl flex flex-col pt-16"
          >
            {/* Intelligence content will be injected here via children/props if needed */}
            <div className="h-full overflow-y-auto" id="intelligence-sidebar">
              {/* This is a placeholder for the Copilot/Output panels */}
            </div>
          </motion.aside>
        )}
      </main>

      {/* Floating Control Bar */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-4 px-8 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/50">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button 
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-4 rounded-full transition-all ${!isCameraOn ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {!isCameraOn ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button className="p-4 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all">
            <Share size={20} />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-all ${showChat ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <MessageSquare size={20} />
          </button>

          <button 
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={`p-4 rounded-full transition-all ${showIntelligence ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Info size={20} />
          </button>

          <button className="p-4 bg-white/10 text-white hover:bg-white/20 rounded-full transition-all">
            <Settings size={20} />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button 
            onClick={onLeave}
            className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
          >
            <PhoneOff size={20} />
            Leave
          </button>
        </div>
      </footer>
    </div>
  );
};
