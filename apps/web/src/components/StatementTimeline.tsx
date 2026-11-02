import type { Suspect } from "@case-zero/shared";
import { OVERLAP_MINUTES, buildStatementTimeline } from "../lib/statementTimeline";

interface Props {
  suspects: Suspect[];
  onOpen: (suspectId: string) => void;
}

/**
 * Story #68 — eine Zeitachse aller Aussagen.
 *
 * Jede Uhrzeit aus jeder Aussage als eigene Zeile, chronologisch. Liegen
 * Angaben verschiedener Personen nah beieinander, ist die Zeile hervorgehoben:
 * Dort lohnt sich der Abgleich mit Badge-Protokoll und Kamera.
 */
export function StatementTimeline({ suspects, onOpen }: Props) {
  const timeline = buildStatementTimeline(suspects);
  const overlapCount = timeline.filter((e) => e.overlaps).length;

  return (
    <section className="panel">
      <p className="terminal-title">Zeitachse der Aussagen · {timeline.length} Angaben</p>
      {timeline.length === 0 ? (
        <p className="evidence-list__empty">In den Aussagen steht keine Uhrzeit.</p>
      ) : (
        <>
          <p className="case-status__hint">
            {overlapCount > 0
              ? `${overlapCount} Angaben liegen höchstens ${OVERLAP_MINUTES} Minuten neben der Angabe einer anderen Person.`
              : "Keine Angaben verschiedener Personen liegen nah beieinander."}
          </p>
          <ol className="statement-timeline">
            {timeline.map((entry, index) => (
              <li
                key={`${entry.suspectId}:${entry.time}:${index}`}
                className={`statement-timeline__row${entry.overlaps ? " statement-timeline__row--overlap" : ""}`}
              >
                <time className="statement-timeline__time">{entry.time}</time>
                <button className="statement-timeline__who" onClick={() => onOpen(entry.suspectId)}>
                  {entry.suspectName}
                </button>
                <span>
                  {entry.sentence}
                  {entry.overlaps && <span className="visually-hidden"> (Überschneidung)</span>}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
