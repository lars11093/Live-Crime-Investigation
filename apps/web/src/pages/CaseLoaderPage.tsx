import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Difficulty, PublicCase } from "@case-zero/shared";
import { DIFFICULTY_INFO } from "../lib/difficulty";
import { saveTeam } from "../lib/savedTeam";
import {
  combineEvidence,
  createRoom,
  fetchAccountProgress,
  fetchCase,
  findRoom,
  recoverDeleted,
  saveAccountProgress,
  submitAccusation,
  unlockDevice,
} from "../lib/api";
import { loadUnlocked, saveUnlocked, withUnlocked } from "../lib/unlockedDevices";
import { loadRecovered, saveRecovered, withRecovered } from "../lib/recoveredMessages";
import { RecoverDeleted } from "../components/RecoverDeleted";
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
import { StatementTimeline } from "../components/StatementTimeline";
import { SuspectCompare } from "../components/SuspectCompare";
import { StatementSearch } from "../components/StatementSearch";
import { ChatHistory } from "../components/ChatHistory";
import { ForensicsTerminal } from "../components/ForensicsTerminal";
import { DeviceFiles } from "../components/DeviceFiles";
import { TeamPanel } from "../components/TeamPanel";
import { TeamRoles } from "../components/TeamRoles";
import { ROLE_LABEL } from "../lib/roles";
import { ObjectiveDock } from "../components/ObjectiveDock";
import { shareMessage, useTeam } from "../lib/team";
import { SharedFindings } from "../components/SharedFindings";
import { ShareNoteButton, SharedNotesList } from "../components/SharedNotes";
import { ProgressPanel } from "../components/ProgressPanel";
import { HintPanel } from "../components/HintPanel";
import { summarizeProgress } from "../lib/progress";
import { SystemLogView } from "../components/SystemLogView";
import { messageToEvidence } from "../lib/digitalTrace";
import { markReviewed } from "../lib/forensics";
import { AccusationPanel } from "../components/AccusationPanel";
import { attachEvidence, chooseSuspect, detachEvidence } from "../lib/accusation";
import { loadAccount } from "../lib/account";
import { introSeen, markIntroSeen } from "../lib/intro";
import { CaseIntro } from "../components/CaseIntro";
import { loadBoard, recordInsight, saveBoard, toggleOwnThread } from "../lib/board";
import { InvestigationBoard } from "../components/InvestigationBoard";
import {
  askQuestion,
  closedQuestionIds,
  loadInterrogations,
  openQuestions,
  saveInterrogations,
  transcript,
} from "../lib/interrogation";
import { InterrogationPanel } from "../components/InterrogationPanel";
import { DeviceLocations } from "../components/DeviceLocations";
import { buildForensicReport, forensicReportMarkdown } from "../lib/forensicReport";
import { ForensicReportPanel } from "../components/ForensicReportPanel";
import { downloadText, exportAkte, exportFileName } from "../lib/akteExport";
import { appendSceneLog, loadSceneLog, saveSceneLog } from "../lib/sceneLog";
import { SceneLogPanel } from "../components/SceneLogPanel";
import { addTag, allTags, filterByTag, loadTags, removeTag, saveTags } from "../lib/evidenceTags";
import { EvidenceTagEditor } from "../components/EvidenceTagEditor";
import { EvidenceTagFilter } from "../components/EvidenceTagFilter";
import { loadExcluded, saveExcluded, toggleExcluded } from "../lib/excludedSuspects";
import { TeamChat } from "../components/TeamChat";
import { useTeamChat } from "../lib/useTeamChat";
import { unreadCount } from "../lib/teamChat";
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
  | "chat";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "invalidCode" }
  | { status: "ready"; caseData: PublicCase; difficulty: Difficulty };

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
  // Ermittlungstafel (#65): Faeden zwischen Beweisen.
  const [board, setBoard] = useState(() => loadBoard(browserStorage(), code));
  // Eigene Tags (#62) und welcher davon die Akte gerade filtert.
  const [tags, setTags] = useState(() => loadTags(browserStorage(), code));
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  // Welcher Verdaechtige im Profil offen ist (#15).
  const [openSuspectId, setOpenSuspectId] = useState<string | null>(null);
  // Befragungen (#66): welche Fragen an wen gestellt wurden.
  const [interrogations, setInterrogations] = useState(() => loadInterrogations(browserStorage(), code));
  // Ausgeschlossene Verdaechtige (#69), pro Team-Code im Browser.
  const [excludedIds, setExcludedIds] = useState(() => loadExcluded(browserStorage(), code));
  // Welches Geraet im Forensik-Terminal ausgewertet wird (#18 -> #19).
  const [openDeviceId, setOpenDeviceId] = useState<string | null>(null);
  // Am offenen Geraet: Nachrichten (#19) oder Dateien (#20).
  const [deviceTab, setDeviceTab] = useState<"chat" | "dateien">("chat");
  // Intro (#58): einmal pro Team-Session vor dem ersten Briefing.
  const [showIntro, setShowIntro] = useState(() => !introSeen(browserStorage(), code));
  // Wiederhergestellte, geloeschte Nachrichten pro Geraet (#71).
  const [recovered, setRecovered] = useState(() => loadRecovered(browserStorage(), code));
  // Tatortprotokoll (#61): was wann wo untersucht und eingesammelt wurde.
  const [sceneLog, setSceneLog] = useState(() => loadSceneLog(browserStorage(), code));
  // Entsperrte Geraete (#70) — so, wie der Server sie nach der richtigen PIN liefert.
  const [unlocked, setUnlocked] = useState(() => loadUnlocked(browserStorage(), code));
  // Welcher Tatort offen ist (#159); null = der erste des Falls.
  const [sceneId, setSceneId] = useState<string | null>(null);
  const navigate = useNavigate();
  // Wer sonst noch in dieser Session ermittelt (#22).
  const team = useTeam(code);
  // Absage des Servers auf die letzte Rollenwahl (#31).
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    saveProgress(browserStorage(), code, progress, account?.id);
  }, [code, progress, account]);

  // Story #55 — mit Konto liegt der Stand zusaetzlich auf dem Server. Beim
  // Oeffnen gewinnt der Server-Stand (anderes Geraet), danach wird jede
  // Aenderung kurz gesammelt und hochgeladen.
  const [remoteLoaded, setRemoteLoaded] = useState(!account?.token);
  useEffect(() => {
    if (!account?.token) return;
    let cancelled = false;
    fetchAccountProgress(account.token, code)
      .then((raw) => {
        if (cancelled || !raw) return;
        setProgress(loadProgress({ getItem: () => raw, setItem: () => {} }, code, account.id));
      })
      .catch(() => {
        // Server-Konto nicht erreichbar: lokal weiterspielen.
      })
      .finally(() => !cancelled && setRemoteLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [account, code]);

  useEffect(() => {
    if (!account?.token || !remoteLoaded) return;
    const timer = setTimeout(() => {
      saveAccountProgress(account.token!, code, JSON.stringify(progress)).catch(() => {
        // Beim naechsten Speichern erneut versuchen.
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [account, code, progress, remoteLoaded]);
  useEffect(() => {
    saveBoard(browserStorage(), code, board);
  }, [code, board]);
  // Team merken (#57), sobald man mit Namen beigetreten ist.
  useEffect(() => {
    if (team.name) saveTeam(browserStorage(), { code, name: team.name });
  }, [code, team.name]);

  // Das Team zieht in einen neuen Fall um (#57): mitgehen, mit demselben Namen.
  // Neu laden statt nur navigieren, damit der Fortschritt zum neuen Code passt.
  useEffect(() => {
    if (team.movedTo) window.location.assign(`/fall/${team.movedTo.code}`);
  }, [team.movedTo]);
  useEffect(() => {
    saveInterrogations(browserStorage(), code, interrogations);
  }, [code, interrogations]);

  useEffect(() => {
    saveRecovered(browserStorage(), code, recovered);
  }, [code, recovered]);

  useEffect(() => {
    saveSceneLog(browserStorage(), code, sceneLog);
  }, [code, sceneLog]);

  useEffect(() => {
    saveTags(browserStorage(), code, tags);
  }, [code, tags]);

  useEffect(() => {
    saveExcluded(browserStorage(), code, excludedIds);
  }, [code, excludedIds]);

  useEffect(() => {
    saveUnlocked(browserStorage(), code, unlocked);
  }, [code, unlocked]);

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
          if (!cancelled) setState({ status: "ready", caseData, difficulty: room.difficulty ?? "normal" });
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

  // Team-Chat (#49): verbunden, sobald die Seite offen ist — so zaehlen auch
  // Nachrichten, die ankommen, waehrend man im Tatort ist.
  const chat = useTeamChat(code);
  const [chatReadCount, setChatReadCount] = useState(0);
  useEffect(() => {
    if (view === "chat") setChatReadCount(chat.messages.length);
  }, [view, chat.messages.length]);
  const chatUnread = unreadCount(chat.messages, team.myId ?? "", chatReadCount);

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

  if (showIntro && state.caseData.intro && view === "briefing") {
    return (
      <CaseIntro
        title={state.caseData.title}
        intro={state.caseData.intro}
        onDone={() => {
          markIntroSeen(browserStorage(), code);
          setShowIntro(false);
        }}
      />
    );
  }

  // Das Ermittlungsziel haengt an jeder Ansicht des geladenen Falls (#32).
  // Nicht ueber dem Intro (#58), das bildschirmfuellend laeuft.
  return (
    <>
      {renderView(state.caseData, state.difficulty)}
      <ObjectiveDock objective={state.caseData.objective} />
    </>
  );

  function renderView(caseData: PublicCase, difficulty: Difficulty) {
    const scenes = caseData.scenes;
    const scene = scenes.find((s) => s.id === sceneId) ?? scenes.at(0);

    function openScene(id: string) {
      setSceneId(id);
      setView("tatort");
    }

    if (view === "tatort" && scene) {
      return (
        <SceneView
          // Neuer Tatort = frischer Zustand (offener Dialog, Bild-/Modellfehler).
          key={scene.id}
          scene={scene}
          scenes={scenes}
          onSwitchScene={setSceneId}
          investigatedIds={investigatedIds}
          onInvestigate={(id) => {
            setProgress((prev) =>
              prev.investigatedIds.includes(id)
                ? prev
                : { ...prev, investigatedIds: [...prev.investigatedIds, id] }
            );
            const hotspot = scene.hotspots.find((h) => h.id === id);
            if (hotspot) {
              setSceneLog((prev) =>
                appendSceneLog(prev, {
                  at: new Date().toISOString(),
                  action: "untersucht",
                  sceneName: scene.name,
                  hotspotLabel: hotspot.label,
                })
              );
            }
          }}
          onToggleInvestigated={(id) =>
            setProgress((prev) => ({
              ...prev,
              investigatedIds: toggleInvestigated(prev.investigatedIds, id),
            }))
          }
          collectedIds={collected.map((e) => e.id)}
          onCollect={(evidence) => {
            setProgress((prev) => ({ ...prev, collected: collectEvidence(prev.collected, evidence) }));
            setSceneLog((prev) =>
              appendSceneLog(prev, {
                at: new Date().toISOString(),
                action: "eingesammelt",
                sceneName: evidence.foundAt.sceneName,
                hotspotLabel: evidence.foundAt.hotspotLabel,
                evidenceLabel: evidence.label,
              })
            );
          }}
          photographedIds={Object.keys(progress.photos)}
          onPhoto={(photo) =>
            setProgress((prev) => ({ ...prev, photos: storePhoto(prev.photos, photo) }))
          }
          onBack={() => setView("akte")}
          difficulty={difficulty}
        />
      );
    }

    const devices = withUnlocked(caseData.devices ?? [], unlocked).map((d) => withRecovered(d, recovered));

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
              onOpen={(id) => {
                setDeviceTab("chat");
                setOpenDeviceId(id);
                // Oeffnen heisst auswerten (#44) — gesperrte lassen sich gar nicht oeffnen.
                setProgress((prev) => ({
                  ...prev,
                  reviewedDeviceIds: markReviewed(prev.reviewedDeviceIds, id),
                }));
              }}
              onUnlock={async (deviceId, secret) => {
                try {
                  const result = await unlockDevice(caseData.id, deviceId, secret);
                  if (result.ok) {
                    setUnlocked((prev) => ({ ...prev, [deviceId]: result.device }));
                    return null;
                  }
                  return result.reason === "wrong-secret"
                    ? "PIN bzw. Passwort falsch. Das Geraet bleibt gesperrt."
                    : "Dieses Geraet laesst sich nicht entsperren.";
                } catch {
                  return "Server nicht erreichbar. Bitte erneut versuchen.";
                }
              }}
              onBack={() => setView("akte")}
            />
            <div style={{ marginTop: "1rem" }}>
              <ForensicReportPanel
                report={buildForensicReport(devices, collected, markedMessageIds)}
                onDownload={() => {
                  const report = buildForensicReport(devices, collected, markedMessageIds);
                  const text = forensicReportMarkdown(report, caseData.title, notes);
                  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `forensik-report-${code}.md`;
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 0);
                }}
              />
            </div>
          </main>
        );
      }
      if (deviceTab === "dateien") {
        return (
          <main className="app-shell">
            <DeviceFiles
              device={device}
              onShowMessages={() => setDeviceTab("chat")}
              onBack={() => setOpenDeviceId(null)}
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
            onShowFiles={device.files?.length ? () => setDeviceTab("dateien") : undefined}
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
          <div style={{ marginTop: "1rem" }}>
            <RecoverDeleted
              deletedCount={device.deletedCount ?? 0}
              onRecover={async () => {
                try {
                  const result = await recoverDeleted(caseData.id, device.id);
                  if (!result.ok) return "Auf diesem Geraet laesst sich nichts wiederherstellen.";
                  setRecovered((prev) => ({ ...prev, [device.id]: result.messages }));
                  return null;
                } catch {
                  return "Server nicht erreichbar. Bitte erneut versuchen.";
                }
              }}
            />
          </div>
          {/* #72 — Standortverlauf desselben Geraets, gegen die Tatzeit gelesen. */}
          <div style={{ marginTop: "1rem" }}>
            <DeviceLocations device={device} timeOfCrime={caseData.briefing?.timeOfCrime} />
          </div>
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
          ) : null}
          {openSuspect && (
            <div style={{ marginTop: "1rem" }}>
              <InterrogationPanel
                key={openSuspect.id}
                suspect={openSuspect}
                asked={transcript(interrogations, openSuspect)}
                open={openQuestions(interrogations, openSuspect)}
                closedCount={closedQuestionIds(interrogations, openSuspect).size}
                onAsk={(questionId) =>
                  setInterrogations((prev) => askQuestion(prev, openSuspect, questionId))
                }
              />
            </div>
          )}
          {!openSuspect && (
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
                excludedIds={excludedIds}
                onToggleExcluded={(id) => setExcludedIds((prev) => toggleExcluded(prev, id))}
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
              <div style={{ marginTop: "1rem" }}>
                <StatementTimeline suspects={caseData.suspects} onOpen={setOpenSuspectId} />
              </div>
            </>
          )}
        </main>
      );
    }

    if (view === "beweise") {
      const open = collected.find((e) => e.id === openEvidenceId);
      // Ein Filter auf einen inzwischen geloeschten Tag zeigt wieder alles (#62).
      const activeTag = tagFilter && allTags(tags).includes(tagFilter) ? tagFilter : null;
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
              share={{
                sharedBy: team.findings.find((f) => f.evidence.id === open.id)?.sharedBy ?? null,
                joined: team.name !== "",
                onShare: async () => shareMessage(await team.share(open)),
              }}
              onBack={() => setOpenEvidenceId(null)}
            />
          ) : null}
          {open && (
            <>
            <ShareNoteButton
              evidence={open}
              note={notes[open.id] ?? ""}
              joined={team.name !== ""}
              onShare={async () => {
                try {
                  const result = await team.shareNote(open, notes[open.id] ?? "");
                  if (result.ok) return "Notiz geteilt. Das ganze Team sieht sie jetzt.";
                  if (result.reason === "not-in-team") return "Tritt zuerst dem Team bei.";
                  return "Diese Notiz lässt sich nicht teilen.";
                } catch {
                  return "Server nicht erreichbar. Bitte erneut versuchen.";
                }
              }}
            />
            <div style={{ marginTop: "1rem" }}>
              <EvidenceTagEditor
                tags={tags[open.id] ?? []}
                suggestions={allTags(tags)}
                onAdd={(tag) => setTags((prev) => addTag(prev, open.id, tag))}
                onRemove={(tag) => setTags((prev) => removeTag(prev, open.id, tag))}
              />
            </div>
            </>
          )}
          {!open && (
            <>
              <EvidenceTagFilter
                tags={allTags(tags)}
                active={activeTag}
                onChange={setTagFilter}
              />
              <EvidenceList
                evidence={filterByTag(collected, tags, activeTag)}
                notes={notes}
                tags={tags}
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
                        // Fuer die Tafel (#65): aus welchem Paar die Erkenntnis entstand.
                        setBoard((prev) => recordInsight(prev, result.insight.id, a, b));
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
              <div style={{ marginTop: "1rem" }}>
                <SharedFindings findings={team.findings} myId={team.myId} />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <InvestigationBoard
                  evidence={collected}
                  insights={insights}
                  board={board}
                  onToggleThread={(a, b) => setBoard((prev) => toggleOwnThread(prev, a, b))}
                />
                <SharedNotesList notes={team.notes} myId={team.myId} />
              </div>
            </>
          )}
        </main>
      );
    }

    if (view === "chat") {
      return (
        <main className="app-shell">
          <TeamChat
            myId={team.myId}
            joined={team.name !== ""}
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
            myId={team.myId}
            players={team.players}
            leaderId={team.leaderId}
            joined={team.name !== ""}
            error={roleError ?? team.error}
            onAssign={async (playerId, role) => {
              try {
                const result = await team.chooseRole(role, playerId === team.myId ? undefined : playerId);
                setRoleError(result.ok ? null : result.error);
              } catch {
                setRoleError("Server nicht erreichbar. Bitte erneut versuchen.");
              }
            }}
            onBack={() => setView("akte")}
          />
        </main>
      );
    }

    const myRole = team.players.find((p) => p.id === team.myId)?.role ?? null;

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
          {myRole && <span className="role-badge" style={{ marginLeft: "0.75rem" }}>{ROLE_LABEL[myRole]}</span>}
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
            Schwierigkeit: <strong>{DIFFICULTY_INFO[difficulty].label}</strong>
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
          <p className="case-status__hint">
            {collected.length} {collected.length === 1 ? "Beweis" : "Beweise"} gesichert
          </p>
          <div className="case-status__actions">
            {scenes.length === 1 && (
              <button className="button--primary" onClick={() => openScene(scenes[0].id)}>
                Zum Tatort
              </button>
            )}
            {scenes.length > 1 &&
              scenes.map((s) => (
                <button key={s.id} className="button--primary" onClick={() => openScene(s.id)}>
                  Tatort: {s.name}
                </button>
              ))}
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
            <button onClick={() => setView("briefing")}>Briefing</button>
            {caseData.intro && (
              <button
                onClick={() => {
                  setShowIntro(true);
                  setView("briefing");
                }}
              >
                Intro ansehen
              </button>
            )}
            {/* #63 — die eigene Akte als Markdown-Datei mitnehmen. */}
            <button
              onClick={() =>
                downloadText(exportFileName(caseData.title, code), exportAkte(caseData, progress, code))
              }
            >
              Akte exportieren
            </button>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <ProgressPanel
            summary={summarizeProgress(
              // Alle Tatorte, die die Fallakte anbietet (#159).
              scenes,
              [...collected.map((e) => e.id), ...team.findings.map((f) => f.evidence.id)],
              investigatedIds
            )}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <HintPanel code={code} />
          <SceneLogPanel log={sceneLog} />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <TeamPanel
            name={team.name}
            players={team.players}
            myId={team.myId}
            error={team.error}
            onJoin={team.joinAs}
          />
          {team.name && (
            <div className="case-status__actions" style={{ marginTop: "0.75rem" }}>
              {/* #57 — neuer Fall, gleiches Team: niemand muss neu beitreten. */}
              <button
                onClick={async () => {
                  try {
                    const room = await createRoom(caseData.id);
                    const result = await team.moveTo(room.code);
                    if (!result.ok) window.alert(result.error);
                  } catch {
                    window.alert("Server nicht erreichbar. Bitte erneut versuchen.");
                  }
                }}
              >
                Neuer Fall mit diesem Team
              </button>
            </div>
          )}
        </div>
      </main>
    );
}
}
