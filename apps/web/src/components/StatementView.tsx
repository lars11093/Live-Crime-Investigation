import { splitByTime, timesIn } from "../lib/statement";

interface Props {
  statement?: string;
}

/**
 * Story #16 — die Aussage eines Verdaechtigen.
 * Uhrzeiten sind hervorgehoben, weil genau sie sich mit dem Badge-Protokoll
 * und der Kamera-Luecke abgleichen lassen.
 */
export function StatementView({ statement }: Props) {
  if (!statement) {
    return (
      <div className="statement">
        <p className="team-code__label">Aussage</p>
        <p className="briefing__empty" style={{ margin: 0 }}>
          Keine Aussage aufgenommen
        </p>
      </div>
    );
  }

  const times = timesIn(statement);

  return (
    <div className="statement">
      <div className="statement__bar">
        <p className="team-code__label" style={{ margin: 0 }}>
          Aussage zur Tatnacht
        </p>
        {times.length > 0 && (
          <p className="statement__times">
            {times.length} {times.length === 1 ? "Zeitangabe" : "Zeitangaben"}
          </p>
        )}
      </div>

      <blockquote className="statement__text">
        {splitByTime(statement).map((segment, i) =>
          segment.isTime ? (
            <mark key={i} className="statement__time">
              {segment.text}
            </mark>
          ) : (
            <span key={i}>{segment.text}</span>
          )
        )}
      </blockquote>
    </div>
  );
}
