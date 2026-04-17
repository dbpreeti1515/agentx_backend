import React from 'react';
import { motion } from 'framer-motion';
import { DashboardSidebar } from './DashboardSidebar';
import { Bot, LogOut, Bell, Search, Settings } from 'lucide-react';

export const DashboardLayout = ({ children, activeTab, onTabChange, user, onLogout }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        user={user} 
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none" />

        {/* Top Header */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 bg-white/80 border border-slate-200 px-4 py-2 rounded-2xl w-full max-w-md">
            <Search className="text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations, meetings, or proposals..." 
              className="bg-transparent border-none outline-none text-sm w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-slate-200 relative">
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white" />
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-slate-200">
              <Settings size={20} />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-2" />
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
