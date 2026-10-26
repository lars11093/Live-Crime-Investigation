import type { CrimeWindow } from "@case-zero/shared";
import { splitIntoSentences, timesIn } from "./statement";

/** "22:30" -> 1350 Minuten seit Mitternacht; ungueltig -> null. */
export function toMinutes(clock: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(clock.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Eine Zeitangabe aus der Aussage, eingeordnet gegen die Tatzeit (#42). */
export interface AlibiEntry {
  time: string;
  minutes: number;
  sentence: string;
  sentenceIndex: number;
  /** Liegt die Zeitangabe im Tatzeitfenster? */
  inWindow: boolean;
}

/**
 * Ordnet jede Uhrzeit einer Aussage gegen das Tatzeitfenster ein (Story #42).
 *
 * Bewusst ohne Urteil: ob ein Alibi haelt, entscheidet der Ermittler. Das
 * Spiel zeigt nur, welche Angaben in die Tatzeit fallen — genau die muessen
 * mit Spuren wie dem Badge-Protokoll abgeglichen werden.
 */
export function alibiTimeline(statement: string | undefined, window: CrimeWindow): AlibiEntry[] {
  const from = toMinutes(window.from);
  const to = toMinutes(window.to);
  const entries: AlibiEntry[] = [];
  splitIntoSentences(statement ?? "").forEach((sentence, sentenceIndex) => {
    for (const time of timesIn(sentence)) {
      const minutes = toMinutes(time);
      if (minutes === null) continue;
      entries.push({
        time,
        minutes,
        sentence,
        sentenceIndex,
        inWindow: from !== null && to !== null && minutes >= from && minutes <= to,
      });
    }
  });
  return entries.sort((a, b) => a.minutes - b.minutes);
}

/**
 * Sagt die Aussage ueberhaupt etwas zur Tatzeit?
 *
 * Ja, wenn eine Angabe ins Fenster faellt — oder wenn ein Satz einen
 * Zeitraum nennt, der das Fenster umschliesst ("Zwischen 22:00 und 23:00 war
 * ich unten"). Sonst gibt es fuer die Tatzeit kein konkretes Alibi.
 */
export function coversWindow(entries: AlibiEntry[], window: CrimeWindow): boolean {
  if (entries.some((e) => e.inWindow)) return true;
  const from = toMinutes(window.from);
  const to = toMinutes(window.to);
  if (from === null || to === null) return false;
  const bySentence = new Map<number, number[]>();
  for (const e of entries) {
    bySentence.set(e.sentenceIndex, [...(bySentence.get(e.sentenceIndex) ?? []), e.minutes]);
  }
  return [...bySentence.values()].some(
    (minutes) => minutes.length >= 2 && Math.min(...minutes) <= from && Math.max(...minutes) >= to
  );
}

/** Wie der Ermittler das Alibi einschaetzt (#42). */
export type AlibiVerdict = "haltbar" | "zweifelhaft" | "nicht-haltbar";

export const VERDICT_LABEL: Record<AlibiVerdict, string> = {
  haltbar: "Haltbar",
  zweifelhaft: "Zweifelhaft",
  "nicht-haltbar": "Nicht haltbar",
};

/** Setzt die Einschaetzung; dieselbe nochmal waehlen nimmt sie zurueck. */
export function setAlibiVerdict(
  verdicts: Record<string, AlibiVerdict>,
  suspectId: string,
  verdict: AlibiVerdict
): Record<string, AlibiVerdict> {
  if (verdicts[suspectId] === verdict) {
    const { [suspectId]: _removed, ...rest } = verdicts;
    return rest;
  }
  return { ...verdicts, [suspectId]: verdict };
}

export function parseAlibiVerdicts(raw: unknown): Record<string, AlibiVerdict> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, AlibiVerdict> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === "haltbar" || value === "zweifelhaft" || value === "nicht-haltbar") {
      result[id] = value;
    }
  }
  return result;
}
