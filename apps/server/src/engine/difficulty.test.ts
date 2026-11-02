import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { difficultyOf, parseDifficulty, setDifficulty } from "./difficulty.js";
import case01 from "../data/case-01.json" with { type: "json" };

describe("Schwierigkeitsstufe (#56)", () => {
  it("nimmt nur bekannte Stufen an, sonst normal", () => {
    expect(parseDifficulty("schwer")).toBe("schwer");
    expect(parseDifficulty("extrem")).toBe("normal");
    expect(parseDifficulty(undefined)).toBe("normal");
  });

  it("haelt die Stufe pro Team-Session", () => {
    const a = createRoom(case01 as CaseDefinition);
    const b = createRoom(case01 as CaseDefinition);
    setDifficulty(a, "leicht");
    expect(difficultyOf(a)).toBe("leicht");
    expect(difficultyOf(b)).toBe("normal");
  });
});
