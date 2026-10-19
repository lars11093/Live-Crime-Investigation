import { describe, expect, it } from "vitest";
import { splitByTime, timesIn } from "./statement";

describe("Zeitangaben in einer Aussage", () => {
  it("findet eine einzelne Uhrzeit", () => {
    expect(timesIn("Ich war bis 22:10 im Buero.")).toEqual(["22:10"]);
  });

  it("findet mehrere Uhrzeiten in der Reihenfolge des Auftretens", () => {
    expect(timesIn("Zwischen 22:00 und 23:00 war ich unten.")).toEqual(["22:00", "23:00"]);
  });

  it("akzeptiert einstellige Stunden", () => {
    expect(timesIn("Um 9:05 kam die Mail.")).toEqual(["9:05"]);
  });

  it("findet nichts in einer Aussage ohne Uhrzeit", () => {
    expect(timesIn("Ich habe niemanden gesehen.")).toEqual([]);
  });

  it("haelt laengere Zahlenfolgen fuer keine Uhrzeit", () => {
    expect(timesIn("Die Kennung lautet 1234:5678.")).toEqual([]);
  });

  it("setzt den Text luekenlos wieder zusammen", () => {
    const text = "Um 22:30 kam sie, um 22:45 ging sie wieder.";
    expect(
      splitByTime(text)
        .map((s) => s.text)
        .join("")
    ).toBe(text);
  });

  it("markiert genau die Uhrzeiten als solche", () => {
    const segments = splitByTime("Bis 22:10 im Buero.");
    expect(segments.filter((s) => s.isTime).map((s) => s.text)).toEqual(["22:10"]);
    expect(segments.filter((s) => !s.isTime).map((s) => s.text)).toEqual(["Bis ", " im Buero."]);
  });

  it("kommt mit einer Aussage klar, die mit einer Uhrzeit beginnt und endet", () => {
    const segments = splitByTime("22:30");
    expect(segments).toEqual([{ text: "22:30", isTime: true }]);
  });

  it("gibt bei leerem Text nichts zurueck", () => {
    expect(splitByTime("")).toEqual([]);
  });
});
