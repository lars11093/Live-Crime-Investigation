import { describe, expect, it } from "vitest";
import type { Device } from "@case-zero/shared";
import { buildForensicReport, forensicReportMarkdown } from "./forensicReport";
import { messageToEvidence } from "./digitalTrace";

const phone: Device = {
  id: "phone",
  label: "Smartphone Thomas Vogt",
  owner: "Thomas Vogt",
  messages: [
    { id: "m1", sender: "Monica Brandt", sentAt: "12.09. 20:31", text: "Keine Alleingaenge." },
    { id: "m2", sender: "Thomas Vogt", sentAt: "12.09. 20:30", text: "Meet me at the office." },
  ],
};
const laptop: Device = { id: "laptop", label: "Laptop", owner: "Thomas Vogt", locked: true, lockType: "Passwort", messages: [] };

describe("Forensik-Report (#73)", () => {
  it("ordnet gesicherte Spuren und markierte Nachrichten dem Geraet zu", () => {
    const secured = messageToEvidence(phone, phone.messages[0]);
    const report = buildForensicReport([phone, laptop], [secured], ["m2"]);
    expect(report.securedCount).toBe(1);
    expect(report.markedCount).toBe(1);
    expect(report.devices[0].secured.map((e) => e.id)).toEqual(["m1"]);
    expect(report.devices[0].marked.map((m) => m.id)).toEqual(["m2"]);
    expect(report.devices[1].status).toBe("Gesperrt · Passwort");
  });

  it("schreibt Spuren, Notizen und leere Geraete in den Markdown-Report", () => {
    const secured = messageToEvidence(phone, phone.messages[0]);
    const text = forensicReportMarkdown(buildForensicReport([phone, laptop], [secured], []), "Fall 1", {
      m1: "Druck auf Vogt?",
    });
    expect(text).toContain("## Smartphone Thomas Vogt");
    expect(text).toContain("Chat · 12.09. 20:31 · Nachricht von Monica Brandt");
    expect(text).toContain("  - Notiz: Druck auf Vogt?");
    expect(text).toContain("_Keine Funde von diesem Gerät._");
  });
});
