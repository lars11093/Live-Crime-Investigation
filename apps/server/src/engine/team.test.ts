import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { MAX_NAME_LENGTH, chooseRole, joinTeam, leaveTeam, teamOf, teamStateOf } from "./team.js";
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

  it("führt mehrere Spieler in Beitrittsreihenfolge", () => {
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

  // Zwei Personen dürfen gleich heissen — unterschieden wird über die Verbindung.
  it("lässt gleiche Namen bei verschiedenen Verbindungen zu", () => {
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

describe("Rolle wählen (#31)", () => {
  it("vergibt eine freie Rolle", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "anna", "forensics").ok).toBe(true);
    expect(room.state.players[0].role).toBe("forensics");
  });

  it("vergibt jede Rolle nur einmal", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "anna", "forensics");
    const result = chooseRole(room, "ben", "forensics");
    expect(result).toEqual({ ok: false, error: "Die Rolle ist schon an Anna vergeben." });
  });

  it("wechselt die eigene Rolle und gibt die alte frei", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "anna", "forensics");
    chooseRole(room, "anna", "cyber");
    expect(chooseRole(room, "ben", "forensics").ok).toBe(true);
  });

  it("gibt eine Rolle mit null wieder ab", () => {
    const room = roomWith("Anna");
    chooseRole(room, "anna", "lead");
    chooseRole(room, "anna", null);
    expect(room.state.players[0].role).toBeNull();
  });

  it("behält die Rolle bei einem erneuten Beitritt", () => {
    const room = roomWith("Anna");
    chooseRole(room, "anna", "cyber");
    joinTeam(room, "anna", "Anna B.");
    expect(teamOf(room)[0]).toEqual({ id: "anna", name: "Anna B.", role: "cyber" });
  });

  it("lässt Mitglieder ohne Teamleitung keine fremde Rolle setzen", () => {
    const room = roomWith("Anna", "Ben");
    expect(chooseRole(room, "ben", "lead", "anna").ok).toBe(false);
  });

  it("weist unbekannte Rollen und Personen ab", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "anna", "koch").ok).toBe(false);
    expect(chooseRole(room, "zoe", "lead").ok).toBe(false);
  });
});

describe("Teamleitung vergibt Rollen (#48)", () => {
  function roomWith(...names: string[]) {
    const room = createRoom(caseDef);
    for (const name of names) joinTeam(room, `socket-${name}`, name);
    return room;
  }
  const roleOf = (room: ReturnType<typeof createRoom>, id: string) =>
    teamOf(room).find((p) => p.id === id)?.role;

  it("macht die erste Person im Team zur Teamleitung", () => {
    const room = roomWith("Anna", "Ben");
    expect(teamStateOf(room).leaderId).toBe("socket-Anna");
    // Ein erneuter Beitritt ändert daran nichts.
    joinTeam(room, "socket-Ben", "Ben");
    expect(teamStateOf(room).leaderId).toBe("socket-Anna");
  });

  it("lässt die Teamleitung Rollen an andere vergeben", () => {
    const room = roomWith("Anna", "Ben");
    expect(chooseRole(room, "socket-Anna", "cyber", "socket-Ben")).toEqual({ ok: true });
    expect(roleOf(room, "socket-Ben")).toBe("cyber");
  });

  it("lässt Mitspieler nicht die Rolle eines anderen setzen", () => {
    const room = roomWith("Anna", "Ben");
    expect(chooseRole(room, "socket-Ben", "lead", "socket-Anna")).toEqual({
      ok: false,
      error: "Nur die Teamleitung kann Rollen an andere vergeben.",
    });
  });

  it("hält auch für die Teamleitung jede Rolle exklusiv", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "socket-Anna", "lead");
    expect(chooseRole(room, "socket-Anna", "lead", "socket-Ben").ok).toBe(false);
  });

  it("lässt die Teamleitung eine Rolle wieder entziehen", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "socket-Ben", "field");
    chooseRole(room, "socket-Anna", null, "socket-Ben");
    expect(roleOf(room, "socket-Ben")).toBeNull();
  });

  it("weist Ziele ausserhalb des Teams ab", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "socket-Anna", "lead", "socket-Zoe").ok).toBe(false);
  });

  it("gibt die Leitung weiter, wenn die Teamleitung geht", () => {
    const room = roomWith("Anna", "Ben", "Cem");
    leaveTeam(room, "socket-Anna");
    expect(teamStateOf(room).leaderId).toBe("socket-Ben");
    expect(chooseRole(room, "socket-Ben", "cyber", "socket-Cem").ok).toBe(true);
  });

  it("hat keine Leitung mehr, wenn alle gegangen sind, und vergibt sie neu", () => {
    const room = roomWith("Anna");
    leaveTeam(room, "socket-Anna");
    expect(teamStateOf(room).leaderId).toBeNull();
    joinTeam(room, "socket-Ben", "Ben");
    expect(teamStateOf(room).leaderId).toBe("socket-Ben");
  });
});
