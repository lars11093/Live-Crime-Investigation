import { useState } from "react";
import type { CrimeWindow, SystemLogEntry } from "@case-zero/shared";
import { CATEGORY_LABEL, analyzeLog, usageSpan, type LogCategory } from "../lib/systemLog";

interface Props {
  log: SystemLogEntry[];
  crimeWindow?: CrimeWindow;
}

/**
 * Story #46 — Systemprotokolle analysieren.
 *
 * Das Protokoll eines Geraets als Terminal-Liste. Eintraege in der Tatzeit
 * sind rot markiert, Kategorien lassen sich filtern, und oben steht, wann das
 * Geraet zuletzt aktiv bedient wurde.
 */
export function SystemLogView({ log, crimeWindow }: Props) {
  const [categories, setCategories] = useState<LogCategory[]>([]);
  const [onlyWindow, setOnlyWindow] = useState(false);

  if (log.length === 0) {
    return (
      <section className="panel">
        <p className="terminal-title">Systemprotokoll</p>
        <p className="evidence-list__empty">Fuer dieses Geraet liegt kein Systemprotokoll vor.</p>
      </section>
    );
  }

  const all = analyzeLog(log, crimeWindow);
  const shown = analyzeLog(log, crimeWindow, categories).filter((e) => !onlyWindow || e.inWindow);
  const span = usageSpan(log);
  const inWindowCount = all.filter((e) => e.inWindow).length;
  const present = (Object.keys(CATEGORY_LABEL) as LogCategory[]).filter((c) =>
    log.some((e) => e.category === c)
  );

  function toggle(category: LogCategory) {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  return (
    <section className="panel">
      <p className="terminal-title">Systemprotokoll · {log.length} Eintraege</p>
      <p className="case-status__hint">
        {span
          ? `Aktiv benutzt zwischen ${span.first} und ${span.last}`
          : "Keine aktive Benutzung protokolliert"}
        {crimeWindow &&
          ` · ${inWindowCount} ${inWindowCount === 1 ? "Eintrag" : "Eintraege"} in der Tatzeit ${crimeWindow.from}–${crimeWindow.to}`}
      </p>

      <div className="evidence-filter__kinds" role="group" aria-label="Protokoll filtern">
        {present.map((category) => {
          const on = categories.includes(category);
          return (
            <button
              key={category}
              className={`evidence-filter__kind${on ? " evidence-filter__kind--on" : ""}`}
              aria-pressed={on}
              onClick={() => toggle(category)}
            >
              {CATEGORY_LABEL[category]}
            </button>
          );
        })}
        {crimeWindow && (
          <button
            className={`evidence-filter__kind${onlyWindow ? " evidence-filter__kind--on" : ""}`}
            aria-pressed={onlyWindow}
            onClick={() => setOnlyWindow((prev) => !prev)}
          >
            Nur Tatzeit
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="evidence-list__empty">Kein Eintrag passt zu diesem Filter.</p>
      ) : (
        <ol className="syslog">
          {shown.map((entry, index) => (
            <li key={index} className={`syslog__row${entry.inWindow ? " syslog__row--window" : ""}`}>
              <time className="syslog__time">{entry.at}</time>
              <span className="syslog__cat">{CATEGORY_LABEL[entry.category]}</span>
              <span className="syslog__event">
                {entry.event}
                {entry.inWindow && <span className="visually-hidden"> (in der Tatzeit)</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
