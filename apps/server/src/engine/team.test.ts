import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { MAX_NAME_LENGTH, chooseRole, joinTeam, leaveTeam, teamOf } from "./team.js";
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

function roomWith(...names: string[]) {
  const room = createRoom(caseDef);
  for (const name of names) joinTeam(room, name.toLowerCase(), name);
  return room;
}

describe("Rolle waehlen (#31)", () => {
  it("vergibt eine freie Rolle", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "anna", "anna", "forensics").ok).toBe(true);
    expect(room.state.players[0].role).toBe("forensics");
  });

  it("vergibt jede Rolle nur einmal", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "anna", "anna", "forensics");
    const result = chooseRole(room, "ben", "ben", "forensics");
    expect(result).toEqual({ ok: false, message: "Die Rolle ist schon an Anna vergeben." });
  });

  it("wechselt die eigene Rolle und gibt die alte frei", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "anna", "anna", "forensics");
    chooseRole(room, "anna", "anna", "cyber");
    expect(chooseRole(room, "ben", "ben", "forensics").ok).toBe(true);
  });

  it("gibt eine Rolle mit null wieder ab", () => {
    const room = roomWith("Anna");
    chooseRole(room, "anna", "anna", "lead");
    chooseRole(room, "anna", "anna", null);
    expect(room.state.players[0].role).toBeNull();
  });

  it("behaelt die Rolle bei einem erneuten Beitritt", () => {
    const room = roomWith("Anna");
    chooseRole(room, "anna", "anna", "cyber");
    joinTeam(room, "anna", "Anna B.");
    expect(teamOf(room)[0]).toEqual({ id: "anna", name: "Anna B.", role: "cyber" });
  });

  it("laesst niemanden die Rolle eines anderen setzen", () => {
    const room = roomWith("Anna", "Ben");
    expect(chooseRole(room, "anna", "ben", "lead").ok).toBe(false);
  });

  it("weist unbekannte Rollen und Personen ab", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "anna", "anna", "koch").ok).toBe(false);
    expect(chooseRole(room, "zoe", "zoe", "lead").ok).toBe(false);
  });
});
