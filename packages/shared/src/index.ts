// Shared domain types for CASE//ZERO — imported by both apps/server and apps/web.
// Keep this the single source of truth for the room/case/socket contract.

export type Role = "forensics" | "cyber" | "interrogation" | "field" | "lead";

/** Schwierigkeitsstufe einer Team-Session (#56). */
export type Difficulty = "leicht" | "normal" | "schwer";

export const DIFFICULTIES: Difficulty[] = ["leicht", "normal", "schwer"];

export const ROLES: Role[] = ["forensics", "cyber", "interrogation", "field", "lead"];

export interface Player {
  id: string;
  name: string;
  role: Role | null;
}

export interface EvidenceNode {
  id: string;
  label: string;
  kind: "person" | "object" | "location" | "message" | "fact";
  x: number;
  y: number;
}

export interface EvidenceEdge {
  id: string;
  fromId: string;
  toId: string;
  correct: boolean;
}

export interface TimedEvent {
  atSeconds: number;
  type: "NEW_EVIDENCE" | "STATEMENT_CHANGED" | "SERVER_BREACH" | "CUSTOM";
  title: string;
  body: string;
  visibleTo: Role[];
}

export interface Scenario {
  id: string;
  suspectId: string;
  motive: string;
  weapon: string;
  timeOfCrime: string;
  requiredEdgeIds: string[];
  /**
   * Beweise, die diese Lösung tragen (#28). Angehängte Beweise ausserhalb
   * dieser Liste gelten in der Auflösung als "trägt nichts bei".
   */
  keyEvidenceIds: string[];
  /** Was tatsächlich passiert ist — erscheint erst nach der Anklage (#28). */
  resolution: string;
  /** Alternative Enden (#80), je nach Anklage — siehe `CaseEnding.when`. */
  endings?: CaseEnding[];
}

/** Ein Ende des Falls (#80). */
export interface CaseEnding {
  /**
   * Wann es eintritt: `solved` (richtig und begründet), `insufficient`
   * (richtige Person, Beweise reichen nicht) oder eine Verdächtigen-ID —
   * das Ende, wenn diese Person zu Unrecht angeklagt wird.
   */
  when: string;
  title: string;
  text: string;
}

export interface Suspect {
  id: string;
  name: string;
  /** Alter in Jahren (Story #15). */
  age: number;
  /** Beziehung zum Opfer, z. B. "Vorgesetzte" (Story #15). */
  relationToVictim: string;
  /**
   * Das öffentlich bekannte Motiv (Story #15) — NICHT das Motiv aus
   * `Scenario`. Jenes ist die Lösung und verlässt den Server nie.
   * Hier steht, was die Ermittlung über diese Person weiss; das haben
   * bewusst mehrere Verdächtige, sonst wäre der Fall trivial.
   * Optional, weil die Story "sofern bekannt" sagt.
   */
  knownMotive?: string;
  /** Aussage zur Tatnacht (Story #16). */
  statement?: string;
  /** Porträt. Wie überall: kein Asset im Repo, Platzhalter im Client. */
  imagePath?: string;
  /** Fragen für die Befragung (#66), in der Reihenfolge, in der sie angeboten werden. */
  interrogation?: InterrogationQuestion[];
}

/**
 * Eine Frage in der Befragung (#66).
 *
 * Inhalt, keine Lösung: Die Antworten passen zu jedem Szenario, deshalb
 * dürfen sie an den Client. Ob eine Antwort lügt, zeigt erst der Abgleich
 * mit den Spuren.
 */
export interface InterrogationQuestion {
  id: string;
  question: string;
  answer: string;
  /** Erst wählbar, nachdem diese Frage gestellt wurde (#67). */
  after?: string;
  /** Wer diese Frage stellt, verwirft diese Alternativen (#67) — eine Entscheidung. */
  closes?: string[];
}

