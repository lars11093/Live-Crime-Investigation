import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { pickEnding } from "./ending.js";
import { judgeAccusation } from "./verdict.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Alternative Enden (#80)", () => {
  for (const scenario of caseDef.scenarios) {
    it(`hat für ${scenario.id} ein Ende für jeden Ausgang`, () => {
      expect(pickEnding(scenario, { suspectId: scenario.suspectId, evidenceIds: [] }, true)?.kind).toBe("solved");
      expect(pickEnding(scenario, { suspectId: scenario.suspectId, evidenceIds: [] }, false)?.kind).toBe(
        "insufficient"
      );
      for (const suspect of caseDef.suspects.filter((s) => s.id !== scenario.suspectId)) {
        expect(pickEnding(scenario, { suspectId: suspect.id, evidenceIds: [] }, false)?.kind).toBe("wrong");
      }
    });
  }

  it("unterscheidet die Enden je nach falsch angeklagter Person", () => {
    const daniel = caseDef.scenarios.find((s) => s.suspectId === "daniel-keller")!;
    const monica = pickEnding(daniel, { suspectId: "monica-brandt", evidenceIds: [] }, false);
    const leo = pickEnding(daniel, { suspectId: "leo-fischer", evidenceIds: [] }, false);
    expect(monica?.title).not.toBe(leo?.title);
  });

  it("kommt ohne Enden im Szenario aus und hängt an der Auflösung", () => {
    const scenario = { ...caseDef.scenarios[0], endings: undefined };
    expect(pickEnding(scenario, { suspectId: scenario.suspectId, evidenceIds: [] }, true)).toBeUndefined();
    const verdict = judgeAccusation(caseDef, caseDef.scenarios[0], {
      suspectId: caseDef.scenarios[0].suspectId,
      evidenceIds: caseDef.scenarios[0].keyEvidenceIds,
    });
    expect(verdict.ending?.kind).toBe("solved");
  });
});
