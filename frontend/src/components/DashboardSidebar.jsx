import React from "react";
import { motion } from "framer-motion";
import {
  Bot,
  LayoutDashboard,
  Video,
  Library,
  Users,
  Target,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import logo from "../image/logo.png";
import textLogo from "../image/text-logo.png";

export const DashboardSidebar = ({ activeTab, onTabChange, user }) => {
  const menuItems = [
    { id: "discovery", label: "Discovery Center", icon: LayoutDashboard },
    { id: "meetings", label: "Meeting Command", icon: Video },
    { id: "library", label: "Proposal Store", icon: Library },
    { id: "prospects", label: "Sales Prospects", icon: Users },
    { id: "targets", label: "Revenue Targets", icon: Target },
  ];

  return (
    <aside className="w-72 bg-slate-900 flex flex-col h-full relative z-20">
      {/* Brand Header */}
      {/* <div className="p-8 flex items-center gap-3  bg-white rounded-xl">
        <div className=" bg-white rounded-xl ">
          <div className="w-10 h-10 flex items-center justify-center p-1">
            <img
              src={logo}
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <img src={textLogo} alt="AgentX" className="h-6 object-contain" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
              Revenue OS
            </span>
          </div>
        </div> 
      </div> */}

      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center p-1 bg-white rounded-xl ">
            <img
              src={logo}
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>
        <div>
          <div className="text-xl font-black text-white tracking-tight leading-none">Agent<span className="text-indigo-400">X</span></div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Revenue OS</div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 py-4">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                size={20}
                className={
                  isActive
                    ? "text-white"
                    : "group-hover:scale-110 transition-transform"
                }
              />
              <span className="text-sm font-bold">{item.label}</span>
              {isActive && (
                <motion.div layoutId="activeTab" className="absolute right-3">
                  <ChevronRight size={14} />
                </motion.div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pro Badge */}
      <div className="px-6 mb-8">
        <div className="p-5 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl relative overflow-hidden group cursor-pointer">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} />
              AI Precision
            </div>
            <div className="text-white font-black text-sm mb-1 leading-tight">
              Scale your reach <br />
              with AgentX Pro
            </div>
            <div className="text-[10px] text-white/60 font-medium">
              Upgrade now for 2.4x velocity
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
        </div>
      </div>

      {/* User Footer */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold border border-white/5">
            {user?.name?.charAt(0) || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {user?.name || "Sales Expert"}
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
              Revenue Team
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
