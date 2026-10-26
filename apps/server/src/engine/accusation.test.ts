import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { submitAccusation, validateSubmission } from "./accusation.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Anklage absenden (#27)", () => {
  it("nimmt eine Anklage mit Taeter und Beweis an", () => {
    const room = createRoom(caseDef);
    const result = submitAccusation(
      room,
      { suspectId: "monica-brandt", evidenceIds: ["tasse-lippenstift"] },
      new Date("2026-10-26T10:00:00Z")
    );
    expect(result).toMatchObject({
      ok: true,
      receipt: {
        suspectId: "monica-brandt",
        evidenceIds: ["tasse-lippenstift"],
        submittedAt: "2026-10-26T10:00:00.000Z",
      },
    });
    // Die Aufloesung kommt mit der Quittung (#28).
    expect(result.ok && result.receipt.verdict.culprit.id).toBe(room.scenario.suspectId);
  });

  it("lehnt eine Anklage ohne Beweis ab", () => {
    const result = validateSubmission(caseDef, { suspectId: "monica-brandt", evidenceIds: [] });
    expect(result.ok).toBe(false);
  });

  it("lehnt einen unbekannten Taeter ab", () => {
    const result = validateSubmission(caseDef, { suspectId: "niemand", evidenceIds: ["a"] });
    expect(result.ok).toBe(false);
  });

  it("lehnt Unsinn ohne Absturz ab", () => {
    expect(validateSubmission(caseDef, null).ok).toBe(false);
    expect(validateSubmission(caseDef, "kaputt").ok).toBe(false);
  });

  it("entfernt doppelte Beweise", () => {
    const result = validateSubmission(caseDef, {
      suspectId: "leo-fischer",
      evidenceIds: ["a", "a", "b"],
    });
    expect(result).toEqual({ ok: true, submission: { suspectId: "leo-fischer", evidenceIds: ["a", "b"] } });
  });

  it("sperrt die Anklage nach dem ersten Absenden", () => {
    const room = createRoom(caseDef);
    const first = submitAccusation(room, { suspectId: "monica-brandt", evidenceIds: ["a"] });
    const second = submitAccusation(room, { suspectId: "daniel-keller", evidenceIds: ["b"] });
    expect(first.ok).toBe(true);
    expect(second).toMatchObject({ ok: false, reason: "already-submitted" });
    // Die erste Quittung bleibt gueltig, die zweite Anklage aendert nichts.
    expect(room.accusation?.suspectId).toBe("monica-brandt");
  });
});

describe("Punktzahl mit der Quittung (#54)", () => {
  it("rechnet die Dauer seit dem Anlegen der Session ein", () => {
    const room = createRoom(caseDef);
    room.createdAt = new Date("2026-10-26T10:00:00Z");
    const result = submitAccusation(
      room,
      { suspectId: room.scenario.suspectId, evidenceIds: [room.scenario.keyEvidenceIds[0]] },
      new Date("2026-10-26T10:20:00Z")
    );
    const labels = result.ok ? result.receipt.verdict.score?.breakdown.map((b) => b.label) : [];
    expect(labels).toContain("Schnell geloest (< 30 Min.)");
  });
});
