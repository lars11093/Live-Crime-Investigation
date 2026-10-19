import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PublicCase } from "@case-zero/shared";
import { combineEvidence, fetchCase, findRoom } from "../lib/api";
import {
  browserStorage,
  loadProgress,
  saveProgress,
  setNote,
  toggleContradiction,
  type CaseProgress,
} from "../lib/caseProgress";
import { CaseBriefingPanel } from "../components/CaseBriefingPanel";
import { SceneView } from "../components/SceneView";
import { EvidenceList } from "../components/EvidenceList";
import { EvidenceDetail } from "../components/EvidenceDetail";
import { CombinePanel } from "../components/CombinePanel";
import { SuspectList } from "../components/SuspectList";
import { SuspectProfile } from "../components/SuspectProfile";
import { ContradictionOverview } from "../components/ContradictionOverview";

/** Welche Ansicht der geladene Fall gerade zeigt. Der Fall selbst bleibt geladen. */
type View = "briefing" | "akte" | "tatort" | "beweise" | "verdaechtige";

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
  // Fortschritt kommt gespeichert herein und wird bei jeder Aenderung
  // zurueckgeschrieben, damit Notizen ein Neuladen ueberleben (#12).
  const [progress, setProgress] = useState<CaseProgress>(() =>
    loadProgress(browserStorage(), code)
  );
  const { investigatedIds, collected, notes, insights, contradictions } = progress;
  // Welcher Beweis im Detail offen ist (#11).
  const [openEvidenceId, setOpenEvidenceId] = useState<string | null>(null);
  // Welcher Verdaechtige im Profil offen ist (#15).
  const [openSuspectId, setOpenSuspectId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    saveProgress(browserStorage(), code, progress);
  }, [code, progress]);

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
          setProgress((prev) =>
            prev.investigatedIds.includes(id)
              ? prev
              : { ...prev, investigatedIds: [...prev.investigatedIds, id] }
          )
        }
        collectedIds={collected.map((e) => e.id)}
        onCollect={(evidence) =>
          setProgress((prev) =>
            prev.collected.some((e) => e.id === evidence.id)
              ? prev
              : { ...prev, collected: [...prev.collected, evidence] }
          )
        }
        onBack={() => setView("akte")}
      />
    );
  }

  if (view === "verdaechtige") {
    const openSuspect = caseData.suspects.find((s) => s.id === openSuspectId);
    return (
      <main className="app-shell">
        {openSuspect ? (
          <SuspectProfile
            suspect={openSuspect}
            markedIndices={contradictions
              .filter((c) => c.suspectId === openSuspect.id)
              .map((c) => c.sentenceIndex)}
            onToggleSentence={(sentenceIndex, text) =>
              setProgress((prev) => ({
                ...prev,
                contradictions: toggleContradiction(prev.contradictions, {
                  suspectId: openSuspect.id,
                  suspectName: openSuspect.name,
                  sentenceIndex,
                  text,
                }),
              }))
            }
            onBack={() => setOpenSuspectId(null)}
          />
        ) : (
          <>
            <SuspectList
              suspects={caseData.suspects}
              onOpen={setOpenSuspectId}
              onBack={() => setView("akte")}
            />
            <div style={{ marginTop: "1rem" }}>
              <ContradictionOverview contradictions={contradictions} />
            </div>
          </>
        )}
      </main>
    );
  }

  if (view === "beweise") {
    const open = collected.find((e) => e.id === openEvidenceId);
    return (
      <main className="app-shell">
        {open ? (
          <EvidenceDetail
            evidence={open}
            note={notes[open.id] ?? ""}
            onSaveNote={(text) =>
              setProgress((prev) => ({ ...prev, notes: setNote(prev.notes, open.id, text) }))
            }
            onBack={() => setOpenEvidenceId(null)}
          />
        ) : (
          <>
            <EvidenceList
              evidence={collected}
              notes={notes}
              onOpen={setOpenEvidenceId}
              onBack={() => setView("akte")}
            />
            <div style={{ marginTop: "1rem" }}>
              <CombinePanel
                evidence={collected}
                insights={insights}
                onCombine={async (a, b) => {
                  try {
                    const result = await combineEvidence(
                      state.caseData.id,
                      [a, b],
                      insights.map((i) => i.id)
                    );
                    if (result.ok) {
                      setProgress((prev) => ({
                        ...prev,
                        insights: [...prev.insights, result.insight],
                      }));
                      return `Neue Erkenntnis: ${result.insight.title}`;
                    }
                    if (result.reason === "already-found") {
                      return "Diese Verknuepfung hast du bereits aufgedeckt.";
                    }
                    if (result.reason === "invalid") {
                      return "Waehle zwei verschiedene Beweise.";
                    }
                    return "Zwischen diesen beiden Beweisen ist kein Zusammenhang erkennbar.";
                  } catch {
                    return "Server nicht erreichbar. Bitte erneut versuchen.";
                  }
                }}
              />
            </div>
          </>
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
          <button onClick={() => setView("verdaechtige")}>
            Verdaechtige ({caseData.suspects.length})
          </button>
          <button onClick={() => setView("briefing")}>Briefing</button>
        </div>
      </div>
    </main>
  );
}
