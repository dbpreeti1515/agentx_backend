import { useState } from "react";
import { AgentBrainPanel } from "./components/AgentBrainPanel";
import { ChatPanel } from "./components/ChatPanel";
import { DemoScenarioBar } from "./components/DemoScenarioBar";
import { MeetingRoom } from "./components/MeetingRoom";
import { OutputPanel } from "./components/OutputPanel";
import { useAgentSession } from "./hooks/useAgentSession";

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const agentSession = useAgentSession();

  if (activeView === "meeting-room") {
    return (
      <div className="app-shell">
        <nav className="view-switcher">
          <button
            type="button"
            className="view-switcher__button"
            onClick={() => setActiveView("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className="view-switcher__button view-switcher__button--active"
            onClick={() => setActiveView("meeting-room")}
          >
            MeetingRoom
          </button>
        </nav>
        <MeetingRoom />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <nav className="view-switcher">
        <button
          type="button"
          className="view-switcher__button view-switcher__button--active"
          onClick={() => setActiveView("dashboard")}
        >
          Dashboard
        </button>
        <button
          type="button"
          className="view-switcher__button"
          onClick={() => setActiveView("meeting-room")}
        >
          MeetingRoom
        </button>
      </nav>
      <header className="topbar">
        <div>
          <p className="eyebrow">AgentX Dashboard</p>
          <h1>AI Sales Agent Control Room</h1>
          <p className="subtitle">
            Track conversation, agent reasoning, and structured proposal output in
            one view.
          </p>
        </div>
        <div className="session-chip">
          <span>Session</span>
          <strong>{agentSession.sessionId || "New session"}</strong>
        </div>
      </header>

      <DemoScenarioBar
        scenarios={agentSession.demoScenarios}
        activeScenario={agentSession.activeScenario}
        onRunScenario={agentSession.runScenario}
        disabled={agentSession.isLoading}
      />

      <main className="dashboard-grid">
        <ChatPanel
          conversation={agentSession.conversation}
          draftMessage={agentSession.draftMessage}
          onDraftChange={agentSession.setDraftMessage}
          onSend={agentSession.sendDraftMessage}
          isLoading={agentSession.isLoading}
        />

        <AgentBrainPanel
          thought={agentSession.agentState.thought}
          action={agentSession.agentState.action}
          reasoning={agentSession.agentState.reasoning}
          confidence={agentSession.agentState.confidence}
          status={agentSession.agentState.status}
          steps={agentSession.agentState.steps}
          isLoading={agentSession.isLoading}
        />

        <OutputPanel
          requirements={agentSession.structuredOutput.requirements}
          missingInfo={agentSession.structuredOutput.missingInfo}
          risks={agentSession.structuredOutput.risks}
          suggestions={agentSession.structuredOutput.suggestions}
          proposalVersions={agentSession.proposalVersions}
          selectedProposalId={agentSession.selectedProposalId}
          onSelectProposal={agentSession.setSelectedProposalId}
        />
      </main>
    </div>
  );
}

export default App;
