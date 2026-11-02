import type { ChatMessage, CollectedEvidence, Device } from "@case-zero/shared";
import { toDeviceEntry } from "./forensics";

/** Was der Report pro Geraet buendelt (#73). */
export interface DeviceReport {
  device: Device;
  status: string;
  /** Als relevant markierte Nachrichten (#19). */
  marked: ChatMessage[];
  /** In die Akte gesicherte digitale Spuren dieses Geraets (#21). */
  secured: CollectedEvidence[];
}

export interface ForensicReport {
  devices: DeviceReport[];
  markedCount: number;
  securedCount: number;
}

/**
 * Story #73 — die digitalen Funde gebuendelt.
 *
 * Eine gesicherte Spur gehoert zu dem Geraet, dessen Name als Fundort in der
 * Akte steht — so legt `messageToEvidence` (#21) sie an. Notizen werden pro
 * Spur mitgenommen, damit der Report auch die eigene Einschaetzung zeigt.
 */
export function buildForensicReport(
  devices: Device[],
  collected: CollectedEvidence[],
  markedMessageIds: string[]
): ForensicReport {
  const marked = new Set(markedMessageIds);
  const reports = devices.map((device) => ({
    device,
    status: toDeviceEntry(device).status,
    marked: device.messages.filter((m) => marked.has(m.id)),
    secured: collected.filter((e) => e.kind === "message" && e.foundAt.sceneName === device.label),
  }));
  return {
    devices: reports,
    markedCount: reports.reduce((sum, r) => sum + r.marked.length, 0),
    securedCount: reports.reduce((sum, r) => sum + r.secured.length, 0),
  };
}

/** Der Report als Markdown, z. B. zum Ablegen oder Vorlegen im Team. */
export function forensicReportMarkdown(
  report: ForensicReport,
  caseTitle: string,
  notes: Record<string, string>,
  now: Date = new Date()
): string {
  const lines = [
    `# Forensik-Report: ${caseTitle}`,
    "",
    `Erstellt: ${now.toLocaleString("de-CH")} · ${report.devices.length} Geräte · ${report.securedCount} gesicherte Spuren · ${report.markedCount} markierte Nachrichten`,
    "",
  ];
  for (const { device, status, marked, secured } of report.devices) {
    lines.push(`## ${device.label}`, "", `- Besitzer: ${device.owner}`, `- Status: ${status}`, "");
    if (secured.length > 0) {
      lines.push("### Gesicherte Spuren", "");
      for (const e of secured) {
        lines.push(`- ${e.foundAt.hotspotLabel} · ${e.label}: ${e.description}`);
        if (notes[e.id]) lines.push(`  - Notiz: ${notes[e.id]}`);
      }
      lines.push("");
    }
    if (marked.length > 0) {
      lines.push("### Markierte Nachrichten", "");
      for (const m of marked) lines.push(`- ${m.sentAt} · ${m.sender}: «${m.text}»`);
      lines.push("");
    }
    if (secured.length === 0 && marked.length === 0) lines.push("_Keine Funde von diesem Gerät._", "");
  }
  return lines.join("\n");
}
