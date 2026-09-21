import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { combineEvidence } from "./combine.js";
import { toPublicCase } from "./caseView.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const [first] = caseDef.combinations;
const [aId, bId] = first.evidenceIds;

describe("Beweise kombinieren", () => {
  it("findet ein gueltiges Paar", () => {
    const result = combineEvidence(caseDef, aId, bId);
    expect(result).toEqual({ ok: true, insight: first.insight });
  });

  it("findet dasselbe Paar auch in umgekehrter Reihenfolge", () => {
    expect(combineEvidence(caseDef, bId, aId)).toEqual({ ok: true, insight: first.insight });
  });

  it("meldet ein Paar ohne Zusammenhang", () => {
    expect(combineEvidence(caseDef, aId, "gibt-es-nicht")).toEqual({
      ok: false,
      reason: "no-connection",
    });
  });

  it("weist denselben Beweis zweimal ab", () => {
    expect(combineEvidence(caseDef, aId, aId)).toEqual({ ok: false, reason: "invalid" });
  });

  it("weist leere IDs ab", () => {
    expect(combineEvidence(caseDef, "", bId)).toEqual({ ok: false, reason: "invalid" });
  });

  it("gibt eine bereits gefundene Erkenntnis kein zweites Mal aus", () => {
    expect(combineEvidence(caseDef, aId, bId, [first.insight.id])).toEqual({
      ok: false,
      reason: "already-found",
    });
  });
});

describe("Die Kombinationsliste verlaesst den Server nicht", () => {
  it("fehlt in der Client-Antwort", () => {
    expect("combinations" in toPublicCase(caseDef)).toBe(false);
  });

  it("gibt keine Erkenntnis vorab preis", () => {
    const serialized = JSON.stringify(toPublicCase(caseDef));
    for (const combination of caseDef.combinations) {
      expect(serialized).not.toContain(combination.insight.title);
      expect(serialized).not.toContain(combination.insight.body);
    }
  });
});
