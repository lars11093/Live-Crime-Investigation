import type { CollectedEvidence, Insight } from "@case-zero/shared";

/**
 * Der Ermittlungsfortschritt einer Person in einer Team-Session.
 *
 * Story #12 verlangt, dass eine Notiz ein Neuladen überlebt. Eine Notiz ohne
 * den zugehörigen Beweis wäre wertlos, deshalb wird der ganze Fortschritt
 * gesichert, nicht nur der Notiztext.
 */
export interface CaseProgress {
  investigatedIds: string[];
  collected: CollectedEvidence[];
  /** Beweis-ID -> Notiztext. */
  notes: Record<string, string>;
  /** Bereits aufgedeckte Verknüpfungen (#13). */
  insights: Insight[];
  /** Als widersprüchlich markierte Sätze aus Aussagen (#17). */
  contradictions: Contradiction[];
  /** Als relevant markierte Chatnachrichten (#19), per Nachrichten-ID. */
  markedMessageIds: string[];
}

/**
 * Ein markierter Widerspruch (#17).
 *
 * Speichert den Satztext mit, nicht nur die Position: ändert sich eine
 * Aussage im Case-JSON, zeigt die Übersicht sonst auf einen anderen Satz.
 */
export interface Contradiction {
  suspectId: string;
  suspectName: string;
  sentenceIndex: number;
  text: string;
}

/** Eindeutiger Schlüssel eines Satzes innerhalb einer Aussage. */
export function contradictionKey(suspectId: string, sentenceIndex: number): string {
  return `${suspectId}:${sentenceIndex}`;
}

/** Markiert einen Satz oder nimmt die Markierung zurück (#17). */
export function toggleContradiction(
  list: Contradiction[],
  entry: Contradiction
): Contradiction[] {
  const key = contradictionKey(entry.suspectId, entry.sentenceIndex);
  const existing = list.find((c) => contradictionKey(c.suspectId, c.sentenceIndex) === key);
  if (existing) {
    return list.filter((c) => contradictionKey(c.suspectId, c.sentenceIndex) !== key);
  }
  return [...list, entry];
}

/** Markiert eine Chatnachricht als relevant oder nimmt die Markierung zurück (#19). */
export function toggleMarkedMessage(ids: string[], messageId: string): string[] {
  return ids.includes(messageId) ? ids.filter((id) => id !== messageId) : [...ids, messageId];
}

/**
 * Legt einen Fund in die Beweisakte, aber nur einmal (#9, #21).
 *
 * Gilt für Funde aus dem Tatort genauso wie für digitale Spuren: doppelt
 * ist doppelt, egal woher der Beweis kommt. Ohne Änderung kommt dieselbe
 * Liste zurück, damit React nicht unnötig neu zeichnet.
 */
export function collectEvidence(
  list: CollectedEvidence[],
  evidence: CollectedEvidence
): CollectedEvidence[] {
  return list.some((e) => e.id === evidence.id) ? list : [...list, evidence];
}

export const EMPTY_PROGRESS: CaseProgress = {
  investigatedIds: [],
  collected: [],
  notes: {},
  insights: [],
  contradictions: [],
  markedMessageIds: [],
};

/**
 * Nur das, was wir zum Lesen und Schreiben brauchen.
 *
 * Als Parameter, damit die Funktionen ohne Browser testbar sind — und damit
 * ein späterer Umzug auf den Server (siehe unten) nur diese Datei trifft.
 */
export interface ProgressStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Wo der Fortschritt liegt: im localStorage des Browsers, pro Team-Code.
 *
 * Bewusste MVP-Entscheidung, mit zwei bekannten Grenzen:
 *   1. Der Fortschritt hängt am Gerät. Wer den Browser wechselt, fängt neu an.
 *   2. Er ist privat. Das Team sieht ihn nicht.
 *
 * Grenze 2 ist für #12 richtig — eine Notiz ist eine persönliche Überlegung.
 * Sobald #23 ("Fund mit dem Team teilen") kommt, zieht der geteilte Teil in den
 * Room-State auf dem Server; diese Datei bleibt dann für das Private zuständig.
 */
function storageKey(roomCode: string): string {
  return `case-zero:progress:${roomCode}`;
}

/** Fängt alles ab, was kaputt sein kann: gesperrter Storage, kaputtes JSON, fremde Daten. */
export function loadProgress(storage: ProgressStorage, roomCode: string): CaseProgress {
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey(roomCode));
  } catch {
    // Privater Modus oder blockierte Site-Daten — dann eben ohne Fortschritt.
    return EMPTY_PROGRESS;
  }
  if (!raw) return EMPTY_PROGRESS;

  try {
    const parsed = JSON.parse(raw) as Partial<CaseProgress>;
    return {
      investigatedIds: Array.isArray(parsed.investigatedIds) ? parsed.investigatedIds : [],
      collected: Array.isArray(parsed.collected) ? parsed.collected : [],
      notes:
        parsed.notes && typeof parsed.notes === "object" && !Array.isArray(parsed.notes)
          ? parsed.notes
          : {},
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      contradictions: Array.isArray(parsed.contradictions) ? parsed.contradictions : [],
      markedMessageIds: Array.isArray(parsed.markedMessageIds) ? parsed.markedMessageIds : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(
  storage: ProgressStorage,
  roomCode: string,
  progress: CaseProgress
): void {
  try {
    storage.setItem(storageKey(roomCode), JSON.stringify(progress));
  } catch {
    // Voller oder gesperrter Storage darf das Spiel nicht anhalten.
  }
}

/** Leerer oder reiner Leerzeichen-Text löscht die Notiz, statt sie leer zu speichern. */
export function setNote(
  notes: CaseProgress["notes"],
  evidenceId: string,
  text: string
): CaseProgress["notes"] {
  const trimmed = text.trim();
  if (!trimmed) {
    const { [evidenceId]: _removed, ...rest } = notes;
    return rest;
  }
  return { ...notes, [evidenceId]: trimmed };
}

/** Der Browser-Storage, sofern es ihn gibt. */
export function browserStorage(): ProgressStorage {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    // Zugriff kann schon beim Lesen der Variable werfen.
  }
  return { getItem: () => null, setItem: () => {} };
}
