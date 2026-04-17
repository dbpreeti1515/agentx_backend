function ValueList({ items, emptyText }) {
  if (!items?.length) {
    return <p className="empty-state">{emptyText}</p>;
  }

  return (
    <ul className="bullet-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function RequirementGrid({ requirements }) {
  const entries = Object.entries(requirements || {});

  if (!entries.length) {
    return <p className="empty-state">Requirements will appear after the first run.</p>;
  }

  return (
    <div className="requirement-grid">
      {entries.map(([key, value]) => (
        <article key={key} className="mini-card">
          <p className="mini-card__label">{key}</p>
          <div className="mini-card__value">
            {Array.isArray(value) ? (
              value.length ? (
                value.map((item) => <span key={item} className="chip">{item}</span>)
              ) : (
                <span className="muted">Not captured yet</span>
              )
            ) : value ? (
              value
            ) : (
              <span className="muted">Not captured yet</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function OutputPanel({
  requirements,
  missingInfo,
  risks,
  suggestions,
  proposalVersions,
  selectedProposalId,
  onSelectProposal,
}) {
  const selectedProposal =
    proposalVersions.find((version) => version.id === selectedProposalId) ||
    proposalVersions[0];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Right Panel</p>
          <h2>Structured Output</h2>
        </div>
      </div>

      <div className="output-stack">
        <div className="brain-card">
          <p className="brain-label">Requirements</p>
          <RequirementGrid requirements={requirements} />
        </div>

        <div className="brain-card">
          <p className="brain-label">Missing Info</p>
          <ValueList
            items={missingInfo}
            emptyText="No open information gaps at the moment."
          />
        </div>

        <div className="brain-card">
          <p className="brain-label">Risks</p>
          <ValueList items={risks} emptyText="No risks flagged." />
          <p className="brain-label brain-label--space">Suggestions</p>
          <ValueList
            items={suggestions}
            emptyText="Suggestions will appear when the agent identifies next actions."
          />
        </div>

        <div className="brain-card">
          <div className="proposal-header">
            <p className="brain-label">Proposal Versions</p>
            <div className="proposal-tabs">
              {proposalVersions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  className={`proposal-tab ${
                    selectedProposal?.id === version.id ? "proposal-tab--active" : ""
                  }`}
                  onClick={() => onSelectProposal(version.id)}
                >
                  {version.label}
                </button>
              ))}
            </div>
          </div>

          {selectedProposal ? (
            <article className="proposal-body">
              <h3>{selectedProposal.proposal.title}</h3>
              <pre>{selectedProposal.proposal.proposalText}</pre>
            </article>
          ) : (
            <p className="empty-state">
              Proposal output will appear here when the agent reaches a proposal step.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
