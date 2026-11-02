import type { SharedFinding } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";

interface Props {
  findings: SharedFinding[];
  /** Eigene Verbindungs-ID, damit eigene Funde mit "du" markiert sind. */
  myId: string | undefined;
}

/**
 * Story #23 — was das Team geteilt hat.
 *
 * Steht unter der eigenen Beweisakte und nicht in ihr: die eigene Akte ist,
 * was man selbst gesichert hat (#9, #21). Geteilte Funde sind der gemeinsame
 * Wissensstand, mit Urheber.
 */
export function SharedFindings({ findings, myId }: Props) {
  return (
    <section className="panel">
      <p className="terminal-title">Vom Team geteilt · {findings.length}</p>

      {findings.length === 0 ? (
        <p className="evidence-list__empty">
          Noch nichts geteilt. Oeffne einen Beweis und teile ihn mit dem Team.
        </p>
      ) : (
        <ol className="evidence-list__items">
          {findings.map(({ evidence, sharedBy, sharedById }) => (
            <li key={evidence.id} className="evidence-list__item shared-finding">
              <span className="evidence-list__head">
                <span className="evidence-list__label">{evidence.label}</span>
                <span className="evidence-list__kind">{KIND_LABEL[evidence.kind]}</span>
              </span>
              <span className="evidence-list__description">{evidence.description}</span>
              <span className="shared-finding__by">
                Geteilt von <strong>{sharedBy}</strong>
                {sharedById === myId && " (du)"}
                {" · "}
                {evidence.foundAt.sceneName}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
