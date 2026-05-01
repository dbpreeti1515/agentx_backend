import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  ClipboardCheck,
  ChevronRight,
  Plus,
  Library
} from 'lucide-react';

export function OutputPanel({
  requirements = [],
  missingInfo = [],
  risks = [],
  suggestions = [],
  proposalVersions = [],
  selectedProposalId,
  onSelectProposal,
  onGenerateProposalPdf
}) {
  const sections = [
    { title: 'Requirements', data: requirements, icon: ClipboardCheck, color: 'indigo' },
    { title: 'Missing Data', data: missingInfo, icon: AlertCircle, color: 'blue' },
    { title: 'Strategic Risks', data: risks, icon: AlertCircle, color: 'red' },
    { title: 'Upsell Hooks', data: suggestions, icon: Lightbulb, color: 'emerald' },
  ];

  return (
    <section className="flex flex-col h-[700px] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Structured Output</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Deal Artifacts</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onGenerateProposalPdf}
          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <Plus size={14} />
          Gen Proposal
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-8">
        {/* Bento Grid layout within panel */}
        <div className="grid grid-cols-1 gap-6">
          {sections.map((section, sidx) => (
            <div key={sidx} className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <section.icon size={16} className={`text-${section.color}-500`} />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{section.title}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {section.data.length > 0 ? (
                  section.data.map((item, iidx) => (
                    <motion.div 
                      key={iidx}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: iidx * 0.05 }}
                      className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                        section.color === 'red' ? 'bg-red-50/50 border-red-100' : 
                        section.color === 'emerald' ? 'bg-emerald-50/50 border-emerald-100' :
                        'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-200'
                      }`}
                    >
                      <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-${section.color}-500`} />
                      <span className="text-xs font-bold text-slate-700 leading-tight">{item}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center opacity-50 italic">
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Analyzing context...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Proposals Section */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Library size={16} className="text-indigo-500" />
              <span className="text-[11px] font-black uppercase tracking-widest">Generated Proposals</span>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
              {proposalVersions.length} Versions
            </span>
          </div>
          <div className="space-y-2">
            {proposalVersions.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProposal(p.id)}
                className={`w-full p-4 rounded-2xl border flex items-center justify-between group transition-all ${
                  selectedProposalId === p.id 
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedProposalId === p.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black tracking-tight">{p.name || `Proposal v${p.id}`}</div>
                    <div className={`text-[10px] font-medium opacity-60`}>Generated via Discovery Loop</div>
                  </div>
                </div>
                <ChevronRight size={14} className={selectedProposalId === p.id ? 'text-white' : 'text-slate-300'} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
