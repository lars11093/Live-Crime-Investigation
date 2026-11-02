import { describe, expect, it } from "vitest";
import { analyzeLocations, crimeWindowFrom, placeAtCrime } from "./deviceLocations";

describe("Standortdaten auswerten (#72)", () => {
  it("liest das Tatzeitfenster aus dem Briefing", () => {
    expect(crimeWindowFrom("Freitag, 12.09., zwischen 22:30 und 22:50 Uhr")).toEqual({ from: 1350, to: 1370 });
    expect(crimeWindowFrom("Freitag, 22:30 Uhr")).toEqual({ from: 1350, to: 1350 });
    expect(crimeWindowFrom(undefined)).toBeNull();
  });

  it("markiert Punkte in der Tatzeit und Ortswechsel", () => {
    const entries = analyzeLocations(
      [
        { at: "12.09. 22:16", place: "Serverraum" },
        { at: "12.09. 22:47", place: "Serverraum" },
        { at: "12.09. 23:52", place: "Parkhaus" },
      ],
      { from: 1350, to: 1370 }
    );
    expect(entries.map((e) => [e.inCrimeWindow, e.moved])).toEqual([
      [false, false],
      [true, false],
      [false, true],
    ]);
    expect(placeAtCrime(entries)).toBe("Serverraum");
  });

  it("kommt ohne Tatzeit aus", () => {
    const entries = analyzeLocations([{ at: "12.09. 22:40", place: "Büro" }], null);
    expect(entries[0].inCrimeWindow).toBe(false);
    expect(placeAtCrime(entries)).toBeNull();
  });
});
