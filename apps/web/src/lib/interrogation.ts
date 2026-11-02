import type { InterrogationQuestion, Suspect } from "@case-zero/shared";
import type { ProgressStorage } from "./caseProgress";

/** Verdaechtigen-ID -> gestellte Fragen in der Reihenfolge der Befragung (#66). */
export type InterrogationLog = Record<string, string[]>;

/**
 * Story #66 — eine Befragung starten und gezielt nachhaken.
 *
 * Gemerkt wird nur, welche Fragen in welcher Reihenfolge gestellt wurden; die
 * Antworten stehen im Fall. Eigener localStorage-Schluessel pro Team-Code.
 */
function storageKey(roomCode: string): string {
  return `case-zero:interrogation:${roomCode}`;
}

export function loadInterrogations(storage: ProgressStorage, roomCode: string): InterrogationLog {
  try {
    const parsed = JSON.parse(storage.getItem(storageKey(roomCode)) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const result: InterrogationLog = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(value)) result[id] = value.filter((q): q is string => typeof q === "string");
    }
    return result;
  } catch {
    return {};
  }
}

export function saveInterrogations(storage: ProgressStorage, roomCode: string, log: InterrogationLog): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(log));
  } catch {
    // Gesperrter Storage: dann gilt die Befragung nur bis zum Neuladen.
  }
}

/** Stellt eine Frage. Jede Frage nur einmal, unbekannte gar nicht. */
export function askQuestion(log: InterrogationLog, suspect: Suspect, questionId: string): InterrogationLog {
  const asked = log[suspect.id] ?? [];
  const known = suspect.interrogation?.some((q) => q.id === questionId);
  if (!known || asked.includes(questionId)) return log;
  return { ...log, [suspect.id]: [...asked, questionId] };
}

/** Das bisherige Gespraech: gestellte Fragen mit Antwort, in Reihenfolge. */
export function transcript(log: InterrogationLog, suspect: Suspect): InterrogationQuestion[] {
  const byId = new Map((suspect.interrogation ?? []).map((q) => [q.id, q]));
  return (log[suspect.id] ?? []).flatMap((id) => byId.get(id) ?? []);
}

/** Fragen, die noch gestellt werden koennen. */
export function openQuestions(log: InterrogationLog, suspect: Suspect): InterrogationQuestion[] {
  const asked = new Set(log[suspect.id] ?? []);
  return (suspect.interrogation ?? []).filter((q) => !asked.has(q.id));
}
