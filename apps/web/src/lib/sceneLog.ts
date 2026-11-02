import type { ProgressStorage } from "./caseProgress";

/** Ein Eintrag im Tatortprotokoll (#61). */
export interface SceneLogEntry {
  /** ISO-Zeitpunkt der Handlung. */
  at: string;
  action: "untersucht" | "eingesammelt";
  sceneName: string;
  hotspotLabel: string;
  /** Nur bei "eingesammelt": was in die Akte kam. */
  evidenceLabel?: string;
}

export const SCENE_LOG_MAX = 200;

/**
 * Story #61 — das Tatortprotokoll.
 *
 * Hält fest, was der Ermittler wann wo gemacht hat. Pro Team-Code im
 * Browser, in einem eigenen Schlüssel neben dem Fortschritt.
 */
function storageKey(roomCode: string): string {
  return `case-zero:scene-log:${roomCode}`;
}

export function loadSceneLog(storage: ProgressStorage, roomCode: string): SceneLogEntry[] {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey(roomCode)) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is SceneLogEntry =>
        !!e &&
        typeof e.at === "string" &&
        (e.action === "untersucht" || e.action === "eingesammelt") &&
        typeof e.sceneName === "string" &&
        typeof e.hotspotLabel === "string"
    );
  } catch {
    return [];
  }
}

export function saveSceneLog(storage: ProgressStorage, roomCode: string, log: SceneLogEntry[]): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(log));
  } catch {
    // Gesperrter Storage: dann gilt das Protokoll nur bis zum Neuladen.
  }
}

/**
 * Hängt einen Eintrag an. Dieselbe Handlung an derselben Stelle wird nur
 * einmal protokolliert — wer eine Stelle dreimal öffnet, hat sie einmal untersucht.
 */
export function appendSceneLog(log: SceneLogEntry[], entry: SceneLogEntry): SceneLogEntry[] {
  const duplicate = log.some(
    (e) => e.action === entry.action && e.sceneName === entry.sceneName && e.hotspotLabel === entry.hotspotLabel
  );
  if (duplicate) return log;
  return [...log, entry].slice(-SCENE_LOG_MAX);
}

/** Gruppiert das Protokoll nach Tatort, Reihenfolge wie aufgezeichnet. */
export function groupByScene(log: SceneLogEntry[]): { sceneName: string; entries: SceneLogEntry[] }[] {
  const groups: { sceneName: string; entries: SceneLogEntry[] }[] = [];
  for (const entry of log) {
    const group = groups.find((g) => g.sceneName === entry.sceneName);
    if (group) group.entries.push(entry);
    else groups.push({ sceneName: entry.sceneName, entries: [entry] });
  }
  return groups;
}

export function formatLogTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}
