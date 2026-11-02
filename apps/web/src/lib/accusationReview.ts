import type { CollectedEvidence, Suspect } from "@case-zero/shared";
import type { AccusationDraft } from "./accusation";
import type { CaseProgress } from "./caseProgress";
import { isDigitalTrace } from "./relevance";
import { SUSPICION_LABEL } from "./suspicion";

/** Wie schwer eine Lücke wiegt (#52). Nur "fehler" verhindert das Absenden. */
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
 * Prüft eine Anklage auf offensichtliche Lücken (Story #52).
 *
 * Bewusst ohne Wissen über die Lösung — die kennt nur der Server, und eine
 * Prüfung dagegen wäre ein Spoiler. Verglichen wird die Anklage mit der
 * eigenen Ermittlung: Alibi-Urteil (#42), Verdachtsgrad (#43), markierte
 * Widersprüche (#17), Relevanz (#47), aufgedeckte Verknüpfungen (#13).
 */
export function reviewAccusation({ draft, suspects, collected, progress }: ReviewInput): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const suspect = suspects.find((s) => s.id === draft.suspectId);
  const attached = collected.filter((e) => draft.evidenceIds.includes(e.id));

  if (!suspect) findings.push({ level: "fehler", text: "Es ist kein Täter ausgewählt." });
  if (attached.length === 0) {
    findings.push({ level: "fehler", text: "Es ist kein Beweis angehängt." });
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
        text: `Du hältst das Alibi von ${suspect.name} selbst für haltbar.`,
      });
    } else if (!alibi) {
      findings.push({ level: "hinweis", text: `Das Alibi von ${suspect.name} hast du noch nicht geprüft.` });
    }

    const mine = progress.suspicion[suspect.id] ?? 0;
    const stronger = suspects.find((s) => s.id !== suspect.id && (progress.suspicion[s.id] ?? 0) > mine);
    if (stronger) {
      findings.push({
        level: "warnung",
        text: `Deinen höchsten Verdacht hast du gegen ${stronger.name} (${
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
      text: `Angehängt, aber von dir als nebensächlich bewertet: ${unimportant.map((e) => e.label).join(", ")}.`,
    });
  }

  if (attached.length > 0) {
    const hasDigital = attached.some(isDigitalTrace);
    const hasPhysical = attached.some((e) => !isDigitalTrace(e));
    if (!hasDigital && collected.some(isDigitalTrace)) {
      findings.push({ level: "hinweis", text: "Keine digitale Spur angehängt, obwohl du welche gesichert hast." });
    }
    if (!hasPhysical && collected.some((e) => !isDigitalTrace(e))) {
      findings.push({ level: "hinweis", text: "Keine Spur aus dem Tatort angehängt, obwohl du welche gesichert hast." });
    }
  }

  if (progress.insights.length === 0) {
    findings.push({ level: "hinweis", text: "Du hast noch keine Verknüpfung zwischen Beweisen aufgedeckt." });
  }

  return findings;
}

/** Darf trotz der Befunde abgesendet werden? Nur Fehler blockieren. */
export function canSubmitDespite(findings: ReviewFinding[]): boolean {
  return !findings.some((f) => f.level === "fehler");
}
