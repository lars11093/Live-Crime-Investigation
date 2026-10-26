import { describe, expect, it } from "vitest";
import type { ProgressStorage } from "./caseProgress";
import { playerIdentity } from "./player";

function fakeStorage(): ProgressStorage {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe("Spieler-Identitaet (#31)", () => {
  it("nimmt mit Konto dessen ID und Namen", () => {
    expect(playerIdentity(fakeStorage(), { id: "anna", name: "Anna" })).toEqual({
      id: "anna",
      name: "Anna",
    });
  });

  it("gibt Gaesten eine feste ID, die ein Neuladen ueberlebt", () => {
    const storage = fakeStorage();
    const first = playerIdentity(storage, null, () => "ab12cd");
    const again = playerIdentity(storage, null, () => "zzzzzz");
    expect(first).toEqual({ id: "gast-ab12cd", name: "Gast AB12" });
    expect(again).toEqual(first);
  });
});
