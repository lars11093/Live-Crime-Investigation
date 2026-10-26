import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { MAX_NAME_LENGTH, joinTeam, leaveTeam, teamOf } from "./team.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Team beitreten", () => {
  it("nimmt einen Spieler mit Namen auf", () => {
    const room = createRoom(caseDef);
    expect(joinTeam(room, "socket-a", "Loris")).toEqual({ ok: true });
    expect(teamOf(room)).toEqual([{ id: "socket-a", name: "Loris", role: null }]);
  });

  it("schneidet Randleerzeichen weg", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "socket-a", "  Loris  ");
    expect(teamOf(room)[0].name).toBe("Loris");
  });

  it("weist einen leeren Namen ab", () => {
    const room = createRoom(caseDef);
    expect(joinTeam(room, "socket-a", "   ").ok).toBe(false);
    expect(teamOf(room)).toEqual([]);
  });

  it("weist einen zu langen Namen ab", () => {
    const room = createRoom(caseDef);
    expect(joinTeam(room, "socket-a", "x".repeat(MAX_NAME_LENGTH + 1)).ok).toBe(false);
  });

  it("fuehrt mehrere Spieler in Beitrittsreihenfolge", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "socket-a", "Loris");
    joinTeam(room, "socket-b", "Lars");
    expect(teamOf(room).map((p) => p.name)).toEqual(["Loris", "Lars"]);
  });

  it("verdoppelt niemanden, der erneut beitritt", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "socket-a", "Loris");
    joinTeam(room, "socket-a", "Loris R.");
    expect(teamOf(room)).toEqual([{ id: "socket-a", name: "Loris R.", role: null }]);
  });

  // Zwei Personen duerfen gleich heissen — unterschieden wird ueber die Verbindung.
  it("laesst gleiche Namen bei verschiedenen Verbindungen zu", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "socket-a", "Lea");
    joinTeam(room, "socket-b", "Lea");
    expect(teamOf(room)).toHaveLength(2);
  });
});

describe("Team verlassen", () => {
  it("entfernt genau diese Verbindung", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "socket-a", "Loris");
    joinTeam(room, "socket-b", "Lars");
    expect(leaveTeam(room, "socket-a")).toBe(true);
    expect(teamOf(room).map((p) => p.name)).toEqual(["Lars"]);
  });

  it("meldet, wenn die Verbindung gar nicht im Team war", () => {
    const room = createRoom(caseDef);
    expect(leaveTeam(room, "socket-x")).toBe(false);
  });
});
