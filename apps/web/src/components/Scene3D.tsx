import { Component, Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import type { Hotspot } from "@case-zero/shared";
import { placeHotspots } from "../lib/scenePlacement";

interface Props {
  modelPath: string;
  hotspots: Hotspot[];
  renderHotspot: (hotspot: Hotspot) => ReactNode;
  /** Modell nicht ladbar oder kein WebGL — SceneView faellt aufs Bild zurueck. */
  onError: () => void;
}

/**
 * 3D-Tatort: GLB laden, frei drehen und zoomen (Maus, Touch, Mausrad).
 *
 * Die Hotspot-Positionen kommen aus dem Modell selbst: jedes Objekt
 * `hotspot_<id>` markiert eine Stelle (siehe `tools/blender/`). So bleibt die
 * Platzierung beim Modellbau, und das Fall-JSON braucht nur `modelPath`.
 * Stellen ohne passendes Objekt erscheinen an ihrer x/y-Position ueber der Szene.
 */
export default function Scene3D({ modelPath, hotspots, renderHotspot, onError }: Props) {
  const [missing, setMissing] = useState<Hotspot[]>([]);

  return (
    <ModelErrorBoundary onError={onError}>
      <Canvas
        className="scene__canvas"
        camera={{ position: [4.6, 3.6, 5.2], fov: 45 }}
        dpr={[1, 2]}
        onCreated={({ gl }) => gl.setClearColor("#04060a")}
      >
        <hemisphereLight args={["#f2efe6", "#1a1814", 1.1]} />
        <directionalLight position={[3, 6, 4]} intensity={1.6} />
        <pointLight position={[-0.5, 2.5, -0.5]} intensity={6} distance={6} color="#ffe2b8" />
        <Suspense
          fallback={
            <Html center>
              <p className="scene__placeholder-hint">Tatort wird geladen …</p>
            </Html>
          }
        >
          <Model
            modelPath={modelPath}
            hotspots={hotspots}
            renderHotspot={renderHotspot}
            onMissing={setMissing}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          target={[-0.2, 0.6, -0.6]}
          enablePan={false}
          minDistance={1.2}
          maxDistance={9}
          // Nicht unter den Boden und nicht hinter die Waende (Diorama ist vorne/rechts offen).
          maxPolarAngle={Math.PI / 2.15}
          minAzimuthAngle={-0.25}
          maxAzimuthAngle={Math.PI / 2 + 0.25}
        />
      </Canvas>
      {missing.map((hotspot) => (
        <div
          key={hotspot.id}
          className="scene__hotspot-fallback"
          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
        >
          {renderHotspot(hotspot)}
        </div>
      ))}
    </ModelErrorBoundary>
  );
}

function Model({
  modelPath,
  hotspots,
  renderHotspot,
  onMissing,
}: Omit<Props, "onError"> & { onMissing: (hotspots: Hotspot[]) => void }) {
  const { scene } = useGLTF(modelPath);

  const placed = useMemo(() => placeHotspots(scene, hotspots), [scene, hotspots]);

  useEffect(() => {
    onMissing(placed.filter((p) => !p.position).map((p) => p.hotspot));
  }, [placed, onMissing]);

  return (
    <>
      <primitive object={scene} />
      {placed.map(
        ({ hotspot, position }) =>
          position && (
            <Html key={hotspot.id} position={position} center zIndexRange={[20, 0]}>
              {renderHotspot(hotspot)}
            </Html>
          )
      )}
    </>
  );
}

class ModelErrorBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
