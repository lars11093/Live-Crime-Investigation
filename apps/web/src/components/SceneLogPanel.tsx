import { formatLogTime, groupByScene, type SceneLogEntry } from "../lib/sceneLog";

interface Props {
  log: SceneLogEntry[];
}

/**
 * Story #61 — Tatortprotokoll: was habe ich wo und wann gemacht?
 * Pro Tatort eine Liste in der Reihenfolge, in der es passiert ist.
 */
export function SceneLogPanel({ log }: Props) {
  const collected = log.filter((e) => e.action === "eingesammelt").length;
  return (
    <section className="panel">
      <p className="terminal-title">
        Tatortprotokoll · {log.length} {log.length === 1 ? "Eintrag" : "Einträge"}
      </p>
      {log.length === 0 ? (
        <p className="evidence-list__empty">Noch nichts protokolliert. Untersuche eine Stelle im Tatort.</p>
      ) : (
        <>
          <p className="case-status__hint">
            {log.length - collected} Stellen untersucht · {collected} Funde gesichert
          </p>
          {groupByScene(log).map((group) => (
            <div key={group.sceneName} className="scene-log">
              <p className="team-code__label">{group.sceneName}</p>
              <ol className="scene-log__list">
                {group.entries.map((entry, index) => (
                  <li key={index} className="scene-log__row">
                    <time className="scene-log__time">{formatLogTime(entry.at)}</time>
                    <span className="evidence-list__kind">{entry.action}</span>
                    <span>
                      {entry.hotspotLabel}
                      {entry.evidenceLabel && ` → ${entry.evidenceLabel}`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