/**
 * Eine Nachricht im Chatverlauf eines Geräts (Story #19).
 *
 * Die ID ist pro Fall eindeutig, nicht nur pro Gerät: daran hängt die
 * Markierung im Fortschritt des Ermittlers.
 */
export interface ChatMessage {
  id: string;
  /** Anzeigename des Absenders, z. B. "Monica Brandt". */
  sender: string;
  /** Zeitpunkt, wie er auf dem Gerät steht — z. B. "12.09. 20:31". */
  sentAt: string;
  text: string;
  /** Gelöscht und per Forensik wiederhergestellt (#71). */
  recovered?: boolean;
  /** Mitgeschicktes Bild (#45). Nur die Metadaten, kein Bild-Asset. */
  attachment?: ChatAttachment;
}

/**
 * EXIF-artige Metadaten eines Bildes (Story #45).
 *
 * `takenAt` ist wie `sentAt` ein Anzeigetext. Der Unterschied zwischen
 * Aufnahme und Versand ist oft genau der Hinweis.
 */
export interface ImageMetadata {
  takenAt: string;
  /** Kamera bzw. Gerätemodell, z. B. "Google Pixel 7". */
  camera?: string;
  gps?: { lat: number; lng: number; place?: string };
  /** GPS war ausgeschaltet — anders als "keine Angabe". */
  gpsDisabled?: boolean;
  resolution?: string;
  software?: string;
}

/** Ein Eintrag im Systemprotokoll eines Geräts (#46). */
export interface SystemLogEntry {
  /** Zeitpunkt wie auf dem Gerät, z. B. "12.09. 22:31". */
  at: string;
  category: "unlock" | "app" | "network" | "call" | "power";
  event: string;
}

/** Ein Bildanhang an einer Chatnachricht (#45). */
export interface ChatAttachment {
  fileName: string;
  metadata: ImageMetadata;
}

/**
 * Eine Datei auf einem Gerät (Story #20).
 *
 * `type` sagt, wie der Client sie öffnet:
 *   - "text":       `content` wird als Text gezeigt
 *   - "image":      `imagePath` als Bild, mit Platzhalter wie überall (kein Asset im Repo)
 *   - "unreadable": verschlüsselt oder beschädigt — der Client zeigt `unreadableReason`
 */
export interface DeviceFile {
  id: string;
  /** Dateiname inkl. Endung, z. B. "notizen.txt". */
  name: string;
  type: "text" | "image" | "unreadable";
  /** Zuletzt geändert, als Anzeigetext — wie `ChatMessage.sentAt`. */
  modifiedAt: string;
  content?: string;
  imagePath?: string;
  /** Was auf dem Bild zu sehen ist. Steht unter dem Platzhalter, solange es kein Asset gibt. */
  caption?: string;
  /** Warum die Datei nicht lesbar ist, z. B. "Verschlüsselt". */
  unreadableReason?: string;
}

/**
 * Ein sichergestelltes Gerät (Story #19).
 *
 * Die Nachrichten stehen in der Reihenfolge im Case-JSON, in der sie
 * angezeigt werden — chronologisch, die älteste zuerst. Der Client
 * sortiert nicht um, weil `sentAt` ein Anzeigetext ist und kein Datum.
 *
 * Story #18 — im Forensik-Terminal werden alle Geräte aufgelistet. Ein
 * gesperrtes Gerät (`locked`) ist dort sichtbar, aber nicht auswertbar; der
 * Server schickt seine Nachrichten gar nicht erst an den Client.
 */
