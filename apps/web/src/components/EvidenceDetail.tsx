import { useEffect, useState } from "react";
import type { CollectedEvidence } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";

interface Props {
  evidence: CollectedEvidence;
  /** Gespeicherte Notiz zu diesem Beweis (#12), leer wenn keine da ist. */
  note: string;
  onSaveNote: (text: string) => void;
  onBack: () => void;
}

/**
 * Story #11 — ein Beweis im Detail.
 * Zeigt Titel, Asservatenfoto, Beschreibung und den Fundort. Ohne Bild-Asset
 * steht hier ein Platzhalter mit dem Titel statt einer leeren Flaeche — wie
 * bei der Szene in #7.
 */
export function EvidenceDetail({ evidence, note, onSaveNote, onBack }: Props) {
  const [imageFailed, setImageFailed] = useState(!evidence.imagePath);
  const [draft, setDraft] = useState(note);
  const [saved, setSaved] = useState(false);

  // Beim Wechsel auf einen anderen Beweis dessen Notiz in den Entwurf holen.
  useEffect(() => {
    setDraft(note);
    setSaved(false);
  }, [evidence.id, note]);

  const dirty = draft.trim() !== note.trim();

  function save() {
    onSaveNote(draft);
    setSaved(true);
  }

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

      <div className="evidence-note">
        <label className="team-code__label" htmlFor={`note-${evidence.id}`}>
          Meine Notiz
        </label>
        <textarea
          id={`note-${evidence.id}`}
          className="evidence-note__input"
          value={draft}
          rows={4}
          placeholder="Was faellt dir an diesem Beweis auf?"
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
          }}
        />
        <div className="case-status__actions">
          <button className="button--primary" onClick={save} disabled={!dirty}>
            Notiz speichern
          </button>
          {saved && !dirty && (
            <span className="evidence-note__saved" role="status">
              Gespeichert
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
