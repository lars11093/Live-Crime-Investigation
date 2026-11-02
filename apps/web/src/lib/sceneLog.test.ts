import { describe, expect, it } from "vitest";
import { appendSceneLog, groupByScene, loadSceneLog, saveSceneLog, type SceneLogEntry } from "./sceneLog";

const entry = (over: Partial<SceneLogEntry> = {}): SceneLogEntry => ({
  at: "2026-11-01T21:47:00.000Z",
  action: "untersucht",
  sceneName: "Büro 4.12",
  hotspotLabel: "Schreibtisch",
  ...over,
});

describe("Tatortprotokoll (#61)", () => {
  it("protokolliert jede Handlung pro Stelle nur einmal", () => {
    let log = appendSceneLog([], entry());
    log = appendSceneLog(log, entry({ at: "2026-11-01T21:50:00.000Z" }));
    log = appendSceneLog(log, entry({ action: "eingesammelt", evidenceLabel: "Notebook" }));
    expect(log.map((e) => e.action)).toEqual(["untersucht", "eingesammelt"]);
  });

  it("gruppiert nach Tatort in der Reihenfolge des Protokolls", () => {
    const groups = groupByScene([
      entry(),
      entry({ sceneName: "Flur 4. OG", hotspotLabel: "Badge-Leser" }),
      entry({ hotspotLabel: "Fenster" }),
    ]);
    expect(groups.map((g) => [g.sceneName, g.entries.length])).toEqual([
      ["Büro 4.12", 2],
      ["Flur 4. OG", 1],
    ]);
  });

  it("speichert pro Team-Code und verwirft Ungültiges", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    saveSceneLog(storage, "ABC-DEF", [entry()]);
    expect(loadSceneLog(storage, "ABC-DEF")).toEqual([entry()]);
    data.set("case-zero:scene-log:ABC-DEF", JSON.stringify([{ at: 1 }, entry()]));
    expect(loadSceneLog(storage, "ABC-DEF")).toEqual([entry()]);
  });
});
