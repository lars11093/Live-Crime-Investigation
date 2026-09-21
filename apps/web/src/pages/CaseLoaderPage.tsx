import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CollectedEvidence, PublicCase } from "@case-zero/shared";
import { fetchCase, findRoom } from "../lib/api";
import { CaseBriefingPanel } from "../components/CaseBriefingPanel";
import { SceneView } from "../components/SceneView";
import { EvidenceList } from "../components/EvidenceList";
import { EvidenceDetail } from "../components/EvidenceDetail";

/** Welche Ansicht der geladene Fall gerade zeigt. Der Fall selbst bleibt geladen. */
type View = "briefing" | "akte" | "tatort" | "beweise";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "invalidCode" }
  | { status: "ready"; caseData: PublicCase };

/**
 * Story #2 — Fall laden.
 * Drei Zustaende, nie ein leerer Bildschirm: Laden, Fehler mit "Erneut
 * versuchen", geladener Fall mit sichtbarem Titel.
 */
export function CaseLoaderPage() {
  const { code = "" } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Nach dem Laden erscheint zuerst das Briefing (#2 -> #6).
  const [view, setView] = useState<View>("briefing");
  // Untersuchte Stellen ueberleben das Verlassen der Szene (#8).
  const [investigatedIds, setInvestigatedIds] = useState<string[]>([]);
  // Eingesammelte Funde (#9). Ein Fund kann nur einmal hineinkommen.
  const [collected, setCollected] = useState<CollectedEvidence[]>([]);
  // Welcher Beweis im Detail offen ist (#11).
  const [openEvidenceId, setOpenEvidenceId] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    let cancelled = false;
    setState({ status: "loading" });

    // Erst die Team-Session pruefen, dann den Fall dazu laden. So sehen zwei
    // Personen mit demselben Code garantiert denselben Fall (#5).
    findRoom(code)
      .then((room) => {
        if (!room) {
          if (!cancelled) setState({ status: "invalidCode" });
          return;
        }
        return fetchCase(room.caseId).then((caseData) => {
          if (!cancelled) setState({ status: "ready", caseData });
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

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

  if (state.status === "invalidCode") {
    return (
      <main className="app-shell">
        <p className="terminal-title">Team-Session nicht gefunden</p>
        <div className="panel case-status">
          <p className="case-status__error">Ungueltiger Team-Code</p>
          <p className="case-status__hint">
            Der Code <code>{code}</code> gehoert zu keiner laufenden Ermittlung. Sessions
            leben nur im Serverspeicher — nach einem Server-Neustart sind sie weg.
          </p>
          <div className="case-status__actions">
            <button className="button--primary" onClick={() => navigate("/")}>
              Zur Startseite
            </button>
          </div>
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
    return (
      <SceneView
        scene={scene}
        investigatedIds={investigatedIds}
        onInvestigate={(id) =>
          setInvestigatedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        }
        collectedIds={collected.map((e) => e.id)}
        onCollect={(evidence) =>
          setCollected((prev) =>
            prev.some((e) => e.id === evidence.id) ? prev : [...prev, evidence]
          )
        }
        onBack={() => setView("akte")}
      />
    );
  }

  if (view === "beweise") {
    const open = collected.find((e) => e.id === openEvidenceId);
    return (
      <main className="app-shell">
        {open ? (
          <EvidenceDetail evidence={open} onBack={() => setOpenEvidenceId(null)} />
        ) : (
          <EvidenceList
            evidence={collected}
            onOpen={setOpenEvidenceId}
            onBack={() => setView("akte")}
          />
        )}
      </main>
    );
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
        <p className="case-status__hint">
          Team-Code zum Teilen: <strong className="case-code">{code}</strong>
        </p>
        {scene && (
          <p className="case-status__hint">
            {investigatedIds.length} von {scene.hotspots.length} Stellen im Tatort untersucht
          </p>
        )}
        <p className="case-status__hint">
          {collected.length} {collected.length === 1 ? "Beweis" : "Beweise"} gesichert
        </p>
        <div className="case-status__actions">
          {scene && (
            <button className="button--primary" onClick={() => setView("tatort")}>
              Zum Tatort
            </button>
          )}
          <button onClick={() => setView("beweise")}>
            Beweisakte ({collected.length})
          </button>
          <button onClick={() => setView("briefing")}>Briefing</button>
        </div>
      </div>
    </main>
  );
}
