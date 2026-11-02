import type { ProgressStorage } from "./caseProgress";

/** Wie lange eine Zeile der Titelsequenz steht, bevor die naechste kommt (#58). */
export const LINE_MS = 2600;

function storageKey(roomCode: string): string {
  return `case-zero:intro-seen:${roomCode}`;
}

/** Story #58 — das Intro laeuft einmal pro Team-Session, danach direkt das Briefing. */
export function introSeen(storage: ProgressStorage, roomCode: string): boolean {
  try {
    return storage.getItem(storageKey(roomCode)) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(storage: ProgressStorage, roomCode: string): void {
  try {
    storage.setItem(storageKey(roomCode), "1");
  } catch {
    // Gesperrter Storage: dann kommt das Intro beim naechsten Oeffnen wieder.
  }
}

/** Wie viele Zeilen nach `elapsedMs` sichtbar sind — mindestens die erste. */
export function visibleLineCount(elapsedMs: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(total, 1 + Math.floor(Math.max(0, elapsedMs) / LINE_MS));
}
