import type { TeamChatMessage } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/** Laenger wird es im Terminal unlesbar. */
export const CHAT_TEXT_MAX = 500;
/** Mehr braucht eine Sitzung nicht; aeltere Nachrichten fallen vorne raus. */
export const CHAT_HISTORY_MAX = 200;

/** Der Socket-Room einer Session — Format aus CLAUDE.md. */
export function caseChannel(code: string): string {
  return `case:${code}`;
}

/**
 * Nimmt eine Chatnachricht an (Story #49).
 *
 * Der Name kommt aus dem Team (#31), wenn die Person dort bekannt ist — so
 * kann sich niemand im Chat einen anderen Namen geben als im Team.
 */
export function addChatMessage(
  room: Room,
  playerId: unknown,
  name: unknown,
  text: unknown,
  now: Date = new Date(),
  id: string = `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
): { ok: true; message: TeamChatMessage } | { ok: false; reason: string } {
  if (typeof playerId !== "string" || !playerId) return { ok: false, reason: "Spieler-ID fehlt." };
  const clean = typeof text === "string" ? text.trim() : "";
  if (!clean) return { ok: false, reason: "Leere Nachricht." };
  if (clean.length > CHAT_TEXT_MAX) {
    return { ok: false, reason: `Hoechstens ${CHAT_TEXT_MAX} Zeichen.` };
  }

  const member = room.state.players.find((p) => p.id === playerId);
  const displayName =
    member?.name ?? (typeof name === "string" && name.trim() ? name.trim().slice(0, 24) : "Unbekannt");

  const message: TeamChatMessage = {
    id,
    playerId,
    name: displayName,
    role: member?.role ?? null,
    text: clean,
    sentAt: now.toISOString(),
  };
  room.chat = [...(room.chat ?? []), message].slice(-CHAT_HISTORY_MAX);
  return { ok: true, message };
}
