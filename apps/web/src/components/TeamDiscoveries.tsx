import type { CollectedEvidence, TeamDiscovery } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";

interface Props {
  discoveries: TeamDiscovery[];
  /** Eigene Verbindungs-ID, damit eigene Funde mit "du" markiert sind. */
  myId: string | undefined;
  /** Was schon in der eigenen Akte liegt — dort gibt es nichts zu übernehmen. */
  collectedIds: string[];
  onTake: (evidence: CollectedEvidence) => void;
}

function time(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Story #75 — was das Team gerade findet, live.
 *
 * Jeder Fund erscheint hier, sobald jemand ihn einsammelt — ohne Teilen-Klick.
 * Neueste oben, damit man beim parallelen Ermitteln sieht, was gerade dazukam.
 * Fremde Funde lassen sich in die eigene Akte übernehmen.
 */
export function TeamDiscoveries({ discoveries, myId, collectedIds, onTake }: Props) {
  const have = new Set(collectedIds);
  const newestFirst = [...discoveries].reverse();

  return (
    <section className="panel" aria-live="polite">
      <p className="terminal-title">
        Live vom Team · {discoveries.length} {discoveries.length === 1 ? "Fund" : "Funde"}
      </p>

      {discoveries.length === 0 ? (
        <p className="evidence-list__empty">
          Noch keine Funde. Sobald jemand im Team etwas einsammelt, erscheint es hier.
        </p>
      ) : (
        <ol className="evidence-list__items">
          {newestFirst.map(({ evidence, foundBy, foundById, foundAt }) => {
            const mine = foundById === myId;
            const inAkte = have.has(evidence.id);
            return (
              <li key={evidence.id} className="evidence-list__item shared-finding">
                <span className="evidence-list__head">
                  <span className="evidence-list__label">{evidence.label}</span>
                  <span className="evidence-list__kind">{KIND_LABEL[evidence.kind]}</span>
                </span>
                <span className="shared-finding__by">
                  Gefunden von <strong>{foundBy}</strong>
                  {mine && " (du)"}
                  {" · "}
                  {evidence.foundAt.sceneName}
                  {time(foundAt) && ` · ${time(foundAt)}`}
                </span>
                {!mine && (
                  <span className="case-status__actions" style={{ margin: "0.4rem 0 0" }}>
                    <button onClick={() => onTake(evidence)} disabled={inAkte}>
                      {inAkte ? "In deiner Akte" : "In meine Akte übernehmen"}
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
