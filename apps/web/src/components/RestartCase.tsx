import { useState } from "react";

interface Props {
  /** Ist man im Team, kommt das ganze Team mit (#57). */
  withTeam: boolean;
  onRestart: () => Promise<string | null>;
}

/**
 * Story #79 — nach der Auflösung den Fall noch einmal spielen.
 * Mit Rückfrage, weil der bisherige Stand in dieser Session bleibt und die
 * neue Session leer beginnt.
 */
export function RestartCase({ withTeam, onRestart }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function restart() {
    setBusy(true);
    const problem = await onRestart();
    setBusy(false);
    setError(problem);
    if (problem) setConfirming(false);
  }

  return (
    <section className="panel">
      <p className="terminal-title">Noch einmal ermitteln</p>
      <p className="case-status__hint">
        Neue Session, gleicher Fall: Der Täter wird neu gewählt, die Akte beginnt leer.
        {withTeam ? " Dein Team kommt automatisch mit." : ""}
      </p>
      {confirming ? (
        <div className="case-status__actions">
          <button className="button--primary" onClick={restart} disabled={busy}>
            {busy ? "Starte neu …" : "Ja, neu starten"}
          </button>
          <button onClick={() => setConfirming(false)} disabled={busy}>
            Abbrechen
          </button>
        </div>
      ) : (
        <button className="button--primary" onClick={() => setConfirming(true)}>
          Fall neu starten
        </button>
      )}
      {error && (
        <p className="team-code__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
