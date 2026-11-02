import type { DeviceLocation } from "@case-zero/shared";
import { timesIn } from "./statement";
import { clockToMinutes } from "./clock";

/** Ein Standortpunkt, eingeordnet gegenueber der Tatzeit (#72). */
export interface LocationEntry extends DeviceLocation {
  inCrimeWindow: boolean;
  /** Hat das Geraet seit dem vorherigen Punkt den Ort gewechselt? */
  moved: boolean;
}

/**
 * Die Tatzeit als Minutenfenster, gelesen aus dem Briefing-Text (#6), z. B.
 * "Freitag, 12.09., zwischen 22:30 und 22:50 Uhr" -> 22:30 bis 22:50.
 * Steht nur eine Uhrzeit da, ist das Fenster diese eine Minute.
 */
export function crimeWindowFrom(timeOfCrime: string | undefined): { from: number; to: number } | null {
  const minutes = timesIn(timeOfCrime ?? "")
    .map(clockToMinutes)
    .filter((m): m is number => m !== null);
  if (minutes.length === 0) return null;
  return { from: Math.min(...minutes), to: Math.max(...minutes) };
}

/**
 * Story #72 — Standortdaten auswerten.
 *
 * Markiert, welche Punkte in die Tatzeit fallen und wo das Geraet den Ort
 * gewechselt hat. Die Uhrzeit steht am Ende von `at` ("12.09. 22:31").
 */
export function analyzeLocations(
  locations: DeviceLocation[],
  window: { from: number; to: number } | null
): LocationEntry[] {
  return locations.map((location, index) => {
    const clock = timesIn(location.at).at(-1);
    const minutes = clock ? clockToMinutes(clock) : null;
    return {
      ...location,
      inCrimeWindow: window !== null && minutes !== null && minutes >= window.from && minutes <= window.to,
      moved: index > 0 && locations[index - 1].place !== location.place,
    };
  });
}

/** Der letzte bekannte Ort vor oder in der Tatzeit — die Frage, die man meistens hat. */
export function placeAtCrime(entries: LocationEntry[]): string | null {
  return entries.filter((e) => e.inCrimeWindow).at(-1)?.place ?? null;
}
