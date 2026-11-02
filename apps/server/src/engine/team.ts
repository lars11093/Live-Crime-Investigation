import { ROLES, type Player, type Role, type TeamJoinResult, type TeamState } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/** Länger wird ein Name in der Teamliste unleserlich. */
export const MAX_NAME_LENGTH = 24;

/**
 * Story #22 — ein Spieler tritt dem Team einer Session bei.
 *
 * Der Name wird hier geprüft, nicht nur im Client: der Server ist die Quelle
 * für das, was alle anderen in ihrer Teamliste sehen.
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
    return { ok: false, error: `Der Name darf höchstens ${MAX_NAME_LENGTH} Zeichen haben.` };
  }

  const existing = room.state.players.find((p) => p.id === playerId);
  if (existing) {
    existing.name = name;
    return { ok: true };
  }
  room.state.players.push({ id: playerId, name, role: null });
  // Wer zuerst kommt, leitet das Team (#48).
  room.leaderId ??= playerId;
  return { ok: true };
}

/**
 * Entfernt eine Verbindung aus dem Team. Gibt zurück, ob sie dabei war.
 *
 * Geht die Teamleitung, übernimmt die Person, die am längsten dabei ist
 * (#48) — sonst könnte niemand mehr Rollen vergeben.
 */
export function leaveTeam(room: Room, playerId: string): boolean {
  const before = room.state.players.length;
  room.state.players = room.state.players.filter((p) => p.id !== playerId);
  if (room.leaderId === playerId) room.leaderId = room.state.players[0]?.id;
  return room.state.players.length !== before;
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

/**
 * Story #31 — eine Verbindung wählt ihre eigene Rolle. `null` gibt sie frei.
 * Story #48 — die Teamleitung vergibt Rollen auch an andere.
 *
 * Jede Rolle gibt es pro Team genau einmal. `actorId` ist immer die Socket-ID,
 * die der Server kennt: wer handelt, lässt sich per Payload nicht fälschen.
 */
export function chooseRole(
  room: Room,
  actorId: string,
  role: unknown,
  targetId: string = actorId
): TeamJoinResult {
  if (!room.state.players.some((p) => p.id === actorId)) {
    return { ok: false, error: "Tritt zuerst dem Team bei." };
  }
  const target = room.state.players.find((p) => p.id === targetId);
  if (!target) return { ok: false, error: "Diese Person ist nicht im Team." };
  if (targetId !== actorId && actorId !== room.leaderId) {
    return { ok: false, error: "Nur die Teamleitung kann Rollen an andere vergeben." };
  }
  if (role !== null && !isRole(role)) return { ok: false, error: "Unbekannte Rolle." };

  if (role !== null) {
    const holder = room.state.players.find((p) => p.role === role && p.id !== targetId);
    if (holder) return { ok: false, error: `Die Rolle ist schon an ${holder.name} vergeben.` };
  }
  target.role = role;
  return { ok: true };
}

/** Was die Teamliste bekommt: Name und Rolle, sonst nichts. */
export function teamOf(room: Room): Player[] {
  return room.state.players.map(({ id, name, role }) => ({ id, name, role }));
}

/** Teamliste plus Teamleitung (#48), so wie sie per `team:update` rausgeht. */
export function teamStateOf(room: Room): TeamState {
  return { players: teamOf(room), leaderId: room.leaderId ?? null };
}
