import { useEffect, useState } from "react";
import { fetchMeetingState, sendMeetingMessage } from "../services/agentApi";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useMeetingSession({
  meetingId,
  role,
  participantName,
  enabled = true,
}) {
  const [meetingState, setMeetingState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    if (!enabled || !meetingId) {
      return;
    }

    try {
      const data = await fetchMeetingState({
        meetingId,
        role,
        participantName,
      });
      setMeetingState(data);
      setError("");
    } catch (fetchError) {
      setError(fetchError.message);
    }
  }

  useEffect(() => {
    if (!enabled || !meetingId) {
      return undefined;
    }

    let isMounted = true;
    let intervalId;

    async function hydrate() {
      setIsLoading(true);
      try {
        const data = await fetchMeetingState({
          meetingId,
          role,
          participantName,
        });

        if (isMounted) {
          setMeetingState(data);
          setError("");
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    hydrate();
    intervalId = window.setInterval(hydrate, 1500);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [enabled, meetingId, participantName, role]);

  async function postMessage(message) {
    if (!meetingId || !message.trim()) {
      return null;
    }

    setIsSending(true);

    try {
      await delay(500);
      const result = await sendMeetingMessage({
        meetingId,
        role,
        participantName,
        message: message.trim(),
      });
      await refresh();
      return result;
    } finally {
      setIsSending(false);
    }
  }

  return {
    error,
    isLoading,
    isSending,
    meetingState,
    postMessage,
    refresh,
  };
}
