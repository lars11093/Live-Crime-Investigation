import { useState } from "react";
import type { CollectedEvidence } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";

interface Props {
  evidence: CollectedEvidence;
  onBack: () => void;
}

/**
 * Story #11 — ein Beweis im Detail.
 * Zeigt Titel, Asservatenfoto, Beschreibung und den Fundort. Ohne Bild-Asset
 * steht hier ein Platzhalter mit dem Titel statt einer leeren Flaeche — wie
 * bei der Szene in #7.
 */
export function EvidenceDetail({ evidence, onBack }: Props) {
  const [imageFailed, setImageFailed] = useState(!evidence.imagePath);

  return (
    <section className="panel evidence-detail">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Asservat · {KIND_LABEL[evidence.kind]}
        </p>
        <button onClick={onBack}>Zurueck zur Liste</button>
      </div>

      <h1 className="evidence-detail__title">{evidence.label}</h1>

      <div className="evidence-detail__figure">
        {imageFailed ? (
          <div className="evidence-detail__placeholder">
            <p className="scene__placeholder-mark" aria-hidden="true">
              [ ? ]
            </p>
            <p className="evidence-detail__placeholder-name">{evidence.label}</p>
            <p className="scene__placeholder-hint">Kein Asservatenfoto</p>
          </div>
        ) : (
          <img
            className="evidence-detail__image"
            src={evidence.imagePath}
            alt={evidence.label}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <p className="evidence-detail__description">{evidence.description}</p>

      <dl className="briefing__facts">
        <div>
          <dt>Fundort</dt>
          <dd>{evidence.foundAt.sceneName}</dd>
        </div>
        <div>
          <dt>Gesichert an</dt>
          <dd>{evidence.foundAt.hotspotLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
