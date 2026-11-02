import { describe, expect, it } from "vitest";
import {
  EMPTY_ACCUSATION,
  attachEvidence,
  chooseSuspect,
  clearSuspect,
  toggleSuspect,
  detachEvidence,
  missingForAccusation,
  parseAccusation,
} from "./accusation";

describe("Beweise an die Anklage hängen (#26)", () => {
  it("hängt einen Beweis an", () => {
    const draft = attachEvidence(EMPTY_ACCUSATION, "tasse-lippenstift");
    expect(draft.evidenceIds).toEqual(["tasse-lippenstift"]);
  });

  it("hängt denselben Beweis nicht zweimal an", () => {
    const once = attachEvidence(EMPTY_ACCUSATION, "tasse-lippenstift");
    expect(attachEvidence(once, "tasse-lippenstift")).toBe(once);
  });

  it("entfernt einen angehängten Beweis wieder", () => {
    const draft = attachEvidence(attachEvidence(EMPTY_ACCUSATION, "a"), "b");
    expect(detachEvidence(draft, "a").evidenceIds).toEqual(["b"]);
  });

  it("ändert nichts, wenn der Beweis gar nicht angehängt war", () => {
    const draft = attachEvidence(EMPTY_ACCUSATION, "a");
    expect(detachEvidence(draft, "x")).toBe(draft);
  });

  it("verlangt mindestens einen Beweis", () => {
    const draft = { suspectId: "monica-brandt", evidenceIds: [] };
    expect(missingForAccusation(draft)).toEqual(["Mindestens ein Beweis muss angehängt werden."]);
  });

  it("ist mit Täter und einem Beweis vollständig", () => {
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

describe("Abgesendete Anklage (#27)", () => {
  const submitted = {
    suspectId: "monica-brandt",
    evidenceIds: ["a"],
    receipt: {
      suspectId: "monica-brandt",
      evidenceIds: ["a"],
      submittedAt: "2026-10-26T10:00:00.000Z",
      verdict: {
        solved: true,
        culprit: { id: "monica-brandt", name: "Monica Brandt" },
        resolution: "Sie war es.",
        findings: [],
      },
    },
  };

  it("lässt sich nach dem Absenden nicht mehr ändern", () => {
    expect(attachEvidence(submitted, "b")).toBe(submitted);
    expect(detachEvidence(submitted, "a")).toBe(submitted);
    expect(chooseSuspect(submitted, "daniel-keller")).toBe(submitted);
  });

  it("behält die Quittung beim Neuladen", () => {
    expect(parseAccusation(JSON.parse(JSON.stringify(submitted)))).toEqual(submitted);
  });

  it("wählt vor dem Absenden einen Täter", () => {
    expect(chooseSuspect(EMPTY_ACCUSATION, "leo-fischer").suspectId).toBe("leo-fischer");
  });
});

describe("Auflösung im gespeicherten Stand (#28)", () => {
  it("verwirft eine Quittung ohne Auflösung", () => {
    const old = {
      suspectId: "monica-brandt",
      evidenceIds: ["a"],
      receipt: { suspectId: "monica-brandt", evidenceIds: ["a"], submittedAt: "2026-10-26" },
    };
    expect(parseAccusation(old).receipt).toBeUndefined();
  });
});

describe("Täterauswahl vor dem Absenden ändern (#51)", () => {
  const draft = { suspectId: "monica-brandt", evidenceIds: ["tasse"] };

  it("wechselt zu einer anderen Person und behält die Beweise", () => {
    expect(chooseSuspect(draft, "daniel-keller")).toEqual({
      suspectId: "daniel-keller",
      evidenceIds: ["tasse"],
    });
  });

  it("hebt die Auswahl auf, Beweise bleiben", () => {
    expect(clearSuspect(draft)).toEqual({ suspectId: null, evidenceIds: ["tasse"] });
  });

  it("hebt mit einem zweiten Klick auf dieselbe Person auf", () => {
    expect(toggleSuspect(draft, "monica-brandt").suspectId).toBeNull();
    expect(toggleSuspect(draft, "leo-fischer").suspectId).toBe("leo-fischer");
  });

  it("ändert nach dem Absenden nichts mehr", () => {
    const submitted = {
      ...draft,
      receipt: {
        ...draft,
        submittedAt: "2026-10-26T10:00:00.000Z",
        verdict: { solved: false, culprit: { id: "x", name: "X" }, resolution: "", findings: [] },
      },
    };
    expect(clearSuspect(submitted)).toBe(submitted);
    expect(toggleSuspect(submitted, "monica-brandt")).toBe(submitted);
  });
});
