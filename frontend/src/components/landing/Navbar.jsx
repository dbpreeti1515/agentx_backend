import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Menu, ChevronRight } from 'lucide-react';

export const Navbar = ({ onLaunchDashboard }) => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Agent<span className="text-indigo-600">X</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
          <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
          <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onLaunchDashboard}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95"
          >
            Launch Console
            <ChevronRight size={16} />
          </button>
          <button className="md:hidden p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
