import type { Scene } from "@case-zero/shared";

/** Fortschritt in einem Bereich — einem Tatort (#24). */
export interface AreaProgress {
  sceneId: string;
  name: string;
  /** Gefundene Beweise in diesem Tatort. */
  found: number;
  /** Beweise, die es hier insgesamt zu finden gibt. */
  total: number;
  /** Stellen, die noch niemand untersucht hat — das ist, was "offen" heisst. */
  openHotspots: string[];
  /** Alle Beweise gefunden und alle Stellen angesehen. */
  done: boolean;
}

export interface CaseProgressSummary {
  found: number;
  total: number;
  /** 0-100, gerundet. Ohne Beweise im Fall 100: es gibt nichts mehr zu finden. */
  percent: number;
  areas: AreaProgress[];
}

/**
 * Story #24 — wie weit sind wir im Fall?
 *
 * Gezaehlt werden die Beweise aus dem Tatort (#9) — sie sind das, was der
 * Fall zum Finden vorsieht. Chatnachrichten (#21) zaehlen nicht mit: jede
 * Nachricht laesst sich sichern, aber nicht jede ist ein Beweis, und neun
 * Nachrichten wuerden den Balken verzerren.
 *
 * `foundIds` ist, was das Team weiss: die eigene Akte plus das, was andere
 * geteilt haben (#23). Deshalb "wir" und nicht "ich".
 */
export function summarizeProgress(
  scenes: Scene[],
  foundIds: Iterable<string>,
  investigatedIds: Iterable<string>
): CaseProgressSummary {
  const found = new Set(foundIds);
  const investigated = new Set(investigatedIds);

  const areas = scenes.map((scene): AreaProgress => {
    const evidenceIds = scene.hotspots.flatMap((h) => (h.evidence ? [h.evidence.id] : []));
    const foundHere = evidenceIds.filter((id) => found.has(id)).length;
    // Eine Stelle ist auch dann erledigt, wenn ihr Beweis schon gefunden wurde —
    // z. B. von jemand anderem im Team.
    const openHotspots = scene.hotspots
      .filter((h) => !investigated.has(h.id) && !(h.evidence && found.has(h.evidence.id)))
      .map((h) => h.label);
    return {
      sceneId: scene.id,
      name: scene.name,
      found: foundHere,
      total: evidenceIds.length,
      openHotspots,
      done: foundHere === evidenceIds.length && openHotspots.length === 0,
    };
  });

  const totalFound = areas.reduce((sum, a) => sum + a.found, 0);
  const total = areas.reduce((sum, a) => sum + a.total, 0);
  return {
    found: totalFound,
    total,
    percent: total === 0 ? 100 : Math.round((totalFound / total) * 100),
    areas,
  };
}
