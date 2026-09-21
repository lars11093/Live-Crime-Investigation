import type { CollectableEvidence } from "@case-zero/shared";

interface Props {
  evidence: CollectableEvidence[];
  /** Zurueck in die Fallakte. Fehlt, wenn die Liste eingebettet gezeigt wird. */
  onBack?: () => void;
}

const KIND_LABEL: Record<CollectableEvidence["kind"], string> = {
  person: "Person",
  object: "Gegenstand",
  location: "Ort",
  message: "Nachricht",
  fact: "Feststellung",
};

/**
 * Story #10 — alle gesammelten Beweise als Liste.
 *
 * Die Liste haengt am State der Fallseite, nicht an einem eigenen Ladevorgang:
 * ein neu eingesammelter Fund erscheint dadurch sofort, ohne Neuladen.
 */
export function EvidenceList({ evidence, onBack }: Props) {
  return (
    <section className="panel evidence-list">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Beweisakte · {evidence.length}
        </p>
        {onBack && <button onClick={onBack}>Zurueck zur Fallakte</button>}
      </div>

      {evidence.length === 0 ? (
        <p className="evidence-list__empty">
          Noch nichts eingesammelt. Untersuche den Tatort und sichere, was du findest.
        </p>
      ) : (
        <ol className="evidence-list__items">
          {evidence.map((item) => (
            <li key={item.id} className="evidence-list__item">
              <div className="evidence-list__head">
                <span className="evidence-list__label">{item.label}</span>
                <span className="evidence-list__kind">{KIND_LABEL[item.kind]}</span>
              </div>
              <p className="evidence-list__description">{item.description}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
