import React, { useState } from "react";
import { IconVideo } from "./Icons";

export function MeetingScheduler() {
  const [clientName, setClientName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const [generatedLink, setGeneratedLink] = useState("");

  const handleCreate = (event) => {
    event.preventDefault();
    const roomId = Math.random().toString(36).substring(7);
    const link = `${window.location.origin}/?room=${roomId}&client=${encodeURIComponent(
      clientName
    )}`;
    setGeneratedLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="module-container">
      <header className="module-header">
        <div>
          <h1>Meeting Command</h1>
          <p>
            Launch a polished meeting room for your client and keep the internal
            copilot ready for the sales team.
          </p>
        </div>
      </header>

      <section className="module-insight-strip">
        <div className="module-insight-card">
          <span>Meeting mode</span>
          <strong>Dual interface</strong>
        </div>
        <div className="module-insight-card">
          <span>Client access</span>
          <strong>Magic link</strong>
        </div>
        <div className="module-insight-card">
          <span>Copilot visibility</span>
          <strong>Sales only</strong>
        </div>
      </section>

      <div className="scheduler-layout">
        <form className="scheduler-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Meeting Purpose</label>
            <input
              type="text"
              placeholder="e.g. Quarterly Review"
              value={meetingTitle}
              onChange={(event) => setMeetingTitle(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Duration</label>
            <select value={duration} onChange={(event) => setDuration(event.target.value)}>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Initialize Room <IconVideo />
          </button>
        </form>

        {generatedLink ? (
          <div className="link-result-card">
            <div className="link-header">
              <span className="badge-glow">Room Ready</span>
              <h3>Share Access Link</h3>
            </div>
            <div className="link-box">
              <input readOnly value={generatedLink} />
              <button onClick={copyLink}>Copy</button>
            </div>
            <p className="link-note">
              Clients can join instantly via this clean meeting link. No extra dashboard complexity required.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
