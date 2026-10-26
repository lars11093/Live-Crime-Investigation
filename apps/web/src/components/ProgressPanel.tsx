import type { CaseProgressSummary } from "../lib/progress";

interface Props {
  summary: CaseProgressSummary;
}

/**
 * Story #24 — Ermittlungsfortschritt.
 * Oben der Gesamtanteil als Balken, darunter jeder Tatort mit seinem Stand und
 * den Stellen, die noch niemand untersucht hat.
 */
export function ProgressPanel({ summary }: Props) {
  return (
    <section className="panel progress">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Ermittlungsfortschritt
        </p>
        <span className="progress__percent">{summary.percent} %</span>
      </div>

      <div
        className="progress__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={summary.percent}
        aria-label="Anteil gefundener Beweise"
      >
        <span className="progress__fill" style={{ width: `${summary.percent}%` }} />
      </div>

      <p className="case-status__hint" style={{ margin: 0 }}>
        {summary.found} von {summary.total} Beweisen gefunden — eigene Funde und was das Team
        geteilt hat.
      </p>

      <ul className="progress__areas">
        {summary.areas.map((area) => (
          <li
            key={area.sceneId}
            className={`progress__area${area.done ? " progress__area--done" : ""}`}
          >
            <span className="evidence-list__head">
              <span>{area.name}</span>
              <span className="evidence-list__kind">
                {area.done ? "Abgeschlossen" : `Offen · ${area.found}/${area.total} Beweise`}
              </span>
            </span>
            {area.openHotspots.length > 0 && (
              <span className="progress__open">
                Noch nicht untersucht: {area.openHotspots.join(", ")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
