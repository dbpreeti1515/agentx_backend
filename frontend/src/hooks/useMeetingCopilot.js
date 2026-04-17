import { useRef, useState } from "react";
import { sendCopilotMessage } from "../services/agentApi";

const COPILOT_STEPS = [
  "Listening to meeting context...",
  "Analyzing live requirements...",
  "Preparing sales guidance...",
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return 500 + Math.floor(Math.random() * 350);
}

function createMeetingMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function createSteps(activeIndex = -1) {
  return COPILOT_STEPS.map((label, index) => {
    if (index < activeIndex) {
      return { label, status: "complete" };
    }

    if (index === activeIndex) {
      return { label, status: "active" };
    }

    return { label, status: "pending" };
  });
}

export function useMeetingCopilot() {
  const sessionIdRef = useRef("");
  const [sessionId, setSessionId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [speakerRole, setSpeakerRole] = useState("client");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    createMeetingMessage(
      "system",
      "Meeting started. Add client and sales messages to watch the Copilot guide the conversation."
    ),
  ]);
  const [copilotState, setCopilotState] = useState({
    thought: "Waiting for the meeting to begin",
    action: "idle",
    suggestion: "The next best question will appear here after the first exchange.",
    risks: [],
    missingInfo: [],
    requirements: {},
    proposalDraft: null,
    confidence: 0,
    coachingTips: [],
    steps: createSteps(),
  });

  async function simulateThinking() {
    for (let index = 0; index < COPILOT_STEPS.length; index += 1) {
      setCopilotState((current) => ({
        ...current,
        steps: createSteps(index),
      }));
      await delay(randomDelay());
    }

    setCopilotState((current) => ({
      ...current,
      steps: createSteps(COPILOT_STEPS.length),
    }));
  }

  async function sendMeetingMessage(rawMessage, forcedRole) {
    const message = rawMessage.trim();
    const role = forcedRole || speakerRole;

    if (!message || isLoading) {
      return;
    }

    setIsLoading(true);
    setConversation((current) => [...current, createMeetingMessage(role, message)]);
    setCopilotState((current) => ({
      ...current,
      action: "processing",
      suggestion: "Copilot is reviewing the latest meeting turn...",
      steps: createSteps(0),
    }));

    const thinkingPromise = simulateThinking();

    try {
      const responsePromise = sendCopilotMessage({
        sessionId: sessionIdRef.current || undefined,
        role,
        message,
      });

      const [response] = await Promise.all([responsePromise, thinkingPromise]);

      if (response.sessionId && response.sessionId !== sessionIdRef.current) {
        sessionIdRef.current = response.sessionId;
        setSessionId(response.sessionId);
      }

      setCopilotState({
        thought: response.thought,
        action: response.action,
        suggestion: response.suggestion,
        risks: response.risks || [],
        missingInfo: response.missingInfo || [],
        requirements: response.requirements || {},
        proposalDraft: response.proposalDraft || null,
        confidence: response.confidence || 0,
        coachingTips: response.coachingTips || [],
        steps: [
          ...createSteps(COPILOT_STEPS.length),
          { label: "Copilot updated", status: "complete" },
        ],
      });
    } catch (error) {
      setCopilotState((current) => ({
        ...current,
        action: "error",
        suggestion: error.message || "The Copilot could not process the latest message.",
        steps: [
          ...createSteps(COPILOT_STEPS.length),
          { label: "Copilot failed", status: "error" },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  }

  async function sendDraftMessage() {
    const message = draftMessage;
    setDraftMessage("");
    await sendMeetingMessage(message);
  }

  return {
    conversation,
    copilotState,
    draftMessage,
    isLoading,
    sendDraftMessage,
    sessionId,
    setDraftMessage,
    setSpeakerRole,
    speakerRole,
  };
}
