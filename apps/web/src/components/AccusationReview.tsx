import type { ReviewFinding, ReviewLevel } from "../lib/accusationReview";

interface Props {
  findings: ReviewFinding[];
}

const LEVEL_LABEL: Record<ReviewLevel, string> = {
  fehler: "Fehlt",
  warnung: "Achtung",
  hinweis: "Hinweis",
};

/**
 * Story #52 — das Ergebnis der Prüfung.
 *
 * Fehler blockieren das Absenden, Warnungen und Hinweise nicht: es ist die
 * Anklage des Ermittlers, nicht die des Spiels.
 */
export function AccusationReview({ findings }: Props) {
  if (findings.length === 0) {
    return (
      <p className="accusation__confirmation" role="status">
        Keine offensichtlichen Lücken gefunden. Ob die Anklage stimmt, zeigt erst die Auflösung.
      </p>
    );
  }
  return (
    <ul className="review" role="status" aria-label="Prüfergebnis">
      {findings.map((finding) => (
        <li key={finding.text} className={`review__item review__item--${finding.level}`}>
          <span className="review__level">{LEVEL_LABEL[finding.level]}</span>
          {finding.text}
        </li>
      ))}
    </ul>
  );
}
