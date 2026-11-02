import type { TeamChatMessage } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/** Länger wird es im Terminal unlesbar. */
export const CHAT_TEXT_MAX = 500;
/** Mehr braucht eine Sitzung nicht; ältere Nachrichten fallen vorne raus. */
export const CHAT_HISTORY_MAX = 200;

/**
 * Nimmt eine Chatnachricht an (Story #49).
 *
 * Schreiben darf nur, wer im Team ist (#22). `playerId` ist die Socket-ID, die
 * der Server kennt; Name und Rolle (#31) kommen aus dem Team. So kann niemand
 * unter fremdem Namen schreiben.
 */
export function addChatMessage(
  room: Room,
  playerId: string,
  text: unknown,
  now: Date = new Date(),
  id: string = `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
): { ok: true; message: TeamChatMessage } | { ok: false; reason: string } {
  const member = room.state.players.find((p) => p.id === playerId);
  if (!member) return { ok: false, reason: "Tritt zuerst dem Team bei." };
  const clean = typeof text === "string" ? text.trim() : "";
  if (!clean) return { ok: false, reason: "Leere Nachricht." };
  if (clean.length > CHAT_TEXT_MAX) {
    return { ok: false, reason: `Höchstens ${CHAT_TEXT_MAX} Zeichen.` };
  }

  const message: TeamChatMessage = {
    id,
    playerId,
    name: member.name,
    role: member.role,
    text: clean,
    sentAt: now.toISOString(),
  };
  room.chat = [...(room.chat ?? []), message].slice(-CHAT_HISTORY_MAX);
  return { ok: true, message };
}
