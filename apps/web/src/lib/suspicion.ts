import type { Suspect } from "@case-zero/shared";

/**
 * Wie verdaechtig der Ermittler eine Person findet (Story #43), 1 bis 4.
 *
 * Eine persoenliche Einschaetzung, die nichts ueber die Loesung verraet —
 * die kennt nur der Server.
 */
export type SuspicionLevel = 1 | 2 | 3 | 4;

export const SUSPICION_LEVELS: SuspicionLevel[] = [1, 2, 3, 4];

export const SUSPICION_LABEL: Record<SuspicionLevel, string> = {
  1: "Gering",
  2: "Mittel",
  3: "Hoch",
  4: "Sehr hoch",
};

/** Setzt den Verdachtsgrad; derselbe Grad nochmal nimmt die Einschaetzung zurueck. */
export function setSuspicion(
  levels: Record<string, SuspicionLevel>,
  suspectId: string,
  level: SuspicionLevel
): Record<string, SuspicionLevel> {
  if (levels[suspectId] === level) {
    const { [suspectId]: _removed, ...rest } = levels;
    return rest;
  }
  return { ...levels, [suspectId]: level };
}

/**
 * Die Person mit dem hoechsten Verdachtsgrad — nur, wenn sie eindeutig vorne
 * liegt. Bei Gleichstand gibt es keinen "Hauptverdaechtigen".
 */
export function primeSuspect(
  suspects: Suspect[],
  levels: Record<string, SuspicionLevel>
): Suspect | null {
  const rated = suspects
    .filter((s) => levels[s.id])
    .sort((a, b) => levels[b.id] - levels[a.id]);
  if (rated.length === 0) return null;
  if (rated.length > 1 && levels[rated[0].id] === levels[rated[1].id]) return null;
  return rated[0];
}

export function parseSuspicion(raw: unknown): Record<string, SuspicionLevel> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, SuspicionLevel> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === 1 || value === 2 || value === 3 || value === 4) result[id] = value;
  }
  return result;
}
