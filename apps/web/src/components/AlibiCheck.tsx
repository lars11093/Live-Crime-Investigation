import type { CrimeWindow } from "@case-zero/shared";
import {
  VERDICT_LABEL,
  alibiTimeline,
  coversWindow,
  toMinutes,
  type AlibiVerdict,
} from "../lib/alibi";

interface Props {
  statement?: string;
  /** Das Tatzeitfenster aus dem Briefing. Fehlt es, laesst sich nichts pruefen. */
  crimeWindow?: CrimeWindow;
  verdict?: AlibiVerdict;
  onVerdict: (verdict: AlibiVerdict) => void;
}

/** Zeitstrahl eine halbe Stunde vor bis eine halbe Stunde nach der Tat. */
const PADDING = 30;

/**
 * Story #42 — ein Alibi gegen die Tatzeit pruefen.
 *
 * Ein Zeitstrahl mit dem Tatzeitfenster und allen Uhrzeiten aus der Aussage,
 * darunter jede Angabe mit dem Satz, aus dem sie stammt. Das Urteil faellt der
 * Ermittler selbst — das Spiel sagt nicht, ob ein Alibi stimmt.
 */
export function AlibiCheck({ statement, crimeWindow, verdict, onVerdict }: Props) {
  if (!crimeWindow) return null;
  const from = toMinutes(crimeWindow.from);
  const to = toMinutes(crimeWindow.to);
  if (from === null || to === null) return null;

  const entries = alibiTimeline(statement, crimeWindow);
  const start = Math.min(from - PADDING, ...entries.map((e) => e.minutes));
  const end = Math.max(to + PADDING, ...entries.map((e) => e.minutes));
  const pos = (minutes: number) => `${((minutes - start) / (end - start)) * 100}%`;

  return (
    <div className="alibi">
      <p className="team-code__label">Alibi-Pruefung · Tatzeit {crimeWindow.from}–{crimeWindow.to}</p>

      <div className="alibi__timeline" aria-hidden="true">
        <span
          className="alibi__window"
          style={{ left: pos(from), width: `calc(${pos(to)} - ${pos(from)})` }}
        />
        {entries.map((entry, index) => (
          <span
            key={index}
            className={`alibi__tick${entry.inWindow ? " alibi__tick--in" : ""}`}
            style={{ left: pos(entry.minutes) }}
          >
            {entry.time}
          </span>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="briefing__empty">Die Aussage enthaelt keine Uhrzeit.</p>
      ) : (
        <ul className="alibi__entries">
          {entries.map((entry, index) => (
            <li key={index} className={entry.inWindow ? "alibi__entry--in" : ""}>
              <strong>{entry.time}</strong>{" "}
              <span className="evidence-list__kind">
                {entry.inWindow ? "in der Tatzeit" : "ausserhalb"}
              </span>{" "}
              {entry.sentence}
            </li>
          ))}
        </ul>
      )}

      {!coversWindow(entries, crimeWindow) && (
        <p className="alibi__warning">
          Keine Angabe faellt in die Tatzeit — fuer {crimeWindow.from}–{crimeWindow.to} gibt es kein konkretes
          Alibi.
        </p>
      )}

      <div className="insight-rating" role="group" aria-label="Alibi einschaetzen">
        <span className="team-code__label" style={{ margin: 0 }}>
          Mein Urteil
        </span>
        {(Object.keys(VERDICT_LABEL) as AlibiVerdict[]).map((option) => (
          <button
            key={option}
            className={`insight-rating__option${verdict === option ? " insight-rating__option--on alibi__verdict--" + option : ""}`}
            aria-pressed={verdict === option}
            onClick={() => onVerdict(option)}
          >
            {VERDICT_LABEL[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
