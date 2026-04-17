function ConfidenceBadge({ confidence }) {
  const tone =
    confidence >= 75 ? "high" : confidence >= 45 ? "medium" : "low";

  return (
    <div className={`confidence confidence--${tone}`}>
      <span>Confidence</span>
      <strong>{confidence}%</strong>
    </div>
  );
}

export function AgentBrainPanel({
  thought,
  action,
  reasoning,
  confidence,
  status,
  steps,
  isLoading,
}) {
  return (
    <section className="panel panel--brain">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Center Panel</p>
          <h2>Agent Brain</h2>
        </div>
        <ConfidenceBadge confidence={confidence} />
      </div>

      <div className="brain-card action-card">
        <div className="action-pill">{action}</div>
        <p className="brain-label">Thought</p>
        <h3>{thought}</h3>
        <p className="brain-label">Reasoning</p>
        <p className="brain-copy">{reasoning}</p>
        <div className="status-row">
          <span className={`status-indicator status-indicator--${status}`}>
            {isLoading ? "Thinking" : status}
          </span>
        </div>
      </div>

      <div className="brain-card">
        <p className="brain-label">Step-by-step updates</p>
        <div className="step-list">
          {steps.map((step) => (
            <div key={step.label} className={`step-item step-item--${step.status}`}>
              <span className="step-dot" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
