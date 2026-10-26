import type {
  AccusationSubmission,
  AccusationVerdict,
  CaseDefinition,
  Scenario,
  VerdictFinding,
} from "@case-zero/shared";
import { scoreAccusation } from "./score.js";

/**
 * Alle Beweise eines Falls mit ihrem Anzeigenamen — aus dem Tatort und aus den
 * Geraeten. Nachrichten heissen wie in der Akte (web/src/lib/digitalTrace.ts),
 * ergaenzt um den Zeitstempel, damit zwei Nachrichten derselben Person
 * unterscheidbar bleiben.
 */
export function evidenceLabels(caseDef: CaseDefinition): Map<string, string> {
  const labels = new Map<string, string>();
  for (const scene of caseDef.scenes) {
    for (const hotspot of scene.hotspots) {
      if (hotspot.evidence) labels.set(hotspot.evidence.id, hotspot.evidence.label);
    }
  }
  for (const device of caseDef.devices ?? []) {
    for (const message of device.messages) {
      labels.set(message.id, `Nachricht von ${message.sender} (${message.sentAt})`);
    }
  }
  return labels;
}

/**
 * Vergleicht eine Anklage mit dem aktiven Szenario (Story #28).
 *
 * Geloest ist der Fall, wenn der Taeter stimmt und mindestens ein angehaengter
 * Beweis die Loesung traegt — ein richtiger Name ohne Begruendung ist geraten.
 */
export function judgeAccusation(
  caseDef: CaseDefinition,
  scenario: Scenario,
  submission: AccusationSubmission,
  /** Minuten seit Beginn der Session (#54); `null`, wenn unbekannt. */
  elapsedMinutes: number | null = null
): AccusationVerdict {
  const labels = evidenceLabels(caseDef);
  const label = (id: string) => labels.get(id) ?? id;
  const nameOf = (id: string) => caseDef.suspects.find((s) => s.id === id)?.name ?? id;
  const key = new Set(scenario.keyEvidenceIds);

  const findings: VerdictFinding[] = [];

  const rightSuspect = submission.suspectId === scenario.suspectId;
  findings.push({
    topic: "suspect",
    correct: rightSuspect,
    text: rightSuspect
      ? `Richtig angeklagt: ${nameOf(submission.suspectId)} hat die Tat begangen.`
      : `${nameOf(submission.suspectId)} war es nicht — die Tat beging ${nameOf(scenario.suspectId)}.`,
  });

  for (const id of submission.evidenceIds) {
    findings.push({
      topic: "evidence",
      correct: key.has(id),
      text: key.has(id)
        ? `${label(id)} stuetzt die Loesung.`
        : `${label(id)} traegt nichts zur Loesung bei.`,
    });
  }

  for (const id of scenario.keyEvidenceIds) {
    if (!submission.evidenceIds.includes(id)) {
      findings.push({ topic: "missed", correct: false, text: `Uebersehen: ${label(id)}.` });
    }
  }

  const supported = submission.evidenceIds.some((id) => key.has(id));
  return {
    solved: rightSuspect && supported,
    culprit: { id: scenario.suspectId, name: nameOf(scenario.suspectId) },
    resolution: scenario.resolution,
    findings,
    score: scoreAccusation(scenario, submission, elapsedMinutes),
  };
}
