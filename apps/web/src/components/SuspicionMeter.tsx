import {
  SUSPICION_LABEL,
  SUSPICION_LEVELS,
  type SuspicionLevel,
} from "../lib/suspicion";

interface Props {
  name: string;
  level?: SuspicionLevel;
  /** Ohne Callback nur Anzeige (z. B. in der Liste). */
  onChange?: (level: SuspicionLevel) => void;
}

/**
 * Story #43 — Verdachtsgrad als vier Balken.
 *
 * Mit `onChange` als Knopfgruppe zum Einschaetzen, ohne als reine Anzeige.
 */
export function SuspicionMeter({ name, level, onChange }: Props) {
  const label = level ? SUSPICION_LABEL[level] : "Nicht eingeschaetzt";

  if (!onChange) {
    return (
      <span className="suspicion" aria-label={`Verdachtsgrad ${name}: ${label}`}>
        {SUSPICION_LEVELS.map((step) => (
          <span
            key={step}
            aria-hidden="true"
            className={`suspicion__bar${level && step <= level ? ` suspicion__bar--on suspicion__bar--${level}` : ""}`}
          />
        ))}
        <span className="suspicion__label" aria-hidden="true">
          {label}
        </span>
      </span>
    );
  }

  return (
    <div className="suspicion-picker">
      <p className="team-code__label" style={{ margin: 0 }}>
        Mein Verdachtsgrad · {label}
      </p>
      <div className="suspicion" role="group" aria-label={`Verdachtsgrad fuer ${name}`}>
        {SUSPICION_LEVELS.map((step) => (
          <button
            key={step}
            className={`suspicion__step${level && step <= level ? ` suspicion__bar--on suspicion__bar--${level}` : ""}`}
            aria-pressed={level === step}
            aria-label={SUSPICION_LABEL[step]}
            title={SUSPICION_LABEL[step]}
            onClick={() => onChange(step)}
          />
        ))}
      </div>
    </div>
  );
}
