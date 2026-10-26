// Shared domain types for CASE//ZERO — imported by both apps/server and apps/web.
// Keep this the single source of truth for the room/case/socket contract.

export type Role = "forensics" | "cyber" | "interrogation" | "field" | "lead";

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
   * Beweise, die diese Loesung tragen (#28). Angehaengte Beweise ausserhalb
   * dieser Liste gelten in der Aufloesung als "traegt nichts bei".
   */
  keyEvidenceIds: string[];
  /** Was tatsaechlich passiert ist — erscheint erst nach der Anklage (#28). */
  resolution: string;
}

export interface Suspect {
  id: string;
  name: string;
  /** Alter in Jahren (Story #15). */
  age: number;
  /** Beziehung zum Opfer, z. B. "Vorgesetzte" (Story #15). */
  relationToVictim: string;
  /**
   * Das oeffentlich bekannte Motiv (Story #15) — NICHT das Motiv aus
   * `Scenario`. Jenes ist die Loesung und verlaesst den Server nie.
   * Hier steht, was die Ermittlung ueber diese Person weiss; das haben
   * bewusst mehrere Verdaechtige, sonst waere der Fall trivial.
   * Optional, weil die Story "sofern bekannt" sagt.
   */
  knownMotive?: string;
  /** Aussage zur Tatnacht (Story #16). */
  statement?: string;
  /** Portraet. Wie ueberall: kein Asset im Repo, Platzhalter im Client. */
  imagePath?: string;
}

/**
 * Eine Nachricht im Chatverlauf eines Geraets (Story #19).
 *
 * Die ID ist pro Fall eindeutig, nicht nur pro Geraet: daran haengt die
 * Markierung im Fortschritt des Ermittlers.
 */
export interface ChatMessage {
  id: string;
  /** Anzeigename des Absenders, z. B. "Monica Brandt". */
  sender: string;
  /** Zeitpunkt, wie er auf dem Geraet steht — z. B. "12.09. 20:31". */
  sentAt: string;
  text: string;
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
  /** Kamera bzw. Geraetemodell, z. B. "Google Pixel 7". */
  camera?: string;
  gps?: { lat: number; lng: number; place?: string };
  /** GPS war ausgeschaltet — anders als "keine Angabe". */
  gpsDisabled?: boolean;
  resolution?: string;
  software?: string;
}

/** Ein Bildanhang an einer Chatnachricht (#45). */
export interface ChatAttachment {
  fileName: string;
  metadata: ImageMetadata;
}

/**
 * Ein sichergestelltes Geraet (Story #19).
 *
 * Die Nachrichten stehen in der Reihenfolge im Case-JSON, in der sie
 * angezeigt werden — chronologisch, die aelteste zuerst. Der Client
 * sortiert nicht um, weil `sentAt` ein Anzeigetext ist und kein Datum.
 *
 * Story #18 — im Forensik-Terminal werden alle Geraete aufgelistet. Ein
 * gesperrtes Geraet (`locked`) ist dort sichtbar, aber nicht auswertbar; der
 * Server schickt seine Nachrichten gar nicht erst an den Client.
 */
export interface Device {
  id: string;
  /** z. B. "Smartphone Thomas Vogt". */
  label: string;
  /** Wem das Geraet gehoert. Gleich geschrieben wie `ChatMessage.sender`, damit eigene Nachrichten erkennbar sind. */
  owner: string;
  /** Gesperrt, bis es entsperrt wird (#18). Fehlt das Feld, ist das Geraet offen. */
  locked?: boolean;
  /** Art der Sperre, wie sie im Terminal steht — z. B. "PIN, 4 Ziffern" (#18). */
  lockType?: string;
  /** Geraeteart fuer die Uebersicht (#44). Fehlt sie, steht "Geraet". */
  kind?: "smartphone" | "laptop" | "tablet" | "storage";
  /** Wo das Geraet sichergestellt wurde (#44), z. B. "Schreibtisch, Buero 4.12". */
  seizedAt?: string;
  messages: ChatMessage[];
}

/**
 * Ein Tatort als Szene (Story #7).
 *
 * `imagePath` ist ein Pfad, kein Asset: echte Bilder werden bewusst nicht
 * committet (Copyright/Repo-Groesse). Laedt das Bild nicht — und in der
 * MVP-Phase tut es das nie — zeigt der Client einen Platzhalter mit dem
 * Szenennamen.
 */
/**
 * Eine anklickbare Stelle im Tatort (Story #8).
 *
 * Position in Prozent der Szene, nicht in Pixeln: die Szene skaliert mit dem
 * Viewport, ein Pixelwert saesse bei 1920 woanders als bei 1280.
 */
export interface Hotspot {
  id: string;
  /** Kurzer Name, erscheint beim Ueberfahren und in der Detailansicht. */
  label: string;
  /** 0-100, gemessen von links bzw. oben. */
  x: number;
  y: number;
  /** Was der Ermittler sieht, wenn er die Stelle untersucht. */
  detail: string;
  /**
   * Der Beweis, der hier eingesammelt werden kann (Story #9).
   *
   * Optional: nicht jede Stelle gibt etwas her. Fehlt das Feld, laesst sich
   * die Stelle untersuchen, aber nichts mitnehmen.
   */
  evidence?: CollectableEvidence;
}

