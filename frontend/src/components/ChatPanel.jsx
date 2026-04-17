import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, FileDown, MoreHorizontal } from 'lucide-react';

export function ChatPanel({
  conversation,
  draftMessage,
  onDraftChange,
  onSend,
  isLoading,
  isDiscoveryMode,
  onGeneratePdf
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (draftMessage.trim()) onSend();
  };

  return (
    <section className="flex flex-col h-[700px] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Discovery Loop</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligence Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDiscoveryMode && (
            <button 
              onClick={onGeneratePdf}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all border border-slate-200"
            >
              <FileDown size={14} />
              Export PDF
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50/30">
        <AnimatePresence initial={false}>
          {conversation.map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] space-y-1 ${message.role === 'user' ? 'items-end' : ''}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm border ${
                  message.role === 'user' 
                  ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none' 
                  : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
                }`}>
                  {message.content}
                </div>
                {message.meta?.action && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-tight w-fit">
                    <div className="w-1 h-1 rounded-full bg-indigo-600 animate-pulse" />
                    {message.meta.action}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <Bot size={16} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Composer */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={draftMessage}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="AgentX is listening... type requirements or client data"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-16 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 focus:bg-white transition-all resize-none min-h-[100px]"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !draftMessage.trim()}
            className="absolute right-3 bottom-4 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-3 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
          <span>Shift+Enter for newline</span>
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 bg-emerald-400 rounded-full" />
            Real-time Sync Active
          </span>
        </div>
      </div>
    </section>
  );
}
