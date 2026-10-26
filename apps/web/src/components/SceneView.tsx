import { useEffect, useRef, useState } from "react";
import type { CollectedEvidence, Hotspot, Scene } from "@case-zero/shared";
import { ZOOM_LEVELS, keepCenter, zoomIn, zoomOut } from "../lib/zoom";
import type { EvidencePhoto } from "../lib/photos";

interface Props {
  scene: Scene;
  /** IDs bereits untersuchter Stellen — bleibt beim Verlassen der Szene erhalten. */
  investigatedIds: string[];
  onInvestigate: (hotspotId: string) => void;
  /** Markierung bewusst setzen oder zuruecknehmen (#34). */
  onToggleInvestigated: (hotspotId: string) => void;
  /** IDs bereits eingesammelter Funde (#9). */
  collectedIds: string[];
  onCollect: (evidence: CollectedEvidence) => void;
  /** IDs bereits fotografierter Funde (#35). */
  photographedIds: string[];
  onPhoto: (photo: EvidencePhoto) => void;
  onBack: () => void;
}

/**
 * Story #7 — Tatort als Szene, Story #8 — Stellen anklicken.
 *
 * TODO Bild-Assets: `scene.imagePath` zeigt auf Dateien, die es im Repo noch
 * nicht gibt — echte Bilder werden in der MVP-Phase bewusst nicht committet
 * (Copyright/Repo-Groesse). Bis dahin greift der Platzhalter, der deshalb
 * kein Randfall ist, sondern der Normalzustand.
 *
 * Story #33 — Zoom. Bild und Stellen liegen gemeinsam auf einer "Buehne", die
 * mit der Zoomstufe waechst; der Ausschnitt darum herum scrollt. Weil die
 * Stellen in Prozent der Buehne positioniert sind, bleiben sie beim Zoomen
 * genau auf ihrem Bilddetail.
 */
export function SceneView({
  scene,
  investigatedIds,
  onInvestigate,
  onToggleInvestigated,
  collectedIds,
  onCollect,
  photographedIds,
  onPhoto,
  onBack,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [openHotspot, setOpenHotspot] = useState<Hotspot | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(ZOOM_LEVELS[0]);
  // Untersuchte Stellen ausblenden, damit nur noch Offenes im Bild steht (#34).
  const [hideDone, setHideDone] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  function changeZoom(next: number) {
    const viewport = viewportRef.current;
    if (viewport && next !== zoom) {
      const left = keepCenter(viewport.scrollLeft, viewport.clientWidth, zoom, next);
      const top = keepCenter(viewport.scrollTop, viewport.clientHeight, zoom, next);
      // Erst nach dem Neuzeichnen scrollen, sonst ist die Buehne noch zu klein.
      requestAnimationFrame(() => viewport.scrollTo({ left, top }));
    }
    setZoom(next);
  }

  // Tastatur: + / - zoomen, 0 setzt zurueck — nicht, solange ein Dialog offen ist.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (openHotspot || event.target instanceof HTMLInputElement) return;
      if (event.key === "+" || event.key === "=") changeZoom(zoomIn(zoom));
      else if (event.key === "-") changeZoom(zoomOut(zoom));
      else if (event.key === "0") changeZoom(ZOOM_LEVELS[0]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

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

  // #35 — das Foto merkt sich Stelle und Zoom; die Akte zeichnet daraus den Ausschnitt.
  function photograph(hotspot: Hotspot, evidence: NonNullable<Hotspot["evidence"]>) {
    onPhoto({
      evidenceId: evidence.id,
      takenAt: new Date().toISOString(),
      sceneName: scene.name,
      sceneImagePath: scene.imagePath,
      hotspotLabel: hotspot.label,
      x: hotspot.x,
      y: hotspot.y,
      zoom,
    });
    setConfirmation(`Foto von "${evidence.label}" aufgenommen.`);
  }

  function open(hotspot: Hotspot) {
    setOpenHotspot(hotspot);
    onInvestigate(hotspot.id);
  }

  return (
    <section className="scene" aria-label={`Tatort: ${scene.name}`}>
      <div className="scene__viewport" ref={viewportRef}>
        <div
          className="scene__stage"
          style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
        >
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
            if (done && hideDone) return null;
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
        </div>
      </div>

      <div className="scene__zoom" role="group" aria-label="Zoom">
        <button onClick={() => changeZoom(zoomOut(zoom))} disabled={zoom === ZOOM_LEVELS[0]} aria-label="Herauszoomen">
          −
        </button>
        <button onClick={() => changeZoom(ZOOM_LEVELS[0])} aria-label="Zoom zuruecksetzen">
          {Math.round(zoom * 100)} %
        </button>
        <button
          onClick={() => changeZoom(zoomIn(zoom))}
          disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          aria-label="Hineinzoomen"
        >
          +
        </button>
      </div>

      <div className="scene__overlay">
        <p className="scene__name">{scene.name}</p>
        <p className="scene__progress">
          {investigated.size} / {scene.hotspots.length} untersucht
        </p>
        <button
          className="scene__back"
          aria-pressed={hideDone}
          onClick={() => setHideDone((prev) => !prev)}
          disabled={investigated.size === 0}
        >
          {hideDone ? "Alle Stellen zeigen" : "Untersuchte ausblenden"}
        </button>
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
              {openHotspot.evidence && (
                <button onClick={() => photograph(openHotspot, openHotspot.evidence!)}>
                  {photographedIds.includes(openHotspot.evidence.id)
                    ? "Neues Foto aufnehmen"
                    : "Fotografieren"}
                </button>
              )}
              {/* #34 — Markierung bewusst zuruecknehmen, z. B. nach einem Hinweis aus dem Team. */}
              <button
                onClick={() => {
                  onToggleInvestigated(openHotspot.id);
                  setOpenHotspot(null);
                }}
              >
                Als offen markieren
              </button>
              <button onClick={() => setOpenHotspot(null)}>Schliessen</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
