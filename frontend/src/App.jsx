import { useState, useEffect } from "react";
import { AgentBrainPanel } from "./components/AgentBrainPanel";
import { ChatPanel } from "./components/ChatPanel";
import { DemoScenarioBar } from "./components/DemoScenarioBar";
import { MeetingRoom } from "./components/MeetingRoom";
import { OutputPanel } from "./components/OutputPanel";
import { LandingPage } from "./components/LandingPage";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAgentSession } from "./hooks/useAgentSession";

function App() {
  const [activeView, setActiveView] = useState("landing");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("agentx-theme") || "light";
  });
  
  const agentSession = useAgentSession();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("agentx-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  if (activeView === "landing") {
    return (
      <div className={`theme-provider theme-provider--${theme}`}>
        <LandingPage 
          theme={theme}
          onToggleTheme={toggleTheme}
          onLaunchDashboard={() => setActiveView("dashboard")}
          onJoinMeeting={() => setActiveView("meeting-room")}
        />
      </div>
    );
  }

  const commonNav = (
    <nav className="view-switcher">
      <div className="view-switcher__left">
        <button
          type="button"
          className={`view-switcher__button ${activeView === "landing" ? "view-switcher__button--active" : ""}`}
          onClick={() => setActiveView("landing")}
        >
          Landing
        </button>
        <button
          type="button"
          className={`view-switcher__button ${activeView === "dashboard" ? "view-switcher__button--active" : ""}`}
          onClick={() => setActiveView("dashboard")}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`view-switcher__button ${activeView === "meeting-room" ? "view-switcher__button--active" : ""}`}
          onClick={() => setActiveView("meeting-room")}
        >
          MeetingRoom
        </button>
      </div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </nav>
  );

  if (activeView === "meeting-room") {
    return (
      <div className={`app-shell theme-provider--${theme}`}>
        {commonNav}
        <MeetingRoom />
      </div>
    );
  }

  return (
    <div className={`app-shell theme-provider--${theme}`}>
      {commonNav}
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
