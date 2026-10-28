import type { CollectedEvidence, Suspect } from "@case-zero/shared";
import { missingForAccusation, type AccusationDraft } from "../lib/accusation";
import { KIND_LABEL } from "./evidenceKind";

interface Props {
  draft: AccusationDraft;
  suspects: Suspect[];
  /** Alle Beweise aus der Akte — nur die koennen angehaengt werden. */
  evidence: CollectedEvidence[];
  onAttach: (evidenceId: string) => void;
  onDetach: (evidenceId: string) => void;
  /** Fuehrt zur Verdaechtigenliste, wo der Taeter ausgewaehlt wird (#25). */
  onChooseSuspect: () => void;
  onBack: () => void;
}

/**
 * Story #26 — der Anklage Beweise anhaengen.
 *
 * Zeigt den ausgewaehlten Taeter (#25), die angehaengten Beweise mit
 * "Entfernen" und darunter, was aus der Akte noch angehaengt werden kann.
 */
export function AccusationPanel({
  draft,
  suspects,
  evidence,
  onAttach,
  onDetach,
  onChooseSuspect,
  onBack,
}: Props) {
  const suspect = suspects.find((s) => s.id === draft.suspectId);
  const attached = draft.evidenceIds
    .map((id) => evidence.find((e) => e.id === id))
    .filter((e): e is CollectedEvidence => Boolean(e));
  const available = evidence.filter((e) => !draft.evidenceIds.includes(e.id));
  const missing = missingForAccusation(draft);

  return (
    <section className="panel accusation">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Anklage vorbereiten
        </p>
        <button onClick={onBack}>Zurueck zur Fallakte</button>
      </div>

      <div className="accusation__block">
        <p className="team-code__label">Taeter</p>
        {suspect ? (
          <p className="accusation__suspect">
            <strong>{suspect.name}</strong> · {suspect.relationToVictim}
          </p>
        ) : (
          <p className="briefing__empty">Noch kein Taeter ausgewaehlt.</p>
        )}
        <button onClick={onChooseSuspect}>
          {suspect ? "Andere Person waehlen" : "Taeter auswaehlen"}
        </button>
      </div>

      <div className="accusation__block">
        <p className="team-code__label">Angehaengte Beweise · {attached.length}</p>
        {attached.length === 0 ? (
          <p className="briefing__empty">Noch kein Beweis angehaengt.</p>
        ) : (
          <ul className="accusation__list">
            {attached.map((item) => (
              <li key={item.id} className="accusation__item">
                <span>
                  {item.label}{" "}
                  <span className="evidence-list__kind">{KIND_LABEL[item.kind]}</span>
                </span>
                <button onClick={() => onDetach(item.id)} aria-label={`${item.label} entfernen`}>
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="accusation__block">
        <p className="team-code__label">Aus der Akte anhaengen</p>
        {evidence.length === 0 ? (
          <p className="briefing__empty">
            Deine Akte ist leer. Sichere zuerst Beweise im Tatort oder im Forensik-Terminal.
          </p>
        ) : available.length === 0 ? (
          <p className="briefing__empty">Alle Beweise aus der Akte sind angehaengt.</p>
        ) : (
          <ul className="accusation__list">
            {available.map((item) => (
              <li key={item.id} className="accusation__item">
                <span>
                  {item.label}{" "}
                  <span className="evidence-list__kind">{KIND_LABEL[item.kind]}</span>
                </span>
                <button onClick={() => onAttach(item.id)} aria-label={`${item.label} anhaengen`}>
                  Anhaengen
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {missing.length > 0 && (
        <ul className="accusation__missing" aria-live="polite">
          {missing.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
