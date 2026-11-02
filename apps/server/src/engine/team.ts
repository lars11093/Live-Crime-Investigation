import { ROLES, type Player, type Role, type TeamJoinResult } from "@case-zero/shared";
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
 * wird ihr Eintrag ersetzt statt verdoppelt, ihre Rolle (#31) bleibt dabei.
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

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

/**
 * Story #31 — eine Verbindung waehlt ihre eigene Rolle. `null` gibt sie frei.
 *
 * Jede Rolle gibt es pro Team genau einmal. Die Identitaet ist die Socket-ID,
 * die der Server kennt: niemand kann per Payload die Rolle anderer setzen.
 */
export function chooseRole(room: Room, playerId: string, role: unknown): TeamJoinResult {
  const player = room.state.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, error: "Tritt zuerst dem Team bei." };
  if (role !== null && !isRole(role)) return { ok: false, error: "Unbekannte Rolle." };

  if (role !== null) {
    const holder = room.state.players.find((p) => p.role === role && p.id !== playerId);
    if (holder) return { ok: false, error: `Die Rolle ist schon an ${holder.name} vergeben.` };
  }
  player.role = role;
  return { ok: true };
}

/** Was die Teamliste bekommt: Name und Rolle, sonst nichts. */
export function teamOf(room: Room): Player[] {
  return room.state.players.map(({ id, name, role }) => ({ id, name, role }));
}
