import { describe, expect, it } from "vitest";
import type { Device } from "@case-zero/shared";
import { listDevices, toDeviceEntry } from "./forensics";

const phone: Device = {
  id: "smartphone-vogt",
  label: "Smartphone Thomas Vogt",
  owner: "Thomas Vogt",
  messages: [
    { id: "msg-1", sender: "Thomas Vogt", sentAt: "12.09. 20:30", text: "Meet me at the office." },
    { id: "msg-2", sender: "Monica Brandt", sentAt: "12.09. 21:15", text: "Ich komme." },
  ],
};

const lockedPhone: Device = {
  id: "smartphone-fischer",
  label: "Smartphone Leo Fischer",
  owner: "Leo Fischer",
  locked: true,
  lockType: "PIN, 4 Ziffern",
  messages: [],
};

const lockedLaptop: Device = {
  id: "laptop-vogt",
  label: "Laptop Thomas Vogt",
  owner: "Thomas Vogt",
  locked: true,
  messages: [],
};

describe("Forensik-Terminal", () => {
  it("macht ein offenes Geraet auswertbar und nennt die Anzahl Nachrichten", () => {
    expect(toDeviceEntry(phone)).toMatchObject({
      canOpen: true,
      status: "Entsperrt · 2 Nachrichten",
    });
  });

  it("schreibt eine einzelne Nachricht in der Einzahl", () => {
    const single = { ...phone, messages: phone.messages.slice(0, 1) };
    expect(toDeviceEntry(single).status).toBe("Entsperrt · 1 Nachricht");
  });

  it("kennzeichnet ein gesperrtes Geraet und sperrt das Auswerten", () => {
    expect(toDeviceEntry(lockedPhone)).toMatchObject({
      canOpen: false,
      status: "Gesperrt · PIN, 4 Ziffern",
    });
  });

  it("zeigt 'Gesperrt' auch ohne Angabe der Sperrart", () => {
    expect(toDeviceEntry(lockedLaptop).status).toBe("Gesperrt");
  });

  it("listet alle Geraete, auswertbare zuerst", () => {
    const ids = listDevices([lockedPhone, phone, lockedLaptop]).map((e) => e.device.id);
    expect(ids).toEqual(["smartphone-vogt", "smartphone-fischer", "laptop-vogt"]);
  });

  it("liefert fuer einen Fall ohne Geraete eine leere Liste", () => {
    expect(listDevices([])).toEqual([]);
  });
});
