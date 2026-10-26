import type { TeamTask, TeamTaskPatch } from "@case-zero/shared";
import type { Room } from "./rooms.js";

export const TASK_TEXT_MAX = 140;
export const TASKS_MAX = 50;

type Result = { ok: true; tasks: TeamTask[] } | { ok: false; reason: string };

function tasksOf(room: Room): TeamTask[] {
  return room.tasks ?? [];
}

function isMember(room: Room, playerId: unknown): playerId is string {
  return typeof playerId === "string" && room.state.players.some((p) => p.id === playerId);
}

/**
 * Legt eine Aufgabe an (Story #50). Nur, wer im Team ist (#31), damit der
 * Name in der Liste stimmt.
 */
export function addTask(
  room: Room,
  playerId: unknown,
  text: unknown,
  now: Date = new Date(),
  id: string = `t-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
): Result {
  if (!isMember(room, playerId)) return { ok: false, reason: "Tritt zuerst dem Team bei." };
  const clean = typeof text === "string" ? text.trim() : "";
  if (!clean) return { ok: false, reason: "Die Aufgabe braucht einen Text." };
  if (clean.length > TASK_TEXT_MAX) return { ok: false, reason: `Hoechstens ${TASK_TEXT_MAX} Zeichen.` };
  if (tasksOf(room).length >= TASKS_MAX) return { ok: false, reason: "Die Liste ist voll." };

  const task: TeamTask = {
    id,
    text: clean,
    createdBy: playerId,
    assigneeId: null,
    done: false,
    createdAt: now.toISOString(),
  };
  room.tasks = [...tasksOf(room), task];
  return { ok: true, tasks: room.tasks };
}

/**
 * Aendert eine Aufgabe (#50): erledigt/offen und wer sie uebernimmt.
 *
 * Jedes Teammitglied darf das — die Liste ist gemeinsam. Zugewiesen werden
 * kann nur jemand aus dem Team, oder niemand (`null`).
 */
export function updateTask(room: Room, actorId: unknown, taskId: unknown, patch: TeamTaskPatch): Result {
  if (!isMember(room, actorId)) return { ok: false, reason: "Tritt zuerst dem Team bei." };
  const task = tasksOf(room).find((t) => t.id === taskId);
  if (!task) return { ok: false, reason: "Diese Aufgabe gibt es nicht mehr." };
  if (patch.assigneeId !== undefined && patch.assigneeId !== null && !isMember(room, patch.assigneeId)) {
    return { ok: false, reason: "Diese Person ist nicht im Team." };
  }

  const next: TeamTask = {
    ...task,
    ...(typeof patch.done === "boolean" ? { done: patch.done } : {}),
    ...(patch.assigneeId !== undefined ? { assigneeId: patch.assigneeId } : {}),
  };
  room.tasks = tasksOf(room).map((t) => (t.id === task.id ? next : t));
  return { ok: true, tasks: room.tasks };
}

/** Entfernt eine Aufgabe — nur, wer sie angelegt hat, oder die Teamleitung (#48). */
export function removeTask(room: Room, actorId: unknown, taskId: unknown): Result {
  const task = tasksOf(room).find((t) => t.id === taskId);
  if (!task) return { ok: false, reason: "Diese Aufgabe gibt es nicht mehr." };
  if (actorId !== task.createdBy && actorId !== room.leaderId) {
    return { ok: false, reason: "Nur wer die Aufgabe angelegt hat oder die Teamleitung kann sie loeschen." };
  }
  room.tasks = tasksOf(room).filter((t) => t.id !== task.id);
  return { ok: true, tasks: room.tasks };
}
