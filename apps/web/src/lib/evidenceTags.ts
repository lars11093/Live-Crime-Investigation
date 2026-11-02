import type { CollectedEvidence } from "@case-zero/shared";
import type { ProgressStorage } from "./caseProgress";

/** Beweis-ID -> eigene Tags (#62). */
export type EvidenceTags = Record<string, string[]>;

export const TAG_MAX_LENGTH = 20;

/**
 * Story #62 — eigene Tags an Beweisen.
 *
 * Wie die Notizen eine persoenliche Ordnung, also im Browser pro Team-Code.
 * Eigener Schluessel, damit `CaseProgress` unveraendert bleibt.
 */
function storageKey(roomCode: string): string {
  return `case-zero:tags:${roomCode}`;
}

export function loadTags(storage: ProgressStorage, roomCode: string): EvidenceTags {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey(roomCode)) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: EvidenceTags = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        const tags = value.filter((t): t is string => typeof t === "string" && t.length > 0);
        if (tags.length > 0) result[id] = tags;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function saveTags(storage: ProgressStorage, roomCode: string, tags: EvidenceTags): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(tags));
  } catch {
    // Gesperrter Storage: dann gelten die Tags nur bis zum Neuladen.
  }
}

/** Kleingeschrieben, ohne Rand-Leerzeichen und ohne fuehrendes "#". */
export function normalizeTag(input: string): string {
  return input.trim().replace(/^#+/, "").replace(/\s+/g, " ").toLowerCase().slice(0, TAG_MAX_LENGTH);
}

/** Fuegt einen Tag hinzu; leer oder doppelt aendert nichts. */
export function addTag(tags: EvidenceTags, evidenceId: string, input: string): EvidenceTags {
  const tag = normalizeTag(input);
  const current = tags[evidenceId] ?? [];
  if (!tag || current.includes(tag)) return tags;
  return { ...tags, [evidenceId]: [...current, tag] };
}

export function removeTag(tags: EvidenceTags, evidenceId: string, tag: string): EvidenceTags {
  const rest = (tags[evidenceId] ?? []).filter((t) => t !== tag);
  if (rest.length > 0) return { ...tags, [evidenceId]: rest };
  const { [evidenceId]: _removed, ...others } = tags;
  return others;
}

/** Alle vergebenen Tags, alphabetisch — fuer die Filterleiste. */
export function allTags(tags: EvidenceTags): string[] {
  return [...new Set(Object.values(tags).flat())].sort((a, b) => a.localeCompare(b, "de"));
}

/** Nur Beweise mit dem gewaehlten Tag; ohne Auswahl alle. */
export function filterByTag(
  evidence: CollectedEvidence[],
  tags: EvidenceTags,
  tag: string | null
): CollectedEvidence[] {
  return tag ? evidence.filter((e) => tags[e.id]?.includes(tag)) : evidence;
}
