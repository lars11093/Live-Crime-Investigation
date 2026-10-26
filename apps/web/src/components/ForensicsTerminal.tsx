import type { Device } from "@case-zero/shared";
import { deviceSummary, listDevices } from "../lib/forensics";

interface Props {
  devices: Device[];
  /** Bereits geoeffnete Geraete (#44). */
  reviewedIds?: string[];
  onOpen: (deviceId: string) => void;
  onBack: () => void;
}

/**
 * Story #18 — Forensik-Terminal oeffnen.
 * Listet alle sichergestellten Geraete mit Besitzer und Status. Offene Geraete
 * lassen sich auswerten (Chatverlauf, #19), gesperrte sind deutlich als
 * gesperrt markiert und nicht anklickbar. Entsperren ist eine eigene Story.
 *
 * Story #44 — alle sichergestellten Geraete auflisten. Dazu Geraeteart, wo es
 * sichergestellt wurde und ob es schon ausgewertet ist; was noch aussteht,
 * steht oben.
 */
export function ForensicsTerminal({ devices, reviewedIds = [], onOpen, onBack }: Props) {
  const entries = listDevices(devices, reviewedIds);

  return (
    <section className="panel">
      <div className="evidence-list__bar">
        <p className="terminal-title" style={{ margin: 0 }}>
          Forensik-Terminal · {devices.length} {devices.length === 1 ? "Geraet" : "Geraete"}
        </p>
        <button onClick={onBack}>Zurueck zur Fallakte</button>
      </div>

      {entries.length === 0 ? (
        <p className="evidence-list__empty">In diesem Fall wurden keine Geraete sichergestellt.</p>
      ) : (
        <>
          <p className="case-status__hint">{deviceSummary(entries)}</p>
          <ul className="evidence-list__items">
            {entries.map(({ device, canOpen, status, kindLabel, reviewed }) => (
              <li key={device.id}>
                <button
                  className={`evidence-list__item evidence-list__item--button device${
                    canOpen ? "" : " device--locked"
                  }`}
                  onClick={() => onOpen(device.id)}
                  disabled={!canOpen}
                  aria-label={`${device.label}, ${kindLabel}, ${status}${
                    canOpen ? (reviewed ? ", ausgewertet" : ", noch nicht ausgewertet") : ""
                  }`}
                >
                  <span className="evidence-list__head">
                    <span className="evidence-list__label">{device.label}</span>
                    <span className={`device__status${canOpen ? "" : " device__status--locked"}`}>
                      {canOpen ? (reviewed ? "Ausgewertet ✓" : "Entsperrt") : "Gesperrt"}
                    </span>
                  </span>
                  <span className="evidence-list__found">
                    {kindLabel} · Besitzer: {device.owner}
                    {device.seizedAt && ` · sichergestellt: ${device.seizedAt}`}
                  </span>
                  <span className="evidence-list__description">
                    {canOpen
                      ? `${status} — ${reviewed ? "erneut ansehen" : "klicken zum Auswerten"}`
                      : status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
