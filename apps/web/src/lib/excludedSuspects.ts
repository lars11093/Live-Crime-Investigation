import type { Suspect } from "@case-zero/shared";
import type { ProgressStorage } from "./caseProgress";

/**
 * Story #69 — ausgeschlossene Verdaechtige.
 *
 * Eine persoenliche Einschaetzung wie die Notizen: Sie bleibt im Browser,
 * pro Team-Code, und sagt nichts darueber, ob die Person es war. Eigener
 * Schluessel neben dem Fortschritt, damit alte Spielstaende unberuehrt bleiben.
 */
function storageKey(roomCode: string): string {
  return `case-zero:excluded:${roomCode}`;
}

export function loadExcluded(storage: ProgressStorage, roomCode: string): string[] {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey(roomCode)) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveExcluded(storage: ProgressStorage, roomCode: string, ids: string[]): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(ids));
  } catch {
    // Gesperrter Storage: dann gilt der Ausschluss nur bis zum Neuladen.
  }
}

/** Schliesst aus oder nimmt wieder auf. */
export function toggleExcluded(ids: string[], suspectId: string): string[] {
  return ids.includes(suspectId) ? ids.filter((id) => id !== suspectId) : [...ids, suspectId];
}

/** Verbleibende zuerst, Ausgeschlossene ans Ende — sonst Reihenfolge aus dem Fall. */
export function orderSuspects(suspects: Suspect[], excludedIds: string[]): Suspect[] {
  const excluded = new Set(excludedIds);
  return [...suspects.filter((s) => !excluded.has(s.id)), ...suspects.filter((s) => excluded.has(s.id))];
}
