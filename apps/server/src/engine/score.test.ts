import { describe, expect, it } from "vitest";
import type { CaseDefinition, Scenario } from "@case-zero/shared";
import { POINTS, scoreAccusation } from "./score.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const monica = caseDef.scenarios.find((s) => s.id === "scenario-monica") as Scenario;
const max =
  POINTS.rightSuspect + monica.keyEvidenceIds.length * POINTS.perKeyEvidence + POINTS.fullChain + POINTS.fastUnder30;

describe("Punktzahl am Ende (#54)", () => {
  it("vergibt die Hoechstpunktzahl fuer die vollstaendige, schnelle Loesung", () => {
    const score = scoreAccusation(
      monica,
      { suspectId: "monica-brandt", evidenceIds: monica.keyEvidenceIds },
      20
    );
    expect(score.points).toBe(max);
    expect(score.maxPoints).toBe(max);
    expect(score.rank).toBe("Meisterhafte Ermittlung");
  });

  it("schluesselt die Punkte auf", () => {
    const score = scoreAccusation(
      monica,
      { suspectId: "monica-brandt", evidenceIds: ["tasse-lippenstift", "kratzer-fensterrahmen"] },
      45
    );
    expect(score.breakdown).toEqual([
      { label: "Richtiger Taeter", points: 500 },
      { label: "1 tragender Beweis", points: 100 },
      { label: "1 Beweis ohne Bezug zur Loesung", points: -25 },
      { label: "Zuegig geloest (< 60 Min.)", points: 50 },
    ]);
    expect(score.points).toBe(625);
  });

  it("gibt fuer Tempo nur Punkte, wenn der Taeter stimmt", () => {
    const score = scoreAccusation(monica, { suspectId: "leo-fischer", evidenceIds: ["tasse-lippenstift"] }, 5);
    expect(score.breakdown.map((b) => b.label)).toEqual(["1 tragender Beweis"]);
    expect(score.rank).toBe("Fehlermittlung");
  });

  it("faellt nie unter null", () => {
    const score = scoreAccusation(
      monica,
      { suspectId: "leo-fischer", evidenceIds: ["a", "b", "c"] },
      null
    );
    expect(score.points).toBe(0);
  });

  it("zaehlt ohne bekannte Dauer keinen Tempobonus", () => {
    const score = scoreAccusation(monica, { suspectId: "monica-brandt", evidenceIds: ["tasse-lippenstift"] }, null);
    expect(score.breakdown.some((b) => b.label.includes("geloest"))).toBe(false);
  });
});
