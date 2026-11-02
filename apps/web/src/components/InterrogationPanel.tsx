import { useState } from "react";
import type { InterrogationQuestion, Suspect } from "@case-zero/shared";

interface Props {
  suspect: Suspect;
  /** Bisheriges Gespräch, in Reihenfolge (#66). */
  asked: InterrogationQuestion[];
  /** Fragen, die noch gestellt werden können. */
  open: InterrogationQuestion[];
  onAsk: (questionId: string) => void;
  /** Durch eine Entscheidung verworfene Fragen (#67). */
  closedCount?: number;
}

/**
 * Story #66 — eine Befragung starten.
 *
 * "Befragung starten" öffnet das Gespräch. Jede gestellte Frage steht mit
 * Antwort im Protokoll, die offenen Fragen darunter zur Auswahl. Bereits
 * Gefragtes bleibt sichtbar, auch nach dem Neuladen.
 */
export function InterrogationPanel({ suspect, asked, open, onAsk, closedCount = 0 }: Props) {
  const [started, setStarted] = useState(asked.length > 0);
  const total = suspect.interrogation?.length ?? 0;
  if (total === 0) return null;

  return (
    <section className="panel interrogation">
      <p className="terminal-title">
        Befragung · {suspect.name} · {asked.length} / {total} Fragen
      </p>

      {!started ? (
        <button className="button--primary" onClick={() => setStarted(true)}>
          Befragung starten
        </button>
      ) : (
        <>
          {asked.length > 0 && (
            <ol className="interrogation__log" aria-label="Gesprächsprotokoll">
              {asked.map((q) => (
                <li key={q.id}>
                  <p className="interrogation__question">
                    <span className="evidence-list__kind">Ermittlung</span> {q.question}
                  </p>
                  <p className="interrogation__answer">
                    <span className="evidence-list__kind">{suspect.name}</span> {q.answer}
                  </p>
                </li>
              ))}
            </ol>
          )}
          {closedCount > 0 && (
            <p className="case-status__hint">
              {closedCount} {closedCount === 1 ? "Frage ist" : "Fragen sind"} durch deine Wahl verworfen.
            </p>
          )}
          {open.length > 0 ? (
            <div className="interrogation__choices" role="group" aria-label="Nächste Frage wählen">
              {open.map((q) => (
                <button
                  key={q.id}
                  className={q.closes?.length ? "interrogation__choice--decision" : undefined}
                  title={q.closes?.length ? "Entscheidung: schliesst andere Fragen aus" : undefined}
                  onClick={() => onAsk(q.id)}
                >
                  {q.question}
                </button>
              ))}
            </div>
          ) : (
            <p className="case-status__hint">Keine Fragen mehr offen. Gleiche die Antworten mit den Spuren ab.</p>
          )}
        </>
      )}
    </section>
  );
}
