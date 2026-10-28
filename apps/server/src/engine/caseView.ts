import type { CaseDefinition, CaseSummary, PublicCase } from "@case-zero/shared";

/**
 * Filtert einen Fall auf das, was der Client sehen darf.
 *
 * Architektur-Regel (CLAUDE.md): Der Client bekommt nie den vollen Case-State.
 * Entfernt werden zwei Dinge:
 *   - `scenarios`: Taeter, Motiv, Waffe, Tatzeit — die Loesung selbst.
 *   - `combinations`: welche Beweispaare etwas ergeben. Mit dieser Liste
 *     liesse sich jede Verknuepfung aus der Netzwerk-Konsole ablesen, statt
 *     sie zu finden. Kombiniert wird deshalb serverseitig (#13).
 * Ausserdem bleiben gesperrte Geraete leer: Das Forensik-Terminal (#18) listet
 * sie auf, ihre Nachrichten und Dateien (#20) stehen aber erst nach dem
 * Entsperren zur Verfuegung.
 */
export function toPublicCase(caseDef: CaseDefinition): PublicCase {
  const { scenarios: _scenarios, combinations: _combinations, ...publicCase } = caseDef;
  if (!publicCase.devices) return publicCase;
  return {
    ...publicCase,
    devices: publicCase.devices.map((device) =>
      device.locked ? { ...device, messages: [], files: [] } : device
    ),
  };
}

/**
 * Die Fallauswahl (Story #30): ein Eintrag pro Fall, alphabetisch nach Titel.
 * Baut auf `toPublicCase` auf, damit hier nie etwas aus der Loesung landet.
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
