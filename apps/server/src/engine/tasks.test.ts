import { describe, expect, it } from "vitest";
import type { CaseDefinition } from "@case-zero/shared";
import { createRoom } from "./rooms.js";
import { joinTeam } from "./team.js";
import { TASK_TEXT_MAX, addTask, removeTask, updateTask } from "./tasks.js";
import case01 from "../data/case-01.json" with { type: "json" };

const caseDef = case01 as CaseDefinition;
const now = new Date("2026-10-26T20:00:00Z");

function team() {
  const room = createRoom(caseDef);
  joinTeam(room, "anna", "Anna"); // Teamleitung (#48)
  joinTeam(room, "ben", "Ben");
  joinTeam(room, "cleo", "Cleo");
  return room;
}

describe("Gemeinsame Aufgabenliste (#50)", () => {
  it("legt eine offene, niemandem zugewiesene Aufgabe an", () => {
    const room = team();
    const result = addTask(room, "ben", "  Badge-Protokoll mit Kamera abgleichen ", now, "t1");
    expect(result.ok && result.tasks).toEqual([
      {
        id: "t1",
        text: "Badge-Protokoll mit Kamera abgleichen",
        createdBy: "ben",
        assigneeId: null,
        done: false,
        createdAt: "2026-10-26T20:00:00.000Z",
      },
    ]);
  });

  it("laesst nur Teammitglieder Aufgaben anlegen", () => {
    const room = team();
    expect(addTask(room, "fremd", "Hallo", now).ok).toBe(false);
    expect(addTask(room, "ben", "  ", now).ok).toBe(false);
    expect(addTask(room, "ben", "x".repeat(TASK_TEXT_MAX + 1), now).ok).toBe(false);
  });

  it("weist zu, hakt ab und macht wieder offen", () => {
    const room = team();
    addTask(room, "ben", "Alibi von Leo pruefen", now, "t1");
    updateTask(room, "cleo", "t1", { assigneeId: "cleo" });
    updateTask(room, "cleo", "t1", { done: true });
    expect(room.tasks?.[0]).toMatchObject({ assigneeId: "cleo", done: true });
    updateTask(room, "ben", "t1", { done: false, assigneeId: null });
    expect(room.tasks?.[0]).toMatchObject({ assigneeId: null, done: false });
  });

  it("weist niemanden ausserhalb des Teams zu", () => {
    const room = team();
    addTask(room, "ben", "Alibi pruefen", now, "t1");
    expect(updateTask(room, "ben", "t1", { assigneeId: "fremd" }).ok).toBe(false);
    expect(updateTask(room, "ben", "gibts-nicht", { done: true }).ok).toBe(false);
  });

  it("laesst nur Ersteller oder Teamleitung loeschen", () => {
    const room = team();
    addTask(room, "ben", "A", now, "t1");
    addTask(room, "ben", "B", now, "t2");
    expect(removeTask(room, "cleo", "t1").ok).toBe(false);
    expect(removeTask(room, "ben", "t1").ok).toBe(true);
    expect(removeTask(room, "anna", "t2").ok).toBe(true);
    expect(room.tasks).toEqual([]);
  });
});