export interface Device {
  id: string;
  /** z. B. "Smartphone Thomas Vogt". */
  label: string;
  /** Wem das Gerät gehört. Gleich geschrieben wie `ChatMessage.sender`, damit eigene Nachrichten erkennbar sind. */
  owner: string;
  /** Gesperrt, bis es entsperrt wird (#18). Fehlt das Feld, ist das Gerät offen. */
  locked?: boolean;
  /** Art der Sperre, wie sie im Terminal steht — z. B. "PIN, 4 Ziffern" (#18). */
  lockType?: string;
  /** Geräteart für die Übersicht (#44). Fehlt sie, steht "Gerät". */
  kind?: "smartphone" | "laptop" | "tablet" | "storage";
  /** Wo das Gerät sichergestellt wurde (#44), z. B. "Schreibtisch, Büro 4.12". */
  seizedAt?: string;
  /**
   * Hinweis zur Sperre, sichtbar im Terminal (#70) — z. B. woher die PIN
   * kommen könnte. Verrät die PIN nicht selbst.
   */
  lockHint?: string;
  /**
   * PIN oder Passwort (#70). Bleibt auf dem Server: `toPublicCase` entfernt
   * das Feld, geprüft wird nur in `engine/unlock.ts`.
   */
  unlockSecret?: string;
  /**
   * Systemprotokoll (#46), chronologisch wie die Nachrichten. Bei gesperrten
   * Geräten entfernt der Server es wie die Nachrichten.
   */
  systemLog?: SystemLogEntry[];
  messages: ChatMessage[];
  /** Dateien auf dem Gerät (#20). Optional: nicht jedes Gerät hat welche. */
  files?: DeviceFile[];
  /**
   * Gelöschte Nachrichten (#71). Bleiben auf dem Server, bis sie per
   * `POST .../recover` wiederhergestellt werden; der Client sieht vorher nur
   * `deletedCount`.
   */
  deletedMessages?: ChatMessage[];
  /** Wie viele gelöschte Nachrichten sich wiederherstellen lassen (#71). Setzt nur der Server. */
  deletedCount?: number;
  /** Standortverlauf (#72), chronologisch wie im Case-JSON. Bei gesperrten Geräten leer. */
  locations?: DeviceLocation[];
}

/** Ein Standortpunkt eines Geräts (#72). */
export interface DeviceLocation {
  /** Zeitpunkt als Anzeigetext, wie `ChatMessage.sentAt` — z. B. "12.09. 22:31". */
  at: string;
  /** Ort in Worten, z. B. "Büro 4.12, Hardturmstrasse 61". */
  place: string;
  /** Woher der Punkt stammt, z. B. "WLAN CORP-4OG" oder "GPS". */
  source?: string;
}

/**
 * Ein Tatort als Szene (Story #7).
 *
 * `imagePath` ist ein Pfad, kein Asset: echte Bilder werden bewusst nicht
 * committet (Copyright/Repo-Grösse). Lädt das Bild nicht — und in der
 * MVP-Phase tut es das nie — zeigt der Client einen Platzhalter mit dem
 * Szenennamen.
 */
/**
 * Eine anklickbare Stelle im Tatort (Story #8).
 *
 * Position in Prozent der Szene, nicht in Pixeln: die Szene skaliert mit dem
 * Viewport, ein Pixelwert sässe bei 1920 woanders als bei 1280.
 */
export interface Hotspot {
  id: string;
  /** Kurzer Name, erscheint beim Überfahren und in der Detailansicht. */
  label: string;
  /** 0-100, gemessen von links bzw. oben. */
  x: number;
  y: number;
  /** Was der Ermittler sieht, wenn er die Stelle untersucht. */
  detail: string;
  /**
   * Der Beweis, der hier eingesammelt werden kann (Story #9).
   *
   * Optional: nicht jede Stelle gibt etwas her. Fehlt das Feld, lässt sich
   * die Stelle untersuchen, aber nichts mitnehmen.
   */
  evidence?: CollectableEvidence;
  /**
   * Nur mit diesem Werkzeug sichtbar (#60), z. B. "uv" für Spuren, die erst
   * unter der UV-Lampe auftauchen. Ohne Feld ist die Stelle immer sichtbar.
   */
  requiresTool?: SceneTool;
}

/** Werkzeuge im Tatort (#60). */
export type SceneTool = "uv";

