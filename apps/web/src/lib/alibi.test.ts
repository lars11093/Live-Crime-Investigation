import { describe, expect, it } from "vitest";
import {
  alibiTimeline,
  coversWindow,
  parseAlibiVerdicts,
  setAlibiVerdict,
  toMinutes,
} from "./alibi";

const window = { from: "22:30", to: "22:50" };

describe("Alibi gegen die Tatzeit pruefen (#42)", () => {
  it("rechnet Uhrzeiten in Minuten um", () => {
    expect(toMinutes("22:30")).toBe(1350);
    expect(toMinutes("7:05")).toBe(425);
    expect(toMinutes("25:00")).toBeNull();
    expect(toMinutes("abends")).toBeNull();
  });

  it("ordnet jede Angabe gegen das Tatzeitfenster ein", () => {
    const entries = alibiTimeline(
      "Ich war bis 22:10 im Buero und bin dann gegangen. Gegen 22:40 war ich bereits zu Hause.",
      window
    );
    expect(entries.map((e) => [e.time, e.inWindow, e.sentenceIndex])).toEqual([
      ["22:10", false, 0],
      ["22:40", true, 1],
    ]);
  });

  it("zaehlt die Raender zum Fenster", () => {
    const entries = alibiTimeline("Um 22:30 kam ich. Um 22:50 ging ich.", window);
    expect(entries.every((e) => e.inWindow)).toBe(true);
  });

  it("sortiert nach Uhrzeit, nicht nach Satzreihenfolge", () => {
    const entries = alibiTimeline("Ich ging um 22:45. Ich kam um 22:30.", window);
    expect(entries.map((e) => e.time)).toEqual(["22:30", "22:45"]);
  });

  it("erkennt, wenn die Aussage nichts zur Tatzeit sagt", () => {
    expect(coversWindow(alibiTimeline("Ich war bis 22:10 im Buero.", window), window)).toBe(false);
    expect(coversWindow(alibiTimeline(undefined, window), window)).toBe(false);
  });

  it("zaehlt einen Zeitraum, der die Tatzeit umschliesst, als Angabe", () => {
    const leo = alibiTimeline("Zwischen 22:00 und 23:00 war ich unten.", window);
    expect(leo.some((e) => e.inWindow)).toBe(false);
    expect(coversWindow(leo, window)).toBe(true);
    // Zwei Zeiten in verschiedenen Saetzen sind kein Zeitraum.
    const split = alibiTimeline("Um 22:00 kam ich. Um 23:00 ging ich.", window);
    expect(coversWindow(split, window)).toBe(false);
  });

  it("speichert die eigene Einschaetzung und nimmt sie zurueck", () => {
    const once = setAlibiVerdict({}, "daniel", "zweifelhaft");
    expect(once).toEqual({ daniel: "zweifelhaft" });
    expect(setAlibiVerdict(once, "daniel", "zweifelhaft")).toEqual({});
    expect(parseAlibiVerdicts({ a: "haltbar", b: "vielleicht" })).toEqual({ a: "haltbar" });
  });
});
