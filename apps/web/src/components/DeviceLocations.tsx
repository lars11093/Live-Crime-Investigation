import type { Device } from "@case-zero/shared";
import { analyzeLocations, crimeWindowFrom, placeAtCrime } from "../lib/deviceLocations";

interface Props {
  device: Device;
  /** Tatzeit aus dem Briefing, z. B. "zwischen 22:30 und 22:50 Uhr". */
  timeOfCrime?: string;
}

/**
 * Story #72 — Standortverlauf eines Geraets.
 * Punkte in der Tatzeit sind hervorgehoben, ein Ortswechsel ist markiert.
 */
export function DeviceLocations({ device, timeOfCrime }: Props) {
  const locations = device.locations ?? [];
  if (locations.length === 0) return null;
  const entries = analyzeLocations(locations, crimeWindowFrom(timeOfCrime));
  const atCrime = placeAtCrime(entries);

  return (
    <section className="panel">
      <p className="terminal-title">Standortdaten · {entries.length} Punkte</p>
      <p className="case-status__hint">
        {atCrime
          ? `Zur Tatzeit war das Gerät hier: ${atCrime}`
          : "Aus der Tatzeit gibt es keinen Standortpunkt."}
      </p>
      <ol className="device-location__list">
        {entries.map((entry, index) => (
          <li
            key={index}
            className={`device-location${entry.inCrimeWindow ? " device-location--crime" : ""}`}
          >
            <time className="device-location__time">{entry.at}</time>
            <span>
              {entry.moved && <span className="evidence-list__kind">Ortswechsel</span>} {entry.place}
              {entry.inCrimeWindow && <span className="visually-hidden"> (in der Tatzeit)</span>}
            </span>
            {entry.source && <span className="device-location__source">{entry.source}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
