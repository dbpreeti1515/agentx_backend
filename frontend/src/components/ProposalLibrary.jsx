import React from "react";
import { IconProposal, IconArrow } from "./Icons";

export function ProposalLibrary({ proposalVersions = [] }) {
  const mockProposals = [
    { id: "P-101", client: "Acme Corp", date: "2024-03-15", value: "$45,000", status: "signed" },
    { id: "P-102", client: "Global Tech", date: "2024-03-12", value: "$12,500", status: "pending" },
    { id: "P-103", client: "Starlight Inc", date: "2024-03-08", value: "$98,000", status: "signed" },
  ];

  const allProposals = [
    ...proposalVersions.map((proposalVersion) => ({
      id: `DRAFT-${proposalVersion.id}`,
      client: "Active Discovery",
      date: new Date().toLocaleDateString(),
      value: "Calculating...",
      status: "draft",
    })),
    ...mockProposals,
  ];

  return (
    <div className="module-container">
      <header className="module-header">
        <div>
          <h1>Proposal Store</h1>
          <p>Review active drafts and recent proposal intelligence in one place.</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <strong>{allProposals.length}</strong> Total Documents
          </div>
        </div>
      </header>

      <section className="module-insight-strip">
        <div className="module-insight-card">
          <span>Drafts in progress</span>
          <strong>{proposalVersions.length}</strong>
        </div>
        <div className="module-insight-card">
          <span>Signed proposals</span>
          <strong>{mockProposals.filter((item) => item.status === "signed").length}</strong>
        </div>
        <div className="module-insight-card">
          <span>Pending review</span>
          <strong>{mockProposals.filter((item) => item.status === "pending").length}</strong>
        </div>
      </section>

      <div className="library-grid">
        {allProposals.map((proposal) => (
          <div key={proposal.id} className="proposal-card">
            <div className="card-top">
              <div className="prop-badge" data-status={proposal.status}>
                {proposal.status}
              </div>
              <span className="prop-id">{proposal.id}</span>
            </div>
            <h3>{proposal.client}</h3>
            <div className="card-details">
              <span>{proposal.date}</span>
              <strong>{proposal.value}</strong>
            </div>
            <div className="card-actions">
              <button className="btn-icon-only">
                <IconProposal />
              </button>
              <button className="btn-text">
                View Intelligence <IconArrow />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
