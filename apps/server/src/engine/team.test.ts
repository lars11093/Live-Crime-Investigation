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

describe("Rolle waehlen (#31)", () => {
  function roomWith(...names: string[]) {
    const room = createRoom(caseDef);
    for (const name of names) joinTeam(room, `socket-${name}`, name);
    return room;
  }
  const roleOf = (room: ReturnType<typeof createRoom>, id: string) =>
    teamOf(room).find((p) => p.id === id)?.role;

  it("gibt einer Person eine freie Rolle", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "socket-Anna", "lead")).toEqual({ ok: true });
    expect(roleOf(room, "socket-Anna")).toBe("lead");
  });

  it("vergibt jede Rolle nur einmal und nennt, wer sie hat", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "socket-Anna", "lead");
    expect(chooseRole(room, "socket-Ben", "lead")).toEqual({
      ok: false,
      error: "Die Rolle ist schon an Anna vergeben.",
    });
    expect(roleOf(room, "socket-Ben")).toBeNull();
  });

  it("gibt beim Wechsel die alte Rolle frei", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "socket-Anna", "lead");
    chooseRole(room, "socket-Anna", "cyber");
    expect(chooseRole(room, "socket-Ben", "lead").ok).toBe(true);
  });

  it("laesst die eigene Rolle wieder abgeben", () => {
    const room = roomWith("Anna");
    chooseRole(room, "socket-Anna", "lead");
    expect(chooseRole(room, "socket-Anna", null).ok).toBe(true);
    expect(roleOf(room, "socket-Anna")).toBeNull();
  });

  it("weist unbekannte Rollen und Verbindungen ausserhalb des Teams ab", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "socket-Anna", "chef").ok).toBe(false);
    expect(chooseRole(room, "socket-Zoe", "lead").ok).toBe(false);
  });

  it("behaelt die Rolle beim erneuten Beitritt", () => {
    const room = roomWith("Anna");
    chooseRole(room, "socket-Anna", "lead");
    joinTeam(room, "socket-Anna", "Anna B.");
    expect(roleOf(room, "socket-Anna")).toBe("lead");
  });

  it("macht die Rolle frei, wenn die Person das Team verlaesst", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "socket-Anna", "lead");
    leaveTeam(room, "socket-Anna");
    expect(chooseRole(room, "socket-Ben", "lead").ok).toBe(true);
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
    // Ein erneuter Beitritt aendert daran nichts.
    joinTeam(room, "socket-Ben", "Ben");
    expect(teamStateOf(room).leaderId).toBe("socket-Anna");
  });

  it("laesst die Teamleitung Rollen an andere vergeben", () => {
    const room = roomWith("Anna", "Ben");
    expect(chooseRole(room, "socket-Anna", "cyber", "socket-Ben")).toEqual({ ok: true });
    expect(roleOf(room, "socket-Ben")).toBe("cyber");
  });

  it("laesst Mitspieler nicht die Rolle eines anderen setzen", () => {
    const room = roomWith("Anna", "Ben");
    expect(chooseRole(room, "socket-Ben", "lead", "socket-Anna")).toEqual({
      ok: false,
      error: "Nur die Teamleitung kann Rollen an andere vergeben.",
    });
  });

  it("haelt auch fuer die Teamleitung jede Rolle exklusiv", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "socket-Anna", "lead");
    expect(chooseRole(room, "socket-Anna", "lead", "socket-Ben").ok).toBe(false);
  });

  it("laesst die Teamleitung eine Rolle wieder entziehen", () => {
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
