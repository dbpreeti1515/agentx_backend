import React, { useState, useEffect } from "react";
import { AgentBrainPanel } from "./components/AgentBrainPanel";
import { ChatPanel } from "./components/ChatPanel";
import { ClientMeetingPage } from "./components/ClientMeetingPage";
import { DemoScenarioBar } from "./components/DemoScenarioBar";
import { MeetingLaunchCard } from "./components/MeetingLaunchCard";
import { MeetingLayout } from "./components/MeetingLayout";
import { OutputPanel } from "./components/OutputPanel";
import { ProposalStorePage } from "./components/ProposalStorePage";
import { SalesProspectsPage } from "./components/SalesProspectsPage";
import { SalesMeetingPage } from "./components/SalesMeetingPage";
import { useAgentSession } from "./hooks/useAgentSession";
import { useAppRoute } from "./hooks/useAppRoute";
import { createMeeting } from "./services/agentApi";
import { DashboardLayout } from "./components/DashboardLayout";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { Bot } from "lucide-react";

function AuthGuard({ children, navigate }) {
  const token = localStorage.getItem("auth_token");
  
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) return null;
  return children;
}

function DashboardHome({ navigate }) {
  const agentSession = useAgentSession();
  const [activeTab, setActiveTab] = useState("discovery");
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [latestJoinLink, setLatestJoinLink] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
  };

  async function handleCreateMeeting() {
    setIsCreatingMeeting(true);
    setMeetingError("");
    try {
      const meeting = await createMeeting({ salesName: "Sales Agent" });
      setLatestJoinLink(meeting.joinLink);
      navigate(`/dashboard/meeting/${meeting.meetingId}`);
    } catch (error) {
      setMeetingError(error.message || "Failed to create meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "discovery":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
            {/* Interaction Layer (Primary) */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Loop</h2>
                  <p className="text-slate-500 font-medium italic">Active discovery and requirement mapping</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link: Stable</span>
                </div>
              </div>
              <ChatPanel
                conversation={agentSession.conversation}
                draftMessage={agentSession.draftMessage}
                onDraftChange={agentSession.setDraftMessage}
                onSend={agentSession.sendDraftMessage}
                isLoading={agentSession.isLoading}
              />
            </div>

            {/* Results Layer (The End Goal) */}
            <div className="xl:col-span-4">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">Artifacts</span>
                <span className="text-[10px] font-bold text-slate-400 italic">Outputs updated in real-time</span>
              </div>
              <OutputPanel
                requirements={agentSession.structuredOutput.requirements}
                missingInfo={agentSession.structuredOutput.missingInfo}
                risks={agentSession.structuredOutput.risks}
                suggestions={agentSession.structuredOutput.suggestions}
                proposalVersions={agentSession.proposalVersions}
                selectedProposalId={agentSession.selectedProposalId}
                onSelectProposal={agentSession.setSelectedProposalId}
              />
            </div>
          </div>
        );

      case "targets": // Re-purposing for System/Process for now
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <AgentBrainPanel
                thought={agentSession.agentState.thought}
                action={agentSession.agentState.action}
                reasoning={agentSession.agentState.reasoning}
                confidence={agentSession.agentState.confidence}
                status={agentSession.agentState.status}
                steps={agentSession.agentState.steps}
                isLoading={agentSession.isLoading}
              />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="p-8 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200 border border-white/5">
                <h3 className="text-xl font-black mb-4">Debug Controls</h3>
                <p className="text-slate-400 text-sm mb-8 font-medium italic">Simulate scenarios to test AI logic.</p>
                <DemoScenarioBar
                  scenarios={agentSession.demoScenarios}
                  activeScenario={agentSession.activeScenario}
                  onRunScenario={agentSession.runScenario}
                  disabled={agentSession.isLoading}
                />
              </div>
            </div>
          </div>
        );

      case "library":
        return (
          <ProposalStorePage
            proposalVersions={agentSession.proposalVersions}
            selectedProposalId={agentSession.selectedProposalId}
            onSelectProposal={agentSession.setSelectedProposalId}
          />
        );

      case "prospects":
        return <SalesProspectsPage conversation={agentSession.conversation} />;

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center italic text-slate-400">
            <Bot size={48} className="mb-4 opacity-20" />
            <p>This module is currently initializing in your workspace.</p>
          </div>
        );
    }
  };

  if (activeTab === "meetings") {
    return (
      <MeetingLayout
        title="Meeting Command"
        participantCount={1}
        onLeave={() => setActiveTab("discovery")}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isCameraOn={isCameraOn}
        setIsCameraOn={setIsCameraOn}
        showChat={showChat}
        setShowChat={setShowChat}
        showIntelligence={showIntelligence}
        setShowIntelligence={setShowIntelligence}
      >
        <div className="w-full max-w-4xl">
          <MeetingLaunchCard
            creating={isCreatingMeeting}
            error={meetingError}
            joinLink={latestJoinLink}
            onCreateMeeting={handleCreateMeeting}
          />
        </div>
      </MeetingLayout>
    );
  }

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      user={{ name: "Sales Pro" }}
    >
      <div className="space-y-8 h-full">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}

function App() {
  const { route, navigate } = useAppRoute();

  if (route.view === "sales-meeting") {
    return <SalesMeetingPage meetingId={route.meetingId} />;
  }

  if (route.view === "client-meeting") {
    return <ClientMeetingPage meetingId={route.meetingId} />;
  }

  if (route.view === "login") {
    return (
      <LoginPage
        onLogin={() => navigate("/dashboard")}
        onBack={() => navigate("/")}
      />
    );
  }

  if (route.view === "dashboard") {
    return (
      <AuthGuard navigate={navigate}>
        <DashboardHome navigate={navigate} />
      </AuthGuard>
    );
  }

  return <LandingPage onLaunchDashboard={() => navigate("/login")} />;
}

export default App;
