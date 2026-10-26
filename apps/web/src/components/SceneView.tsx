import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { CollectedEvidence, Difficulty, Hotspot, Scene, SceneTool } from "@case-zero/shared";
import { sceneProgressText } from "../lib/difficulty";
import { TOOL_LABEL, toolsIn, visibleHotspots } from "../lib/sceneTools";
import { ZOOM_LEVELS, keepCenter, zoomIn, zoomOut } from "../lib/zoom";

// three.js ist gross — erst laden, wenn ein Tatort wirklich ein 3D-Modell hat.
const Scene3D = lazy(() => import("./Scene3D"));

interface Props {
  scene: Scene;
  /** Alle Tatorte des Falls (#159) — ab zwei erscheint die Umschaltung. */
  scenes: Scene[];
  onSwitchScene: (sceneId: string) => void;
  /** IDs bereits untersuchter Stellen — bleibt beim Verlassen der Szene erhalten. */
  investigatedIds: string[];
  onInvestigate: (hotspotId: string) => void;
  /** IDs bereits eingesammelter Funde (#9). */
  collectedIds: string[];
  onCollect: (evidence: CollectedEvidence) => void;
  onBack: () => void;
  /** Schwierigkeitsstufe der Session (#56). */
  difficulty?: Difficulty;
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
 * genau auf ihrem Bilddetail. Das 3D-Modell (#156) zoomt selbst per Mausrad.
 */
export function SceneView({
  scene,
  scenes,
  onSwitchScene,
  investigatedIds,
  onInvestigate,
  collectedIds,
  onCollect,
  onBack,
  difficulty = "normal",
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const [modelFailed, setModelFailed] = useState(false);
  const [openHotspot, setOpenHotspot] = useState<Hotspot | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  // #60 — eingeschaltetes Werkzeug, z. B. die UV-Lampe.
  const [tool, setTool] = useState<SceneTool | null>(null);
  const tools = toolsIn(scene.hotspots);
  const activeTool = tool && tools.includes(tool) ? tool : null;
  const shown = visibleHotspots(scene.hotspots, activeTool, investigatedIds);
  const show3d = Boolean(scene.modelPath) && !modelFailed;
  const [zoom, setZoom] = useState<number>(ZOOM_LEVELS[0]);
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
    if (show3d) return;
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

  function open(hotspot: Hotspot) {
    setOpenHotspot(hotspot);
    onInvestigate(hotspot.id);
  }

  function hotspotButton(hotspot: Hotspot, style?: CSSProperties) {
    const done = investigated.has(hotspot.id);
    // #56 — auf "leicht" sind Stellen mit noch nicht gesichertem Fund markiert.
    const hint = difficulty === "leicht" && hotspot.evidence && !collected.has(hotspot.evidence.id);
    return (
      <button
        key={hotspot.id}
        className={`hotspot${style ? "" : " hotspot--3d"}${done ? " hotspot--done" : ""}${hint ? " hotspot--find" : ""}`}
        style={style}
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
  }

  return (
    <section className={`scene scene--${difficulty}${activeTool ? ` scene--${activeTool}` : ""}`} aria-label={`Tatort: ${scene.name}`}>
      {show3d ? (
        <Suspense fallback={<p className="scene__loading">Tatort wird geladen …</p>}>
          <Scene3D
            modelPath={scene.modelPath!}
            hotspots={shown}
            renderHotspot={(hotspot) => hotspotButton(hotspot)}
            onError={() => setModelFailed(true)}
          />
        </Suspense>
      ) : (
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

            {shown.map((hotspot) =>
              hotspotButton(hotspot, { left: `${hotspot.x}%`, top: `${hotspot.y}%` })
            )}
          </div>
        </div>
      )}

      {!show3d && (
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
      )}

      <div className="scene__overlay">
        <p className="scene__name">{scene.name}</p>
        <p className="scene__progress">
          {/* Nur die Stellen dieses Tatorts — investigatedIds gilt fuer den ganzen Fall. */}
          {sceneProgressText(
            difficulty,
            scene.hotspots.filter((h) => investigated.has(h.id)).length,
            scene.hotspots.length
          )}
        </p>
        {scenes.length > 1 && (
          <nav className="scene__switch" aria-label="Tatort wechseln">
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => onSwitchScene(s.id)}
                aria-current={s.id === scene.id ? "page" : undefined}
                disabled={s.id === scene.id}
              >
                {s.name}
              </button>
            ))}
          </nav>
        )}
        {tools.map((t) => (
          <button
            key={t}
            className="scene__back"
            aria-pressed={activeTool === t}
            onClick={() => setTool((prev) => (prev === t ? null : t))}
          >
            {TOOL_LABEL[t]} {activeTool === t ? "aus" : "an"}
          </button>
        ))}
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
