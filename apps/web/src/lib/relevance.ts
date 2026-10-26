import type { CollectedEvidence } from "@case-zero/shared";

/** Wie wichtig eine digitale Spur fuer die Ermittlung ist (Story #47). */
export type Relevance = "hoch" | "mittel" | "niedrig";

export const RELEVANCE_LEVELS: Relevance[] = ["hoch", "mittel", "niedrig"];

export const RELEVANCE_LABEL: Record<Relevance, string> = {
  hoch: "Wichtig",
  mittel: "Mittel",
  niedrig: "Nebensaechlich",
};

/**
 * Ist das eine digitale Spur, also von einem Geraet gesichert (#21)?
 *
 * Neue Eintraege tragen `source: "device"`. Aeltere Spielstaende haben das
 * Feld nicht — dort erkennt man die Spur am Fundort "Chat · …", den
 * `messageToEvidence` seit #21 setzt.
 */
export function isDigitalTrace(evidence: CollectedEvidence): boolean {
  return evidence.source === "device" || evidence.foundAt.hotspotLabel.startsWith("Chat ·");
}

/** Setzt die Relevanz; dieselbe Stufe nochmal waehlen nimmt sie zurueck. */
export function setRelevance(
  ratings: Record<string, Relevance>,
  evidenceId: string,
  relevance: Relevance
): Record<string, Relevance> {
  if (ratings[evidenceId] === relevance) {
    const { [evidenceId]: _removed, ...rest } = ratings;
    return rest;
  }
  return { ...ratings, [evidenceId]: relevance };
}

/** Wie viele Spuren pro Stufe — fuer die Kopfzeile im Chatverlauf. */
export function countByRelevance(
  ids: string[],
  ratings: Record<string, Relevance>
): Record<Relevance | "offen", number> {
  const counts = { hoch: 0, mittel: 0, niedrig: 0, offen: 0 };
  for (const id of ids) counts[ratings[id] ?? "offen"] += 1;
  return counts;
}

export function parseRelevance(raw: unknown): Record<string, Relevance> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, Relevance> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === "hoch" || value === "mittel" || value === "niedrig") result[id] = value;
  }
  return result;
}
