import type { CollectedEvidence, ShareResult } from "@case-zero/shared";
import type { Room } from "./rooms.js";
import { clean, collectableIds } from "./sharing.js";

/** Mehr Einträge braucht kein Fall; schützt den Raum vor einem flutenden Client. */
export const MAX_DISCOVERIES = 200;

/**
 * Story #75 — ein eingesammelter Fund geht live ans Team.
 *
 * Anders als beim Teilen (#23) klickt niemand: der Client meldet jeden Fund
 * beim Einsammeln. Geprüft wird trotzdem auf dem Server — dieselben Regeln:
 *   - Wer meldet, muss im Team sein.
 *   - Der Beweis muss im Fall vorkommen, sonst könnte jemand erfundene Spuren
 *     bei allen einblenden.
 *   - Pro Beweis zählt der erste Fund. Sammelt ihn jemand zweites ein, bleibt
 *     der erste Finder stehen ("already-shared").
 */
export function recordDiscovery(
  room: Room,
  playerId: string,
  evidence: CollectedEvidence,
  now: Date = new Date()
): ShareResult {
  const player = room.state.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, reason: "not-in-team" };

  if (!evidence || !collectableIds(room.caseDef).has(String(evidence.id))) {
    return { ok: false, reason: "unknown-evidence" };
  }
  if (room.discoveries.some((d) => d.evidence.id === evidence.id)) {
    return { ok: false, reason: "already-shared" };
  }
  if (room.discoveries.length >= MAX_DISCOVERIES) return { ok: false, reason: "already-shared" };

  room.discoveries.push({
    evidence: clean(evidence),
    foundBy: player.name,
    foundById: player.id,
    foundAt: now.toISOString(),
  });
  return { ok: true };
}
