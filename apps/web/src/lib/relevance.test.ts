import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import { countByRelevance, isDigitalTrace, parseRelevance, setRelevance } from "./relevance";

const fromScene: CollectedEvidence = {
  id: "tasse",
  label: "Tasse",
  kind: "object",
  description: "",
  foundAt: { sceneName: "Buero 4.12", hotspotLabel: "Ablage" },
};

describe("Digitale Spur nach Relevanz bewerten (#47)", () => {
  it("erkennt digitale Spuren an der Herkunft", () => {
    expect(isDigitalTrace({ ...fromScene, source: "device" })).toBe(true);
    expect(isDigitalTrace(fromScene)).toBe(false);
  });

  it("erkennt auch Spuren aus alten Spielstaenden ohne Herkunft", () => {
    const old = { ...fromScene, foundAt: { sceneName: "Smartphone", hotspotLabel: "Chat · 12.09. 21:15" } };
    expect(isDigitalTrace(old)).toBe(true);
  });

  it("setzt, aendert und nimmt die Relevanz zurueck", () => {
    const once = setRelevance({}, "msg-1", "hoch");
    expect(setRelevance(once, "msg-1", "niedrig")).toEqual({ "msg-1": "niedrig" });
    expect(setRelevance(once, "msg-1", "hoch")).toEqual({});
  });

  it("zaehlt pro Stufe, unbewertete als offen", () => {
    expect(countByRelevance(["a", "b", "c"], { a: "hoch", b: "hoch" })).toEqual({
      hoch: 2,
      mittel: 0,
      niedrig: 0,
      offen: 1,
    });
  });

  it("liest nur gueltige Stufen ein", () => {
    expect(parseRelevance({ a: "hoch", b: "egal" })).toEqual({ a: "hoch" });
  });
});
