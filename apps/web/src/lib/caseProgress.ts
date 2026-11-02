import type { CollectedEvidence, Insight } from "@case-zero/shared";
import { EMPTY_ACCUSATION, parseAccusation, type AccusationDraft } from "./accusation";
import { parsePhotos, type EvidencePhoto } from "./photos";
import { parseRatings, type InsightStrength } from "./insightRating";
import { parseAlibiVerdicts, type AlibiVerdict } from "./alibi";
import { parseSuspicion, type SuspicionLevel } from "./suspicion";
import { parseRelevance, type Relevance } from "./relevance";

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
  /** Beweis-ID -> ISO-Zeitpunkt der letzten Aenderung der Notiz (#38). */
  noteEditedAt: Record<string, string>;
  /** Bereits aufgedeckte Verknuepfungen (#13). */
  insights: Insight[];
  /** Eigene Einschaetzung, wie stark eine Verknuepfung ist (#39). */
  insightRatings: Record<string, InsightStrength>;
  /** Als widerspruechlich markierte Saetze aus Aussagen (#17). */
  contradictions: Contradiction[];
  /** Als relevant markierte Chatnachrichten (#19), per Nachrichten-ID. */
  markedMessageIds: string[];
  /** Im Forensik-Terminal bereits geoeffnete Geraete (#44). */
  reviewedDeviceIds: string[];
  /** Nachrichten, deren Bild-Metadaten ausgelesen sind (#45). */
  metadataReadIds: string[];
  /** Relevanz digitaler Spuren, pro Beweis-ID (#47). */
  relevance: Record<string, Relevance>;
  /** Eigenes Urteil ueber das Alibi, pro Verdaechtigem (#42). */
  alibiVerdicts: Record<string, AlibiVerdict>;
  /** Eigener Verdachtsgrad pro Verdaechtigem (#43). */
  suspicion: Record<string, SuspicionLevel>;
  /** Entwurf der Anklage: Taeter (#25) und angehaengte Beweise (#26). */
  accusation: AccusationDraft;
  /** Tatortfotos der Funde (#35), pro Beweis-ID eins. */
  photos: Record<string, EvidencePhoto>;
}

/**
 * Ein markierter Widerspruch (#17).
 *
 * Speichert den Satztext mit, nicht nur die Position: aendert sich eine
 * Aussage im Case-JSON, zeigt die Uebersicht sonst auf einen anderen Satz.
 */
export interface Contradiction {
  suspectId: string;
  suspectName: string;
  sentenceIndex: number;
  text: string;
}

/** Eindeutiger Schluessel eines Satzes innerhalb einer Aussage. */
export function contradictionKey(suspectId: string, sentenceIndex: number): string {
  return `${suspectId}:${sentenceIndex}`;
}

/** Markiert einen Satz oder nimmt die Markierung zurueck (#17). */
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

/**
 * Markiert eine Stelle im Tatort als untersucht oder wieder als offen (#34).
 *
 * Das Oeffnen einer Stelle markiert sie weiterhin automatisch (#8); hier
 * kann der Ermittler die Markierung bewusst setzen oder zuruecknehmen.
 */
export function toggleInvestigated(ids: string[], hotspotId: string): string[] {
  return ids.includes(hotspotId) ? ids.filter((id) => id !== hotspotId) : [...ids, hotspotId];
}

/** Markiert eine Chatnachricht als relevant oder nimmt die Markierung zurueck (#19). */
export function toggleMarkedMessage(ids: string[], messageId: string): string[] {
  return ids.includes(messageId) ? ids.filter((id) => id !== messageId) : [...ids, messageId];
}

/**
 * Legt einen Fund in die Beweisakte, aber nur einmal (#9, #21).
 *
 * Gilt fuer Funde aus dem Tatort genauso wie fuer digitale Spuren: doppelt
 * ist doppelt, egal woher der Beweis kommt. Ohne Aenderung kommt dieselbe
 * Liste zurueck, damit React nicht unnoetig neu zeichnet.
 */
export function collectEvidence(
  list: CollectedEvidence[],
  evidence: CollectedEvidence,
  now: Date = new Date()
): CollectedEvidence[] {
  if (list.some((e) => e.id === evidence.id)) return list;
  // Der Zeitstempel entsteht hier, an einer Stelle fuer Tatort und Geraete (#37).
  return [...list, { ...evidence, collectedAt: evidence.collectedAt ?? now.toISOString() }];
}

export const EMPTY_PROGRESS: CaseProgress = {
  investigatedIds: [],
  collected: [],
  notes: {},
  noteEditedAt: {},
  insights: [],
  insightRatings: {},
  contradictions: [],
  markedMessageIds: [],
  reviewedDeviceIds: [],
  metadataReadIds: [],
  relevance: {},
  alibiVerdicts: {},
  suspicion: {},
  accusation: EMPTY_ACCUSATION,
  photos: {},
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
function storageKey(roomCode: string, accountId?: string): string {
  // Mit Konto (#29) liegt der Stand unter dem Konto; als Gast wie bisher nur
  // unter dem Team-Code, damit bestehende Spielstaende erhalten bleiben.
  return accountId
    ? `case-zero:progress:${accountId}:${roomCode}`
    : `case-zero:progress:${roomCode}`;
}

/** Faengt alles ab, was kaputt sein kann: gesperrter Storage, kaputtes JSON, fremde Daten. */
export function loadProgress(
  storage: ProgressStorage,
  roomCode: string,
  accountId?: string
): CaseProgress {
  let raw: string | null;
  try {
    raw = storage.getItem(storageKey(roomCode, accountId));
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
      noteEditedAt:
        parsed.noteEditedAt &&
        typeof parsed.noteEditedAt === "object" &&
        !Array.isArray(parsed.noteEditedAt)
          ? parsed.noteEditedAt
          : {},
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      insightRatings: parseRatings(parsed.insightRatings),
      contradictions: Array.isArray(parsed.contradictions) ? parsed.contradictions : [],
      markedMessageIds: Array.isArray(parsed.markedMessageIds) ? parsed.markedMessageIds : [],
      reviewedDeviceIds: Array.isArray(parsed.reviewedDeviceIds) ? parsed.reviewedDeviceIds : [],
      metadataReadIds: Array.isArray(parsed.metadataReadIds) ? parsed.metadataReadIds : [],
      relevance: parseRelevance(parsed.relevance),
      alibiVerdicts: parseAlibiVerdicts(parsed.alibiVerdicts),
      suspicion: parseSuspicion(parsed.suspicion),
      accusation: parseAccusation(parsed.accusation),
      photos: parsePhotos(parsed.photos),
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(
  storage: ProgressStorage,
  roomCode: string,
  progress: CaseProgress,
  accountId?: string
): void {
  try {
    storage.setItem(storageKey(roomCode, accountId), JSON.stringify(progress));
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

/**
 * Speichert, aendert oder loescht eine Notiz samt Zeitpunkt (#12, #38).
 *
 * Unveraenderter Text laesst auch den Zeitpunkt stehen — "zuletzt geaendert"
 * soll nicht springen, nur weil jemand ohne Aenderung speichert.
 */
export function saveNote(
  progress: CaseProgress,
  evidenceId: string,
  text: string,
  now: Date = new Date()
): CaseProgress {
  const notes = setNote(progress.notes, evidenceId, text);
  if (notes[evidenceId] === progress.notes[evidenceId]) return progress;
  const { [evidenceId]: _old, ...rest } = progress.noteEditedAt;
  return {
    ...progress,
    notes,
    noteEditedAt: notes[evidenceId] ? { ...rest, [evidenceId]: now.toISOString() } : rest,
  };
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
