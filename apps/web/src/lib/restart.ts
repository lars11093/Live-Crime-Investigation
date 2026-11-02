import type { Difficulty } from "@case-zero/shared";

/** Was ein Neustart braucht — als Parameter, damit die Logik ohne Browser testbar ist (#79). */
export interface RestartDeps {
  createRoom: (caseId: string, difficulty: Difficulty) => Promise<{ code: string }>;
  /** Nimmt das Team mit (#57). Fehlt, wenn man keinem Team beigetreten ist. */
  moveTeam?: (newCode: string) => Promise<{ ok: boolean }>;
  /** Ueberspringt das Intro in der neuen Session — man kennt es schon (#58). */
  skipIntro: (newCode: string) => void;
  go: (newCode: string) => void;
}

/**
 * Story #79 — einen Fall neu starten.
 *
 * Neu starten heisst: neue Team-Session fuer denselben Fall und dieselbe
 * Schwierigkeit. Der Server waehlt dabei das Taeter-Szenario neu, und der
 * Fortschritt beginnt leer, weil er am Team-Code haengt. Ist man im Team,
 * kommt das ganze Team mit; sonst wechselt nur man selbst.
 *
 * Gibt `null` bei Erfolg zurueck, sonst die Meldung fuer den Spieler.
 */
export async function restartCase(caseId: string, difficulty: Difficulty, deps: RestartDeps): Promise<string | null> {
  let code: string;
  try {
    code = (await deps.createRoom(caseId, difficulty)).code;
  } catch {
    return "Neue Session konnte nicht angelegt werden. Server nicht erreichbar.";
  }
  deps.skipIntro(code);
  if (deps.moveTeam) {
    try {
      const moved = await deps.moveTeam(code);
      // Das Team folgt per `team:moved` (#57); die Seite wechselt dann selbst.
      if (moved.ok) return null;
    } catch {
      // Ohne Antwort zum Team trotzdem allein weiter.
    }
  }
  deps.go(code);
  return null;
}
