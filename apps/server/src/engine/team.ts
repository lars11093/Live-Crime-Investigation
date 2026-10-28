import type { Player, TeamJoinResult } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/** Laenger wird ein Name in der Teamliste unleserlich. */
export const MAX_NAME_LENGTH = 24;

/**
 * Story #22 — ein Spieler tritt dem Team einer Session bei.
 *
 * Der Name wird hier geprueft, nicht nur im Client: der Server ist die Quelle
 * fuer das, was alle anderen in ihrer Teamliste sehen.
 *
 * Tritt dieselbe Verbindung erneut bei (z. B. nach einem Namenswechsel),
 * wird ihr Eintrag ersetzt statt verdoppelt. Die Rolle bleibt `null` — die
 * Rollenwahl ist #31.
 */
export function joinTeam(room: Room, playerId: string, rawName: string): TeamJoinResult {
  const name = rawName.trim();
  if (!name) {
    return { ok: false, error: "Bitte gib einen Namen ein." };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Der Name darf hoechstens ${MAX_NAME_LENGTH} Zeichen haben.` };
  }

  const existing = room.state.players.find((p) => p.id === playerId);
  if (existing) {
    existing.name = name;
    return { ok: true };
  }
  room.state.players.push({ id: playerId, name, role: null });
  return { ok: true };
}

/** Entfernt eine Verbindung aus dem Team. Gibt zurueck, ob sie dabei war. */
export function leaveTeam(room: Room, playerId: string): boolean {
  const before = room.state.players.length;
  room.state.players = room.state.players.filter((p) => p.id !== playerId);
  return room.state.players.length !== before;
}

/** Was die Teamliste bekommt: Name und Rolle, sonst nichts. */
export function teamOf(room: Room): Player[] {
  return room.state.players.map(({ id, name, role }) => ({ id, name, role }));
}
