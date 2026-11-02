import { describe, expect, it } from "vitest";
import type { AccusationVerdict } from "@case-zero/shared";
import { exportAkte, exportFileName } from "./akteExport";
import { EMPTY_PROGRESS } from "./caseProgress";

const caseData = {
  title: "Tod im Büro 4.12",
  briefing: { timeOfCrime: "22:30", location: "Buero 4.12", text: "" },
  suspects: [{ id: "monica", name: "Monica Brandt", age: 45, relationToVictim: "Chefin" }],
};

const progress = {
  ...EMPTY_PROGRESS,
  collected: [
    {
      id: "tasse",
      label: "Teetasse",
      kind: "object" as const,
      description: "Lippenstift am Rand.",
      foundAt: { sceneName: "Buero 4.12", hotspotLabel: "Teetasse" },
    },
  ],
  notes: { tasse: "Passt zu Monica?" },
  accusation: { suspectId: "monica", evidenceIds: ["tasse"] },
};

describe("Akte exportieren (#63)", () => {
  it("enthaelt Beweise mit Notiz, Fundort und den Anklage-Entwurf", () => {
    const text = exportAkte(caseData, progress, "ABC-DEF", new Date("2026-11-01T20:00:00Z"));
    expect(text).toContain("# Fallakte: Tod im Büro 4.12");
    expect(text).toContain("### Teetasse");
    expect(text).toContain("Fundort: Buero 4.12 · Teetasse");
    expect(text).toContain("> Notiz: Passt zu Monica?");
    expect(text).toContain("- Täter: Monica Brandt");
    expect(text).toContain("noch nicht abgesendet");
  });

  it("nennt das Ergebnis erst nach dem Absenden", () => {
    const verdict: AccusationVerdict = {
      solved: true,
      culprit: { id: "monica", name: "Monica Brandt" },
      resolution: "",
      findings: [],
    };
    const text = exportAkte(
      caseData,
      { ...progress, accusation: { ...progress.accusation, receipt: { suspectId: "monica", evidenceIds: ["tasse"], submittedAt: "2026-11-01T20:00:00Z", verdict } } },
      "ABC-DEF"
    );
    expect(text).toContain("Ergebnis: Fall gelöst");
  });

  it("baut einen sauberen Dateinamen", () => {
    expect(exportFileName("Tod im Büro 4.12", "ABC-DEF")).toBe("fallakte-tod-im-buero-4-12-ABC-DEF.md");
  });
});
