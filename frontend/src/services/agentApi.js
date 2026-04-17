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
