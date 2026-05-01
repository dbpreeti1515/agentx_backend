import React, { useState, useEffect } from "react";
import { AgentBrainPanel } from "./components/AgentBrainPanel";
import { ChatPanel } from "./components/ChatPanel";
import { ClientMeetingPage } from "./components/ClientMeetingPage";
import { DemoScenarioBar } from "./components/DemoScenarioBar";
import { MeetingLaunchCard } from "./components/MeetingLaunchCard";
import { OutputPanel } from "./components/OutputPanel";
import { ProposalStorePage } from "./components/ProposalStorePage";
import { SalesProspectsPage } from "./components/SalesProspectsPage";
import { SalesMeetingPage } from "./components/SalesMeetingPage";
import { useAgentSession } from "./hooks/useAgentSession";
import { useAppRoute } from "./hooks/useAppRoute";
import { createMeeting, listMeetings, startMeeting } from "./services/agentApi";
import { DashboardLayout } from "./components/DashboardLayout";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { motion } from "framer-motion";
import { Bot, Calendar, Copy, Play, Video } from "lucide-react";

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
  const [meetingList, setMeetingList] = useState([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    clientName: "",
    agenda: "",
    scheduledDate: "",
    scheduledTime: "",
    durationMinutes: "30",
  });

  useEffect(() => {
    if (activeTab !== "meetings") {
      return;
    }
    loadMeetings();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
  };

  async function handleCreateMeeting() {
    setIsCreatingMeeting(true);
    setMeetingError("");
    try {
      const meeting = await createMeeting({
        salesName: "Sales Agent",
        meetingType: "instant",
      });
      setLatestJoinLink(meeting.joinLink);
      await loadMeetings();
      navigate(`/dashboard/meeting/${meeting.meetingId}`);
    } catch (error) {
      setMeetingError(error.message || "Failed to create meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  }

  async function loadMeetings() {
    setIsLoadingMeetings(true);
    try {
      const meetings = await listMeetings();
      setMeetingList(meetings);
    } catch (error) {
      setMeetingError(error.message || "Failed to load meetings");
    } finally {
      setIsLoadingMeetings(false);
    }
  }

  async function handleScheduleMeeting(event) {
    event.preventDefault();
    if (!scheduleForm.scheduledDate.trim() || !scheduleForm.scheduledTime.trim()) {
      setMeetingError("Please choose both schedule date and time.");
      return;
    }

    setIsCreatingMeeting(true);
    setMeetingError("");
    try {
      const scheduledAt = new Date(
        `${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}`
      ).toISOString();
      const meeting = await createMeeting({
        salesName: "Sales Agent",
        meetingType: "scheduled",
        title: scheduleForm.title,
        clientName: scheduleForm.clientName,
        agenda: scheduleForm.agenda,
        scheduledAt,
        durationMinutes: Number(scheduleForm.durationMinutes),
      });
      setLatestJoinLink(meeting.joinLink);
      setScheduleForm({
        title: "",
        clientName: "",
        agenda: "",
        scheduledDate: "",
        scheduledTime: "",
        durationMinutes: "30",
      });
      await loadMeetings();
    } catch (error) {
      setMeetingError(error.message || "Failed to schedule meeting");
    } finally {
      setIsCreatingMeeting(false);
    }
  }

  async function handleStartScheduledMeeting(meetingId) {
    setMeetingError("");
    try {
      const meeting = await startMeeting(meetingId);
      setLatestJoinLink(meeting.joinLink);
      await loadMeetings();
      navigate(`/dashboard/meeting/${meetingId}`);
    } catch (error) {
      setMeetingError(error.message || "Failed to start meeting");
    }
  }

  async function copyLink(link) {
    try {
      await navigator.clipboard.writeText(link);
    } catch (_error) {
      setMeetingError("Unable to copy link. Please copy manually.");
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
                isDiscoveryMode={true}
                onGeneratePdf={agentSession.generatePdf}
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
                onGenerateProposalPdf={agentSession.generatePdf}
              />
            </div>
          </div>
        );

      case "meetings":
        return (
          <div className="max-w-6xl mx-auto space-y-10 py-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                <Video size={40} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Meeting Command</h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto">
                Launch high-conversion sales meetings with your AI copilot ready to assist in real-time.
              </p>
            </div>
            <MeetingLaunchCard
              creating={isCreatingMeeting}
              error={meetingError}
              joinLink={latestJoinLink}
              onCreateMeeting={handleCreateMeeting}
            />
            <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <form
                className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
                onSubmit={handleScheduleMeeting}
              >
                <div>
                  <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Schedule Meeting</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">Plan with client</h3>
                </div>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Meeting title"
                  value={scheduleForm.title}
                  onChange={(event) =>
                    setScheduleForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Client name"
                  value={scheduleForm.clientName}
                  onChange={(event) =>
                    setScheduleForm((current) => ({ ...current, clientName: event.target.value }))
                  }
                />
                <textarea
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Agenda"
                  rows={3}
                  value={scheduleForm.agenda}
                  onChange={(event) =>
                    setScheduleForm((current) => ({ ...current, agenda: event.target.value }))
                  }
                />
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  type="date"
                  value={scheduleForm.scheduledDate}
                  onChange={(event) =>
                    setScheduleForm((current) => ({ ...current, scheduledDate: event.target.value }))
                  }
                  required
                />
                <input
                  type="time"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={scheduleForm.scheduledTime}
                  onChange={(event) =>
                    setScheduleForm((current) => ({ ...current, scheduledTime: event.target.value }))
                  }
                  required
                />
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={scheduleForm.durationMinutes}
                  onChange={(event) =>
                    setScheduleForm((current) => ({
                      ...current,
                      durationMinutes: event.target.value,
                    }))
                  }
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
                <button
                  type="submit"
                  disabled={isCreatingMeeting}
                  className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-bold disabled:opacity-60"
                >
                  {isCreatingMeeting ? "Scheduling..." : "Schedule Meeting"}
                </button>
              </form>
              <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Meetings</p>
                    <h3 className="text-xl font-black text-slate-900 mt-1">Scheduled and active</h3>
                  </div>
                  <button
                    type="button"
                    onClick={loadMeetings}
                    className="text-xs font-bold text-slate-600 hover:text-indigo-600"
                  >
                    Refresh
                  </button>
                </div>
                {isLoadingMeetings ? (
                  <p className="text-sm text-slate-500">Loading meetings...</p>
                ) : meetingList.length === 0 ? (
                  <p className="text-sm text-slate-500">No meetings yet. Create instant or schedule one.</p>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                    {meetingList.map((meeting) => (
                      <div
                        key={meeting.meetingId}
                        className="border border-slate-200 rounded-2xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {meeting.title || "Sales Discovery Meeting"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {meeting.clientName || "Client TBD"} · {meeting.meetingType} · {meeting.status}
                            </p>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar size={13} />
                            {meeting.scheduledAt
                              ? `Scheduled: ${new Date(meeting.scheduledAt).toLocaleString()}`
                              : `Created: ${new Date(
                                  meeting.createdAt || meeting.updatedAt || Date.now()
                                ).toLocaleString()}`}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/meeting/${meeting.meetingId}`)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                          >
                            Open Sales Room
                          </button>
                          {meeting.status === "scheduled" ? (
                            <button
                              type="button"
                              onClick={() => handleStartScheduledMeeting(meeting.meetingId)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                            >
                              <Play size={12} />
                              Start
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => copyLink(meeting.joinLink)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1"
                          >
                            <Copy size={12} />
                            Copy Client Link
                          </button>
                          <a
                            href={meeting.joinLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700"
                          >
                            Open Client Link
                          </a>
                        </div>
                        <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 truncate">
                          Share URL: {meeting.joinLink}
                        </div>
                        <p className="text-xs text-slate-500">
                          Agent confidence: {meeting.confidence || 0}% · Participants: {meeting.participantCount || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
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

