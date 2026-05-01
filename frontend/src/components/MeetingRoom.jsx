import { useMeetingCopilot } from "../hooks/useMeetingCopilot";
import { CopilotPanel } from "./CopilotPanel";
import { MeetingTranscript } from "./MeetingTranscript";
import { VideoTile } from "./VideoTile";
import { VirtualAgentTile } from "./VirtualAgentTile";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy } from "lucide-react";
import { useState } from "react";

export function MeetingRoom({
  meetingId,
  initialRole = "sales",
  participantName = "",
  allowRoleSwitch = false,
  clientJoinLink = "",
}) {
  const roomId = meetingId || "main-meeting";

  const {
    conversation,
    copilotState,
    draftMessage,
    isLoading,
    sendDraftMessage,
    sessionId,
    setDraftMessage,
    setSpeakerRole,
    speakerRole,
    userRole,
    setUserRole,
    localStream,
    peers,
    isVoiceCapturing,
    voiceCaptureEnabled,
    voiceCaptureError,
    toggleVoiceCapture,
    finalizeAndGeneratePdf,
    isFinalizingMeeting,
  } = useMeetingCopilot({
    roomId,
    initialUserRole: initialRole,
    participantName,
  });

  const isSales = userRole === "sales";
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  function toggleMic() {
    if (!localStream) {
      return;
    }
    const next = !isMicMuted;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setIsMicMuted(next);
  }

  function toggleCamera() {
    if (!localStream) {
      return;
    }
    const next = !isCameraOff;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !next;
    });
    setIsCameraOff(next);
  }

  async function copyClientLink() {
    if (!clientJoinLink) {
      return;
    }
    await navigator.clipboard.writeText(clientJoinLink);
  }

  async function handleEndMeeting() {
    try {
      await finalizeAndGeneratePdf();
      window.location.href = "/dashboard";
    } catch (error) {
      // Hook already surfaces errors in conversation; keep user in room.
      console.error(error);
    }
  }

  return (
    <div className={`meeting-room meeting-room--${userRole}`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Real-time Video Meeting • {isSales ? "Sales View" : "Client View"}</p>
          <h1>AgentX Meeting Room</h1>
          <p className="subtitle">
            {isSales 
              ? "You are leading the call. The AI Agent is providing live guidance below." 
              : "Welcome to the AgentX collaboration session. The video grid is active below."}
          </p>
        </div>
        
        <div className="topbar-actions">
          {allowRoleSwitch ? (
            <div className="role-toggle">
              <button
                className={`role-toggle__button ${isSales ? "role-toggle__button--active" : ""}`}
                onClick={() => setUserRole("sales")}
              >
                Sales Rep
              </button>
              <button
                className={`role-toggle__button ${!isSales ? "role-toggle__button--active" : ""}`}
                onClick={() => setUserRole("client")}
              >
                Client
              </button>
            </div>
          ) : null}
          
          <div className="session-chip">
            <span>Room: <strong>{roomId}</strong></span>
            <span>Session: <strong>{sessionId || "Active"}</strong></span>
            {isSales && clientJoinLink ? (
              <span className="meeting-link-row">
                Client URL:
                <strong>{clientJoinLink}</strong>
                <button type="button" className="inline-icon-btn" onClick={copyClientLink}>
                  <Copy size={12} />
                </button>
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="video-grid-container">
        <div className={`video-grid video-grid--${peers.length + 2}`}>
          <VideoTile
            stream={localStream}
            label={isSales ? "You (Sales)" : "You (Client)"}
            isLocal={true}
            isMuted={isMicMuted}
          />
          
          {/* AI AGENT VIRTUAL PARTICIPANT */}
          <VirtualAgentTile 
            copilotState={copilotState} 
            isLoading={isLoading} 
          />

          {peers.map((peerObj, index) => (
            <VideoTile
              key={peerObj.peerId}
              peer={peerObj.peer}
              stream={peerObj.stream}
              label={isSales ? "Client" : "Sales Representative"}
            />
          ))}
        </div>
      </div>

      <main className={`meeting-layout ${isSales ? "meeting-layout--split" : "meeting-layout--focus"}`}>
        <MeetingTranscript
          conversation={conversation}
          draftMessage={draftMessage}
          isLoading={isLoading}
          onDraftChange={setDraftMessage}
          onSend={sendDraftMessage}
          onSpeakerChange={setSpeakerRole}
          speakerRole={speakerRole}
          showSpeakerToggle={allowRoleSwitch}
        />

        {isSales && (
          <CopilotPanel
            copilotState={copilotState}
            isLoading={isLoading}
            sessionId={sessionId}
            onUseSuggestion={(text) => setDraftMessage(text)}
          />
        )}
      </main>

      <footer className="meeting-controls">
        <button
          type="button"
          className={`control-btn ${isMicMuted ? "control-btn--danger" : ""}`}
          onClick={toggleMic}
        >
          {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
          {isMicMuted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          className={`control-btn ${isCameraOff ? "control-btn--danger" : ""}`}
          onClick={toggleCamera}
        >
          {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
          {isCameraOff ? "Start Cam" : "Stop Cam"}
        </button>
        <span className="participant-badge">Participants: {peers.length + 1}</span>
        <button
          type="button"
          className={`control-btn ${voiceCaptureEnabled ? "" : "control-btn--danger"}`}
          onClick={toggleVoiceCapture}
        >
          <Mic size={16} />
          {voiceCaptureEnabled ? "AI Transcription On" : "AI Transcription Off"}
        </button>
        {isVoiceCapturing ? (
          <span className="participant-badge">AI Listening</span>
        ) : null}
        {isSales ? (
          <button
            type="button"
            className="control-btn control-btn--leave"
            onClick={handleEndMeeting}
            disabled={isFinalizingMeeting}
          >
            <PhoneOff size={16} />
            {isFinalizingMeeting ? "Ending..." : "End & Save PDF"}
          </button>
        ) : (
          <a href="/dashboard" className="control-btn control-btn--leave">
            <PhoneOff size={16} />
            Leave
          </a>
        )}
      </footer>
      {voiceCaptureError ? <p className="auth-error">{voiceCaptureError}</p> : null}
    </div>
  );
}
