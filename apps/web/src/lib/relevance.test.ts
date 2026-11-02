import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import { countByRelevance, isDigitalTrace, parseRelevance, setRelevance } from "./relevance";

const fromScene: CollectedEvidence = {
  id: "tasse",
  label: "Tasse",
  kind: "object",
  description: "",
  foundAt: { sceneName: "Büro 4.12", hotspotLabel: "Ablage" },
};

describe("Digitale Spur nach Relevanz bewerten (#47)", () => {
  it("erkennt digitale Spuren an der Herkunft", () => {
    expect(isDigitalTrace({ ...fromScene, source: "device" })).toBe(true);
    expect(isDigitalTrace(fromScene)).toBe(false);
  });

  it("erkennt auch Spuren aus alten Spielständen ohne Herkunft", () => {
    const old = { ...fromScene, foundAt: { sceneName: "Smartphone", hotspotLabel: "Chat · 12.09. 21:15" } };
    expect(isDigitalTrace(old)).toBe(true);
  });

  it("setzt, ändert und nimmt die Relevanz zurück", () => {
    const once = setRelevance({}, "msg-1", "hoch");
    expect(setRelevance(once, "msg-1", "niedrig")).toEqual({ "msg-1": "niedrig" });
    expect(setRelevance(once, "msg-1", "hoch")).toEqual({});
  });

  it("zählt pro Stufe, unbewertete als offen", () => {
    expect(countByRelevance(["a", "b", "c"], { a: "hoch", b: "hoch" })).toEqual({
      hoch: 2,
      mittel: 0,
      niedrig: 0,
      offen: 1,
    });
  });

  it("liest nur gültige Stufen ein", () => {
    expect(parseRelevance({ a: "hoch", b: "egal" })).toEqual({ a: "hoch" });
  });
});
