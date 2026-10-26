import { describe, expect, it } from "vitest";
import type { Device } from "@case-zero/shared";
import { messageToEvidence } from "./digitalTrace";

const device: Device = {
  id: "smartphone-vogt",
  label: "Smartphone Thomas Vogt",
  owner: "Thomas Vogt",
  messages: [
    {
      id: "msg-vogt-05",
      sender: "Thomas Vogt",
      sentAt: "12.09. 20:30",
      text: "Meet me at the office. 22:30.",
    },
  ],
};
const message = device.messages[0];

describe("Chatnachricht als Beweis", () => {
  it("uebernimmt die Nachrichten-ID als Beweis-ID", () => {
    expect(messageToEvidence(device, message).id).toBe("msg-vogt-05");
  });

  it("ist ein Beweis der Art Nachricht", () => {
    expect(messageToEvidence(device, message).kind).toBe("message");
  });

  it("nennt Absender und Text", () => {
    const evidence = messageToEvidence(device, message);
    expect(evidence.label).toContain("Thomas Vogt");
    expect(evidence.description).toContain("Meet me at the office. 22:30.");
  });

  it("haelt Geraet und Zeitstempel als Fundort fest", () => {
    expect(messageToEvidence(device, message).foundAt).toEqual({
      sceneName: "Smartphone Thomas Vogt",
      hotspotLabel: "Chat · 12.09. 20:30",
    });
  });
});

describe("Anhang mit Metadaten in der Akte (#45)", () => {
  const device = { id: "d", label: "Smartphone Thomas Vogt", owner: "Thomas Vogt", messages: [] };
  const message = {
    id: "m",
    sender: "Leo Fischer",
    sentAt: "12.09. 20:47",
    text: "Soll ich vorbeikommen?",
    attachment: {
      fileName: "PXL_1.jpg",
      metadata: { takenAt: "12.09. 20:44", camera: "Google Pixel 7" },
    },
  };

  it("nennt den Anhang, solange die Metadaten nicht ausgelesen sind", () => {
    expect(messageToEvidence(device, message).description).toBe(
      "«Soll ich vorbeikommen?» Anhang: PXL_1.jpg."
    );
  });

  it("nimmt ausgelesene Metadaten mit", () => {
    expect(messageToEvidence(device, message, true).description).toBe(
      "«Soll ich vorbeikommen?» Anhang PXL_1.jpg: aufgenommen 12.09. 20:44 · Google Pixel 7."
    );
  });
});

describe("Herkunft einer digitalen Spur (#47)", () => {
  it("markiert gesicherte Nachrichten als vom Geraet", () => {
    const device = { id: "d", label: "Smartphone", owner: "A", messages: [] };
    const message = { id: "m", sender: "B", sentAt: "12.09. 21:15", text: "Hallo" };
    expect(messageToEvidence(device, message).source).toBe("device");
  });
});
