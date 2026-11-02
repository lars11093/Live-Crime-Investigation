import { describe, expect, it } from "vitest";
import type { Suspect } from "@case-zero/shared";
import { askQuestion, loadInterrogations, openQuestions, saveInterrogations, transcript } from "./interrogation";

const suspect: Suspect = {
  id: "monica",
  name: "Monica Brandt",
  age: 41,
  relationToVictim: "Vorgesetzte",
  interrogation: [
    { id: "q1", question: "Worum ging es?", answer: "Um Zahlen." },
    { id: "q2", question: "Wie sind Sie gegangen?", answer: "Haupteingang." },
  ],
};

const branching: Suspect = {
  ...suspect,
  interrogation: [
    { id: "q1", question: "Worum ging es?", answer: "Um Zahlen." },
    { id: "hart", question: "Druck", answer: "Kein Kommentar.", after: "q1", closes: ["weich"] },
    { id: "weich", question: "Verstaendnis", answer: "Er war aufgebracht.", after: "q1", closes: ["hart"] },
  ],
};

describe("Zwischen Fragen waehlen (#67)", () => {
  it("bietet Folgefragen erst nach der Ausgangsfrage an", () => {
    expect(openQuestions({}, branching).map((q) => q.id)).toEqual(["q1"]);
    expect(askQuestion({}, branching, "hart")).toEqual({});
    const log = askQuestion({}, branching, "q1");
    expect(openQuestions(log, branching).map((q) => q.id)).toEqual(["hart", "weich"]);
  });

  it("verwirft die Alternative, sobald eine Variante gewaehlt ist", () => {
    let log = askQuestion({}, branching, "q1");
    log = askQuestion(log, branching, "weich");
    expect(openQuestions(log, branching)).toEqual([]);
    expect(askQuestion(log, branching, "hart")).toBe(log);
    expect(transcript(log, branching).map((q) => q.answer)).toEqual(["Um Zahlen.", "Er war aufgebracht."]);
  });
});

describe("Befragung (#66)", () => {
  it("haelt die Fragen in der gestellten Reihenfolge fest", () => {
    let log = askQuestion({}, suspect, "q2");
    log = askQuestion(log, suspect, "q1");
    expect(transcript(log, suspect).map((q) => q.answer)).toEqual(["Haupteingang.", "Um Zahlen."]);
    expect(openQuestions(log, suspect)).toEqual([]);
  });

  it("stellt keine Frage doppelt und keine unbekannte", () => {
    const log = askQuestion({}, suspect, "q1");
    expect(askQuestion(log, suspect, "q1")).toBe(log);
    expect(askQuestion(log, suspect, "gibt-es-nicht")).toBe(log);
    expect(openQuestions(log, suspect).map((q) => q.id)).toEqual(["q2"]);
  });

  it("merkt sich die Befragung pro Team-Code", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    saveInterrogations(storage, "ABC-DEF", { monica: ["q1"] });
    expect(loadInterrogations(storage, "ABC-DEF")).toEqual({ monica: ["q1"] });
    data.set("case-zero:interrogation:ABC-DEF", "kaputt");
    expect(loadInterrogations(storage, "ABC-DEF")).toEqual({});
  });
});
