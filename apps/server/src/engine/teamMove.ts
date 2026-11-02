import type { Room } from "./rooms.js";

/**
 * Story #57 — das Team in einen neuen Fall mitnehmen.
 *
 * Nur wer im Team der alten Session ist, darf es umziehen lassen, und nur in
 * eine Session, die es gibt. Der Server schickt danach `team:moved` an alle
 * im alten Raum; beitreten tut jede Person selbst mit ihrem bisherigen Namen.
 */
export function canMoveTeam(
  from: Room | undefined,
  to: Room | undefined,
  playerId: string
): { ok: true; by: string } | { ok: false; error: string } {
  if (!from || !to) return { ok: false, error: "Ungueltiger Team-Code" };
  if (from === to) return { ok: false, error: "Das Team ist schon in dieser Session." };
  const player = from.state.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, error: "Nur Teammitglieder koennen das Team mitnehmen." };
  return { ok: true, by: player.name };
}
