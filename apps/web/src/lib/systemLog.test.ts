import { describe, expect, it } from "vitest";
import type { SystemLogEntry } from "@case-zero/shared";
import { analyzeLog, clockOf, usageSpan } from "./systemLog";

const log: SystemLogEntry[] = [
  { at: "12.09. 20:30", category: "app", event: "Nachrichten geoeffnet" },
  { at: "12.09. 22:02", category: "network", event: "Nachricht empfangen" },
  { at: "12.09. 22:31", category: "unlock", event: "Bildschirm entsperrt (PIN)" },
  { at: "12.09. 22:36", category: "call", event: "Anruf abgelehnt" },
  { at: "12.09. 22:47", category: "power", event: "Bildschirm automatisch gesperrt" },
];
const window = { from: "22:30", to: "22:50" };

describe("Systemprotokolle analysieren (#46)", () => {
  it("liest die Uhrzeit aus dem Zeitstempel", () => {
    expect(clockOf("12.09. 22:31")).toBe("22:31");
    expect(clockOf("gestern")).toBeNull();
  });

  it("markiert, was in die Tatzeit faellt", () => {
    expect(analyzeLog(log, window).map((e) => e.inWindow)).toEqual([false, false, true, true, true]);
  });

  it("filtert nach Kategorie und behaelt die Reihenfolge", () => {
    expect(analyzeLog(log, window, ["unlock", "app"]).map((e) => e.at)).toEqual([
      "12.09. 20:30",
      "12.09. 22:31",
    ]);
  });

  it("markiert ohne Tatzeitfenster nichts", () => {
    expect(analyzeLog(log, undefined).some((e) => e.inWindow)).toBe(false);
  });

  it("nennt die Zeitspanne aktiver Benutzung", () => {
    expect(usageSpan(log)).toEqual({ first: "12.09. 20:30", last: "12.09. 22:31" });
    expect(usageSpan([log[1]])).toBeNull();
  });
});
