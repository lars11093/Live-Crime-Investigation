import { describe, expect, it } from "vitest";
import { DIFFICULTY_INFO, sceneProgressText } from "./difficulty";

describe("Schwierigkeitsstufe im Client (#56)", () => {
  it("verschweigt auf schwer die Zahl der Stellen", () => {
    expect(sceneProgressText("schwer", 2, 5)).toBe("2 untersucht");
    expect(sceneProgressText("normal", 2, 5)).toBe("2 / 5 untersucht");
    expect(sceneProgressText("leicht", 0, 5)).toBe("0 / 5 untersucht");
  });

  it("beschreibt jede Stufe", () => {
    expect(Object.keys(DIFFICULTY_INFO)).toEqual(["leicht", "normal", "schwer"]);
  });
});
