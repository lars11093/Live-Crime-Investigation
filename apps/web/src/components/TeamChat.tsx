import { useEffect, useRef, useState, type FormEvent } from "react";
import type { TeamChatMessage } from "@case-zero/shared";
import { formatChatTime } from "../lib/teamChat";
import { ROLE_LABEL } from "../lib/player";

interface Props {
  myId: string;
  messages: TeamChatMessage[];
  connected: boolean;
  /** Liefert `null` bei Erfolg, sonst den Grund der Ablehnung. */
  onSend: (text: string) => Promise<string | null>;
  onBack: () => void;
}

const TEXT_MAX = 500;

/**
 * Story #49 — mit dem Team chatten.
 *
 * Live ueber Socket.IO: wer im selben Fall ist, sieht neue Nachrichten sofort.
 * Eigene Nachrichten stehen rechts, wie im Chatverlauf der Geraete (#19).
 */
export function TeamChat({ myId, messages, connected, onSend, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  // Neue Nachricht -> ans Ende scrollen.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const problem = await onSend(draft);
    setSending(false);
    setError(problem);
    if (!problem) setDraft("");
  }

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Team-Chat
        </p>
        <button onClick={onBack}>Zurueck zur Fallakte</button>
      </div>

      <p className="case-status__hint">
        {connected ? "Live verbunden" : "Keine Verbindung — Nachrichten kommen an, sobald sie steht."}
      </p>

      {messages.length === 0 ? (
        <p className="evidence-list__empty">Noch keine Nachrichten. Schreib deinem Team, was du gefunden hast.</p>
      ) : (
        <ol className="chat" ref={listRef} tabIndex={0} aria-label="Team-Chat" aria-live="polite">
          {messages.map((message) => {
            const own = message.playerId === myId;
            return (
              <li key={message.id} className={`chat__row${own ? " chat__row--own" : ""}`}>
                <div className="chat__bubble">
                  <div className="chat__message">
                    <span className="chat__meta">
                      <span className="chat__sender">
                        {own ? "Du" : message.name}
                        {message.role && ` · ${ROLE_LABEL[message.role]}`}
                      </span>
                      <time className="chat__time" dateTime={message.sentAt}>
                        {formatChatTime(message.sentAt)}
                      </time>
                    </span>
                    <span className="chat__text">{message.text}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <form className="team-chat__form" onSubmit={submit}>
        <input
          aria-label="Nachricht an das Team"
          placeholder="Nachricht an das Team …"
          value={draft}
          maxLength={TEXT_MAX}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="button--primary" disabled={!draft.trim() || sending}>
          Senden
        </button>
      </form>
      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
