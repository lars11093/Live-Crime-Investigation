import type { AccusationReceipt } from "@case-zero/shared";

/**
 * Der Entwurf einer Anklage, solange sie noch nicht abgesendet ist.
 *
 * Liegt im persönlichen Fortschritt (caseProgress.ts): die Auswahl des
 * Täters (#25) und die angehängten Beweise (#26) sollen ein Neuladen
 * überleben, genau wie Notizen.
 */
export interface AccusationDraft {
  /** Der als Täter ausgewählte Verdächtige (#25). */
  suspectId: string | null;
  /** IDs der angehängten Beweise aus der Akte (#26), in Anhänge-Reihenfolge. */
  evidenceIds: string[];
  /**
   * Die Quittung des Servers, sobald die Anklage abgesendet ist (#27).
   * Ab dann ist der Entwurf gesperrt.
   */
  receipt?: AccusationReceipt;
}

export const EMPTY_ACCUSATION: AccusationDraft = { suspectId: null, evidenceIds: [] };

/** Ist die Anklage abgesendet, lässt sie sich nicht mehr ändern (#27). */
export function isSubmitted(draft: AccusationDraft): boolean {
  return Boolean(draft.receipt);
}

/** Wählt den Täter — nur solange nicht abgesendet ist (#25, #27). */
export function chooseSuspect(draft: AccusationDraft, suspectId: string): AccusationDraft {
  if (isSubmitted(draft) || draft.suspectId === suspectId) return draft;
  return { ...draft, suspectId };
}

/**
 * Hebt die Täterauswahl auf (#51) — nur solange nicht abgesendet ist.
 * Die angehängten Beweise bleiben: sie begründen oft auch die nächste Wahl.
 */
export function clearSuspect(draft: AccusationDraft): AccusationDraft {
  if (isSubmitted(draft) || draft.suspectId === null) return draft;
  return { ...draft, suspectId: null };
}

/**
 * Klick auf "Als Täter auswählen" in der Liste (#25, #51): wählt die
 * Person, ein zweiter Klick auf dieselbe Person hebt die Auswahl wieder auf.
 */
export function toggleSuspect(draft: AccusationDraft, suspectId: string): AccusationDraft {
  return draft.suspectId === suspectId ? clearSuspect(draft) : chooseSuspect(draft, suspectId);
}

/** Hängt einen Beweis an — jeder nur einmal (#26). */
export function attachEvidence(draft: AccusationDraft, evidenceId: string): AccusationDraft {
  if (isSubmitted(draft) || draft.evidenceIds.includes(evidenceId)) return draft;
  return { ...draft, evidenceIds: [...draft.evidenceIds, evidenceId] };
}

/** Nimmt einen angehängten Beweis wieder weg (#26). */
export function detachEvidence(draft: AccusationDraft, evidenceId: string): AccusationDraft {
  if (isSubmitted(draft) || !draft.evidenceIds.includes(evidenceId)) return draft;
  return { ...draft, evidenceIds: draft.evidenceIds.filter((id) => id !== evidenceId) };
}

/**
 * Was der Anklage noch fehlt, damit sie vollständig ist.
 *
 * Leere Liste heisst: vollständig. Die Texte erscheinen so im UI.
 */
export function missingForAccusation(draft: AccusationDraft): string[] {
  const missing: string[] = [];
  if (!draft.suspectId) missing.push("Wähle einen Verdächtigen als Täter aus.");
  if (draft.evidenceIds.length === 0) missing.push("Mindestens ein Beweis muss angehängt werden.");
  return missing;
}

/** Liest einen gespeicherten Entwurf robust ein — fremde oder kaputte Daten werden leer. */
export function parseAccusation(raw: unknown): AccusationDraft {
  if (!raw || typeof raw !== "object") return EMPTY_ACCUSATION;
  const { suspectId, evidenceIds, receipt } = raw as Partial<AccusationDraft>;
  const draft: AccusationDraft = {
    suspectId: typeof suspectId === "string" ? suspectId : null,
    evidenceIds: Array.isArray(evidenceIds)
      ? evidenceIds.filter((id): id is string => typeof id === "string")
      : [],
  };
  // Ohne Auflösung (#28) ist die Quittung unvollständig — etwa aus einem
  // Stand vor #28. Dann fällt sie weg; beim erneuten Absenden liefert der
  // Server mit 409 die vollständige Quittung nach.
  if (
    receipt &&
    typeof receipt === "object" &&
    typeof receipt.submittedAt === "string" &&
    receipt.verdict &&
    typeof receipt.verdict === "object"
  ) {
    draft.receipt = receipt;
  }
  return draft;
}
