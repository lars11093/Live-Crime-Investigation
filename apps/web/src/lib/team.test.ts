import { describe, expect, it, vi } from "vitest";
import type { ProgressStorage } from "./caseProgress";

// Der Hook in team.ts baut beim Import eine Socket-Verbindung auf. Für die
// reinen Funktionen hier wird sie nicht gebraucht.
vi.mock("./socket", () => ({ socket: {} }));

const { MAX_NAME_LENGTH, loadName, nameError, saveName, shareMessage } = await import("./team");

function fakeStorage(): ProgressStorage {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe("Name prüfen", () => {
  it("akzeptiert einen normalen Namen", () => {
    expect(nameError("Loris")).toBeNull();
  });

  it("weist einen leeren Namen ab", () => {
    expect(nameError("   ")).not.toBeNull();
  });

  it("weist einen zu langen Namen ab", () => {
    expect(nameError("x".repeat(MAX_NAME_LENGTH + 1))).not.toBeNull();
    expect(nameError("x".repeat(MAX_NAME_LENGTH))).toBeNull();
  });
});

describe("Name speichern", () => {
  it("liest zurück, was gespeichert wurde", () => {
    const storage = fakeStorage();
    saveName(storage, "ABC-123", "Loris");
    expect(loadName(storage, "ABC-123")).toBe("Loris");
  });

  it("hält Sessions auseinander", () => {
    const storage = fakeStorage();
    saveName(storage, "ABC-123", "Loris");
    expect(loadName(storage, "XYZ-999")).toBe("");
  });

  it("läuft weiter, wenn der Storage gesperrt ist", () => {
    const broken: ProgressStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadName(broken, "ABC-123")).toBe("");
    expect(() => saveName(broken, "ABC-123", "Loris")).not.toThrow();
  });
});

describe("Meldung nach dem Teilen", () => {
  it("bestätigt ein erfolgreiches Teilen", () => {
    expect(shareMessage({ ok: true })).toBe("Mit dem Team geteilt.");
  });

  it("hat für jeden Absagegrund einen eigenen Text", () => {
    const reasons = ["invalid-room", "not-in-team", "unknown-evidence", "already-shared"] as const;
    const texts = reasons.map((reason) => shareMessage({ ok: false, reason }));
    expect(new Set(texts).size).toBe(reasons.length);
  });
});
