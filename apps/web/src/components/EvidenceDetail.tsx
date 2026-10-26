import { useState } from "react";
import type { CollectedEvidence } from "@case-zero/shared";
import { KIND_LABEL } from "./evidenceKind";
import { EvidencePhotoView } from "./EvidencePhotoView";
import type { EvidencePhoto } from "../lib/photos";
import { NoteEditor } from "./NoteEditor";

interface Props {
  evidence: CollectedEvidence;
  /** Gespeicherte Notiz zu diesem Beweis (#12), leer wenn keine da ist. */
  note: string;
  /** Wann die Notiz zuletzt gespeichert wurde (#38). */
  noteEditedAt?: string;
  /** Eigenes Tatortfoto (#35), falls aufgenommen. */
  photo?: EvidencePhoto;
  onSaveNote: (text: string) => void;
  /** Teilen mit dem Team (#23). Fehlt, wenn die Seite kein Team kennt. */
  share?: {
    /** Name der Person, die diesen Fund schon geteilt hat — sonst `null`. */
    sharedBy: string | null;
    /** Ist man dem Team beigetreten? Ohne Namen gibt es keinen Urheber. */
    joined: boolean;
    /** Teilt und liefert die Meldung fuer den Spieler. */
    onShare: () => Promise<string>;
  };
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
  onSaveNote,
  share,
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

      {share && <ShareAction key={evidence.id} {...share} />}

      <NoteEditor
        evidenceId={evidence.id}
        note={note}
        editedAt={noteEditedAt}
        onSave={onSaveNote}
      />
    </section>
  );
}

/** Story #23 — Teilen-Knopf mit Zustand und Rueckmeldung. */
function ShareAction({ sharedBy, joined, onShare }: NonNullable<Props["share"]>) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    try {
      setMessage(await onShare());
    } catch {
      setMessage("Server nicht erreichbar. Bitte erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="evidence-share">
      {sharedBy ? (
        <p className="evidence-share__done">Mit dem Team geteilt von {sharedBy}</p>
      ) : joined ? (
        <button onClick={run} disabled={busy}>
          {busy ? "Teile…" : "Mit Team teilen"}
        </button>
      ) : (
        <p className="case-status__hint" style={{ margin: 0 }}>
          Zum Teilen zuerst in der Fallakte dem Team beitreten.
        </p>
      )}
      {message && !sharedBy && (
        <p className="case-status__hint" role="status" style={{ margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}
