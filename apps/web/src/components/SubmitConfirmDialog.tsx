import { useEffect, useRef } from "react";

interface Props {
  suspectName: string;
  evidenceLabels: string[];
  /** Anzahl Warnungen aus der Pruefung (#52) — als letzter Denkanstoss. */
  warningCount: number;
  sending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Story #53 — Bestaetigung vor dem endgueltigen Absenden.
 *
 * Zeigt noch einmal, was abgesendet wird, und dass es danach kein Zurueck
 * gibt (#27). Der Fokus liegt zuerst auf "Zurueck", nicht auf "Absenden" —
 * ein versehentliches Enter schliesst nichts ab. Escape bricht ab.
 */
export function SubmitConfirmDialog({
  suspectName,
  evidenceLabels,
  warningCount,
  sending,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Aktuelle Callbacks in einer Ref, damit die Effekte nicht bei jedem
  // Re-Render der Seite (z. B. neue Chatnachricht, #49) neu laufen und den
  // Fokus zurueck auf "Zurueck" setzen.
  const latest = useRef({ onCancel, sending });
  latest.current = { onCancel, sending };

  // Fokus einmal beim Oeffnen.
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !latest.current.sending) latest.current.onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="confirm-dialog" role="presentation">
      <div
        className="confirm-dialog__panel"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
      >
        <p className="terminal-title">Endgueltig absenden?</p>
        <h2 id="confirm-title" className="hotspot-detail__title">
          Anklage gegen {suspectName}
        </h2>
        <p id="confirm-text" className="hotspot-detail__text">
          Nach dem Absenden kann die Anklage nicht mehr geaendert werden, und der Fall wird
          aufgeloest — fuer das ganze Team.
        </p>
        <p className="team-code__label">Beweise · {evidenceLabels.length}</p>
        <ul className="confirm-dialog__evidence">
          {evidenceLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        {warningCount > 0 && (
          <p className="alibi__warning">
            Die Pruefung hat {warningCount} {warningCount === 1 ? "Warnung" : "Warnungen"} gefunden.
          </p>
        )}
        <div className="case-status__actions">
          <button ref={cancelRef} onClick={onCancel} disabled={sending}>
            Zurueck zur Anklage
          </button>
          <button className="button--danger" onClick={onConfirm} disabled={sending}>
            {sending ? "Wird uebermittelt…" : "Endgueltig absenden"}
          </button>
        </div>
      </div>
    </div>
  );
}
