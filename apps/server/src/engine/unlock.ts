import type { CaseDefinition, Device, UnlockResult } from "@case-zero/shared";

/**
 * Gross/klein, Leerzeichen und Bindestriche spielen keine Rolle: "0417",
 * "04 17" und bei Passwoertern "Finanzen-Q3" zaehlen gleich.
 */
function normalizeSecret(input: string): string {
  return input.toLowerCase().replace(/[\s\-_/]+/g, "");
}

/** Das Geraet, wie es nach dem Entsperren an den Client geht: offen, ohne Geheimnis. */
export function unlockedView(device: Device): Device {
  const { unlockSecret: _secret, deletedMessages, ...rest } = device;
  const deletedCount = deletedMessages?.length ?? 0;
  return deletedCount > 0 ? { ...rest, deletedCount, locked: false } : { ...rest, locked: false };
}

/**
 * Story #70 — ein gesperrtes Geraet entsperren.
 *
 * Die richtige PIN bzw. das Passwort steht nur im Case-JSON auf dem Server
 * und wird hier geprueft. Der Client bekommt Nachrichten und Dateien erst
 * zurueck, wenn der Versuch stimmt — vorher kennt er sie nicht (caseView.ts).
 */
export function unlockDevice(caseDef: CaseDefinition, deviceId: string, attempt: unknown): UnlockResult {
  const device = caseDef.devices?.find((d) => d.id === deviceId);
  if (!device) return { ok: false, reason: "unknown-device" };
  if (!device.locked) return { ok: false, reason: "not-locked" };
  if (
    typeof attempt !== "string" ||
    !device.unlockSecret ||
    normalizeSecret(attempt) !== normalizeSecret(device.unlockSecret)
  ) {
    return { ok: false, reason: "wrong-secret" };
  }
  return { ok: true, device: unlockedView(device) };
}
