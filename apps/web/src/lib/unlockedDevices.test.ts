import { describe, expect, it } from "vitest";
import type { Device } from "@case-zero/shared";
import { loadUnlocked, saveUnlocked, withUnlocked } from "./unlockedDevices";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const locked: Device = { id: "phone", label: "Phone", owner: "Leo", locked: true, messages: [] };
const open: Device = {
  ...locked,
  locked: false,
  messages: [{ id: "m1", sender: "Leo", sentAt: "22:18", text: "Hallo" }],
};

describe("Entsperrte Geräte merken (#70)", () => {
  it("überlebt ein Neuladen pro Team-Code", () => {
    const storage = memoryStorage();
    saveUnlocked(storage, "ABC-DEF", { phone: open });
    expect(loadUnlocked(storage, "ABC-DEF")).toEqual({ phone: open });
    expect(loadUnlocked(storage, "XYZ-XYZ")).toEqual({});
  });

  it("ignoriert kaputte Daten", () => {
    const storage = memoryStorage();
    storage.setItem("case-zero:unlocked:ABC-DEF", "{kaputt");
    expect(loadUnlocked(storage, "ABC-DEF")).toEqual({});
    storage.setItem("case-zero:unlocked:ABC-DEF", JSON.stringify({ phone: { id: "anderes" } }));
    expect(loadUnlocked(storage, "ABC-DEF")).toEqual({});
  });

  it("ersetzt nur entsperrte Geräte", () => {
    const other: Device = { ...locked, id: "laptop" };
    expect(withUnlocked([locked, other], { phone: open })).toEqual([open, other]);
  });
});
