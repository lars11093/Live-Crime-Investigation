import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import {
  EMPTY_PROGRESS,
  collectEvidence,
  loadProgress,
  saveProgress,
  saveNote,
  setNote,
  toggleContradiction,
  toggleInvestigated,
  toggleMarkedMessage,
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
  foundAt: { sceneName: "Büro 4.12", hotspotLabel: "Ablage" },
};

describe("Fortschritt speichern und laden", () => {
  it("gibt ohne gespeicherten Stand einen leeren Fortschritt", () => {
    expect(loadProgress(fakeStorage(), "ABC-123")).toEqual(EMPTY_PROGRESS);
  });

  it("liest zurück, was geschrieben wurde", () => {
    const storage = fakeStorage();
    saveProgress(storage, "ABC-123", {
      investigatedIds: ["schreibtisch"],
      collected: [evidence],
      notes: { "tasse-lippenstift": "Lippenstift passt nicht zum Opfer." },
      noteEditedAt: {},
      insights: [{ id: "insight-1", title: "Zweite Person", body: "Jemand sass mit am Tisch." }],
      insightRatings: { "insight-1": 3 },
      contradictions: [],
      markedMessageIds: [],
      reviewedDeviceIds: ["smartphone-vogt"],
      metadataReadIds: ["msg-vogt-06"],
      relevance: { "msg-vogt-07": "hoch" },
      alibiVerdicts: { "daniel-keller": "zweifelhaft" },
      suspicion: { "monica-brandt": 4 },
      accusation: { suspectId: "monica-brandt", evidenceIds: ["tasse-lippenstift"] },
      photos: {},
    });
    const loaded = loadProgress(storage, "ABC-123");
    // Die Relevanz digitaler Spuren bleibt erhalten (#47).
    expect(loaded.relevance).toEqual({ "msg-vogt-07": "hoch" });
    // Ausgelesene Metadaten bleiben ausgelesen (#45).
    expect(loaded.metadataReadIds).toEqual(["msg-vogt-06"]);
    // Ausgewertete Geräte bleiben ausgewertet (#44).
    expect(loaded.reviewedDeviceIds).toEqual(["smartphone-vogt"]);
    // Der Verdachtsgrad bleibt erhalten (#43).
    expect(loaded.suspicion).toEqual({ "monica-brandt": 4 });
    // Das Urteil über ein Alibi bleibt erhalten (#42).
    expect(loaded.alibiVerdicts).toEqual({ "daniel-keller": "zweifelhaft" });
    // Die eigene Bewertung einer Verknüpfung bleibt erhalten (#39).
    expect(loaded.insightRatings).toEqual({ "insight-1": 3 });
    // Täterauswahl und angehängte Beweise überstehen ein Neuladen (#25, #26).
    expect(loaded.accusation).toEqual({
      suspectId: "monica-brandt",
      evidenceIds: ["tasse-lippenstift"],
    });
    expect(loaded.notes["tasse-lippenstift"]).toBe("Lippenstift passt nicht zum Opfer.");
    expect(loaded.collected).toHaveLength(1);
    expect(loaded.investigatedIds).toEqual(["schreibtisch"]);
    // Aufgedeckte Verknüpfungen müssen ein Neuladen ebenso überstehen (#13).
    expect(loaded.insights).toEqual([
      { id: "insight-1", title: "Zweite Person", body: "Jemand sass mit am Tisch." },
    ]);
  });

  it("hält Sessions auseinander", () => {
    const storage = fakeStorage();
    saveProgress(storage, "ABC-123", { ...EMPTY_PROGRESS, notes: { a: "Notiz A" } });
    expect(loadProgress(storage, "XYZ-999")).toEqual(EMPTY_PROGRESS);
  });

  it("verschluckt sich nicht an kaputtem JSON", () => {
    const storage = fakeStorage({ "case-zero:progress:ABC-123": "{kein json" });
    expect(loadProgress(storage, "ABC-123")).toEqual(EMPTY_PROGRESS);
  });

  it("verschluckt sich nicht an fremden Daten im Schlüssel", () => {
    const storage = fakeStorage({ "case-zero:progress:ABC-123": '{"notes":"nope"}' });
    expect(loadProgress(storage, "ABC-123")).toEqual(EMPTY_PROGRESS);
  });

  it("läuft weiter, wenn der Storage gesperrt ist", () => {
    expect(loadProgress(brokenStorage, "ABC-123")).toEqual(EMPTY_PROGRESS);
    expect(() => saveProgress(brokenStorage, "ABC-123", EMPTY_PROGRESS)).not.toThrow();
  });
});

describe("Notizen", () => {
  it("legt eine Notiz an", () => {
    expect(setNote({}, "a", "Verdächtig")).toEqual({ a: "Verdächtig" });
  });

  it("überschreibt eine bestehende Notiz", () => {
    expect(setNote({ a: "alt" }, "a", "neu")).toEqual({ a: "neu" });
  });

  it("schneidet Randleerzeichen weg", () => {
    expect(setNote({}, "a", "  Verdächtig  ")).toEqual({ a: "Verdächtig" });
  });

  it("löscht die Notiz, wenn das Feld geleert wird", () => {
    expect(setNote({ a: "alt", b: "bleibt" }, "a", "")).toEqual({ b: "bleibt" });
    expect(setNote({ a: "alt" }, "a", "   ")).toEqual({});
  });
});

