import { describe, expect, it } from "vitest";
import { accountIdFor, loadAccount, login, logout, validateName } from "./account";
import { EMPTY_PROGRESS, loadProgress, saveProgress, type ProgressStorage } from "./caseProgress";

function fakeStorage(): ProgressStorage {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe("Anmelden (#29)", () => {
  it("leitet aus dem Namen eine stabile Konto-ID ab", () => {
    expect(accountIdFor("  Jürg Müller ")).toBe("juerg-mueller");
    expect(accountIdFor("JÜRG müller")).toBe(accountIdFor("Jürg Müller"));
  });

  it("weist zu kurze, zu lange und leere Namen ab", () => {
    expect(validateName("a")).not.toBeNull();
    expect(validateName("x".repeat(25))).not.toBeNull();
    expect(validateName("!!!")).not.toBeNull();
    expect(validateName("Ermittlerin 7")).toBeNull();
  });

  it("merkt sich die Anmeldung und vergisst sie beim Abmelden", () => {
    const storage = fakeStorage();
    expect(login(storage, "Ermittlerin 7")).toEqual({ id: "ermittlerin-7", name: "Ermittlerin 7" });
    expect(loadAccount(storage)?.name).toBe("Ermittlerin 7");
    logout(storage);
    expect(loadAccount(storage)).toBeNull();
  });

  it("meldet mit ungueltigem Namen nicht an", () => {
    const storage = fakeStorage();
    expect(login(storage, " ")).toBeNull();
    expect(loadAccount(storage)).toBeNull();
  });

  it("ordnet den Fortschritt dem Konto zu", () => {
    const storage = fakeStorage();
    const notes = { "tasse-lippenstift": "Lippenstift!" };
    saveProgress(storage, "ABC-123", { ...EMPTY_PROGRESS, notes }, "ermittlerin-7");
    // Dasselbe Konto findet seinen Stand wieder ...
    expect(loadProgress(storage, "ABC-123", "ermittlerin-7").notes).toEqual(notes);
    // ... ein anderes Konto und ein Gast nicht.
    expect(loadProgress(storage, "ABC-123", "kommissar-x").notes).toEqual({});
    expect(loadProgress(storage, "ABC-123").notes).toEqual({});
  });
});
