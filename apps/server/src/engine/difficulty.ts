import { DIFFICULTIES, type Difficulty } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/** Schwierigkeit pro Raum (#56), ohne rooms.ts anzufassen. */
const difficultyByRoom = new WeakMap<Room, Difficulty>();

/** Unbekannte oder fehlende Werte werden zu "normal" — so verhalten sich alte Clients wie bisher. */
export function parseDifficulty(raw: unknown): Difficulty {
  return DIFFICULTIES.includes(raw as Difficulty) ? (raw as Difficulty) : "normal";
}

export function setDifficulty(room: Room, difficulty: Difficulty): void {
  difficultyByRoom.set(room, difficulty);
}

export function difficultyOf(room: Room): Difficulty {
  return difficultyByRoom.get(room) ?? "normal";
}
