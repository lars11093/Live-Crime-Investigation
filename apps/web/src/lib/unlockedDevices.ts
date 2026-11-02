import type { Device } from "@case-zero/shared";
import type { ProgressStorage } from "./caseProgress";

/**
 * Entsperrte Geraete einer Team-Session (#70).
 *
 * Liegt in einem eigenen Schluessel neben dem Fortschritt: nach einem
 * Neuladen kommt der Fall wieder mit gesperrtem Geraet vom Server, und der
 * Ermittler soll die PIN nicht erneut eingeben muessen. Gespeichert wird das
 * Geraet, das der Server nach dem Entsperren geliefert hat — nie die PIN.
 */
function storageKey(roomCode: string): string {
  return `case-zero:unlocked:${roomCode}`;
}

export function loadUnlocked(storage: ProgressStorage, roomCode: string): Record<string, Device> {
  try {
    const raw = storage.getItem(storageKey(roomCode));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: Record<string, Device> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, Partial<Device>>)) {
      if (value && value.id === id && Array.isArray(value.messages)) result[id] = value as Device;
    }
    return result;
  } catch {
    return {};
  }
}

export function saveUnlocked(
  storage: ProgressStorage,
  roomCode: string,
  unlocked: Record<string, Device>
): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(unlocked));
  } catch {
    // Voller oder gesperrter Storage: dann muss eben neu entsperrt werden.
  }
}

/** Ersetzt gesperrte Geraete durch ihre entsperrte Fassung, Reihenfolge bleibt. */
export function withUnlocked(devices: Device[], unlocked: Record<string, Device>): Device[] {
  return devices.map((device) => unlocked[device.id] ?? device);
}
