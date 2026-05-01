import React from "react";
import { FileText, FolderOpen, CalendarDays, ArrowRight, Download } from "lucide-react";

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString();
}

export function ProposalStorePage({
  proposalVersions = [],
  selectedProposalId,
  onSelectProposal,
}) {
  const selectedProposal =
    proposalVersions.find((item) => item.id === selectedProposalId) ||
    proposalVersions[0] ||
    null;

  function downloadPdf(proposal) {
    if (!proposal?.pdfDataUri) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = proposal.pdfDataUri;
    anchor.download = proposal.pdfName || `${proposal.label || "proposal"}.pdf`;
    anchor.click();
  }

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Proposal Store
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              All generated proposal versions are stored here.
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest">
            {proposalVersions.length} Stored
          </div>
        </div>
      </section>

      {!proposalVersions.length ? (
        <section className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <FolderOpen size={28} />
          </div>
          <h3 className="mt-6 text-xl font-black text-slate-900">
            No proposals yet
          </h3>
          <p className="mt-2 text-slate-500 font-medium max-w-md mx-auto">
            Start a discovery conversation and generate a proposal. It will
            appear in this store automatically.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <section className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 space-y-3 max-h-[560px] overflow-y-auto">
            {proposalVersions.map((proposal, index) => {
              const isActive = proposal.id === selectedProposal?.id;
              return (
                <button
                  key={proposal.id}
                  type="button"
                  onClick={() => onSelectProposal(proposal.id)}
                  className={`w-full text-left border rounded-2xl p-4 transition-all ${
                    isActive
                      ? "bg-indigo-600 border-indigo-700 text-white"
                      : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate">
                          {proposal.label || `Proposal ${index + 1}`}
                        </p>
                        <p
                          className={`text-[11px] font-bold uppercase tracking-widest ${
                            isActive ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {proposal.action || "generated"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={14} className={isActive ? "text-white" : "text-slate-300"} />
                  </div>
                  <div
                    className={`mt-3 flex items-center gap-1.5 text-[11px] font-medium ${
                      isActive ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    <CalendarDays size={12} />
                    {formatDate(proposal.createdAt)}
                  </div>
                </button>
              );
            })}
          </section>

          <section className="xl:col-span-7 bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="text-lg font-black text-slate-900">
              {selectedProposal?.label || "Proposal Preview"}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {selectedProposal?.action || "generated"} |{" "}
              {formatDate(selectedProposal?.createdAt)}
            </p>
            {selectedProposal?.pdfDataUri ? (
              <button
                type="button"
                onClick={() => downloadPdf(selectedProposal)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3 py-2 text-xs font-bold"
              >
                <Download size={14} />
                Download PDF
              </button>
            ) : null}
            <pre className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto">
              {selectedProposal?.proposal?.proposalText ||
                "No proposal text available for this version."}
            </pre>
          </section>
        </div>
      )}
    </div>
  );
}

