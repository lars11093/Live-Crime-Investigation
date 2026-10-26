import type { CollectedEvidence, Suspect } from "@case-zero/shared";
import type { AccusationDraft } from "./accusation";
import type { CaseProgress } from "./caseProgress";
import { isDigitalTrace } from "./relevance";
import { SUSPICION_LABEL } from "./suspicion";

/** Wie schwer eine Luecke wiegt (#52). Nur "fehler" verhindert das Absenden. */
export type ReviewLevel = "fehler" | "warnung" | "hinweis";

export interface ReviewFinding {
  level: ReviewLevel;
  text: string;
}

export interface ReviewInput {
  draft: AccusationDraft;
  suspects: Suspect[];
  collected: CollectedEvidence[];
  progress: Pick<
    CaseProgress,
    "alibiVerdicts" | "suspicion" | "contradictions" | "relevance" | "insights"
  >;
}

/**
 * Prueft eine Anklage auf offensichtliche Luecken (Story #52).
 *
 * Bewusst ohne Wissen ueber die Loesung — die kennt nur der Server, und eine
 * Pruefung dagegen waere ein Spoiler. Verglichen wird die Anklage mit der
 * eigenen Ermittlung: Alibi-Urteil (#42), Verdachtsgrad (#43), markierte
 * Widersprueche (#17), Relevanz (#47), aufgedeckte Verknuepfungen (#13).
 */
export function reviewAccusation({ draft, suspects, collected, progress }: ReviewInput): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const suspect = suspects.find((s) => s.id === draft.suspectId);
  const attached = collected.filter((e) => draft.evidenceIds.includes(e.id));

  if (!suspect) findings.push({ level: "fehler", text: "Es ist kein Taeter ausgewaehlt." });
  if (attached.length === 0) {
    findings.push({ level: "fehler", text: "Es ist kein Beweis angehaengt." });
  } else if (attached.length === 1) {
    findings.push({
      level: "warnung",
      text: "Nur ein einziger Beweis — eine Anklage steht besser auf mehreren Spuren.",
    });
  }

  if (suspect) {
    const alibi = progress.alibiVerdicts[suspect.id];
    if (alibi === "haltbar") {
      findings.push({
        level: "warnung",
        text: `Du haeltst das Alibi von ${suspect.name} selbst fuer haltbar.`,
      });
    } else if (!alibi) {
      findings.push({ level: "hinweis", text: `Das Alibi von ${suspect.name} hast du noch nicht geprueft.` });
    }

    const mine = progress.suspicion[suspect.id] ?? 0;
    const stronger = suspects.find((s) => s.id !== suspect.id && (progress.suspicion[s.id] ?? 0) > mine);
    if (stronger) {
      findings.push({
        level: "warnung",
        text: `Deinen hoechsten Verdacht hast du gegen ${stronger.name} (${
          SUSPICION_LABEL[progress.suspicion[stronger.id]!]
        }), nicht gegen ${suspect.name}.`,
      });
    }

    if (suspect.statement && !progress.contradictions.some((c) => c.suspectId === suspect.id)) {
      findings.push({
        level: "hinweis",
        text: `In der Aussage von ${suspect.name} hast du keinen Widerspruch markiert.`,
      });
    }
  }

  const unimportant = attached.filter((e) => progress.relevance[e.id] === "niedrig");
  if (unimportant.length > 0) {
    findings.push({
      level: "warnung",
      text: `Angehaengt, aber von dir als nebensaechlich bewertet: ${unimportant.map((e) => e.label).join(", ")}.`,
    });
  }

  if (attached.length > 0) {
    const hasDigital = attached.some(isDigitalTrace);
    const hasPhysical = attached.some((e) => !isDigitalTrace(e));
    if (!hasDigital && collected.some(isDigitalTrace)) {
      findings.push({ level: "hinweis", text: "Keine digitale Spur angehaengt, obwohl du welche gesichert hast." });
    }
    if (!hasPhysical && collected.some((e) => !isDigitalTrace(e))) {
      findings.push({ level: "hinweis", text: "Keine Spur aus dem Tatort angehaengt, obwohl du welche gesichert hast." });
    }
  }

  if (progress.insights.length === 0) {
    findings.push({ level: "hinweis", text: "Du hast noch keine Verknuepfung zwischen Beweisen aufgedeckt." });
  }

  return findings;
}

/** Darf trotz der Befunde abgesendet werden? Nur Fehler blockieren. */
export function canSubmitDespite(findings: ReviewFinding[]): boolean {
  return !findings.some((f) => f.level === "fehler");
}