/** Ein einsammelbarer Fund aus dem Tatort (Story #9). */
export interface CollectableEvidence {
  id: string;
  label: string;
  kind: EvidenceNode["kind"];
  /** Beschreibung in der Beweisakte — ausführlicher als das Label. */
  description: string;
  /**
   * Asservatenfoto (Story #11). Optional und ohne Asset im Repo — wie bei
   * den Szenen zeigt der Client einen Platzhalter, wenn nichts lädt.
   */
  imagePath?: string;
}

/**
 * Ein Fund, wie er in der Beweisakte liegt (Story #11).
 *
 * Der Fundort wird beim Einsammeln festgehalten, nicht im Fall hinterlegt:
 * derselbe Beweis könnte später an mehreren Stellen auftauchen, und die
 * Akte soll zeigen, wo *dieser* Ermittler ihn gesichert hat.
 */
export interface CollectedEvidence extends CollectableEvidence {
  foundAt: {
    sceneName: string;
    hotspotLabel: string;
  };
  /**
   * ISO-Zeitpunkt der Sicherung (#37). Optional, weil Funde aus der Zeit vor
   * #37 keinen haben.
   */
  collectedAt?: string;
  /**
   * Woher der Fund stammt (#47): aus einem Tatort oder von einem Gerät.
   * Optional, weil ältere Spielstände das Feld nicht haben.
   */
  source?: "scene" | "device";
}

/**
 * Ein Fund, den jemand mit dem Team geteilt hat (Story #23).
 *
 * Liegt auf dem Server im Raum, nicht im localStorage: geteilt heisst, alle
 * sehen denselben Stand — auch wer später beitritt.
 */
export interface SharedFinding {
  evidence: CollectedEvidence;
  /** Name der Person, die geteilt hat — so ist der Urheber erkennbar. */
  sharedBy: string;
  /** Verbindungs-ID beim Teilen, damit der Client "du" anzeigen kann. */
  sharedById: string;
}

/**
 * Ein Fund, den jemand im Team gerade eingesammelt hat (#75). Kommt ohne
 * Klick auf "Teilen" bei allen an — so sieht man, was parallel gefunden wird.
 */
export interface TeamDiscovery {
  evidence: CollectedEvidence;
  /** Wer ihn zuerst eingesammelt hat. */
  foundBy: string;
  foundById: string;
  /** ISO-Zeitpunkt, vom Server gesetzt. */
  foundAt: string;
}

/** Ein Eintrag im Aktivitätsprotokoll des Teams (#76). */
export interface ActivityEntry {
  id: string;
  /** ISO-Zeitpunkt, vom Server gesetzt. */
  at: string;
  /** Wer gehandelt hat — `null` für Ereignisse des ganzen Teams. */
  who: string | null;
  /** Was passiert ist, als Satzrest nach dem Namen, z. B. "hat «Tasse» gefunden". */
  text: string;
}

/** Eine mit dem Team geteilte Notiz zu einem Beweis (#64). */
export interface SharedNote {
  evidenceId: string;
  /** Name des Beweises, damit die Notiz auch ohne eigenen Fund lesbar ist. */
  evidenceLabel: string;
  text: string;
  sharedBy: string;
  sharedById: string;
  /** ISO-Zeitpunkt, gesetzt vom Server. */
  sharedAt: string;
}

/** Antwort auf `note:share` (#64). */
export type NoteShareResult =
  | { ok: true }
  | { ok: false; reason: "invalid-room" | "not-in-team" | "unknown-evidence" | "invalid-text" };

/** Antwort auf `evidence:share` (#23). */
export type ShareResult =
  | { ok: true }
  | { ok: false; reason: "invalid-room" | "not-in-team" | "unknown-evidence" | "already-shared" };

/** Antwort auf `POST /api/cases/:caseId/devices/:deviceId/recover` (#71). */
export type RecoverResult =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; reason: "unknown-device" | "locked" };
/** Antwort auf `POST /api/cases/:caseId/devices/:deviceId/unlock` (#70). */
export type UnlockResult =
  | { ok: true; device: Device }
  | { ok: false; reason: "wrong-secret" | "unknown-device" | "not-locked" };

