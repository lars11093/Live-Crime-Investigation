import type { Suspect } from "@case-zero/shared";
import { SuspectPortrait } from "./SuspectPortrait";

interface Props {
  suspects: Suspect[];
  onOpen: (id: string) => void;
  onBack: () => void;
}

/**
 * Story #14 — Liste der Verdächtigen.
 * Name und Bild pro Person, Anzahl in der Kopfzeile, Klick öffnet das Profil.
 */
export function SuspectList({ suspects, onOpen, onBack }: Props) {
  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Verdächtige · {suspects.length}
        </p>
        <button onClick={onBack}>Zurück zur Fallakte</button>
      </div>

      {suspects.length === 0 ? (
        <p className="evidence-list__empty">In diesem Fall ist niemand als verdächtig geführt.</p>
      ) : (
        <ul className="suspect-list">
          {suspects.map((suspect) => (
            <li key={suspect.id}>
              <button className="suspect" onClick={() => onOpen(suspect.id)}>
                <SuspectPortrait suspect={suspect} />
                <span className="suspect__text">
                  <span className="suspect__name">{suspect.name}</span>
                  <span className="suspect__relation">{suspect.relationToVictim}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
