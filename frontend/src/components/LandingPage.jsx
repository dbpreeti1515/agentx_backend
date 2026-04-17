import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { IconBrain, IconVideo, IconProposal, IconArrow } from "./Icons";

export function LandingPage({ onLaunchDashboard, onJoinMeeting, theme, onToggleTheme }) {
  return (
    <div className="landing-area">
      <nav className="landing-nav">
        <div className="logo-section">
          <div className="logo-mark">A</div>
          <span className="logo-text">AgentX</span>
        </div>
        <div className="nav-actions">
          <button onClick={onLaunchDashboard} className="nav-btn">Platform</button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </nav>

      <div className="landing-content">
        <div className="hero-section">
          <div className="badge-glow">Now in Private Beta</div>
          <h1 className="hero-heading">
            Sales Intelligence <br /> 
            <span className="hero-heading--accent">Redefined.</span>
          </h1>
          <p className="hero-leadin">
            The intelligence layer for high-performance sales teams. AgentX turns every customer interaction into a structured opportunity with real-time AI guidance.
          </p>
          <div className="hero-cta-group">
            <button onClick={onLaunchDashboard} className="btn-primary">
              Launch Dashboard <IconArrow />
            </button>
            <button onClick={onJoinMeeting} className="btn-secondary">
              Try Meeting Demo
            </button>
          </div>
        </div>

        {/* BENTO GRID FEATURES */}
        <div className="bento-grid">
          <div className="bento-item bento-item--large">
            <div className="bento-icon"><IconBrain /></div>
            <div className="bento-text">
              <h3>Deep Discovery Brain</h3>
              <p>Our neural engine extracts requirements as you speak, mapping them to your sales methodology in real-time.</p>
            </div>
            <div className="bento-visual brain-visual"></div>
          </div>
          
          <div className="bento-item">
            <div className="bento-icon"><IconVideo /></div>
            <div className="bento-text">
              <h3>P2P AI Video</h3>
              <p>High-fidelity meetings with a visual AI assistant that listens and learns.</p>
            </div>
          </div>

          <div className="bento-item bento-item--tall">
            <div className="bento-icon"><IconProposal /></div>
            <div className="bento-text">
              <h3>Live Proposals</h3>
              <p>Stop waiting to draft. Watch your proposal build itself based on the client's needs expressed during the call.</p>
            </div>
            <div className="bento-visual proposal-visual"></div>
          </div>
          
          <div className="bento-item">
            <div className="bento-icon"><IconArrow /></div>
            <div className="bento-text">
              <h3>Magic Links</h3>
              <p>Seamlessly invite clients with zero friction—no login required for guests.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="landing-footer-minimal">
        <span>© 2026 AgentX Intelligence</span>
        <div className="footer-line"></div>
        <span>Built for the future of Sales</span>
      </footer>
    </div>
  );
}
