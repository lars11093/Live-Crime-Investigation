import type { CaseDefinition, CollectedEvidence, ShareResult } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/**
 * Alle Beweis-IDs, die es in einem Fall einzusammeln gibt: Funde im Tatort
 * (#9) und Chatnachrichten auf Geraeten (#21, Nachrichten-ID = Beweis-ID).
 */
export function collectableIds(caseDef: CaseDefinition): Set<string> {
  const ids = new Set<string>();
  for (const scene of caseDef.scenes) {
    for (const hotspot of scene.hotspots) {
      if (hotspot.evidence) ids.add(hotspot.evidence.id);
    }
  }
  for (const device of caseDef.devices ?? []) {
    for (const message of device.messages) ids.add(message.id);
  }
  return ids;
}

/** Nur die Felder, die ein Beweis hat — alles andere aus dem Client faellt weg. */
function clean(evidence: CollectedEvidence): CollectedEvidence {
  return {
    id: String(evidence.id),
    label: String(evidence.label),
    kind: evidence.kind,
    description: String(evidence.description),
    ...(evidence.imagePath ? { imagePath: String(evidence.imagePath) } : {}),
    foundAt: {
      sceneName: String(evidence.foundAt?.sceneName ?? ""),
      hotspotLabel: String(evidence.foundAt?.hotspotLabel ?? ""),
    },
  };
}

/**
 * Story #23 — einen Fund mit dem Team teilen.
 *
 * Drei Pruefungen, alle auf dem Server:
 *   - Wer teilt, muss im Team sein (#22). Sonst gaebe es keinen Urheber.
 *   - Der Beweis muss im Fall vorkommen. Ein erfundener Fund mit passendem
 *     Text wuerde sonst bei allen als echte Spur auftauchen.
 *   - Jeder Beweis wird nur einmal geteilt. Teilt ihn jemand zweites Mal,
 *     bleibt der erste Urheber stehen.
 */
export function shareFinding(room: Room, playerId: string, evidence: CollectedEvidence): ShareResult {
  const player = room.state.players.find((p) => p.id === playerId);
  if (!player) return { ok: false, reason: "not-in-team" };

  if (!evidence || !collectableIds(room.caseDef).has(String(evidence.id))) {
    return { ok: false, reason: "unknown-evidence" };
  }
  if (room.findings.some((f) => f.evidence.id === evidence.id)) {
    return { ok: false, reason: "already-shared" };
  }

  room.findings.push({ evidence: clean(evidence), sharedBy: player.name, sharedById: player.id });
  return { ok: true };
}
