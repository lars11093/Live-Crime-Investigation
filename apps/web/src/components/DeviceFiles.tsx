import { useState } from "react";
import type { Device, DeviceFile } from "@case-zero/shared";
import { FILE_TYPE_LABEL, openFile } from "../lib/deviceFiles";

interface Props {
  device: Device;
  /** Wechselt zum Chatverlauf desselben Geraets (#19). */
  onShowMessages: () => void;
  onBack: () => void;
}

/**
 * Story #20 — Dateien auf einem Geraet oeffnen.
 * Links die Dateiliste, rechts die geoeffnete Datei: Text als Text, Bilder als
 * Bild (mit Platzhalter, solange es kein Asset gibt), alles andere mit einem
 * Hinweis, warum es sich nicht oeffnen laesst.
 */
export function DeviceFiles({ device, onShowMessages, onBack }: Props) {
  const files = device.files ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const open = files.find((f) => f.id === openId);

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          {device.label} · Dateien
        </p>
        <span className="device-files__actions">
          <button onClick={onShowMessages}>Nachrichten</button>
          <button onClick={onBack}>Zurueck zum Forensik-Terminal</button>
        </span>
      </div>

      {files.length === 0 ? (
        <p className="evidence-list__empty">Auf diesem Geraet sind keine Dateien gespeichert.</p>
      ) : (
        <div className="device-files">
          <ul className="device-files__list" aria-label={`Dateien auf ${device.label}`}>
            {files.map((file) => (
              <li key={file.id}>
                <button
                  className={`device-files__item${file.id === openId ? " device-files__item--open" : ""}`}
                  onClick={() => setOpenId(file.id)}
                  aria-pressed={file.id === openId}
                >
                  <span className="device-files__name">{file.name}</span>
                  <span className="evidence-list__kind">
                    {FILE_TYPE_LABEL[file.type]} · {file.modifiedAt}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="device-files__viewer">
            {open ? (
              // key: beim Wechsel der Datei startet der Bild-Zustand neu.
              <FileViewer key={open.id} file={open} />
            ) : (
              <p className="evidence-list__empty">Waehle links eine Datei, um sie zu oeffnen.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function FileViewer({ file }: { file: DeviceFile }) {
  const opened = openFile(file);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div>
      <p className="device-files__viewer-name">{file.name}</p>

      {opened.kind === "text" && <pre className="device-files__text">{opened.content}</pre>}

      {opened.kind === "image" &&
        (imageFailed ? (
          <div className="evidence-detail__placeholder">
            <p className="scene__placeholder-mark" aria-hidden="true">
              [ IMG ]
            </p>
            {opened.caption && (
              <p className="evidence-detail__placeholder-name">{opened.caption}</p>
            )}
            <p className="scene__placeholder-hint">Bilddatei nicht verfuegbar</p>
          </div>
        ) : (
          <figure className="device-files__figure">
            <img
              className="evidence-detail__image"
              src={opened.imagePath}
              alt={opened.caption ?? file.name}
              onError={() => setImageFailed(true)}
            />
            {opened.caption && <figcaption>{opened.caption}</figcaption>}
          </figure>
        ))}

      {opened.kind === "unreadable" && (
        <p className="device-files__unreadable" role="status">
          Datei kann nicht geoeffnet werden. {opened.reason}
        </p>
      )}
    </div>
  );
}
