import type { Suspect } from "@case-zero/shared";
import type { Contradiction } from "./caseProgress";
import { timesIn } from "./statement";

/** Eine Zeile im Vergleich zweier Verdaechtiger (#40). */
export interface CompareRow {
  label: string;
  left: string;
  right: string;
  /** Unterscheiden sich die Angaben? Dann hebt die Ansicht die Zeile hervor. */
  differs: boolean;
}

/**
 * Stellt zwei Verdaechtige Angabe fuer Angabe gegenueber (Story #40).
 *
 * Neben den Profildaten (#15) kommen zwei abgeleitete Zeilen dazu, weil genau
 * dort die Unterschiede fuer die Ermittlung stecken: die Uhrzeiten aus der
 * Aussage (#16) und wie viele Saetze man selbst als Widerspruch markiert
 * hat (#17).
 */
export function compareSuspects(
  left: Suspect,
  right: Suspect,
  contradictions: Contradiction[] = []
): CompareRow[] {
  const motive = (s: Suspect) => s.knownMotive ?? "Kein Motiv bekannt";
  const times = (s: Suspect) => {
    const list = timesIn(s.statement ?? "");
    return list.length > 0 ? list.join(", ") : "keine";
  };
  const marked = (s: Suspect) =>
    String(contradictions.filter((c) => c.suspectId === s.id).length);

  const row = (label: string, get: (s: Suspect) => string): CompareRow => {
    const l = get(left);
    const r = get(right);
    return { label, left: l, right: r, differs: l !== r };
  };

  return [
    row("Alter", (s) => `${s.age} Jahre`),
    row("Beziehung zum Opfer", (s) => s.relationToVictim),
    row("Bekanntes Motiv", motive),
    row("Uhrzeiten in der Aussage", times),
    row("Markierte Widersprueche", marked),
  ];
}

/**
 * Uhrzeiten, die nur einer der beiden nennt (#40).
 *
 * Nennen beide dieselbe Uhrzeit, war vielleicht beides zur selben Zeit am
 * selben Ort — das ist fuer den Vergleich spannender als die Zeit selbst.
 */
export function sharedTimes(left: Suspect, right: Suspect): string[] {
  const rightTimes = new Set(timesIn(right.statement ?? ""));
  return [...new Set(timesIn(left.statement ?? ""))].filter((t) => rightTimes.has(t));
}
