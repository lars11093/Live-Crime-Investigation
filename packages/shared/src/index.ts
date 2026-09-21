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
export interface CaseBriefing {
  /** Tatzeit, wie sie im Briefing steht — z. B. "Freitag, 22:30 Uhr". */
  timeOfCrime: string;
  /** Tatort in Worten — z. B. "Buero 4.12, Hardturmstrasse 61". */
  location: string;
  /** Fliesstext, mindestens drei Saetze. */
  text: string;
}

export interface CaseDefinition {
  id: string;
  title: string;
  briefing?: CaseBriefing;
  scenes: Scene[];
  suspects: Suspect[];
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
export type PublicCase = Omit<CaseDefinition, "scenarios">;

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
