const STORAGE_KEY = "agentx_proposal_store_v1";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return [];
  }
}

export function loadStoredProposals() {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw || "[]");
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed
    .filter((item) => item && typeof item === "object" && item.id)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export function saveStoredProposals(items = []) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
}

export function upsertStoredProposal(proposal) {
  if (!proposal?.id) {
    return loadStoredProposals();
  }
  const current = loadStoredProposals();
  const existingIndex = current.findIndex((item) => item.id === proposal.id);
  if (existingIndex >= 0) {
    current[existingIndex] = { ...current[existingIndex], ...proposal };
  } else {
    current.unshift(proposal);
  }
  saveStoredProposals(current);
  return current;
}
