import { useMemo, useState } from "react";
import { useMeetingSession } from "../hooks/useMeetingSession";

export function ClientMeetingPage({ meetingId }) {
  const [participantName, setParticipantName] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [joinedName, setJoinedName] = useState("");

  const enabled = useMemo(() => Boolean(meetingId && joinedName), [joinedName, meetingId]);

  const meetingSession = useMeetingSession({
    meetingId,
    role: "client",
    participantName: joinedName,
    enabled,
  });

  async function handleSend(event) {
    event.preventDefault();

    if (!draftMessage.trim()) {
      return;
    }

    await meetingSession.postMessage(draftMessage);
    setDraftMessage("");
  }

  if (!joinedName) {
    return (
      <div className="client-join-shell">
        <section className="client-join-card">
          <p className="eyebrow">Client Interface</p>
          <h1>Join Meeting</h1>
          <p className="subtitle">
            Enter your name to join the sales conversation. No extra dashboard or AI
            controls are shown on the client side.
          </p>

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (participantName.trim()) {
                setJoinedName(participantName.trim());
              }
            }}
          >
            <textarea
              value={participantName}
              onChange={(event) => setParticipantName(event.target.value)}
              placeholder="Your name"
              rows={2}
            />
            <button type="submit" disabled={!participantName.trim()}>
              Join meeting
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="client-join-shell">
      <section className="panel panel--meeting client-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Meeting</p>
            <h2>Conversation</h2>
          </div>
          <div className="session-chip">
            <span>You joined as</span>
            <strong>{joinedName}</strong>
          </div>
        </div>

        <div className="chat-feed">
          {(meetingSession.meetingState?.messages || []).map((message, index) => (
            <article
              key={`${message.role}-${message.createdAt || index}`}
              className={`chat-bubble ${
                message.role === "sales" ? "chat-bubble--sales" : "chat-bubble--client"
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

        <form className="composer" onSubmit={handleSend}>
          <textarea
            value={draftMessage}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="Write your message..."
            rows={4}
            disabled={meetingSession.isSending}
          />
          <button
            type="submit"
            disabled={meetingSession.isSending || !draftMessage.trim()}
          >
            {meetingSession.isSending ? "Sending..." : "Send"}
          </button>
        </form>

        {meetingSession.error ? (
          <p className="auth-error">{meetingSession.error}</p>
        ) : null}
      </section>
    </div>
  );
}
