import type { Hotspot, SceneTool } from "@case-zero/shared";

export const TOOL_LABEL: Record<SceneTool, string> = { uv: "UV-Lampe" };

/**
 * Story #60 — welche Stellen gerade sichtbar sind.
 * Stellen mit `requiresTool` erscheinen nur, solange das Werkzeug an ist;
 * schon untersuchte bleiben sichtbar, damit man sie wiederfindet.
 */
export function visibleHotspots(
  hotspots: Hotspot[],
  activeTool: SceneTool | null,
  investigatedIds: string[] = []
): Hotspot[] {
  return hotspots.filter(
    (h) => !h.requiresTool || h.requiresTool === activeTool || investigatedIds.includes(h.id)
  );
}

/** Welche Werkzeuge in einer Szene etwas bringen — nur die werden angeboten. */
export function toolsIn(hotspots: Hotspot[]): SceneTool[] {
  return [...new Set(hotspots.flatMap((h) => (h.requiresTool ? [h.requiresTool] : [])))];
}
