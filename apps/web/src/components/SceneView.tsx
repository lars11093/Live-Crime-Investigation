import { useState } from "react";
import type { Scene } from "@case-zero/shared";

interface Props {
  scene: Scene;
  onBack: () => void;
}

/**
 * Story #7 — Tatort als Szene.
 *
 * Liefert die Ansicht, nicht die Interaktion: anklickbare Fundstellen sind #8.
 *
 * TODO Bild-Assets: `scene.imagePath` zeigt auf Dateien, die es im Repo noch
 * nicht gibt — echte Bilder werden in der MVP-Phase bewusst nicht committet
 * (Copyright/Repo-Groesse). Bis dahin greift der Platzhalter unten, der
 * deshalb kein Randfall ist, sondern der Normalzustand.
 */
export function SceneView({ scene, onBack }: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="scene" aria-label={`Tatort: ${scene.name}`}>
      {imageFailed ? (
        <div className="scene__placeholder">
          <p className="scene__placeholder-mark" aria-hidden="true">
            [ ! ]
          </p>
          <p className="scene__placeholder-name">{scene.name}</p>
          <p className="scene__placeholder-hint">Szenenbild nicht verfuegbar</p>
        </div>
      ) : (
        <img
          className="scene__image"
          src={scene.imagePath}
          alt={scene.name}
          onError={() => setImageFailed(true)}
        />
      )}

      <div className="scene__overlay">
        <p className="scene__name">{scene.name}</p>
        <button className="scene__back" onClick={onBack}>
          Zurueck
        </button>
      </div>
    </section>
  );
}
