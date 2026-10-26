import { RELEVANCE_LABEL, RELEVANCE_LEVELS, type Relevance } from "../lib/relevance";

interface Props {
  label: string;
  value?: Relevance;
  onChange: (relevance: Relevance) => void;
}

/** Story #47 — drei Stufen fuer eine digitale Spur. Nochmal klicken nimmt die Bewertung zurueck. */
export function RelevancePicker({ label, value, onChange }: Props) {
  return (
    <div className="insight-rating" role="group" aria-label={`Relevanz: ${label}`}>
      <span className="team-code__label" style={{ margin: 0 }}>
        Relevanz
      </span>
      {RELEVANCE_LEVELS.map((level) => {
        const on = value === level;
        return (
          <button
            key={level}
            className={`insight-rating__option${on ? ` insight-rating__option--on relevance--${level}` : ""}`}
            aria-pressed={on}
            onClick={() => onChange(level)}
          >
            {RELEVANCE_LABEL[level]}
          </button>
        );
      })}
    </div>
  );
}
