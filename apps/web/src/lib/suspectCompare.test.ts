import { describe, expect, it } from "vitest";
import type { Suspect } from "@case-zero/shared";
import { compareSuspects, sharedTimes } from "./suspectCompare";

const daniel: Suspect = {
  id: "daniel-keller",
  name: "Daniel Keller",
  age: 34,
  relationToVictim: "Kollege",
  knownMotive: "Befoerderung blockiert.",
  statement: "Ich war bis 22:10 im Buero. Gegen 22:40 war ich zu Hause.",
};

const monica: Suspect = {
  id: "monica-brandt",
  name: "Monica Brandt",
  age: 41,
  relationToVictim: "Kollege",
  statement: "Ich hatte um 22:30 einen Termin. Um 22:40 bin ich gegangen.",
};

describe("Verdaechtige vergleichen (#40)", () => {
  it("stellt die Angaben Zeile fuer Zeile gegenueber", () => {
    const rows = compareSuspects(daniel, monica);
    expect(rows.map((r) => r.label)).toEqual([
      "Alter",
      "Beziehung zum Opfer",
      "Bekanntes Motiv",
      "Uhrzeiten in der Aussage",
      "Markierte Widersprueche",
    ]);
    expect(rows[0]).toEqual({ label: "Alter", left: "34 Jahre", right: "41 Jahre", differs: true });
  });

  it("markiert gleiche Angaben nicht als Unterschied", () => {
    const relation = compareSuspects(daniel, monica)[1];
    expect(relation.differs).toBe(false);
  });

  it("nennt fehlendes Motiv und Uhrzeiten aus der Aussage", () => {
    const rows = compareSuspects(daniel, monica);
    expect(rows[2].right).toBe("Kein Motiv bekannt");
    expect(rows[3]).toMatchObject({ left: "22:10, 22:40", right: "22:30, 22:40" });
  });

  it("zaehlt eigene Widerspruchs-Markierungen pro Person", () => {
    const marked = [
      { suspectId: "daniel-keller", suspectName: "Daniel Keller", sentenceIndex: 1, text: "" },
    ];
    expect(compareSuspects(daniel, monica, marked)[4]).toMatchObject({ left: "1", right: "0" });
  });

  it("findet Uhrzeiten, die beide nennen", () => {
    expect(sharedTimes(daniel, monica)).toEqual(["22:40"]);
  });
});
