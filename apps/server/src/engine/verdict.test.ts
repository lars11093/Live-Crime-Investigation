import { describe, expect, it } from "vitest";
import type { CaseDefinition, Scenario } from "@case-zero/shared";
import { evidenceLabels, judgeAccusation } from "./verdict.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const monica = caseDef.scenarios.find((s) => s.id === "scenario-monica") as Scenario;

describe("Aufloesung nach der Anklage (#28)", () => {
  it("gilt als geloest mit richtigem Taeter und tragendem Beweis", () => {
    const verdict = judgeAccusation(caseDef, monica, {
      suspectId: "monica-brandt",
      evidenceIds: ["tasse-lippenstift"],
    });
    expect(verdict.solved).toBe(true);
    expect(verdict.culprit).toEqual({ id: "monica-brandt", name: "Monica Brandt" });
    expect(verdict.resolution).toBe(monica.resolution);
  });

  it("gilt als nicht geloest mit falschem Taeter", () => {
    const verdict = judgeAccusation(caseDef, monica, {
      suspectId: "leo-fischer",
      evidenceIds: ["tasse-lippenstift"],
    });
    expect(verdict.solved).toBe(false);
    expect(verdict.findings[0]).toMatchObject({ topic: "suspect", correct: false });
    expect(verdict.findings[0].text).toContain("Monica Brandt");
  });

  it("gilt als nicht geloest, wenn kein Beweis die Loesung traegt", () => {
    const verdict = judgeAccusation(caseDef, monica, {
      suspectId: "monica-brandt",
      evidenceIds: ["kratzer-fensterrahmen"],
    });
    expect(verdict.solved).toBe(false);
  });

  it("benennt richtige, falsche und uebersehene Schluesse", () => {
    const verdict = judgeAccusation(caseDef, monica, {
      suspectId: "monica-brandt",
      evidenceIds: ["tasse-lippenstift", "kratzer-fensterrahmen"],
    });
    const byTopic = (topic: string) => verdict.findings.filter((f) => f.topic === topic);
    expect(byTopic("evidence").map((f) => f.correct)).toEqual([true, false]);
    expect(byTopic("missed")).toHaveLength(monica.keyEvidenceIds.length - 1);
  });

  it("kennt die Namen von Tatort-Funden und Nachrichten", () => {
    const labels = evidenceLabels(caseDef);
    expect(labels.get("tasse-lippenstift")).toBe("Tasse mit Lippenstiftabdruck");
    expect(labels.get("msg-vogt-07")).toContain("Monica Brandt");
  });

  it("verweist in jedem Szenario nur auf Beweise, die es im Fall gibt", () => {
    const labels = evidenceLabels(caseDef);
    for (const scenario of caseDef.scenarios) {
      for (const id of scenario.keyEvidenceIds) {
        expect(labels.has(id), `${scenario.id}: ${id}`).toBe(true);
      }
      expect(scenario.resolution.length).toBeGreaterThan(0);
    }
  });
});
