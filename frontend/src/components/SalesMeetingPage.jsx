import { useState } from "react";
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

    if (!draftMessage.trim()) {
      return;
    }

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
    <div className="meeting-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Sales Interface</p>
          <h1>Meeting Dashboard</h1>
          <p className="subtitle">
            Shared meeting state with private AI copilot guidance for the sales team.
          </p>
        </div>
        <div className="session-chip">
          <span>Client Link</span>
          <strong>{joinLink}</strong>
        </div>
      </header>

      <main className="sales-meeting-grid">
        <section className="panel panel--meeting">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Conversation</p>
              <h2>Shared meeting chat</h2>
            </div>
          </div>

          <div className="chat-feed">
            {(meetingState?.messages || []).map((message, index) => (
              <article
                key={`${message.role}-${message.createdAt || index}`}
                className={`chat-bubble ${
                  message.role === "sales"
                    ? "chat-bubble--sales"
                    : message.role === "client"
                      ? "chat-bubble--client"
                      : "chat-bubble--assistant"
                }`}
              >
                <div className="chat-meta">
                  <span className="speaker-label">
                    {message.metadata?.senderName || message.role}
                  </span>
                </div>
                <p>{message.content}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel--copilot">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Copilot Panel</p>
              <h2>Sales-only insights</h2>
            </div>
            <div className="confidence confidence--high">
              <span>Confidence</span>
              <strong>{meetingState?.confidence || 0}%</strong>
            </div>
          </div>

          <div className="brain-card action-card">
            <div className="action-pill">{meetingState?.action || "idle"}</div>
            <p className="brain-label">Thought</p>
            <h3>{meetingState?.thought || "Waiting for the conversation to progress."}</h3>
            <p className="brain-label">Suggestion</p>
            <p className="brain-copy">
              {meetingState?.suggestion || "The next best sales question will appear here."}
            </p>
            <div className="status-row">
              <button
                type="button"
                className="secondary-inline-button"
                onClick={useSuggestion}
                disabled={!meetingState?.suggestion}
              >
                Use Suggestion
              </button>
            </div>
          </div>

          <div className="brain-card">
            <p className="brain-label">Risks</p>
            {(meetingState?.risks || []).length ? (
              <ul className="bullet-list">
                {meetingState.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No major sales risks detected.</p>
            )}
          </div>

          <div className="brain-card">
            <p className="brain-label">Missing Info</p>
            {(meetingState?.missingInfo || []).length ? (
              <ul className="bullet-list">
                {meetingState.missingInfo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No critical gaps detected right now.</p>
            )}
          </div>
        </section>
      </main>

      <section className="meeting-bottom-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Sales Composer</p>
              <h2>Send next message</h2>
            </div>
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Write the next sales message..."
              rows={4}
              disabled={meetingSession.isSending}
            />
            <button
              type="submit"
              disabled={meetingSession.isSending || !draftMessage.trim()}
            >
              {meetingSession.isSending ? "Sending..." : "Send message"}
            </button>
          </form>

          {meetingSession.error ? (
            <p className="auth-error">{meetingSession.error}</p>
          ) : null}
          {copilotLoading ? (
            <p className="empty-state">Copilot is updating after the latest turn...</p>
          ) : null}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Draft Proposal</p>
              <h2>Live background draft</h2>
            </div>
          </div>

          {meetingState?.proposalDraft?.proposalText ? (
            <pre className="proposal-preview">{meetingState.proposalDraft.proposalText}</pre>
          ) : (
            <p className="empty-state">
              The proposal draft will update as the meeting gains enough clarity.
            </p>
          )}
        </section>
      </section>
    </div>
  );
}
