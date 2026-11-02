import { describe, expect, it } from "vitest";
import type { Device } from "@case-zero/shared";
import { loadRecovered, saveRecovered, withRecovered } from "./recoveredMessages";

const device: Device = {
  id: "phone",
  label: "Phone",
  owner: "Thomas Vogt",
  deletedCount: 1,
  messages: [
    { id: "a", sender: "A", sentAt: "12.09. 20:30", text: "eins" },
    { id: "c", sender: "C", sentAt: "12.09. 22:41", text: "drei" },
  ],
};

describe("Wiederhergestellte Nachrichten (#71)", () => {
  it("fuegt sie chronologisch in den Verlauf ein und setzt die Anzahl zurueck", () => {
    const merged = withRecovered(device, {
      phone: [{ id: "b", sender: "B", sentAt: "12.09. 22:25", text: "zwei", recovered: true }],
    });
    expect(merged.messages.map((m) => m.id)).toEqual(["a", "b", "c"]);
    expect(merged.deletedCount).toBe(0);
  });

  it("aendert nichts ohne Wiederhergestelltes und doppelt nichts", () => {
    expect(withRecovered(device, {})).toBe(device);
    const merged = withRecovered(device, { phone: [device.messages[0]] });
    expect(merged.messages).toHaveLength(2);
  });

  it("merkt sich die Nachrichten pro Team-Code", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    const recovered = { phone: [device.messages[0]] };
    saveRecovered(storage, "ABC-DEF", recovered);
    expect(loadRecovered(storage, "ABC-DEF")).toEqual(recovered);
    data.set("case-zero:recovered:ABC-DEF", "[]");
    expect(loadRecovered(storage, "ABC-DEF")).toEqual({});
  });
});
