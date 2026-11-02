import { useState } from "react";
import type { CollectedEvidence, Insight } from "@case-zero/shared";
import { layoutCards, threadsFor, type BoardState } from "../lib/board";

interface Props {
  evidence: CollectedEvidence[];
  insights: Insight[];
  board: BoardState;
  onToggleThread: (a: string, b: string) => void;
}

/**
 * Story #65 — die Ermittlungstafel.
 *
 * Jeder gesicherte Beweis ist eine Karte. Rote Fäden sind Verknüpfungen,
 * die beim Kombinieren (#13) bestätigt wurden; gestrichelte Fäden sind
 * eigene Vermutungen: zwei Karten nacheinander anklicken spannt einen Faden
 * oder nimmt ihn wieder ab. Die Tafel bewertet nichts — bestätigt wird nur
 * über das Kombinieren auf dem Server.
 */
export function InvestigationBoard({ evidence, insights, board, onToggleThread }: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const layout = layoutCards(evidence);
  const threads = threadsFor(board, evidence, insights);

  function pick(id: string) {
    if (!pending) return setPending(id);
    if (pending !== id) onToggleThread(pending, id);
    setPending(null);
  }

  return (
    <section className="panel">
      <p className="terminal-title">
        Ermittlungstafel · {evidence.length} Karten · {threads.length} Fäden
      </p>
      {evidence.length < 2 ? (
        <p className="evidence-list__empty">Sichere mindestens zwei Beweise, um Fäden zu spannen.</p>
      ) : (
        <>
          <p className="case-status__hint">
            {pending
              ? "Jetzt die zweite Karte anklicken. Ein bestehender eigener Faden wird wieder abgenommen."
              : "Zwei Karten nacheinander anklicken spannt einen eigenen Faden. Rot = beim Kombinieren bestätigt."}
          </p>
          <div className="board">
            <svg className="board__threads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {threads.map((t) => (
                <line
                  key={`${t.a}-${t.b}`}
                  x1={layout[t.a].x}
                  y1={layout[t.a].y}
                  x2={layout[t.b].x}
                  y2={layout[t.b].y}
                  className={`board__thread board__thread--${t.kind}`}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {evidence.map((e) => (
              <button
                key={e.id}
                className={`board__card${pending === e.id ? " board__card--pending" : ""}`}
                style={{ left: `${layout[e.id].x}%`, top: `${layout[e.id].y}%` }}
                aria-pressed={pending === e.id}
                onClick={() => pick(e.id)}
              >
                {e.label}
              </button>
            ))}
          </div>
          {threads.some((t) => t.label) && (
            <ul className="board__legend">
              {threads
                .filter((t) => t.label)
                .map((t) => (
                  <li key={`${t.a}-${t.b}`}>{t.label}</li>
                ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
