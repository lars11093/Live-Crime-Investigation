import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PublicCase } from "@case-zero/shared";
import { fetchCase } from "../lib/api";
import { CaseBriefingPanel } from "../components/CaseBriefingPanel";
import { SceneView } from "../components/SceneView";

/** Solange es nur einen Fall gibt, ist er fest verdrahtet. Fallauswahl ist #30. */
const CASE_ID = "case-01";

/** Welche Ansicht der geladene Fall gerade zeigt. Der Fall selbst bleibt geladen. */
type View = "briefing" | "akte" | "tatort";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; caseData: PublicCase };

/**
 * Story #2 — Fall laden.
 * Drei Zustaende, nie ein leerer Bildschirm: Laden, Fehler mit "Erneut
 * versuchen", geladener Fall mit sichtbarem Titel.
 */
export function CaseLoaderPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nach dem Laden erscheint zuerst das Briefing (#2 -> #6).
  const [view, setView] = useState<View>("briefing");
  const navigate = useNavigate();

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: "loading" });
    fetchCase(CASE_ID)
      .then((caseData) => {
        if (!cancelled) setState({ status: "ready", caseData });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  if (state.status === "loading") {
    return (
      <main className="app-shell">
        <p className="terminal-title">Fallakte wird geoeffnet</p>
        <div className="panel case-status">
          <span className="case-status__spinner" aria-hidden="true" />
          <p>Fall wird geladen&hellip;</p>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="app-shell">
        <p className="terminal-title">Verbindung fehlgeschlagen</p>
        <div className="panel case-status">
          <p className="case-status__error">Fall konnte nicht geladen werden</p>
          <p className="case-status__hint">
            Der Ermittlungsserver antwortet nicht. Laeuft <code>npm run dev</code>?
          </p>
          <div className="case-status__actions">
            <button className="button--primary" onClick={load}>
              Erneut versuchen
            </button>
            <button onClick={() => navigate("/")}>Zur Startseite</button>
          </div>
        </div>
      </main>
    );
  }

  const { caseData } = state;

  // Solange nur ein Tatort pro Fall angezeigt wird, ist es der erste.
  // Mehrere Tatorte zur Auswahl sind #59.
  const scene = caseData.scenes.at(0);

  if (view === "tatort" && scene) {
    return <SceneView scene={scene} onBack={() => setView("akte")} />;
  }

  if (view === "briefing") {
    return (
      <main className="app-shell">
        <CaseBriefingPanel
          title={caseData.title}
          briefing={caseData.briefing}
          onOpenScene={() => setView(scene ? "tatort" : "akte")}
          onClose={() => setView("akte")}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <p className="terminal-title">Fallakte geoeffnet</p>
      <div className="panel case-status">
        <h1 className="case-title">{caseData.title}</h1>
        <p className="case-status__hint">
          {caseData.suspects.length} Verdaechtige &middot;{" "}
          {caseData.seedEvidence.length} erste Spuren
        </p>
        <div className="case-status__actions">
          {scene && (
            <button className="button--primary" onClick={() => setView("tatort")}>
              Zum Tatort
            </button>
          )}
          <button onClick={() => setView("briefing")}>Briefing</button>
        </div>
      </div>
    </main>
  );
}
