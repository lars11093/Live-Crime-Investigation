import { useEffect, useState } from "react";
import type { ChatMessage, Device } from "@case-zero/shared";

interface Props {
  device: Device;
  /** IDs der als relevant markierten Nachrichten. */
  markedIds: string[];
  onToggleMessage: (messageId: string) => void;
  /** IDs aller Beweise in der Akte — daran erkennt die Ansicht schon gesicherte Nachrichten (#21). */
  collectedIds: string[];
  /** Sichert eine Nachricht als Beweis (#21). */
  onSecure: (message: ChatMessage) => void;
  onBack: () => void;
}

/**
 * Story #19 — Chatverlauf eines Geraets lesen.
 * Jede Nachricht mit Absender und Zeit, der Verlauf scrollt in seinem eigenen
 * Fenster, ein Klick markiert eine Nachricht als relevant.
 *
 * Story #21 — eine Nachricht als Beweis sichern.
 * Markieren und Sichern sind bewusst zwei Aktionen: markieren ist eine
 * Lesehilfe und jederzeit umkehrbar, sichern legt die Nachricht in die
 * Beweisakte, wo sie kombiniert und notiert werden kann.
 *
 * Nachrichten des Geraetebesitzers stehen rechts, wie auf einem Handy — so
 * sieht man ohne Lesen, wer geschrieben hat und wer geantwortet.
 */
export function ChatHistory({
  device,
  markedIds,
  onToggleMessage,
  collectedIds,
  onSecure,
  onBack,
}: Props) {
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const marked = new Set(markedIds);
  const collected = new Set(collectedIds);
  const markedCount = device.messages.filter((m) => marked.has(m.id)).length;
  const securedCount = device.messages.filter((m) => collected.has(m.id)).length;

  // Die Bestaetigung verschwindet von selbst, wie beim Einsammeln im Tatort (#9).
  useEffect(() => {
    if (!confirmation) return;
    const timer = setTimeout(() => setConfirmation(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmation]);

  function secure(message: ChatMessage) {
    onSecure(message);
    setConfirmation(`Nachricht von ${message.sender} (${message.sentAt}) ist in deiner Beweisakte.`);
  }

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          {device.label}
        </p>
        <button onClick={onBack}>Zurueck zum Forensik-Terminal</button>
      </div>

      <p className="case-status__hint">
        Besitzer: {device.owner} &middot; {device.messages.length}{" "}
        {device.messages.length === 1 ? "Nachricht" : "Nachrichten"} &middot; {markedCount}{" "}
        markiert &middot; {securedCount} gesichert
      </p>

      {confirmation && (
        <p className="chat__confirmation" role="status">
          {confirmation}
        </p>
      )}

      {device.messages.length === 0 ? (
        <p className="evidence-list__empty">Auf diesem Geraet sind keine Nachrichten gespeichert.</p>
      ) : (
        <>
          <p className="case-status__hint" style={{ marginBottom: "0.6rem" }}>
            Klicke eine Nachricht an, um sie als relevant zu markieren. Was du als Beweis
            brauchst, sicherst du in die Beweisakte.
          </p>
          <ol className="chat" tabIndex={0} aria-label={`Chatverlauf ${device.label}`}>
            {device.messages.map((message) => {
              const isMarked = marked.has(message.id);
              const isSecured = collected.has(message.id);
              const isOwn = message.sender === device.owner;
              return (
                <li key={message.id} className={`chat__row${isOwn ? " chat__row--own" : ""}`}>
                  <div className="chat__bubble">
                    <button
                      className={`chat__message${isMarked ? " chat__message--marked" : ""}`}
                      onClick={() => onToggleMessage(message.id)}
                      aria-pressed={isMarked}
                      title={isMarked ? "Markierung aufheben" : "Als relevant markieren"}
                    >
                      <span className="chat__meta">
                        <span className="chat__sender">{message.sender}</span>
                        <time className="chat__time">{message.sentAt}</time>
                      </span>
                      <span className="chat__text">{message.text}</span>
                    </button>
                    {isSecured ? (
                      <button className="chat__secure" disabled>
                        In der Beweisakte
                      </button>
                    ) : (
                      <button className="chat__secure" onClick={() => secure(message)}>
                        Als Beweis sichern
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
