import { describe, expect, it } from "vitest";
import type { Suspect } from "@case-zero/shared";
import { buildStatementTimeline, clockToMinutes } from "./statementTimeline";

const suspect = (id: string, statement: string): Suspect => ({
  id,
  name: id.toUpperCase(),
  age: 40,
  relationToVictim: "Kollege",
  statement,
});

describe("Zeitachse aller Aussagen (#68)", () => {
  it("rechnet Uhrzeiten in Minuten um", () => {
    expect(clockToMinutes("22:40")).toBe(1360);
    expect(clockToMinutes("9:05")).toBe(545);
    expect(clockToMinutes("25:00")).toBeNull();
  });

  it("sortiert die Angaben aller Personen nach Uhrzeit", () => {
    const timeline = buildStatementTimeline([
      suspect("a", "Ich ging um 22:10. Um 22:40 war ich zu Hause."),
      suspect("b", "Wir trafen uns um 22:30."),
    ]);
    expect(timeline.map((e) => `${e.time} ${e.suspectId}`)).toEqual([
      "22:10 a",
      "22:30 b",
      "22:40 a",
    ]);
    expect(timeline[0].sentence).toBe("Ich ging um 22:10.");
  });

  it("markiert Überschneidungen nur zwischen verschiedenen Personen", () => {
    const timeline = buildStatementTimeline([
      suspect("a", "Um 22:00 kam ich. Um 22:05 ging ich."),
      suspect("b", "Um 22:45 war ich weg."),
      suspect("c", "Ich verliess das Haus um 22:50."),
    ]);
    const byTime = Object.fromEntries(timeline.map((e) => [e.time, e.overlaps]));
    expect(byTime).toEqual({ "22:00": false, "22:05": false, "22:45": true, "22:50": true });
  });

  it("kommt mit Verdächtigen ohne Aussage aus", () => {
    expect(buildStatementTimeline([{ ...suspect("a", ""), statement: undefined }])).toEqual([]);
  });
});
