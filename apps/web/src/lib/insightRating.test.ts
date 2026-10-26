import { describe, expect, it } from "vitest";
import { parseRatings, rateInsight, sortByStrength } from "./insightRating";

const insight = (id: string) => ({ id, title: id, body: "" });

describe("Verknuepfung bewerten (#39)", () => {
  it("setzt und aendert die Staerke", () => {
    const once = rateInsight({}, "zeitluecke", 2);
    expect(once).toEqual({ zeitluecke: 2 });
    expect(rateInsight(once, "zeitluecke", 3)).toEqual({ zeitluecke: 3 });
  });

  it("nimmt die Bewertung bei erneutem Klick zurueck", () => {
    expect(rateInsight({ zeitluecke: 2 }, "zeitluecke", 2)).toEqual({});
  });

  it("sortiert stark zuerst, unbewertet zuletzt, sonst stabil", () => {
    const list = [insight("a"), insight("b"), insight("c"), insight("d")];
    const sorted = sortByStrength(list, { c: 3, b: 1, d: 3 });
    expect(sorted.map((i) => i.id)).toEqual(["c", "d", "b", "a"]);
  });

  it("liest nur gueltige Staerken ein", () => {
    expect(parseRatings({ a: 3, b: 7, c: "stark" })).toEqual({ a: 3 });
    expect(parseRatings(null)).toEqual({});
  });
});
