/**
 * Der Entwurf einer Anklage, solange sie noch nicht abgesendet ist.
 *
 * Liegt im persoenlichen Fortschritt (caseProgress.ts): die Auswahl des
 * Taeters (#25) und die angehaengten Beweise (#26) sollen ein Neuladen
 * ueberleben, genau wie Notizen.
 */
export interface AccusationDraft {
  /** Der als Taeter ausgewaehlte Verdaechtige (#25). */
  suspectId: string | null;
  /** IDs der angehaengten Beweise aus der Akte (#26), in Anhaenge-Reihenfolge. */
  evidenceIds: string[];
}

export const EMPTY_ACCUSATION: AccusationDraft = { suspectId: null, evidenceIds: [] };

/** Haengt einen Beweis an — jeder nur einmal (#26). */
export function attachEvidence(draft: AccusationDraft, evidenceId: string): AccusationDraft {
  if (draft.evidenceIds.includes(evidenceId)) return draft;
  return { ...draft, evidenceIds: [...draft.evidenceIds, evidenceId] };
}

/** Nimmt einen angehaengten Beweis wieder weg (#26). */
export function detachEvidence(draft: AccusationDraft, evidenceId: string): AccusationDraft {
  if (!draft.evidenceIds.includes(evidenceId)) return draft;
  return { ...draft, evidenceIds: draft.evidenceIds.filter((id) => id !== evidenceId) };
}

/**
 * Was der Anklage noch fehlt, damit sie vollstaendig ist.
 *
 * Leere Liste heisst: vollstaendig. Die Texte erscheinen so im UI.
 */
export function missingForAccusation(draft: AccusationDraft): string[] {
  const missing: string[] = [];
  if (!draft.suspectId) missing.push("Waehle einen Verdaechtigen als Taeter aus.");
  if (draft.evidenceIds.length === 0) missing.push("Mindestens ein Beweis muss angehaengt werden.");
  return missing;
}

/** Liest einen gespeicherten Entwurf robust ein — fremde oder kaputte Daten werden leer. */
export function parseAccusation(raw: unknown): AccusationDraft {
  if (!raw || typeof raw !== "object") return EMPTY_ACCUSATION;
  const { suspectId, evidenceIds } = raw as Partial<AccusationDraft>;
  return {
    suspectId: typeof suspectId === "string" ? suspectId : null,
    evidenceIds: Array.isArray(evidenceIds)
      ? evidenceIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}
