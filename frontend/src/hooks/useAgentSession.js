import { useMemo, useRef, useState } from "react";
import { sendAgentMessage } from "../services/agentApi";
import { demoScenarios } from "../utils/demoScenarios";

const THINKING_LABELS = [
  "Analyzing input...",
  "Identifying gaps...",
  "Deciding next action...",
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createThinkingSteps(activeIndex = -1) {
  return THINKING_LABELS.map((label, index) => {
    if (index < activeIndex) {
      return { label, status: "complete" };
    }

    if (index === activeIndex) {
      return { label, status: "active" };
    }

    return { label, status: "pending" };
  });
}

function createMessage(role, content, meta = {}) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    meta,
  };
}

function normalizeProposalVersion(proposal, action) {
  return {
    id: `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: action === "revise_proposal" ? "Revised Proposal" : "Initial Proposal",
    action,
    proposal,
    createdAt: new Date().toISOString(),
  };
}

export function useAgentSession() {
  const sessionIdRef = useRef("");
  const [sessionId, setSessionId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [conversation, setConversation] = useState([
    createMessage(
      "assistant",
      "I’m ready to help demo the AI Sales Agent. Share a request or run a predefined scenario."
    ),
  ]);
  const [agentState, setAgentState] = useState({
    thought: "Waiting for input",
    action: "idle",
    reasoning: "The agent will begin reasoning after the next message arrives.",
    confidence: 0,
    status: "idle",
    steps: createThinkingSteps(),
  });
  const [structuredOutput, setStructuredOutput] = useState({
    requirements: {},
    missingInfo: [],
    risks: [],
    suggestions: [],
  });
  const [proposalVersions, setProposalVersions] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState("");

  const selectedProposal = useMemo(() => {
    return (
      proposalVersions.find((version) => version.id === selectedProposalId) || null
    );
  }, [proposalVersions, selectedProposalId]);

  async function simulateThinking() {
    for (let index = 0; index < THINKING_LABELS.length; index += 1) {
      setAgentState((current) => ({
        ...current,
        steps: createThinkingSteps(index),
      }));
      await delay(420);
    }

    setAgentState((current) => ({
      ...current,
      steps: createThinkingSteps(THINKING_LABELS.length),
    }));
  }

  async function generatePdf() {
    setIsLoading(true);
    setAgentState(curr => ({ ...curr, status: "processing", action: "generating_pdf", thought: "Compiling intelligence into document..." }));
    await delay(2000);
    setConversation(curr => [...curr, createMessage("assistant", "PDF Proposal successfully generated and added to your Proposal Store.")]);
    setAgentState(curr => ({ ...curr, status: "idle", action: "pdf_complete", thought: "Document Ready" }));
    setIsLoading(false);
    alert("Proposal PDF has been generated and stored in your Library.");
  }

  async function sendMessage(rawMessage) {
    const message = rawMessage.trim();

    if (!message || isLoading) {
      return;
    }

    setIsLoading(true);
    setConversation((current) => [...current, createMessage("user", message)]);
    
    // Simulate thinking
    setAgentState((current) => ({
      ...current,
      status: "processing",
      action: "processing",
      reasoning: "The agent is evaluating the latest requirement data.",
      steps: createThinkingSteps(0),
    }));

    await simulateThinking();

    // Custom Logic: If message is short, ask for clarification (Doubt)
    if (message.length < 20) {
      await delay(500);
      setConversation((current) => [
        ...current,
        createMessage("assistant", "I have some doubts about that requirement. Could you provide specifically the budget range and the expected number of users for this scope?"),
      ]);
      setAgentState(curr => ({
        ...curr,
        status: "idle",
        action: "ask_question",
        thought: "Awaiting clarification",
        confidence: 0.4
      }));
    } else {
      try {
        const response = await sendAgentMessage({
          sessionId: sessionIdRef.current || undefined,
          message,
        });

        if (response.sessionId && response.sessionId !== sessionIdRef.current) {
          setSessionId(response.sessionId);
          sessionIdRef.current = response.sessionId;
        }

        setConversation((current) => [
          ...current,
          createMessage("assistant", response.message, {
            action: response.action,
            confidence: response.confidence,
          }),
        ]);

        setAgentState({
          thought: response.thought,
          action: response.action,
          reasoning: response.reasoning,
          confidence: response.confidence,
          status: response.status,
          steps: [
            ...createThinkingSteps(THINKING_LABELS.length),
            {
              label:
                response.action === "ask_question"
                  ? "Question prepared"
                  : response.action === "revise_proposal"
                    ? "Proposal revised"
                    : response.action === "generate_proposal"
                      ? "Proposal generated"
                      : "Cycle completed",
              status: "complete",
            },
          ],
        });

        setStructuredOutput({
          requirements: response.requirements || {},
          missingInfo: response.missingInfo || [],
          risks: response.risks || [],
          suggestions: response.suggestions || [],
        });

        if (response.proposal?.proposalText) {
          setProposalVersions((current) => {
            const lastProposal = current[0]?.proposal?.proposalText;

            if (lastProposal === response.proposal.proposalText) {
              return current;
            }

            const nextVersions = [
              normalizeProposalVersion(response.proposal, response.action),
              ...current,
            ];

            setSelectedProposalId(nextVersions[0].id);

            return nextVersions;
          });
        }
      } catch (error) {
        setConversation((current) => [
          ...current,
          createMessage(
            "assistant",
            error.message || "Something went wrong while talking to the agent."
          ),
        ]);
        setAgentState((current) => ({
          ...current,
          status: "error",
          action: "error",
          reasoning: error.message || "The request failed before the agent completed.",
          steps: [
            ...createThinkingSteps(THINKING_LABELS.length),
            { label: "Request failed", status: "error" },
          ],
        }));
      }
    }
    
    setIsLoading(false);
  }

  async function sendDraftMessage() {
    const message = draftMessage;
    setDraftMessage("");
    await sendMessage(message);
  }

  async function runScenario(scenario) {
    if (isLoading) {
      return;
    }

    setActiveScenario(scenario.id);
    sessionIdRef.current = "";
    setSessionId("");
    setProposalVersions([]);
    setSelectedProposalId("");
    setStructuredOutput({
      requirements: {},
      missingInfo: [],
      risks: [],
      suggestions: [],
    });
    setConversation([
      createMessage(
        "assistant",
        `Running demo scenario: ${scenario.title}. Watch the agent reason through each step.`
      ),
    ]);
    setAgentState({
      thought: "Preparing demo",
      action: "demo_mode",
      reasoning: scenario.description,
      confidence: 0,
      status: "demo",
      steps: createThinkingSteps(),
    });

    for (let index = 0; index < scenario.messages.length; index += 1) {
      await sendMessage(scenario.messages[index]);
      await delay(500);
    }
  }

  return {
    activeScenario,
    agentState,
    conversation,
    demoScenarios,
    draftMessage,
    generatePdf,
    isLoading,
    proposalVersions,
    selectedProposal,
    selectedProposalId,
    sendDraftMessage,
    runScenario,
    sessionId,
    setDraftMessage,
    setSelectedProposalId,
    structuredOutput,
  };
}
