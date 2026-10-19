import type { CaseDefinition, CombineResult } from "@case-zero/shared";

/**
 * Prüft, ob zwei Beweise zusammengehören (Story #13).
 *
 * Läuft auf dem Server, weil die Kombinationsliste die Lösung verrät —
 * siehe caseView.ts. Der Client schickt zwei IDs und bekommt entweder die
 * Erkenntnis oder eine Absage, aber nie die Liste der Möglichkeiten.
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
