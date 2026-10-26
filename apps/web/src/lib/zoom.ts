/**
 * Zoomstufen fuer den Tatort (Story #33).
 *
 * Feste Stufen statt stufenlos: mit Knoepfen und Tastatur bedient sich das
 * vorhersehbarer, und 300 % reicht, um Details wie den Lippenstift am
 * Tassenrand zu erkennen.
 */
export const ZOOM_LEVELS = [1, 1.5, 2, 3] as const;

export function zoomIn(current: number): number {
  return ZOOM_LEVELS.find((level) => level > current) ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
}

export function zoomOut(current: number): number {
  return [...ZOOM_LEVELS].reverse().find((level) => level < current) ?? ZOOM_LEVELS[0];
}

/**
 * Wohin gescrollt werden muss, damit beim Zoomen derselbe Punkt in der Mitte
 * des Ausschnitts bleibt.
 *
 * `scroll` und `viewport` sind Pixel einer Achse; das Ergebnis ist die neue
 * Scrollposition auf dieser Achse.
 */
export function keepCenter(scroll: number, viewport: number, from: number, to: number): number {
  const center = (scroll + viewport / 2) / from;
  const next = center * to - viewport / 2;
  const max = viewport * to - viewport;
  return Math.min(Math.max(next, 0), Math.max(max, 0));
}
