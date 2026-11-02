import { useState } from "react";
import type { ActivityEntry } from "@case-zero/shared";

interface Props {
  entries: ActivityEntry[];
  /** Eigener Name, damit eigene Einträge mit "du" erkennbar sind. */
  myName: string;
  joined: boolean;
  onBack: () => void;
}

function time(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/**
 * Story #76 — Aktivitätsprotokoll des Teams.
 *
 * Wer was untersucht, geteilt, übernommen oder erledigt hat — live vom Server,
 * neueste Einträge oben. Filter nach Person, damit man bei vielen Einträgen
 * nachvollziehen kann, wer woran war.
 */
export function ActivityLog({ entries, myName, joined, onBack }: Props) {
  const [person, setPerson] = useState<string>("");
  const people = [...new Set(entries.map((e) => e.who).filter((w): w is string => Boolean(w)))];
  const shown = [...entries].reverse().filter((e) => !person || e.who === person);

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Aktivitätsprotokoll · {entries.length} {entries.length === 1 ? "Eintrag" : "Einträge"}
        </p>
        <button onClick={onBack}>Zurück zur Fallakte</button>
      </div>

      {!joined ? (
        <p className="briefing__empty">Tritt zuerst in der Fallakte dem Team bei, dann siehst du das Protokoll.</p>
      ) : (
        <>
          {people.length > 1 && (
            <div className="case-status__actions">
              <label className="team-code__label" htmlFor="activity-person">
                Person
              </label>
              <select id="activity-person" value={person} onChange={(e) => setPerson(e.target.value)}>
                <option value="">Alle</option>
                {people.map((p) => (
                  <option key={p} value={p}>
                    {p}
                    {p === myName ? " (du)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {shown.length === 0 ? (
            <p className="evidence-list__empty">Noch nichts passiert. Hier steht bald, wer was untersucht hat.</p>
          ) : (
            <ol className="evidence-list__items" aria-live="polite">
              {shown.map((e) => (
                <li key={e.id} className="evidence-list__item">
                  <span className="evidence-list__found">{time(e.at)}</span>
                  <span className="evidence-list__description" style={{ margin: 0 }}>
                    {e.who ? (
                      <>
                        <strong>{e.who === myName ? `${e.who} (du)` : e.who}</strong> {e.text}
                      </>
                    ) : (
                      e.text
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
