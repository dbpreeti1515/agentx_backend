import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './landing/Navbar';
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { Bot, Globe, ExternalLink, Heart } from 'lucide-react';

export const LandingPage = ({ onLaunchDashboard }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onLaunchDashboard={onLaunchDashboard} />
      
      <main>
        <Hero onLaunchDashboard={onLaunchDashboard} />
        <Features />

        {/* Closing CTA */}
        <section className="py-24 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto p-12 md:p-20 bg-slate-900 rounded-[3rem] text-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter">
                Ready to transform <br />
                <span className="text-indigo-400">your sales workflow?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-medium">
                Join 500+ forward-thinking teams using AgentX to scale their sales intelligence effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={onLaunchDashboard}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95"
                >
                  Start Scaling Now
                </button>
                <button className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold text-lg hover:bg-slate-700 transition-all active:scale-95">
                  Book a Consultation
                </button>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
          </motion.div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <span className="text-lg font-black text-slate-900">Agent<span className="text-indigo-600">X</span></span>
              </div>
              <p className="text-slate-500 max-w-sm mb-6">
                Enabling the next generation of AI-native sales teams with real-time reasoning and collaborative tools.
              </p>
              <div className="flex gap-4">
                <Globe className="text-slate-400 hover:text-indigo-600 cursor-pointer" size={20} />
                <ExternalLink className="text-slate-400 hover:text-indigo-600 cursor-pointer" size={20} />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Product</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li className="hover:text-indigo-600 cursor-pointer">Features</li>
                <li className="hover:text-indigo-600 cursor-pointer">Solutions</li>
                <li className="hover:text-indigo-600 cursor-pointer">Security</li>
                <li className="hover:text-indigo-600 cursor-pointer">Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li className="hover:text-indigo-600 cursor-pointer">About</li>
                <li className="hover:text-indigo-600 cursor-pointer">Blog</li>
                <li className="hover:text-indigo-600 cursor-pointer">Careers</li>
                <li className="hover:text-indigo-600 cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">© 2026 AgentX AI. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <span>Made with</span>
              <Heart size={14} className="text-red-400 fill-red-400" />
              <span>for better sales</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
