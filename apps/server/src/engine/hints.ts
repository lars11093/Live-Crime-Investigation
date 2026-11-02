import type { HintState } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/** Wie viele Hinweise ein Team schon freigegeben hat (#74). Pro Raum, ohne rooms.ts anzufassen. */
const revealedByRoom = new WeakMap<Room, number>();

export function hintState(room: Room): HintState {
  const all = room.caseDef.hints ?? [];
  return { revealed: all.slice(0, revealedByRoom.get(room) ?? 0), total: all.length };
}

/**
 * Story #74 — einen Hinweis anfordern.
 *
 * Gilt fuer das ganze Team: wer anfordert, gibt den naechsten Hinweis fuer
 * alle frei. Die Hinweise stehen im Case-JSON und verlassen den Server nur
 * einzeln, damit niemand alle auf einmal aus der Netzwerk-Konsole liest.
 */
export function revealHint(room: Room): { ok: true; state: HintState } | { ok: false; state: HintState } {
  const total = room.caseDef.hints?.length ?? 0;
  const used = revealedByRoom.get(room) ?? 0;
  if (used >= total) return { ok: false, state: hintState(room) };
  revealedByRoom.set(room, used + 1);
  return { ok: true, state: hintState(room) };
}
