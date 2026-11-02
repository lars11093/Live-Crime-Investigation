import type { ActivityEntry, Role } from "@case-zero/shared";
import type { Room } from "./rooms.js";

/** Mehr als das liest niemand nach; ältere Einträge fallen vorne weg. */
export const MAX_ACTIVITY = 100;

/** Rollennamen wie im UI (README Abschnitt 1) — fürs Protokoll in ganzen Sätzen. */
const ROLE_NAME: Record<Role, string> = {
  forensics: "Forensiker",
  cyber: "Cyber Investigator",
  interrogation: "Verhör-Spezialist",
  field: "Field Detective",
  lead: "Lead Detective",
};

/**
 * Story #76 — ein Eintrag im Aktivitätsprotokoll des Teams.
 *
 * Geschrieben wird nur auf dem Server, nachdem eine Aktion dort geprüft und
 * angenommen wurde. Der Client kann so keine Einträge erfinden.
 * `who` ist `null` für Ereignisse des ganzen Teams (Hinweis, Anklage).
 */
export function logActivity(room: Room, who: string | null, text: string, now: Date = new Date()): ActivityEntry {
  const entry: ActivityEntry = {
    id: `a-${now.getTime().toString(36)}-${room.activity.length}`,
    at: now.toISOString(),
    who,
    text,
  };
  room.activity.push(entry);
  if (room.activity.length > MAX_ACTIVITY) room.activity.splice(0, room.activity.length - MAX_ACTIVITY);
  return entry;
}

/** Name einer Verbindung im Team, falls sie (noch) dabei ist. */
export function nameOf(room: Room, playerId: string): string | undefined {
  return room.state.players.find((p) => p.id === playerId)?.name;
}

/** Text für eine angenommene Rollenänderung (#31, #48). */
export function roleText(role: Role | null, targetName: string | null): string {
  if (targetName === null) {
    return role ? `hat die Rolle ${ROLE_NAME[role]} übernommen` : "hat die eigene Rolle abgegeben";
  }
  return role ? `hat ${targetName} die Rolle ${ROLE_NAME[role]} gegeben` : `hat ${targetName} die Rolle entzogen`;
}
