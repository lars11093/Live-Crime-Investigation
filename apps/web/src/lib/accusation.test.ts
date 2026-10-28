import { describe, expect, it } from "vitest";
import {
  EMPTY_ACCUSATION,
  attachEvidence,
  detachEvidence,
  missingForAccusation,
  parseAccusation,
} from "./accusation";

describe("Beweise an die Anklage haengen (#26)", () => {
  it("haengt einen Beweis an", () => {
    const draft = attachEvidence(EMPTY_ACCUSATION, "tasse-lippenstift");
    expect(draft.evidenceIds).toEqual(["tasse-lippenstift"]);
  });

  it("haengt denselben Beweis nicht zweimal an", () => {
    const once = attachEvidence(EMPTY_ACCUSATION, "tasse-lippenstift");
    expect(attachEvidence(once, "tasse-lippenstift")).toBe(once);
  });

  it("entfernt einen angehaengten Beweis wieder", () => {
    const draft = attachEvidence(attachEvidence(EMPTY_ACCUSATION, "a"), "b");
    expect(detachEvidence(draft, "a").evidenceIds).toEqual(["b"]);
  });

  it("aendert nichts, wenn der Beweis gar nicht angehaengt war", () => {
    const draft = attachEvidence(EMPTY_ACCUSATION, "a");
    expect(detachEvidence(draft, "x")).toBe(draft);
  });

  it("verlangt mindestens einen Beweis", () => {
    const draft = { suspectId: "monica-brandt", evidenceIds: [] };
    expect(missingForAccusation(draft)).toEqual(["Mindestens ein Beweis muss angehaengt werden."]);
  });

  it("ist mit Taeter und einem Beweis vollstaendig", () => {
    expect(missingForAccusation({ suspectId: "monica-brandt", evidenceIds: ["a"] })).toEqual([]);
  });

  it("liest kaputte gespeicherte Daten als leeren Entwurf", () => {
    expect(parseAccusation("kaputt")).toEqual(EMPTY_ACCUSATION);
    expect(parseAccusation({ suspectId: 3, evidenceIds: ["a", 4] })).toEqual({
      suspectId: null,
      evidenceIds: ["a"],
    });
  });
});
