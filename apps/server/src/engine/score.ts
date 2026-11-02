import type { AccusationScore, AccusationSubmission, Scenario } from "@case-zero/shared";

/**
 * Punkteregeln (Story #54). Als Konstanten an einer Stelle, damit das Team
 * sie im Review abstimmen kann, ohne die Rechnung zu lesen.
 */
export const POINTS = {
  rightSuspect: 500,
  perKeyEvidence: 100,
  perUselessEvidence: -25,
  fullChain: 150,
  fastUnder30: 100,
  fastUnder60: 50,
} as const;

/** Wie die Punktzahl einzuordnen ist — ab Anteil an der Höchstpunktzahl. */
const RANKS: { from: number; label: string }[] = [
  { from: 0.9, label: "Meisterhafte Ermittlung" },
  { from: 0.6, label: "Solide Ermittlung" },
  { from: 0.3, label: "Lückenhafte Ermittlung" },
  { from: 0, label: "Fehlermittlung" },
];

/**
 * Berechnet die Punktzahl einer Anklage (Story #54).
 *
 * - Richtiger Täter: der Grossteil der Punkte.
 * - Jeder Beweis, der die Lösung trägt (#28), zählt; jeder, der nichts
 *   beiträgt, kostet ein wenig — Raten mit allem, was in der Akte liegt,
 *   soll sich nicht lohnen.
 * - Bonus für die vollständige Beweiskette und für Tempo.
 *
 * Nie unter 0: auch eine Fehlermittlung ist eine Ermittlung.
 */
export function scoreAccusation(
  scenario: Scenario,
  submission: AccusationSubmission,
  elapsedMinutes: number | null
): AccusationScore {
  const key = new Set(scenario.keyEvidenceIds);
  const useful = submission.evidenceIds.filter((id) => key.has(id)).length;
  const useless = submission.evidenceIds.length - useful;
  const rightSuspect = submission.suspectId === scenario.suspectId;

  const breakdown: AccusationScore["breakdown"] = [];
  if (rightSuspect) breakdown.push({ label: "Richtiger Täter", points: POINTS.rightSuspect });
  if (useful > 0) {
    breakdown.push({
      label: `${useful} tragende${useful === 1 ? "r Beweis" : " Beweise"}`,
      points: useful * POINTS.perKeyEvidence,
    });
  }
  if (useless > 0) {
    breakdown.push({
      label: `${useless} Beweis${useless === 1 ? "" : "e"} ohne Bezug zur Lösung`,
      points: useless * POINTS.perUselessEvidence,
    });
  }
  if (rightSuspect && useful === key.size && key.size > 0) {
    breakdown.push({ label: "Vollständige Beweiskette", points: POINTS.fullChain });
  }
  // Tempo zählt nur, wenn die Anklage auch stimmt — sonst lohnt sich schnelles Raten.
  if (rightSuspect && elapsedMinutes !== null) {
    if (elapsedMinutes < 30) breakdown.push({ label: "Schnell gelöst (< 30 Min.)", points: POINTS.fastUnder30 });
    else if (elapsedMinutes < 60) breakdown.push({ label: "Zügig gelöst (< 60 Min.)", points: POINTS.fastUnder60 });
  }

  const points = Math.max(0, breakdown.reduce((sum, item) => sum + item.points, 0));
  const maxPoints =
    POINTS.rightSuspect + key.size * POINTS.perKeyEvidence + POINTS.fullChain + POINTS.fastUnder30;
  const share = maxPoints === 0 ? 0 : points / maxPoints;
  const rank = RANKS.find((r) => share >= r.from)?.label ?? RANKS[RANKS.length - 1].label;

  return { points, maxPoints, rank, breakdown };
}
