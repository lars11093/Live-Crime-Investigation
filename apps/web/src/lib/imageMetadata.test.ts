import { describe, expect, it } from "vitest";
import { formatGps, metadataRows, metadataSummary } from "./imageMetadata";

describe("Bild-Metadaten auslesen (#45)", () => {
  const meta = {
    takenAt: "12.09. 20:44",
    camera: "Google Pixel 7",
    gps: { lat: 47.38912, lng: 8.51574, place: "Hardturmstrasse 61" },
    resolution: "4080 × 3072",
  };

  it("zeigt die vorhandenen Felder in fester Reihenfolge", () => {
    expect(metadataRows(meta).map((r) => r.label)).toEqual([
      "Aufnahmezeit",
      "Geraet",
      "GPS",
      "Aufloesung",
    ]);
  });

  it("formatiert Koordinaten mit Himmelsrichtung", () => {
    expect(formatGps(47.38912, 8.51574)).toBe("47.38912° N, 8.51574° E");
    expect(formatGps(-33.9, -70.6)).toBe("33.90000° S, 70.60000° W");
  });

  it("laesst fehlende Felder weg, ausser GPS wurde bewusst nicht aufgezeichnet", () => {
    expect(metadataRows({ takenAt: "12.09. 21:12" })).toEqual([
      { label: "Aufnahmezeit", value: "12.09. 21:12" },
    ]);
    expect(metadataRows({ takenAt: "x", gpsDisabled: true })[1]).toEqual({
      label: "GPS",
      value: "nicht aufgezeichnet",
    });
  });

  it("fasst fuer die Akte zusammen", () => {
    expect(metadataSummary(meta)).toBe("aufgenommen 12.09. 20:44 · Google Pixel 7 · Hardturmstrasse 61");
  });
});
