import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
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

export function useMeetingCopilot(roomId = "demo-room") {
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef([]);
  
  // Magic Link Role Detection
  const [userRole, setUserRole] = useState(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    return params.get("role") === "client" ? "client" : "sales";
  });

  const [peers, setPeers] = useState([]); // Array of { peerId, peer, stream }
  const [localStream, setLocalStream] = useState(null);
  
  const sessionIdRef = useRef("");
  const [sessionId, setSessionId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [speakerRole, setSpeakerRole] = useState(userRole === "client" ? "client" : "sales");
  const [isLoading, setIsLoading] = useState(false);
  
  const [conversation, setConversation] = useState([
    createMeetingMessage(
      "system",
      "Meeting joined. Enabling camera and microphone..."
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

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(window.location.origin.replace("5173", "3000"));

    // Get Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setLocalStream(stream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      socketRef.current.emit("join-room", { roomId, userName: "User" });

      socketRef.current.on("all-users", (users) => {
        const p = [];
        users.forEach((userID) => {
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current.push({
            peerId: userID,
            peer,
          });
          p.push({ peerId: userID, peer });
        });
        setPeers(p);
      });

      socketRef.current.on("user-joined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerId, stream);
        peersRef.current.push({
          peerId: payload.callerId,
          peer,
        });

        setPeers((users) => [...users, { peerId: payload.callerId, peer }]);
      });

      socketRef.current.on("receiving-returned-signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerId === payload.id);
        if (item) {
          item.peer.signal(payload.signal);
        }
      });

      socketRef.current.on("user-left", (id) => {
        const peerObj = peersRef.current.find((p) => p.peerId === id);
        if (peerObj) {
          peerObj.peer.destroy();
        }
        const remainingPeers = peersRef.current.filter((p) => p.peerId !== id);
        peersRef.current = remainingPeers;
        setPeers(remainingPeers);
      });

      socketRef.current.on("new-remote-message", (message) => {
        setConversation((current) => [...current, message]);
        // Trigger copilot for remote messages too
        analyzeMeetingContext(message.content, message.role);
      });
    });

    return () => {
      socketRef.current.disconnect();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending-signal", {
        userToSignal,
        callerId,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning-signal", { signal, callerId });
    });

    peer.signal(incomingSignal);

    return peer;
  }

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

  async function analyzeMeetingContext(message, role) {
    setIsLoading(true);
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

  async function sendMeetingMessage(rawMessage) {
    const message = rawMessage.trim();
    const role = speakerRole;

    if (!message || isLoading) {
      return;
    }

    const meetingMessage = createMeetingMessage(role, message);
    
    // 1. Update local state
    setConversation((current) => [...current, meetingMessage]);
    
    // 2. Broadcast to other participants
    socketRef.current.emit("send-message", { roomId, message: meetingMessage });

    // 3. Analyze locally
    await analyzeMeetingContext(message, role);
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
    userRole,
    setUserRole,
    localStream,
    peers,
  };
}
