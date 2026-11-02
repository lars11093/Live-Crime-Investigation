import { describe, expect, it } from "vitest";
import { LINE_MS, introSeen, markIntroSeen, visibleLineCount } from "./intro";

describe("Intro (#58)", () => {
  it("blendet die Zeilen nacheinander ein", () => {
    expect(visibleLineCount(0, 5)).toBe(1);
    expect(visibleLineCount(LINE_MS, 5)).toBe(2);
    expect(visibleLineCount(LINE_MS * 20, 5)).toBe(5);
    expect(visibleLineCount(100, 0)).toBe(0);
  });

  it("merkt sich pro Team-Code, dass das Intro gelaufen ist", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    expect(introSeen(storage, "ABC-DEF")).toBe(false);
    markIntroSeen(storage, "ABC-DEF");
    expect(introSeen(storage, "ABC-DEF")).toBe(true);
    expect(introSeen(storage, "XYZ-XYZ")).toBe(false);
  });
});
