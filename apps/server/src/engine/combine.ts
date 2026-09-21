import type { CaseDefinition, CombineResult } from "@case-zero/shared";

/**
 * Prueft, ob zwei Beweise zusammengehoeren (Story #13).
 *
 * Laeuft auf dem Server, weil die Kombinationsliste die Loesung verraet —
 * siehe caseView.ts. Der Client schickt zwei IDs und bekommt entweder die
 * Erkenntnis oder eine Absage, aber nie die Liste der Moeglichkeiten.
 */
export function combineEvidence(
  caseDef: CaseDefinition,
  aId: string,
  bId: string,
  alreadyFoundInsightIds: readonly string[] = []
): CombineResult {
  if (!aId || !bId || aId === bId) {
    return { ok: false, reason: "invalid" };
  }

  const match = caseDef.combinations.find(
    (c) =>
      // Reihenfolge egal: A+B ist dasselbe Paar wie B+A.
      (c.evidenceIds[0] === aId && c.evidenceIds[1] === bId) ||
      (c.evidenceIds[0] === bId && c.evidenceIds[1] === aId)
  );

  if (!match) {
    return { ok: false, reason: "no-connection" };
  }
  if (alreadyFoundInsightIds.includes(match.insight.id)) {
    return { ok: false, reason: "already-found" };
  }
  return { ok: true, insight: match.insight };
}
