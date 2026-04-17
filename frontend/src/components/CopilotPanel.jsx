function CopilotConfidence({ confidence }) {
  const tone =
    confidence >= 75 ? "high" : confidence >= 45 ? "medium" : "low";

  return (
    <div className={`confidence confidence--${tone}`}>
      <span>Confidence</span>
      <strong>{confidence}%</strong>
    </div>
  );
}

function ListBlock({ title, items, emptyText }) {
  return (
    <div className="brain-card">
      <p className="brain-label">{title}</p>
      {items?.length ? (
        <ul className="bullet-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">{emptyText}</p>
      )}
    </div>
  );
}

export function CopilotPanel({ copilotState, isLoading, sessionId, onUseSuggestion }) {
  return (
    <section className="panel panel--copilot">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Copilot Guidance</p>
          <h2>Real-time insights</h2>
        </div>
        <CopilotConfidence confidence={copilotState.confidence} />
      </div>

      <div className="brain-card action-card">
        <div className="action-pill">{copilotState.action}</div>
        <p className="brain-label">AI Thought Process</p>
        <h3>{copilotState.thought}</h3>
        
        <div className="suggestion-block">
          <div>
            <p className="brain-label">Suggested next question</p>
            <p className="brain-copy">{copilotState.suggestion}</p>
          </div>
          {onUseSuggestion && copilotState.suggestion && (
            <button 
              className="use-suggestion-btn"
              onClick={() => onUseSuggestion(copilotState.suggestion)}
            >
              Use Question
            </button>
          )}
        </div>

        <div className="status-row">
          <span className={`status-indicator status-indicator--${isLoading ? "processing" : "completed"}`}>
            {isLoading ? "Copilot thinking" : sessionId || "No active session"}
          </span>
        </div>
      </div>

      <div className="brain-card">
        <p className="brain-label">Live analysis</p>
        <div className="step-list">
          {copilotState.steps.map((step) => (
            <div key={step.label} className={`step-item step-item--${step.status}`}>
              <span className="step-dot" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ListBlock
        title="Missing Info"
        items={copilotState.missingInfo}
        emptyText="No critical gaps detected right now."
      />

      <ListBlock
        title="Risk Detection"
        items={copilotState.risks}
        emptyText="No major sales risks detected."
      />

      <ListBlock
        title="Coaching Tips"
        items={copilotState.coachingTips}
        emptyText="Coaching tips will appear as the meeting evolves."
      />

      <div className="brain-card">
        <p className="brain-label">Draft Proposal</p>
        {copilotState.proposalDraft?.proposalText ? (
          <pre>{copilotState.proposalDraft.proposalText}</pre>
        ) : (
          <p className="empty-state">
            The copilot will keep preparing a draft proposal in the background as confidence improves.
          </p>
        )}
      </div>
    </section>
  );
}
