export function MeetingTranscript({
  conversation,
  draftMessage,
  isLoading,
  onDraftChange,
  onSend,
  onSpeakerChange,
  speakerRole,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSend();
  }

  return (
    <section className="panel panel--meeting">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Meeting Room</p>
          <h2>Live conversation</h2>
        </div>
      </div>

      <div className="chat-feed">
        {conversation.map((message) => (
          <article
            key={message.id}
            className={`chat-bubble ${
              message.role === "client"
                ? "chat-bubble--client"
                : message.role === "sales"
                  ? "chat-bubble--sales"
                  : "chat-bubble--assistant"
            }`}
          >
            <div className="chat-meta">
              <span className="speaker-label">{message.role}</span>
            </div>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <div className="role-toggle">
          <button
            type="button"
            className={speakerRole === "client" ? "role-toggle__button role-toggle__button--active" : "role-toggle__button"}
            onClick={() => onSpeakerChange("client")}
            disabled={isLoading}
          >
            Client
          </button>
          <button
            type="button"
            className={speakerRole === "sales" ? "role-toggle__button role-toggle__button--active" : "role-toggle__button"}
            onClick={() => onSpeakerChange("sales")}
            disabled={isLoading}
          >
            Sales
          </button>
        </div>

        <textarea
          value={draftMessage}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Enter the next line from the meeting..."
          rows={4}
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading || !draftMessage.trim()}>
          {isLoading ? "Updating..." : "Add message"}
        </button>
      </form>
    </section>
  );
}
