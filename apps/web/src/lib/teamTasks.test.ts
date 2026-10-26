import { describe, expect, it } from "vitest";
import type { TeamTask, TeamView } from "@case-zero/shared";
import { doneTasks, groupOpenTasks, playerName } from "./teamTasks";

const task = (id: string, assigneeId: string | null, done = false): TeamTask => ({
  id,
  text: id,
  createdBy: "anna",
  assigneeId,
  done,
  createdAt: "2026-10-26T20:00:00.000Z",
});

const team: TeamView = {
  leaderId: "anna",
  players: [
    { id: "anna", name: "Anna", role: "lead" },
    { id: "ben", name: "Ben", role: null },
    { id: "cleo", name: "Cleo", role: "cyber" },
  ],
};

describe("Aufgabenliste anzeigen (#50)", () => {
  it("gruppiert offene Aufgaben: ich zuerst, dann das Team, zuletzt niemand", () => {
    const tasks = [task("t1", "ben"), task("t2", null), task("t3", "cleo"), task("t4", "cleo", true)];
    const groups = groupOpenTasks(tasks, team, "cleo");
    expect(groups.map((g) => [g.label, g.open.map((t) => t.id)])).toEqual([
      ["Du", ["t3"]],
      ["Ben", ["t1"]],
      ["Noch niemand", ["t2"]],
    ]);
  });

  it("zeigt Aufgaben fuer Unbekannte bei 'Noch niemand'", () => {
    const groups = groupOpenTasks([task("t1", "zoe")], team, "anna");
    expect(groups).toEqual([{ assigneeId: null, label: "Noch niemand", open: [task("t1", "zoe")] }]);
  });

  it("trennt erledigte Aufgaben ab", () => {
    expect(doneTasks([task("a", null), task("b", null, true)]).map((t) => t.id)).toEqual(["b"]);
  });

  it("nennt Personen beim Namen", () => {
    expect(playerName(team, "ben", "anna")).toBe("Ben");
    expect(playerName(team, "anna", "anna")).toBe("dir");
    expect(playerName(team, null, "anna")).toBe("niemand");
  });
});
