import type { ChatMessage, Device } from "@case-zero/shared";
import type { ProgressStorage } from "./caseProgress";

/** Geraete-ID -> wiederhergestellte Nachrichten (#71). */
export type RecoveredMessages = Record<string, ChatMessage[]>;

/**
 * Story #71 — wiederhergestellte Nachrichten pro Team-Code merken, damit sie
 * nach einem Neuladen nicht erneut wiederhergestellt werden muessen.
 */
function storageKey(roomCode: string): string {
  return `case-zero:recovered:${roomCode}`;
}

export function loadRecovered(storage: ProgressStorage, roomCode: string): RecoveredMessages {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey(roomCode)) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: RecoveredMessages = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        result[id] = value.filter(
          (m): m is ChatMessage => !!m && typeof m.id === "string" && typeof m.text === "string"
        );
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function saveRecovered(storage: ProgressStorage, roomCode: string, recovered: RecoveredMessages): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(recovered));
  } catch {
    // Gesperrter Storage: dann eben erneut wiederherstellen.
  }
}

/**
 * Fuegt wiederhergestellte Nachrichten in den Verlauf ein, chronologisch.
 * `sentAt` hat im Fall immer das Format "TT.MM. HH:MM", ist also als Text
 * sortierbar, solange alles im selben Monat liegt — wie in diesem Fall.
 */
export function withRecovered(device: Device, recovered: RecoveredMessages): Device {
  const extra = recovered[device.id];
  if (!extra || extra.length === 0) return device;
  const known = new Set(device.messages.map((m) => m.id));
  const messages = [...device.messages, ...extra.filter((m) => !known.has(m.id))]
    .map((message, index) => ({ message, index }))
    .sort((a, b) => a.message.sentAt.localeCompare(b.message.sentAt) || a.index - b.index)
    .map(({ message }) => message);
  return { ...device, messages, deletedCount: 0 };
}
