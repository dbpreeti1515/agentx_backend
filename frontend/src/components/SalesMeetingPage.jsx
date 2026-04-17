import { useState } from "react";
import {
  Sparkles,
  Link2,
  Send,
  AlertTriangle,
  ClipboardList,
  Brain,
  MessageSquareText,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useMeetingSession } from "../hooks/useMeetingSession";

export function SalesMeetingPage({ meetingId }) {
  const [draftMessage, setDraftMessage] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

  const meetingSession = useMeetingSession({
    meetingId,
    role: "sales",
    enabled: Boolean(meetingId),
  });

  const meetingState = meetingSession.meetingState;
  const joinLink = `${window.location.origin}/meet/${meetingId}`;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!draftMessage.trim()) return;

    setCopilotLoading(true);
    try {
      await meetingSession.postMessage(draftMessage);
      setDraftMessage("");
    } finally {
      setCopilotLoading(false);
    }
  }

  function useSuggestion() {
    if (meetingState?.suggestion) {
      setDraftMessage(meetingState.suggestion);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-100 mb-4">
                <Sparkles size={16} />
                Sales Interface
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                Meeting Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                Shared meeting state with private AI copilot guidance for the sales team.
              </p>
            </div>

            <div className="min-w-[280px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Link2 size={14} />
                Client Link
              </div>
              <p className="break-all text-sm font-semibold text-slate-900">
                {joinLink}
              </p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-7 rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Conversation
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Shared meeting chat
              </h2>
            </div>

            <div className="h-[560px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
              {(meetingState?.messages || []).length ? (
                (meetingState?.messages || []).map((message, index) => {
                  const isSales = message.role === "sales";
                  const isClient = message.role === "client";

                  return (
                    <div
                      key={`${message.role}-${message.createdAt || index}`}
                      className={`flex ${isSales ? "justify-end" : "justify-start"}`}
                    >
                      <article
                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border ${
                          isSales
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : isClient
                            ? "bg-white text-slate-900 border-slate-200"
                            : "bg-amber-50 text-slate-900 border-amber-200"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isSales
                                ? "text-indigo-100"
                                : isClient
                                ? "text-slate-500"
                                : "text-amber-700"
                            }`}
                          >
                            {message.metadata?.senderName || message.role}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </article>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-slate-400 text-sm">
                    No conversation yet. Start the meeting to see messages here.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="xl:col-span-5 space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Copilot Panel
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    Sales-only insights
                  </h2>
                </div>

                <div className="rounded-2xl bg-emerald-50 px-4 py-3 border border-emerald-100 text-right">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    Confidence
                  </span>
                  <strong className="text-xl font-black text-emerald-700">
                    {meetingState?.confidence || 0}%
                  </strong>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-5 text-white">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200">
                    {meetingState?.action || "idle"}
                  </span>
                  <Brain size={18} className="text-indigo-300" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Thought
                </p>
                <h3 className="text-lg font-bold leading-relaxed text-white mb-5">
                  {meetingState?.thought || "Waiting for the conversation to progress."}
                </h3>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Suggestion
                </p>
                <p className="text-sm leading-relaxed text-slate-300 mb-5">
                  {meetingState?.suggestion || "The next best sales question will appear here."}
                </p>

                <button
                  type="button"
                  onClick={useSuggestion}
                  disabled={!meetingState?.suggestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageSquareText size={16} />
                  Use Suggestion
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-amber-500" />
                <h3 className="text-lg font-black text-slate-900">Risks</h3>
              </div>

              {(meetingState?.risks || []).length ? (
                <ul className="space-y-3">
                  {meetingState.risks.map((risk) => (
                    <li
                      key={risk}
                      className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {risk}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No major sales risks detected.</p>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={18} className="text-indigo-500" />
                <h3 className="text-lg font-black text-slate-900">Missing Info</h3>
              </div>

              {(meetingState?.missingInfo || []).length ? (
                <ul className="space-y-3">
                  {meetingState.missingInfo.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No critical gaps detected right now.</p>
              )}
            </div>
          </section>
        </main>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Sales Composer
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Send next message
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder="Write the next sales message..."
                rows={6}
                disabled={meetingSession.isSending}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 resize-none"
              />

              <button
                type="submit"
                disabled={meetingSession.isSending || !draftMessage.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
                {meetingSession.isSending ? "Sending..." : "Send message"}
              </button>
            </form>

            {meetingSession.error ? (
              <p className="mt-4 text-sm font-medium text-red-500">
                {meetingSession.error}
              </p>
            ) : null}

            {copilotLoading ? (
              <p className="mt-4 text-sm text-slate-400">
                Copilot is updating after the latest turn...
              </p>
            ) : null}
          </section>

          <section className="xl:col-span-7 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <FileText size={18} className="text-emerald-500" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Draft Proposal
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  Live background draft
                </h2>
              </div>
            </div>

            {meetingState?.proposalDraft?.proposalText ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 font-medium">
                  {meetingState.proposalDraft.proposalText}
                </pre>
              </div>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                <div className="text-center">
                  <CheckCircle2
                    size={28}
                    className="mx-auto mb-3 text-slate-300"
                  />
                  <p className="text-sm text-slate-400">
                    The proposal draft will update as the meeting gains enough clarity.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}