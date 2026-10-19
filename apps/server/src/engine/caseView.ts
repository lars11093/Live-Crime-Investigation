import type { CaseDefinition, PublicCase } from "@case-zero/shared";

/**
 * Filtert einen Fall auf das, was der Client sehen darf.
 *
 * Architektur-Regel (CLAUDE.md): Der Client bekommt nie den vollen Case-State.
 * `scenarios` enthaelt Taeter, Motiv, Waffe und Tatzeit — also die Loesung.
 * Wer den Endpunkt aufruft, duerfte den Fall sonst ohne Ermittlung loesen.
 */
export function toPublicCase(caseDef: CaseDefinition): PublicCase {
  const { scenarios: _scenarios, ...publicCase } = caseDef;
  return publicCase;
}
