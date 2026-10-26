import { useState } from "react";
import type { CollectedEvidence } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";
import { EvidencePhotoView } from "./EvidencePhotoView";
import type { EvidencePhoto } from "../lib/photos";
import { NoteEditor } from "./NoteEditor";
import { RelevancePicker } from "./RelevancePicker";
import { isDigitalTrace, type Relevance } from "../lib/relevance";

interface Props {
  evidence: CollectedEvidence;
  /** Gespeicherte Notiz zu diesem Beweis (#12), leer wenn keine da ist. */
  note: string;
  /** Wann die Notiz zuletzt gespeichert wurde (#38). */
  noteEditedAt?: string;
  /** Eigenes Tatortfoto (#35), falls aufgenommen. */
  photo?: EvidencePhoto;
  /** Relevanz, falls es eine digitale Spur ist (#47). */
  relevance?: Relevance;
  onRelevance: (relevance: Relevance) => void;
  onSaveNote: (text: string) => void;
  onBack: () => void;
}

/**
 * Story #11 — ein Beweis im Detail.
 * Zeigt Titel, Asservatenfoto, Beschreibung und den Fundort. Ohne Bild-Asset
 * steht hier ein Platzhalter mit dem Titel statt einer leeren Flaeche — wie
 * bei der Szene in #7.
 */
export function EvidenceDetail({
  evidence,
  note,
  noteEditedAt,
  photo,
  relevance,
  onRelevance,
  onSaveNote,
  onBack,
}: Props) {
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

      {photo && (
        <div className="evidence-detail__photo">
          <p className="team-code__label">Mein Tatortfoto</p>
          <EvidencePhotoView photo={photo} size="large" />
        </div>
      )}

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

      {isDigitalTrace(evidence) && (
        <RelevancePicker label={evidence.label} value={relevance} onChange={onRelevance} />
      )}

      <NoteEditor
        evidenceId={evidence.id}
        note={note}
        editedAt={noteEditedAt}
        onSave={onSaveNote}
      />
    </section>
  );
}
