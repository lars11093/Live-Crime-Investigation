import type { CaseDefinition, PublicCase } from "@case-zero/shared";

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
 * sie auf, ihre Nachrichten stehen aber erst nach dem Entsperren zur Verfuegung.
 */
export function toPublicCase(caseDef: CaseDefinition): PublicCase {
  const { scenarios: _scenarios, combinations: _combinations, ...publicCase } = caseDef;
  if (!publicCase.devices) return publicCase;
  return {
    ...publicCase,
    devices: publicCase.devices.map((device) =>
      device.locked ? { ...device, messages: [] } : device
    ),
  };
}
