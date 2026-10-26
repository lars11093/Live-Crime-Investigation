import type { Suspect } from "@case-zero/shared";
import { splitIntoSentences } from "./statement";

/** Ein Treffer: ein Satz aus der Aussage einer Person (#41). */
export interface StatementHit {
  suspectId: string;
  suspectName: string;
  sentenceIndex: number;
  sentence: string;
  /** Der Satz in Stuecken, Treffer markiert — fuers Hervorheben. */
  segments: { text: string; hit: boolean }[];
}

const UMLAUT: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue" };

/**
 * Kleinschreibung, Umlaute ausgeschrieben — mit einer Zuordnung zurueck auf
 * die Position im Originaltext, damit "Buero" im Satz "Büro" markiert werden
 * kann, obwohl die beiden unterschiedlich lang sind.
 */
function normalizeWithMap(text: string): { normalized: string; toOriginal: number[] } {
  let normalized = "";
  const toOriginal: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const lower = text[i].toLowerCase();
    const replacement = UMLAUT[lower] ?? lower;
    for (const char of replacement) {
      normalized += char;
      toOriginal.push(i);
    }
  }
  return { normalized, toOriginal };
}

function normalize(text: string): string {
  return normalizeWithMap(text).normalized;
}

/** Zerlegt einen Satz in Treffer- und Nicht-Treffer-Stuecke. */
export function highlight(sentence: string, words: string[]): StatementHit["segments"] {
  const { normalized, toOriginal } = normalizeWithMap(sentence);
  const marked = new Array<boolean>(sentence.length).fill(false);
  for (const word of words) {
    let from = 0;
    for (;;) {
      const at = normalized.indexOf(word, from);
      if (at === -1) break;
      const start = toOriginal[at];
      const end = toOriginal[at + word.length - 1];
      for (let i = start; i <= end; i++) marked[i] = true;
      from = at + word.length;
    }
  }
  const segments: StatementHit["segments"] = [];
  for (let i = 0; i < sentence.length; i++) {
    const last = segments[segments.length - 1];
    if (last && last.hit === marked[i]) last.text += sentence[i];
    else segments.push({ text: sentence[i], hit: marked[i] });
  }
  return segments;
}

/**
 * Durchsucht die Aussagen aller Verdaechtigen nach Stichworten (Story #41).
 *
 * Satzweise, wie das Markieren in #17: ein Treffer ist der Satz, in dem alle
 * Woerter vorkommen. Die Satznummer passt deshalb zu den Widerspruchs-
 * Markierungen.
 */
export function searchStatements(suspects: Suspect[], query: string): StatementHit[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const hits: StatementHit[] = [];
  for (const suspect of suspects) {
    splitIntoSentences(suspect.statement ?? "").forEach((sentence, sentenceIndex) => {
      const text = normalize(sentence);
      if (words.every((word) => text.includes(word))) {
        hits.push({
          suspectId: suspect.id,
          suspectName: suspect.name,
          sentenceIndex,
          sentence,
          segments: highlight(sentence, words),
        });
      }
    });
  }
  return hits;
}
