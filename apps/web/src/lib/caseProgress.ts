import type { CollectedEvidence } from "@case-zero/shared";

/**
 * Der Ermittlungsfortschritt einer Person in einer Team-Session.
 *
 * Story #12 verlangt, dass eine Notiz ein Neuladen ueberlebt. Eine Notiz ohne
 * den zugehoerigen Beweis waere wertlos, deshalb wird der ganze Fortschritt
 * gesichert, nicht nur der Notiztext.
 */
export interface CaseProgress {
  investigatedIds: string[];
  collected: CollectedEvidence[];
  /** Beweis-ID -> Notiztext. */
  notes: Record<string, string>;
}

export const EMPTY_PROGRESS: CaseProgress = {
  investigatedIds: [],
  collected: [],
  notes: {},
};

/**
 * Nur das, was wir zum Lesen und Schreiben brauchen.
 *
 * Als Parameter, damit die Funktionen ohne Browser testbar sind — und damit
 * ein spaeterer Umzug auf den Server (siehe unten) nur diese Datei trifft.
 */
export interface ProgressStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Wo der Fortschritt liegt: im localStorage des Browsers, pro Team-Code.
 *
 * Bewusste MVP-Entscheidung, mit zwei bekannten Grenzen:
 *   1. Der Fortschritt haengt am Geraet. Wer den Browser wechselt, faengt neu an.
 *   2. Er ist privat. Das Team sieht ihn nicht.
 *
 * Grenze 2 ist fuer #12 richtig — eine Notiz ist eine persoenliche Ueberlegung.
 * Sobald #23 ("Fund mit dem Team teilen") kommt, zieht der geteilte Teil in den
 * Room-State auf dem Server; diese Datei bleibt dann fuer das Private zustaendig.
 */
function storageKey(roomCode: string): string {
  return `case-zero:progress:${roomCode}`;
}

/** Faengt alles ab, was kaputt sein kann: gesperrter Storage, kaputtes JSON, fremde Daten. */
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

/** Leerer oder reiner Leerzeichen-Text loescht die Notiz, statt sie leer zu speichern. */
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
