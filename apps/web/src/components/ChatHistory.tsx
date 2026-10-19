import type { Device } from "@case-zero/shared";

interface Props {
  device: Device;
  /** IDs der als relevant markierten Nachrichten. */
  markedIds: string[];
  onToggleMessage: (messageId: string) => void;
  onBack: () => void;
}

/**
 * Story #19 — Chatverlauf eines Geraets lesen.
 * Jede Nachricht mit Absender und Zeit, der Verlauf scrollt in seinem eigenen
 * Fenster, ein Klick markiert eine Nachricht als relevant.
 *
 * Nachrichten des Geraetebesitzers stehen rechts, wie auf einem Handy — so
 * sieht man ohne Lesen, wer geschrieben hat und wer geantwortet.
 */
export function ChatHistory({ device, markedIds, onToggleMessage, onBack }: Props) {
  const marked = new Set(markedIds);
  const markedCount = device.messages.filter((m) => marked.has(m.id)).length;

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          {device.label}
        </p>
        <button onClick={onBack}>Zurueck zur Fallakte</button>
      </div>

      <p className="case-status__hint">
        Besitzer: {device.owner} &middot; {device.messages.length}{" "}
        {device.messages.length === 1 ? "Nachricht" : "Nachrichten"} &middot; {markedCount}{" "}
        markiert
      </p>

      {device.messages.length === 0 ? (
        <p className="evidence-list__empty">Auf diesem Geraet sind keine Nachrichten gespeichert.</p>
      ) : (
        <>
          <p className="case-status__hint" style={{ marginBottom: "0.6rem" }}>
            Klicke eine Nachricht an, um sie als relevant zu markieren.
          </p>
          <ol className="chat" tabIndex={0} aria-label={`Chatverlauf ${device.label}`}>
            {device.messages.map((message) => {
              const isMarked = marked.has(message.id);
              const isOwn = message.sender === device.owner;
              return (
                <li key={message.id} className={`chat__row${isOwn ? " chat__row--own" : ""}`}>
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
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
