import type { CollectedEvidence } from "@case-zero/shared";

export type EvidenceKind = CollectedEvidence["kind"];

/** Was in der Akte gerade gefiltert ist (#36). Leer heisst: alles zeigen. */
export interface EvidenceFilter {
  query: string;
  /** Nur diese Arten zeigen. Leere Liste = alle Arten. */
  kinds: EvidenceKind[];
}

export const NO_FILTER: EvidenceFilter = { query: "", kinds: [] };

/** Gross/klein und Umlaut-Schreibweise egal: "Kuendigung" findet "Kündigung" und umgekehrt. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue");
}

/**
 * Filtert die Akte (Story #36).
 *
 * Gesucht wird in allem, was ein Ermittler ueber einen Beweis weiss: Titel,
 * Beschreibung, Fundort und die eigene Notiz. Mehrere Woerter muessen alle
 * vorkommen, egal wo.
 */
export function filterEvidence(
  list: CollectedEvidence[],
  filter: EvidenceFilter,
  notes: Record<string, string> = {}
): CollectedEvidence[] {
  const words = normalize(filter.query).split(/\s+/).filter(Boolean);
  return list.filter((item) => {
    if (filter.kinds.length > 0 && !filter.kinds.includes(item.kind)) return false;
    if (words.length === 0) return true;
    const haystack = normalize(
      [
        item.label,
        item.description,
        item.foundAt.sceneName,
        item.foundAt.hotspotLabel,
        notes[item.id] ?? "",
      ].join(" ")
    );
    return words.every((word) => haystack.includes(word));
  });
}

/** Schaltet eine Art im Filter an oder aus. */
export function toggleKind(filter: EvidenceFilter, kind: EvidenceKind): EvidenceFilter {
  return {
    ...filter,
    kinds: filter.kinds.includes(kind)
      ? filter.kinds.filter((k) => k !== kind)
      : [...filter.kinds, kind],
  };
}
