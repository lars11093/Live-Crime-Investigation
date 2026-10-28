import type { AccusationReceipt } from "@case-zero/shared";

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
  /**
   * Die Quittung des Servers, sobald die Anklage abgesendet ist (#27).
   * Ab dann ist der Entwurf gesperrt.
   */
  receipt?: AccusationReceipt;
}

export const EMPTY_ACCUSATION: AccusationDraft = { suspectId: null, evidenceIds: [] };

/** Ist die Anklage abgesendet, laesst sie sich nicht mehr aendern (#27). */
export function isSubmitted(draft: AccusationDraft): boolean {
  return Boolean(draft.receipt);
}

/** Waehlt den Taeter — nur solange nicht abgesendet ist (#25, #27). */
export function chooseSuspect(draft: AccusationDraft, suspectId: string): AccusationDraft {
  if (isSubmitted(draft) || draft.suspectId === suspectId) return draft;
  return { ...draft, suspectId };
}

/** Haengt einen Beweis an — jeder nur einmal (#26). */
export function attachEvidence(draft: AccusationDraft, evidenceId: string): AccusationDraft {
  if (isSubmitted(draft) || draft.evidenceIds.includes(evidenceId)) return draft;
  return { ...draft, evidenceIds: [...draft.evidenceIds, evidenceId] };
}

/** Nimmt einen angehaengten Beweis wieder weg (#26). */
export function detachEvidence(draft: AccusationDraft, evidenceId: string): AccusationDraft {
  if (isSubmitted(draft) || !draft.evidenceIds.includes(evidenceId)) return draft;
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
  const { suspectId, evidenceIds, receipt } = raw as Partial<AccusationDraft>;
  const draft: AccusationDraft = {
    suspectId: typeof suspectId === "string" ? suspectId : null,
    evidenceIds: Array.isArray(evidenceIds)
      ? evidenceIds.filter((id): id is string => typeof id === "string")
      : [],
  };
  // Ohne Aufloesung (#28) ist die Quittung unvollstaendig — etwa aus einem
  // Stand vor #28. Dann faellt sie weg; beim erneuten Absenden liefert der
  // Server mit 409 die vollstaendige Quittung nach.
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
