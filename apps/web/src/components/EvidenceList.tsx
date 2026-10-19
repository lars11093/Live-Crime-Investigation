import type { CollectableEvidence } from "@case-zero/shared";

interface Props {
  evidence: CollectableEvidence[];
}

const KIND_LABEL: Record<CollectableEvidence["kind"], string> = {
  person: "Person",
  object: "Gegenstand",
  location: "Ort",
  message: "Nachricht",
  fact: "Feststellung",
};

/**
 * Story #9 — die Beweisakte.
 * Zeigt, was im Tatort eingesammelt wurde. Die volle Akte mit Filtern,
 * Notizen und Verknuepfungen ist #10 bis #13.
 */
export function EvidenceList({ evidence }: Props) {
  return (
    <section className="panel evidence-list">
      <p className="terminal-title">Beweisakte</p>

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
