import { describe, expect, it } from "vitest";
import type { Device } from "@case-zero/shared";
import { deviceSummary, listDevices, markReviewed, toDeviceEntry } from "./forensics";

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

describe("Geraete auflisten (#44)", () => {
  const phone: Device = {
    id: "phone",
    label: "Smartphone A",
    owner: "A",
    kind: "smartphone",
    seizedAt: "Buero",
    messages: [],
  };
  const laptop: Device = { id: "laptop", label: "Laptop B", owner: "B", messages: [] };
  const locked: Device = { id: "locked", label: "Handy C", owner: "C", locked: true, messages: [] };

  it("nennt die Geraeteart, ohne Angabe 'Geraet'", () => {
    expect(toDeviceEntry(phone).kindLabel).toBe("Smartphone");
    expect(toDeviceEntry(laptop).kindLabel).toBe("Geraet");
  });

  it("zeigt Unausgewertetes zuerst, dann Ausgewertetes, dann Gesperrtes", () => {
    const order = listDevices([locked, phone, laptop], ["phone"]).map((e) => e.device.id);
    expect(order).toEqual(["laptop", "phone", "locked"]);
  });

  it("fasst zusammen, was vorliegt", () => {
    expect(deviceSummary(listDevices([locked, phone, laptop], ["phone"]))).toBe(
      "2 auswertbar · 1 noch nicht ausgewertet · 1 gesperrt"
    );
    expect(deviceSummary(listDevices([phone], ["phone"]))).toBe(
      "1 auswertbar · alle ausgewertet · 0 gesperrt"
    );
  });

  it("merkt sich ein ausgewertetes Geraet nur einmal", () => {
    expect(markReviewed(markReviewed([], "phone"), "phone")).toEqual(["phone"]);
  });
});
