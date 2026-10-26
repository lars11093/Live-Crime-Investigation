import type { Insight } from "@case-zero/shared";

/**
 * Wie stark der Ermittler eine aufgedeckte Verknuepfung einschaetzt (#39).
 *
 * Eine persoenliche Einschaetzung, keine Bewertung des Servers: ob die
 * Verknuepfung zur Loesung gehoert, verraet das Spiel nicht.
 */
export type InsightStrength = 1 | 2 | 3;

export const STRENGTH_LABEL: Record<InsightStrength, string> = {
  1: "Schwach",
  2: "Mittel",
  3: "Stark",
};

export const STRENGTHS: InsightStrength[] = [1, 2, 3];

/** Setzt die Staerke; dieselbe Staerke nochmal waehlen nimmt die Bewertung zurueck. */
export function rateInsight(
  ratings: Record<string, InsightStrength>,
  insightId: string,
  strength: InsightStrength
): Record<string, InsightStrength> {
  if (ratings[insightId] === strength) {
    const { [insightId]: _removed, ...rest } = ratings;
    return rest;
  }
  return { ...ratings, [insightId]: strength };
}

/**
 * Stark zuerst, unbewertet zuletzt; bei gleicher Staerke in der Reihenfolge,
 * in der sie aufgedeckt wurden.
 */
export function sortByStrength(
  insights: Insight[],
  ratings: Record<string, InsightStrength>
): Insight[] {
  return insights
    .map((insight, index) => ({ insight, index, strength: ratings[insight.id] ?? 0 }))
    .sort((a, b) => b.strength - a.strength || a.index - b.index)
    .map(({ insight }) => insight);
}

/** Nur gueltige Staerken uebernehmen. */
export function parseRatings(raw: unknown): Record<string, InsightStrength> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, InsightStrength> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === 1 || value === 2 || value === 3) result[id] = value;
  }
  return result;
}
