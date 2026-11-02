import { describe, expect, it } from "vitest";
import type { CollectedEvidence } from "@case-zero/shared";
import { EMPTY_BOARD, layoutCards, loadBoard, recordInsight, saveBoard, threadsFor, toggleOwnThread } from "./board";

const ev = (id: string): CollectedEvidence => ({
  id,
  label: id,
  kind: "object",
  description: "",
  foundAt: { sceneName: "Buero", hotspotLabel: "Tisch" },
});
const insight = { id: "i1", title: "Zweite Person", body: "" };

describe("Ermittlungstafel (#65)", () => {
  it("spannt eigene Faeden und nimmt sie wieder ab, egal in welcher Richtung", () => {
    let board = toggleOwnThread(EMPTY_BOARD, "a", "b");
    expect(board.own).toEqual([["a", "b"]]);
    board = toggleOwnThread(board, "b", "a");
    expect(board.own).toEqual([]);
    expect(toggleOwnThread(EMPTY_BOARD, "a", "a")).toBe(EMPTY_BOARD);
  });

  it("zeigt bestaetigte Verknuepfungen und eigene Faeden, ohne Doppelte", () => {
    let board = recordInsight(EMPTY_BOARD, "i1", "a", "b");
    board = toggleOwnThread(board, "b", "a");
    board = toggleOwnThread(board, "a", "c");
    const threads = threadsFor(board, [ev("a"), ev("b"), ev("c")], [insight]);
    expect(threads).toEqual([
      { a: "a", b: "b", kind: "insight", label: "Zweite Person" },
      { a: "a", b: "c", kind: "own" },
    ]);
  });

  it("laesst Faeden zu Beweisen weg, die nicht in der Akte sind", () => {
    const board = toggleOwnThread(EMPTY_BOARD, "a", "fehlt");
    expect(threadsFor(board, [ev("a")], [])).toEqual([]);
  });

  it("verteilt die Karten innerhalb der Tafel", () => {
    const layout = layoutCards([ev("a"), ev("b"), ev("c")]);
    for (const { x, y } of Object.values(layout)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });

  it("speichert pro Team-Code", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    const board = recordInsight(toggleOwnThread(EMPTY_BOARD, "a", "b"), "i1", "a", "c");
    saveBoard(storage, "ABC-DEF", board);
    expect(loadBoard(storage, "ABC-DEF")).toEqual(board);
    data.set("case-zero:board:ABC-DEF", JSON.stringify({ own: [["a"]], insightPairs: { x: 1 } }));
    expect(loadBoard(storage, "ABC-DEF")).toEqual(EMPTY_BOARD);
  });
});
