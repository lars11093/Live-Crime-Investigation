import { describe, expect, it } from "vitest";
import { Group, Object3D } from "three";
import type { Hotspot } from "@case-zero/shared";
import { markerName, placeHotspots } from "./scenePlacement";

const hotspot = (id: string): Hotspot => ({ id, label: id, x: 10, y: 20, detail: "" });

describe("Hotspots im 3D-Modell platzieren", () => {
  it("nimmt die Weltposition des Markers, inklusive Eltern-Verschiebung", () => {
    const root = new Group();
    const room = new Group();
    room.position.set(1, 0, 0);
    const marker = new Object3D();
    marker.name = markerName("schreibtisch");
    marker.position.set(0.5, 0.9, -1);
    room.add(marker);
    root.add(room);

    const [placed] = placeHotspots(root, [hotspot("schreibtisch")]);

    expect(placed.position?.toArray()).toEqual([1.5, 0.9, -1]);
  });

  it("liefert null für Stellen ohne Marker, statt sie zu verlieren", () => {
    const placed = placeHotspots(new Group(), [hotspot("fenster")]);

    expect(placed).toHaveLength(1);
    expect(placed[0].hotspot.id).toBe("fenster");
    expect(placed[0].position).toBeNull();
  });

  it("behält die Reihenfolge der Falldaten", () => {
    const root = new Group();
    for (const id of ["b", "a"]) {
      const m = new Object3D();
      m.name = markerName(id);
      root.add(m);
    }

    const ids = placeHotspots(root, [hotspot("a"), hotspot("b")]).map((p) => p.hotspot.id);

    expect(ids).toEqual(["a", "b"]);
  });
});
