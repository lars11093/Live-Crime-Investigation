import type {
  AccusationSubmission,
  CaseSummary,
  CombineResult,
  PublicCase,
  Role,
  SubmitAccusationResult,
  TeamResult,
} from "@case-zero/shared";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4000";

/**
 * Laedt einen Fall vom Server (Story #2).
 *
 * Wirft bei jedem Fehlschlag — Netzwerk, 404, kaputtes JSON. Die Seite
 * unterscheidet die Ursachen nicht: fuer den Spieler ist jeder Fall derselbe
 * ("Fall konnte nicht geladen werden" + "Erneut versuchen").
 */
export async function fetchCase(caseId: string): Promise<PublicCase> {
  const response = await fetch(`${SERVER_URL}/api/cases/${caseId}`);
  if (!response.ok) {
    throw new Error(`Fall ${caseId} konnte nicht geladen werden (HTTP ${response.status})`);
  }
  return (await response.json()) as PublicCase;
}

/** Alle Faelle fuer die Auswahl (#30). Wirft, wenn der Server nicht antwortet. */
export async function fetchCaseList(): Promise<CaseSummary[]> {
  const response = await fetch(`${SERVER_URL}/api/cases`);
  if (!response.ok) {
    throw new Error(`Fallliste konnte nicht geladen werden (HTTP ${response.status})`);
  }
  return (await response.json()) as CaseSummary[];
}

export interface RoomSummary {
  code: string;
  caseId: string;
  caseTitle: string;
}

/** Code-Format aus CLAUDE.md, gespiegelt vom Server (engine/rooms.ts). */
export const ROOM_CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidRoomCode(code: string): boolean {
  return ROOM_CODE_PATTERN.test(code);
}

/** Legt eine neue Team-Session an und gibt den teilbaren Code zurueck (#5). */
export async function createRoom(caseId: string): Promise<RoomSummary> {
  const response = await fetch(`${SERVER_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId }),
  });
  if (!response.ok) {
    throw new Error(`Team-Session konnte nicht angelegt werden (HTTP ${response.status})`);
  }
  return (await response.json()) as RoomSummary;
}

/**
 * Prueft einen Team-Code (#5).
 *
 * `null` heisst "ungueltiger Code" — falsches Format und unbekannter Code
 * sehen fuer den Spieler gleich aus. Ein `throw` heisst dagegen, dass der
 * Server nicht erreichbar war; das ist ein anderer Fehler und darf nicht
 * als "Ungueltiger Team-Code" durchgehen.
 */
export async function findRoom(code: string): Promise<RoomSummary | null> {
  const normalized = normalizeRoomCode(code);
  if (!isValidRoomCode(normalized)) return null;

  const response = await fetch(`${SERVER_URL}/api/rooms/${normalized}`);
  if (response.status === 400 || response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Team-Code konnte nicht geprueft werden (HTTP ${response.status})`);
  }
  return (await response.json()) as RoomSummary;
}

/**
 * Kombiniert zwei Beweise (#13).
 *
 * Die Pruefung passiert auf dem Server — die Kombinationsliste ist Teil der
 * Loesung und wird dem Client nie ausgeliefert.
 */
export async function combineEvidence(
  caseId: string,
  evidenceIds: [string, string],
  foundInsightIds: string[]
): Promise<CombineResult> {
  const response = await fetch(`${SERVER_URL}/api/cases/${caseId}/combine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evidenceIds, foundInsightIds }),
  });
  if (!response.ok && response.status !== 400) {
    throw new Error(`Kombination fehlgeschlagen (HTTP ${response.status})`);
  }
  return (await response.json()) as CombineResult;
}

/**
 * Sendet die Anklage der Team-Session ab (#27).
 *
 * "Schon abgesendet" und "ungueltig" sind Antworten, keine Fehler — sie kommen
 * als Ergebnis zurueck. Geworfen wird nur, wenn der Server nicht antwortet.
 */
export async function submitAccusation(
  code: string,
  submission: AccusationSubmission
): Promise<SubmitAccusationResult> {
  const response = await fetch(`${SERVER_URL}/api/rooms/${normalizeRoomCode(code)}/accusation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
  if (![201, 400, 409].includes(response.status)) {
    throw new Error(`Anklage konnte nicht abgesendet werden (HTTP ${response.status})`);
  }
  return (await response.json()) as SubmitAccusationResult;
}

async function teamRequest(path: string, init?: RequestInit): Promise<TeamResult> {
  const response = await fetch(`${SERVER_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  if (![200, 400, 404, 409].includes(response.status)) {
    throw new Error(`Team-Anfrage fehlgeschlagen (HTTP ${response.status})`);
  }
  return (await response.json()) as TeamResult;
}

/** Tritt dem Team bei — mehrfach aufrufen ist unschaedlich (#31). */
export function joinTeam(code: string, playerId: string, name: string): Promise<TeamResult> {
  return teamRequest(`/api/rooms/${normalizeRoomCode(code)}/team`, {
    method: "POST",
    body: JSON.stringify({ playerId, name }),
  });
}

export function fetchTeam(code: string): Promise<TeamResult> {
  return teamRequest(`/api/rooms/${normalizeRoomCode(code)}/team`);
}

/** Setzt die Rolle von `playerId`; `actorId` ist, wer klickt (#31, #48). */
export function setRole(
  code: string,
  actorId: string,
  playerId: string,
  role: Role | null
): Promise<TeamResult> {
  return teamRequest(
    `/api/rooms/${normalizeRoomCode(code)}/team/${encodeURIComponent(playerId)}/role`,
    { method: "PUT", body: JSON.stringify({ actorId, role }) }
  );
}
