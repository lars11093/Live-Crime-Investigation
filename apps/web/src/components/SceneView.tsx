import { useEffect, useState } from "react";
import type { CollectedEvidence, Hotspot, Scene } from "@case-zero/shared";

interface Props {
  scene: Scene;
  /** IDs bereits untersuchter Stellen — bleibt beim Verlassen der Szene erhalten. */
  investigatedIds: string[];
  onInvestigate: (hotspotId: string) => void;
  /** IDs bereits eingesammelter Funde (#9). */
  collectedIds: string[];
  onCollect: (evidence: CollectedEvidence) => void;
  onBack: () => void;
}

/**
 * Story #7 — Tatort als Szene, Story #8 — Stellen anklicken.
 *
 * TODO Bild-Assets: `scene.imagePath` zeigt auf Dateien, die es im Repo noch
 * nicht gibt — echte Bilder werden in der MVP-Phase bewusst nicht committet
 * (Copyright/Repo-Groesse). Bis dahin greift der Platzhalter, der deshalb
 * kein Randfall ist, sondern der Normalzustand.
 */
export function SceneView({
  scene,
  investigatedIds,
  onInvestigate,
  collectedIds,
  onCollect,
  onBack,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [openHotspot, setOpenHotspot] = useState<Hotspot | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const investigated = new Set(investigatedIds);
  const collected = new Set(collectedIds);

  // Bestaetigung wieder ausblenden, damit sie nicht dauerhaft im Bild steht.
  useEffect(() => {
    if (!confirmation) return;
    const timer = setTimeout(() => setConfirmation(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmation]);

  function collect(hotspot: Hotspot, evidence: NonNullable<Hotspot["evidence"]>) {
    // Fundort entsteht hier, nicht in den Falldaten: die Akte soll zeigen,
    // wo dieser Ermittler den Fund gesichert hat (#11).
    onCollect({
      ...evidence,
      foundAt: { sceneName: scene.name, hotspotLabel: hotspot.label },
    });
    setConfirmation(`"${evidence.label}" ist in deiner Beweisakte.`);
    setOpenHotspot(null);
  }

  function open(hotspot: Hotspot) {
    setOpenHotspot(hotspot);
    onInvestigate(hotspot.id);
  }

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

      {scene.hotspots.map((hotspot) => {
        const done = investigated.has(hotspot.id);
        return (
          <button
            key={hotspot.id}
            className={`hotspot${done ? " hotspot--done" : ""}`}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            onClick={() => open(hotspot)}
            aria-pressed={done}
            aria-label={`${hotspot.label}${done ? " (bereits untersucht)" : ""}`}
          >
            <span className="hotspot__ring" aria-hidden="true" />
            <span className="hotspot__label">
              {hotspot.label}
              {done && <span className="hotspot__check" aria-hidden="true"> ✓</span>}
            </span>
          </button>
        );
      })}

      <div className="scene__overlay">
        <p className="scene__name">{scene.name}</p>
        <p className="scene__progress">
          {investigated.size} / {scene.hotspots.length} untersucht
        </p>
        <button className="scene__back" onClick={onBack}>
          Zurueck
        </button>
      </div>

      {confirmation && (
        <p className="scene__confirmation" role="status">
          {confirmation}
        </p>
      )}

      {openHotspot && (
        <div className="hotspot-detail" role="dialog" aria-label={openHotspot.label}>
          <div className="hotspot-detail__panel">
            <p className="terminal-title">Spur untersucht</p>
            <h2 className="hotspot-detail__title">{openHotspot.label}</h2>
            <p className="hotspot-detail__text">{openHotspot.detail}</p>

            {openHotspot.evidence && (
              <p className="hotspot-detail__find">
                Sicherbar: <strong>{openHotspot.evidence.label}</strong>
              </p>
            )}

            <div className="case-status__actions">
              {openHotspot.evidence &&
                (collected.has(openHotspot.evidence.id) ? (
                  <button disabled>Bereits eingesammelt</button>
                ) : (
                  <button
                    className="button--primary"
                    onClick={() => collect(openHotspot, openHotspot.evidence!)}
                  >
                    Einsammeln
                  </button>
                ))}
              <button onClick={() => setOpenHotspot(null)}>Schliessen</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
