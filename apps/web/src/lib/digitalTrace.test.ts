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
  it("übernimmt die Nachrichten-ID als Beweis-ID", () => {
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

  it("hält Gerät und Zeitstempel als Fundort fest", () => {
    expect(messageToEvidence(device, message).foundAt).toEqual({
      sceneName: "Smartphone Thomas Vogt",
      hotspotLabel: "Chat · 12.09. 20:30",
    });
  });
});
