import { useState } from "react";
import type { CollectedEvidence, SharedNote } from "@case-zero/shared";

interface ShareProps {
  evidence: CollectedEvidence;
  /** Die eigene, gespeicherte Notiz (#12). Ohne Notiz gibt es nichts zu teilen. */
  note: string;
  joined: boolean;
  onShare: () => Promise<string>;
}

/** Story #64 — die eigene Notiz zu diesem Beweis mit dem Team teilen. */
export function ShareNoteButton({ note, joined, onShare }: ShareProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  if (!note.trim()) return null;

  async function share() {
    setSending(true);
    setMessage(await onShare());
    setSending(false);
  }

  return (
    <div className="case-status__actions" style={{ marginTop: "0.75rem" }}>
      <button onClick={share} disabled={!joined || sending}>
        {sending ? "Teile …" : "Notiz mit dem Team teilen"}
      </button>
      {!joined && <span className="case-status__hint">Tritt zuerst dem Team bei (Fallakte).</span>}
      {message && (
        <span className="case-status__hint" role="status">
          {message}
        </span>
      )}
    </div>
  );
}

interface ListProps {
  notes: SharedNote[];
  myId?: string;
}

/** Story #64 — alle geteilten Notizen des Teams, die neueste zuerst. */
export function SharedNotesList({ notes, myId }: ListProps) {
  return (
    <section className="panel">
      <p className="terminal-title">Notizen des Teams · {notes.length}</p>
      {notes.length === 0 ? (
        <p className="evidence-list__empty">Noch niemand hat eine Notiz geteilt.</p>
      ) : (
        <ul className="contradiction-list">
          {[...notes].reverse().map((note) => (
            <li key={`${note.evidenceId}:${note.sharedById}`} className="contradiction">
              <span className="evidence-list__kind">
                {note.sharedById === myId ? "du" : note.sharedBy} · {note.evidenceLabel}
              </span>
              <p className="contradiction__text">{note.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
