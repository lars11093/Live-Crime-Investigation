import { describe, expect, it } from "vitest";
import { keepCenter, zoomIn, zoomOut } from "./zoom";

describe("Tatort-Zoom (#33)", () => {
  it("geht stufenweise hinein und hinaus", () => {
    expect(zoomIn(1)).toBe(1.5);
    expect(zoomIn(2)).toBe(3);
    expect(zoomOut(3)).toBe(2);
    expect(zoomOut(1.5)).toBe(1);
  });

  it("bleibt an den Grenzen stehen", () => {
    expect(zoomIn(3)).toBe(3);
    expect(zoomOut(1)).toBe(1);
  });

  it("haelt die Bildmitte beim Zoomen fest", () => {
    // 1000 px breit, ungezoomt, Mitte bei 500 -> bei 2x liegt die Mitte bei 1000,
    // also muss um 500 gescrollt werden.
    expect(keepCenter(0, 1000, 1, 2)).toBe(500);
    // Zurueck auf 1x: kein Scrollen mehr moeglich.
    expect(keepCenter(500, 1000, 2, 1)).toBe(0);
  });

  it("scrollt nie ueber den Rand hinaus", () => {
    expect(keepCenter(2000, 1000, 3, 3)).toBe(2000);
    expect(keepCenter(5000, 1000, 3, 3)).toBe(2000);
    expect(keepCenter(-50, 1000, 2, 2)).toBe(0);
  });
});
