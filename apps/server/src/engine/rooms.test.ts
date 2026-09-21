import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom, getRoom, isValidRoomCode, normalizeRoomCode } from "./rooms.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Team-Code", () => {
  it("akzeptiert das Format XXX-XXX", () => {
    expect(isValidRoomCode("7K4-XP9")).toBe(true);
    expect(isValidRoomCode("ABC-123")).toBe(true);
  });

  it("weist alles ab, was nicht XXX-XXX ist", () => {
    for (const bad of ["", "7K4XP9", "7K4-XP", "7K4-XP99", "7K4_XP9", "7k4-xp9", "ÄÖÜ-123"]) {
      expect(isValidRoomCode(bad), `"${bad}" sollte ungueltig sein`).toBe(false);
    }
  });

  it("macht aus Kleinbuchstaben Grossbuchstaben", () => {
    expect(normalizeRoomCode(" 7k4-xp9 ")).toBe("7K4-XP9");
    expect(isValidRoomCode(normalizeRoomCode("7k4-xp9"))).toBe(true);
  });
});

describe("Room Store", () => {
  it("vergibt Codes im vereinbarten Format", () => {
    const room = createRoom(caseDef);
    expect(isValidRoomCode(room.state.code)).toBe(true);
  });

  it("findet einen Raum auch bei klein geschriebenem Code", () => {
    const room = createRoom(caseDef);
    expect(getRoom(room.state.code.toLowerCase())?.state.code).toBe(room.state.code);
  });

  it("kennt unbekannte Codes nicht", () => {
    expect(getRoom("ZZZ-999")).toBeUndefined();
  });

  it("gibt zwei Raeumen nicht denselben Code", () => {
    const codes = new Set(Array.from({ length: 50 }, () => createRoom(caseDef).state.code));
    expect(codes.size).toBe(50);
  });

  it("teilt das Board nicht zwischen Raeumen", () => {
    const a = createRoom(caseDef);
    const b = createRoom(caseDef);
    a.state.board.nodes.push({ id: "x", label: "x", kind: "fact", x: 0, y: 0 });
    expect(b.state.board.nodes).toHaveLength(caseDef.seedEvidence.length);
  });
});
