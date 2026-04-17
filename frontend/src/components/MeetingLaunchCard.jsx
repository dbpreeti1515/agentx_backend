import React, { useState } from 'react';
import { Video, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

export function MeetingLaunchCard({
  creating,
  error,
  joinLink,
  onCreateMeeting,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (joinLink) {
      navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Video size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Meeting Command</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">AI Active</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto-Proposal Sync</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-md leading-relaxed">
            Launch a secure conferencing room. AgentX will join automatically to capture requirements and populate your proposal draft.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            className={`w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn ${creating ? 'opacity-70 pointer-events-none' : ''}`}
            onClick={onCreateMeeting}
            disabled={creating}
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Initializing...
              </span>
            ) : (
              <>
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                Create Live Meeting
              </>
            )}
          </button>

          {joinLink && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl w-full sm:w-auto">
              <div className="px-3 py-2 text-xs font-mono font-bold text-slate-600 truncate max-w-[150px]">
                {joinLink.split('/').pop()}
              </div>
              <button
                onClick={handleCopy}
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-xl hover:shadow-sm transition-all flex items-center gap-2"
                title="Copy Invite Link"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
              <a 
                href={joinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-xl hover:shadow-sm transition-all"
                title="Personal Join Link"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-in">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          {error}
        </div>
      )}
    </section>
  );
}
