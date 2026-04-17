import React from "react";

export function VirtualAgentTile({ copilotState, isLoading }) {
  const isThinking = isLoading || copilotState.action === "processing";

  return (
    <div className={`video-tile video-tile--ai ${isThinking ? "video-tile--thinking" : ""}`}>
      <div className="ai-agent-visual">
        <div className="ai-pulse-ring"></div>
        <div className="ai-core">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="#4F80D9" fillOpacity="0.8"/>
            <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="12" cy="11" r="3" fill="white" fillOpacity="0.3"/>
          </svg>
        </div>
      </div>
      
      <div className="video-tile__overlay">
        <div className="video-tile__label ai-badge">
          <span className="ai-badge__dot"></span>
          AgentX AI (Assistant)
        </div>
        <div className="ai-status-indicator">
          {isThinking ? "Analyzing Context..." : "Listening to Call..."}
        </div>
      </div>
    </div>
  );
}
