import type { ChatMessage, CollectedEvidence, Device } from "@case-zero/shared";
import { metadataSummary } from "./imageMetadata";

/**
 * Story #21 — eine digitale Spur als Beweis sichern.
 *
 * Macht aus einer Chatnachricht einen Eintrag fuer die Beweisakte. Die
 * Beweis-ID ist die Nachrichten-ID: so erkennt die Akte eine schon gesicherte
 * Nachricht wieder, und eine spaetere Kombination (#13) kann im Case-JSON
 * direkt auf die Nachricht verweisen.
 *
 * Als "Fundort" steht das Geraet und der Zeitstempel — das ist fuer eine
 * digitale Spur, was Szene und Stelle fuer einen Fund im Tatort sind.
 */
export function messageToEvidence(
  device: Device,
  message: ChatMessage,
  /** Wurden die Metadaten des Anhangs ausgelesen (#45)? Dann kommen sie mit in die Akte. */
  metadataRead = false
): CollectedEvidence {
  const attachment = message.attachment
    ? metadataRead
      ? ` Anhang ${message.attachment.fileName}: ${metadataSummary(message.attachment.metadata)}.`
      : ` Anhang: ${message.attachment.fileName}.`
    : "";
  return {
    id: message.id,
    label: `Nachricht von ${message.sender}`,
    kind: "message",
    description: `«${message.text}»${attachment}`,
    foundAt: {
      sceneName: device.label,
      hotspotLabel: `Chat · ${message.sentAt}`,
    },
  };
}
