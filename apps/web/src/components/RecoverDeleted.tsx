import { useState } from "react";

interface Props {
  deletedCount: number;
  /** Liefert `null` bei Erfolg, sonst die Meldung für den Spieler. */
  onRecover: () => Promise<string | null>;
}

/**
 * Story #71 — gelöschte Nachrichten wiederherstellen.
 * Erscheint nur, wenn auf dem Gerät etwas gelöscht wurde. Nach dem
 * Wiederherstellen stehen die Nachrichten markiert im Chatverlauf.
 */
export function RecoverDeleted({ deletedCount, onRecover }: Props) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (deletedCount <= 0) return null;

  async function recover() {
    setRunning(true);
    setError(await onRecover());
    setRunning(false);
  }

  return (
    <section className="panel recover">
      <p className="terminal-title">Gelöschte Daten</p>
      <p className="case-status__hint">
        Im Speicher liegen Reste von {deletedCount} gelöschten {deletedCount === 1 ? "Nachricht" : "Nachrichten"}.
      </p>
      <button className="button--primary" onClick={recover} disabled={running}>
        {running ? "Stelle wieder her …" : "Gelöschte Daten wiederherstellen"}
      </button>
      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
