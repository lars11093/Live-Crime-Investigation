import type { ChatMessage, CollectedEvidence, Device } from "@case-zero/shared";

/**
 * Story #21 — eine digitale Spur als Beweis sichern.
 *
 * Macht aus einer Chatnachricht einen Eintrag für die Beweisakte. Die
 * Beweis-ID ist die Nachrichten-ID: so erkennt die Akte eine schon gesicherte
 * Nachricht wieder, und eine spätere Kombination (#13) kann im Case-JSON
 * direkt auf die Nachricht verweisen.
 *
 * Als "Fundort" steht das Gerät und der Zeitstempel — das ist für eine
 * digitale Spur, was Szene und Stelle für einen Fund im Tatort sind.
 */
export function messageToEvidence(device: Device, message: ChatMessage): CollectedEvidence {
  return {
    id: message.id,
    label: `Nachricht von ${message.sender}`,
    kind: "message",
    description: `«${message.text}»`,
    foundAt: {
      sceneName: device.label,
      hotspotLabel: `Chat · ${message.sentAt}`,
    },
  };
}
