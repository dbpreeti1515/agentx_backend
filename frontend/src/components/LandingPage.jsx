import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "./landing/Navbar";
import { Hero } from "./landing/Hero";
import { Features } from "./landing/Features";
import { Bot, Globe, ExternalLink, Heart } from "lucide-react";
import logo from "../image/logo.png";
import textLogo from "../image/text-logo.png";
import { Pricing } from "./Pricing";
import { Solutions } from "./Solutions";

export const LandingPage = ({ onLaunchDashboard }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onLaunchDashboard={onLaunchDashboard} />

      <main>
        <Hero onLaunchDashboard={onLaunchDashboard} />
        <Features />
        <Pricing onLaunchDashboard={onLaunchDashboard} />
        <Solutions />

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
                Join 500+ forward-thinking teams using AgentX to scale their
                sales intelligence effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={onLaunchDashboard}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95"
                >
                  Start Scaling Now
                </button>
                <button
                  onClick={onLaunchDashboard}
                  className="px-10 py-4 bg-slate-800 text-white rounded-full font-bold text-lg hover:bg-slate-700 transition-all active:scale-95"
                >
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

<footer className="bg-white border-t border-slate-100">
  <div className="max-w-7xl mx-auto px-6 py-14">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
      
      {/* Left */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={logo}
            alt="logo"
            className="w-11 h-11 object-contain"
          />
          <img
            src={textLogo}
            alt="AgentX"
            className="h-8 object-contain"
          />
        </div>

        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          Transforming sales workflows with AI-driven insights, smarter collaboration,
          and faster decision-making.
        </p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-center md:items-end gap-5">
        <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#features" className="hover:text-indigo-600 transition-colors">
            Features
          </a>
          <a href="#solutions" className="hover:text-indigo-600 transition-colors">
            Solutions
          </a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#"
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
          >
            <Globe size={18} />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>

    <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-sm text-slate-400">
        © 2026 AgentX AI. All rights reserved.
      </p>

      <div className="flex items-center gap-2 text-sm text-slate-400">
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
