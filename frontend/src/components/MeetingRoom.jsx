import { useMeetingCopilot } from "../hooks/useMeetingCopilot";
import { CopilotPanel } from "./CopilotPanel";
import { MeetingTranscript } from "./MeetingTranscript";
import { VideoTile } from "./VideoTile";
import { VirtualAgentTile } from "./VirtualAgentTile";

export function MeetingRoom() {
  const hashPart = window.location.hash.slice(1);
  const roomId = hashPart.split("?")[0] || "main-meeting";
  
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
  } = useMeetingCopilot(roomId);

  const isSales = userRole === "sales";

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
          
          <div className="session-chip">
            <span>Room: <strong>{roomId}</strong></span>
            <span>Session: <strong>{sessionId || "Active"}</strong></span>
          </div>
        </div>
      </header>

      <div className="video-grid-container">
        <div className={`video-grid video-grid--${peers.length + 2}`}>
          <VideoTile
            stream={localStream}
            label={isSales ? "You (Sales)" : "You (Client)"}
            isLocal={true}
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
              stream={peerObj.peer.stream}
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
    </div>
  );
}
