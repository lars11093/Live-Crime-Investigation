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