/** Ein einsammelbarer Fund aus dem Tatort (Story #9). */
export interface CollectableEvidence {
  id: string;
  label: string;
  kind: EvidenceNode["kind"];
  /** Beschreibung in der Beweisakte — ausfuehrlicher als das Label. */
  description: string;
  /**
   * Asservatenfoto (Story #11). Optional und ohne Asset im Repo — wie bei
   * den Szenen zeigt der Client einen Platzhalter, wenn nichts laedt.
   */
  imagePath?: string;
}

/**
 * Ein Fund, wie er in der Beweisakte liegt (Story #11).
 *
 * Der Fundort wird beim Einsammeln festgehalten, nicht im Fall hinterlegt:
 * derselbe Beweis koennte spaeter an mehreren Stellen auftauchen, und die
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
}

export interface Scene {
  id: string;
  /** Anzeigename, dauerhaft als Overlay sichtbar. */
  name: string;
  imagePath: string;
  hotspots: Hotspot[];
}

/**
 * Das Briefing, das der Spieler vor dem Tatort liest (Story #6).
 *
 * Optional am Fall: fehlt es, zeigt der Client "Kein Briefing verfuegbar"
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
   * Dieselbe Tatzeit maschinenlesbar, fuer die Alibi-Pruefung (#42).
   * Optional: ohne Fenster bietet das Profil keine Pruefung an.
   */
  crimeWindow?: CrimeWindow;
  /** Tatort in Worten — z. B. "Buero 4.12, Hardturmstrasse 61". */
  location: string;
  /** Fliesstext, mindestens drei Saetze. */
  text: string;
}

/**
 * Eine Verknuepfung zweier Beweise (Story #13).
 *
 * Liegt beim Fall, nicht beim Beweis: welche Paare etwas ergeben, ist Teil der
 * Loesung. Deshalb wird `combinations` — wie `scenarios` — serverseitig aus der
 * Client-Antwort entfernt (engine/caseView.ts). Kaeme die Liste an den Browser,
 * liesse sich der Fall aus der Netzwerk-Konsole loesen.
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

export interface CaseDefinition {
  id: string;
  title: string;
  /**
   * Was das Team herausfinden soll, in einem bis zwei Saetzen (#32). Jederzeit
   * im Spiel einsehbar — deshalb nichts darin, was die Loesung verraet.
   */
  objective?: string;
  briefing?: CaseBriefing;
  scenes: Scene[];
  combinations: Combination[];
  suspects: Suspect[];
  /** Sichergestellte Geraete mit Chatverlauf (#19). Optional: nicht jeder Fall hat welche. */
  devices?: Device[];
  scenarios: Scenario[];
  seedEvidence: EvidenceNode[];
  timeline: TimedEvent[];
}

/**
 * Der Fall, wie ihn der Client sehen darf.
 *
 * `scenarios` enthaelt die Loesung (Taeter, Waffe, Tatzeit) und wird deshalb
 * serverseitig entfernt — siehe apps/server/src/engine/caseView.ts. Der Client
 * bekommt diesen Typ, nie CaseDefinition.
 */
export type PublicCase = Omit<CaseDefinition, "scenarios" | "combinations">;

/**
 * Ein Eintrag in der Fallauswahl (Story #30) — nur, was man zum Waehlen
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
 * Oberflaeche (noch) nicht ab — der Prototyp-Socket-Event `case:accuse`
 * bleibt davon unberuehrt.
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
  /** Die Aufloesung (#28), gleich mit der Quittung ausgeliefert. */
  verdict: AccusationVerdict;
}

/**
 * Ein einzelner Schluss in der Aufloesung (Story #28): richtig oder falsch,
 * mit dem Satz, der dazu im UI steht.
 */
export interface VerdictFinding {
  /** Worum es geht: der Taeter, ein angehaengter Beweis oder ein uebersehener. */
  topic: "suspect" | "evidence" | "missed";
  correct: boolean;
  text: string;
}

/**
 * Die Aufloesung des Falls nach der Anklage (Story #28).
 *
 * Verlaesst den Server erst, wenn die Anklage abgesendet ist — vorher waere
 * sie die Loesung.
 */
export interface AccusationVerdict {
  solved: boolean;
  culprit: { id: string; name: string };
  /** Der Aufloesungstext aus dem aktiven Szenario. */
  resolution: string;
  findings: VerdictFinding[];
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

/** Das Team einer Session, wie der Client es sieht (#31). */
export interface TeamView {
  players: Player[];
}

/** Antwort der Team-Endpoints (#31). */
export type TeamResult = { ok: true; team: TeamView } | { ok: false; message: string };

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
}

export interface ServerToClientEvents {
  "room:state": (state: RoomState) => void;
  "event:new": (event: TimedEvent) => void;
  "board:update": (board: RoomState["board"]) => void;
  "error:message": (message: string) => void;
}
