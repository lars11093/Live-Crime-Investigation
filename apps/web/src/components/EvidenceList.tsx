import { useState } from "react";
import type { CollectedEvidence } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";
import { EvidencePhotoView } from "./EvidencePhotoView";
import type { EvidencePhoto } from "../lib/photos";
import {
  NO_FILTER,
  filterEvidence,
  toggleKind,
  type EvidenceFilter,
  type EvidenceKind,
} from "../lib/evidenceFilter";

interface Props {
  evidence: CollectedEvidence[];
  /** Beweis-ID -> Notiztext (#12). */
  notes?: Record<string, string>;
  /** Tatortfotos (#35), pro Beweis-ID. */
  photos?: Record<string, EvidencePhoto>;
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
 *
 * Story #36 — filtern. Suchfeld (Titel, Beschreibung, Fundort, Notiz) und
 * Arten zum An- und Abwaehlen. Angeboten werden nur Arten, die in der Akte
 * auch vorkommen.
 */
export function EvidenceList({ evidence, notes = {}, photos = {}, onOpen, onBack }: Props) {
  const [filter, setFilter] = useState<EvidenceFilter>(NO_FILTER);
  const shown = filterEvidence(evidence, filter, notes);
  const kindsInAkte = (Object.keys(KIND_LABEL) as EvidenceKind[]).filter((kind) =>
    evidence.some((e) => e.kind === kind)
  );
  const filtering = filter.query.trim() !== "" || filter.kinds.length > 0;

  return (
    <section className="panel evidence-list">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Beweisakte · {filtering ? `${shown.length} von ${evidence.length}` : evidence.length}
        </p>
        {onBack && <button onClick={onBack}>Zurueck zur Fallakte</button>}
      </div>

      {evidence.length > 0 && (
        <div className="evidence-filter" role="search">
          <input
            type="search"
            className="evidence-filter__query"
            placeholder="Akte durchsuchen …"
            aria-label="Akte durchsuchen"
            value={filter.query}
            onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
          />
          <div className="evidence-filter__kinds" role="group" aria-label="Nach Art filtern">
            {kindsInAkte.map((kind) => {
              const on = filter.kinds.includes(kind);
              return (
                <button
                  key={kind}
                  className={`evidence-filter__kind${on ? " evidence-filter__kind--on" : ""}`}
                  aria-pressed={on}
                  onClick={() => setFilter((prev) => toggleKind(prev, kind))}
                >
                  {KIND_LABEL[kind]}
                </button>
              );
            })}
            {filtering && <button onClick={() => setFilter(NO_FILTER)}>Filter zuruecksetzen</button>}
          </div>
        </div>
      )}

      {evidence.length === 0 ? (
        <p className="evidence-list__empty">
          Noch nichts eingesammelt. Untersuche den Tatort oder ein Geraet und sichere, was du findest.
        </p>
      ) : shown.length === 0 ? (
        <p className="evidence-list__empty">Kein Beweis passt zu diesem Filter.</p>
      ) : (
        <ol className="evidence-list__items">
          {shown.map((item) => (
            <li key={item.id}>
              <button
                className="evidence-list__item evidence-list__item--button"
                onClick={() => onOpen?.(item.id)}
              >
                {photos[item.id] && <EvidencePhotoView photo={photos[item.id]} />}
                <span className="evidence-list__head">
                  <span className="evidence-list__label">{item.label}</span>
                  <span className="evidence-list__kind">{KIND_LABEL[item.kind]}</span>
                </span>
                <span className="evidence-list__description">{item.description}</span>
                {notes[item.id] && (
                  <span className="evidence-list__note">Notiz: {notes[item.id]}</span>
                )}
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
