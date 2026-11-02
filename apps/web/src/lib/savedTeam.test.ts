import { describe, expect, it } from "vitest";
import { loadSavedTeam, saveTeam } from "./savedTeam";

function memoryStorage() {
  const data = new Map<string, string>();
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
}

describe("Team merken (#57)", () => {
  it("merkt sich Code und Namen", () => {
    const storage = memoryStorage();
    saveTeam(storage, { code: "ABC-DEF", name: "Loris" });
    expect(loadSavedTeam(storage)).toEqual({ code: "ABC-DEF", name: "Loris" });
  });

  it("verwirft ungueltige Eintraege", () => {
    const storage = memoryStorage();
    expect(loadSavedTeam(storage)).toBeNull();
    storage.data.set("case-zero:last-team", JSON.stringify({ code: "falsch", name: "Loris" }));
    expect(loadSavedTeam(storage)).toBeNull();
    storage.data.set("case-zero:last-team", "{kaputt");
    expect(loadSavedTeam(storage)).toBeNull();
  });
});
