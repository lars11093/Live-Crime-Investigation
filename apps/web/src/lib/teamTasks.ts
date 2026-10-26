import type { TeamTask, TeamView } from "@case-zero/shared";

/** Eine Gruppe der Aufgabenliste: wer was noch erledigt (#50). */
export interface TaskGroup {
  /** `null` = noch niemand zugewiesen. */
  assigneeId: string | null;
  label: string;
  open: TeamTask[];
}

/**
 * Gruppiert offene Aufgaben nach Person (Story #50) — "wer was noch erledigt".
 *
 * Reihenfolge: zuerst ich, dann das Team in Beitrittsreihenfolge, zuletzt
 * "Noch niemand". Personen ohne offene Aufgabe fallen weg.
 */
export function groupOpenTasks(tasks: TeamTask[], team: TeamView | null, myId: string): TaskGroup[] {
  const players = team?.players ?? [];
  const order = [
    ...players.filter((p) => p.id === myId),
    ...players.filter((p) => p.id !== myId),
  ];
  const groups: TaskGroup[] = order.map((p) => ({
    assigneeId: p.id,
    label: p.id === myId ? "Du" : p.name,
    open: tasks.filter((t) => !t.done && t.assigneeId === p.id),
  }));
  // Zugewiesen an jemanden, der (noch) nicht im Team-Stand ist — trotzdem zeigen.
  const known = new Set(players.map((p) => p.id));
  const orphaned = tasks.filter((t) => !t.done && t.assigneeId && !known.has(t.assigneeId));
  groups.push({
    assigneeId: null,
    label: "Noch niemand",
    open: [...tasks.filter((t) => !t.done && !t.assigneeId), ...orphaned],
  });
  return groups.filter((g) => g.open.length > 0);
}

export function doneTasks(tasks: TeamTask[]): TeamTask[] {
  return tasks.filter((t) => t.done);
}

export function playerName(team: TeamView | null, playerId: string | null, myId: string): string {
  if (!playerId) return "niemand";
  if (playerId === myId) return "dir";
  return team?.players.find((p) => p.id === playerId)?.name ?? "jemand";
}
