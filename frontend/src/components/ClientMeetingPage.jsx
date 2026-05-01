import { useState } from "react";
import { MeetingRoom } from "./MeetingRoom";

export function ClientMeetingPage({ meetingId }) {
  const [participantName, setParticipantName] = useState("");
  const [joinedName, setJoinedName] = useState("");

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
            <input
              value={participantName}
              onChange={(event) => setParticipantName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
    <MeetingRoom
      meetingId={meetingId}
      initialRole="client"
      participantName={joinedName}
      allowRoleSwitch={false}
    />
  );
}
