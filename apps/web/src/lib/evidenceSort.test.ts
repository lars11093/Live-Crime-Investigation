import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import { formatCollectedAt, sortEvidence } from "./evidenceSort";
import { collectEvidence } from "./caseProgress";

const item = (id: string, kind: CollectedEvidence["kind"], label: string): CollectedEvidence => ({
  id,
  kind,
  label,
  description: "",
  foundAt: { sceneName: "Buero", hotspotLabel: "Stelle" },
});

// In Fundreihenfolge, wie die Akte gespeichert ist.
const akte = [
  item("zettel", "object", "Zettel mit Zahlenreihe"),
  item("badge", "message", "Badge-Protokoll"),
  item("tasse", "object", "Tasse mit Lippenstift"),
  item("kratzer", "fact", "Kratzspuren"),
];
const ids = (list: CollectedEvidence[]) => list.map((e) => e.id);

describe("Akte sortieren (#37)", () => {
  it("nach Fundzeit, aelteste oder neueste zuerst", () => {
    expect(ids(sortEvidence(akte, "found-asc"))).toEqual(["zettel", "badge", "tasse", "kratzer"]);
    expect(ids(sortEvidence(akte, "found-desc"))).toEqual(["kratzer", "tasse", "badge", "zettel"]);
  });

  it("nach Art, innerhalb einer Art in Fundreihenfolge", () => {
    // Feststellung, Gegenstand (zettel vor tasse), Nachricht
    expect(ids(sortEvidence(akte, "kind"))).toEqual(["kratzer", "zettel", "tasse", "badge"]);
  });

  it("nach Name", () => {
    expect(ids(sortEvidence(akte, "name"))).toEqual(["badge", "kratzer", "tasse", "zettel"]);
  });

  it("aendert die gespeicherte Akte nicht", () => {
    sortEvidence(akte, "name");
    expect(ids(akte)).toEqual(["zettel", "badge", "tasse", "kratzer"]);
  });
});

describe("Fundzeit festhalten (#37)", () => {
  it("stempelt einen neuen Fund beim Sichern", () => {
    const [stored] = collectEvidence([], akte[0], new Date("2026-10-26T20:47:00Z"));
    expect(stored.collectedAt).toBe("2026-10-26T20:47:00.000Z");
  });

  it("zeigt die Uhrzeit, ohne Stempel nichts", () => {
    expect(formatCollectedAt(undefined)).toBe("");
    expect(formatCollectedAt("kaputt")).toBe("");
    expect(formatCollectedAt("2026-10-26T20:47:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });
});
