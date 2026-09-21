import type { PublicCase } from "@case-zero/shared";

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
