import { ROLES, type Player, type Role, type TeamJoinResult, type TeamResult, type TeamView } from "@case-zero/shared";
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
 * wird ihr Eintrag ersetzt statt verdoppelt. Die Rolle bleibt dabei erhalten;
 * neu Beitretende starten ohne Rolle (#31).
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

/** Das Team, wie die Rollenansicht es braucht (#31). */
export function teamView(room: Room): TeamView {
  return { players: teamOf(room) };
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

/**
 * Setzt die Rolle eines Spielers (#31). `null` gibt die Rolle wieder frei.
 *
 * Jede Rolle gibt es pro Team genau einmal. Hier darf nur jeder seine eigene
 * Rolle waehlen — Rollen an andere vergeben ist #48.
 */
export function chooseRole(
  room: Room,
  actorId: string,
  targetId: unknown,
  role: unknown
): TeamResult {
  const target = room.state.players.find((p) => p.id === targetId);
  if (!target) return { ok: false, message: "Diese Person ist nicht im Team." };
  if (actorId !== targetId) {
    return { ok: false, message: "Du kannst nur deine eigene Rolle waehlen." };
  }
  if (role !== null && !isRole(role)) return { ok: false, message: "Unbekannte Rolle." };

  if (role !== null) {
    const holder = room.state.players.find((p) => p.role === role && p.id !== target.id);
    if (holder) return { ok: false, message: `Die Rolle ist schon an ${holder.name} vergeben.` };
  }
  target.role = role;
  return { ok: true, team: teamView(room) };
}
