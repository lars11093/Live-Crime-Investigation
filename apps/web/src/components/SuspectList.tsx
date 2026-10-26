import type { Suspect } from "@case-zero/shared";
import { SuspectPortrait } from "./SuspectPortrait";

interface Props {
    suspects: Suspect[];
    onOpen: (id: string) => void;
    onBack: () => void;
    selectedSuspectId: string | null;
    onSelectSuspect: (id: string) => void;
    /** Nach dem Absenden der Anklage ist die Auswahl gesperrt (#27). */
    selectionLocked?: boolean;
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
}: Props) {
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
                </span>
              </button>
              <button
                type="button"
                className={isSelected ? "suspect-selection__button is-selected" : "suspect-selection__button"}
                aria-pressed={isSelected}
                disabled={selectionLocked}
                onClick={() => onSelectSuspect(suspect.id)}
              >
                {isSelected ? "Ausgewählt ✓" : "Als Täter auswählen"}
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
      </section>
    </section>
  );
}