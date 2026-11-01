import { Vector3 } from "three";
import type { Object3D } from "three";
import type { Hotspot } from "@case-zero/shared";

export interface PlacedHotspot {
  hotspot: Hotspot;
  /** Weltposition des Markers im Modell; `null`, wenn das Modell keinen hat. */
  position: Vector3 | null;
}

/** Name des Markers, den das Blender-Skript pro Stelle ins Modell setzt. */
export function markerName(hotspotId: string): string {
  return `hotspot_${hotspotId}`;
}

/**
 * Ordnet jeder Stelle die Position ihres Markers `hotspot_<id>` im Modell zu
 * (#156). Stellen ohne Marker bekommen `null` und werden vom Client an ihren
 * x/y-Prozentwerten angezeigt — so bleibt jede Stelle erreichbar.
 */
export function placeHotspots(root: Object3D, hotspots: Hotspot[]): PlacedHotspot[] {
  root.updateMatrixWorld(true);
  return hotspots.map((hotspot) => {
    const marker = root.getObjectByName(markerName(hotspot.id));
    return { hotspot, position: marker ? marker.getWorldPosition(new Vector3()) : null };
  });
}
