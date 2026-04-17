import { useMeetingCopilot } from "../hooks/useMeetingCopilot";
import { CopilotPanel } from "./CopilotPanel";
import { MeetingTranscript } from "./MeetingTranscript";

export function MeetingRoom() {
  const meetingCopilot = useMeetingCopilot();

  return (
    <div className="meeting-room">
      <header className="topbar">
        <div>
          <p className="eyebrow">Meeting Simulation</p>
          <h1>AI Sales Copilot</h1>
          <p className="subtitle">
            Simulate a live client meeting and watch the Copilot continuously guide
            the sales rep behind the scenes.
          </p>
        </div>
        <div className="session-chip">
          <span>Session</span>
          <strong>{meetingCopilot.sessionId || "New meeting"}</strong>
        </div>
      </header>

      <main className="meeting-grid">
        <MeetingTranscript
          conversation={meetingCopilot.conversation}
          draftMessage={meetingCopilot.draftMessage}
          isLoading={meetingCopilot.isLoading}
          onDraftChange={meetingCopilot.setDraftMessage}
          onSend={meetingCopilot.sendDraftMessage}
          onSpeakerChange={meetingCopilot.setSpeakerRole}
          speakerRole={meetingCopilot.speakerRole}
        />

        <CopilotPanel
          copilotState={meetingCopilot.copilotState}
          isLoading={meetingCopilot.isLoading}
          sessionId={meetingCopilot.sessionId}
        />
      </main>
    </div>
  );
}
