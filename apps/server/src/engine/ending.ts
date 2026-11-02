import type { AccusationSubmission, AccusationVerdict, Scenario } from "@case-zero/shared";

/**
 * Story #80 — welches Ende eine Anklage auslöst.
 *
 * Drei Ausgänge: richtig und begründet, richtige Person ohne tragfähige
 * Beweise, oder die falsche Person — dann je nach Person ein eigenes Ende.
 * Weil das Szenario pro Session zufällig ist (rooms.ts), lohnt sich ein
 * zweiter Durchgang (#79): anderer Täter, andere Enden.
 */
export function pickEnding(
  scenario: Scenario,
  submission: AccusationSubmission,
  solved: boolean
): AccusationVerdict["ending"] {
  const find = (when: string) => scenario.endings?.find((e) => e.when === when);
  const pick = (kind: "solved" | "insufficient" | "wrong", when: string) => {
    const ending = find(when);
    return ending ? { kind, title: ending.title, text: ending.text } : undefined;
  };
  if (solved) return pick("solved", "solved");
  if (submission.suspectId === scenario.suspectId) return pick("insufficient", "insufficient");
  return pick("wrong", submission.suspectId);
}
