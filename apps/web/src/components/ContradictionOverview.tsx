import type { Contradiction } from "../lib/caseProgress";

interface Props {
  contradictions: Contradiction[];
}

/**
 * Story #17 — Uebersicht der markierten Widersprueche.
 * Sammelt ueber alle Verdaechtigen hinweg, damit sich Aussagen
 * nebeneinander lesen lassen — genau darum geht es beim Vergleichen.
 */
export function ContradictionOverview({ contradictions }: Props) {
  return (
    <section className="panel">
      <p className="terminal-title">Markierte Widersprueche · {contradictions.length}</p>

      {contradictions.length === 0 ? (
        <p className="evidence-list__empty">
          Noch nichts markiert. Oeffne ein Profil und klicke in der Aussage einen Satz an,
          der nicht zu den Beweisen passt.
        </p>
      ) : (
        <ul className="contradiction-list">
          {contradictions.map((entry) => (
            <li key={`${entry.suspectId}:${entry.sentenceIndex}`} className="contradiction">
              <span className="evidence-list__kind">{entry.suspectName}</span>
              <p className="contradiction__text">{entry.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
