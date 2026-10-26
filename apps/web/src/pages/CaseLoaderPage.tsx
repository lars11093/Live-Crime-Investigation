import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PublicCase, Role, TeamView } from "@case-zero/shared";
import {
  combineEvidence,
  fetchCase,
  fetchTeam,
  findRoom,
  joinTeam,
  setRole,
  submitAccusation,
} from "../lib/api";
import {
  browserStorage,
  collectEvidence,
  loadProgress,
  saveNote,
  saveProgress,
  toggleContradiction,
  toggleInvestigated,
  toggleMarkedMessage,
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
import { SuspectCompare } from "../components/SuspectCompare";
import { StatementSearch } from "../components/StatementSearch";
import { ChatHistory } from "../components/ChatHistory";
import { ForensicsTerminal } from "../components/ForensicsTerminal";
import { SystemLogView } from "../components/SystemLogView";
import { messageToEvidence } from "../lib/digitalTrace";
import { markReviewed } from "../lib/forensics";
import { AccusationPanel } from "../components/AccusationPanel";
import { attachEvidence, chooseSuspect, detachEvidence } from "../lib/accusation";
import { loadAccount } from "../lib/account";
import { ROLE_LABEL, playerIdentity } from "../lib/player";
import { TeamRoles } from "../components/TeamRoles";
import { ObjectiveDock } from "../components/ObjectiveDock";
import { TeamChat } from "../components/TeamChat";
import { useTeamChat } from "../lib/useTeamChat";
import { unreadCount } from "../lib/teamChat";
import { TeamTasks } from "../components/TeamTasks";
import { useTeamTasks } from "../lib/useTeamTasks";
import { storePhoto } from "../lib/photos";
import { rateInsight } from "../lib/insightRating";
import { setAlibiVerdict } from "../lib/alibi";
import { setSuspicion } from "../lib/suspicion";
import { setRelevance } from "../lib/relevance";

/** Welche Ansicht der geladene Fall gerade zeigt. Der Fall selbst bleibt geladen. */
type View =
  | "briefing"
  | "akte"
  | "tatort"
  | "beweise"
  | "verdaechtige"
  | "forensik"
  | "anklage"
  | "team"
  | "chat"
  | "aufgaben";

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
  // Angemeldet (#29) gehoert der Fortschritt dem Konto, sonst dem Gast.
  // Einmal beim Oeffnen gelesen: ein Kontowechsel passiert auf der Startseite.
  const [account] = useState(() => loadAccount(browserStorage()));
  // Wer im Team auftritt (#31): Konto oder Gast mit fester ID.
  const [me] = useState(() => playerIdentity(browserStorage(), account));
  const [team, setTeam] = useState<TeamView | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  // Fortschritt kommt gespeichert herein und wird bei jeder Aenderung
  // zurueckgeschrieben, damit Notizen ein Neuladen ueberleben (#12).
  const [progress, setProgress] = useState<CaseProgress>(() =>
    loadProgress(browserStorage(), code, account?.id)
  );
  const {
    investigatedIds,
    collected,
    notes,
    insights,
    contradictions,
    markedMessageIds,
    accusation,
  } = progress;
  // Welcher Beweis im Detail offen ist (#11).
  const [openEvidenceId, setOpenEvidenceId] = useState<string | null>(null);
  // Welcher Verdaechtige im Profil offen ist (#15).
  const [openSuspectId, setOpenSuspectId] = useState<string | null>(null);
  // Welches Geraet im Forensik-Terminal ausgewertet wird (#18 -> #19).
  const [openDeviceId, setOpenDeviceId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    saveProgress(browserStorage(), code, progress, account?.id);
  }, [code, progress, account]);

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

  const refreshTeam = useCallback(() => {
    fetchTeam(code)
      .then((result) => {
        if (result.ok) setTeam(result.team);
      })
      .catch(() => setTeamError("Server nicht erreichbar. Bitte erneut versuchen."));
  }, [code]);

  // Beim Oeffnen des Falls dem Team beitreten (#31). Schlaegt das fehl, laeuft
  // der Fall trotzdem — nur die Team-Funktionen fehlen dann.
  useEffect(() => {
    if (state.status !== "ready") return;
    joinTeam(code, me.id, me.name)
      .then((result) => {
        if (result.ok) setTeam(result.team);
      })
      .catch(() => {});
  }, [state.status, code, me]);

  // Solange die Teamansicht offen ist, alle paar Sekunden nachladen — ohne
  // Socket sieht man sonst nicht, wenn jemand anderes eine Rolle nimmt.
  useEffect(() => {
    if (view !== "team") return;
    refreshTeam();
    const timer = setInterval(refreshTeam, 5000);
    return () => clearInterval(timer);
  }, [view, refreshTeam]);

  // Team-Chat (#49): verbunden, sobald der Fall geladen ist — so zaehlen auch
  // Nachrichten, die ankommen, waehrend man im Tatort ist.
  const chat = useTeamChat(code, me, state.status === "ready");
  const [chatReadCount, setChatReadCount] = useState(0);
  useEffect(() => {
    if (view === "chat") setChatReadCount(chat.messages.length);
  }, [view, chat.messages.length]);
  const chatUnread = unreadCount(chat.messages, me.id, chatReadCount);
  // Gemeinsame Aufgabenliste (#50), ebenfalls live, sobald der Fall geladen ist.
  const teamTasks = useTeamTasks(code, me, state.status === "ready");
  const openTaskCount = teamTasks.tasks.filter((t) => !t.done).length;

  async function changeRole(targetId: string, role: Role | null) {
    setTeamError(null);
    try {
      const result = await setRole(code, me.id, targetId, role);
      if (result.ok) setTeam(result.team);
      else {
        setTeamError(result.message);
        refreshTeam();
      }
    } catch {
      setTeamError("Server nicht erreichbar. Bitte erneut versuchen.");
    }
  }

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

  // Das Ermittlungsziel haengt an jeder Ansicht des geladenen Falls (#32).
  return (
    <>
      {renderView(state.caseData)}
      <ObjectiveDock objective={state.caseData.objective} />
    </>
  );

  function renderView(caseData: PublicCase) {

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
          onToggleInvestigated={(id) =>
            setProgress((prev) => ({
              ...prev,
              investigatedIds: toggleInvestigated(prev.investigatedIds, id),
            }))
          }
          collectedIds={collected.map((e) => e.id)}
          onCollect={(evidence) =>
            setProgress((prev) => ({ ...prev, collected: collectEvidence(prev.collected, evidence) }))
          }
          photographedIds={Object.keys(progress.photos)}
          onPhoto={(photo) =>
            setProgress((prev) => ({ ...prev, photos: storePhoto(prev.photos, photo) }))
          }
          onBack={() => setView("akte")}
        />
      );
    }

    const devices = caseData.devices ?? [];

    if (view === "forensik") {
      // Gesperrte Geraete kommen ohne Nachrichten vom Server und lassen sich im
      // Terminal nicht oeffnen — hier landet nur ein auswertbares Geraet.
      const device = devices.find((d) => d.id === openDeviceId && !d.locked);
      if (!device) {
        return (
          <main className="app-shell">
            <ForensicsTerminal
              devices={devices}
              reviewedIds={progress.reviewedDeviceIds}
              onOpen={(deviceId) => {
                setOpenDeviceId(deviceId);
                // Oeffnen heisst auswerten (#44) — gesperrte lassen sich gar nicht oeffnen.
                setProgress((prev) => ({
                  ...prev,
                  reviewedDeviceIds: markReviewed(prev.reviewedDeviceIds, deviceId),
                }));
              }}
              onBack={() => setView("akte")}
            />
          </main>
        );
      }
      return (
        <main className="app-shell">
          <ChatHistory
            device={device}
            markedIds={markedMessageIds}
            onToggleMessage={(messageId) =>
              setProgress((prev) => ({
                ...prev,
                markedMessageIds: toggleMarkedMessage(prev.markedMessageIds, messageId),
              }))
            }
            collectedIds={collected.map((e) => e.id)}
            onSecure={(message) =>
              setProgress((prev) => ({
                ...prev,
                collected: collectEvidence(
                  prev.collected,
                  // Ausgelesene Metadaten (#45) kommen mit in die Akte.
                  messageToEvidence(device, message, prev.metadataReadIds.includes(message.id))
                ),
              }))
            }
            relevance={progress.relevance}
            onRelevance={(messageId, level) =>
              setProgress((prev) => ({
                ...prev,
                relevance: setRelevance(prev.relevance, messageId, level),
              }))
            }
            metadataReadIds={progress.metadataReadIds}
            onReadMetadata={(messageId) =>
              setProgress((prev) =>
                prev.metadataReadIds.includes(messageId)
                  ? prev
                  : { ...prev, metadataReadIds: [...prev.metadataReadIds, messageId] }
              )
            }
            onBack={() => setOpenDeviceId(null)}
          />
          {/* #46 — das Systemprotokoll gehoert zur Auswertung desselben Geraets. */}
          <div style={{ marginTop: "1rem" }}>
            <SystemLogView
              log={device.systemLog ?? []}
              crimeWindow={caseData.briefing?.crimeWindow}
            />
          </div>
        </main>
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
              crimeWindow={caseData.briefing?.crimeWindow}
              alibiVerdict={progress.alibiVerdicts[openSuspect.id]}
              onAlibiVerdict={(verdict) =>
                setProgress((prev) => ({
                  ...prev,
                  alibiVerdicts: setAlibiVerdict(prev.alibiVerdicts, openSuspect.id, verdict),
                }))
              }
              suspicion={progress.suspicion[openSuspect.id]}
              onSuspicion={(level) =>
                setProgress((prev) => ({
                  ...prev,
                  suspicion: setSuspicion(prev.suspicion, openSuspect.id, level),
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
                selectedSuspectId={accusation.suspectId}
                onSelectSuspect={(id) =>
                  // Story #25 — die Auswahl liegt im Anklage-Entwurf und ueberlebt so ein Neuladen.
                  setProgress((prev) => ({
                    ...prev,
                    accusation: chooseSuspect(prev.accusation, id),
                  }))
                }
                selectionLocked={Boolean(accusation.receipt)}
                suspicion={progress.suspicion}
              />
              <div style={{ marginTop: "1rem" }}>
                <StatementSearch suspects={caseData.suspects} onOpen={setOpenSuspectId} />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <SuspectCompare suspects={caseData.suspects} contradictions={contradictions} />
              </div>
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
              photo={progress.photos[open.id]}
              relevance={progress.relevance[open.id]}
              onRelevance={(level) =>
                setProgress((prev) => ({
                  ...prev,
                  relevance: setRelevance(prev.relevance, open.id, level),
                }))
              }
              noteEditedAt={progress.noteEditedAt[open.id]}
              onSaveNote={(text) => setProgress((prev) => saveNote(prev, open.id, text))}
              onBack={() => setOpenEvidenceId(null)}
            />
          ) : (
            <>
              <EvidenceList
                evidence={collected}
                notes={notes}
                photos={progress.photos}
                relevance={progress.relevance}
                onOpen={setOpenEvidenceId}
                onBack={() => setView("akte")}
              />
              <div style={{ marginTop: "1rem" }}>
                <CombinePanel
                  evidence={collected}
                  insights={insights}
                  ratings={progress.insightRatings}
                  onRate={(insightId, strength) =>
                    setProgress((prev) => ({
                      ...prev,
                      insightRatings: rateInsight(prev.insightRatings, insightId, strength),
                    }))
                  }
                  onCombine={async (a, b) => {
                    try {
                      const result = await combineEvidence(
                        caseData.id,
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

    if (view === "aufgaben") {
      return (
        <main className="app-shell">
          <TeamTasks
            myId={me.id}
            tasks={teamTasks.tasks}
            team={teamTasks.team ?? team}
            onAdd={teamTasks.add}
            onUpdate={teamTasks.update}
            onRemove={teamTasks.remove}
            onBack={() => setView("akte")}
          />
        </main>
      );
    }

    if (view === "chat") {
      return (
        <main className="app-shell">
          <TeamChat
            myId={me.id}
            messages={chat.messages}
            connected={chat.connected}
            onSend={chat.send}
            onBack={() => setView("akte")}
          />
        </main>
      );
    }

    if (view === "team") {
      return (
        <main className="app-shell">
          <TeamRoles
            me={me}
            team={team}
            error={teamError}
            onAssign={(playerId, role) => changeRole(playerId, role)}
            onRefresh={refreshTeam}
            onBack={() => setView("akte")}
          />
        </main>
      );
    }

    const myRole = team?.players.find((p) => p.id === me.id)?.role ?? null;

    if (view === "anklage") {
      return (
        <main className="app-shell">
          <AccusationPanel
            draft={accusation}
            suspects={caseData.suspects}
            evidence={collected}
            onAttach={(id) =>
              setProgress((prev) => ({ ...prev, accusation: attachEvidence(prev.accusation, id) }))
            }
            onDetach={(id) =>
              setProgress((prev) => ({ ...prev, accusation: detachEvidence(prev.accusation, id) }))
            }
            onChooseSuspect={() => setView("verdaechtige")}
            onSubmit={async () => {
              if (!accusation.suspectId) return "Waehle zuerst einen Taeter.";
              try {
                const result = await submitAccusation(code, {
                  suspectId: accusation.suspectId,
                  evidenceIds: accusation.evidenceIds,
                });
                if (!result.ok && result.reason === "invalid") return result.message;
                // Auch "schon abgesendet" sperrt: dann hat jemand im Team zuerst
                // abgesendet, und dessen Anklage gilt (#27).
                const { receipt } = result;
                setProgress((prev) => ({
                  ...prev,
                  accusation: {
                    suspectId: receipt.suspectId,
                    evidenceIds: receipt.evidenceIds,
                    receipt,
                  },
                }));
                return null;
              } catch {
                return "Server nicht erreichbar. Bitte erneut versuchen.";
              }
            }}
            onBack={() => setView("akte")}
          />
        </main>
      );
    }

    if (view === "briefing") {
      return (
        <main className="app-shell">
          <CaseBriefingPanel
            title={caseData.title}
            briefing={caseData.briefing}
            objective={caseData.objective}
            onOpenScene={() => setView(scene ? "tatort" : "akte")}
            onClose={() => setView("akte")}
          />
        </main>
      );
    }

    return (
      <main className="app-shell">
        <p className="terminal-title">
          Fallakte geoeffnet
          {myRole && <span className="role-badge">{ROLE_LABEL[myRole]}</span>}
        </p>
        <div className="panel case-status">
          <h1 className="case-title">{caseData.title}</h1>
          <p className="case-status__hint">
            {caseData.suspects.length} Verdaechtige &middot;{" "}
            {caseData.seedEvidence.length} erste Spuren
          </p>
          <p className="case-status__hint">
            Team-Code zum Teilen: <strong className="case-code">{code}</strong>
          </p>
          <p className="case-status__hint">
            {account ? (
              <>
                Ermittelt als <strong>{account.name}</strong>
              </>
            ) : (
              "Ermittelt als Gast — Fortschritt nur auf diesem Geraet"
            )}
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
            {devices.length > 0 && (
              <button onClick={() => setView("forensik")}>
                Forensik-Terminal ({devices.length})
              </button>
            )}
            <button onClick={() => setView("anklage")}>
              Anklage ({accusation.evidenceIds.length}{" "}
              {accusation.evidenceIds.length === 1 ? "Beweis" : "Beweise"})
            </button>
            <button onClick={() => setView("team")}>
              {myRole ? `Team · ${ROLE_LABEL[myRole]}` : "Team · Rolle waehlen"}
            </button>
            <button onClick={() => setView("chat")}>
              Team-Chat{chatUnread > 0 ? ` (${chatUnread} neu)` : ""}
            </button>
            <button onClick={() => setView("aufgaben")}>Aufgaben ({openTaskCount} offen)</button>
            <button onClick={() => setView("briefing")}>Briefing</button>
          </div>
        </div>
      </main>
    );
  }
}
