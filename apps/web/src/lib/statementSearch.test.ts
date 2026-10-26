import { describe, expect, it } from "vitest";
import type { Suspect } from "@case-zero/shared";
import { highlight, searchStatements } from "./statementSearch";

const suspect = (id: string, statement: string): Suspect => ({
  id,
  name: id,
  age: 30,
  relationToVictim: "",
  statement,
});

const suspects = [
  suspect("daniel", "Ich war bis 22:10 im Buero. Gegen 22:40 war ich zu Hause."),
  suspect("monica", "Ich hatte um 22:30 einen Termin. Ich habe das Gebäude um 22:45 verlassen."),
  suspect("leo", "Ich war im Serverraum. Mit dem vierten Stock habe ich nichts zu tun."),
];

describe("Aussagen nach Stichwort filtern (#41)", () => {
  it("findet den Satz mit dem Stichwort, mit Person und Satznummer", () => {
    const hits = searchStatements(suspects, "zu Hause");
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({
      suspectId: "daniel",
      sentenceIndex: 1,
      sentence: "Gegen 22:40 war ich zu Hause.",
    });
  });

  it("findet ueber mehrere Personen hinweg", () => {
    expect(searchStatements(suspects, "ich war").map((h) => h.suspectId)).toEqual([
      "daniel",
      "daniel",
      "leo",
    ]);
  });

  it("verlangt alle Woerter im selben Satz", () => {
    expect(searchStatements(suspects, "serverraum stock")).toHaveLength(0);
    expect(searchStatements(suspects, "stock nichts")).toHaveLength(1);
  });

  it("sucht nach Uhrzeiten", () => {
    expect(searchStatements(suspects, "22:45")[0].suspectId).toBe("monica");
  });

  it("behandelt Umlaute und ihre Umschreibung gleich", () => {
    expect(searchStatements(suspects, "gebaeude")).toHaveLength(1);
    expect(searchStatements(suspects, "Büro")).toHaveLength(1);
  });

  it("liefert ohne Stichwort nichts", () => {
    expect(searchStatements(suspects, "   ")).toEqual([]);
  });

  it("markiert den Treffer im Originaltext, auch bei Umlauten", () => {
    expect(highlight("Das Gebäude war leer.", ["gebaeude"])).toEqual([
      { text: "Das ", hit: false },
      { text: "Gebäude", hit: true },
      { text: " war leer.", hit: false },
    ]);
  });
});
