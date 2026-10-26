import { useState } from "react";
import type { CollectedEvidence, Insight } from "@case-zero/shared";
import {
  STRENGTHS,
  STRENGTH_LABEL,
  sortByStrength,
  type InsightStrength,
} from "../lib/insightRating";

interface Props {
  evidence: CollectedEvidence[];
  insights: Insight[];
  /** Eigene Bewertung pro Erkenntnis (#39). */
  ratings: Record<string, InsightStrength>;
  onRate: (insightId: string, strength: InsightStrength) => void;
  /** Liefert die Rueckmeldung als Text — der Server entscheidet, nicht der Client. */
  onCombine: (a: string, b: string) => Promise<string>;
}

/**
 * Story #13 — zwei Beweise kombinieren.
 *
 * Auswahl per Klick, genau zwei. Was ein Paar ergibt, weiss nur der Server;
 * hier wird nur die Antwort angezeigt.
 *
 * Story #39 — jede aufgedeckte Verknuepfung laesst sich als schwach, mittel
 * oder stark einschaetzen; die starken stehen dann oben.
 */
export function CombinePanel({ evidence, insights, ratings, onRate, onCombine }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setMessage(null);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      // Bei zwei bereits Gewaehlten rueckt der aeltere heraus, statt den
      // Klick wirkungslos verpuffen zu lassen.
      return prev.length < 2 ? [...prev, id] : [prev[1], id];
    });
  }

  async function combine() {
    if (selected.length !== 2 || busy) return;
    setBusy(true);
    try {
      setMessage(await onCombine(selected[0], selected[1]));
      setSelected([]);
    } finally {
      setBusy(false);
    }
  }

  if (evidence.length < 2) {
    return (
      <section className="panel">
        <p className="terminal-title">Verknuepfungen</p>
        <p className="evidence-list__empty">
          Sammle mindestens zwei Beweise, um nach Zusammenhaengen zu suchen.
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <p className="terminal-title">Verknuepfungen</p>
      <p className="case-status__hint">
        Waehle zwei Beweise aus und pruefe, ob sie zusammengehoeren.
      </p>

      <ul className="combine__options">
        {evidence.map((item) => (
          <li key={item.id}>
            <button
              className={`combine__option${selected.includes(item.id) ? " combine__option--on" : ""}`}
              onClick={() => toggle(item.id)}
              aria-pressed={selected.includes(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="case-status__actions">
        <button className="button--primary" onClick={combine} disabled={selected.length !== 2 || busy}>
          {busy ? "Pruefe…" : "Kombinieren"}
        </button>
        <span className="case-status__hint">{selected.length} / 2 gewaehlt</span>
      </div>

      {message && (
        <p className="combine__message" role="status">
          {message}
        </p>
      )}

      {insights.length > 0 && (
        <ol className="evidence-list__items" style={{ marginTop: "1.5rem" }}>
          {sortByStrength(insights, ratings).map((insight) => (
            <li key={insight.id} className="evidence-list__item">
              <div className="evidence-list__head">
                <span className="evidence-list__label">{insight.title}</span>
                <span className="evidence-list__kind">
                  {ratings[insight.id] ? STRENGTH_LABEL[ratings[insight.id]] : "Erkenntnis"}
                </span>
              </div>
              <p className="evidence-list__description">{insight.body}</p>
              <div
                className="insight-rating"
                role="group"
                aria-label={`Zusammenhang bewerten: ${insight.title}`}
              >
                <span className="team-code__label" style={{ margin: 0 }}>
                  Zusammenhang
                </span>
                {STRENGTHS.map((strength) => {
                  const on = ratings[insight.id] === strength;
                  return (
                    <button
                      key={strength}
                      className={`insight-rating__option insight-rating__option--${strength}${
                        on ? " insight-rating__option--on" : ""
                      }`}
                      aria-pressed={on}
                      onClick={() => onRate(insight.id, strength)}
                    >
                      {STRENGTH_LABEL[strength]}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
