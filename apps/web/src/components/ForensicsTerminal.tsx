import type { Device } from "@case-zero/shared";
import { listDevices } from "../lib/forensics";

interface Props {
  devices: Device[];
  onOpen: (deviceId: string) => void;
  onBack: () => void;
}

/**
 * Story #18 — Forensik-Terminal oeffnen.
 * Listet alle sichergestellten Geraete mit Besitzer und Status. Offene Geraete
 * lassen sich auswerten (Chatverlauf, #19), gesperrte sind deutlich als
 * gesperrt markiert und nicht anklickbar. Entsperren ist eine eigene Story.
 */
export function ForensicsTerminal({ devices, onOpen, onBack }: Props) {
  const entries = listDevices(devices);
  const lockedCount = entries.filter((e) => !e.canOpen).length;

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
          <p className="case-status__hint">
            {entries.length - lockedCount} auswertbar &middot; {lockedCount} gesperrt
          </p>
          <ul className="evidence-list__items">
            {entries.map(({ device, canOpen, status }) => (
              <li key={device.id}>
                <button
                  className={`evidence-list__item evidence-list__item--button device${
                    canOpen ? "" : " device--locked"
                  }`}
                  onClick={() => onOpen(device.id)}
                  disabled={!canOpen}
                  aria-label={`${device.label}, ${status}`}
                >
                  <span className="evidence-list__head">
                    <span className="evidence-list__label">{device.label}</span>
                    <span className={`device__status${canOpen ? "" : " device__status--locked"}`}>
                      {canOpen ? "Entsperrt" : "Gesperrt"}
                    </span>
                  </span>
                  <span className="evidence-list__found">Besitzer: {device.owner}</span>
                  <span className="evidence-list__description">
                    {canOpen ? `${status} — klicken zum Auswerten` : status}
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
