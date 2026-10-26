import type { Suspect } from "@case-zero/shared";
import { SuspectPortrait } from "./SuspectPortrait";
import { SuspicionMeter } from "./SuspicionMeter";
import { SUSPICION_LABEL, primeSuspect, type SuspicionLevel } from "../lib/suspicion";

interface Props {
    suspects: Suspect[];
    onOpen: (id: string) => void;
    onBack: () => void;
    selectedSuspectId: string | null;
    onSelectSuspect: (id: string) => void;
    /** Nach dem Absenden der Anklage ist die Auswahl gesperrt (#27). */
    selectionLocked?: boolean;
    /** Eigener Verdachtsgrad pro Person (#43) — nur Anzeige, gesetzt wird im Profil. */
    suspicion?: Record<string, SuspicionLevel>;
}

/**
 * Story #14 — Liste der Verdaechtigen.
 * Name und Bild pro Person, Anzahl in der Kopfzeile, Klick oeffnet das Profil.
 * Story #25 — Einen Verdaechtigen als Taeter auswaehlen.
 */
export function SuspectList({
  suspects,
  onOpen,
  onBack,
  selectedSuspectId,
  onSelectSuspect,
  selectionLocked = false,
  suspicion = {},
}: Props) {
  const prime = primeSuspect(suspects, suspicion);
    const selectedSuspect = suspects.find((suspect) => suspect.id === selectedSuspectId) ?? null;

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Verdaechtige · {suspects.length}
        </p>
        <button onClick={onBack}>Zurück zur Fallakte</button>
      </div>

      {suspects.length === 0 ? (
        <p className="evidence-list__empty">In diesem Fall ist niemand als verdaechtig gefuehrt.</p>
      ) : (
        <ul className="suspect-list">
            {suspects.map((suspect) => {
              const isSelected = suspect.id === selectedSuspectId;
              return (
            <li key={suspect.id}>
              <button className="suspect" onClick={() => onOpen(suspect.id)}>
                <SuspectPortrait suspect={suspect} />
                <span className="suspect__text">
                  <span className="suspect__name">{suspect.name}</span>
                  <span className="suspect__relation">{suspect.relationToVictim}</span>
                  <SuspicionMeter name={suspect.name} level={suspicion[suspect.id]} />
                </span>
              </button>
              <button
                type="button"
                className={isSelected ? "suspect-selection__button is-selected" : "suspect-selection__button"}
                aria-pressed={isSelected}
                disabled={selectionLocked}
                onClick={() => onSelectSuspect(suspect.id)}
              >
                {isSelected ? "Ausgewählt ✓ (aufheben)" : "Als Täter auswählen"}
              </button>
            </li>
          );
        })}
        </ul>
      )}

    <section className="suspect-selection__summary" aria-live="polite">
        <p className="terminal-title">Anklage · Zusammenfassung</p>
        {selectedSuspect ? (
          <p>
            Ausgewählter Täter: <strong>{selectedSuspect.name}</strong>
          </p>
        ) : (
          <p>Noch kein Täter ausgewählt.</p>
        )}
        {selectionLocked && <p>Die Anklage ist abgesendet. Die Auswahl ist gesperrt.</p>}
        {prime && (
          <p className="suspect-selection__hint">
            Dein Hauptverdacht: <strong>{prime.name}</strong> (
            {SUSPICION_LABEL[suspicion[prime.id]]})
          </p>
        )}
      </section>
    </section>
  );
}