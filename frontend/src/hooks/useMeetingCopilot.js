import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import {
  fetchMeetingState,
  finalizeMeeting,
  sendCopilotMessage,
  sendMeetingMessage as syncMeetingMessage,
} from "../services/agentApi";
import { buildProposalPdf } from "../utils/proposalPdf";
import { upsertStoredProposal } from "../utils/proposalStore";

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

function buildCopilotSnapshot(messages = []) {
  return (messages || [])
    .slice(-24)
    .map((message) => ({
      role: message.role || "sales",
      speaker: message.role || "sales",
      content: message.content || "",
      createdAt: message.createdAt || new Date().toISOString(),
    }))
    .filter((item) => item.content && String(item.content).trim());
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

export function useMeetingCopilot({
  roomId = "demo-room",
  initialUserRole = "sales",
  participantName = "",
} = {}) {
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef([]);
  
  // Magic Link Role Detection
  const [userRole, setUserRole] = useState(initialUserRole === "client" ? "client" : "sales");

  const [peers, setPeers] = useState([]); // Array of { peerId, peer, stream }
  const [localStream, setLocalStream] = useState(null);
  
  const sessionIdRef = useRef("");
  const [sessionId, setSessionId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [speakerRole, setSpeakerRole] = useState(
    initialUserRole === "client" ? "client" : "sales"
  );
  const speakerRoleRef = useRef(speakerRole);
  const [isLoading, setIsLoading] = useState(false);
  const messageQueueRef = useRef([]);
  const isQueueProcessingRef = useRef(false);
  const speechRecognitionRef = useRef(null);
  const voiceCaptureEnabledRef = useRef(false);
  const restartVoiceCaptureRef = useRef(false);
  const [isVoiceCapturing, setIsVoiceCapturing] = useState(false);
  const [voiceCaptureEnabled, setVoiceCaptureEnabled] = useState(false);
  const [voiceCaptureError, setVoiceCaptureError] = useState("");
  const [isFinalizingMeeting, setIsFinalizingMeeting] = useState(false);
  
  const [conversation, setConversation] = useState([
    createMeetingMessage(
      "system",
      "Meeting joined. Enabling camera and microphone..."
    ),
  ]);
  const conversationRef = useRef(conversation);

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
    speakerRoleRef.current = speakerRole;
  }, [speakerRole]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  function isSpeechRecognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function normalizeTranscript(text = "") {
    return String(text || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  useEffect(() => {
    // Initialize Socket
    const localSocket = io(window.location.origin.replace("5173", "3000"));
    socketRef.current = localSocket;
    let mediaStream = null;
    let disposed = false;

    // Get Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (disposed) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      mediaStream = stream;
      setLocalStream(stream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      localSocket.emit("join-room", {
        roomId,
        userName: participantName || (initialUserRole === "client" ? "Client" : "Sales"),
      });

      localSocket.on("all-users", (users) => {
        const p = [];
        users.forEach((userID) => {
          const peer = createPeer(userID, localSocket.id, stream);
          const peerRecord = {
            peerId: userID,
            peer,
            stream: null,
          };
          peer.on("stream", (remoteStream) => {
            setPeers((current) =>
              current.map((item) =>
                item.peerId === userID ? { ...item, stream: remoteStream } : item
              )
            );
          });
          peersRef.current.push(peerRecord);
          p.push(peerRecord);
        });
        setPeers(p);
      });

      localSocket.on("user-joined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerId, stream);
        const peerRecord = {
          peerId: payload.callerId,
          peer,
          stream: null,
        };
        peer.on("stream", (remoteStream) => {
          setPeers((current) =>
            current.map((item) =>
              item.peerId === payload.callerId
                ? { ...item, stream: remoteStream }
                : item
            )
          );
        });
        peersRef.current.push(peerRecord);

        setPeers((users) => [...users, peerRecord]);
      });

      localSocket.on("receiving-returned-signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerId === payload.id);
        if (item) {
          item.peer.signal(payload.signal);
        }
      });

      localSocket.on("user-left", (id) => {
        const peerObj = peersRef.current.find((p) => p.peerId === id);
        if (peerObj) {
          peerObj.peer.destroy();
        }
        const remainingPeers = peersRef.current.filter((p) => p.peerId !== id);
        peersRef.current = remainingPeers;
        setPeers(remainingPeers);
      });

      localSocket.on("new-remote-message", (message) => {
        setConversation((current) => {
          const nextConversation = [...current, message];
          analyzeMeetingContext(message.content, message.role, nextConversation);
          return nextConversation;
        });
      });

      if (isSpeechRecognitionSupported()) {
        startVoiceCapture();
      }
    }).catch(() => {
      setConversation((current) => [
        ...current,
        createMeetingMessage(
          "system",
          "Unable to access camera/microphone. Please allow permissions and refresh."
        ),
      ]);
    });

    return () => {
      disposed = true;
      localSocket.off("all-users");
      localSocket.off("user-joined");
      localSocket.off("receiving-returned-signal");
      localSocket.off("user-left");
      localSocket.off("new-remote-message");
      localSocket.disconnect();
      stopVoiceCapture();
      peersRef.current.forEach((entry) => {
        if (entry?.peer && typeof entry.peer.destroy === "function") {
          entry.peer.destroy();
        }
      });
      peersRef.current = [];
      setPeers([]);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initialUserRole, participantName, roomId]);

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

  async function analyzeMeetingContext(message, role, contextMessages = conversation) {
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
        meetingId: roomId,
        conversationSnapshot: buildCopilotSnapshot(contextMessages),
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

  function startVoiceCapture() {
    if (!isSpeechRecognitionSupported()) {
      setVoiceCaptureError("Speech recognition is not supported in this browser.");
      return;
    }
    if (voiceCaptureEnabledRef.current || speechRecognitionRef.current) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    setVoiceCaptureError("");
    voiceCaptureEnabledRef.current = true;
    restartVoiceCaptureRef.current = true;
    setVoiceCaptureEnabled(true);

    recognition.onstart = () => {
      setIsVoiceCapturing(true);
    };

    recognition.onresult = (event) => {
      const finalizedChunks = [];
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = normalizeTranscript(event.results[index][0]?.transcript || "");
        if (!transcript) {
          continue;
        }
        if (event.results[index].isFinal) {
          finalizedChunks.push(transcript);
        }
      }

      finalizedChunks.forEach((chunk) => {
        enqueueMeetingMessage(chunk, speakerRoleRef.current);
      });
    };

    recognition.onerror = (event) => {
      const permissionDenied =
        event?.error === "not-allowed" || event?.error === "service-not-allowed";
      setVoiceCaptureError(
        permissionDenied
          ? "Microphone transcription permission denied. Enable mic speech access."
          : "Live speech transcription failed. Trying to recover..."
      );
      if (permissionDenied) {
        restartVoiceCaptureRef.current = false;
        voiceCaptureEnabledRef.current = false;
        setVoiceCaptureEnabled(false);
      }
    };

    recognition.onend = () => {
      setIsVoiceCapturing(false);
      speechRecognitionRef.current = null;
      if (!restartVoiceCaptureRef.current || !voiceCaptureEnabledRef.current) {
        return;
      }
      setTimeout(() => {
        if (voiceCaptureEnabledRef.current) {
          startVoiceCapture();
        }
      }, 250);
    };

    speechRecognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoiceCapture() {
    restartVoiceCaptureRef.current = false;
    voiceCaptureEnabledRef.current = false;
    setVoiceCaptureEnabled(false);
    const recognition = speechRecognitionRef.current;
    speechRecognitionRef.current = null;
    if (recognition) {
      recognition.stop();
    }
    setIsVoiceCapturing(false);
  }

  function toggleVoiceCapture() {
    if (voiceCaptureEnabledRef.current) {
      stopVoiceCapture();
      return;
    }
    startVoiceCapture();
  }

  async function sendMeetingMessageInternal(message, role) {
    const normalizedMessage = normalizeTranscript(message);
    if (!normalizedMessage) {
      return;
    }

    const meetingMessage = createMeetingMessage(role, normalizedMessage);

    const nextConversation = [...conversationRef.current, meetingMessage];
    setConversation(nextConversation);

    socketRef.current.emit("send-message", { roomId, message: meetingMessage });

    try {
      await syncMeetingMessage({
        meetingId: roomId,
        role,
        message: normalizedMessage,
        participantName: participantName || undefined,
      });
    } catch (error) {
      setConversation((current) => [
        ...current,
        createMeetingMessage("system", error.message || "Failed to sync meeting turn to server."),
      ]);
    }

    await analyzeMeetingContext(normalizedMessage, role, nextConversation);
  }

  async function flushMessageQueue() {
    if (isQueueProcessingRef.current) {
      return;
    }
    isQueueProcessingRef.current = true;
    try {
      while (messageQueueRef.current.length) {
        const nextEntry = messageQueueRef.current.shift();
        await sendMeetingMessageInternal(nextEntry.message, nextEntry.role);
      }
    } finally {
      isQueueProcessingRef.current = false;
    }
  }

  function enqueueMeetingMessage(message, role) {
    const normalizedMessage = normalizeTranscript(message);
    if (!normalizedMessage) {
      return;
    }
    messageQueueRef.current.push({ message: normalizedMessage, role });
    flushMessageQueue();
  }

  async function sendMeetingMessage(rawMessage) {
    const role = speakerRoleRef.current;
    enqueueMeetingMessage(rawMessage, role);
  }

  async function sendDraftMessage(overrideMessage = "") {
    const message = (overrideMessage || draftMessage || "").trim();
    setDraftMessage("");
    await sendMeetingMessage(message);
  }

  async function finalizeAndGeneratePdf() {
    if (isFinalizingMeeting) {
      return null;
    }
    setIsFinalizingMeeting(true);
    try {
      await finalizeMeeting(roomId);
      const meetingState = await fetchMeetingState({
        meetingId: roomId,
        role: "sales",
        participantName: participantName || "Sales",
      });
      const proposal = meetingState.proposalDraft;
      if (!proposal?.proposalText) {
        throw new Error("No proposal draft available yet. Continue the conversation before ending.");
      }
      const { filename, dataUri } = buildProposalPdf({
        sessionId: roomId,
        proposal,
        requirements: meetingState.requirements || {},
        risks: meetingState.risks || [],
        missingInfo: meetingState.missingInfo || [],
        suggestions: meetingState.suggestions || [],
      });

      const artifact = {
        id: `meeting-${roomId}-pdf`,
        label: meetingState.title ? `${meetingState.title} (Meeting)` : "Meeting Proposal",
        action: "meeting_pdf",
        proposal,
        createdAt: new Date().toISOString(),
        pdfName: filename,
        pdfDataUri: dataUri,
        meetingId: roomId,
      };
      upsertStoredProposal(artifact);

      const anchor = document.createElement("a");
      anchor.href = dataUri;
      anchor.download = filename;
      anchor.click();

      setConversation((current) => [
        ...current,
        createMeetingMessage(
          "system",
          `Meeting ended. Proposal PDF generated and added to Proposal Store as ${filename}.`
        ),
      ]);
      return artifact;
    } finally {
      setIsFinalizingMeeting(false);
    }
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
  };
}
