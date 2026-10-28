import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CaseSummary } from "@case-zero/shared";
import { createRoom, fetchCaseList } from "../lib/api";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; cases: CaseSummary[] };

/**
 * Story #30 — Uebersicht der verfuegbaren Faelle.
 *
 * Pro Fall: Titel, Tatort, Tatzeit und Anzahl Verdaechtige — genug, um zu
 * waehlen, ohne etwas von der Loesung zu verraten. "Diesen Fall starten"
 * legt wie bisher eine Team-Session an (#5).
 */
export function CaseOverviewPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [startingId, setStartingId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchCaseList()
      .then((cases) => {
        if (!cancelled) setState({ status: "ready", cases });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  async function start(caseId: string) {
    setStartingId(caseId);
    setStartError(null);
    try {
      const room = await createRoom(caseId);
      navigate(`/fall/${room.code}`);
    } catch {
      setStartError("Fall konnte nicht gestartet werden. Server nicht erreichbar.");
      setStartingId(null);
    }
  }

  return (
    <main className="app-shell">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Verfuegbare Faelle
        </p>
        <button onClick={() => navigate("/")}>Zur Startseite</button>
      </div>

      {state.status === "loading" && (
        <div className="panel case-status">
          <span className="case-status__spinner" aria-hidden="true" />
          <p>Faelle werden geladen&hellip;</p>
        </div>
      )}

      {state.status === "error" && (
        <div className="panel case-status">
          <p className="case-status__error">Faelle konnten nicht geladen werden</p>
          <div className="case-status__actions">
            <button className="button--primary" onClick={load}>
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {state.status === "ready" &&
        (state.cases.length === 0 ? (
          <p className="evidence-list__empty">Zurzeit ist kein Fall verfuegbar.</p>
        ) : (
          <ul className="case-overview">
            {state.cases.map((summary) => (
              <li key={summary.id} className="panel case-overview__item">
                <h2 className="case-title" style={{ margin: 0 }}>
                  {summary.title}
                </h2>
                <dl className="briefing__facts">
                  <div>
                    <dt>Tatort</dt>
                    <dd>{summary.location ?? "unbekannt"}</dd>
                  </div>
                  <div>
                    <dt>Tatzeit</dt>
                    <dd>{summary.timeOfCrime ?? "unbekannt"}</dd>
                  </div>
                  <div>
                    <dt>Verdaechtige</dt>
                    <dd>{summary.suspectCount}</dd>
                  </div>
                </dl>
                <button
                  className="button--primary"
                  onClick={() => start(summary.id)}
                  disabled={startingId !== null}
                >
                  {startingId === summary.id ? "Fall wird gestartet…" : "Diesen Fall starten"}
                </button>
              </li>
            ))}
          </ul>
        ))}

      {startError && (
        <p className="team-code__error" role="alert">
          {startError}
        </p>
      )}
    </main>
  );
}
