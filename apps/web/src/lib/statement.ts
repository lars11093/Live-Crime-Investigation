/** Ein Stueck Aussagetext — entweder Zeitangabe oder gewoehnlicher Text (#16). */
export interface StatementSegment {
  text: string;
  isTime: boolean;
}

/**
 * Uhrzeiten im Format H:MM oder HH:MM.
 *
 * Bewusst nur Uhrzeiten, keine Datumsangaben: in einer Aussage zur Tatnacht
 * ist die Minute das, was sich mit dem Badge-Protokoll und der Kamera-Luecke
 * abgleichen laesst. Die Wortgrenzen verhindern Treffer in laengeren Zahlen.
 */
const TIME_PATTERN = /\b(\d{1,2}:\d{2})\b/g;

/**
 * Zerlegt eine Aussage in Text- und Zeitstuecke (#16).
 *
 * Als eigene Funktion, weil das Hervorheben die eigentliche Arbeit der Story
 * ist — und so ohne Browser pruefbar bleibt.
 */
export function splitByTime(text: string): StatementSegment[] {
  const segments: StatementSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TIME_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), isTime: false });
    }
    segments.push({ text: match[0], isTime: true });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isTime: false });
  }
  return segments;
}

/** Alle Uhrzeiten einer Aussage, in der Reihenfolge des Auftretens. */
export function timesIn(text: string): string[] {
  return splitByTime(text)
    .filter((segment) => segment.isTime)
    .map((segment) => segment.text);
}

/**
 * Zerlegt eine Aussage in Saetze (#17).
 *
 * Markiert wird satzweise, nicht zeichengenau. Zwei Gruende: ein Widerspruch
 * ist praktisch immer ein ganzer Satz ("Gegen 22:40 war ich bereits zu Hause"),
 * und zeichengenaue Positionen halten kein Re-Rendern und keine Textaenderung
 * im Case-JSON aus.
 *
 * Bekannte Grenze: Abkuerzungen mit Punkt ("z. B.") wuerden faelschlich
 * trennen. In den Aussagen dieses Falls kommen keine vor.
 */
export function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!matches) return [];
  return matches.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0);
}
