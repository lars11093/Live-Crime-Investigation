import type { CaseDefinition, RecoverResult } from "@case-zero/shared";

/**
 * Story #71 — geloeschte Nachrichten eines Geraets wiederherstellen.
 *
 * Die Nachrichten stehen im Case-JSON unter `deletedMessages` und gehen erst
 * hier an den Client — vorher kennt er nur ihre Anzahl (caseView.ts). Ein
 * gesperrtes Geraet muss zuerst entsperrt werden.
 */
export function recoverDeleted(caseDef: CaseDefinition, deviceId: string): RecoverResult {
  const device = caseDef.devices?.find((d) => d.id === deviceId);
  if (!device) return { ok: false, reason: "unknown-device" };
  if (device.locked) return { ok: false, reason: "locked" };
  return {
    ok: true,
    messages: (device.deletedMessages ?? []).map((message) => ({ ...message, recovered: true })),
  };
}
