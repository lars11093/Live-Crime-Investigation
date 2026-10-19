import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import {
  EMPTY_PROGRESS,
  loadProgress,
  saveProgress,
  setNote,
  toggleContradiction,
  type ProgressStorage,
} from "./caseProgress";

function fakeStorage(initial: Record<string, string> = {}): ProgressStorage & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

/** Storage, der bei jedem Zugriff wirft — privater Modus, blockierte Site-Daten. */
const brokenStorage: ProgressStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

const evidence: CollectedEvidence = {
  id: "tasse-lippenstift",
  label: "Tasse mit Lippenstiftabdruck",
  kind: "object",
  description: "Halbvolle, kalte Tasse.",
  foundAt: { sceneName: "Buero 4.12", hotspotLabel: "Ablage" },
};

describe("Fortschritt speichern und laden", () => {
  it("gibt ohne gespeicherten Stand einen leeren Fortschritt", () => {
    expect(loadProgress(fakeStorage(), "ABC-123")).toEqual(EMPTY_PROGRESS);
  });

  it("liest zurueck, was geschrieben wurde", () => {
    const storage = fakeStorage();
    saveProgress(storage, "ABC-123", {
      investigatedIds: ["schreibtisch"],
      collected: [evidence],
      notes: { "tasse-lippenstift": "Lippenstift passt nicht zum Opfer." },
      insights: [{ id: "insight-1", title: "Zweite Person", body: "Jemand sass mit am Tisch." }],
      contradictions: [],
    });
    const loaded = loadProgress(storage, "ABC-123");
    expect(loaded.notes["tasse-lippenstift"]).toBe("Lippenstift passt nicht zum Opfer.");
    expect(loaded.collected).toHaveLength(1);
    expect(loaded.investigatedIds).toEqual(["schreibtisch"]);
    // Aufgedeckte Verknuepfungen muessen ein Neuladen ebenso ueberstehen (#13).
    expect(loaded.insights).toEqual([
      { id: "insight-1", title: "Zweite Person", body: "Jemand sass mit am Tisch." },
    ]);
  });

  it("haelt Sessions auseinander", () => {
    const storage = fakeStorage();
    saveProgress(storage, "ABC-123", { ...EMPTY_PROGRESS, notes: { a: "Notiz A" } });
    expect(loadProgress(storage, "XYZ-999")).toEqual(EMPTY_PROGRESS);
  });

  it("verschluckt sich nicht an kaputtem JSON", () => {
    const storage = fakeStorage({ "case-zero:progress:ABC-123": "{kein json" });
    expect(loadProgress(storage, "ABC-123")).toEqual(EMPTY_PROGRESS);
  });

  it("verschluckt sich nicht an fremden Daten im Schluessel", () => {
    const storage = fakeStorage({ "case-zero:progress:ABC-123": '{"notes":"nope"}' });
    expect(loadProgress(storage, "ABC-123")).toEqual(EMPTY_PROGRESS);
  });

  it("laeuft weiter, wenn der Storage gesperrt ist", () => {
    expect(loadProgress(brokenStorage, "ABC-123")).toEqual(EMPTY_PROGRESS);
    expect(() => saveProgress(brokenStorage, "ABC-123", EMPTY_PROGRESS)).not.toThrow();
  });
});

describe("Notizen", () => {
  it("legt eine Notiz an", () => {
    expect(setNote({}, "a", "Verdaechtig")).toEqual({ a: "Verdaechtig" });
  });

  it("ueberschreibt eine bestehende Notiz", () => {
    expect(setNote({ a: "alt" }, "a", "neu")).toEqual({ a: "neu" });
  });

  it("schneidet Randleerzeichen weg", () => {
    expect(setNote({}, "a", "  Verdaechtig  ")).toEqual({ a: "Verdaechtig" });
  });

  it("loescht die Notiz, wenn das Feld geleert wird", () => {
    expect(setNote({ a: "alt", b: "bleibt" }, "a", "")).toEqual({ b: "bleibt" });
    expect(setNote({ a: "alt" }, "a", "   ")).toEqual({});
  });
});

describe("Widersprueche markieren", () => {
  const entry = {
    suspectId: "monica-brandt",
    suspectName: "Monica Brandt",
    sentenceIndex: 2,
    text: "Ich habe das Gebaeude um 22:45 verlassen.",
  };

  it("markiert einen Satz", () => {
    expect(toggleContradiction([], entry)).toEqual([entry]);
  });

  it("nimmt dieselbe Markierung wieder zurueck", () => {
    expect(toggleContradiction([entry], entry)).toEqual([]);
  });

  it("haelt gleiche Satznummern verschiedener Personen auseinander", () => {
    const other = { ...entry, suspectId: "daniel-keller", suspectName: "Daniel Keller" };
    expect(toggleContradiction([entry], other)).toHaveLength(2);
  });

  it("haelt verschiedene Saetze derselben Person auseinander", () => {
    const other = { ...entry, sentenceIndex: 3 };
    expect(toggleContradiction([entry], other)).toHaveLength(2);
  });

  it("ueberlebt das Speichern und Laden", () => {
    const storage = fakeStorage();
    saveProgress(storage, "ABC-123", { ...EMPTY_PROGRESS, contradictions: [entry] });
    expect(loadProgress(storage, "ABC-123").contradictions).toEqual([entry]);
  });
});
