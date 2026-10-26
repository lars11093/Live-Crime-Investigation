import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import { NO_FILTER, filterEvidence, toggleKind } from "./evidenceFilter";

const item = (id: string, kind: CollectedEvidence["kind"], label: string, description = ""): CollectedEvidence => ({
  id,
  kind,
  label,
  description,
  foundAt: { sceneName: "Buero 4.12", hotspotLabel: "Schreibtisch" },
});

const akte = [
  item("tasse", "object", "Tasse mit Lippenstiftabdruck", "Halbvolle, kalte Tasse."),
  item("badge", "message", "Badge-Protokoll nach 22:00 Uhr", "Drei Zutritte."),
  item("kratzer", "fact", "Kratzspuren am Fensterrahmen", "Frische Kratzer."),
];

describe("Beweise filtern (#36)", () => {
  it("zeigt ohne Filter alles", () => {
    expect(filterEvidence(akte, NO_FILTER)).toEqual(akte);
  });

  it("sucht in Titel und Beschreibung, egal ob gross oder klein", () => {
    expect(filterEvidence(akte, { query: "TASSE", kinds: [] }).map((e) => e.id)).toEqual(["tasse"]);
    expect(filterEvidence(akte, { query: "zutritte", kinds: [] }).map((e) => e.id)).toEqual(["badge"]);
  });

  it("findet auch ueber die eigene Notiz", () => {
    const notes = { kratzer: "Passt zu Monica?" };
    expect(filterEvidence(akte, { query: "monica", kinds: [] }, notes).map((e) => e.id)).toEqual([
      "kratzer",
    ]);
  });

  it("verlangt alle Woerter", () => {
    expect(filterEvidence(akte, { query: "tasse kalte", kinds: [] })).toHaveLength(1);
    expect(filterEvidence(akte, { query: "tasse badge", kinds: [] })).toHaveLength(0);
  });

  it("behandelt Umlaute und ihre Umschreibung gleich", () => {
    const list = [item("k", "object", "Notebook mit Kuendigungsentwurf")];
    expect(filterEvidence(list, { query: "Kündigung", kinds: [] })).toHaveLength(1);
  });

  it("filtert nach Art und kombiniert mit der Suche", () => {
    const onlyFacts = toggleKind(NO_FILTER, "fact");
    expect(filterEvidence(akte, onlyFacts).map((e) => e.id)).toEqual(["kratzer"]);
    expect(filterEvidence(akte, { ...onlyFacts, query: "tasse" })).toEqual([]);
    expect(toggleKind(onlyFacts, "fact")).toEqual(NO_FILTER);
  });
});
