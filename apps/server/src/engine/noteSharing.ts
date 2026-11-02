import type { NoteShareResult, SharedNote } from "@case-zero/shared";
import type { Room } from "./rooms.js";
import { collectableIds } from "./sharing.js";

export const NOTE_MAX_LENGTH = 500;

/**
 * Geteilte Notizen pro Raum (#64). In einer WeakMap statt im Room-Objekt:
 * verschwindet der Raum, verschwinden die Notizen mit.
 */
const notesByRoom = new WeakMap<Room, SharedNote[]>();

export function notesOf(room: Room): SharedNote[] {
  return notesByRoom.get(room) ?? [];
}

/**
 * Story #64 — eine Notiz mit dem Team teilen.
 *
 * Wie beim Teilen von Funden (#23) prueft der Server Teammitgliedschaft und
 * ob es den Beweis im Fall gibt. Teilt dieselbe Person erneut eine Notiz zum
 * selben Beweis, ersetzt die neue die alte — eine Ueberlegung pro Person und Beweis.
 */
export function shareNote(
  room: Room,
  playerId: string,
  payload: { evidenceId: unknown; evidenceLabel: unknown; text: unknown },
  now: Date = new Date()
): NoteShareResult {
  const player = room.state.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, reason: "not-in-team" };
  const evidenceId = String(payload.evidenceId ?? "");
  if (!collectableIds(room.caseDef).has(evidenceId)) return { ok: false, reason: "unknown-evidence" };
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text || text.length > NOTE_MAX_LENGTH) return { ok: false, reason: "invalid-text" };

  const note: SharedNote = {
    evidenceId,
    evidenceLabel: String(payload.evidenceLabel ?? evidenceId).slice(0, 120),
    text,
    sharedBy: player.name,
    sharedById: player.id,
    sharedAt: now.toISOString(),
  };
  const others = notesOf(room).filter((n) => !(n.evidenceId === evidenceId && n.sharedById === player.id));
  notesByRoom.set(room, [...others, note]);
  return { ok: true };
}
