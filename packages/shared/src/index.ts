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
}

/**
 * Ein sichergestelltes Gerät (Story #19).
 *
 * Die Nachrichten stehen in der Reihenfolge im Case-JSON, in der sie
 * angezeigt werden — chronologisch, die älteste zuerst. Der Client
 * sortiert nicht um, weil `sentAt` ein Anzeigetext ist und kein Datum.
 *
 * Auflisten und Sperren der Geräte ist #18 (Forensik-Terminal).
 */
export interface Device {
  id: string;
  /** z. B. "Smartphone Thomas Vogt". */
  label: string;
  /** Wem das Gerät gehört. Gleich geschrieben wie `ChatMessage.sender`, damit eigene Nachrichten erkennbar sind. */
  owner: string;
  messages: ChatMessage[];
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
}

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
 * Optional am Fall: fehlt es, zeigt der Client "Kein Briefing verfügbar"
 * statt einer leeren Box.
 */
export interface CaseBriefing {
  /** Tatzeit, wie sie im Briefing steht — z. B. "Freitag, 22:30 Uhr". */
  timeOfCrime: string;
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

export interface CaseDefinition {
  id: string;
  title: string;
  briefing?: CaseBriefing;
  scenes: Scene[];
  combinations: Combination[];
  suspects: Suspect[];
  /** Sichergestellte Geräte mit Chatverlauf (#19). Optional: nicht jeder Fall hat welche. */
  devices?: Device[];
  scenarios: Scenario[];
  seedEvidence: EvidenceNode[];
  timeline: TimedEvent[];
}

/**
 * Der Fall, wie ihn der Client sehen darf.
 *
 * `scenarios` enthält die Lösung (Täter, Waffe, Tatzeit) und wird deshalb
 * serverseitig entfernt — siehe apps/server/src/engine/caseView.ts. Der Client
 * bekommt diesen Typ, nie CaseDefinition.
 */
export type PublicCase = Omit<CaseDefinition, "scenarios" | "combinations">;

export interface Accusation {
  suspectId: string;
  motive: string;
  weapon: string;
  timeOfCrime: string;
  evidenceIds: string[];
}

export interface ScoreResult {
  correct: boolean;
  accuracy: number;
  evidenceMatched: number;
  evidenceTotal: number;
}

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
