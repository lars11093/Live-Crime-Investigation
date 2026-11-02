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
  /** Geraeteart in Worten (#44). */
  kindLabel: string;
  /** Schon einmal ausgewertet, d. h. geoeffnet (#44)? */
  reviewed: boolean;
}

export const DEVICE_KIND_LABEL: Record<NonNullable<Device["kind"]>, string> = {
  smartphone: "Smartphone",
  laptop: "Laptop",
  tablet: "Tablet",
  storage: "Datentraeger",
};

export function toDeviceEntry(device: Device, reviewedIds: readonly string[] = []): DeviceEntry {
  const kindLabel = device.kind ? DEVICE_KIND_LABEL[device.kind] : "Geraet";
  const reviewed = reviewedIds.includes(device.id);
  if (device.locked) {
    return {
      device,
      canOpen: false,
      status: device.lockType ? `Gesperrt · ${device.lockType}` : "Gesperrt",
      kindLabel,
      reviewed,
    };
  }
  const count = device.messages.length;
  return {
    device,
    canOpen: true,
    status: `Entsperrt · ${count} ${count === 1 ? "Nachricht" : "Nachrichten"}`,
    kindLabel,
    reviewed,
  };
}

/**
 * Reihenfolge im Terminal: erst, was noch auszuwerten ist, dann bereits
 * Ausgewertetes, zuletzt Gesperrtes (#18, #44). Innerhalb einer Gruppe bleibt
 * die Reihenfolge aus dem Case-JSON.
 */
export function listDevices(devices: Device[], reviewedIds: readonly string[] = []): DeviceEntry[] {
  const entries = devices.map((d) => toDeviceEntry(d, reviewedIds));
  return [
    ...entries.filter((e) => e.canOpen && !e.reviewed),
    ...entries.filter((e) => e.canOpen && e.reviewed),
    ...entries.filter((e) => !e.canOpen),
  ];
}

/** Kopfzeile des Terminals (#44): was liegt vor, was ist erledigt. */
export function deviceSummary(entries: DeviceEntry[]): string {
  const open = entries.filter((e) => e.canOpen);
  const locked = entries.length - open.length;
  const pending = open.filter((e) => !e.reviewed).length;
  const parts = [
    `${open.length} auswertbar`,
    pending === 0 && open.length > 0 ? "alle ausgewertet" : `${pending} noch nicht ausgewertet`,
    `${locked} gesperrt`,
  ];
  return parts.join(" · ");
}

/** Merkt sich ein ausgewertetes Geraet — einmal reicht. */
export function markReviewed(ids: string[], deviceId: string): string[] {
  return ids.includes(deviceId) ? ids : [...ids, deviceId];
}