describe("Widersprüche markieren", () => {
  const entry = {
    suspectId: "monica-brandt",
    suspectName: "Monica Brandt",
    sentenceIndex: 2,
    text: "Ich habe das Gebäude um 22:45 verlassen.",
  };

  it("markiert einen Satz", () => {
    expect(toggleContradiction([], entry)).toEqual([entry]);
  });

  it("nimmt dieselbe Markierung wieder zurück", () => {
    expect(toggleContradiction([entry], entry)).toEqual([]);
  });

  it("hält gleiche Satznummern verschiedener Personen auseinander", () => {
    const other = { ...entry, suspectId: "daniel-keller", suspectName: "Daniel Keller" };
    expect(toggleContradiction([entry], other)).toHaveLength(2);
  });

  it("hält verschiedene Sätze derselben Person auseinander", () => {
    const other = { ...entry, sentenceIndex: 3 };
    expect(toggleContradiction([entry], other)).toHaveLength(2);
  });

  it("überlebt das Speichern und Laden", () => {
    const storage = fakeStorage();
    saveProgress(storage, "ABC-123", { ...EMPTY_PROGRESS, contradictions: [entry] });
    expect(loadProgress(storage, "ABC-123").contradictions).toEqual([entry]);
  });
});

describe("Chatnachrichten markieren", () => {
  it("markiert eine Nachricht", () => {
    expect(toggleMarkedMessage([], "msg-vogt-05")).toEqual(["msg-vogt-05"]);
  });

  it("nimmt dieselbe Markierung wieder zurück", () => {
    expect(toggleMarkedMessage(["msg-vogt-05", "msg-vogt-07"], "msg-vogt-05")).toEqual([
      "msg-vogt-07",
    ]);
  });

  it("überlebt das Speichern und Laden", () => {
    const storage = fakeStorage();
    saveProgress(storage, "ABC-123", { ...EMPTY_PROGRESS, markedMessageIds: ["msg-vogt-05"] });
    expect(loadProgress(storage, "ABC-123").markedMessageIds).toEqual(["msg-vogt-05"]);
  });

  // Wer vor #19 gespielt hat, hat das Feld noch nicht im Storage.
  it("lädt einen alten Stand ohne Markierungen", () => {
    const storage = fakeStorage({
      "case-zero:progress:ABC-123": '{"investigatedIds":["schreibtisch"]}',
    });
    const loaded = loadProgress(storage, "ABC-123");
    expect(loaded.markedMessageIds).toEqual([]);
    expect(loaded.investigatedIds).toEqual(["schreibtisch"]);
  });
});

describe("Beweise einsammeln", () => {
  it("legt einen neuen Fund in die Akte", () => {
    const now = new Date("2026-10-26T20:00:00Z");
    expect(collectEvidence([], evidence, now)).toEqual([
      { ...evidence, collectedAt: "2026-10-26T20:00:00.000Z" },
    ]);
  });

  it("sichert denselben Fund nicht doppelt", () => {
    const list = [evidence];
    expect(collectEvidence(list, { ...evidence })).toBe(list);
  });
});

describe("Untersuchte Stellen markieren (#34)", () => {
  it("markiert eine offene Stelle", () => {
    expect(toggleInvestigated(["fenster"], "papierkorb")).toEqual(["fenster", "papierkorb"]);
  });

  it("nimmt die Markierung wieder zurück", () => {
    expect(toggleInvestigated(["fenster", "papierkorb"], "fenster")).toEqual(["papierkorb"]);
  });
});

describe("Notiz bearbeiten (#38)", () => {
  const t1 = new Date("2026-10-26T20:00:00Z");
  const t2 = new Date("2026-10-26T21:00:00Z");

  it("hält fest, wann die Notiz zuletzt geändert wurde", () => {
    const first = saveNote(EMPTY_PROGRESS, "tasse", "Lippenstift", t1);
    const edited = saveNote(first, "tasse", "Lippenstift - Monica?", t2);
    expect(edited.notes.tasse).toBe("Lippenstift - Monica?");
    expect(edited.noteEditedAt.tasse).toBe("2026-10-26T21:00:00.000Z");
  });

  it("ändert ohne neuen Text auch den Zeitpunkt nicht", () => {
    const first = saveNote(EMPTY_PROGRESS, "tasse", "Lippenstift", t1);
    expect(saveNote(first, "tasse", "  Lippenstift ", t2)).toBe(first);
  });

  it("löscht mit der Notiz auch den Zeitpunkt", () => {
    const first = saveNote(EMPTY_PROGRESS, "tasse", "Lippenstift", t1);
    const removed = saveNote(first, "tasse", "", t2);
    expect(removed.notes).toEqual({});
    expect(removed.noteEditedAt).toEqual({});
  });
});
