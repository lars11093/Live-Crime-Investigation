import { describe, expect, it } from "vitest";
import type { Suspect } from "@case-zero/shared";
import { loadExcluded, orderSuspects, saveExcluded, toggleExcluded } from "./excludedSuspects";

const suspect = (id: string): Suspect => ({ id, name: id, age: 40, relationToVictim: "Kollege" });

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("Verdächtige ausschliessen (#69)", () => {
  it("schliesst aus und nimmt wieder auf", () => {
    expect(toggleExcluded([], "leo")).toEqual(["leo"]);
    expect(toggleExcluded(["leo", "monica"], "leo")).toEqual(["monica"]);
  });

  it("stellt Ausgeschlossene ans Ende", () => {
    const ids = orderSuspects([suspect("a"), suspect("b"), suspect("c")], ["a"]).map((s) => s.id);
    expect(ids).toEqual(["b", "c", "a"]);
  });

  it("merkt sich den Ausschluss pro Team-Code und ignoriert Kaputtes", () => {
    const storage = memoryStorage();
    saveExcluded(storage, "ABC-DEF", ["leo"]);
    expect(loadExcluded(storage, "ABC-DEF")).toEqual(["leo"]);
    expect(loadExcluded(storage, "XYZ-XYZ")).toEqual([]);
    storage.setItem("case-zero:excluded:ABC-DEF", "{kaputt");
    expect(loadExcluded(storage, "ABC-DEF")).toEqual([]);
  });
});
