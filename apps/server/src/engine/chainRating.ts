import type { AccusationSubmission, CaseDefinition, ChainRating, Scenario } from "@case-zero/shared";

/** IDs aller digitalen Spuren eines Falls: Nachrichten, auch gelöschte (#21, #71). */
function digitalIds(caseDef: CaseDefinition): Set<string> {
  const ids = new Set<string>();
  for (const device of caseDef.devices ?? []) {
    for (const message of [...device.messages, ...(device.deletedMessages ?? [])]) ids.add(message.id);
  }
  return ids;
}

/**
 * Story #78 — die Beweiskette bewerten, damit man lernt, wo die Begründung
 * schwach war.
 *
 * Grundlage ist dasselbe wie in der Auflösung (#28): `keyEvidenceIds` des
 * aktiven Szenarios. Berechnet wird nur auf dem Server und erst nach dem
 * Absenden — vorher wäre die Bewertung ein Hinweis auf die Lösung.
 *
 *   stark:   richtiger Täter, mindestens 60 % der tragenden Beweise, und
 *            höchstens die Hälfte der Anhänge ohne Bezug
 *   mittel:  richtiger Täter und mindestens 30 % der tragenden Beweise
 *   schwach: alles andere, insbesondere ein falscher Täter
 */
export function rateChain(
  caseDef: CaseDefinition,
  scenario: Scenario,
  submission: AccusationSubmission
): ChainRating {
  const key = new Set(scenario.keyEvidenceIds);
  const supporting = submission.evidenceIds.filter((id) => key.has(id)).length;
  const irrelevant = submission.evidenceIds.length - supporting;
  const possible = key.size;
  const coverage = possible === 0 ? 0 : supporting / possible;
  const precision = submission.evidenceIds.length === 0 ? 0 : supporting / submission.evidenceIds.length;
  const rightSuspect = submission.suspectId === scenario.suspectId;

  const level: ChainRating["level"] = !rightSuspect
    ? "schwach"
    : coverage >= 0.6 && precision >= 0.5
      ? "stark"
      : coverage >= 0.3
        ? "mittel"
        : "schwach";

  const weaknesses: string[] = [];
  if (!rightSuspect) {
    weaknesses.push("Die Beweise wurden gegen die falsche Person verwendet. Prüfe, wen die Spuren wirklich belasten.");
  }
  if (possible - supporting > 0) {
    weaknesses.push(
      `${possible - supporting} von ${possible} tragenden Beweisen fehlen in der Anklage — siehe «Übersehen».`
    );
  }
  if (irrelevant > 0) {
    weaknesses.push(
      `${irrelevant} ${irrelevant === 1 ? "angehängter Beweis trägt" : "angehängte Beweise tragen"} nichts bei und ${irrelevant === 1 ? "verwässert" : "verwässern"} die Begründung.`
    );
  }
  const digital = digitalIds(caseDef);
  const keyDigital = scenario.keyEvidenceIds.filter((id) => digital.has(id));
  const keyPhysical = scenario.keyEvidenceIds.filter((id) => !digital.has(id));
  if (keyDigital.length > 0 && !submission.evidenceIds.some((id) => keyDigital.includes(id))) {
    weaknesses.push("Keine tragende digitale Spur: Nachrichten auf den Geräten hätten die Kette gestützt.");
  }
  if (keyPhysical.length > 0 && !submission.evidenceIds.some((id) => keyPhysical.includes(id))) {
    weaknesses.push("Kein tragender Fund aus dem Tatort: Die Spuren vor Ort fehlen in der Begründung.");
  }

  const summary =
    level === "stark"
      ? "Starke Beweiskette: Die Anklage stützt sich auf die entscheidenden Spuren."
      : level === "mittel"
        ? "Tragfähig, aber lückenhaft: Ein Gericht hätte Fragen."
        : rightSuspect
          ? "Schwache Beweiskette: Der Name stimmt, die Begründung trägt kaum."
          : "Die Beweiskette hält nicht: Sie führt zur falschen Person.";

  return { level, supporting, possible, irrelevant, summary, weaknesses };
}
