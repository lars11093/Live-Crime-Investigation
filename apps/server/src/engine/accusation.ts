import type {
  AccusationReceipt,
  AccusationSubmission,
  CaseDefinition,
  SubmitAccusationResult,
} from "@case-zero/shared";
import type { Room } from "./rooms.js";
import { judgeAccusation } from "./verdict.js";

/**
 * Prueft eine Anklage, bevor der Server sie annimmt (Story #27).
 *
 * Der Client prueft dasselbe schon vor dem Absenden — hier steht es trotzdem,
 * weil die Regel "Taeter und mindestens ein Beweis" sonst mit einem
 * handgebauten Request umgangen werden koennte.
 */
export function validateSubmission(
  caseDef: CaseDefinition,
  raw: unknown
): { ok: true; submission: AccusationSubmission } | { ok: false; message: string } {
  const { suspectId, evidenceIds } = (raw ?? {}) as Partial<AccusationSubmission>;
  if (typeof suspectId !== "string" || !caseDef.suspects.some((s) => s.id === suspectId)) {
    return { ok: false, message: "Unbekannter oder fehlender Taeter." };
  }
  if (!Array.isArray(evidenceIds)) {
    return { ok: false, message: "Mindestens ein Beweis muss angehaengt werden." };
  }
  // Doppelte und nicht-textuelle IDs fallen raus, statt die Anklage abzulehnen.
  const ids = [...new Set(evidenceIds.filter((id): id is string => typeof id === "string"))];
  if (ids.length === 0) {
    return { ok: false, message: "Mindestens ein Beweis muss angehaengt werden." };
  }
  return { ok: true, submission: { suspectId, evidenceIds: ids } };
}

/**
 * Nimmt die Anklage einer Team-Session an — genau einmal (Story #27).
 *
 * Danach ist sie gesperrt: ein zweiter Versuch bekommt die erste Quittung
 * zurueck, damit auch ein Teammitglied mit veraltetem Stand sieht, was
 * abgesendet wurde.
 */
export function submitAccusation(
  room: Room,
  raw: unknown,
  now: Date = new Date()
): SubmitAccusationResult {
  if (room.accusation) {
    return { ok: false, reason: "already-submitted", receipt: room.accusation };
  }
  const checked = validateSubmission(room.caseDef, raw);
  if (!checked.ok) {
    return { ok: false, reason: "invalid", message: checked.message };
  }
  const receipt: AccusationReceipt = {
    ...checked.submission,
    submittedAt: now.toISOString(),
    // Die Aufloesung haengt an der Quittung (#28): berechnet genau dann, wenn
    // die Anklage gesperrt ist, und nie davor.
    verdict: judgeAccusation(
      room.caseDef,
      room.scenario,
      checked.submission,
      (now.getTime() - room.createdAt.getTime()) / 60000
    ),
  };
  room.accusation = receipt;
  return { ok: true, receipt };
}
