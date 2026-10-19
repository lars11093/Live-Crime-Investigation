import type { CollectedEvidence } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";

interface Props {
  evidence: CollectedEvidence[];
  /** Oeffnet die Detailansicht (#11). */
  onOpen?: (id: string) => void;
  /** Zurueck in die Fallakte. Fehlt, wenn die Liste eingebettet gezeigt wird. */
  onBack?: () => void;
}

/**
 * Story #10 — alle gesammelten Beweise als Liste.
 *
 * Die Liste haengt am State der Fallseite, nicht an einem eigenen Ladevorgang:
 * ein neu eingesammelter Fund erscheint dadurch sofort, ohne Neuladen.
 */
export function EvidenceList({ evidence, onOpen, onBack }: Props) {
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
            <li key={item.id}>
              <button
                className="evidence-list__item evidence-list__item--button"
                onClick={() => onOpen?.(item.id)}
              >
                <span className="evidence-list__head">
                  <span className="evidence-list__label">{item.label}</span>
                  <span className="evidence-list__kind">{KIND_LABEL[item.kind]}</span>
                </span>
                <span className="evidence-list__description">{item.description}</span>
                <span className="evidence-list__found">
                  Gefunden: {item.foundAt.sceneName} · {item.foundAt.hotspotLabel}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
