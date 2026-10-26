import type { ChatAttachment } from "@case-zero/shared";
import { metadataRows } from "../lib/imageMetadata";

interface Props {
  attachment: ChatAttachment;
  /** Wurden die Metadaten schon ausgelesen? Dann stehen sie offen da. */
  read: boolean;
  onRead: () => void;
}

/**
 * Story #45 — die Metadaten eines Bildes auslesen.
 *
 * Das Bild selbst gibt es nicht (keine Assets im Repo, CLAUDE.md) — nur den
 * Anhang mit Dateinamen. Der eigentliche Fund steckt in den Metadaten:
 * Aufnahmezeit, Geraet, Ort.
 */
export function ImageAttachment({ attachment, read, onRead }: Props) {
  return (
    <div className="attachment">
      <p className="attachment__file">
        <span aria-hidden="true">▣ </span>
        {attachment.fileName}
        <span className="evidence-list__kind">Bild</span>
      </p>
      {read ? (
        <dl className="attachment__meta" aria-label={`Metadaten ${attachment.fileName}`}>
          {metadataRows(attachment.metadata).map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <button className="chat__secure" onClick={onRead}>
          Metadaten auslesen
        </button>
      )}
    </div>
  );
}
