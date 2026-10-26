import type { Device } from "@case-zero/shared";

/**
 * Story #18 — wie ein Geraet im Forensik-Terminal erscheint.
 *
 * Reine Funktion, damit die Regel "gesperrt ist erkennbar und nicht
 * auswertbar" ohne Browser testbar ist.
 */
export interface DeviceEntry {
  device: Device;
  /** Laesst sich das Geraet jetzt auswerten (Chatverlauf oeffnen)? */
  canOpen: boolean;
  /** Status, wie er in der Liste steht, z. B. "Gesperrt · PIN, 4 Ziffern". */
  status: string;
}

export function toDeviceEntry(device: Device): DeviceEntry {
  if (device.locked) {
    return {
      device,
      canOpen: false,
      status: device.lockType ? `Gesperrt · ${device.lockType}` : "Gesperrt",
    };
  }
  const count = device.messages.length;
  return {
    device,
    canOpen: true,
    status: `Entsperrt · ${count} ${count === 1 ? "Nachricht" : "Nachrichten"}`,
  };
}

/** Auswertbare Geraete zuerst, sonst bleibt die Reihenfolge aus dem Case-JSON. */
export function listDevices(devices: Device[]): DeviceEntry[] {
  const entries = devices.map(toDeviceEntry);
  return [...entries.filter((e) => e.canOpen), ...entries.filter((e) => !e.canOpen)];
}
