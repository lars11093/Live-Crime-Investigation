import type { CaseDefinition, PublicCase } from "@case-zero/shared";

/**
 * Filtert einen Fall auf das, was der Client sehen darf.
 *
 * Architektur-Regel (CLAUDE.md): Der Client bekommt nie den vollen Case-State.
 * Entfernt werden zwei Dinge:
 *   - `scenarios`: Täter, Motiv, Waffe, Tatzeit — die Lösung selbst.
 *   - `combinations`: welche Beweispaare etwas ergeben. Mit dieser Liste
 *     liesse sich jede Verknüpfung aus der Netzwerk-Konsole ablesen, statt
 *     sie zu finden. Kombiniert wird deshalb serverseitig (#13).
 */
export function toPublicCase(caseDef: CaseDefinition): PublicCase {
  const { scenarios: _scenarios, combinations: _combinations, ...publicCase } = caseDef;
  return publicCase;
}
