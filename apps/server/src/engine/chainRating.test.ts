import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { rateChain } from "./chainRating.js";
import { judgeAccusation } from "./verdict.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const monica = caseDef.scenarios.find((s) => s.suspectId === "monica-brandt")!;

describe("Beweiskette bewerten (#78)", () => {
  it("bewertet eine vollstaendige Kette als stark, ohne Schwaechen", () => {
    const rating = rateChain(caseDef, monica, { suspectId: monica.suspectId, evidenceIds: monica.keyEvidenceIds });
    expect(rating.level).toBe("stark");
    expect(rating.supporting).toBe(monica.keyEvidenceIds.length);
    expect(rating.weaknesses).toEqual([]);
  });

  it("nennt fehlende und ueberfluessige Beweise", () => {
    const rating = rateChain(caseDef, monica, {
      suspectId: monica.suspectId,
      evidenceIds: [monica.keyEvidenceIds[0], monica.keyEvidenceIds[1], "zettel-zahlenreihe"],
    });
    expect(rating.level).toBe("mittel");
    expect(rating.irrelevant).toBe(1);
    expect(rating.weaknesses.join(" ")).toContain("tragenden Beweisen fehlen");
    expect(rating.weaknesses.join(" ")).toContain("trägt nichts bei");
  });

  it("weist auf eine fehlende Art von Spur hin", () => {
    const physicalOnly = monica.keyEvidenceIds.filter((id) => !id.startsWith("msg-"));
    const rating = rateChain(caseDef, monica, { suspectId: monica.suspectId, evidenceIds: physicalOnly });
    expect(rating.weaknesses.join(" ")).toContain("digitale Spur");
  });

  it("ist beim falschen Taeter immer schwach", () => {
    const rating = rateChain(caseDef, monica, { suspectId: "leo-fischer", evidenceIds: monica.keyEvidenceIds });
    expect(rating.level).toBe("schwach");
    expect(rating.weaknesses[0]).toContain("falsche Person");
  });

  it("haengt an der Aufloesung", () => {
    const verdict = judgeAccusation(caseDef, monica, { suspectId: monica.suspectId, evidenceIds: ["badge-protokoll"] });
    expect(verdict.chain?.supporting).toBe(1);
  });
});
