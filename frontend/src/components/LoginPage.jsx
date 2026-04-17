import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, Globe, Terminal, AlertCircle } from 'lucide-react';
import { loginUser } from '../services/agentApi';

export const LoginPage = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { token } = await loginUser({ email, password });
      localStorage.setItem('auth_token', token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      {/* Left Side: Brand/Illustration (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative p-16 flex-col justify-between overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Agent<span className="text-indigo-400">X</span></span>
        </motion.div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black text-white leading-tight mb-6 tracking-tighter"
          >
            Empowering the next <br />
            generation of <span className="text-indigo-400">AI Sales.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-lg max-w-md font-medium"
          >
            Join 500+ teams scaling their reach with the world's most sophisticated AI sales control room.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 p-6 glass-panel border-white/5 bg-white/5 rounded-3xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <Terminal size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-widest">System Status</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Engines Operational
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 2, delay: 1 }}
                className="h-full bg-indigo-500"
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <span>Neural Processing</span>
              <span>85% Load</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-12 transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>

          <header className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium italic">Please enter your console credentials.</p>
          </header>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm"
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              {/* <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <a href="/" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot password?</a>
              </div> */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1 mb-8">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-500 font-bold cursor-pointer select-none">Keep me logged in</label>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Connect to Console
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 font-bold">
              Don't have an account? <a href="#" className="text-indigo-600 hover:underline">Schedule a demo</a>
            </p>
          </div>

          <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-wrap justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>By AgentX.ai</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            </div>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};
