import type { ProgressStorage } from "./caseProgress";
import { isValidRoomCode } from "./api";

/** Das zuletzt genutzte Team (#57): Session-Code und eigener Name darin. */
export interface SavedTeam {
  code: string;
  name: string;
}

const KEY = "case-zero:last-team";

/**
 * Story #57 — das Team merken.
 *
 * Im localStorage, damit es auch einen geschlossenen Tab überlebt: Auf der
 * Startseite geht es dann mit einem Klick zurück ins Team, ohne Code und
 * Namen erneut einzugeben.
 */
export function loadSavedTeam(storage: ProgressStorage): SavedTeam | null {
  try {
    const parsed = JSON.parse(storage.getItem(KEY) ?? "null") as Partial<SavedTeam> | null;
    if (!parsed || typeof parsed.code !== "string" || typeof parsed.name !== "string") return null;
    return isValidRoomCode(parsed.code) && parsed.name.trim() ? { code: parsed.code, name: parsed.name } : null;
  } catch {
    return null;
  }
}

export function saveTeam(storage: ProgressStorage, team: SavedTeam): void {
  try {
    storage.setItem(KEY, JSON.stringify(team));
  } catch {
    // Gesperrter Storage: dann eben Code eingeben.
  }
}