export interface Scene {
  id: string;
  /** Anzeigename, dauerhaft als Overlay sichtbar. */
  name: string;
  imagePath: string;
  /**
   * 3D-Modell des Tatorts (GLB). Optional: ist es gesetzt, zeigt der Client
   * die Szene in 3D statt als Bild. Das Modell enthält pro Stelle ein Objekt
   * `hotspot_<id>`; Stellen ohne passendes Objekt bleiben nur in der Liste
   * erreichbar. Erzeugt wird es per Skript unter `tools/blender/`.
   */
  modelPath?: string;
  hotspots: Hotspot[];
}

/**
 * Das Briefing, das der Spieler vor dem Tatort liest (Story #6).
 *
 * Optional am Fall: fehlt es, zeigt der Client "Kein Briefing verfügbar"
 * statt einer leeren Box.
 */
/** Das Tatzeitfenster als Uhrzeiten (#42), z. B. 22:30 bis 22:50. */
export interface CrimeWindow {
  /** "HH:MM" */
  from: string;
  /** "HH:MM" */
  to: string;
}

export interface CaseBriefing {
  /** Tatzeit, wie sie im Briefing steht — z. B. "Freitag, 22:30 Uhr". */
  timeOfCrime: string;
  /**
   * Dieselbe Tatzeit maschinenlesbar, für die Alibi-Prüfung (#42).
   * Optional: ohne Fenster bietet das Profil keine Prüfung an.
   */
  crimeWindow?: CrimeWindow;
  /** Tatort in Worten — z. B. "Büro 4.12, Hardturmstrasse 61". */
  location: string;
  /** Fliesstext, mindestens drei Sätze. */
  text: string;
}

/**
 * Eine Verknüpfung zweier Beweise (Story #13).
 *
 * Liegt beim Fall, nicht beim Beweis: welche Paare etwas ergeben, ist Teil der
 * Lösung. Deshalb wird `combinations` — wie `scenarios` — serverseitig aus der
 * Client-Antwort entfernt (engine/caseView.ts). Käme die Liste an den Browser,
 * liesse sich der Fall aus der Netzwerk-Konsole lösen.
 */
export interface Combination {
  id: string;
  /** Genau zwei Beweis-IDs. Die Reihenfolge spielt keine Rolle. */
  evidenceIds: [string, string];
  /** Die Erkenntnis, die aus dem Paar entsteht. */
  insight: Insight;
}

/** Was beim Kombinieren herauskommt (Story #13). */
export interface Insight {
  id: string;
  title: string;
  body: string;
}

/** Antwort des Servers auf einen Kombinationsversuch (Story #13). */
export type CombineResult =
  | { ok: true; insight: Insight }
  | { ok: false; reason: "no-connection" | "already-found" | "invalid" };

/**
 * Das Intro eines Falls (#58).
 *
 * `videoPath` ist wie die Bildpfade nur ein Pfad: echte Videos werden nicht
 * committet (CLAUDE.md). Fehlt die Datei, spielt der Client die Textzeilen
 * als Titelsequenz ab — das ist in der MVP-Phase der Normalfall.
 */
export interface CaseIntro {
  videoPath?: string;
  /** Zeilen der Titelsequenz, in Reihenfolge. */
  lines: string[];
}

export interface CaseDefinition {
  id: string;
  title: string;
  /**
   * Was das Team herausfinden soll, in einem bis zwei Sätzen (#32). Jederzeit
   * im Spiel einsehbar — deshalb nichts darin, was die Lösung verrät.
   */
  objective?: string;
  intro?: CaseIntro;
  briefing?: CaseBriefing;
  scenes: Scene[];
  combinations: Combination[];
  suspects: Suspect[];
  /** Sichergestellte Geräte mit Chatverlauf (#19). Optional: nicht jeder Fall hat welche. */
  devices?: Device[];
  scenarios: Scenario[];
  seedEvidence: EvidenceNode[];
  timeline: TimedEvent[];
  /**
   * Hinweise für Sackgassen (#74), in der Reihenfolge, in der sie freigegeben
   * werden. Bleiben auf dem Server und gehen nur einzeln auf Anfrage raus.
   */
  hints?: string[];
}

