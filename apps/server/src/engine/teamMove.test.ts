import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam } from "./team.js";
import { canMoveTeam } from "./teamMove.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Team mitnehmen (#57)", () => {
  it("erlaubt Teammitgliedern den Umzug in eine bestehende Session", () => {
    const from = createRoom(caseDef);
    const to = createRoom(caseDef);
    joinTeam(from, "socket-1", "Loris");
    expect(canMoveTeam(from, to, "socket-1")).toEqual({ ok: true, by: "Loris" });
  });

  it("lehnt Fremde, unbekannte und gleiche Sessions ab", () => {
    const from = createRoom(caseDef);
    joinTeam(from, "socket-1", "Loris");
    expect(canMoveTeam(from, createRoom(caseDef), "fremd").ok).toBe(false);
    expect(canMoveTeam(from, undefined, "socket-1").ok).toBe(false);
    expect(canMoveTeam(from, from, "socket-1").ok).toBe(false);
  });
});
