import type { AccusationVerdict } from "@case-zero/shared";

interface Props {
  verdict: AccusationVerdict;
}

const TOPIC_LABEL = {
  suspect: "Taeter",
  evidence: "Beweis",
  missed: "Uebersehen",
} as const;

/**
 * Story #28 — die Aufloesung nach der Anklage.
 *
 * Zuoberst und unuebersehbar: geloest oder nicht. Darunter, was tatsaechlich
 * passiert ist, und welche Schluesse richtig oder falsch waren.
 */
export function CaseResolution({ verdict }: Props) {
  return (
    <div className="resolution">
      <p
        className={`resolution__result${verdict.solved ? "" : " resolution__result--failed"}`}
        role="status"
      >
        {verdict.solved ? "Fall geloest" : "Fall nicht geloest"}
      </p>
      <p className="case-status__hint">
        Taeter: <strong>{verdict.culprit.name}</strong>
      </p>

      <p className="team-code__label">Was wirklich geschah</p>
      <p className="briefing__text">{verdict.resolution}</p>

      <p className="team-code__label">Deine Schluesse</p>
      <ul className="resolution__findings">
        {verdict.findings.map((finding, index) => (
          <li
            key={index}
            className={`resolution__finding${finding.correct ? "" : " resolution__finding--wrong"}`}
          >
            <span className="resolution__mark" aria-hidden="true">
              {finding.correct ? "✓" : "✗"}
            </span>
            <span>
              <span className="evidence-list__kind">{TOPIC_LABEL[finding.topic]}</span>{" "}
              {finding.text}
              <span className="visually-hidden">{finding.correct ? " (richtig)" : " (falsch)"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