/**
 * Der Fall, wie ihn der Client sehen darf.
 *
 * `scenarios` enthält die Lösung (Täter, Waffe, Tatzeit) und wird deshalb
 * serverseitig entfernt — siehe apps/server/src/engine/caseView.ts. Der Client
 * bekommt diesen Typ, nie CaseDefinition.
 */
export type PublicCase = Omit<CaseDefinition, "scenarios" | "combinations" | "hints">;

/** Stand der Hinweise einer Team-Session (#74). */
export interface HintState {
  /** Bereits freigegebene Hinweise, älteste zuerst. */
  revealed: string[];
  /** Wie viele Hinweise es insgesamt gibt. */
  total: number;
}

/**
 * Ein Eintrag in der Fallauswahl (Story #30) — nur, was man zum Wählen
 * braucht. Tatort und Tatzeit kommen aus dem Briefing, fehlen also, wenn der
 * Fall keins hat.
 */
export interface CaseSummary {
  id: string;
  title: string;
  location?: string;
  timeOfCrime?: string;
  suspectCount: number;
}

export interface Accusation {
  suspectId: string;
  motive: string;
  weapon: string;
  timeOfCrime: string;
  evidenceIds: string[];
}

/**
 * Was die Fallseite beim Absenden der Anklage schickt (Story #27).
 *
 * Bewusst schmaler als `Accusation`: Motiv, Waffe und Tatzeit fragt die
 * Oberfläche (noch) nicht ab — der Prototyp-Socket-Event `case:accuse`
 * bleibt davon unberührt.
 */
export type AccusationSubmission = Pick<Accusation, "suspectId" | "evidenceIds">;

/**
 * Die Quittung einer abgesendeten Anklage (Story #27).
 *
 * Pro Team-Session gibt es genau eine: danach ist die Anklage gesperrt.
 */
export interface AccusationReceipt extends AccusationSubmission {
  /** ISO-Zeitpunkt, zu dem der Server die Anklage angenommen hat. */
  submittedAt: string;
  /** Die Auflösung (#28), gleich mit der Quittung ausgeliefert. */
  verdict: AccusationVerdict;
}

/**
 * Ein einzelner Schluss in der Auflösung (Story #28): richtig oder falsch,
 * mit dem Satz, der dazu im UI steht.
 */
export interface VerdictFinding {
  /** Worum es geht: der Täter, ein angehängter Beweis oder ein übersehener. */
  topic: "suspect" | "evidence" | "missed";
  correct: boolean;
  text: string;
}

/**
 * Die Auflösung des Falls nach der Anklage (Story #28).
 *
 * Verlässt den Server erst, wenn die Anklage abgesendet ist — vorher wäre
 * sie die Lösung.
 */
export interface AccusationVerdict {
  solved: boolean;
  culprit: { id: string; name: string };
  /** Der Auflösungstext aus dem aktiven Szenario. */
  resolution: string;
  findings: VerdictFinding[];
  /**
   * Bewertung der Beweiskette (#78). Optional, weil Quittungen von vor #78
   * (im localStorage) sie nicht haben.
   */
  chain?: ChainRating;
  /** Welches Ende die Anklage ausgelöst hat (#80). Fehlt, wenn das Szenario keine Enden hat. */
  ending?: { kind: "solved" | "insufficient" | "wrong"; title: string; text: string };
  /**
   * Die Punktzahl (#54). Optional, weil Quittungen aus der Zeit vor #54 sie
   * nicht haben.
   */
  score?: AccusationScore;
}

