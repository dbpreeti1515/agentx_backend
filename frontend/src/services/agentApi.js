const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function sendAgentMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/api/agent/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to reach the AI sales agent");
  }

  return data.data;
}

export async function sendCopilotMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/api/copilot/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to reach the AI sales copilot");
  }

  return data.data;
}

export async function createMeeting(payload = {}) {
  const response = await fetch(`${API_BASE_URL}/api/meeting/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to create meeting");
  }

  return data.data;
}

export async function listMeetings({ status } = {}) {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }
  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/meeting/list${query ? `?${query}` : ""}`
  );
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to list meetings");
  }

  return data.data;
}

export async function startMeeting(meetingId) {
  const response = await fetch(`${API_BASE_URL}/api/meeting/${meetingId}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to start meeting");
  }

  return data.data;
}

export async function sendMeetingMessage(payload) {
  const response = await fetch(`${API_BASE_URL}/api/meeting/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to send meeting message");
  }

  return data.data;
}

export async function fetchMeetingState({ meetingId, role, participantName }) {
  const params = new URLSearchParams();
  if (role) {
    params.set("role", role);
  }
  if (participantName) {
    params.set("participantName", participantName);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/meeting/${meetingId}?${params.toString()}`
  );
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to fetch meeting state");
  }

  return data.data;
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.message || "Login failed. Please check your credentials.");
  }

  return data.data;
}
