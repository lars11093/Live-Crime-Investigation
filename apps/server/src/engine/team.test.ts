import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { chooseRole, joinTeam } from "./team.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

function roomWith(...names: string[]) {
  const room = createRoom(caseDef);
  for (const name of names) joinTeam(room, name.toLowerCase(), name);
  return room;
}

describe("Team beitreten (#31)", () => {
  it("nimmt neue Spieler ohne Rolle auf", () => {
    const room = roomWith("Anna");
    expect(room.state.players).toEqual([{ id: "anna", name: "Anna", role: null }]);
  });

  it("legt beim erneuten Beitritt niemanden doppelt an", () => {
    const room = roomWith("Anna");
    joinTeam(room, "anna", "Anna B.");
    expect(room.state.players).toHaveLength(1);
    expect(room.state.players[0].name).toBe("Anna B.");
  });

  it("verlangt ID und Namen", () => {
    const room = createRoom(caseDef);
    expect(joinTeam(room, "", "Anna").ok).toBe(false);
    expect(joinTeam(room, "anna", "  ").ok).toBe(false);
  });
});

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

  it("laesst Mitspieler nicht die Rolle eines anderen setzen", () => {
    const room = roomWith("Anna", "Ben");
    // Anna leitet (#48), Ben nicht.
    expect(chooseRole(room, "ben", "anna", "lead")).toEqual({
      ok: false,
      message: "Nur die Teamleitung kann Rollen an andere vergeben.",
    });
  });

  it("weist unbekannte Rollen und Personen ab", () => {
    const room = roomWith("Anna");
    expect(chooseRole(room, "anna", "anna", "koch").ok).toBe(false);
    expect(chooseRole(room, "zoe", "zoe", "lead").ok).toBe(false);
  });
});

describe("Teamleitung vergibt Rollen (#48)", () => {
  it("macht die erste Person im Team zur Teamleitung", () => {
    const room = roomWith("Anna", "Ben");
    expect(room.leaderId).toBe("anna");
    // Ein erneuter Beitritt aendert daran nichts.
    joinTeam(room, "ben", "Ben");
    expect(room.leaderId).toBe("anna");
  });

  it("laesst die Teamleitung Rollen an andere vergeben", () => {
    const room = roomWith("Anna", "Ben");
    expect(chooseRole(room, "anna", "ben", "cyber").ok).toBe(true);
    expect(room.state.players.find((p) => p.id === "ben")?.role).toBe("cyber");
  });

  it("haelt auch fuer die Teamleitung jede Rolle exklusiv", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "anna", "anna", "lead");
    expect(chooseRole(room, "anna", "ben", "lead").ok).toBe(false);
  });

  it("laesst die Teamleitung eine Rolle wieder entziehen", () => {
    const room = roomWith("Anna", "Ben");
    chooseRole(room, "ben", "ben", "field");
    chooseRole(room, "anna", "ben", null);
    expect(room.state.players.find((p) => p.id === "ben")?.role).toBeNull();
  });
});
