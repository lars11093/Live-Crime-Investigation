import type { CrimeWindow, SystemLogEntry } from "@case-zero/shared";
import { toMinutes } from "./alibi";

export type LogCategory = SystemLogEntry["category"];

export const CATEGORY_LABEL: Record<LogCategory, string> = {
  unlock: "Entsperren",
  app: "App",
  network: "Netzwerk",
  call: "Anruf",
  power: "Energie",
};

/** Die Uhrzeit aus einem Protokolleintrag wie "12.09. 22:31" (#46). */
export function clockOf(at: string): string | null {
  return /(\d{1,2}:\d{2})\s*$/.exec(at)?.[1] ?? null;
}

/** Ein Eintrag, eingeordnet gegen die Tatzeit (#46). */
export interface AnalyzedLogEntry extends SystemLogEntry {
  inWindow: boolean;
}

/**
 * Wertet ein Systemprotokoll aus (Story #46).
 *
 * Markiert, was in die Tatzeit faellt, und filtert nach Kategorie. Die
 * Reihenfolge bleibt die aus dem Case-JSON — chronologisch, wie ein echtes
 * Protokoll, und `at` ist ein Anzeigetext, kein sortierbares Datum.
 */
export function analyzeLog(
  log: SystemLogEntry[],
  window: CrimeWindow | undefined,
  categories: LogCategory[] = []
): AnalyzedLogEntry[] {
  const from = window ? toMinutes(window.from) : null;
  const to = window ? toMinutes(window.to) : null;
  return log
    .filter((entry) => categories.length === 0 || categories.includes(entry.category))
    .map((entry) => {
      const clock = clockOf(entry.at);
      const minutes = clock ? toMinutes(clock) : null;
      return {
        ...entry,
        inWindow: minutes !== null && from !== null && to !== null && minutes >= from && minutes <= to,
      };
    });
}

/**
 * Wann wurde das Geraet benutzt? Erster und letzter Eintrag, an dem jemand
 * das Geraet aktiv bedient hat (Entsperren oder App), sonst null.
 */
export function usageSpan(log: SystemLogEntry[]): { first: string; last: string } | null {
  const active = log.filter((e) => e.category === "unlock" || e.category === "app");
  if (active.length === 0) return null;
  return { first: active[0].at, last: active[active.length - 1].at };
}
