import type { CaseDefinition, CaseSummary, PublicCase } from "@case-zero/shared";

/**
 * Filtert einen Fall auf das, was der Client sehen darf.
 *
 * Architektur-Regel (CLAUDE.md): Der Client bekommt nie den vollen Case-State.
 * Entfernt werden zwei Dinge:
 *   - `scenarios`: Täter, Motiv, Waffe, Tatzeit — die Lösung selbst.
 *   - `combinations`: welche Beweispaare etwas ergeben. Mit dieser Liste
 *     liesse sich jede Verknüpfung aus der Netzwerk-Konsole ablesen, statt
 *     sie zu finden. Kombiniert wird deshalb serverseitig (#13).
 * Ausserdem bleiben gesperrte Geräte leer: Das Forensik-Terminal (#18) listet
 * sie auf, ihre Nachrichten, Dateien (#20) und Standortdaten (#72) stehen aber
 * erst nach dem Entsperren zur Verfügung. PIN und Passwort (`unlockSecret`, #70)
 * fehlen bei jedem Gerät: geprüft wird nur auf dem Server (engine/unlock.ts).
 * Gelöschte Nachrichten (#71) gehen nie mit, nur ihre Anzahl — wiederhergestellt
 * wird über engine/recover.ts.
 */
export function toPublicCase(caseDef: CaseDefinition): PublicCase {
  // Hinweise (#74) gehen nur einzeln über engine/hints.ts raus.
  const { scenarios: _scenarios, combinations: _combinations, hints: _hints, ...publicCase } = caseDef;
  if (!publicCase.devices) return publicCase;
  return {
    ...publicCase,
    devices: publicCase.devices.map(({ unlockSecret: _secret, deletedMessages, ...device }) => {
      const deletedCount = device.locked ? 0 : (deletedMessages?.length ?? 0);
      const view = deletedCount > 0 ? { ...device, deletedCount } : device;
      // Gesperrt: weder Nachrichten (#18) noch Systemprotokoll (#46).
      return device.locked ? { ...view, messages: [], files: [], locations: [], systemLog: [] } : view;
    }),
  };
}

/**
 * Die Fallauswahl (Story #30): ein Eintrag pro Fall, alphabetisch nach Titel.
 * Baut auf `toPublicCase` auf, damit hier nie etwas aus der Lösung landet.
 */
export function toCaseSummaries(cases: Iterable<CaseDefinition>): CaseSummary[] {
  return [...cases]
    .map((caseDef) => {
      const publicCase = toPublicCase(caseDef);
      return {
        id: publicCase.id,
        title: publicCase.title,
        location: publicCase.briefing?.location,
        timeOfCrime: publicCase.briefing?.timeOfCrime,
        suspectCount: publicCase.suspects.length,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "de"));
}