/** Wie tragfähig die Begründung der Anklage war (#78). */
export interface ChainRating {
  level: "stark" | "mittel" | "schwach";
  /** Angehängte Beweise, die die Lösung tragen, und wie viele es gegeben hätte. */
  supporting: number;
  possible: number;
  /** Angehängte Beweise ohne Bezug zur Lösung. */
  irrelevant: number;
  /** Ein Satz zur Einordnung. */
  summary: string;
  /** Konkret, wo die Begründung schwach war — leer bei einer vollständigen Kette. */
  weaknesses: string[];
}

/** Punktzahl einer Anklage mit Aufschlüsselung (#54). */
export interface AccusationScore {
  points: number;
  maxPoints: number;
  /** Einordnung in Worten, z. B. "Solide Ermittlung". */
  rank: string;
  breakdown: { label: string; points: number }[];
}

/** Bestes Ergebnis eines Server-Kontos pro Fall (#77). */
export interface LeaderboardEntry {
  playerName: string;
  caseId: string;
  caseTitle: string;
  points: number;
  maxPoints: number;
  scoreRank: string;
  achievedAt: string;
}

/** Antwort des Servers auf `POST /api/rooms/:code/accusation` (Story #27). */
export type SubmitAccusationResult =
  | { ok: true; receipt: AccusationReceipt }
  | { ok: false; reason: "already-submitted"; receipt: AccusationReceipt }
  | { ok: false; reason: "invalid"; message: string };

export interface ScoreResult {
  correct: boolean;
  accuracy: number;
  evidenceMatched: number;
  evidenceTotal: number;
}

/** Eine Nachricht im Team-Chat (#49). */
export interface TeamChatMessage {
  id: string;
  /** Socket-ID der Person, die geschrieben hat (#22). */
  playerId: string;
  name: string;
  /** Rolle zum Zeitpunkt des Schreibens (#31), falls vergeben. */
  role: Role | null;
  text: string;
  /** ISO-Zeitpunkt, vom Server gesetzt. */
  sentAt: string;
}

/** Eine Aufgabe auf der gemeinsamen Liste (#50). */
export interface TeamTask {
  id: string;
  text: string;
  /** Spieler-ID, wer sie angelegt hat. */
  createdBy: string;
  /** Wer sie übernimmt — `null`, solange niemand. */
  assigneeId: string | null;
  done: boolean;
  createdAt: string;
}

/** Was sich an einer Aufgabe ändern lässt (#50). */
export interface TeamTaskPatch {
  done?: boolean;
  assigneeId?: string | null;
}

/** Antwort auf eine Änderung an der Aufgabenliste (#50). */
export type TaskAck = { ok: true } | { ok: false; reason: string };

export interface RoomState {
  code: string;
  caseId: string;
  players: Player[];
  started: boolean;
  board: {
    nodes: EvidenceNode[];
    edges: EvidenceEdge[];
  };
}

