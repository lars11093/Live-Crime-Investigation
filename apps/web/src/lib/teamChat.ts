import type { TeamChatMessage } from "@case-zero/shared";

/**
 * Haengt eine neue Nachricht an den Verlauf an (#49) — doppelte IDs nicht.
 *
 * Doppelt kommt vor: nach einem Reconnect schickt der Server den ganzen
 * Verlauf, waehrend vielleicht schon einzelne Nachrichten angekommen sind.
 */
export function appendMessage(list: TeamChatMessage[], message: TeamChatMessage): TeamChatMessage[] {
  return list.some((m) => m.id === message.id) ? list : [...list, message];
}

/** Wie viele Nachrichten anderer seit dem letzten Lesen dazugekommen sind. */
export function unreadCount(list: TeamChatMessage[], myId: string, readCount: number): number {
  return list.slice(readCount).filter((m) => m.playerId !== myId).length;
}

/** Uhrzeit fuer die Chatzeile, z. B. "22:41". */
export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}
