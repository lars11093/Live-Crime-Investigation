import { photoCrop, type EvidencePhoto } from "../lib/photos";

interface Props {
  photo: EvidencePhoto;
  size?: "small" | "large";
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Story #35 — ein Tatortfoto in der Akte.
 *
 * Nur <span>-Elemente, weil das Foto in der Akte in einem Button steht.
 *
 * Der Ausschnitt entsteht per CSS aus dem Szenenbild. Fehlt das Bild — in der
 * MVP-Phase immer, siehe #7 — bleibt das Absperrband-Raster als Hintergrund,
 * und Fadenkreuz, Stelle und Uhrzeit machen das Foto trotzdem wiedererkennbar.
 */
export function EvidencePhotoView({ photo, size = "small" }: Props) {
  const crop = photoCrop(photo);
  return (
    <span className={`evidence-photo evidence-photo--${size}`}>
      <span
        className="evidence-photo__frame"
        role="img"
        aria-label={`Tatortfoto: ${photo.hotspotLabel}, ${photo.sceneName}`}
        style={{
          backgroundImage: photo.sceneImagePath ? `url("${photo.sceneImagePath}")` : undefined,
          ...crop,
        }}
      >
        <span className="evidence-photo__crosshair" aria-hidden="true" />
        <span className="evidence-photo__stamp" aria-hidden="true">
          {formatTime(photo.takenAt)}
        </span>
      </span>
      <span className="evidence-photo__caption">
        {photo.hotspotLabel} · {photo.sceneName}
      </span>
    </span>
  );
}
