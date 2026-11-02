import { describe, expect, it } from "vitest";
import type { CaseDefinition, Scenario } from "@case-zero/shared";
import { POINTS, scoreAccusation } from "./score.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const monica = caseDef.scenarios.find((s) => s.id === "scenario-monica") as Scenario;
const max =
  POINTS.rightSuspect + monica.keyEvidenceIds.length * POINTS.perKeyEvidence + POINTS.fullChain + POINTS.fastUnder30;

describe("Punktzahl am Ende (#54)", () => {
  it("vergibt die Höchstpunktzahl für die vollständige, schnelle Lösung", () => {
    const score = scoreAccusation(
      monica,
      { suspectId: "monica-brandt", evidenceIds: monica.keyEvidenceIds },
      20
    );
    expect(score.points).toBe(max);
    expect(score.maxPoints).toBe(max);
    expect(score.rank).toBe("Meisterhafte Ermittlung");
  });

  it("schlüsselt die Punkte auf", () => {
    const score = scoreAccusation(
      monica,
      { suspectId: "monica-brandt", evidenceIds: ["tasse-lippenstift", "kratzer-fensterrahmen"] },
      45
    );
    expect(score.breakdown).toEqual([
      { label: "Richtiger Täter", points: 500 },
      { label: "1 tragender Beweis", points: 100 },
      { label: "1 Beweis ohne Bezug zur Lösung", points: -25 },
      { label: "Zügig gelöst (< 60 Min.)", points: 50 },
    ]);
    expect(score.points).toBe(625);
  });

  it("gibt für Tempo nur Punkte, wenn der Täter stimmt", () => {
    const score = scoreAccusation(monica, { suspectId: "leo-fischer", evidenceIds: ["tasse-lippenstift"] }, 5);
    expect(score.breakdown.map((b) => b.label)).toEqual(["1 tragender Beweis"]);
    expect(score.rank).toBe("Fehlermittlung");
  });

  it("fällt nie unter null", () => {
    const score = scoreAccusation(
      monica,
      { suspectId: "leo-fischer", evidenceIds: ["a", "b", "c"] },
      null
    );
    expect(score.points).toBe(0);
  });

  it("zählt ohne bekannte Dauer keinen Tempobonus", () => {
    const score = scoreAccusation(monica, { suspectId: "monica-brandt", evidenceIds: ["tasse-lippenstift"] }, null);
    expect(score.breakdown.some((b) => b.label.includes("geloest"))).toBe(false);
  });
});
