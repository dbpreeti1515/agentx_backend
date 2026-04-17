export function ChatPanel({
  conversation,
  draftMessage,
  onDraftChange,
  onSend,
  isLoading,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSend();
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Left Panel</p>
          <h2>Conversation</h2>
        </div>
      </div>

      <div className="chat-feed">
        {conversation.map((message) => (
          <article
            key={message.id}
            className={`chat-bubble chat-bubble--${message.role}`}
          >
            <div className="chat-meta">
              <span>{message.role === "user" ? "You" : "Agent"}</span>
              {message.meta?.action ? (
                <span className="chat-tag">{message.meta.action}</span>
              ) : null}
            </div>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          value={draftMessage}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Describe the sales request, scope, budget, or negotiation update..."
          rows={4}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !draftMessage.trim()}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}
