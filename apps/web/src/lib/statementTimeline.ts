import type { Suspect } from "@case-zero/shared";
import { splitIntoSentences, timesIn } from "./statement";

/** Ein Zeitpunkt aus einer Aussage, mit dem Satz, in dem er steht (#68). */
export interface TimelineEntry {
  time: string;
  minutes: number;
  suspectId: string;
  suspectName: string;
  sentence: string;
  /** Liegt eine Angabe einer anderen Person nah daneben? */
  overlaps: boolean;
}

/** Wie nah zwei Angaben liegen müssen, um als Überschneidung zu gelten. */
export const OVERLAP_MINUTES = 10;

/** "22:40" -> 1360. Ungültige Uhrzeiten (25:00) fallen weg. */
export function clockToMinutes(clock: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(clock);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : null;
}

/**
 * Story #68 — alle Uhrzeiten aus allen Aussagen auf einer Zeitachse.
 *
 * Sortiert nach Uhrzeit; bei gleicher Uhrzeit bleibt die Reihenfolge der
 * Verdächtigen aus dem Fall. Eine Überschneidung ist, wenn eine andere
 * Person innerhalb von `OVERLAP_MINUTES` eine Angabe macht — dann lohnt sich
 * der Vergleich, ob beide zur selben Zeit am selben Ort sein konnten.
 */
export function buildStatementTimeline(suspects: Suspect[]): TimelineEntry[] {
  const entries: Omit<TimelineEntry, "overlaps">[] = [];
  for (const suspect of suspects) {
    for (const sentence of splitIntoSentences(suspect.statement ?? "")) {
      for (const time of timesIn(sentence)) {
        const minutes = clockToMinutes(time);
        if (minutes === null) continue;
        entries.push({ time, minutes, suspectId: suspect.id, suspectName: suspect.name, sentence });
      }
    }
  }
  const sorted = entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.minutes - b.entry.minutes || a.index - b.index)
    .map(({ entry }) => entry);
  return sorted.map((entry) => ({
    ...entry,
    overlaps: sorted.some(
      (other) =>
        other.suspectId !== entry.suspectId &&
        Math.abs(other.minutes - entry.minutes) <= OVERLAP_MINUTES
    ),
  }));
}