// Socket.IO event contract (client <-> server)
export interface ClientToServerEvents {
  "room:create": (payload: { caseId: string; playerName: string }, cb: (roomCode: string) => void) => void;
  "room:join": (payload: { code: string; playerName: string; role: Role }) => void;
  "room:start": (payload: { code: string }) => void;
  "board:addNode": (payload: { code: string; node: EvidenceNode }) => void;
  "board:moveNode": (payload: { code: string; nodeId: string; x: number; y: number }) => void;
  "board:connect": (payload: { code: string; fromId: string; toId: string }) => void;
  "case:accuse": (payload: { code: string; accusation: Accusation }, cb: (result: ScoreResult) => void) => void;
  /** Story #22 — mit Namen dem Team einer Session beitreten. */
  "team:join": (
    payload: { code: string; playerName: string; token?: string },
    cb: (result: TeamJoinResult) => void
  ) => void;
  /** Story #31 — die eigene Rolle wählen; `null` gibt sie wieder frei. */
  "team:role": (
    payload: { code: string; role: Role | null; /** Wem die Rolle gehören soll (#48); fehlt = mir. */ playerId?: string },
    cb: (result: TeamJoinResult) => void
  ) => void;
  /** Story #23 — einen Fund aus der eigenen Akte mit dem Team teilen. */
  "evidence:share": (payload: { code: string; evidence: CollectedEvidence }, cb: (result: ShareResult) => void) => void;
  /** Story #75 — eigenen Fund live ans Team melden (passiert beim Einsammeln automatisch). */
  "evidence:found": (payload: { code: string; evidence: CollectedEvidence }, cb: (result: ShareResult) => void) => void;
  /** Story #64 — eine eigene Notiz zu einem Beweis mit dem Team teilen. */
  "note:share": (
    payload: { code: string; evidenceId: string; evidenceLabel: string; text: string },
    cb: (result: NoteShareResult) => void
  ) => void;
  /** Story #57 — das ganze Team aus `code` in die neue Session `newCode` mitnehmen. */
  "team:next": (payload: { code: string; newCode: string }, cb: (result: TeamJoinResult) => void) => void;
  /** Story #49 — Nachricht an das Team. Der Callback meldet eine Ablehnung, z. B. zu lang. */
  "chat:send": (
    payload: { code: string; text: string },
    cb: (result: { ok: true } | { ok: false; reason: string }) => void
  ) => void;
  /** Story #50 — Aufgabenliste: anlegen, ändern, löschen. Die Liste kommt per `tasks:state`. */
  "tasks:add": (payload: { code: string; text: string }, cb: (ack: TaskAck) => void) => void;
  "tasks:update": (
    payload: { code: string; taskId: string; patch: TeamTaskPatch },
    cb: (ack: TaskAck) => void
  ) => void;
  "tasks:remove": (payload: { code: string; taskId: string }, cb: (ack: TaskAck) => void) => void;
}

/** Die Teamliste mit der Teamleitung (#48): wer zuerst beigetreten ist. */
export interface TeamState {
  players: Player[];
  /** Socket-ID der Teamleitung, `null` solange niemand im Team ist. */
  leaderId: string | null;
}

/** Antwort auf `team:join` (#22). */
export type TeamJoinResult = { ok: true } | { ok: false; error: string };

export interface ServerToClientEvents {
  "room:state": (state: RoomState) => void;
  "event:new": (event: TimedEvent) => void;
  "board:update": (board: RoomState["board"]) => void;
  "error:message": (message: string) => void;
  /** Story #22 — die aktuelle Teamliste, nach jedem Beitritt und Verlassen an alle im Raum. */
  "team:update": (team: TeamState) => void;
  /** Story #23 — alle geteilten Funde, nach jedem Teilen an alle und beim Beitritt an den Neuen. */
  "team:findings": (findings: SharedFinding[]) => void;
  /** Das ganze Aktivitätsprotokoll (#76) nach jedem neuen Eintrag, der älteste zuerst. */
  "team:activity": (entries: ActivityEntry[]) => void;
  /** Alle live gemeldeten Funde des Teams (#75), der älteste zuerst. */
  "team:discoveries": (discoveries: TeamDiscovery[]) => void;
  /** Story #64 — alle geteilten Notizen, nach jedem Teilen an alle und beim Beitritt an den Neuen. */
  "team:notes": (notes: SharedNote[]) => void;
  /** Story #57 — das Team zieht in eine neue Session um; `by` hat sie angelegt. */
  "team:moved": (payload: { code: string; by: string }) => void;
  /** Story #49 — bisheriger Chatverlauf, beim Beitritt an den Neuen. */
  "chat:history": (messages: TeamChatMessage[]) => void;
  /** Story #49 — neue Nachricht an alle im Raum. */
  "chat:message": (message: TeamChatMessage) => void;
  /** Story #50 — die ganze Aufgabenliste nach jeder Änderung an alle, beim Beitritt an den Neuen. */
  "tasks:state": (tasks: TeamTask[]) => void;
}
