import { ROLES, type Role, type TeamResult, type TeamView } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/**
 * Team einer Session (Story #31): wer dabei ist und wer welche Rolle hat.
 *
 * Lebt im bestehenden `RoomState.players`. Die Spieler-ID kommt vom Client
 * (Konto-ID aus #29 oder eine Gast-ID) — ohne Login-Server ist das die
 * einzige stabile Identitaet, die wir haben.
 */
export function teamView(room: Room): TeamView {
  return { players: room.state.players, leaderId: room.leaderId ?? null };
}

const NAME_MAX = 24;

/** Tritt dem Team bei. Wer schon dabei ist, behaelt seine Rolle; der Name wird aktualisiert. */
export function joinTeam(room: Room, playerId: unknown, name: unknown): TeamResult {
  if (typeof playerId !== "string" || !playerId.trim()) {
    return { ok: false, message: "Spieler-ID fehlt." };
  }
  const cleanName = typeof name === "string" ? name.trim().slice(0, NAME_MAX) : "";
  if (!cleanName) return { ok: false, message: "Name fehlt." };

  const existing = room.state.players.find((p) => p.id === playerId);
  if (existing) {
    existing.name = cleanName;
  } else {
    room.state.players.push({ id: playerId, name: cleanName, role: null });
    // Wer zuerst kommt, leitet das Team (#48).
    room.leaderId ??= playerId;
  }
  return { ok: true, team: teamView(room) };
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

/**
 * Setzt die Rolle eines Spielers (#31). `null` gibt die Rolle wieder frei.
 *
 * Jede Rolle gibt es pro Team genau einmal. Jeder darf seine eigene Rolle
 * waehlen (#31); die Teamleitung darf Rollen an alle vergeben (#48).
 */
export function chooseRole(
  room: Room,
  actorId: unknown,
  targetId: unknown,
  role: unknown
): TeamResult {
  const target = room.state.players.find((p) => p.id === targetId);
  if (!target) return { ok: false, message: "Diese Person ist nicht im Team." };
  if (actorId !== targetId && actorId !== room.leaderId) {
    return { ok: false, message: "Nur die Teamleitung kann Rollen an andere vergeben." };
  }
  if (role !== null && !isRole(role)) return { ok: false, message: "Unbekannte Rolle." };

  if (role !== null) {
    const holder = room.state.players.find((p) => p.role === role && p.id !== target.id);
    if (holder) return { ok: false, message: `Die Rolle ist schon an ${holder.name} vergeben.` };
  }
  target.role = role;
  return { ok: true, team: teamView(room) };
}
