import { describe, expect, it } from "vitest";
import type { CollectedEvidence, Suspect } from "@case-zero/shared";
import { canSubmitDespite, reviewAccusation, type ReviewInput } from "./accusationReview";

const suspects: Suspect[] = [
  { id: "monica", name: "Monica", age: 41, relationToVictim: "", statement: "Ich ging um 22:45." },
  { id: "daniel", name: "Daniel", age: 34, relationToVictim: "", statement: "Ich ging um 22:10." },
];

const scene = (id: string): CollectedEvidence => ({
  id,
  label: id,
  kind: "object",
  description: "",
  source: "scene",
  foundAt: { sceneName: "Buero", hotspotLabel: "Ablage" },
});
const digital = (id: string): CollectedEvidence => ({ ...scene(id), kind: "message", source: "device" });

const empty: ReviewInput["progress"] = {
  alibiVerdicts: {},
  suspicion: {},
  contradictions: [],
  relevance: {},
  insights: [],
};

const texts = (input: ReviewInput, level?: string) =>
  reviewAccusation(input)
    .filter((f) => !level || f.level === level)
    .map((f) => f.text);

describe("Anklage vor dem Absenden pruefen (#52)", () => {
  it("meldet fehlenden Taeter und Beweis als Fehler und blockiert", () => {
    const findings = reviewAccusation({
      draft: { suspectId: null, evidenceIds: [] },
      suspects,
      collected: [],
      progress: empty,
    });
    expect(findings.filter((f) => f.level === "fehler")).toHaveLength(2);
    expect(canSubmitDespite(findings)).toBe(false);
  });

  it("warnt bei nur einem Beweis, blockiert aber nicht", () => {
    const input = {
      draft: { suspectId: "monica", evidenceIds: ["tasse"] },
      suspects,
      collected: [scene("tasse")],
      progress: empty,
    };
    expect(texts(input, "warnung")[0]).toContain("Nur ein einziger Beweis");
    expect(canSubmitDespite(reviewAccusation(input))).toBe(true);
  });

  it("vergleicht mit dem eigenen Alibi-Urteil und Verdachtsgrad", () => {
    const input = {
      draft: { suspectId: "monica", evidenceIds: ["tasse", "badge"] },
      suspects,
      collected: [scene("tasse"), scene("badge")],
      progress: { ...empty, alibiVerdicts: { monica: "haltbar" as const }, suspicion: { monica: 2 as const, daniel: 4 as const } },
    };
    const warnings = texts(input, "warnung");
    expect(warnings).toContain("Du haeltst das Alibi von Monica selbst fuer haltbar.");
    expect(warnings.some((w) => w.includes("gegen Daniel (Sehr hoch)"))).toBe(true);
  });

  it("weist auf ungepruefte Alibis, fehlende Widersprueche und Verknuepfungen hin", () => {
    const hints = texts(
      {
        draft: { suspectId: "monica", evidenceIds: ["tasse", "badge"] },
        suspects,
        collected: [scene("tasse"), scene("badge")],
        progress: empty,
      },
      "hinweis"
    );
    expect(hints).toEqual([
      "Das Alibi von Monica hast du noch nicht geprueft.",
      "In der Aussage von Monica hast du keinen Widerspruch markiert.",
      "Du hast noch keine Verknuepfung zwischen Beweisen aufgedeckt.",
    ]);
  });

  it("vermisst digitale bzw. Tatort-Spuren nur, wenn welche gesichert sind", () => {
    const base = { suspects, progress: empty };
    expect(
      texts({ ...base, draft: { suspectId: "monica", evidenceIds: ["a", "b"] }, collected: [scene("a"), scene("b"), digital("m")] })
    ).toContain("Keine digitale Spur angehaengt, obwohl du welche gesichert hast.");
    expect(
      texts({ ...base, draft: { suspectId: "monica", evidenceIds: ["a", "b"] }, collected: [scene("a"), scene("b")] }).join()
    ).not.toContain("digitale Spur");
  });

  it("warnt bei angehaengten, selbst als nebensaechlich bewerteten Spuren", () => {
    const input = {
      draft: { suspectId: "monica", evidenceIds: ["m", "a"] },
      suspects,
      collected: [digital("m"), scene("a")],
      progress: { ...empty, relevance: { m: "niedrig" as const } },
    };
    expect(texts(input, "warnung").some((w) => w.includes("nebensaechlich bewertet: m"))).toBe(true);
  });

  it("findet bei gruendlicher Ermittlung keine Luecke", () => {
    const findings = reviewAccusation({
      draft: { suspectId: "monica", evidenceIds: ["a", "m"] },
      suspects,
      collected: [scene("a"), digital("m")],
      progress: {
        alibiVerdicts: { monica: "nicht-haltbar" },
        suspicion: { monica: 4, daniel: 2 },
        contradictions: [{ suspectId: "monica", suspectName: "Monica", sentenceIndex: 0, text: "" }],
        relevance: { m: "hoch" },
        insights: [{ id: "i", title: "", body: "" }],
      },
    });
    expect(findings).toEqual([]);
  });
});
