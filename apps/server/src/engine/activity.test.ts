import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam } from "./team.js";
import { MAX_ACTIVITY, logActivity, nameOf, roleText } from "./activity.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;

describe("Aktivitätsprotokoll (#76)", () => {
  it("hält Person, Zeit und Text fest", () => {
    const room = createRoom(caseDef);
    const at = new Date("2026-11-02T10:15:00Z");
    const entry = logActivity(room, "Loris", "hat «Tasse» gefunden", at);
    expect(entry).toMatchObject({ at: "2026-11-02T10:15:00.000Z", who: "Loris", text: "hat «Tasse» gefunden" });
    expect(room.activity).toEqual([entry]);
  });

  it("führt die Einträge in zeitlicher Reihenfolge mit eindeutigen IDs", () => {
    const room = createRoom(caseDef);
    const at = new Date("2026-11-02T10:15:00Z");
    logActivity(room, "Loris", "eins", at);
    logActivity(room, null, "zwei", at);
    expect(room.activity.map((e) => e.text)).toEqual(["eins", "zwei"]);
    expect(new Set(room.activity.map((e) => e.id)).size).toBe(2);
  });

  it("behält nur die neuesten Einträge", () => {
    const room = createRoom(caseDef);
    for (let i = 0; i < MAX_ACTIVITY + 5; i++) logActivity(room, "Loris", `#${i}`);
    expect(room.activity).toHaveLength(MAX_ACTIVITY);
    expect(room.activity[0].text).toBe("#5");
  });

  it("kennt die Namen der Teammitglieder", () => {
    const room = createRoom(caseDef);
    joinTeam(room, "socket-a", "Loris");
    expect(nameOf(room, "socket-a")).toBe("Loris");
    expect(nameOf(room, "socket-x")).toBeUndefined();
  });

  it("beschreibt Rollenwechsel in ganzen Sätzen", () => {
    expect(roleText("cyber", null)).toBe("hat die Rolle Cyber Investigator übernommen");
    expect(roleText(null, null)).toBe("hat die eigene Rolle abgegeben");
    expect(roleText("lead", "Lars")).toBe("hat Lars die Rolle Lead Detective gegeben");
    expect(roleText(null, "Lars")).toBe("hat Lars die Rolle entzogen");
  });
});
